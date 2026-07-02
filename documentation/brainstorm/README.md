# Stocks Eye — Brainstorm Documentation

Outcome of the brainstorm discussion (July 2026) for **Stocks Eye**, a multi-market
monitoring dashboard. These documents capture decisions, candidate services, and
architecture — not final specs. Verify free-tier limits before building; they change often.

> **✅ Built (2026-07-02):** a working v1 now exists (Node + vanilla JS). See the root
> [`README.md`](../../README.md) to run it and [`CLAUDE.md`](../../CLAUDE.md) for the codebase map.
> Per-doc "Build status" notes below record what the implementation confirmed or changed.

## The product in one line
A dashboard that shows, at a glance, the **live status, prices, news, and AI advice**
for seven markets — five equity markets plus Gold and Crypto — with a per-market
"AI Take" and a daily roll-up **Morning Brief**.

## Tracked markets
| # | Market | What it is |
|---|--------|-----------|
| 1 | 🇺🇸 USA | NYSE / NASDAQ (S&P 500) |
| 2 | 🇸🇦 KSA | Tadawul (TASI) — trades **Sun–Thu** |
| 3 | 🇦🇪 UAE | DFM / ADX |
| 4 | 🇪🇬 Egypt | EGX (EGX 30) — trades **Sun–Thu** |
| 5 | 🇨🇳 China | Shanghai / Shenzhen (SSE Comp) |
| 6 | 🥇 Gold | Spot XAU/USD — ~24h Mon–Fri |
| 7 | 🪙 Crypto | Top 5 coins (BTC, ETH, BNB, SOL, XRP) — **24/7/365** |

## Index
- [00 — Overview](00-overview.md) — vision, markets, the "market vs. instrument" model
- [01 — Data Sources](01-data-sources.md) — price APIs, routing, the UAE gap, crypto & gold
- [02 — News & Sentiment](02-news-and-sentiment.md) — news sources, FinBERT, not-advice framing
- [03 — AI Advice](03-ai-advice.md) — per-market AI Take + roll-up brief, web search, Opus 4.8
- [04 — Architecture](04-architecture.md) — modular layout, route / normalize / cache
- [05 — Reference Projects](05-reference-projects.md) — GitHub repos worth studying
- [06 — Dashboard Concept](06-dashboard-concept.md) — the live interactive mockup

## Live mockup
A clickable concept dashboard (real clocks, live open/closed logic, sample data for the rest):
`dashboard-mockup.html` in this folder →
https://claude.ai/code/artifact/c384d238-6823-4e85-9667-671dbb57fe25

## Guiding decisions (the short version)
1. **No single free API covers all seven markets** — use a **multi-source** approach:
   route each market to its best source, with a fallback chain.
2. **UAE is the weakest for prices** (flagged as an open research item); it's fine for news.
3. **"Market" = any tracked instrument with a status + price** — exchange *or* commodity *or*
   crypto. Bake this generalization into the data model.
4. **AI output is "news + advice," never guaranteed fact** — always grounded on real numbers,
   cited, timestamped, and labelled *not investment advice*.
5. **Build modular** — one file per service/adapter, separated JS modules. Adding or swapping
   a source touches one file, never the core.
