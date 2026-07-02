// Shared formatting helpers + sentiment glyphs.

export const SENT = {
  bull: { g: '▲', l: 'Bullish' },
  bear: { g: '▼', l: 'Bearish' },
  neut: { g: '●', l: 'Neutral' },
};

export const fmt = (n) =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: Math.abs(n) < 100 ? 2 : 0, maximumFractionDigits: 2 });

// Big signed change for headline values: "▲ +0.62%"
export const sgn = (c) => (c >= 0 ? '▲ +' : '▼ ') + Math.abs(c).toFixed(2) + '%';

// Compact signed percent for movers/watch: "+2.1%"
export const pct = (c) => (c >= 0 ? '+' : '') + Number(c).toFixed(1) + '%';

export const cls = (c) => (c >= 0 ? 'gain' : 'loss');

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
