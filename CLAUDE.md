# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is
**Stocks Eye** — a multi-market monitoring dashboard for 7 markets (USA, KSA, UAE, Egypt, China,
Gold, Crypto). Shows live open/closed status, prices, per-market news + sentiment, a per-market
**AI Take**, and a daily **AI Morning Brief**.

Design rationale and decisions live in [`documentation/brainstorm/`](documentation/brainstorm/)
(read `README.md` there first). An interactive design mockup is `documentation/brainstorm/dashboard-mockup.html`.

## Commands
```bash
npm install     # only dependency is express
npm start       # serve API + frontend at http://localhost:3000
npm run dev     # same, with --watch auto-reload
```
No build step, no bundler, no tests yet. **Requires Node 18+** (uses the built-in global `fetch`).

Quick manual verification:
```bash
node --check <file>                         # syntax-check any JS file (all are ESM)
curl -s localhost:3000/api/dashboard | ...  # the one payload the UI renders
```
When restarting the dev server on Windows, kill the old one first (`taskkill //F //IM node.exe`) —
a stale process holds port 3000 and the new one silently fails to bind.

## Stack & conventions
- **Node + vanilla JS**, ES modules everywhere (`"type": "module"`). Backend and frontend both ESM.
- **Relative imports MUST include the `.js` extension** (Node ESM requirement) — e.g. `import x from './cache.js'`.
- Express backend serves both the JSON API and the static frontend.
- Frontend is plain ES modules loaded via `<script type="module">` — no framework, no build.
- 2-space indent, single quotes, semicolons. Keep modules small and single-purpose.

## Architecture — route → normalize → cache
Each data source is an isolated **adapter**; a **normalizer** unifies them into one internal model;
a **router** picks the source per market with a fallback chain; the **aggregator** stitches it all
into the payload the UI renders. The app never knows which source answered.

```
GET /api/dashboard
  → services/dashboard.js  (aggregator: the ONLY place sources are combined)
      ├─ core/router.js        market → price adapter (+ fallback chain)
      │    └─ services/prices/{coingecko,yahoo,mock}.js
      ├─ services/news/index.js   RSS → mock fallback
      ├─ services/ai/index.js     per-market take + roll-up brief (mock / guarded Claude)
      └─ core/{marketHours,currency,cache,normalizer}.js
  → { markets[], watchlist[], brief, as_of }
```

Client re-computes open/closed + local clocks live (`frontend/js/marketHours.js`) so tiles tick
without server round-trips — it mirrors `backend/core/marketHours.js`. **If you change the schedule
or hours logic, update BOTH files.**

## Directory map
```
backend/
  server.js                  Express app (API + static frontend + .env loader)
  core/
    cache.js                 in-memory TTL cache (get/set/wrap)
    marketHours.js           schedule + tz → open/closed + local time
    currency.js              USD normalization (STATIC approx rates — TODO: live FX)
    normalizer.js            makeQuote / makeNews / makeTake — the internal shapes
    router.js                market → price adapter chain
    env.js                   zero-dep .env loader
  markets/                   ONE config file per market + index.js registry
    usa · ksa · uae · egypt · china · gold · crypto
  services/
    prices/  coingecko.js(live)  yahoo.js(live)  mock.js(guaranteed fallback)
    news/    rss.js(fetch+parse)  index.js(rss→mock)
    ai/      index.js(getTake + getBrief; mock default, Claude when keyed)
    mock/    marketData.js  (sample movers/news/advice/watchlist/brief)
    dashboard.js             aggregator
  routes/api.js              /api/dashboard · /api/markets · /api/brief
frontend/
  index.html
  css/styles.css
  js/  api.js · format.js · marketHours.js · charts.js
    ui/  brief.js · tiles.js · detail.js · watchlist.js
    main.js                  orchestrator (fetch, render, clock/refresh intervals)
```

## The core rule: modularity
- **Add or swap a data source → edit ONE file** in `backend/services/**`. Wire it into a market's
  `priceSource`/`newsSource` (and `core/router.js`'s adapter chain for prices). Never put
  source-specific logic in the aggregator, routes, or UI.
- **Add a market → ONE file** in `backend/markets/` + one line in `markets/index.js`.
- Every adapter returns the normalized shape from `core/normalizer.js`. A price adapter returns
  `null` (or throws) on failure so the router falls through to the next source; `mock.js` is the
  guaranteed final fallback so a tile is never blank.

## Data sources (current status)
| Market | Price source | Live? |
|--------|-------------|-------|
| Crypto | CoinGecko (no key) | ✅ fully live, top 5 coins, 24/7 |
| USA / China / KSA / Egypt / Gold | Yahoo (unofficial, no key) | ✅ live in practice |
| UAE | Yahoo → **mock** | ⚠️ Yahoo lacks `^DFMGI`; falls back to mock (known gap) |

- **News**: RSS where a feed is configured (USA=CNBC, Crypto=CoinDesk, Gold=Kitco), else the mock
  dataset. RSS items default to **neutral** sentiment (FinBERT wiring is a TODO).
- **AI**: mock by default. Set `ANTHROPIC_API_KEY` in `.env` and `npm i @anthropic-ai/sdk` to use
  Claude (`claude-opus-4-8`) with the web-search tool, grounded on the snapshot. Any AI failure
  falls back to mock — the app never breaks on the AI layer.

## Gotchas / conventions to preserve
- **Yahoo change % must be daily.** `meta.chartPreviousClose` is range-relative (a ~1-month move on
  `range=1mo`). Use the prior-day close: prefer `meta.previousClose`, else the second-to-last close
  in the series. See `services/prices/yahoo.js`.
- **Caching TTLs** live in each service (`cache.wrap`): quotes 60s, news 15m, AI 30m. Respect free-tier
  caps — don't drop these without reason.
- **Crypto never closes** — its schedule uses `always: true`. Gold uses `commodity: true` (24h Mon–Fri).
  These flags drive both the status logic and the tile clock label.
- **FX is static/approximate** in `core/currency.js` — fine for display; swap for a live source later.
- **Not investment advice** — the AI/news framing is deliberate. Keep the disclaimers in the UI.

## Where to extend next (open items)
- A real **UAE price source** (the one genuine gap).
- **Live FX** in `core/currency.js`.
- **FinBERT** sentiment for RSS headlines (`services/news`).
- **Real Anthropic** AI is already wired behind the key — verify against the current model id +
  web-search tool version in the `claude-api` skill before relying on it.
- Tests.
