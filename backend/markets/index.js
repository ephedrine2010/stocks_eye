// Registry of all tracked markets. Add a market = add a file + one line here.
import usa from './usa.js';
import ksa from './ksa.js';
import uae from './uae.js';
import egypt from './egypt.js';
import china from './china.js';
import gold from './gold.js';
import crypto from './crypto.js';

// Display order (equities → gold → crypto).
export const markets = [usa, ksa, uae, egypt, china, gold, crypto];

export const byId = Object.fromEntries(markets.map((m) => [m.id, m]));

export default { markets, byId };
