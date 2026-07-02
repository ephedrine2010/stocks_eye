// Yahoo Finance price adapter — LIVE, no API key (unofficial public endpoint).
// Covers the equity indices + gold headline quotes, plus individual-ticker pricing
// for per-market movers. Returns null/throws on failure so the router falls back
// to the next source (ultimately mock), never a blank tile.

import { makeQuote } from '../../core/normalizer.js';
import { wrap } from '../../core/cache.js';

const BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';
const UA = 'Mozilla/5.0';

function downsample(arr, n = 14) {
  const clean = (arr || []).filter((x) => x != null);
  if (clean.length <= n) return clean;
  const step = clean.length / n;
  return Array.from({ length: n }, (_, i) => clean[Math.floor(i * step)]);
}

// Fetch + parse one symbol's chart into { price, changePct, closes }.
// Daily change uses the prior-day close, not chartPreviousClose (which is
// range-relative — see CLAUDE.md). Shared by the index quote and movers.
async function fetchChart(symbol, range) {
  const url = `${BASE}/${encodeURIComponent(symbol)}?range=${range}&interval=1d`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Yahoo ${res.status}`);
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  const meta = result?.meta;
  const price = meta?.regularMarketPrice;
  if (!Number.isFinite(price)) throw new Error('Yahoo: no price');
  const closes = (result?.indicators?.quote?.[0]?.close || []).filter((x) => x != null);
  const prevDay = closes.length >= 2 ? closes[closes.length - 2] : undefined;
  const prev = Number.isFinite(meta?.previousClose) ? meta.previousClose
    : (prevDay ?? meta?.chartPreviousClose);
  if (!Number.isFinite(prev)) throw new Error('Yahoo: no previous close');
  return { price, changePct: prev ? ((price - prev) / prev) * 100 : 0, closes };
}

export async function fetchQuote(market) {
  const symbol = market.index?.symbol;
  if (!symbol || market.coins) return null; // crypto handled by CoinGecko
  return wrap(`yahoo:${symbol}`, 60_000, async () => {
    const { price, changePct, closes } = await fetchChart(symbol, '1mo');
    return makeQuote({
      price,
      changePct,
      spark: downsample(closes),
      source: 'Yahoo',
      currency: market.currency,
    });
  });
}

// Live movers for a market from its curated `movers` list ({ symbol, name, y? }).
// Each ticker is priced individually (cached 60s) and tolerant of failure — a bad
// symbol is skipped rather than blanking the row. Returns [] if none resolve, so
// the aggregator can fall back to mock.
export async function fetchMovers(market) {
  const list = market.movers || [];
  if (!list.length) return [];
  const rows = await Promise.all(list.map((m) =>
    wrap(`yahoo:t:${m.y || m.symbol}`, 60_000, async () => {
      // Close-to-close from the daily series keeps price and change on the SAME
      // scale. Yahoo's live regularMarketPrice is unreliable for some EGX (.CA)
      // tickers — it differs from the historical closes and would fabricate a
      // huge fake daily move if mixed with them.
      const { closes } = await fetchChart(m.y || m.symbol, '5d');
      if (closes.length < 2) throw new Error('Yahoo: not enough closes');
      const price = closes[closes.length - 1];
      const prev = closes[closes.length - 2];
      return { symbol: m.symbol, name: m.name, price, changePct: prev ? ((price - prev) / prev) * 100 : 0 };
    }).catch(() => null)));
  return rows.filter(Boolean);
}

export default { fetchQuote, fetchMovers };
