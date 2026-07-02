// Inline SVG sparklines + the larger detail area chart. No chart library.

const GAIN = '#34C08A';
const LOSS = '#F26D6D';

function path(points, w, h, pad = 2) {
  if (!points || points.length < 2) return '';
  const mn = Math.min(...points), mx = Math.max(...points), rng = (mx - mn) || 1;
  return points.map((v, i) => {
    const x = pad + (i * (w - 2 * pad)) / (points.length - 1);
    const y = h - pad - ((v - mn) / rng) * (h - 2 * pad);
    return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
}

function lastPoint(d) {
  const nums = d.trim().split(/[ML]/).filter(Boolean).pop().trim().split(' ');
  return { x: nums[0], y: nums[1] };
}

// Small tile sparkline.
export function spark(points, changePct, w = 200, h = 34, id = '') {
  if (!points || points.length < 2) return `<svg class="spark" viewBox="0 0 ${w} ${h}"></svg>`;
  const col = changePct >= 0 ? GAIN : LOSS;
  const d = path(points, w, h);
  const { x, y } = lastPoint(d);
  const gid = `g${id}${w}`;
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="${col}" stop-opacity=".28"/>
      <stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>
    <path d="${d} L${w - 2} ${h - 2} L2 ${h - 2} Z" fill="url(#${gid})"/>
    <path d="${d}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${x}" cy="${y}" r="3" fill="${col}"/></svg>`;
}

// Larger detail area chart with a faint grid.
export function detailChart(points, changePct, w = 560, h = 150) {
  if (!points || points.length < 2) return `<svg class="detail-chart" viewBox="0 0 ${w} ${h}"></svg>`;
  const col = changePct >= 0 ? GAIN : LOSS;
  const d = path(points, w, h, 8);
  const { x, y } = lastPoint(d);
  const grid = [0.25, 0.5, 0.75].map((f) =>
    `<line x1="0" x2="${w}" y1="${h * f}" y2="${h * f}" stroke="#2C3850" stroke-width="1"/>`).join('');
  return `<svg class="detail-chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    ${grid}
    <path d="${d} L${w - 8} ${h - 8} L8 ${h - 8} Z" fill="${col}" opacity=".14"/>
    <path d="${d}" fill="none" stroke="${col}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${x}" cy="${y}" r="4" fill="${col}"/></svg>`;
}
