// Sample content used until real news/AI sources are wired. Keyed by market id.
// Sentiment: 'bull' | 'bear' | 'neut'.

export const MOVERS = {
  us: [['NVDA', 'NVIDIA', 2.8], ['MSFT', 'Microsoft', 1.1], ['TSLA', 'Tesla', -1.9], ['AMZN', 'Amazon', 0.7]],
  sa: [['1120', 'Al Rajhi', 0.8], ['2010', 'SABIC', -1.2], ['7010', 'STC', 0.4], ['1010', 'Riyad Bank', -0.6]],
  ae: [['EMAAR', 'Emaar', 0.3], ['DIB', 'Dubai Islamic', 0.9], ['EAND', 'e&', -0.5], ['ADCB', 'ADCB', 0.2]],
  eg: [['COMI', 'CIB', 1.7], ['HRHO', 'EFG', 2.3], ['SWDY', 'Elsewedy', -0.8], ['TMGH', 'TMG', 1.1]],
  cn: [['600519', 'Moutai', -0.6], ['601318', 'Ping An', 0.5], ['600036', 'CMB', -0.9], ['000858', 'Wuliangye', 0.3]],
  au: [['GLD', 'SPDR Gold ETF', 0.4], ['IAU', 'iShares Gold', 0.4], ['NEM', 'Newmont', 1.3], ['GOLD', 'Barrick', -0.7]],
  cr: [['BTC', 'Bitcoin', 2.1], ['ETH', 'Ethereum', 3.4], ['SOL', 'Solana', 5.6], ['BNB', 'BNB', 1.2], ['XRP', 'XRP', -1.8]],
};

export const NEWS = {
  us: [
    { s: 'bull', h: 'Nvidia extends rally as AI-chip demand outlook lifts megacaps', src: 'Finnhub', t: '18m' },
    { s: 'bear', h: 'Treasury yields tick up ahead of Fed minutes, weighing on tech', src: 'Reuters', t: '1h' },
    { s: 'neut', h: 'S&P 500 drifts near record as traders await payrolls data', src: 'Alpha Vantage', t: '2h' },
  ],
  sa: [
    { s: 'bear', h: 'TASI slips as banks retreat; Aramco steadies after dividend note', src: 'Argaam', t: '32m' },
    { s: 'bull', h: 'Al Rajhi leads gainers on stronger Q2 lending growth', src: 'Mubasher', t: '1h' },
    { s: 'neut', h: 'Saudi PIF-linked listing pipeline stays active into H2', src: 'Zawya', t: '3h' },
  ],
  ae: [
    { s: 'bull', h: 'Emaar climbs as Dubai property transactions hit fresh high', src: 'Arabian Business', t: '25m' },
    { s: 'neut', h: 'DFM turnover steady; Dubai Islamic Bank in focus pre-earnings', src: 'Zawya', t: '2h' },
    { s: 'bear', h: 'ADX drifts lower as energy names track softer crude', src: 'Mubasher', t: '4h' },
  ],
  eg: [
    { s: 'bull', h: 'EGX 30 jumps as CIB and EFG rally on foreign inflows', src: 'Mubasher', t: '12m' },
    { s: 'neut', h: 'Newly listed petroleum firms on EGX to trade in USD, minister says', src: 'Zawya', t: '1h' },
    { s: 'bear', h: 'Pound pressure keeps some blue chips capped despite index gains', src: 'Marketaux', t: '5h' },
  ],
  cn: [
    { s: 'bear', h: 'SSE Composite eases as property drag offsets stimulus hopes', src: 'akshare · Sina', t: '20m' },
    { s: 'neut', h: 'Kweichow Moutai steadies after liquor-sector volatility', src: 'Eastmoney', t: '2h' },
    { s: 'bull', h: 'Ping An gains on buyback signal; brokers turn constructive', src: 'akshare', t: '3h' },
  ],
  au: [
    { s: 'bull', h: 'Gold firms as softer dollar and rate-cut bets support bullion', src: 'Kitco', t: '15m' },
    { s: 'neut', h: 'XAU/USD holds range ahead of US inflation print', src: 'Marketaux', t: '1h' },
    { s: 'bear', h: 'Gold pares gains as Treasury yields rebound intraday', src: 'Investing.com', t: '4h' },
  ],
  cr: [
    { s: 'bull', h: 'Bitcoin pushes higher as spot-ETF inflows accelerate', src: 'CoinDesk', t: '9m' },
    { s: 'bull', h: 'Ethereum leads majors after network upgrade goes live', src: 'The Block', t: '48m' },
    { s: 'bear', h: 'Altcoins wobble as perp funding rates flip negative intraday', src: 'Cointelegraph', t: '3h' },
  ],
};

