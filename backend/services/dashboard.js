// Aggregator — composes the normalized pieces (prices, movers, news, AI) into the
// payload the frontend renders. This is the only place that stitches sources
// together; each source stays isolated in its own adapter.

import { markets as MARKETS } from '../markets/index.js';
import { getQuote } from '../core/router.js';
import { isOpen } from '../core/marketHours.js';
import { getNews } from './news/index.js';
import { getTake, getBrief } from './ai/index.js';
import * as coingecko from './prices/coingecko.js';
import * as yahoo from './prices/yahoo.js';
import * as sahmk from './prices/sahmk.js';
import { MOVERS, WATCHLIST } from './mock/marketData.js';

function mockMovers(id) {
  return (MOVERS[id] || []).map(([symbol, name, changePct]) => ({ symbol, name, changePct }));
}

async function getMovers(market) {
  if (market.coins) {
    try { return await coingecko.fetchCoins(market); }
    catch { return mockMovers(market.id); }
  }
  // Real top gainers/losers where a market opts in (KSA) — falls through to the
  // curated Yahoo list, then mock, if SAHMK is unavailable or over quota.
  if (market.moversSource === 'sahmk') {
    const live = await sahmk.fetchMovers(market);
    if (live.length) return live;
  }
  if (market.movers?.length) {
    try {
      const live = await yahoo.fetchMovers(market);
      if (live.length) return live;
    } catch { /* fall through to mock */ }
  }
  return mockMovers(market.id);
}

// Heavyweight "leading stocks" for markets that curate a `leaders` list (KSA, USA
// today) — priced live + dividends via Yahoo. [] for markets without one, so the UI
// simply omits the section.
async function getLeaders(market) {
  if (!market.leaders?.length) return [];
  try { return await yahoo.fetchLeaders(market); }
  catch { return []; }
}

async function buildMarket(market) {
  const [quote, movers, news, leaders] = await Promise.all([
    getQuote(market),
    getMovers(market),
    getNews(market),
    getLeaders(market),
  ]);
  const open = isOpen(market.schedule);
  const snapshot = {
    name: market.name,
    index: market.index.label,
    price: quote.price,
    changePct: quote.changePct,
    open,
    movers: movers.slice(0, 5),
    headlines: news.map((n) => n.headline),
  };
  const take = await getTake(market, snapshot);
  return {
    id: market.id,
    name: market.name,
    city: market.city,
    flag: market.flag,
    tz: market.tz,
    currency: market.currency,
    index: market.index.label,
    schedule: market.schedule,
    commodity: !!market.schedule.commodity,
    always: !!market.schedule.always,
    watch: market.watch.map((w) => w.symbol),
    open,
    quote,
    spark: quote.spark,
    movers,
    leaders,
    news,
    take,
  };
}

// Refresh the mock watchlist's crypto & gold rows with live prices where available.
function buildWatchlist(marketObjs) {
  const byId = Object.fromEntries(marketObjs.map((m) => [m.id, m]));
  return WATCHLIST.map((row) => {
    const live = byId[row.id]?.quote;
    if ((row.id === 'cr' || row.id === 'au') && live) {
      const px = `$${live.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
      return { ...row, native: px, usd: px, changePct: live.changePct };
    }
    return row;
  });
}

export async function buildDashboard() {
  const marketObjs = await Promise.all(MARKETS.map(buildMarket));
  const watchlist = buildWatchlist(marketObjs);
  const snapshots = marketObjs.map((m) => ({
    id: m.id, name: m.name, index: m.index,
    price: m.quote.price, changePct: m.quote.changePct, open: m.open,
  }));
  const brief = await getBrief(MARKETS, snapshots);
  return { as_of: new Date().toISOString(), markets: marketObjs, watchlist, brief };
}

export default { buildDashboard };
