// 🇺🇸 USA — NYSE / NASDAQ. Trades Mon–Fri.
export default {
  id: 'us',
  name: 'United States',
  city: 'New York',
  flag: '🇺🇸',
  tz: 'America/New_York',
  currency: 'USD',
  index: { label: 'S&P 500', symbol: '^GSPC' },
  schedule: { tz: 'America/New_York', days: [1, 2, 3, 4, 5], sessions: [[570, 960]] },
  priceSource: 'yahoo',
  newsSource: 'rss',
  newsFeeds: ['https://www.cnbc.com/id/100003114/device/rss/rss.html'],
  watch: [
    { symbol: 'AAPL', name: 'Apple' },
    { symbol: 'NVDA', name: 'NVIDIA' },
    { symbol: 'MSFT', name: 'Microsoft' },
  ],
  mock: { price: 5473.2, changePct: 0.62, spark: [40, 42, 41, 44, 43, 46, 45, 48, 47, 50, 52, 51, 54] },
};
