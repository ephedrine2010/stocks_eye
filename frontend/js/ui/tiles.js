// Renders the live market-status tiles. Open/closed + local time are computed
// client-side (see marketHours.js) so they tick without a server round-trip.

import { fmt, sgn, cls, esc } from '../format.js';
import { isOpen } from '../marketHours.js';
import { spark } from '../charts.js';

export function renderTiles(el, markets, selectedId, onPick) {
  el.innerHTML = markets.map((m) => {
    const open = isOpen(m.schedule);
    const changePct = m.quote.changePct;
    const label = m.always ? '24/7' : m.commodity ? 'Trades' : 'Local';
    const suffix = (m.always || m.commodity) ? ' UTC' : '';
    const chips = (m.watch || []).map((s) => `<span class="wk">${esc(s)}</span>`).join('');
    return `
      <button class="tile ${m.id === selectedId ? 'sel' : ''}" data-id="${m.id}" aria-pressed="${m.id === selectedId}">
        <div class="row1"><span class="flag">${m.flag}</span>
          <div><div class="nm">${esc(m.name)}</div><div class="city">${esc(m.city)}</div></div>
          <span class="status ${open ? 'open' : 'closed'}"><span class="dot"></span>${open ? 'Open' : 'Closed'}</span>
        </div>
        <div class="idx">${esc(m.index)}</div>
        <div class="val mono">${fmt(m.quote.price)}</div>
        <div class="chg mono ${cls(changePct)}">${sgn(changePct)}</div>
        ${spark(m.spark, changePct, 200, 34, m.id)}
        <div class="lt mono">${label} <span data-clock="${m.id}">—</span>${suffix}</div>
        <div class="watch"><b>Watch</b>${chips}</div>
      </button>`;
  }).join('');

  el.querySelectorAll('.tile').forEach((btn) =>
    btn.addEventListener('click', () => onPick(btn.dataset.id)));
}
