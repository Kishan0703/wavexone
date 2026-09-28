/**
 * Decimal-safe money and prices.
 *
 * Guide §5: "do not use binary floating-point for order calculations." A
 * JS `number` cannot hold 0.1 + 0.2, and a trading app multiplies lot sizes
 * by contract sizes by prices — the error compounds. Values are stored as a
 * scaled `bigint`, so arithmetic is exact and nothing is ever rounded until
 * something is displayed.
 */

export type Decimal = {
  /** The value multiplied by 10^scale. */
  readonly units: bigint
  /** Number of decimal places carried. */
  readonly scale: number
}

const TEN = 10n

function pow10(exponent: number): bigint {
  return TEN ** BigInt(exponent)
}

/** Restates both values at the finer of the two scales so they can be combined. */
function align(a: Decimal, b: Decimal): { a: bigint; b: bigint; scale: number } {
  if (a.scale === b.scale) return { a: a.units, b: b.units, scale: a.scale }
  const scale = Math.max(a.scale, b.scale)
  return {
    a: a.units * pow10(scale - a.scale),
    b: b.units * pow10(scale - b.scale),
    scale,
  }
}

/**
 * Parses the decimal string the API sends. Strings are the only safe wire
 * format; if the backend sends a JSON number the precision is already gone
 * before we see it.
 */
export function decimal(value: string): Decimal {
  const text = value.trim()
  const match = /^(-)?(\d+)(?:\.(\d+))?$/.exec(text)
  if (!match) throw new TypeError(`Not a decimal: ${JSON.stringify(value)}`)

  const [, sign, whole, fraction = ''] = match
  const units = BigInt(`${sign ?? ''}${whole}${fraction}`)
  return { units, scale: fraction.length }
}

/** Parses leniently, returning `undefined` rather than throwing. */
export function tryDecimal(value: unknown): Decimal | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return decimal(String(value))
  if (typeof value !== 'string') return undefined
  try {
    return decimal(value)
  } catch {
    return undefined
  }
}

export const ZERO: Decimal = { units: 0n, scale: 0 }

export function add(a: Decimal, b: Decimal): Decimal {
  const { a: left, b: right, scale } = align(a, b)
  return { units: left + right, scale }
}

export function subtract(a: Decimal, b: Decimal): Decimal {
  const { a: left, b: right, scale } = align(a, b)
  return { units: left - right, scale }
}

/** Exact: the scales add, so no rounding decision is made here. */
export function multiply(a: Decimal, b: Decimal): Decimal {
  return { units: a.units * b.units, scale: a.scale + b.scale }
}

export function negate(value: Decimal): Decimal {
  return { units: -value.units, scale: value.scale }
}

/** −1, 0 or 1. */
export function compare(a: Decimal, b: Decimal): -1 | 0 | 1 {
  const { a: left, b: right } = align(a, b)
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

export function isNegative(value: Decimal): boolean {
  return value.units < 0n
}

export function isZero(value: Decimal): boolean {
  return value.units === 0n
}

/** Renders at a fixed number of places, rounding half away from zero. */
export function toFixed(value: Decimal, places: number): string {
  const rescaled = rescale(value, places)
  const negative = rescaled.units < 0n
  const digits = (negative ? -rescaled.units : rescaled.units).toString().padStart(places + 1, '0')

  const whole = digits.slice(0, digits.length - places)
  const fraction = places > 0 ? `.${digits.slice(digits.length - places)}` : ''
  return `${negative ? '-' : ''}${whole}${fraction}`
}

function rescale(value: Decimal, places: number): Decimal {
  if (places === value.scale) return value
  if (places > value.scale) {
    return { units: value.units * pow10(places - value.scale), scale: places }
  }

  const divisor = pow10(value.scale - places)
  const negative = value.units < 0n
  const magnitude = negative ? -value.units : value.units

  // Half away from zero: the convention every trading venue quotes in, and
  // the one that does not quietly bias P&L toward the house.
  const quotient = magnitude / divisor
  const remainder = magnitude % divisor
  const rounded = remainder * 2n >= divisor ? quotient + 1n : quotient

  return { units: negative ? -rounded : rounded, scale: places }
}

/**
 * Lossy on purpose, and named so you notice. Only for handing a value to a
 * chart or a layout calculation — never for anything that becomes an order.
 */
export function toNumberForDisplay(value: Decimal): number {
  return Number(toFixed(value, value.scale))
}
