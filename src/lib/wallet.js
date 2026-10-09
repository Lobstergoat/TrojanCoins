import { short } from './format.js';

// Phantom connection. Uses the injected provider directly so nothing heavy loads up front.
const listeners = new Set();
const state = { connected: false, address: '', balance: null, connecting: false };

export const getProvider = () => {
  const p = window.phantom?.solana || window.solana;
  return p?.isPhantom ? p : null;
};
export const hasPhantom = () => !!getProvider();
export const getState = () => ({ ...state, short: short(state.address) });
export const onWalletChange = (fn) => { listeners.add(fn); fn(getState()); return () => listeners.delete(fn); };
const emit = () => listeners.forEach((fn) => fn(getState()));

const RPC = import.meta.env.VITE_RPC_URL || 'https://api.mainnet-beta.solana.com';

async function fetchBalance(address) {
  try {
    const res = await fetch(RPC, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getBalance', params: [address] }),
    });
    const j = await res.json();
    return typeof j.result?.value === 'number' ? j.result.value / 1e9 : null;
  } catch { return null; }
}

async function apply(pk) {
  if (!pk) { Object.assign(state, { connected: false, address: '', balance: null }); emit(); return; }
  state.connected = true; state.address = pk.toString(); emit();
  state.balance = await fetchBalance(state.address); emit();
}

export async function connect() {
  const p = getProvider();
  if (!p) { window.open('https://phantom.app/download', '_blank', 'noopener'); throw new Error('Phantom is not installed. Install it, then reload this page.'); }
  state.connecting = true; emit();
  try {
    const { publicKey } = await p.connect();
    await apply(publicKey);
  } finally { state.connecting = false; emit(); }
}

export async function disconnect() {
  const p = getProvider();
  try { await p?.disconnect(); } catch { /* already disconnected */ }
  await apply(null);
}

export function initWallet() {
  const p = getProvider();
  if (!p) return;
  p.on?.('accountChanged', (pk) => (pk ? apply(pk) : apply(null)));
  p.on?.('disconnect', () => apply(null));
  p.connect({ onlyIfTrusted: true }).then(({ publicKey }) => apply(publicKey)).catch(() => {});
}
