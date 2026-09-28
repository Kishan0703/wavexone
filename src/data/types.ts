import type { AssetIconKind } from '../design-system'

/**
 * Presentation-layer shapes.
 *
 * These mirror the capabilities described in WAVEXONE_BACKEND_INTEGRATION_GUIDE.md
 * (`markets.catalogue`, `orders.list`, `funds.history`, …) but nothing here talks
 * to a network — the UI is wired to fixtures so the screens can be reviewed
 * before the `WaveXBackend` module exists.
 */

export type Instrument = {
  id: string
  /** "XAU/USD" */
  symbol: string
  /** "Gold" — the short form shown on Market Watch rows. */
  name: string
  /** "Gold / US Dollar" — the long form shown on detail and signal cards. */
  description: string
  icon: AssetIconKind
  /** Letters for the fallback disc. */
  iconLabel?: string
  iconTint?: string
  price: number
  /** Digits after the decimal point for this instrument. */
  precision: 2 | 4
  changePercent: number
  bid: number
  ask: number
  /** Series driving the row sparkline. */
  spark: readonly number[]
  /** Mockup quirk: EUR/USD is up on the day but its sparkline is drawn red. */
  sparkTone?: 'positive' | 'negative'
  category: 'Metals' | 'Forex' | 'Crypto' | 'Energy'
  favorite: boolean
}

export type Position = {
  id: string
  instrumentId: string
  side: 'Buy' | 'Sell'
  lots: number
  entry: number
  current: number
  pnl: number
  state: 'Open' | 'Pending' | 'Closed'
}

export type ActivityEntry = {
  id: string
  kind: 'trade' | 'deposit' | 'withdrawal'
  /** Instrument id for trades; undefined for funding entries. */
  instrumentId?: string
  title: string
  subtitle: string
  date: string
  time: string
  amount: number
  group: 'Today' | 'Yesterday' | 'Earlier'
  tab: 'Trades' | 'Funds' | 'Orders'
}

export type Signal = {
  id: string
  instrumentId: string
  headline: string
  date: string
  source: string
}

export type Account = {
  holder: string
  avatarUrl: string
  /** "LIVE" or "DEMO". */
  mode: string
  number: string
  verified: boolean
  equity: number
  changePercent: number
  /** Human date printed on the portfolio band. */
  asOf: string
  floatingPnl: number
  openPositions: number
  monthNetResult: number
  monthTrades: number
  monthWinRate: number
}
