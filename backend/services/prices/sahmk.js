// SAHMK price adapter — LIVE Tadawul data via the official Saudi market API
// (https://www.sahmk.sa/developers). Plain REST + `X-API-Key` header.
//
// Powers the KSA headline INDEX (market summary) and MOVERS (real top gainers +
// losers — not a hardcoded list). ETFs, news, historical and financials are out of
// scope (unavailable or paywalled on the free tier; see CLAUDE.md). Every call
// returns null/[]/throws on failure so the aggregator falls back to Yahoo, then mock.
// Missing key -> null (the app works without it).

import { makeQuote } from '../../core/normalizer.js';
import { isOpen } from '../../core/marketHours.js';
import { wrap } from '../../core/cache.js';

const BASE = 'https://app.sahmk.sa/api/v1';

// Budget control: the free tier is 100 req/day. We fetch 3 endpoints (summary +
// gainers + losers), so we cache SHORT only while the market is open and LONG when
// it's closed (the data is static then anyway). Worst case ~22 refresh cycles/day
// -> ~66 calls/day, safely under the cap. Do not shorten without a paid plan.
const TTL_OPEN = 15 * 60 * 1000; //  15 min during the trading session
const TTL_CLOSED = 12 * 60 * 60 * 1000; // 12 h when closed

function ttlFor(market) {
  return isOpen(market.schedule) ? TTL_OPEN : TTL_CLOSED;
}

async function get(path, key) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'X-API-Key': key, accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`SAHMK ${res.status}`);
  return res.json();
}

// Headline index quote (TASI / NOMU) from the market-summary endpoint.
export async function fetchQuote(market) {
  const index = market.index?.sahmk; // e.g. 'TASI' — declared in the market config
  const key = process.env.SAHMK_API_KEY;
  if (!index || !key) return null; // not configured -> fall through to Yahoo

  return wrap(`sahmk:summary:${index}`, ttlFor(market), async () => {
    const d = await get(`/market/summary/?index=${encodeURIComponent(index)}`, key);
    const price = Number(d?.index_value);
    if (!Number.isFinite(price)) throw new Error('SAHMK: no index_value');
    const changePct = Number(d?.index_change_percent);
    return makeQuote({
      price,
      changePct: Number.isFinite(changePct) ? changePct : 0,
      spark: [], // the summary endpoint carries no history on the free tier (no sparkline)
      source: 'SAHMK',
      currency: market.currency,
    });
  });
}

// Normalize one gainers/losers/most-active row into a mover: { symbol, name, price, changePct }.
function toMover(r) {
  const price = Number(r?.price);
  const changePct = Number(r?.change_percent);
  if (!Number.isFinite(price)) return null;
  return {
    symbol: String(r?.symbol ?? ''),
    name: r?.name_en || r?.name || String(r?.symbol ?? ''),
    price,
    changePct: Number.isFinite(changePct) ? changePct : 0,
  };
}

// Real movers = top gainers + top losers for the index (2 calls, cached like the
// quote). Returns [] on any failure so the aggregator falls back to Yahoo, then mock.
export async function fetchMovers(market) {
  const index = market.index?.sahmk;
  const key = process.env.SAHMK_API_KEY;
  if (!index || !key) return [];

  return wrap(`sahmk:movers:${index}`, ttlFor(market), async () => {
    const q = `limit=3&index=${encodeURIComponent(index)}`;
    const [gain, lose] = await Promise.all([
      get(`/market/gainers/?${q}`, key),
      get(`/market/losers/?${q}`, key),
    ]);
    const rows = [...(gain?.gainers || []), ...(lose?.losers || [])].map(toMover).filter(Boolean);
    if (!rows.length) throw new Error('SAHMK: no movers');
    return rows;
  }).catch(() => []);
}

export default { fetchQuote, fetchMovers };
