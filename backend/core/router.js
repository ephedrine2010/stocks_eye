// Routes each market to its price source, with a fallback chain.
// Add or swap a source by editing the adapter map here + the market config —
// never anywhere else in the app.

import * as coingecko from '../services/prices/coingecko.js';
import * as yahoo from '../services/prices/yahoo.js';
import * as sahmk from '../services/prices/sahmk.js';
import * as mock from '../services/prices/mock.js';

// market.priceSource -> ordered list of adapters to try.
const CHAINS = {
  coingecko: [coingecko, yahoo, mock],
  yahoo: [yahoo, mock],
  sahmk: [sahmk, yahoo, mock], // KSA index: official API -> Yahoo (^TASI.SR) -> mock
  mock: [mock],
};

// Returns a normalized Quote for the market, trying each adapter until one succeeds.
export async function getQuote(market) {
  const chain = CHAINS[market.priceSource] || CHAINS.mock;
  for (const adapter of chain) {
    try {
      const quote = await adapter.fetchQuote(market);
      if (quote && Number.isFinite(quote.price)) return quote;
    } catch {
      // try next source in the chain
    }
  }
  // Guaranteed fallback so a market never renders empty.
  return mock.fetchQuote(market);
}

export default { getQuote };
