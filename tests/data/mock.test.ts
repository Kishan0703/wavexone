import {
  accounts,
  activity,
  activityById,
  instruments,
  instrumentsById,
  marketWatch,
  notifications,
  positions,
  positionsById,
  quickAmounts,
  signals,
  timeframes,
  xauChart,
} from '../../src/data/mock'

/**
 * Referential integrity across the fixtures.
 *
 * Screens look instruments up by id (`instrumentsById.get(position.instrumentId)`)
 * and several do so without a fallback. A typo in a fixture id typechecks
 * perfectly and then renders a blank row or crashes a card, so the links are
 * checked here instead of being discovered on a screen.
 */

const ids = <T extends { id: string }>(items: readonly T[]) => items.map((item) => item.id)

describe('identifiers', () => {
  it.each([
    ['instruments', () => ids(instruments)],
    ['accounts', () => ids(accounts)],
    ['positions', () => ids(positions)],
    ['activity', () => ids(activity)],
    ['notifications', () => ids(notifications)],
    ['signals', () => ids(signals)],
  ])('%s are unique, so list keys are stable', (_name, read) => {
    const list = read()
    expect(new Set(list).size).toBe(list.length)
  })

  it('has no empty id anywhere', () => {
    for (const list of [instruments, accounts, positions, activity, notifications, signals]) {
      for (const item of list) expect(item.id.trim()).not.toBe('')
    }
  })
})

describe('lookup maps match their source lists', () => {
  it.each([
    ['instrumentsById', () => instrumentsById, () => instruments],
    ['positionsById', () => positionsById, () => positions],
    ['activityById', () => activityById, () => activity],
  ])('%s covers every entry', (_name, readMap, readList) => {
    const map = readMap() as Map<string, { id: string }>
    const list = readList() as readonly { id: string }[]

    expect(map.size).toBe(list.length)
    for (const item of list) expect(map.get(item.id)).toBe(item)
  })
})

describe('cross-references', () => {
  it('every position points at an instrument that exists', () => {
    for (const position of positions) {
      expect(instrumentsById.has(position.instrumentId)).toBe(true)
    }
  })

  it('every trade activity entry points at an instrument that exists', () => {
    for (const entry of activity) {
      if (entry.kind !== 'trade') continue
      expect(entry.instrumentId).toBeDefined()
      expect(instrumentsById.has(entry.instrumentId!)).toBe(true)
    }
  })

  it('funding entries carry no instrument', () => {
    // The activity row renders an asset icon only for trades; a stray
    // instrumentId on a deposit would put a gold coin next to a bank transfer.
    for (const entry of activity) {
      if (entry.kind === 'trade') continue
      expect(entry.instrumentId).toBeUndefined()
    }
  })

  it('every signal points at an instrument that exists', () => {
    for (const signal of signals) {
      expect(instrumentsById.has(signal.instrumentId)).toBe(true)
    }
  })

  it('market watch is drawn from the instrument list', () => {
    for (const item of marketWatch) expect(instrumentsById.get(item.id)).toBe(item)
  })
})

describe('instrument values are internally consistent', () => {
  it('quotes a bid at or below the ask', () => {
    // A crossed quote would render a negative spread on the ticket.
    for (const item of instruments) {
      expect(item.bid).toBeLessThanOrEqual(item.ask)
    }
  })

  it('prices within the bid/ask range', () => {
    for (const item of instruments) {
      expect(item.price).toBeGreaterThanOrEqual(item.bid)
      expect(item.price).toBeLessThanOrEqual(item.ask)
    }
  })

  it('declares a precision the design system understands', () => {
    for (const item of instruments) expect([2, 4]).toContain(item.precision)
  })

  it('carries a positive price and contract size', () => {
    for (const item of instruments) {
      expect(item.price).toBeGreaterThan(0)
      expect(item.contractSize).toBeGreaterThan(0)
    }
  })

  it('gives every sparkline enough points to draw a line', () => {
    for (const item of instruments) {
      expect(item.spark.length).toBeGreaterThan(1)
      for (const point of item.spark) expect(Number.isFinite(point)).toBe(true)
    }
  })
})

