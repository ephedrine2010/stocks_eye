// 🇨🇳 China — Shanghai / Shenzhen (SSE Composite). Trades Mon–Fri with a midday break.
export default {
  id: 'cn',
  name: 'China',
  city: 'Shanghai',
  flag: '🇨🇳',
  tz: 'Asia/Shanghai',
  currency: 'CNY',
  index: { label: 'SSE Comp', symbol: '000001.SS' },
  schedule: { tz: 'Asia/Shanghai', days: [1, 2, 3, 4, 5], sessions: [[570, 690], [780, 900]] },
  priceSource: 'yahoo',
  newsSource: 'rss',
  newsFeeds: ['https://www.scmp.com/rss/92/feed'],
  watch: [
    { symbol: '600519', name: 'Kweichow Moutai' },
    { symbol: '601318', name: 'Ping An' },
    { symbol: '600036', name: 'China Merchants Bank' },
  ],
  // Curated stocks priced live via Yahoo (Shanghai `.SS` / Shenzhen `.SZ`).
  movers: [
    { symbol: '600519', name: 'Kweichow Moutai', y: '600519.SS' },
    { symbol: '601318', name: 'Ping An', y: '601318.SS' },
    { symbol: '600036', name: 'China Merchants Bank', y: '600036.SS' },
    { symbol: '000858', name: 'Wuliangye', y: '000858.SZ' },
    { symbol: '601988', name: 'Bank of China', y: '601988.SS' },
  ],
  mock: { price: 3021.7, changePct: -0.51, spark: [50, 49, 50, 48, 47, 48, 46, 47, 45, 46, 44, 45, 43] },
};
