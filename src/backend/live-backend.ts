import { z } from 'zod'

import { ClientPortalAdapter } from './adapters/client-portal'
import { TradingApiAdapter } from './adapters/trading-api'
import type { WaveXBackend } from './contract'
import { BackendError } from './errors'
import { Gate, type BackendConfig } from './gate'
import { createSessionStore, type SessionMaterial, type SessionStore } from './secure-session-store'

/**
 * The real backend.
 *
 * Authentication is implemented in full, because guide §3 documents it step
 * by step. The data calls are not: the guide lists which endpoint backs each
 * screen but not what any of them return, and guide §7 asks the backend team
 * for exactly that. Rather than invent field names that would compile, read
 * plausibly, and silently produce wrong numbers in a trading app, those
 * methods refuse with the specific thing that is missing.
 *
 * Every refusal names a numbered item from guide §7, so wiring a screen tells
 * you which question to chase rather than leaving you guessing.
 */

function needs(item: string, guideItem: string): never {
  throw new BackendError(
    'blocked',
    `Not wired yet: ${item}. Blocked on guide §7 — ${guideItem}.`,
  )
}

/** The one response shape guide §2 documents: open, pending and total counts. */
const countsSchema = z
  .object({
    open: z.coerce.number(),
    pending: z.coerce.number(),
    total: z.coerce.number(),
  })
  .partial()

export function createLiveBackend(config: BackendConfig): WaveXBackend {
  const gate = new Gate(config)
  const trading = new TradingApiAdapter(gate)
  const portal = new ClientPortalAdapter(gate)
  const store: SessionStore = createSessionStore()

  /** In-memory copy of what the keychain holds, so reads are not async-chatty. */
  let material: SessionMaterial | null = null

  function requireSession(): SessionMaterial {
    if (!material) {
      throw new BackendError('auth', 'You are signed out.')
    }
    return material
  }

  return {
    session: {
      async signIn(email, password) {
        const footprint = await store.footprint()
        const outcome = await trading.signIn(email, password, footprint)

        if (outcome.kind === 'verification-required') {
          return { kind: 'verification-required' }
        }

        material = outcome.material
        await store.write(outcome.material)
        return { kind: 'authenticated' }
      },

      async restore() {
        const stored = await store.read()
        if (!stored) return false

        // A stored bearer is not a valid session. Guide §3.1 step 6 exists
        // precisely so the app can tell the difference before showing a
        // balance that is hours stale.
        if (await trading.isSessionValid(stored)) {
          material = stored
          return true
        }

        try {
          await this.refresh()
          return true
        } catch {
          await this.signOut()
          return false
        }
      },

      async refresh() {
        const stored = material ?? (await store.read())
        if (!stored) throw new BackendError('auth', 'You are signed out.')

        const bearerToken = await trading.issueBearer(
          stored.accountToken,
          stored.secretKey,
          stored.footprint,
        )
        const refreshed: SessionMaterial = {
          ...stored,
          bearerToken,
          issuedAt: new Date().toISOString(),
        }
        material = refreshed
        await store.write(refreshed)
      },

      async signOut() {
        // Guide §3.3: "Clear all stored session material on logout."
        material = null
        portal.reset()
        await store.clear()
      },
    },

    accounts: {
      summary: () => needs('account summary', 'item 6, response examples for accountList/getuser'),
      list: () => needs('account list', 'item 6, response examples for accountList'),
      async switchAccount() {
        // Reachable, but deliberately not wired: guide §4.2 lists both a
        // trading and a portal `switchAccount` and §7.7 asks which one wins.
        needs('account switching', 'item 7, which of the two switchAccount endpoints to prefer')
      },
      profile: () => needs('profile', 'item 6, response examples for detail/apiBootstrap'),
    },

    markets: {
      catalogue: () => needs('market catalogue', 'item 11, precision and lot rules per instrument'),
      favorites: () => needs('favorites', 'item 6, response examples for getfav'),
      setFavorite: () => needs('favorite toggle', 'item 6, response examples for updateFavorite'),
      quoteSnapshot: () => needs('live quotes', 'item 5, the live-price WebSocket or polling spec'),
      candles: () => needs('chart history', 'item 5, the charting request contract'),
    },

    orders: {
      async counts(accountId) {
        const session = requireSession()
        const body = await gate.callJson('ordersCount', {
          query: { token: session.accountToken, account: accountId },
          headers: trading.headers(session),
        })

        const parsed = countsSchema.safeParse(body)
        if (!parsed.success) {
          throw new BackendError('malformed', 'Order counts came back in an unexpected shape.', {
            endpoint: 'ordersCount',
          })
        }
        return {
          open: parsed.data.open ?? 0,
          pending: parsed.data.pending ?? 0,
          total: parsed.data.total ?? 0,
        }
      },

      list: () => needs('open positions', 'item 2, a staging account holding an open position'),
      history: () => needs('closed history', 'item 6, response examples for history_of_closed_orders'),
      place: () => needs('order placement', 'item 3, written authorization to test trading mutations'),
      modify: () => needs('order modification', 'item 3, written authorization to test trading mutations'),
      cancel: () => needs('order cancellation', 'item 3, written authorization to test trading mutations'),
      close: () => needs('position close', 'item 3, written authorization to test trading mutations'),
    },

    funds: {
      configuration: () => needs('funding configuration', 'item 6, response examples for apiRedeemConfig'),
      deposit: () => needs('deposit submission', 'item 4, test methods that cannot move real money'),
      requestWithdrawal: () =>
        needs('withdrawal', 'item 4, test methods that cannot move real money'),
      transfer: () => needs('transfer', 'item 4, test methods that cannot move real money'),
      history: () => needs('funding history', 'item 6, response examples for payout_in_out'),
    },

    engagement: {
      notifications: () => needs('notifications', 'item 6, response examples for apiNotifications'),
      markNotificationsRead: () =>
        needs('notification read state', 'item 6, response examples for apiNotificationsRead'),
    },
  }
}
