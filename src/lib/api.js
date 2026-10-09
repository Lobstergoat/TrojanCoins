// Data layer. Every view talks to the backend through this file only.
// Point VITE_API_URL at your service and replace the bodies below;
// the shapes returned here are what the UI expects.
import { SEED_TOKENS, SEED_HEROES } from './data.js';

const API = import.meta.env.VITE_API_URL || '';
const MINE_KEY = 'tc.launches';

let tokens = SEED_TOKENS.map((t) => ({ ...t }));
const listeners = new Set();

const readMine = () => {
  try { return JSON.parse(localStorage.getItem(MINE_KEY) || '[]'); } catch { return []; }
};
const writeMine = (v) => {
  try { localStorage.setItem(MINE_KEY, JSON.stringify(v)); } catch { /* storage unavailable */ }
};

async function remote(path, init) {
  if (!API) return null;
  const res = await fetch(`${API}${path}`, { headers: { 'content-type': 'application/json' }, ...init });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

export async function listTokens() {
  const r = await remote('/tokens').catch(() => null);
  if (r) tokens = r;
  return [...readMine(), ...tokens];
}
export async function getToken(id) {
  const all = await listTokens();
  return all.find((t) => t.id === id) || null;
}
export async function listUnveilings() {
  const all = await listTokens();
  return all.filter((t) => t.status === 'hatched').sort((a, b) => b.hatchedAt - a.hatchedAt);
}
export async function listHeroes() {
  const r = await remote('/leaderboard').catch(() => null);
  return r || SEED_HEROES;
}
export async function getStats() {
  const all = await listTokens();
  const sealed = all.filter((t) => t.status === 'sealed');
  return {
    sealed: sealed.length,
    hatched: all.length - sealed.length,
    volume24h: all.reduce((a, t) => a + (t.volume24h || 0), 0),
    holders: all.reduce((a, t) => a + (t.holders || 0), 0),
  };
}

// Called after the pump.fun transaction confirms.
export async function registerLaunch(launch) {
  await remote('/launches', { method: 'POST', body: JSON.stringify(launch) }).catch(() => null);
  const mine = readMine();
  mine.unshift(launch);
  writeMine(mine);
  return launch;
}

// Live price feed. Swap for a websocket subscription.
export function subscribe(cb) {
  listeners.add(cb);
  const id = setInterval(() => {
    tokens.forEach((t) => {
      if (t.status !== 'sealed') return;
      t.mcap = Math.max(1000, Math.round(t.mcap * (1 + (Math.random() - 0.46) * 0.006)));
      if (t.mcap >= t.target) t.mcap = Math.round(t.target * 0.998);
    });
    listeners.forEach((fn) => fn(tokens));
  }, 2400);
  return () => { listeners.delete(cb); clearInterval(id); };
}
