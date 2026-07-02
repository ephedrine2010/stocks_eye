# 03 — AI Advice Layer

The feature that makes Stocks Eye feel intelligent: an AI agent that reads the market data,
**checks the internet**, and produces short, grounded, cited guidance — as a **per-market "AI Take"**
plus a daily **Morning Brief** roll-up.

> **✅ Build status (v1):** Both the per-market Take and the roll-up Brief are wired in
> `backend/services/ai/index.js` — **one call per market** as designed. Default output is grounded
> **mock** text; setting `ANTHROPIC_API_KEY` (+ `npm i @anthropic-ai/sdk`) switches to real Claude
> (`claude-opus-4-8`) with the web-search tool. Any AI failure falls back to mock so the app never
> breaks on the AI layer. Verify the current model id + web-search tool version before relying on it.

## Two tiers of AI output
1. **Per-market "AI Take"** (primary) — each market gets its **own** advice block in its detail card:
   a sentiment tag + 1–2 sentences focused on that market + its own citations.
   *One AI call per market* (see "Why per-market" below).
2. **Morning Brief** (roll-up) — one daily card at the top of the dashboard summarizing all markets:
   a lead paragraph, a one-liner per market, a single cross-market "hint," citations, timestamp.

## Key realization: don't build the "internet-checking" part
Claude has a **server-side web search tool** (`web_search_20260209`). You declare it and Claude runs
its own searches on Anthropic's infrastructure, reads results, and cites them — **no scraping code**
on your side. The whole feature collapses into essentially one scheduled API call per market.

## Grounding rule (the #1 safety measure)
**Feed the model your data; don't make it fetch your data.**
Pass a **structured snapshot** (prices, % change, top movers, headlines, sentiment — from docs 01/02)
so the numbers are correct, and let web search fill in **why** (overnight macro, Fed, oil, breaking
news). System-prompt rule:
> *"Use only the provided numbers for prices/levels; use web search only for context and news.
> Never invent figures."*
This prevents hallucinated prices — the biggest risk in a finance assistant.

## Recommended architecture
```
Daily cron (per user timezone, pre-market)
  For each market:
    1. Assemble structured snapshot  { name, index, change%, status,
                                       top_movers[], headlines[], sentiment }
    2. One Claude call:
         model:  claude-opus-4-8
         tools:  [ web_search_20260209 ]     ← live internet, cited
         thinking: adaptive,  effort: high
         system: role + rules + not-advice + output shape   (prompt-cached)
         user:   the snapshot + "write today's take for <market>"
    3. Claude searches the web to fill gaps → returns sentiment + advice + citations
  Then: one more call over all snapshots → the roll-up Morning Brief
  Deliver → in-app card / push / email
```

## Why per-market (separated advice)
Splitting into one call per market (rather than one giant call) is **better**, not just a UI choice:
- **Smaller prompts** → cheaper, faster, higher quality per market.
- **Isolated failures** — if one source/market fails, the others still produce a take.
- **Independent caching & refresh** — refresh one market without redoing all seven.
- **Cleaner citations** — each take cites its own market's sources.

## Model & settings
- **`claude-opus-4-8`** — most capable; runs **once per user per day**, so cost is trivial
  (cents/day with web search). `thinking: {type: "adaptive"}`, `output_config: {effort: "high"}`.
- Cheaper at scale (thousands of users): **`claude-sonnet-5`** is near-Opus on this task — but start
  on Opus and only downgrade if the bill demands it.
- **Prompt-cache the static system prompt** (role, rules, output shape); only the per-market snapshot
  is uncached.

## Two implementation levels
1. **Single enriched call per market (recommended for v1)** — a plain `messages.create` with the web
   search tool, triggered by your own cron. Simple and cheap.
2. **Scheduled agent (hands-off, later)** — Claude **Managed Agents** support **scheduled deployments**
   (cron-fired sessions, e.g. weekdays 06:00). Anthropic runs the loop; you read the result. More
   moving parts — reach for it only when you want no scheduler of your own.

## Guardrails (same not-advice framing as news)
- **Output contract:** per-market sentiment + 1–2 sentence take + citations; roll-up adds one hint.
  Use structured output so cards render cleanly.
- **"Informational, not investment advice"** in the system prompt **and** on every card.
- **Timestamp + "as of"** on every take/brief — markets and searches are time-sensitive.
- **Timezone-aware "morning"** — fire per the user's timezone, ideally pre-open for their primary
  market (Tadawul/EGX mornings differ from NYSE; crypto is always live).
- **Require web citations** for any external claim; never present generated numbers as fact.

## Output shape (normalized)
```
AI Take   →  { market, sentiment, text, citations[], as_of }
Brief     →  { lead, lines: [{market, sentiment, text}], hint, citations[], as_of }
```

## Reference
Claude API details (model IDs, web search tool version, adaptive thinking, prompt caching, scheduled
deployments) are documented in the `claude-api` skill used during the brainstorm. Verify the current
web-search tool version and model IDs at build time.
