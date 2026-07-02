// Mock price adapter — the guaranteed final fallback. Uses each market's `mock`
// baseline so the dashboard always renders, even fully offline.

import { makeQuote } from '../../core/normalizer.js';

export async function fetchQuote(market) {
  const m = market.mock || { price: 0, changePct: 0, spark: [] };
  return makeQuote({
    price: m.price,
    changePct: m.changePct,
    spark: m.spark,
    source: 'mock (sample)',
    currency: market.currency,
  });
}

export default { fetchQuote };
