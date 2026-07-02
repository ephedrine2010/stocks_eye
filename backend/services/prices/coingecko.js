// CoinGecko price adapter — LIVE, no API key required.
// Powers the Crypto market (top 5 coins). https://www.coingecko.com/en/api

import { makeQuote } from '../../core/normalizer.js';
import { wrap } from '../../core/cache.js';

const BASE = 'https://api.coingecko.com/api/v3';

// Fetch the raw /coins/markets payload for a set of CoinGecko ids (cached 60s).
async function marketsData(ids) {
  const key = `coingecko:${ids.join(',')}`;
  return wrap(key, 60_000, async () => {
    const url = `${BASE}/coins/markets?vs_currency=usd&ids=${ids.join(',')}`
      + '&order=market_cap_desc&price_change_percentage=24h&sparkline=true';
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    return res.json();
  });
}

function downsample(arr, n = 14) {
  if (!Array.isArray(arr) || arr.length <= n) return arr || [];
  const step = arr.length / n;
  return Array.from({ length: n }, (_, i) => arr[Math.floor(i * step)]);
}

// Headline quote (e.g. BTC/USD) for the market.
export async function fetchQuote(market) {
  if (!market.coins) return null; // only crypto uses this adapter
  const ids = market.coins.map((c) => c.id);
  const data = await marketsData(ids);
  const head = data.find((d) => d.id === market.index.symbol) || data[0];
  if (!head) return null;
  return makeQuote({
    price: head.current_price,
    changePct: head.price_change_percentage_24h ?? 0,
    spark: downsample(head.sparkline_in_7d?.price || []),
    source: 'CoinGecko',
    currency: 'USD',
  });
}

// All coins as movers/watch rows: [{ symbol, name, changePct, price }].
export async function fetchCoins(market) {
  const ids = market.coins.map((c) => c.id);
  const data = await marketsData(ids);
  const bySymbol = new Map(market.coins.map((c) => [c.id, c]));
  return data.map((d) => ({
    symbol: bySymbol.get(d.id)?.symbol || d.symbol.toUpperCase(),
    name: d.name,
    changePct: d.price_change_percentage_24h ?? 0,
    price: d.current_price,
  }));
}

export default { fetchQuote, fetchCoins };
