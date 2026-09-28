import { DENIED_ENDPOINTS, ENDPOINTS, type EndpointKey, type Phase } from './endpoints'
import { BackendError } from './errors'
import { assertHttps, buildUrl, send, unwrapEnvelope, type HttpResponse } from './http'
import { logBackendEvent } from './redact'

/**
 * Policy in front of the transport.
 *
 * Every rule in guide §6 that the client is responsible for is enforced
 * here, once, instead of being remembered at each call site.
 */

export type BackendConfig = {
  /** Host serving `/api-v1/v1.php`. */
  tradingBaseUrl: string
  /** Client Portal host. */
  portalBaseUrl: string
  /** `charting_base_url` from the chart configuration (guide §4.4). */
  chartingBaseUrl: string
  /** Approved `Origin` for portal calls (guide §3.2 step 2). */
  portalOrigin: string
  /** Guide §8. Read-only until the backend team authorizes more. */
  phase: Phase
  /**
   * Allows mutations whose HTTP method we inferred rather than confirmed.
   * Stays false until guide §7.6 (request/response examples) is answered.
   */
  allowUnconfirmedMutations: boolean
  timeoutMs: number
}

export const DEFAULT_TIMEOUT_MS = 20_000

/**
 * How long a completed mutation is remembered. Long enough to swallow a
 * double tap and an impatient second attempt, short enough that a genuine
 * second order a minute later goes through.
 */
const MUTATION_MEMORY_MS = 30_000

type CallOptions = {
  query?: Record<string, string>
  form?: Record<string, string>
  headers?: Record<string, string>
  /**
   * Required for mutations. Identifies one user intent, so a repeat of the
   * same intent is recognised instead of executed twice.
   */
  idempotencyKey?: string
}

type Remembered = { at: number; promise: Promise<HttpResponse> }

export class Gate {
  private readonly inFlight = new Map<string, Remembered>()

  constructor(private readonly config: BackendConfig) {
    assertHttps(config.tradingBaseUrl, 'tradingBaseUrl')
    assertHttps(config.portalBaseUrl, 'portalBaseUrl')
    assertHttps(config.chartingBaseUrl, 'chartingBaseUrl')
  }

  /**
   * Guide §6.7 / §9. Exposed so an adapter cannot construct a denied route by
   * string concatenation and slip past the registry.
   */
  static assertAllowed(name: string): void {
    const reason = DENIED_ENDPOINTS[name]
    if (reason) throw new BackendError('blocked', reason, { endpoint: name })
  }

  async call(key: EndpointKey, options: CallOptions = {}): Promise<HttpResponse> {
    const spec = ENDPOINTS[key]
    Gate.assertAllowed(spec.name)

    if (spec.phase > this.config.phase) {
      throw new BackendError(
        'blocked',
        `"${key}" belongs to delivery phase ${spec.phase}; this build runs phase ${this.config.phase} (guide §8).`,
        { endpoint: key },
      )
    }

    if (spec.mutation) return this.callMutation(key, options)
    return this.perform(key, options)
  }

  private async callMutation(key: EndpointKey, options: CallOptions): Promise<HttpResponse> {
    const spec = ENDPOINTS[key]

    if (spec.unconfirmedMethod && !this.config.allowUnconfirmedMutations) {
      throw new BackendError(
        'blocked',
        `"${key}" is a mutation whose HTTP method is inferred, not documented. ` +
          'Confirm it against the collection (guide §7.6) before enabling it.',
        { endpoint: key },
      )
    }

    if (!options.idempotencyKey) {
      throw new BackendError(
        'blocked',
        `"${key}" changes server state and needs an idempotency key so a repeat is not executed twice (guide §6.4).`,
        { endpoint: key },
      )
    }

    const memoryKey = `${key}:${options.idempotencyKey}`
    this.forgetExpired()

    const remembered = this.inFlight.get(memoryKey)
    if (remembered) {
      // Guide §9: "mutations pass staging tests without duplicate execution."
      // Returning the original promise means a double tap waits for the first
      // result rather than placing a second order.
      logBackendEvent('mutation.deduplicated', { endpoint: key })
      return remembered.promise
    }

    // The memo holds the *translated* outcome, not the raw one. Storing the
    // raw promise would hand a later caller a `network` error — which reads
    // as retryable, which is the one conclusion it must not reach.
    const promise = this.perform(key, options).catch((error: unknown) => {
      // A mutation that failed in transit is the dangerous case: the server
      // may or may not have acted. Guide §4.5 forbids replaying it, so the
      // memo is kept and the user is told to check before trying again.
      if (error instanceof BackendError && error.retryable) {
        throw new BackendError(
          'blocked',
          'We could not confirm whether that went through. Check your positions before trying again.',
          { endpoint: key, cause: error },
        )
      }
      // A clean rejection means the server definitely did not act, so the
      // user may legitimately correct their input and resubmit.
      this.inFlight.delete(memoryKey)
      throw error
    })

    this.inFlight.set(memoryKey, { at: Date.now(), promise })
    return promise
  }

  private perform(key: EndpointKey, options: CallOptions): Promise<HttpResponse> {
    const spec = ENDPOINTS[key]
    const base = this.baseUrlFor(key)

    const url =
      spec.transport === 'trading'
        ? buildUrl(base, { collect: spec.name, ...options.query })
        : buildUrl(`${base}/${spec.name}`, options.query ?? {})

    return send({
      url,
      method: spec.method,
      headers: {
        ...(spec.transport === 'portal' ? { Origin: this.config.portalOrigin } : null),
        ...options.headers,
      },
      form: options.form,
      endpoint: key,
      timeoutMs: this.config.timeoutMs,
      withCredentials: spec.transport === 'portal',
    })
  }

  private baseUrlFor(key: EndpointKey): string {
    switch (ENDPOINTS[key].transport) {
      case 'trading':
        return `${this.config.tradingBaseUrl}/api-v1/v1.php`
      case 'portal':
        return this.config.portalBaseUrl
      case 'charting':
        return this.config.chartingBaseUrl
    }
  }

  private forgetExpired() {
    const cutoff = Date.now() - MUTATION_MEMORY_MS
    for (const [key, entry] of this.inFlight) {
      if (entry.at < cutoff) this.inFlight.delete(key)
    }
  }

  /** Convenience: call, then validate the envelope (guide §5). */
  async callJson(key: EndpointKey, options: CallOptions = {}): Promise<unknown> {
    const response = await this.call(key, options)
    return unwrapEnvelope(response, key)
  }
}
