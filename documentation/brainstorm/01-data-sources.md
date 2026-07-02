# 01 — Data Sources (Prices)

> ⚠️ Free-tier limits below reflect the brainstorm snapshot (mid-2026). **Verify current limits
> before building** — they change frequently.

> **✅ Build status (v1):** Implemented **CoinGecko** (crypto, fully live) + **Yahoo** (equities &
> gold) with a **mock fallback**. In practice Yahoo returned live data for USA (`^GSPC`), KSA
> (`^TASI.SR`), Egypt (`^CASE30`), China (`000001.SS`) and Gold (`GC=F`). **UAE (`^DFMGI`) has no
> Yahoo data and falls back to mock at runtime — confirming the gap below.** StockerAPI / EGXPY /
> akshare / metals.dev are documented but not yet wired. See `backend/services/prices/` and
> `backend/markets/`.

## The core problem
There is **no single free, official, well-supported API** that cleanly covers all seven markets.
The US and Crypto are easy; **KSA, UAE, and Egypt** are where "global" free APIs quietly fall short.
The answer is a **multi-source** approach — route each market to its best source.

## Coverage by market (ticker conventions)
| Market | Exchange | Yahoo suffix | Notes |
|--------|----------|--------------|-------|
| USA | NYSE / NASDAQ | (none) | Everyone covers it |
| KSA | Tadawul | `.SR` (e.g. `2222.SR` = Aramco) | Yahoo works; most free APIs don't |
| UAE | DFM / ADX | mixed / spotty | **Weakest coverage of all** |
| Egypt | EGX | `.CA` (e.g. `COMI.CA`) | Yahoo works; delayed |
| China | Shanghai / Shenzhen | `.SS` / `.SZ` | Yahoo works; `akshare` excellent |
| Gold | Spot XAU/USD | `GC=F` / `XAUUSD=X` | Commodity, not an exchange |
| Crypto | BTC/ETH/BNB/SOL/XRP | — | CoinGecko is the standard free source |

## Candidate services

### Cross-market / general
| Service | Free tier (verify) | Notes |
|---------|-------------------|-------|
| **Yahoo Finance** via `yfinance` | Free, no key, unofficial | Widest coverage (4/5 equity markets + gold), huge community. Fragile/ToS-gray — best as a **fallback**, not the primary. |
| **Twelve Data** | ~800 req/day | Clean API; some international; real-time often paid. |
| **Finnhub** | 60 req/min | Great US company + market data; weak on emerging markets on free tier. |
| **Marketstack** | ~100 req/month, EOD only | Real exchange coverage; tiny cap. |
| **EODHD** | Very limited free | Broad coverage incl. Tadawul/EGX, but really a paid product. |
| **Alpha Vantage** | 25 req/day | Strong US; also News & Sentiment (see doc 02). |

### Market-specific (the real value)
Dedicated sources exist for exactly the markets that broke the "global API" plan:
- **KSA / Tadawul**
  - [StockerAPI/saudi-stock-market-api](https://github.com/StockerAPI/saudi-stock-market-api) — real-time Tadawul (WebSocket + OHLCV + snapshot). Purpose-built.
  - [zaakki-ahamed/Saudi_Stock_Web_Scrape](https://github.com/zaakki-ahamed/Saudi_Stock_Web_Scrape) — Python scraper from the Tadawul site (fallback).
- **Egypt / EGX**
  - **EGXPY / EGXlytics** — "Egypt's first open-source Python API for EGX." Directly solves the Egypt gap.
- **China**
  - `akshare` — free, excellent Shanghai/Shenzhen coverage, native to the A-share market. Also pulls news.
- **Gold**
  - `metals.dev` / `metals-API` (free tiers) or Yahoo `XAUUSD=X` / `GC=F`.
- **Crypto**
  - **CoinGecko** — free, no key, excellent coverage; standard choice. (Binance API is an alternative.)

## The UAE gap (open research item)
No strong free **price** API surfaced for DFM/ADX. Options, none ideal:
- Yahoo (spotty), a scraper, or a paid provider.
- **Note:** UAE is well covered on the **news** axis (Arabian Business, Zawya) — so the market can
  feel "covered" for news even while price data is the gap. Revisit before/at build time.

## Routing plan (price backbone)
```
USA    → Finnhub / Twelve Data   → Yahoo (fallback)
KSA    → StockerAPI (Tadawul)    → Saudi scraper → Yahoo
Egypt  → EGXPY                   → Yahoo
China  → akshare                 → Yahoo
Gold   → metals.dev / Yahoo XAUUSD
Crypto → CoinGecko               → Binance (fallback)
UAE    → Yahoo (spotty)          → [OPEN GAP — needs a better source]
```
Each market has a **primary + fallback chain**, so an unofficial source (Yahoo) failing means
failover, not a blackout.

## Cross-cutting concerns
- **Currency** — SAR, EGP, AED, CNY, USD. Normalize to a display currency (USD) with an FX source;
  keep native value + converted value side by side. See [04 — Architecture](04-architecture.md).
- **Freshness** — tag every value with `source` + `as_of` timestamp; don't compare live to stale.
- **Caching** — mandatory to stay under free caps (e.g. quotes cached 1–15 min; crypto shorter).
- **Trading hours / status** — computed per-market from schedule + timezone, independent of the
  price source. Crypto is `always: true`.

## Recommended v1 backbone
Start narrow: **Finnhub (US) + akshare (China) + CoinGecko (crypto) + EGXPY (Egypt) +
StockerAPI (KSA) + metals/Yahoo (gold)**, with **Yahoo as universal fallback** and **UAE flagged**.
Build the normalizer + adapter pattern from day one so sources are swappable.
