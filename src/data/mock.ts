import type { Account, ActivityEntry, Instrument, Position, Signal } from './types'

/**
 * Fixtures. Values, names and dates are taken from the design mockups so the
 * screens render exactly what was specified.
 *
 * Replace this module with the `WaveXBackend` client described in
 * WAVEXONE_BACKEND_INTEGRATION_GUIDE.md §5 when the API work starts; the
 * screens only consume the types in `./types`.
 */

export const account: Account = {
  holder: 'Jonathan Reed',
  // Remote portrait stands in for the avatar returned by `getuser`.
  // Requested at 2x the 96pt display size.
  avatarUrl:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2.6&w=200&h=200&q=80',
  mode: 'LIVE',
  number: 'WX012345',
  verified: true,
  equity: 24860.4,
  changePercent: 4.31,
  asOf: 'December 21, 2022',
  floatingPnl: 182.7,
  openPositions: 2,
  monthNetResult: 1284.6,
  monthTrades: 48,
  monthWinRate: 62,
}

export const instruments: readonly Instrument[] = [
  {
    id: 'xauusd',
    symbol: 'XAU/USD',
    name: 'Gold',
    description: 'Gold / US Dollar',
    icon: 'gold',
    price: 2387.42,
    precision: 2,
    changePercent: 0.34,
    bid: 2387.12,
    ask: 2387.72,
    spark: [12, 10, 16, 14, 22, 19, 27, 24, 30, 26, 33, 31, 38, 35, 42, 46],
    category: 'Metals',
    favorite: true,
  },
  {
    id: 'eurusd',
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    description: 'Euro / US Dollar',
    icon: 'euro',
    price: 1.0842,
    precision: 4,
    changePercent: 0.18,
    bid: 1.084,
    ask: 1.0844,
    spark: [44, 30, 38, 26, 31, 24, 29, 18, 24, 14, 20, 10, 16, 12, 9, 6],
    // The mockup draws this row's line red even though the day is positive.
    sparkTone: 'negative',
    category: 'Forex',
    favorite: true,
  },
  {
    id: 'btcusd',
    symbol: 'BTC/USD',
    name: 'Bitcoin',
    description: 'Bitcoin / US Dollar',
    icon: 'bitcoin',
    price: 68241.8,
    precision: 2,
    changePercent: 1.06,
    bid: 68238.4,
    ask: 68245.2,
    spark: [8, 12, 10, 18, 15, 24, 20, 29, 26, 34, 30, 38, 34, 42, 40, 47],
    category: 'Crypto',
    favorite: true,
  },
  {
    id: 'gbpusd',
    symbol: 'GBP/USD',
    name: 'British Pound',
    description: 'British Pound / US Dollar',
    icon: 'generic',
    iconLabel: '£',
    iconTint: '#1F3B73',
    price: 1.2714,
    precision: 4,
    changePercent: -0.22,
    bid: 1.2712,
    ask: 1.2716,
    spark: [36, 34, 38, 31, 33, 28, 30, 24, 27, 22, 25, 19, 22, 17, 20, 15],
    sparkTone: 'negative',
    category: 'Forex',
    favorite: false,
  },
  {
    id: 'usdjpy',
    symbol: 'USD/JPY',
    name: 'US Dollar / Yen',
    description: 'US Dollar / Japanese Yen',
    icon: 'generic',
    iconLabel: '¥',
    iconTint: '#BC002D',
    price: 156.42,
    precision: 2,
    changePercent: 0.41,
    bid: 156.4,
    ask: 156.44,
    spark: [10, 14, 12, 19, 16, 23, 21, 27, 24, 31, 28, 35, 32, 39, 37, 43],
    category: 'Forex',
    favorite: false,
  },
  {
    id: 'xagusd',
    symbol: 'XAG/USD',
    name: 'Silver',
    description: 'Silver / US Dollar',
    icon: 'silver',
    price: 30.86,
    precision: 2,
    changePercent: 0.92,
    bid: 30.84,
    ask: 30.88,
    spark: [14, 11, 17, 15, 21, 18, 25, 22, 28, 25, 32, 29, 36, 33, 40, 44],
    category: 'Metals',
    favorite: false,
  },
  {
    id: 'ethusd',
    symbol: 'ETH/USD',
    name: 'Ethereum',
    description: 'Ethereum / US Dollar',
    icon: 'ethereum',
    price: 3542.16,
    precision: 2,
    changePercent: -0.78,
    bid: 3541.2,
    ask: 3543.1,
    spark: [42, 38, 40, 33, 36, 30, 32, 26, 29, 23, 26, 20, 23, 18, 21, 16],
    sparkTone: 'negative',
    category: 'Crypto',
    favorite: false,
  },
  {
    id: 'usoil',
    symbol: 'USOIL',
    name: 'Crude Oil',
    description: 'WTI Crude Oil',
    icon: 'oil',
    price: 78.34,
    precision: 2,
    changePercent: 0.55,
    bid: 78.31,
    ask: 78.37,
    spark: [18, 15, 21, 19, 24, 21, 27, 25, 30, 27, 33, 31, 36, 34, 39, 42],
    category: 'Energy',
    favorite: false,
  },
]

