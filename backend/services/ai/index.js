// AI advice service — per-market "AI Take" + roll-up "Morning Brief".
//
// Default (keyless): returns grounded mock text from the mock dataset.
// With DEEPSEEK_API_KEY set: calls DeepSeek (deepseek-chat) via its
// OpenAI-compatible HTTP API, grounded on the provided snapshot. DeepSeek has
// no web-search tool, so the model reasons ONLY over the snapshot numbers.
// Any failure falls back to mock — the app never breaks on the AI layer.
//
// Provider note: uses Node's built-in global `fetch` — no SDK dependency.
// (Claude was the previous provider; it's stopped. To re-add it, restore a
//  branch here keyed on ANTHROPIC_API_KEY.)

import { makeTake } from '../../core/normalizer.js';
import { ADVICE, BRIEF } from '../mock/marketData.js';
import { wrap, get as cacheGet, set as cacheSet } from '../../core/cache.js';

const API_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-chat';
const hasKey = () => !!process.env.DEEPSEEK_API_KEY;

// --- Cost control -------------------------------------------------------
// Which layers actually call the live model, and how long results are cached.
// Current choice: "Morning Brief only, once a day". Per-market takes stay on
// mock (no spend) for now. Flip `takes` back to true to re-enable live takes.
const LIVE = { takes: false, brief: true };
const TAKE_TTL = 30 * 60_000;         // 30 min (mock — cheap)
const BRIEF_TTL = 24 * 60 * 60_000;   // once a day — the brief is a daily read

const SYSTEM = `You are a market analyst for a dashboard called Stocks Eye.
Rules:
- Use ONLY the numbers provided in the snapshot for prices and levels. NEVER invent figures.
- You have NO live web access. Do not fabricate news, URLs, or citations. Leave citations empty
  unless you are naming a well-known general source of context.
- Output is informational, NOT investment advice.
- Reply with ONLY a compact JSON object, no prose before or after.`;

// One place that talks to DeepSeek. Returns the raw message content (a JSON
// string, since we request json_object mode). Throws on any non-2xx.
async function deepseek(system, user, maxTokens) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`DeepSeek ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

function parseJson(text) {
  const cleaned = String(text).replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('no json');
  return JSON.parse(cleaned.slice(start, end + 1));
}

// ---- Per-market AI Take -------------------------------------------------

function mockTake(marketId) {
  const a = ADVICE[marketId] || { s: 'neut', text: '', cites: [] };
  return makeTake({ sentiment: a.s, text: a.text, citations: a.cites, source: 'mock' });
}

async function realTake(market, snapshot) {
  const user = `Market snapshot (ground truth):\n${JSON.stringify(snapshot)}\n\n`
    + `Write today's AI Take for ${market.name}. Reply as JSON: `
    + `{"sentiment":"bull|bear|neut","text":"1-2 sentences","citations":["Source"]}.`;
  const obj = parseJson(await deepseek(SYSTEM, user, 1024));
  return makeTake({
    sentiment: ['bull', 'bear', 'neut'].includes(obj.sentiment) ? obj.sentiment : 'neut',
    text: obj.text || '',
    citations: Array.isArray(obj.citations) ? obj.citations : [],
    source: MODEL,
  });
}

export async function getTake(market, snapshot) {
  return wrap(`take:${market.id}`, TAKE_TTL, async () => {
    if (!LIVE.takes || !hasKey()) return mockTake(market.id);
    try { return await realTake(market, snapshot); }
    catch { return mockTake(market.id); }
  });
}

// ---- Roll-up Morning Brief ----------------------------------------------

export async function getBrief(markets, snapshots) {
  // Serve a cached brief if we have one. We ONLY cache successful live results
  // (below) — never the mock fallback — so a transient failure doesn't lock the
  // brief to mock for the whole TTL. A failed load simply retries next time.
  const cached = cacheGet('brief');
  if (cached !== undefined) return cached;

  if (!LIVE.brief || !hasKey()) return { ...BRIEF, source: 'mock' };
  try {
    const user = `Snapshots (ground truth):\n${JSON.stringify(snapshots)}\n\n`
      + `Write today's roll-up Morning Brief across all markets. Reply as JSON: `
      + `{"lead":"...","lines":[{"id":"","name":"","s":"bull|bear|neut","text":""}],"hint":"...","citations":[]}.`;
    const obj = parseJson(await deepseek(SYSTEM, user, 4000));
    const brief = { ...obj, source: MODEL };
    return cacheSet('brief', brief, BRIEF_TTL); // cache ONLY on success
  } catch (err) {
    console.error('[ai] Morning Brief live call failed, using mock:', err?.message || err);
    return { ...BRIEF, source: 'mock' };
  }
}

export default { getTake, getBrief };
