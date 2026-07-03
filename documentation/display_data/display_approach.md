# Single-Market View — What to Display & How

Working notes (July 2026) on the **single-market detail view** (KSA used as the worked example).
Captures the discussion, not a final spec. The driving problem: we have many sources and lots of
data, and the page gets **distracted** — so this doc is about *deciding what earns a place* and
how to fill it with data we actually have live.

## The core principle
**Match the display to the data we can fill for real.** Don't add a tile because a "perfect"
market page has it — add it only if a live source can populate it today. Missing-source fields
(P/E, market cap, 52-week range, sector indices) are **hidden entirely**, not mocked. Hiding is
the antidote to the distraction.

## Decisions locked so far
| Question | Decision |
|---|---|
| Data with no live source (P/E, 52-wk range, KSA news) | **Hide entirely** — no empty/mock tiles |
| Primary device / layout | **Desktop dashboard** (wide, multi-column) |
| Ticker discovery for stock lists | **Research once → hardcode in market config.** No live AI/scraping per load |
| Current step | Discussion + this doc; no code or mockup committed yet |

## What KSA can fill *live* today
| Element | Live? | Source |
|---|---|---|
| TASI level + **daily** change % | ✅ | Yahoo `^TASI.SR` |
| Open/closed + local clock + next open/close | ✅ | `core/marketHours.js` |
| Movers (biggest % moves today) | ✅ | Yahoo close-to-close (`yahoo.fetchMovers`) |
| Leading/heavyweight stocks | ✅ (once list is in config) | Yahoo `.SR` tickers |
| 1M price chart | ⚠️ have the data, not rendered | Yahoo daily series we already fetch for the change calc, then discard |
| News + sentiment | ❌ for KSA | mock only (outlets 403) → **hidden** under the hide rule |
| AI Take | ❌ live path | mock → hidden/badged (open question below) |

## Proposed layout (desktop, live-only)
```
┌────────────────────────────────────────────────────────────┐
│  🇸🇦  TASI  11,033.64   ▲ +42.10 (+0.38%)      ● OPEN       │
│      Tadawul All Share · SAR · as of 14:32 AST   closes 15:00│
├────────────────────────────────────────────────────────────┤
│                                                              │
│   [ 1M price chart — from the Yahoo daily series ]           │
│                                                              │
├──────────────────────────────┬─────────────────────────────┤
│  LEADING STOCKS              │  MOVERS (prev close)         │
│  Aramco   ...                │  ▲ top gainers               │
│  Al Rajhi ...                │  ▼ top losers                │
│  SABIC / STC / SNB ...       │                              │
└──────────────────────────────┴─────────────────────────────┘
```

## The two stock lists — one ticker set, two views
The key insight: **"leading stocks" and "movers" are two views of the same curated ticker list,
not two data sources.**

- **Leading (heavyweight) stocks** — the biggest names that *drive* the index. Ranked by
  size/weight. Slow to change. Shown always, so the user sees the bellwethers.
- **Movers** — whatever moved most *today*. Ranked by % change. Changes every session.

Both come from one curated list per market (Yahoo fills prices live via `yahoo.fetchMovers`).
Implementation-wise: a second curated list in the market config, or a `heavyweight`/`weight` flag
on the existing `movers` list.

### Why NOT use live AI to fetch tickers
Asking a model to "search and return the ticker codes" on each load is the wrong pattern here:
- **Hallucination** — models invent plausible-but-wrong tickers.
- **Cost** — burns billable calls every load, against the project's cost rule.
- **Pointless churn** — index composition barely changes month to month.

Instead: **research the list ONCE, paste it into the market config.** It slots into the modularity
rule (one file edit) and costs nothing at runtime.

### KSA leading list (researched 2026-07, ready to paste)
Every name is already a Yahoo `.SR` ticker:

| Company | Sector | Yahoo ticker |
|---|---|---|
| Saudi Aramco | Energy | `2222.SR` |
| Al Rajhi Bank | Banks | `1120.SR` |
| Saudi National Bank | Banks | `1180.SR` |
| SABIC | Materials | `2010.SR` |
| Ma'aden | Materials | `1211.SR` |
| STC | Telecom | `7010.SR` |
| Riyad Bank | Banks | `1010.SR` |
| Alinma Bank | Banks | `1150.SR` |

