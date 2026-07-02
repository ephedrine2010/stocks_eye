// API routes. The frontend uses /api/dashboard (one call renders everything);
// the granular routes are there for modular reuse.

import { Router } from 'express';
import { buildDashboard } from '../services/dashboard.js';

const router = Router();

// One-shot payload: markets + watchlist + brief.
router.get('/dashboard', async (req, res) => {
  try {
    res.json(await buildDashboard());
  } catch (err) {
    console.error('[api] dashboard failed:', err);
    res.status(500).json({ error: 'dashboard_failed' });
  }
});

// Granular: just the markets array.
router.get('/markets', async (req, res) => {
  try {
    const { markets } = await buildDashboard();
    res.json(markets);
  } catch (err) {
    console.error('[api] markets failed:', err);
    res.status(500).json({ error: 'markets_failed' });
  }
});

// Granular: just the roll-up brief.
router.get('/brief', async (req, res) => {
  try {
    const { brief } = await buildDashboard();
    res.json(brief);
  } catch (err) {
    console.error('[api] brief failed:', err);
    res.status(500).json({ error: 'brief_failed' });
  }
});

export default router;
