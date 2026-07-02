// 🇪🇬 Egypt — EGX (EGX 30). Trades Sun–Thu.
export default {
  id: 'eg',
  name: 'Egypt',
  city: 'Cairo',
  flag: '🇪🇬',
  tz: 'Africa/Cairo',
  currency: 'EGP',
  index: { label: 'EGX 30', symbol: '^CASE30' },
  schedule: { tz: 'Africa/Cairo', days: [0, 1, 2, 3, 4], sessions: [[600, 870]] },
  priceSource: 'yahoo',
  newsSource: 'mock', // EGXPY / Mubasher RSS to be wired later
  newsFeeds: [],
  watch: [
    { symbol: 'COMI', name: 'Commercial Intl Bank' },
    { symbol: 'HRHO', name: 'EFG Holding' },
    { symbol: 'SWDY', name: 'Elsewedy Electric' },
  ],
  mock: { price: 27960, changePct: 1.24, spark: [20, 22, 21, 24, 26, 25, 28, 30, 29, 32, 34, 33, 37] },
};
