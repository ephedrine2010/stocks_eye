// Orchestrator: fetch the dashboard, render each UI module, tick the clocks,
// and refresh on an interval.

import { getDashboard } from './api.js';
import { localParts, utcTime } from './marketHours.js';
import { renderBrief } from './ui/brief.js';
import { renderTiles } from './ui/tiles.js';
import { renderDetail } from './ui/detail.js';
import { renderWatchlist } from './ui/watchlist.js';

const els = {
  brief: document.getElementById('brief'),
  tiles: document.getElementById('tiles'),
  detail: document.getElementById('detail'),
  watchlist: document.getElementById('watchlist'),
  mode: document.getElementById('mode'),
  utc: document.getElementById('utc'),
};

const state = { data: null, selectedId: null };

function selectedMarket() {
  return state.data?.markets.find((m) => m.id === state.selectedId) || state.data?.markets[0];
}

function renderTilesAndDetail() {
  if (!state.data) return;
  renderTiles(els.tiles, state.data.markets, state.selectedId, (id) => {
    state.selectedId = id;
    renderTilesAndDetail();
    updateClocks();
  });
  renderDetail(els.detail, selectedMarket());
}

function render() {
  if (!state.data) return;
  renderBrief(els.brief, state.data.brief, state.data.as_of);
  renderTilesAndDetail();
  renderWatchlist(els.watchlist, state.data.watchlist);
  const cryptoLive = state.data.markets.some((m) => m.id === 'cr' && m.quote.source === 'CoinGecko');
  els.mode.textContent = cryptoLive ? 'Live + sample data' : 'Sample data';
  updateClocks();
}

function updateClocks() {
  els.utc.textContent = utcTime();
  if (!state.data) return;
  const byId = Object.fromEntries(state.data.markets.map((m) => [m.id, m]));
  document.querySelectorAll('[data-clock]').forEach((node) => {
    const m = byId[node.dataset.clock];
    if (m) node.textContent = localParts(m.tz).time;
  });
}

async function load() {
  try {
    const data = await getDashboard();
    state.data = data;
    if (!state.selectedId) state.selectedId = data.markets[0]?.id || null;
    render();
  } catch (err) {
    console.error('load failed', err);
    els.mode.textContent = 'offline — retrying…';
  }
}

load();
setInterval(updateClocks, 1000);          // tick local clocks + UTC
setInterval(renderTilesAndDetail, 15000); // re-evaluate open/closed
setInterval(load, 60000);                 // refresh quotes/news/AI
