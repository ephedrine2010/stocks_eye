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
      ├─ core/router.js        market → headline price adapter (+ fallback chain)
      │    └─ services/prices/{coingecko,yahoo,mock}.js
      ├─ (movers)              per-market stocks/ETFs: coingecko.fetchCoins / yahoo.fetchMovers → mock
      ├─ services/news/index.js   RSS → mock fallback
      ├─ services/ai/index.js     per-market take + roll-up brief (mock / DeepSeek when keyed)
      └─ core/{marketHours,currency,cache,normalizer}.js
  → { markets[], watchlist[], brief, as_of }
```

Client re-computes open/closed + local clocks live (`frontend/js/marketHours.js`) so tiles tick
without server round-trips — it mirrors `backend/core/marketHours.js`. **If you change the schedule
or hours logic, update BOTH files.**

## Directory map
```
backend/
  server.js                  Express app (API + static frontend + env loader)
  core/
    cache.js                 in-memory TTL cache (get/set/wrap)
    marketHours.js           schedule + tz → open/closed + local time
    currency.js              USD normalization (STATIC approx rates — TODO: live FX)
    normalizer.js            makeQuote / makeNews / makeTake — the internal shapes
    router.js                market → price adapter chain
    env.js                   zero-dep env loader (reads ai_agents_sub.env)
  markets/                   ONE config file per market + index.js registry
    usa · ksa · uae · egypt · china · gold · crypto
  services/
    prices/  coingecko.js(live)  yahoo.js(live)  mock.js(guaranteed fallback)
    news/    rss.js(fetch+parse)  index.js(rss→mock)
    ai/      index.js(getTake + getBrief; mock default, DeepSeek when keyed)
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
| Market | Headline index (price) | Live? |
|--------|-------------|-------|
| Crypto | CoinGecko (no key) | ✅ fully live, top 5 coins, 24/7 |
| USA / China / KSA / Egypt / Gold | Yahoo (unofficial, no key) | ✅ live in practice |
| UAE | Yahoo → **mock** | ⚠️ Yahoo lacks the `^DFMGI` index; headline falls back to mock (known gap) |

- **Movers** (per-market stocks/ETFs, from each config's curated `movers` list): **live for all 7
  markets** — Crypto via CoinGecko, the rest via Yahoo individual tickers (`yahoo.fetchMovers`).
  **UAE movers ARE live** even though its index is mock — Yahoo carries DFM stocks (`EMAAR.AE`, `DIB.AE`,
  …) despite lacking `^DFMGI`. Movers use **close-to-close** from the daily series (see Gotchas).
- **Leading stocks + dividends** (`yahoo.fetchLeaders`): the heavyweight bellwethers from a config's
  curated `leaders` list (weight-ranked, not %-ranked — a *second view* of the same idea as movers).
  Wired for **USA + KSA** so far; other markets omit the section until a list is added. Each ticker is
  priced close-to-close AND carries a **dividend summary** `{ yield, annual, exDate, frequency }` from
  the SAME fetch (`range=2y&events=div`). Yield = TTM payout ÷ price (currency-neutral). Non-payers
  return `dividend: null` → the UI hides the field (per `documentation/display_data/display_approach.md`).
  Dividends are live for all 5 equity markets (only USA/KSA have `leaders` lists wired today).
- **News**: RSS where a feed is configured (USA=CNBC, Egypt=Egypt Independent, China=SCMP,
  Crypto=CoinDesk, Gold=Kitco), else the mock dataset (**KSA, UAE** — outlets 403 a plain fetch,
  still open). RSS items default to **neutral** sentiment (FinBERT wiring is a TODO).
- **AI**: mock by default. Set `DEEPSEEK_API_KEY` in `ai_agents_sub.env` to use DeepSeek
  (`deepseek-chat`) via its OpenAI-compatible HTTP API — no SDK, uses the built-in `fetch`.
  DeepSeek has no web-search tool, so the model grounds ONLY on the snapshot numbers. Any AI
  failure falls back to mock — the app never breaks on the AI layer. **Cost control:** only the
  Morning Brief calls the model (cached 24h); per-market Takes stay on mock. Toggle via
  `LIVE = { takes, brief }` in `services/ai/index.js`. (Claude was the prior provider, now stopped.)

## Gotchas / conventions to preserve
- **Yahoo change % must be daily.** For the headline **index** quote, `meta.chartPreviousClose` is
  range-relative (a ~1-month move on `range=1mo`) — use the prior-day close: prefer
  `meta.previousClose`, else the second-to-last close in the series.
- **Movers use close-to-close, not the live price.** `yahoo.fetchMovers` computes BOTH price and
  change from the last two valid daily closes — deliberately NOT `regularMarketPrice`. Yahoo's live
  price is unreliable for some EGX (`.CA`) tickers (it sits on a different scale than the close
  series and, if mixed with a close, fabricates a huge fake daily move). Tradeoff: movers reflect the
  last completed session, not live intraday. See `services/prices/yahoo.js`.
- **RSS parser decodes numeric entities** (`&#8217;` etc.), not just named ones — WordPress feeds
  (e.g. Egypt Independent) rely on it. See `services/news/rss.js`.
- **Caching TTLs** live in each service: quotes 60s, news 15m, AI Take 30m (mock), AI Brief 24h.
  The Brief caches ONLY on a successful live call — never the mock fallback — so one failure doesn't
  lock mock for the whole day. Respect free-tier caps — don't drop these without reason.
- **Crypto never closes** — its schedule uses `always: true`. Gold uses `commodity: true` (24h Mon–Fri).
  These flags drive both the status logic and the tile clock label.
- **FX is static/approximate** in `core/currency.js` — fine for display; swap for a live source later.
- **Not investment advice** — the AI/news framing is deliberate. Keep the disclaimers in the UI.

## Where to extend next (open items)
- A real **UAE headline-index source** — movers are already live; only the `^DFMGI` index is mock.
- **KSA / UAE news feeds** — Egypt & China are now wired; KSA/UAE outlets 403 a plain fetch, so they
  need a working feed URL or a fetch that gets past the block.
- **Live FX** in `core/currency.js`.
- **FinBERT** sentiment for RSS headlines (`services/news`) — all live RSS is still neutral.
- **DeepSeek** AI is wired behind `DEEPSEEK_API_KEY` (Morning Brief only). Possible next steps:
  enable per-market Takes (`LIVE.takes = true`), or add a web-search-capable provider back for
  breaking-news grounding (DeepSeek can't search the web).
- Tests.
