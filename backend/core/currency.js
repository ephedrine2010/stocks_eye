// Currency normalization to a common display currency (USD).
// v1 uses static approximate rates. Swap this for a live FX source later
// (e.g. exchangerate.host / open.er-api.com) behind the same interface.

// Units of USD per 1 unit of the currency (approximate — for display only).
const TO_USD = {
  USD: 1,
  SAR: 0.2666, // Saudi riyal (pegged)
  AED: 0.2723, // UAE dirham (pegged)
  EGP: 0.0205, // Egyptian pound (floating — refresh when live FX added)
  CNY: 0.1380, // Chinese yuan
};

export function toUSD(amount, currency) {
  const rate = TO_USD[currency] ?? 1;
  return amount * rate;
}

// Format a number as a currency string for the given currency.
export function formatMoney(amount, currency) {
  const symbols = { USD: '$', SAR: '﷼ ', AED: 'د.إ ', EGP: '£ ', CNY: '¥' };
  const digits = amount < 100 ? 2 : amount < 10000 ? 2 : 0;
  const n = amount.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: 2 });
  return `${symbols[currency] ?? ''}${n}`;
}

export default { toUSD, formatMoney };
