import { logBackendEvent, redact, redactUrl } from '../../src/backend/redact'

/**
 * Guide §3.3 and §6.3. This API puts the account token in the query string,
 * so "do not log URLs" is a real constraint here rather than a formality —
 * these tests are what stop a convenience log from leaking a session.
 */

describe('redactUrl', () => {
  it('strips the whole query string, token and all', () => {
    expect(redactUrl('https://x.example/api-v1/v1.php?collect=auth&token=SECRET')).toBe(
      'https://x.example/api-v1/v1.php?[redacted]',
    )
  })

  it('leaves a URL with no query alone', () => {
    expect(redactUrl('https://x.example/apiBootstrap')).toBe('https://x.example/apiBootstrap')
  })

  it('never leaves a token behind for any known credential parameter', () => {
    for (const name of ['token', 'secretkey', 'footprint', 'otp', 'password']) {
      expect(redactUrl(`https://x.example/p?${name}=LEAK`)).not.toContain('LEAK')
    }
  })
})

describe('redact', () => {
  it.each([
    'token',
    'accountToken',
    'account_token',
    'secretkey',
    'secretKey',
    'Bearer',
    'Authorization',
    'Cookie',
    'set-cookie',
    'password',
    'otp',
    'footprint',
    'fingerprint',
    'X-Portal-Token',
  ])('redacts the %s field', (key) => {
    expect(redact({ [key]: 'LEAK' })).toEqual({ [key]: '[redacted]' })
  })

  it('matches sensitive names case-insensitively and as substrings', () => {
    expect(redact({ userPasswordHash: 'LEAK', SECRETKEY: 'LEAK' })).toEqual({
      userPasswordHash: '[redacted]',
      SECRETKEY: '[redacted]',
    })
  })

  it('keeps values that are not credentials', () => {
    expect(redact({ endpoint: 'ordersCount', status: 200 })).toEqual({
      endpoint: 'ordersCount',
      status: 200,
    })
  })

  it('reaches credentials nested inside objects and arrays', () => {
    expect(redact({ session: [{ bearer: 'LEAK' }], meta: { inner: { otp: 'LEAK' } } })).toEqual({
      session: [{ bearer: '[redacted]' }],
      meta: { inner: { otp: '[redacted]' } },
    })
  })

  it('stops descending rather than recursing forever on a cycle', () => {
    const cyclic: Record<string, unknown> = { name: 'a' }
    cyclic.self = cyclic
    expect(() => redact(cyclic)).not.toThrow()
    expect(JSON.stringify(redact(cyclic))).toContain('[redacted]')
  })

  it('passes scalars and null through untouched', () => {
    expect(redact(null)).toBeNull()
    expect(redact(7)).toBe(7)
    expect(redact('plain')).toBe('plain')
  })
})

describe('logBackendEvent', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {})

  afterEach(() => spy.mockClear())

  it('writes nothing in a production build', () => {
    // __DEV__ is false in tests (jest.setup.js), which is the release case.
    logBackendEvent('request.complete', { endpoint: 'auth', status: 200 })
    expect(spy).not.toHaveBeenCalled()
  })

  it('redacts the detail it is given when diagnostics are on', () => {
    const original = global.__DEV__
    global.__DEV__ = true
    try {
      logBackendEvent('request.complete', { endpoint: 'auth', token: 'LEAK' })
      expect(JSON.stringify(spy.mock.calls)).not.toContain('LEAK')
    } finally {
      global.__DEV__ = original
    }
  })
})
