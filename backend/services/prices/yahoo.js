// Yahoo Finance price adapter — LIVE, no API key (unofficial public endpoint).
// Covers the equity indices + gold. Returns null on any failure so the router
// falls back to the next source (ultimately mock), never a blank tile.

import { makeQuote } from '../../core/normalizer.js';
import { wrap } from '../../core/cache.js';

const BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

function downsample(arr, n = 14) {
  const clean = (arr || []).filter((x) => x != null);
  if (clean.length <= n) return clean;
  const step = clean.length / n;
  return Array.from({ length: n }, (_, i) => clean[Math.floor(i * step)]);
}

export async function fetchQuote(market) {
  const symbol = market.index?.symbol;
  if (!symbol || market.coins) return null; // crypto handled by CoinGecko
  const key = `yahoo:${symbol}`;
  return wrap(key, 60_000, async () => {
    const url = `${BASE}/${encodeURIComponent(symbol)}?range=1mo&interval=1d`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`Yahoo ${res.status}`);
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    const meta = result?.meta;
    const price = meta?.regularMarketPrice;
    if (!Number.isFinite(price)) throw new Error('Yahoo: no price');
    const closes = result?.indicators?.quote?.[0]?.close || [];
    // Daily change: prefer the explicit prior-day close, else the second-to-last
    // close in the series (chartPreviousClose is range-relative, not daily).
    const clean = closes.filter((x) => x != null);
    const prevDay = clean.length >= 2 ? clean[clean.length - 2] : undefined;
    const prev = Number.isFinite(meta?.previousClose) ? meta.previousClose
      : (prevDay ?? meta?.chartPreviousClose);
    if (!Number.isFinite(prev)) throw new Error('Yahoo: no previous close');
    return makeQuote({
      price,
      changePct: prev ? ((price - prev) / prev) * 100 : 0,
      spark: downsample(closes),
      source: 'Yahoo',
      currency: market.currency,
    });
  });
}

export default { fetchQuote };
