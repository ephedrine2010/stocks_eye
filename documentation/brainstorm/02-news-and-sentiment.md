# 02 — News & Sentiment

> ⚠️ Free-tier limits reflect the mid-2026 snapshot. **Verify before building.**

> **✅ Build status (v1):** A lightweight RSS reader is implemented (`backend/services/news/`) with a
> mock fallback, so every market always shows headlines. Feeds wired: USA=CNBC, Crypto=CoinDesk,
> Gold=Kitco (others use mock). **RSS items currently default to neutral sentiment — FinBERT is not
> yet wired** (the planned way to score any raw feed). Marketaux / Mubasher / Argaam remain TODO.

Goal: under each market, show a few **recent headlines** with a **sentiment signal**
(bullish / bearish / neutral) and a source label. Good news: sentiment/news coverage for the hard
markets (KSA, Egypt, MENA) is **better** than price coverage.

## Framing: "news," not "advice"
For a public-facing app, display **news + a sentiment indicator**, never presented as buy/sell
guidance. The feature reads as: *headlines + a tone marker + a disclaimer.* This framing is baked
into the UI (a "not investment advice" line). The AI layer ([03](03-ai-advice.md)) follows the same rule.

## Cross-market news + sentiment APIs
| Service | Free tier (verify) | Sentiment? | Notes |
|---------|-------------------|-----------|-------|
| **Marketaux** ★ | ~100 req/day, 3 articles/req | ✅ per-entity | **Standout for this project** — entity extraction, 80+ markets, **explicitly covers Saudi (TADAWUL, ~248 entities), Egypt, MENA** by country/exchange. |
| **Alpha Vantage News & Sentiment** | 25 req/day | ✅ AI scores | Best per-ticker bullish/bearish scoring; very low cap — cache hard. |
| **Finnhub** | 60 req/min | ⚠️ company news yes; social gated | Good US company + general market news. |
| **NewsData.io / GNews / NewsAPI** | free tiers | ❌ raw | General news incl. Egypt/Gulf by country; pair with own sentiment model. |

## MENA-specific (where the value is)
Often the best MENA source is a plain **RSS feed** — free, unlimited, no key, no cap:
- **[Mubasher Info](https://english.mubasher.info/)** — MENA's biggest Arabic equity-news platform; RSS (EN + AR). Covers KSA, UAE, Egypt.
- **[Argaam](https://www.argaam.com/en)** — the Saudi/TASI news authority (EN + AR).
- **[Zawya](https://www.zawya.com/)** (LSEG) & **[Arabian Business](https://www.arabianbusiness.com/)** — Gulf/UAE + North Africa; RSS available.
- **Marketaux** `country/sa`, `country/eg`, `exchange/TADAWUL` — structured MENA news via API.

> **UAE is less of a problem for news** than for prices — Gulf business press covers DFM/ADX well.

## China & Gold & Crypto
- **China** — `akshare` pulls A-share news from Sina/Eastmoney for free (already in the price stack).
- **Gold** — Marketaux (commodities/XAU), Kitco / Investing.com RSS, or Alpha Vantage `topics=financial_markets`. Gold news is macro (Fed, inflation, USD).
- **Crypto** — CoinDesk / The Block / Cointelegraph RSS; CoinGecko also surfaces some. Plentiful and free.

## GitHub repos worth pulling in
- **[ProsusAI/finbert](https://github.com/ProsusAI/finbert)** ★ — free FinBERT model that scores
  financial-headline sentiment. Turns **any** raw RSS/news feed into a bullish/bearish signal, so you
  are **not dependent on a paid sentiment API**. This is the key one.
- `akshare` news modules and stocksera-style aggregators — adapter references.

## Routing plan (news + sentiment)
```
USA    → Finnhub news / Alpha Vantage sentiment
China  → akshare news (Sina/Eastmoney)
KSA    → Marketaux (TADAWUL) + Argaam RSS
Egypt  → Marketaux (country/eg) + Mubasher RSS
UAE    → Arabian Business / Zawya RSS      ← news covers the price gap
Gold   → Marketaux (commodities) / Kitco RSS
Crypto → CoinDesk / The Block / Cointelegraph RSS
        + FinBERT to tag sentiment on any raw feed
```

## Data model (one normalized shape)
Every source normalizes to:
```
{ market, headline, url, source, published_at, sentiment }   // sentiment ∈ bull|bear|neut
```
If a source doesn't provide sentiment, **FinBERT generates it** from the headline — so the UI shape
is constant regardless of source.

## Design decisions captured
1. **Sentiment is a first-class field**; FinBERT is the fallback generator.
2. **News decouples from price coverage** — a market can be strong on news but weak on prices (UAE).
3. **Cache aggressively** — news changes slowly; free caps are tight (refresh per market ~15–30 min).
4. **Distinct-shape markers** (▲ ▼ ●) so sentiment isn't color-only; always paired with a source label.
5. **Not investment advice** disclaimer under the news strip.
