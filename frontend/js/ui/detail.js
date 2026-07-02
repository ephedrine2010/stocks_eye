// Renders the selected market's detail card:
// chart → per-market AI Take → top movers → news & sentiment.

import { SENT, fmt, sgn, pct, cls, esc } from '../format.js';
import { isOpen } from '../marketHours.js';
import { detailChart } from '../charts.js';

function takeBlock(name, take) {
  if (!take) return '';
  const tagCls = take.sentiment === 'bull' ? 'gain' : take.sentiment === 'bear' ? 'loss' : '';
  const cites = (take.citations || []).map((c) => `<span class="cite">${esc(c)}</span>`).join('');
  return `<div class="take">
    <div class="th"><span class="ai">✦</span>AI Take · ${esc(name)}
      <span class="tag ${tagCls}">${SENT[take.sentiment]?.g || '●'} ${SENT[take.sentiment]?.l || 'Neutral'}</span></div>
    <p>${esc(take.text)}</p>
    <div class="cites"><span class="lb">Sources</span>${cites}
      <span class="cite" style="border-style:dashed">+ web</span></div>
  </div>`;
}

function newsRow(a) {
  const meta = [SENT[a.sentiment]?.l || 'Neutral', a.source, a.published ? `${a.published} ago` : '']
    .filter(Boolean).join(' · ');
  const title = a.url && a.url !== '#'
    ? `<a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.headline)}</a>`
    : esc(a.headline);
  return `<div class="ni">
    <span class="sent ${a.sentiment}" title="${SENT[a.sentiment]?.l || ''}">${SENT[a.sentiment]?.g || '●'}</span>
    <div><span class="nh">${title}</span><span class="nsrc">${esc(meta)}</span></div>
  </div>`;
}

export function renderDetail(el, m) {
  if (!m) { el.innerHTML = ''; return; }
  const open = isOpen(m.schedule);
  const changePct = m.quote.changePct;
  const movers = (m.movers || []).map((mv) =>
    `<div class="mv"><span class="t mono">${esc(mv.symbol)}</span>
      <span class="n">${esc(mv.name)}</span>
      <span class="c mono ${cls(mv.changePct)}">${pct(mv.changePct)}</span></div>`).join('');
  const news = (m.news || []).map(newsRow).join('');

  el.innerHTML = `
    <div class="head"><span class="flag">${m.flag}</span>
      <div><h2>${esc(m.index)}</h2>
        <span class="chip">${esc(m.name)} · ${esc(m.city)} · ${open ? 'Open now' : 'Closed'} · ${esc(m.quote.source)}</span></div>
      <div class="meta"><div class="big mono">${fmt(m.quote.price)}</div>
        <div class="mono ${cls(changePct)}" style="font-size:13px">${sgn(changePct)}</div></div>
    </div>
    ${detailChart(m.spark, changePct)}
    ${takeBlock(m.name, m.take)}
    <p class="lbl" style="margin:14px 0 2px">Top movers · session</p>
    <div class="movers">${movers}</div>
    <p class="lbl" style="margin:18px 0 2px">Latest · news &amp; sentiment</p>
    <div class="news">${news}</div>
    <p class="disc">Headlines and sentiment are informational only — not investment advice.</p>`;
}
