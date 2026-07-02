// Stocks Eye — Express server. Serves the API and the static frontend.

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './core/env.js';
import api from './routes/api.js';

loadEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND = path.join(__dirname, '..', 'frontend');
const PORT = process.env.PORT || 3000;

const app = express();

app.use('/api', api);
app.use(express.static(FRONTEND));

// Fallback to the SPA entry for any non-API GET.
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(FRONTEND, 'index.html'));
});

app.listen(PORT, () => {
  const ai = process.env.DEEPSEEK_API_KEY ? 'live (DeepSeek)' : 'mock';
  console.log(`\n  👁  Stocks Eye running →  http://localhost:${PORT}`);
  console.log(`      Crypto: live (CoinGecko) · Equities/Gold: Yahoo→mock · News: RSS→mock · AI: ${ai}\n`);
});
