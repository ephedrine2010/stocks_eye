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
  newsSource: 'mock', // akshare (Sina/Eastmoney) to be wired later
  newsFeeds: [],
  watch: [
    { symbol: '600519', name: 'Kweichow Moutai' },
    { symbol: '601318', name: 'Ping An' },
    { symbol: '600036', name: 'China Merchants Bank' },
  ],
  mock: { price: 3021.7, changePct: -0.51, spark: [50, 49, 50, 48, 47, 48, 46, 47, 45, 46, 44, 45, 43] },
};
