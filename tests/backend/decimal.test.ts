import { add, compare, decimal, isNegative, multiply, subtract, toFixed, tryDecimal } from '../../src/backend/decimal'

describe('decimal', () => {
  it('holds values a float cannot', () => {
    // The canonical float failure: 0.1 + 0.2 === 0.30000000000000004.
    expect(toFixed(add(decimal('0.1'), decimal('0.2')), 2)).toBe('0.30')
  })

  it('keeps precision through a lot-size calculation', () => {
    // 0.07 lots of a 100-unit contract at 2387.42 — the kind of multiplication
    // that drifts once it goes through a float.
    const notional = multiply(multiply(decimal('0.07'), decimal('100')), decimal('2387.42'))
    expect(toFixed(notional, 2)).toBe('16711.94')
  })

  it('parses and preserves trailing zeros as scale', () => {
    expect(decimal('2387.4200')).toEqual({ units: 23874200n, scale: 4 })
  })

  it('handles values beyond Number.MAX_SAFE_INTEGER', () => {
    const huge = decimal('9007199254740993.01')
    expect(toFixed(add(huge, decimal('0.01')), 2)).toBe('9007199254740993.02')
  })

  describe('signs', () => {
    it('subtracts across zero', () => {
      const loss = subtract(decimal('100.00'), decimal('250.50'))
      expect(toFixed(loss, 2)).toBe('-150.50')
      expect(isNegative(loss)).toBe(true)
    })

    it('rounds negatives away from zero, not toward it', () => {
      // Toward-zero rounding would report -1.23 and quietly flatter a loss.
      expect(toFixed(decimal('-1.235'), 2)).toBe('-1.24')
    })
  })

  describe('rounding', () => {
    it('rounds half away from zero', () => {
      expect(toFixed(decimal('2.345'), 2)).toBe('2.35')
      expect(toFixed(decimal('2.344'), 2)).toBe('2.34')
    })

    it('pads when asked for more places than it carries', () => {
      expect(toFixed(decimal('1.5'), 4)).toBe('1.5000')
    })

    it('renders values below one with a leading zero', () => {
      expect(toFixed(decimal('0.07'), 2)).toBe('0.07')
    })
  })

  describe('compare', () => {
    it('compares across different scales', () => {
      expect(compare(decimal('1.10'), decimal('1.1'))).toBe(0)
      expect(compare(decimal('1.10'), decimal('1.2'))).toBe(-1)
      expect(compare(decimal('1.30'), decimal('1.2'))).toBe(1)
    })
  })

  describe('tryDecimal', () => {
    it('rejects anything that is not a decimal', () => {
      expect(tryDecimal('1.2.3')).toBeUndefined()
      expect(tryDecimal('')).toBeUndefined()
      expect(tryDecimal('abc')).toBeUndefined()
      expect(tryDecimal(null)).toBeUndefined()
      expect(tryDecimal(Number.NaN)).toBeUndefined()
    })

    it('accepts a JSON number, since the API sends them', () => {
      expect(toFixed(tryDecimal(2387.42)!, 2)).toBe('2387.42')
    })
  })

  it('throws on a malformed string rather than guessing', () => {
    expect(() => decimal('1,000.00')).toThrow(TypeError)
  })
})
