# WavexOne — mobile UI

React Native (Expo) implementation of the WavexOne trading app design. This is
the **interface only**: every screen runs on fixtures from `src/data/mock.ts`.
There is no networking, and no order, transfer or funding action reaches a
server.

## Running it

```bash
npm install
```

```bash
npx expo start
```

Then press `i` / `a` for a simulator, or `w` for the browser. Native builds
need a development build rather than Expo Go, because the Inter faces are
embedded through the `expo-font` config plugin:

```bash
npx expo run:ios
```

## Screens

| Screen | Where it lives | Source |
|---|---|---|
| Dashboard — greeting, portfolio, signals | Home tab | mockup |
| Your Balance — funding actions, Market Watch | pushed from the portfolio card | mockup |
| Instrument detail — quote, chart, Sell / Buy | pushed above the tabs | mockup |
| Positions — floating P&L, open / pending / closed | Positions tab | mockup |
| Activity — month summary, grouped history | pushed from More → Funds | mockup |
| Account — profile, menus, support banner | More tab | mockup |
| Markets — search, category filter, full catalogue | Markets tab | designed to match |
| Trade — order ticket | Trade tab | designed to match |

The two screens marked *designed to match* were not in the supplied artwork.
They are built from the same primitives and introduce no new visual rules.

## Layout

```
src/design-system/   colours, type scale, and every shared primitive
src/features/        composite pieces per domain (market row, position card, chart)
src/screens/         one file per screen
src/navigation/      navigators, param lists, the custom tab bar
src/data/            fixtures, domain types, hoisted Intl formatters
```

`src/design-system/colors.ts` and `tokens.ts` hold every colour and dimension.
The colour values were sampled pixel by pixel from the mockups in the repo
root, so treat that file as the source of truth rather than re-deriving shades
at call sites.

## Notes for the backend work

`WAVEXONE_BACKEND_INTEGRATION_GUIDE.md` specifies the `WaveXBackend` client
that replaces `src/data/mock.ts`. Screens only consume the types in
`src/data/types.ts`, so the swap is contained.

Two things the guide calls out that this build already respects:

- **Market Sentiment** and the **`<50ms` execution** tile on the dashboard are
  static design copy. No endpoint backs them, so they are not presented as
  account data.
- Order close, bulk close, withdrawal and transfer controls render but do
  nothing. They need a confirmation step before they are wired up.

## Checks

```bash
npx tsc --noEmit && npx expo lint
```
