// AI advice service — per-market "AI Take" + roll-up "Morning Brief".
//
// Default (keyless): returns grounded mock text from the mock dataset.
// With ANTHROPIC_API_KEY set (and `npm i @anthropic-ai/sdk`): calls Claude
// (claude-opus-4-8) with the web-search tool, grounded on the provided snapshot.
// Any failure falls back to mock — the app never breaks on the AI layer.
//
// Design (see docs/03): ONE call per market, grounded on real numbers, cited,
// never inventing prices. This module keeps the two AI calls separated.

import { makeTake } from '../../core/normalizer.js';
import { ADVICE, BRIEF } from '../mock/marketData.js';
import { wrap } from '../../core/cache.js';

const MODEL = 'claude-opus-4-8';
const hasKey = () => !!process.env.ANTHROPIC_API_KEY;

let _client;
async function client() {
  if (_client) return _client;
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  _client = new Anthropic();
  return _client;
}

const SYSTEM = `You are a market analyst for a dashboard called Stocks Eye.
Rules:
- Use ONLY the numbers provided in the snapshot for prices and levels. NEVER invent figures.
- Use web search only for context and breaking news, and cite sources.
- Output is informational, NOT investment advice.
- Reply with a compact JSON object: {"sentiment":"bull|bear|neut","text":"1-2 sentences","citations":["Source"]}.`;

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
  const c = await client();
  const res = await c.messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'high' },
    tools: [{ type: 'web_search_20260209', name: 'web_search' }],
    system: SYSTEM,
    messages: [{
      role: 'user',
      content: `Market snapshot (ground truth):\n${JSON.stringify(snapshot)}\n\nWrite today's AI Take for ${market.name}.`,
    }],
  });
  const textBlock = [...res.content].reverse().find((b) => b.type === 'text');
  const obj = parseJson(textBlock?.text || '');
  return makeTake({
    sentiment: ['bull', 'bear', 'neut'].includes(obj.sentiment) ? obj.sentiment : 'neut',
    text: obj.text || '',
    citations: Array.isArray(obj.citations) ? obj.citations : [],
    source: 'claude-opus-4-8',
  });
}

export async function getTake(market, snapshot) {
  return wrap(`take:${market.id}`, 30 * 60_000, async () => {
    if (!hasKey()) return mockTake(market.id);
    try { return await realTake(market, snapshot); }
    catch { return mockTake(market.id); }
  });
}

// ---- Roll-up Morning Brief ----------------------------------------------

export async function getBrief(markets, snapshots) {
  return wrap('brief', 30 * 60_000, async () => {
    if (!hasKey()) return { ...BRIEF, source: 'mock' };
    try {
      const c = await client();
      const res = await c.messages.create({
        model: MODEL,
        max_tokens: 1600,
        thinking: { type: 'adaptive' },
        output_config: { effort: 'high' },
        tools: [{ type: 'web_search_20260209', name: 'web_search' }],
        system: `${SYSTEM}\nFor the brief, reply with {"lead":"...","lines":[{"id","name","s","text"}],"hint":"...","citations":[...]}`,
        messages: [{
          role: 'user',
          content: `Snapshots (ground truth):\n${JSON.stringify(snapshots)}\n\nWrite today's roll-up Morning Brief across all markets.`,
        }],
      });
      const textBlock = [...res.content].reverse().find((b) => b.type === 'text');
      const obj = parseJson(textBlock?.text || '');
      return { ...obj, source: 'claude-opus-4-8' };
    } catch {
      return { ...BRIEF, source: 'mock' };
    }
  });
}

export default { getTake, getBrief };
