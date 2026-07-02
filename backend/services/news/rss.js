// Minimal RSS reader — server-side fetch + light XML parsing (no dependency).
// Returns [{ headline, url, published }] or throws. Sentiment is added by the
// news service (FinBERT wiring is a later step; defaults to neutral for now).

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'));
  if (!m) return '';
  return m[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
    .trim();
}

function relativeTime(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  const mins = Math.max(1, Math.round((Date.now() - d.getTime()) / 60000));
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.round(hrs / 24)}d`;
}

export async function fetchFeed(url, limit = 4) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', accept: 'application/rss+xml,text/xml,*/*' } });
  if (!res.ok) throw new Error(`RSS ${res.status}`);
  const xml = await res.text();
  const items = xml.split(/<item[\s>]/i).slice(1, limit + 1);
  const out = items.map((block) => ({
    headline: tag(block, 'title'),
    url: tag(block, 'link') || '#',
    published: relativeTime(tag(block, 'pubDate')),
  })).filter((i) => i.headline);
  if (!out.length) throw new Error('RSS: no items');
  return out;
}

export default { fetchFeed };
