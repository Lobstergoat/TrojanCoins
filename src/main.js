import '@fontsource-variable/bricolage-grotesque/wdth.css';
import '@fontsource-variable/figtree';
import './styles/tokens.css';
import './styles/base.css';
import './styles/shell.css';
import './styles/home.css';
import './styles/pages.css';

import { createHorse } from './lib/horse.js';
import { startStage } from './lib/stage.js';
import { connect, disconnect, initWallet, onWalletChange, hasPhantom } from './lib/wallet.js';
import { mountWheel, PAGES } from './ui/wheel.js';
import { openPalette } from './ui/palette.js';
import { toast } from './ui/toast.js';
import { short, esc } from './lib/format.js';

import * as home from './views/home.js';
import * as launch from './views/launch.js';
import * as stable from './views/stable.js';
import * as token from './views/token.js';
import * as unveilings from './views/unveilings.js';
import * as barracks from './views/barracks.js';

const view = document.getElementById('view');
const bar = document.getElementById('bar');
const canvas = document.getElementById('horse-canvas');

// ── Horse ──
let horse = null;
try {
  horse = createHorse(canvas);
  startStage(horse, canvas);
} catch (err) {
  canvas.remove();
  document.documentElement.classList.add('no-webgl');
}

// ── Gates (page transition) ──
const gates = document.createElement('div');
gates.className = 'gates';
gates.innerHTML = '<i class="gates__l"></i><i class="gates__r"></i>';
document.getElementById('overlays').append(gates);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Shell ──
bar.innerHTML = `
  <a class="logo" href="#/" aria-label="TrojanCoins home">
    <svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="var(--ink)"/><path d="M13 42V31l10-4 4-11 5 2-2 9h14l4 4v11h-5v-7h-4v7h-5v-7h-8v7h-5v-7h-4v7z" fill="var(--timber)"/><circle cx="46" cy="25" r="2.2" fill="var(--flare)"/></svg>
    <span>TrojanCoins</span>
  </a>
  <div class="bar__right">
    <button class="btn btn--ghost btn--sm bar__find" id="find" aria-label="Search and jump"><span>Search</span><kbd>⌘K</kbd></button>
    <div class="wallet" id="wallet"></div>
  </div>`;

const wallet = document.getElementById('wallet');
let menuOpen = false;
onWalletChange((w) => {
  if (!w.connected) {
    menuOpen = false;
    wallet.innerHTML = `<button class="btn btn--sm" id="connect">${w.connecting ? 'Connecting…' : 'Connect Phantom'}</button>`;
    wallet.querySelector('#connect').onclick = async () => {
      try { await connect(); toast('Wallet connected.'); } catch (e) { if (e?.code !== 4001) toast(e.message || 'Could not connect.', { kind: 'error' }); }
    };
  } else {
    wallet.innerHTML = `
      <button class="btn btn--sm btn--wallet" id="wmenu" aria-expanded="${menuOpen}" aria-haspopup="true"><i class="dot"></i>${short(w.address)}</button>
      <div class="wallet__menu" ${menuOpen ? '' : 'hidden'}>
        <div class="wallet__row"><span>Address</span><button class="link" id="copy">${esc(short(w.address))} · Copy</button></div>
        <div class="wallet__row"><span>Balance</span><b>${w.balance == null ? '—' : w.balance.toFixed(3) + ' SOL'}</b></div>
        <a class="wallet__item" href="#/stable?mine=1">My coins</a>
        <button class="wallet__item" id="disc">Disconnect</button>
      </div>`;
    wallet.querySelector('#wmenu').onclick = () => { menuOpen = !menuOpen; wallet.querySelector('.wallet__menu').hidden = !menuOpen; wallet.querySelector('#wmenu').setAttribute('aria-expanded', menuOpen); };
    wallet.querySelector('#copy').onclick = () => { navigator.clipboard?.writeText(w.address); toast('Address copied.'); };
    wallet.querySelector('#disc').onclick = async () => { await disconnect(); toast('Wallet disconnected.'); };
    wallet.querySelector('.wallet__menu a').onclick = () => { menuOpen = false; wallet.querySelector('.wallet__menu').hidden = true; };
  }
});
document.addEventListener('pointerdown', (e) => {
  if (menuOpen && !wallet.contains(e.target)) { menuOpen = false; const m = wallet.querySelector('.wallet__menu'); if (m) m.hidden = true; }
});
initWallet();

window.addEventListener('scroll', () => bar.classList.toggle('bar--solid', window.scrollY > 24), { passive: true });
const go = (path) => { location.hash = '#' + path; };
const wheel = mountWheel(document.getElementById('wheel-nav'), go);
document.getElementById('find').onclick = () => openPalette(go);
document.addEventListener('keydown', (e) => {
  const typing = /input|textarea|select/i.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(go); }
  else if (!typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
    if (e.key === '/') { e.preventDefault(); openPalette(go); }
    const p = PAGES.find((x) => x.key === e.key);
    if (p) go(p.path);
  }
});

// ── Router ──
const routes = [
  [/^\/?$/, home, 'Gates'],
  [/^\/launch$/, launch, 'Launch'],
  [/^\/stable$/, stable, 'Stable'],
  [/^\/token\/([\w-]+)$/, token, 'Coin'],
  [/^\/unveilings$/, unveilings, 'Unveilings'],
  [/^\/barracks$/, barracks, 'Barracks'],
];
let current = null, navId = 0, first = true;
const ctx = { go, toast, horse };

async function render() {
  const id = ++navId;
  const raw = location.hash.slice(1) || '/';
  const [path, query = ''] = raw.split('?');
  const hit = routes.map(([re, mod, title]) => [re.exec(path), mod, title]).find(([m]) => m) || [null, home, 'Gates'];
  const [match, mod, title] = hit;

  if (!first && !reduced) { gates.classList.add('shut'); await wait(300); }
  if (id !== navId) return;
  current?.cleanup?.();
  window.scrollTo(0, 0);
  wheel.setActive(path);
  document.title = title === 'Gates' ? 'TrojanCoins' : `${title} · TrojanCoins`;
  document.body.dataset.route = path.split('/')[1] || 'home';
  view.innerHTML = '';
  current = await mod.mount(view, { ...ctx, params: match ? match.slice(1) : [], query: new URLSearchParams(query) });
  view.focus({ preventScroll: true });
  if (!first && !reduced) { await wait(60); gates.classList.remove('shut'); }
  first = false;
}
window.addEventListener('hashchange', render);
render();