describe('accounts', () => {
  it('reports the open position count the positions list actually contains', () => {
    // The dashboard prints this number next to a list built from `positions`;
    // if they disagree the screen contradicts itself.
    const open = positions.filter((item) => item.state === 'Open').length
    expect(accounts[0].openPositions).toBe(open)
  })

  it('states a win rate as a percentage', () => {
    for (const account of accounts) {
      expect(account.monthWinRate).toBeGreaterThanOrEqual(0)
      expect(account.monthWinRate).toBeLessThanOrEqual(100)
    }
  })

  it('carries a positive leverage, as the account header prints "1:200"', () => {
    for (const account of accounts) expect(account.leverage).toBeGreaterThan(0)
  })
})

describe('positions', () => {
  it('uses only states the screens switch on', () => {
    for (const position of positions) {
      expect(['Open', 'Pending', 'Closed']).toContain(position.state)
    }
  })

  it('trades a positive lot size on the right side', () => {
    for (const position of positions) {
      expect(position.lots).toBeGreaterThan(0)
      expect(['Buy', 'Sell']).toContain(position.side)
    }
  })

  /**
   * Only the *sign* is asserted, not the magnitude. The fixture P&L figures
   * are display values taken from the mockups and do not follow a single
   * lots × contract-size formula, so checking the amount would be inventing a
   * convention the fixtures never had. The direction is unambiguous.
   */
  const movedInFavour = (position: (typeof positions)[number]) =>
    position.side === 'Buy' ? position.current > position.entry : position.current < position.entry

  const KNOWN_INCONSISTENT = 'p-2'

  it('signs P&L in the direction the trade actually moved', () => {
    // A Buy that is up must not show a loss.
    for (const position of positions) {
      if (position.id === KNOWN_INCONSISTENT) continue
      if (position.current === position.entry) continue

      expect(Math.sign(position.pnl)).toBe(movedInFavour(position) ? 1 : -1)
    }
  })

  // Documents a real inconsistency rather than hiding it. `p-2` is a 1-lot
  // EUR/USD *Sell* whose price fell from 1.0850 to 1.0824 — a $260 gain for a
  // short — but the fixture reports -$137.30. The loss figure is the one the
  // mockup shows, so the entry/current pair is what looks invented; fixing it
  // is a design call, not a test call.
  //
  // `it.failing` keeps the suite green while the defect stands and turns red
  // the moment someone corrects the fixture, which is the prompt to delete it.
  it.failing(`${KNOWN_INCONSISTENT} reports a loss on a short that moved in its favour`, () => {
    const position = positions.find((item) => item.id === KNOWN_INCONSISTENT)!
    expect(Math.sign(position.pnl)).toBe(movedInFavour(position) ? 1 : -1)
  })
})

describe('chart series', () => {
  it('covers every timeframe the picker offers', () => {
    for (const timeframe of timeframes) expect(xauChart[timeframe]).toBeDefined()
  })

  it.each(timeframes)('%s is drawable', (timeframe) => {
    const series = xauChart[timeframe]

    expect(series.points.length).toBeGreaterThan(1)
    expect(series.labels.length).toBeGreaterThan(0)
    expect(series.max).toBeGreaterThan(series.min)
    expect(series.step).toBeGreaterThan(0)
  })

  it.each(timeframes)('%s keeps its cursor inside the series', (timeframe) => {
    // The cursor index is used to read `points[cursorIndex]`; out of range
    // would put the marker off-canvas.
    const series = xauChart[timeframe]
    expect(series.cursorIndex).toBeGreaterThanOrEqual(0)
    expect(series.cursorIndex).toBeLessThan(series.points.length)
  })

  it.each(timeframes)('%s keeps every point within its own min/max', (timeframe) => {
    // The chart maps points onto the min..max band, so a point outside it
    // would be clipped or drawn past the axis.
    const series = xauChart[timeframe]
    for (const point of series.points) {
      expect(point).toBeGreaterThanOrEqual(series.min)
      expect(point).toBeLessThanOrEqual(series.max)
    }
  })
})

describe('funding', () => {
  it('offers quick amounts in ascending order', () => {
    expect([...quickAmounts].sort((a, b) => a - b)).toEqual([...quickAmounts])
  })

  it('offers only positive quick amounts', () => {
    for (const amount of quickAmounts) expect(amount).toBeGreaterThan(0)
  })
})

describe('notifications', () => {
  it('uses only kinds the row component has an icon for', () => {
    for (const item of notifications) {
      expect(['price', 'order', 'funds', 'news']).toContain(item.kind)
    }
  })

  it('carries title and body copy for every entry', () => {
    for (const item of notifications) {
      expect(item.title.trim()).not.toBe('')
      expect(item.body.trim()).not.toBe('')
    }
  })
})
