// 🇸🇦 KSA — Tadawul (TASI). Trades Sun–Thu (weekend is Fri–Sat).
export default {
  id: 'sa',
  name: 'Saudi Arabia',
  city: 'Riyadh',
  flag: '🇸🇦',
  tz: 'Asia/Riyadh',
  currency: 'SAR',
  index: { label: 'TASI', symbol: '^TASI.SR' },
  schedule: { tz: 'Asia/Riyadh', days: [0, 1, 2, 3, 4], sessions: [[600, 900]] },
  priceSource: 'yahoo',
  newsSource: 'mock', // Argaam / Mubasher RSS to be wired later
  newsFeeds: [],
  watch: [
    { symbol: '2222', name: 'Saudi Aramco' },
    { symbol: '1120', name: 'Al Rajhi Bank' },
    { symbol: '2010', name: 'SABIC' },
  ],
  mock: { price: 11842.5, changePct: -0.34, spark: [60, 59, 61, 58, 57, 59, 56, 55, 57, 54, 53, 55, 52] },
};
