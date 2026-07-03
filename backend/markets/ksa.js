// 🇸🇦 KSA — Tadawul (TASI). Trades Sun–Thu (weekend is Fri–Sat).
export default {
  id: 'sa',
  name: 'Saudi Arabia',
  city: 'Riyadh',
  flag: '🇸🇦',
  tz: 'Asia/Riyadh',
  currency: 'SAR',
  index: { label: 'TASI', symbol: '^TASI.SR', sahmk: 'TASI' },
  schedule: { tz: 'Asia/Riyadh', days: [0, 1, 2, 3, 4], sessions: [[600, 900]] },
  priceSource: 'sahmk', // official Tadawul API; falls back to Yahoo (^TASI.SR) then mock
  moversSource: 'sahmk', // real top gainers/losers; falls back to the curated Yahoo list below
  newsSource: 'mock', // Argaam / Mubasher RSS to be wired later
  newsFeeds: [],
  watch: [
    { symbol: '2222', name: 'Saudi Aramco' },
    { symbol: '1120', name: 'Al Rajhi Bank' },
    { symbol: '2010', name: 'SABIC' },
  ],
  // Curated stocks priced live via Yahoo (Tadawul: `.SR` suffix).
  movers: [
    { symbol: '2222', name: 'Saudi Aramco', y: '2222.SR' },
    { symbol: '1120', name: 'Al Rajhi Bank', y: '1120.SR' },
    { symbol: '2010', name: 'SABIC', y: '2010.SR' },
    { symbol: '7010', name: 'STC', y: '7010.SR' },
    { symbol: '1010', name: 'Riyad Bank', y: '1010.SR' },
  ],
  // Heavyweight bellwethers that drive TASI, ranked by weight (researched 2026-07,
  // see documentation/display_data/display_approach.md). Priced live + dividends via
  // Yahoo `.SR` tickers (yahoo.fetchLeaders).
  leaders: [
    { symbol: '2222', name: 'Saudi Aramco', y: '2222.SR' },
    { symbol: '1120', name: 'Al Rajhi Bank', y: '1120.SR' },
    { symbol: '1180', name: 'Saudi National Bank', y: '1180.SR' },
    { symbol: '2010', name: 'SABIC', y: '2010.SR' },
    { symbol: '1211', name: "Ma'aden", y: '1211.SR' },
    { symbol: '7010', name: 'STC', y: '7010.SR' },
    { symbol: '1010', name: 'Riyad Bank', y: '1010.SR' },
    { symbol: '1150', name: 'Alinma Bank', y: '1150.SR' },
  ],
  mock: { price: 11842.5, changePct: -0.34, spark: [60, 59, 61, 58, 57, 59, 56, 55, 57, 54, 53, 55, 52] },
};
