# Response captures still needed

**Status:** blocking Phase 1 (guide §8)
**Who can clear it:** anyone with a real WaveXOne login and Postman

## Why this file exists

The supplied Postman collections settled the **request** side completely —
method, path, parameter names and headers for all 121 trading requests and 34
portal requests. `src/backend/endpoints.ts` is transcribed from them.

They did not settle the **response** side:

| Collection | Requests | Captured responses |
|---|---|---|
| `API_WITH_BEARER_TOKENS` | 121 | **0** |
| `Client Portal API` | 34 | 15, all unauthenticated `401` / empty `200` |

So no successful payload from either API exists anywhere in the project, and
the field names inside one are unknown. A screen cannot be wired to
`accountList` without knowing whether the balance arrives as `balance`,
`bal`, `equity` or `fund`.

Guessing is the one thing this module refuses to do. Every unwired method in
`src/backend/live-backend.ts` names the capture below that unblocks it.

## How to capture

1. Import both collections and `wavexone_api.postman_environment` into Postman.
2. Run **Secret Key generate** (`collect=check`) with a real login. The
   collection's sample sends `email=10001`, an account number rather than an
   address — either form appears to work.
3. Run **refresh token** (`collect=bearer`) to fill `{{bearer_token}}`.
4. For the portal, run `setPortalSession` with the `Origin` header set, so
   Postman's cookie jar holds `ci_session`. Portal `api*` routes return 401
   without it — `X-Portal-Token` alone is not enough.
5. Run each request below and **Save Response → Save as example**.
6. Re-export both collections.

## Before you send them

The collections already carry live account tokens and device fingerprints as
literals across ~80 URLs — five distinct account tokens, one of them repeated
131 times. Guide §6.1 asks for these to be replaced with variables and
rotated. Captured responses will contain more: real names, emails, phone
numbers, balances.

The values are deliberately not reproduced here. This file is committed; the
collections are not, and copying a token out of one into the other would
defeat that.

**Redact before sharing, or share out of band.** The collections are
gitignored in this repo for the same reason. Field *names* are what's needed
here — the values can be scrubbed to `"x"` and the capture is just as useful.

## Phase 1 — unblocks the read-only integration

These nine are the whole of Phase 1. Each maps to a method in
`src/backend/contract.ts`.

| # | Request | Unblocks |
|---|---|---|
| 1 | `collect=accountList&token=…` | `accounts.summary`, `accounts.list` — the balance row on Home |
| 2 | `apiBootstrap` | `accounts.profile`, KYC state. The portal's mega-endpoint; one capture covers user, accounts, summary, transactions, transfers, wallets, referral, settings |
| 3 | `collect=mwatch` | `markets.catalogue` — the Markets list |
| 4 | `collect=symbolSpreadApp` | Per-instrument precision and spread |
| 5 | `collect=getfav&token=…&data=[]` | `markets.favorites` |
| 6 | `collect=orders&token=…` | `orders.list` — **needs an account holding at least one open position and one pending order** (guide §7.2). An empty list teaches nothing |
| 7 | `collect=history_of_closed_orders&page=1&token=…&filter=24hr` | `orders.history` — the Activity tab |
| 8 | `apiRedeemConfig?accountToken=…` | `funds.configuration` — deposit methods, withdrawal fields, limits, KYC |
| 9 | `apiNotifications` | `engagement.notifications` |

Also useful, lower priority: `collect=payout_in_out` (funding history),
`apiTransfers`, `apiWalletHistory`, `collect=userGroup` (leverage and spread
per group), `collect=detail`.

## Phase 1 — not unblocked by a capture

Two gaps need a written answer, not a response body:

- **Live prices (guide §7.5).** No quote transport is documented anywhere in
  either collection. Is it a WebSocket or REST polling, and what is the
  subscription contract? `markets.quoteSnapshot` stays refused until this is
  answered — everything in the app that shows a moving price depends on it.
- **Which `switchAccount` (guide §7.7).** A trading route
  (`collect=switchAccount&token=…&switchtoken=…`) and a portal route
  (`POST /switchAccount`) both exist. Calling the wrong one leaves the two
  sessions pointing at different accounts.

## Phase 2 / 3 — after authorization

Do **not** capture these against production. Guide §7.3 requires written
authorization and a staging environment before any trading mutation runs, and
§7.4 requires funding methods that cannot move real money.

Needed once that exists: `collect=placeorder` (market and limit, success and
failure), `collect=squareoff`, `collect=mobileapp_modifyorder`,
`collect=create_fingerprint`, `apiSubmitWithdraw`, `apiSubmitDeposit`,
`apiTransfer`.

`create_fingerprint` is worth calling out: every order mutation requires a
`fingerprint` parameter distinct from the `footprint` used at sign-in, and its
format (`<hex>_<accountId>`) is known only from URL samples. The response
shape is a guess — see `issueOrderFingerprint` in
`src/backend/adapters/trading-api.ts`.

## What happens when these arrive

Each capture is a mechanical change: add a Zod schema, map it to the domain
type in `src/data/types.ts`, delete the `needs(...)` line. Roughly an hour per
endpoint, and the screens can then be moved off `src/data/mock.ts` one at a
time.