// Per-market AI advice (mock until an Anthropic key is added).
export const ADVICE = {
  us: { s: 'bull', cites: ['Reuters', 'Finnhub'], text: 'Pre-market tone is constructive as Treasury yields ease and megacap tech leads. The swing factor today is the US CPI print at 13:30 GMT — a hotter number would pressure rate-sensitive names.' },
  sa: { s: 'neut', cites: ['Argaam', 'Zawya'], text: 'TASI likely opens flat; banks and Aramco steady after the dividend note. Oil direction and PIF-linked listing flow are the near-term drivers to watch.' },
  ae: { s: 'bull', cites: ['Arabian Business', 'Zawya'], text: 'DFM is supported by strong Dubai property transaction data, with Dubai Islamic Bank in focus ahead of earnings. ADX lags as energy names track softer crude.' },
  eg: { s: 'bull', cites: ['Mubasher', 'Zawya'], text: 'EGX 30 is buoyed by foreign inflows into CIB and EFG. Watch the pound — currency pressure can cap blue-chip gains even when the index is strong.' },
  cn: { s: 'bear', cites: ['akshare', 'Eastmoney'], text: 'Mainland is soft on the property drag; sentiment hinges on fresh stimulus signals. Moutai and Ping An are the large-cap tells for the session.' },
  au: { s: 'neut', cites: ['Kitco', 'Marketaux'], text: 'Gold is range-bound ahead of US inflation. A cooler CPI plus a softer dollar would favour bullion; a rebound in yields caps it. Position sizing over direction today.' },
  cr: { s: 'bull', cites: ['CoinDesk', 'The Block'], text: 'BTC and ETH extend gains on accelerating spot-ETF inflows. Momentum is strong but perp funding rates look stretched — watch for intraday altcoin pullbacks.' },
};

// Curated cross-market watchlist (native + USD).
export const WATCHLIST = [
  { id: 'us', flag: '🇺🇸', symbol: 'AAPL', name: 'Apple', native: '$214.30', usd: '$214.30', changePct: 0.9 },
  { id: 'sa', flag: '🇸🇦', symbol: '2222', name: 'Saudi Aramco', native: '﷼ 28.90', usd: '$7.71', changePct: -0.4 },
  { id: 'eg', flag: '🇪🇬', symbol: 'COMI', name: 'Comm. Intl Bank', native: '£ 84.20', usd: '$1.72', changePct: 1.7 },
  { id: 'cn', flag: '🇨🇳', symbol: '600519', name: 'Kweichow Moutai', native: '¥1,588', usd: '$219.4', changePct: -0.6 },
  { id: 'ae', flag: '🇦🇪', symbol: 'EMAAR', name: 'Emaar Properties', native: 'د.إ 8.15', usd: '$2.22', changePct: 0.3 },
  { id: 'au', flag: '🥇', symbol: 'XAU', name: 'Gold spot / oz', native: '$2,338.40', usd: '$2,338.40', changePct: 0.4 },
  { id: 'cr', flag: '🪙', symbol: 'BTC', name: 'Bitcoin', native: '$68,450', usd: '$68,450', changePct: 2.1 },
];

// Roll-up morning brief (mock).
export const BRIEF = {
  lead: "Global risk appetite is firmer heading into the session. US futures point higher as Treasury yields cool, Gulf markets open steady with Aramco in focus, and crypto extends its rally on renewed spot-ETF inflows. Gold holds its range ahead of today's US inflation print.",
  lines: [
    { id: 'us', flag: '🇺🇸', name: 'USA', s: 'bull', text: 'Futures firmer; megacap tech leads pre-market.' },
    { id: 'sa', flag: '🇸🇦', name: 'KSA', s: 'neut', text: 'TASI flat to open; banks & Aramco steady.' },
    { id: 'ae', flag: '🇦🇪', name: 'UAE', s: 'bull', text: 'Dubai property strength supports DFM.' },
    { id: 'eg', flag: '🇪🇬', name: 'Egypt', s: 'bull', text: 'EGX 30 buoyed by foreign inflows into CIB.' },
    { id: 'cn', flag: '🇨🇳', name: 'China', s: 'bear', text: 'Mainland soft on property drag; stimulus watch.' },
    { id: 'au', flag: '🥇', name: 'Gold', s: 'neut', text: 'Range-bound; awaiting US CPI at 13:30 GMT.' },
    { id: 'cr', flag: '🪙', name: 'Crypto', s: 'bull', text: 'BTC & ETH extend gains on ETF inflows.' },
  ],
  hint: 'Tone is risk-on but data-dependent — US inflation (13:30 GMT) is the common swing factor for gold, crypto, and rate-sensitive megacaps alike. Worth watching before repositioning.',
  citations: ['Reuters', 'Bloomberg', 'Argaam', 'Kitco', 'CoinDesk'],
};

export default { MOVERS, NEWS, ADVICE, WATCHLIST, BRIEF };
