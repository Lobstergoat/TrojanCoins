import { listTokens, subscribe } from '../lib/api.js';
import { coinTile, patchLive, progressOf } from '../ui/cards.js';
import { watched, toggleWatch } from '../lib/watch.js';
import { getState } from '../lib/wallet.js';

const SORTS = {
  close: ['Closest to hatching', (a, b) => progressOf(b) - progressOf(a)],
  new: ['Newest', (a, b) => b.createdAt - a.createdAt],
  big: ['Biggest market cap', (a, b) => b.mcap - a.mcap],
  holders: ['Most holders', (a, b) => b.holders - a.holders],
};

export async function mount(el, { query }) {
  const all = await listTokens();
  const f = { q: '', filter: query.get('mine') ? 'mine' : 'all', sort: 'close' };

  el.innerHTML = `
  <div class="page wrap">
    <header class="page__head">
      <h1 class="display">The stable</h1>
      <p class="lede">Every coin that is waiting to hatch, and every one that already has.</p>
    </header>
    <div class="tools">
      <div class="field tools__search"><label class="sr-only" for="q">Search coins</label><input class="input" id="q" type="search" placeholder="Search by name or ticker" autocomplete="off" /></div>
      <div class="chips" role="group" aria-label="Filter">
        ${[['all', 'All'], ['sealed', 'Waiting'], ['hatched', 'Hatched'], ['watch', 'Watching'], ['mine', 'Mine']].map(([k, l]) => `<button class="chip" data-f="${k}" aria-pressed="${k === f.filter}">${l}</button>`).join('')}
      </div>
      <div class="field tools__sort"><label class="sr-only" for="sort">Sort</label><select class="input" id="sort">${Object.entries(SORTS).map(([k, [l]]) => `<option value="${k}">${l}</option>`).join('')}</select></div>
    </div>
    <p class="count" id="count" aria-live="polite"></p>
    <div class="grid" id="grid"></div>
  </div>`;

  const grid = el.querySelector('#grid');
  const draw = () => {
    const w = watched();
    const me = getState().short;
    let list = all.filter((t) => {
      if (f.q && !(`${t.name} ${t.ticker} ${t.reveal?.name || ''}`.toLowerCase().includes(f.q))) return false;
      if (f.filter === 'sealed') return t.status === 'sealed';
      if (f.filter === 'hatched') return t.status === 'hatched';
      if (f.filter === 'watch') return w.has(t.id);
      if (f.filter === 'mine') return me && t.creator === me;
      return true;
    });
    list = [...list].sort(SORTS[f.sort][1]);
    el.querySelector('#count').textContent = `${list.length} ${list.length === 1 ? 'coin' : 'coins'}`;
    grid.innerHTML = list.length
      ? list.map((t) => coinTile(t, { watched: w.has(t.id) })).join('')
      : `<div class="empty"><h2 class="title">${f.filter === 'watch' ? 'Nothing on your watchlist yet' : f.filter === 'mine' ? (me ? 'You have not launched a coin yet' : 'Connect Phantom to see your coins') : 'No coins match'}</h2><p class="muted">${f.filter === 'watch' ? 'Tap the star on any coin to follow it.' : f.filter === 'mine' ? 'Your launches show up here.' : 'Try a different search or filter.'}</p>${f.filter === 'mine' && me ? '<a class="btn" href="#/launch">Launch a coin</a>' : ''}</div>`;
  };
  draw();

  el.querySelector('#q').addEventListener('input', (e) => { f.q = e.target.value.trim().toLowerCase(); draw(); });
  el.querySelector('#sort').addEventListener('change', (e) => { f.sort = e.target.value; draw(); });
  el.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => {
    f.filter = b.dataset.f; el.querySelectorAll('[data-f]').forEach((x) => x.setAttribute('aria-pressed', x === b)); draw();
  }));
  grid.addEventListener('click', (e) => {
    const s = e.target.closest('[data-star]');
    if (!s) return;
    const on = toggleWatch(s.dataset.star);
    s.setAttribute('aria-pressed', on); s.setAttribute('aria-label', on ? 'Remove from watchlist' : 'Add to watchlist');
    if (f.filter === 'watch') draw();
  });
  const unsub = subscribe((t) => patchLive(grid, t));
  return { cleanup: unsub };
}
