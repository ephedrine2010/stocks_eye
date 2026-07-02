// 🥇 Gold — spot XAU/USD. A commodity, not an exchange: ~24h Mon–Fri (simplified).
export default {
  id: 'au',
  name: 'Gold',
  city: 'Spot · London/UTC',
  flag: '🥇',
  tz: 'UTC',
  currency: 'USD',
  index: { label: 'XAU/USD  /oz', symbol: 'GC=F' },
  schedule: { tz: 'UTC', days: [1, 2, 3, 4, 5], sessions: [[0, 1439]], commodity: true },
  priceSource: 'yahoo',
  newsSource: 'rss',
  newsFeeds: ['https://www.kitco.com/rss/'],
  watch: [
    { symbol: 'GLD', name: 'SPDR Gold ETF' },
    { symbol: 'IAU', name: 'iShares Gold' },
    { symbol: 'NEM', name: 'Newmont' },
  ],
  // Gold-linked ETFs & miners priced live via Yahoo (US-listed: no suffix).
  movers: [
    { symbol: 'GLD', name: 'SPDR Gold ETF' },
    { symbol: 'IAU', name: 'iShares Gold' },
    { symbol: 'NEM', name: 'Newmont' },
    { symbol: 'GOLD', name: 'Barrick Gold' },
  ],
  mock: { price: 2338.4, changePct: 0.41, spark: [44, 45, 44, 46, 45, 47, 46, 48, 47, 49, 48, 50, 51] },
};
