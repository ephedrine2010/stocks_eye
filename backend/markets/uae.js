// 🇦🇪 UAE — DFM / ADX. Trades Mon–Fri.
// NOTE: UAE is the known price-data gap — no strong free source. Yahoo is spotty;
// mock fallback keeps it rendering. Revisit with a better source (see docs/01).
export default {
  id: 'ae',
  name: 'UAE',
  city: 'Dubai',
  flag: '🇦🇪',
  tz: 'Asia/Dubai',
  currency: 'AED',
  index: { label: 'DFM GI', symbol: '^DFMGI' },
  schedule: { tz: 'Asia/Dubai', days: [1, 2, 3, 4, 5], sessions: [[600, 900]] },
  priceSource: 'yahoo',
  newsSource: 'mock', // Arabian Business / Zawya RSS to be wired later
  newsFeeds: [],
  watch: [
    { symbol: 'EMAAR', name: 'Emaar Properties' },
    { symbol: 'DIB', name: 'Dubai Islamic Bank' },
    { symbol: 'IHC', name: 'Intl Holding Co' },
  ],
  // Curated stocks priced live via Yahoo (DFM: `.AE` suffix). Yahoo carries DFM
  // names even though it lacks the ^DFMGI index — so movers are live while the
  // headline index still falls back to mock.
  movers: [
    { symbol: 'EMAAR', name: 'Emaar Properties', y: 'EMAAR.AE' },
    { symbol: 'DIB', name: 'Dubai Islamic Bank', y: 'DIB.AE' },
    { symbol: 'DEWA', name: 'Dubai Electricity & Water', y: 'DEWA.AE' },
    { symbol: 'SALIK', name: 'Salik', y: 'SALIK.AE' },
    { symbol: 'DU', name: 'du (EITC)', y: 'DU.AE' },
  ],
  mock: { price: 4180.9, changePct: 0.18, spark: [30, 31, 30, 32, 33, 32, 34, 33, 35, 34, 36, 35, 37] },
};
