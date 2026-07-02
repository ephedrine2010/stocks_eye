# 04 — Architecture

> **✅ Build status (v1):** This architecture is implemented. The one refinement from the sketch
> below: the code is split into **`backend/`** (Express API + adapters) and **`frontend/`** (static
> ES modules) rather than a single flat tree. The mapping is otherwise 1:1 —
> `backend/services/{prices,news,ai}` = the adapters, `backend/core/` = normalizer/router/cache/
> marketHours/currency, `backend/markets/` = per-market configs, `frontend/js/ui/` = the UI modules.
> `backend/services/dashboard.js` is the aggregator. The authoritative, current map is in the root
> [`CLAUDE.md`](../../CLAUDE.md).

## Principles (agreed in the brainstorm)
1. **Multi-source, route + normalize + cache.** No single API covers all markets; route each market
   to its best source with a fallback chain, then normalize everything into one internal model.
2. **"Market" = any tracked instrument with a status + price** — exchange, commodity, or crypto.
3. **Modular by default** — **one file per service/adapter, separated JS modules.** Adding or
   swapping a source touches **one file**, never the core. Adding a market = one config file.
4. **Not-advice, grounded, cited** for anything the AI produces.

## The normalization layer (why it's mandatory)
Yahoo, akshare, Finnhub, CoinGecko, Marketaux, etc. all return different shapes, field names,
timestamp formats, and currencies. Each source gets an **adapter** that translates its response into
**one internal model**; the rest of the app never knows which source answered.

```
┌───────────────────────────────────────────────┐
│                 App / UI                       │
└───────────────────┬───────────────────────────┘
                    │  asks for ONE clean shape
            ┌───────▼────────┐
            │   Normalizer   │  ← unifies into one internal model
            └───────┬────────┘
        ┌───────────┼───────────┬───────────┐
   ┌────▼───┐  ┌────▼───┐  ┌────▼────┐  ┌───▼─────┐
   │Finnhub │  │akshare │  │CoinGecko│  │ Marketaux│  … adapters (one file each)
   └────────┘  └────────┘  └─────────┘  └──────────┘
```

## Internal models (normalized shapes)
```
Quote  → { market, symbol, price, currency, change_pct, status, as_of, source }
News   → { market, headline, url, source, published_at, sentiment }   // bull|bear|neut
Take   → { market, sentiment, text, citations[], as_of }
Brief  → { lead, lines:[{market,sentiment,text}], hint, citations[], as_of }
```

## Routing + fallback
Two mechanisms combined:
- **Route by market** — pick the best source per market (see [01](01-data-sources.md), [02](02-news-and-sentiment.md)).
- **Fallback chain per market** — try sources in priority order until one answers, so an unofficial
  source (Yahoo) failing means failover, not a blackout.

## Cross-cutting services
- **Market-hours / status** — per-market schedule (trading days + session windows, or `always: true`
  for crypto) + timezone → live open/closed. Independent of the price source.
- **Currency / FX** — normalize to a display currency (USD); keep native + converted values.
- **Cache** — mandatory for free-tier caps. Suggested TTLs: equities 1–15 min, crypto shorter,
  news 15–30 min, AI takes per scheduled run. Always store `as_of`.

## Proposed file layout (modular)
```
/services/                  ← one adapter file per source (isolated, swappable)
  prices/
    finnhub.js  twelvedata.js  akshare.js  tadawul-stocker.js
    egxpy.js  coingecko.js  metals.js  yahoo.js
  news/
    marketaux.js  mubasher-rss.js  argaam-rss.js  zawya-rss.js
    akshare-news.js  finbert.js
  ai/
    market-take.js          ← one Claude call per market (web search)
    morning-brief.js        ← roll-up call
/core/
  normalizer.js             ← unifies every source into the internal models
  router.js                 ← market → source + fallback chain
  cache.js
  market-hours.js           ← schedule + timezone → open/closed
  currency.js               ← FX normalization
/markets/                   ← config per market (add a market = add a file here)
  usa.js  ksa.js  uae.js  egypt.js  china.js  gold.js  crypto.js
/ui/                        ← separated front-end modules
  tiles.js  detail.js  brief.js  watchlist.js  news.js  take.js
```

### The rule
- **Add / swap a data source →** add or edit one file in `/services/**`.
- **Add a market →** one config file in `/markets/` (hours, symbols, watchlist, source refs).
- **Never** put source-specific logic in the core or UI.

In the mockup, the single-file `MK`, `MOVERS`, `NEWS`, `ADVICE`, `WL` objects are the stand-ins for
these per-market/per-service modules — the build splits them out.

## v1 scope
- Route/normalize/cache with the backbone sources from [01](01-data-sources.md) + [02](02-news-and-sentiment.md).
- UAE prices flagged as an open gap.
- Per-market AI Take + daily Morning Brief from [03](03-ai-advice.md).
- Delayed/EOD data acceptable; aggressive caching.
