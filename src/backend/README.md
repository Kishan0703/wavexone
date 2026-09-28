# `WaveXBackend`

The network seam described in `WAVEXONE_BACKEND_INTEGRATION_GUIDE.md` §5.
Screens call a typed interface in the app's own domain types and never see
collection names, portal cookies, raw token bodies or the four different
shapes a failure arrives in.

## What is here

| File | Role |
|---|---|
| `contract.ts` | The interface. The only file a screen should need to read. |
| `mock-backend.ts` | The contract served from `src/data/mock.ts`. The default. |
| `live-backend.ts` | The real one. Authentication is complete; data calls are not — see below. |
| `gate.ts` | Denylist, phase gating and the duplicate-submission guard. |
| `http.ts` | The one `fetch`. TLS, timeouts, envelope normalisation. |
| `endpoints.ts` | Every allowed endpoint, and the five that are refused. |
| `errors.ts` | One typed error model, plus the user-facing copy map. |
| `decimal.ts` | Exact money. Guide §5 forbids floats in order calculations. |
| `secure-session-store.ts` | Keychain / Keystore. Memory-only on web. |
| `adapters/` | The two transports: trading API and Client Portal. |
| `provider.tsx` | `BackendProvider`, `useBackend`, `useBackendQuery`. |

## Which implementation runs

`createBackend()` returns the **mock** unless three environment values are
set:

```
EXPO_PUBLIC_WAVEX_TRADING_URL
EXPO_PUBLIC_WAVEX_PORTAL_URL
EXPO_PUBLIC_WAVEX_PORTAL_ORIGIN
```

That default is deliberate. Guide §2: "Production trading and real-money
funding must remain disabled until mutation testing is authorized." A build
that reaches the real API by accident is how that goes wrong.

Two more values gate behaviour rather than routing:

- `EXPO_PUBLIC_WAVEX_PHASE` (default `1`) — guide §8. Phase 1 is read-only;
  anything above the configured phase is refused before a request is made.
- `EXPO_PUBLIC_WAVEX_ALLOW_UNCONFIRMED` (default `false`) — allows mutations
  whose HTTP method we inferred rather than read off the collection.

## What the live backend does not do yet

Authentication is implemented in full, because guide §3 documents it step by
step. **The data calls are not.** The guide says which endpoint backs each
screen but not what any of them return, so writing mappers would mean
inventing field names that compile, read plausibly, and silently produce
wrong numbers in a trading app.

Those methods throw a `blocked` error naming the guide §7 item that unblocks
them. Wiring a screen tells you which question to ask rather than leaving you
to guess. The exception is `orders.counts`, whose shape §2 does document.

## Rules this module enforces

These are guide §6 requirements, in code rather than in a checklist:

- **Denied routes** (§6.5–6.7). `swapFunctionality`, `sendnotification`,
  `transferBalance`, `getPayoutInfo`, `getPayinInfo` throw with the reason.
- **No automatic retries** (§6.4). There is no retry anywhere. A mutation that
  fails *in transit* is reported as unconfirmed, not retried — the server may
  have acted.
- **No duplicate execution** (§9). Every mutation needs an idempotency key.
  The same key inside 30 seconds returns the first outcome instead of firing
  again. This matters more than usual here: guide §4.5 notes several trading
  mutations are `GET` requests.
- **Phase gating** (§8). Nothing above the configured phase is reachable.
- **HTTPS only** (§6.9). A plaintext base URL fails at construction.
- **No credentials in logs** (§3.3, §6.3). Request and response bodies are
  never logged. URLs are never logged — this API puts the account token in
  the query string.
- **No password persistence** (§3.3). `password` is a parameter to `signIn`
  and appears nowhere else in the module.

## Things the guide rules out that the UI currently shows

Worth resolving before Phase 1 ships:

- **Trading Signals** has no confirmed endpoint (§4.8). The guide says to hide
  the rows or treat them as an approved external destination. The app renders
  them from fixtures today, and `contract.ts` has no `signals` method as a
  result.
- **Market Sentiment** and **`<50ms` execution** are design copy (§4.2). They
  are not presented as account data, which is why there is no method for them.
- **Referrals and MAM/PAMM** appear in the guide's suggested interface groups
  but have no screen. They are left out rather than added as dead surface.

## Tests

```bash
npm test
```

Tests live in `tests/backend/`, mirroring this directory.

| Spec | Covers |
|---|---|
| `decimal.test.ts` | The arithmetic. |
| `gate.test.ts` | Denylist, phase gating and every duplicate-submission path — including the mutation that fails mid-flight, the one that can place an order twice. |
| `http.test.ts` | TLS refusal, the status→kind mapping, timeouts, form encoding and envelope unwrapping. |
| `errors`/`redact.test.ts` | That no credential reaches a log, and that server wording never reaches a user. |
| `endpoints.test.ts` | Invariants over the whole registry, so a *new* entry that breaks a §6 rule fails without anyone writing a test for it. |
| `trading-api.test.ts` | The §3.1 handshake, the raw-token body, and that the password is sent once and stored nowhere. |
| `client-portal.test.ts` | §3.2, including that a read is replayed after a 401 and a mutation is not. |
| `live-backend.test.ts` | Session lifecycle, `orders.counts`, and that every unwired method refuses by name. |
| `provider.test.tsx` | The four states of `useBackendQuery`, including a read that throws synchronously. |

The synchronous-throw case is a regression guard, not a hypothetical: the
unwired methods used to throw rather than reject, which escaped the hook's
rejection handler and crashed the screen instead of showing the refusal.