Sources: [Argaam](https://www.argaam.com/en), [Wikipedia — TASI](https://en.wikipedia.org/wiki/Tadawul_All-Share_Index),
[Arab News](https://www.arabnews.com/node/2637339/business-economy).

## "Follow what you want" — user-selectable watchlist
Requested feature: let the user pick tickers to follow, e.g. via a dialog. Fits the existing
`watchlist[]` payload + `frontend/js/ui/watchlist.js` (mock-fed today). Scoping notes:
- **Persistence:** no accounts/backend user store → lives in **`localStorage`** (per-browser,
  not device-synced).
- **What can they pick?** Start with **pick-from-curated** (safe, validated) rather than free-form
  Yahoo tickers (need validation, will occasionally 404).
- **Scope:** "follow" is really a **global, cross-market** feature, not part of the single-market
  view — treat it as a **separate, later** piece of work so it doesn't blur the KSA-page redesign.

## Open questions
1. **Strict vs. softer mock rule.** Applied literally, "hide mock" strips KSA's news *and* AI Take,
   leaving header + chart + leading + movers — clean but thinner than USA (which has live news).
   Strict per-market unevenness vs. a consistent skeleton with honest "no live source yet" states?
2. **Chart scope.** Ship **1M-only** from data we already fetch (cheap), or invest in intraday +
   range toggles (needs a finer Yahoo range = new fetch/cache cost)?
3. **Rollout.** Curate heavyweight lists for **all 7 markets** now, or **prototype KSA**
   end-to-end first and roll out once the layout is liked?
4. **AI Take badging.** If kept, badge it as sample, or hide until a live path exists?

## Recommended next steps (proposed, not committed)
1. Prototype **KSA** single-market view end-to-end: header + 1M chart + leading + movers, all live.
2. Render the 1M chart from the **daily series we already fetch** (no new source).
3. Add leading list to the KSA config (table above); reuse `yahoo.fetchMovers`.
4. Once liked, curate heavyweight lists for the other 6 markets.
5. **Later, separately:** the user-selectable follow list (localStorage + picker dialog).

---

## Addendum (2026-07-03): dividends + news-source decisions

### ✅ Implemented — leading stocks + dividends (USA + KSA)
Prototype shipped for **USA and KSA**: the detail view now renders a **Leading stocks** table
(header → 1M chart → **leading** → take/movers/news) with a live **dividend yield** column.
- Backend: `leaders` list in each config; `yahoo.fetchLeaders` prices close-to-close AND attaches
  `{ yield, annual, exDate, frequency }` from one `range=2y&events=div` fetch; aggregator exposes
  `leaders[]` (empty → section omitted for the other 5 markets).
- Frontend: `leadersBlock` in `ui/detail.js` + `.leaders`/`.ld` CSS. Non-payers (Ma'aden, AMZN)
  show a muted "—", not a fake 0%. News + AI-Take rendering left untouched (open question 1 unresolved).
- Verified live 8/8 for both markets (Aramco 5.1%, SABIC 5.7%, JPM 1.8%, XOM 3.0%, …).
- Not yet done: 1M chart is still the index sparkline we already had; heavyweight lists for the
  other 5 markets; the currency-normalization sub-decision (native vs USD) — kept **native** for now.



### Dividends — LIVE for all 5 equity markets (verified)
Dividends earn a place under the "match display to live data" rule: they come from the
**same no-key Yahoo endpoint we already call** for the change/chart — just add `&events=div`:
```
https://query2.finance.yahoo.com/v8/finance/chart/{ticker}?range=2y&interval=1d&events=div
```
Each event = **ex-dividend date (Unix ts) + per-share amount in the listing currency**. Verified
live for real config tickers in every equity market:

| Market | Dividends? | Currency | Notes |
|---|---|---|---|
| USA | ✅ | USD | quarterly |
| KSA | ✅ | SAR | `2222.SR`, `1120.SR` etc. |
| China | ✅ | CNY | `.SS` / `.SZ` — mostly annual + interim |
| Egypt | ✅ | EGP | `.CA` |
| UAE | ✅ | AED | `.AE` movers carry dividends **even though `^DFMGI` index is mock** |
| Gold | ⚠️ | — | commodity/ETF (GLD) pays nothing; miner stocks do — depends on movers list |
| Crypto | ❌ | — | CoinGecko, no dividends (staking yield is a different concept, out of scope) |

Derivable fields: **yield % (TTM dividends ÷ price — currency-neutral), annual dividend,
last/ex-date, frequency (from event spacing), history (bar chart)**. Implementation: a single
`fetchDividends(ticker)` in `services/prices/yahoo.js`, riding along the chart fetch (near-free,
one file). Non-payers / Crypto → **hide the field** per the core rule. Open sub-decision: show the
per-share amount in **native currency** (simplest, matches showing TASI in SAR) or normalize to USD
via `core/currency.js` — leading with **yield %** sidesteps this for the headline number.

### News sourcing — Telegram/Twitter PARKED
- **Twitter/X:** rejected — reading now needs the paid API (~$100/mo), clashes with the zero-cost,
  no-key design.
- **Telegram:** viable + free in principle (a GramJS user-client can read public channels → a
  `services/news/telegram.js` adapter). **Parked for now** — target channels are image-heavy and
  would force OCR/vision work (DeepSeek has no vision) out of proportion to the payoff. **Waiting for
  a clean text-first source.** KSA/UAE news stays mock → hidden until then.
