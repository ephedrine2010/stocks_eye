# 00 — Overview

## Vision
**Stocks Eye** is a personal/hobby-grade dashboard that answers, at a glance:
> *For the markets I care about — what's open right now, how are they moving, what's the news,
> and what should I keep an eye on today?*

It spans seven markets across very different timezones and trading weeks, unifies them into
one consistent view, and layers **news + per-market AI advice** on top.

## The seven tracked markets
| Market | Exchange / instrument | Index / headline | Trading week | Currency |
|--------|----------------------|------------------|--------------|----------|
| 🇺🇸 USA | NYSE / NASDAQ | S&P 500 | Mon–Fri | USD |
| 🇸🇦 KSA | Tadawul | TASI | **Sun–Thu** | SAR |
| 🇦🇪 UAE | DFM / ADX | DFM GI | Mon–Fri | AED |
| 🇪🇬 Egypt | EGX | EGX 30 | **Sun–Thu** | EGP |
| 🇨🇳 China | Shanghai / Shenzhen | SSE Comp | Mon–Fri (midday break) | CNY |
| 🥇 Gold | Spot XAU/USD | XAU/USD /oz | ~24h Mon–Fri | USD |
| 🪙 Crypto | Top 5 coins | BTC/USD (+ ETH, BNB, SOL, XRP) | **24/7/365** | USD |

## The killer feature: "which markets are open right now?"
Because the markets run on **different timezones AND different trading weeks**, the single most
valuable thing the dashboard shows is live open/closed status:
- **Tadawul (KSA) and EGX (Egypt) trade Sun–Thu** — their weekend is Fri–Sat.
- USA, China, UAE trade Mon–Fri. China has a **midday lunch break** (11:30–13:00 local).
- **Gold** trades roughly 24h Mon–Fri.
- **Crypto never closes** — 24/7/365.

The mockup computes this live from the device clock, per market, updating every second. No generic
"global markets" dashboard nails the Sun–Thu weeks and the always-on crypto case together — this is
the differentiator.

## Core data-model decision: "market vs. instrument"
Adding Gold and Crypto forced a useful realization:

> A **"market"** in Stocks Eye is **any tracked instrument that has a status and a price** —
> it does not have to be a stock exchange.

So the internal model treats an exchange, a commodity, and a crypto basket uniformly. Each "market"
carries its own:
- **schedule** (trading days + session windows, or `always: true` for crypto)
- **timezone**
- **price source + fallback chain**
- **news source**
- **watchlist** (suggested symbols/coins to follow)

This makes the system open-ended: adding FX, oil, or an 8th equity market later is just another
config entry — no structural change. See [04 — Architecture](04-architecture.md).

## What "market status" means here (scope)
For v1, "status" = **index/headline level + % change + open/closed + local time**, plus a small
**watchlist** of suggested symbols per market. Full per-stock depth (order books, fundamentals) is
out of scope for v1. Data freshness target is **delayed or end-of-day** — free tiers almost never
provide real-time for the emerging/Gulf markets, and that's an accepted constraint.

## Non-goals / accepted constraints
- **Not real-time** for most markets (15-min delayed or EOD is the realistic bar on free tiers).
- **Not financial advice** — the AI layer produces news + informational "takes," always disclaimed.
- **UAE prices are a known gap** — no strong free price API surfaced (news coverage is fine).
- Hobby-scale usage; aggressive **caching** keeps us under free request caps.

## Related documents
- Data sources & routing → [01](01-data-sources.md)
- News & sentiment → [02](02-news-and-sentiment.md)
- AI advice layer → [03](03-ai-advice.md)
- Architecture → [04](04-architecture.md)
- Reference projects → [05](05-reference-projects.md)
- Dashboard concept → [06](06-dashboard-concept.md)
