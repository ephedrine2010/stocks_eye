// News service — returns normalized news per market.
// Tries the market's RSS feed(s); falls back to the mock dataset so every market
// always shows headlines. Sentiment: RSS items default to neutral until FinBERT
// is wired; mock items carry hand-set sentiment.

import { makeNews } from '../../core/normalizer.js';
import { wrap } from '../../core/cache.js';
import { fetchFeed } from './rss.js';
import { NEWS } from '../mock/marketData.js';

function feedLabel(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return 'RSS'; }
}

function mockNews(marketId) {
  return (NEWS[marketId] || []).map((n) =>
    makeNews({ headline: n.h, source: n.src, sentiment: n.s, published: n.t }));
}

export async function getNews(market) {
  return wrap(`news:${market.id}`, 15 * 60_000, async () => {
    if (market.newsSource === 'rss' && market.newsFeeds?.length) {
      try {
        const items = await fetchFeed(market.newsFeeds[0]);
        return items.map((i) =>
          makeNews({ headline: i.headline, url: i.url, source: feedLabel(market.newsFeeds[0]), sentiment: 'neut', published: i.published }));
      } catch {
        // fall through to mock
      }
    }
    return mockNews(market.id);
  });
}

export default { getNews };
