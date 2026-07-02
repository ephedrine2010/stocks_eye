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
