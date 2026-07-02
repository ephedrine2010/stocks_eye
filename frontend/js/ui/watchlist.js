// Renders the cross-market watchlist, normalized to USD.

import { pct, cls, esc } from '../format.js';

export function renderWatchlist(el, rows) {
  el.innerHTML =
    `<div class="wh"><span>Symbol</span><span class="num">Native</span><span class="num">USD</span><span class="num">Chg</span></div>`
    + (rows || []).map((r) => `
      <div class="wr">
        <span class="sym"><span class="f">${r.flag}</span>${esc(r.symbol)}<span class="sub">${esc(r.name)}</span></span>
        <span class="num mono">${esc(r.native)}</span>
        <span class="num mono usd">${esc(r.usd)}</span>
        <span class="num mono ${cls(r.changePct)}">${pct(r.changePct)}</span>
      </div>`).join('');
}