export const instrumentsById = new Map(instruments.map((item) => [item.id, item]))

/** Market Watch on the balance screen shows only the first three. */
export const marketWatch = instruments.slice(0, 3)

export const positions: readonly Position[] = [
  {
    id: 'p-1',
    instrumentId: 'xauusd',
    side: 'Buy',
    lots: 0.5,
    entry: 2340.1,
    current: 2346.5,
    pnl: 320,
    state: 'Open',
  },
  {
    id: 'p-2',
    instrumentId: 'eurusd',
    side: 'Sell',
    lots: 1,
    entry: 1.085,
    current: 1.0824,
    pnl: -137.3,
    state: 'Open',
  },
  {
    id: 'p-3',
    instrumentId: 'btcusd',
    side: 'Buy',
    lots: 0.1,
    entry: 67400,
    current: 68241.8,
    pnl: 84.18,
    state: 'Pending',
  },
  {
    id: 'p-4',
    instrumentId: 'xagusd',
    side: 'Buy',
    lots: 2,
    entry: 30.4,
    current: 30.86,
    pnl: 92,
    state: 'Closed',
  },
]

export const activity: readonly ActivityEntry[] = [
  {
    id: 'a-1',
    kind: 'trade',
    instrumentId: 'xauusd',
    title: 'XAU/USD',
    subtitle: 'Closed • Buy',
    date: 'Dec 21, 2022',
    time: '14:32',
    amount: 320,
    group: 'Today',
    tab: 'Trades',
  },
  {
    id: 'a-2',
    kind: 'deposit',
    title: 'Deposit',
    subtitle: 'Completed',
    date: 'Dec 21, 2022',
    time: '10:15',
    amount: 1000,
    group: 'Today',
    tab: 'Funds',
  },
  {
    id: 'a-3',
    kind: 'trade',
    instrumentId: 'eurusd',
    title: 'EUR/USD',
    subtitle: 'Closed • Sell',
    date: 'Dec 20, 2022',
    time: '16:08',
    amount: -82.4,
    group: 'Yesterday',
    tab: 'Trades',
  },
  {
    id: 'a-4',
    kind: 'withdrawal',
    title: 'Withdrawal',
    subtitle: 'Completed',
    date: 'Dec 20, 2022',
    time: '11:24',
    amount: -250,
    group: 'Yesterday',
    tab: 'Funds',
  },
  {
    id: 'a-5',
    kind: 'trade',
    instrumentId: 'btcusd',
    title: 'BTC/USD',
    subtitle: 'Closed • Buy',
    date: 'Dec 19, 2022',
    time: '09:41',
    amount: 146.2,
    group: 'Earlier',
    tab: 'Trades',
  },
  {
    id: 'a-6',
    kind: 'trade',
    instrumentId: 'xagusd',
    title: 'XAG/USD',
    subtitle: 'Pending • Buy limit',
    date: 'Dec 19, 2022',
    time: '08:05',
    amount: 0,
    group: 'Earlier',
    tab: 'Orders',
  },
]

export const signals: readonly Signal[] = [
  {
    id: 's-1',
    instrumentId: 'xauusd',
    headline: 'Gold holds above key support as markets await data.',
    date: 'Nov 21, 2022',
    source: 'WaveX Insight',
  },
  {
    id: 's-2',
    instrumentId: 'eurusd',
    headline: 'Euro steadies into the close as yields drift lower.',
    date: 'Nov 20, 2022',
    source: 'WaveX Insight',
  },
]

/**
 * Daily closes for the XAU/USD detail chart, August through December.
 * Index 52 is the value the crosshair reads, matching the mockup.
 */
export const xauSeries: readonly number[] = [
  2212, 2206, 2222, 2216, 2234, 2246, 2240, 2258, 2272, 2266, 2284, 2298, 2292, 2310, 2326, 2342,
  2334, 2352, 2370, 2362, 2384, 2404, 2424, 2440, 2444, 2430, 2436, 2412, 2394, 2400, 2378, 2366,
  2372, 2350, 2338, 2344, 2322, 2308, 2314, 2292, 2278, 2266, 2262, 2274, 2286, 2280, 2296, 2310,
  2304, 2322, 2340, 2362, 2387.42, 2398, 2392, 2410, 2424, 2418, 2436, 2450, 2444, 2462, 2478, 2472,
  2490, 2504, 2498, 2514, 2524, 2508,
]

/** The point the crosshair sits on. */
export const xauCursorIndex = 52
export const xauCursorOpen = 2379.1
export const xauCursorClose = 2387.42

export const xauMonths = ['Aug', 'Sept', 'Oct', 'Nov', 'Dec'] as const
export const timeframes = ['1D', '5D', '1W', '1M', '3M', '6M'] as const
