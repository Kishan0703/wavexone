import { BackendError } from './errors'
import { logBackendEvent } from './redact'

/**
 * The one `fetch` in the application.
 *
 * Everything policy-shaped lives a layer up in `gate.ts`; this file only
 * handles transport: TLS, timeouts, and turning four different failure
 * shapes into one `BackendError`.
 */

export type HttpRequest = {
  url: string
  method: 'GET' | 'POST'
  headers?: Record<string, string>
  /** Form-encoded body. The API does not accept JSON request bodies. */
  form?: Record<string, string>
  /** Endpoint key, for logging. Never a URL — URLs carry tokens. */
  endpoint: string
  timeoutMs: number
  /** Portal calls need the session cookie; trading calls do not. */
  withCredentials?: boolean
}

export type HttpResponse = {
  status: number
  /** Parsed JSON, or `undefined` when the body was not JSON. */
  json?: unknown
  /** Raw body. `collect=bearer` returns a bare token, not a document. */
  text: string
}

/**
 * Guide §6.9: "Use certificate-valid HTTPS only; never bypass TLS
 * verification." There is no way to weaken TLS from JS, so the check that
 * matters is refusing a plaintext base URL — which is how it would actually
 * go wrong, via a misconfigured staging host.
 */
export function assertHttps(url: string, what: string): void {
  if (!url.startsWith('https://')) {
    throw new BackendError('blocked', `${what} must be an https:// URL (guide §6.9).`)
  }
}

export async function send(request: HttpRequest): Promise<HttpResponse> {
  assertHttps(request.url, 'Request URL')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), request.timeoutMs)

  let response: Response
  try {
    response = await fetch(request.url, {
      method: request.method,
      headers: {
        Accept: 'application/json, text/plain',
        ...(request.form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : null),
        ...request.headers,
      },
      body: request.form ? encodeForm(request.form) : undefined,
      // Guide §3.2 step 3: the portal session is cookie-backed. On iOS and
      // Android the platform keeps the jar; on web the browser does, but only
      // if the request opts in.
      credentials: request.withCredentials ? 'include' : 'omit',
      signal: controller.signal,
    })
  } catch (cause) {
    clearTimeout(timer)
    const aborted = controller.signal.aborted
    logBackendEvent(aborted ? 'request.timeout' : 'request.network-error', {
      endpoint: request.endpoint,
    })
    throw new BackendError(
      aborted ? 'timeout' : 'network',
      aborted ? 'The request timed out.' : 'The request could not be sent.',
      { endpoint: request.endpoint, cause },
    )
  }
  clearTimeout(timer)

  const text = await response.text()
  logBackendEvent('request.complete', { endpoint: request.endpoint, status: response.status })

  if (response.status === 429) {
    throw new BackendError('throttled', 'Rate limited.', {
      endpoint: request.endpoint,
      status: response.status,
    })
  }

  if (response.status === 401 || response.status === 403) {
    throw new BackendError('auth', 'Not authenticated.', {
      endpoint: request.endpoint,
      status: response.status,
    })
  }

  if (response.status >= 500) {
    throw new BackendError('server', 'The service returned an error.', {
      endpoint: request.endpoint,
      status: response.status,
    })
  }

  if (response.status >= 400) {
    throw new BackendError('rejected', 'The request was declined.', {
      endpoint: request.endpoint,
      status: response.status,
      serverMessage: firstLine(text),
    })
  }

  return { status: response.status, json: tryParseJson(text), text }
}

function encodeForm(form: Record<string, string>): string {
  return Object.entries(form)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
}

function tryParseJson(text: string): unknown {
  const trimmed = text.trim()
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return undefined
  try {
    return JSON.parse(trimmed)
  } catch {
    return undefined
  }
}

/** Server text is for diagnostics only, so one short line is enough. */
function firstLine(text: string): string | undefined {
  const line = text.trim().split('\n', 1)[0]
  return line ? line.slice(0, 200) : undefined
}

/**
 * Guide §5: an HTTP 200 from this API can still be a failure, signalled by
 * `status: success|fail|error` inside the envelope. Callers run every decoded
 * body through here before trusting it.
 */
export function unwrapEnvelope(response: HttpResponse, endpoint: string): unknown {
  const body = response.json
  if (body === undefined) {
    throw new BackendError('malformed', 'The service returned a non-JSON body.', {
      endpoint,
      status: response.status,
    })
  }

  if (typeof body !== 'object' || body === null) return body

  const envelope = body as Record<string, unknown>
  const status = typeof envelope.status === 'string' ? envelope.status.toLowerCase() : undefined
  if (status === 'fail' || status === 'error') {
    const message = typeof envelope.message === 'string' ? envelope.message : undefined
    throw new BackendError('rejected', 'The request was declined.', {
      endpoint,
      status: response.status,
      serverMessage: message,
    })
  }

  return 'data' in envelope ? envelope.data : envelope
}

/**
 * URL builder that keeps `?collect=` construction in one place.
 *
 * Deliberately does not log what it builds. This API puts the account token
 * in the query string, so a per-request URL log is the exact habit guide §3.3
 * rules out — `redactUrl` exists for the one place a URL must be shown to a
 * human, not as a licence to log them all.
 */
export function buildUrl(base: string, query: Record<string, string>): string {
  const params = Object.entries(query)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
  return params ? `${base}?${params}` : base
}
