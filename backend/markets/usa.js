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
  // Curated stocks priced live via Yahoo individual tickers (US: no suffix).
  movers: [
    { symbol: 'AAPL', name: 'Apple' },
    { symbol: 'NVDA', name: 'NVIDIA' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'TSLA', name: 'Tesla' },
    { symbol: 'AMZN', name: 'Amazon' },
  ],
  // Megacap bellwethers that drive the S&P 500, ranked by weight. Priced live +
  // dividends via Yahoo (yahoo.fetchLeaders). A mix of payers and non-payers on
  // purpose — AMZN/GOOGL* show no yield (hidden, not "0%"), demonstrating the rule.
  leaders: [
    { symbol: 'AAPL', name: 'Apple' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'NVDA', name: 'NVIDIA' },
    { symbol: 'AMZN', name: 'Amazon' },
    { symbol: 'META', name: 'Meta Platforms' },
    { symbol: 'GOOGL', name: 'Alphabet' },
    { symbol: 'JPM', name: 'JPMorgan Chase' },
    { symbol: 'XOM', name: 'Exxon Mobil' },
  ],
  mock: { price: 5473.2, changePct: 0.62, spark: [40, 42, 41, 44, 43, 46, 45, 48, 47, 50, 52, 51, 54] },
};
