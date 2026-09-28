/**
 * Keeps credentials out of anything that can be read later.
 *
 * Guide §3.3: "Never write tokens, secret keys, cookies, OTPs, request
 * bodies, or query strings to application logs." Guide §6.3 extends that to
 * analytics, screenshots, deep links and crash metadata. Query strings matter
 * more here than in most apps, because this API puts the account token in the
 * URL (`?collect=auth&token=…`).
 */

const SENSITIVE_KEYS = [
  'token',
  'accounttoken',
  'account_token',
  'secretkey',
  'secret_key',
  'bearer',
  'authorization',
  'cookie',
  'setcookie',
  'set-cookie',
  'password',
  'pass',
  'otp',
  'footprint',
  'fingerprint',
  'x-portal-token',
]

function isSensitive(key: string): boolean {
  const normalized = key.toLowerCase()
  return SENSITIVE_KEYS.some((needle) => normalized.includes(needle))
}

const PLACEHOLDER = '[redacted]'

/**
 * Strips the query string entirely rather than filtering it. The parameter
 * names here are inconsistent across collections, so an allowlist would leak
 * the first time someone added a route.
 */
export function redactUrl(url: string): string {
  const cut = url.indexOf('?')
  if (cut === -1) return url
  return `${url.slice(0, cut)}?${PLACEHOLDER}`
}

/** Replaces sensitive values anywhere in a plain object, however deep. */
export function redact(value: unknown, depth = 0): unknown {
  if (depth > 6) return PLACEHOLDER
  if (Array.isArray(value)) return value.map((entry) => redact(entry, depth + 1))
  if (value === null || typeof value !== 'object') return value

  const output: Record<string, unknown> = {}
  for (const [key, entry] of Object.entries(value)) {
    output[key] = isSensitive(key) ? PLACEHOLDER : redact(entry, depth + 1)
  }
  return output
}

/**
 * The only logging path the backend module uses.
 *
 * Request and response bodies are never passed here — guide §3.3 rules them
 * out wholesale, and a trading payload is personal data even when it holds no
 * token. Callers pass an endpoint key and a status, nothing else.
 */
export function logBackendEvent(event: string, detail: Record<string, string | number> = {}) {
  if (!__DEV__) return
  console.log(`[wavex] ${event}`, redact(detail))
}
