// 🪙 Crypto — top 5 coins. Trades 24/7/365 — never closes.
// Fully live via CoinGecko (no API key). BTC is the headline; all 5 appear as movers/watch.
export default {
  id: 'cr',
  name: 'Crypto',
  city: 'Global · 24/7',
  flag: '🪙',
  tz: 'UTC',
  currency: 'USD',
  index: { label: 'BTC/USD', symbol: 'bitcoin' },
  schedule: { tz: 'UTC', days: [0, 1, 2, 3, 4, 5, 6], sessions: [[0, 1439]], always: true },
  priceSource: 'coingecko',
  newsSource: 'rss',
  newsFeeds: ['https://www.coindesk.com/arc/outboundfeeds/rss/'],
  // CoinGecko ids drive the live fetch; symbol/name drive display.
  coins: [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
    { id: 'solana', symbol: 'SOL', name: 'Solana' },
    { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  ],
  watch: [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'BNB', name: 'BNB' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'XRP', name: 'XRP' },
  ],
  mock: { price: 68450, changePct: 2.14, spark: [38, 40, 39, 42, 44, 43, 46, 48, 47, 50, 52, 54, 56] },
};
