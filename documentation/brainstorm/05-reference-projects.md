# 05 — Reference Projects (GitHub)

Open-source projects worth studying before/while building — for architecture, UI, and especially the
hard MENA markets. (Links captured during the brainstorm; check activity/health before adopting.)

## Dashboards — architecture & UI
| Project | Stack | Why study it |
|---------|-------|--------------|
| **[Ghostfolio](https://github.com/ghostfolio/ghostfolio)** ★ | Angular + NestJS + Prisma + Redis | The north star. Self-hosted, **multi-currency normalization** (converts holdings to a base currency — solves our SAR/EGP/USD problem), Redis caching, clean data-provider abstraction. Closest to our normalizer + adapter design done right. |
| **[OpenStock](https://github.com/Open-Dev-Society/OpenStock)** | — | **30+ exchanges**, real-time prices, **alerts**. Reference for multi-exchange routing + the alerts feature. |
| **[peterajhgraham/Real_Time_Stock_Price_Dashboard](https://github.com/peterajhgraham/Real_Time_Stock_Price_Dashboard)** | Python + Streamlit + yfinance | Simplest working prototype template — matches our proposed Yahoo backbone. |
| **[marketcalls/stock-market-dashboard](https://github.com/marketcalls/stock-market-dashboard)** | Python + yfinance | Index-level dashboard (S&P/NASDAQ/Dow candlesticks) — matches the "status at a glance" view. |
| **[xang1234/stock-screener](https://github.com/xang1234/stock-screener)** | Python, multi-source | Proves the **multi-source fallback pattern** across many countries incl. China A-shares. Adapter-design reference. |

## MENA-specific — the hard markets
### KSA / Tadawul
- **[StockerAPI/saudi-stock-market-api](https://github.com/StockerAPI/saudi-stock-market-api)** ★ — real-time Tadawul (WebSocket + OHLCV + snapshot). Purpose-built.
- **[zaakki-ahamed/Saudi_Stock_Web_Scrape](https://github.com/zaakki-ahamed/Saudi_Stock_Web_Scrape)** — Python scraper from the Tadawul site (fallback option).
- **[Hussain-Alsalman/tasi](https://github.com/Hussain-Alsalman/tasi)** — R package for Saudi historical prices + financials.
- **[Logic-gate/TadawulStocks](https://github.com/Logic-gate/TadawulStocks)** — minimal Python Tadawul portfolio manager.
- **[Abdulrahman-S-Asiri/saudi-market-intelligence](https://github.com/Abdulrahman-S-Asiri/saudi-market-intelligence)** — React dashboard + ML for Tadawul (UI reference).

### Egypt / EGX
- **EGXPY / EGXlytics** — "Egypt's first open-source Python API for EGX." Directly solves the Egypt gap.

### China
- **`akshare`** — free, excellent Shanghai/Shenzhen coverage + A-share news (Sina/Eastmoney).

## Sentiment / AI
- **[ProsusAI/finbert](https://github.com/ProsusAI/finbert)** ★ — free FinBERT model for financial-headline
  sentiment. Turns any raw news/RSS feed into a bullish/bearish signal without a paid sentiment API.

## Takeaways
1. **Ghostfolio is the architectural north star** (multi-currency, caching, provider abstraction) —
   even if we build lighter.
2. The **"no single API" problem is fully solvable** by combining purpose-built MENA sources +
   CoinGecko/metals + a normalizer. Four of five equity markets have a solid primary; **UAE prices
   remain the research task**.
3. **FinBERT** removes any hard dependency on paid sentiment APIs.
