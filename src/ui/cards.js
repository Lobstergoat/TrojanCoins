import { esc, usd, ago, pct } from '../lib/format.js';

export const progressOf = (t) => Math.min(100, (t.mcap / t.target) * 100);

// A coin as a ledger row: art, name, how close it is to its hatch.
export function coinRow(t) {
  const p = progressOf(t);
  return `
  <a class="row ${p >= 90 ? 'row--hot' : ''}" href="#/token/${t.id}" data-id="${t.id}">
    <img class="row__art" src="${t.image}" alt="" width="64" height="64" />
    <span class="row__name"><b>${esc(t.name)}</b><small>$${esc(t.ticker)} · ${ago(t.createdAt)}</small></span>
    <span class="row__rope"><span class="rope ${p >= 90 ? 'rope--hot' : ''}"><i style="--p:${p.toFixed(1)}"></i></span><small><span data-mc>${usd(t.mcap)}</span> of ${usd(t.target)}</small></span>
    <span class="row__pct"><b data-pct>${pct(p)}</b><small>to hatch</small></span>
  </a>`;
}

export function coinTile(t, { watched = false } = {}) {
  const sealed = t.status === 'sealed';
  const p = progressOf(t);
  const r = t.reveal;
  return `
  <article class="tile ${sealed ? '' : 'tile--hatched'}" data-id="${t.id}">
    <a class="tile__link" href="#/token/${t.id}" aria-label="${esc(t.name)}"></a>
    <div class="tile__art">
      <img src="${sealed ? t.image : r.image}" alt="" width="120" height="120" loading="lazy" />
      ${sealed ? '' : `<img class="tile__was" src="${t.image}" alt="" width="44" height="44" loading="lazy" />`}
    </div>
    <div class="tile__body">
      <h3 class="title">${esc(sealed ? t.name : r.name)}</h3>
      <p class="tile__tick">$${esc(sealed ? t.ticker : r.ticker)}${sealed ? '' : ` <span class="muted">was $${esc(t.ticker)}</span>`}</p>
      <p class="tile__desc">${esc(sealed ? t.desc : r.desc)}</p>
    </div>
    <div class="tile__foot">
      ${sealed
        ? `<span class="rope ${p >= 90 ? 'rope--hot' : ''}"><i style="--p:${p.toFixed(1)}"></i></span>
           <span class="tile__nums"><b data-mc>${usd(t.mcap)}</b><small>${pct(p)} of ${usd(t.target)}</small></span>`
        : `<span class="tag tag--flare">Hatched ${ago(t.hatchedAt)}</span><span class="tile__nums"><b>${usd(t.mcap)}</b><small>at hatch</small></span>`}
    </div>
    <button class="tile__star" aria-pressed="${watched}" aria-label="${watched ? 'Remove from watchlist' : 'Add to watchlist'}" data-star="${t.id}">
      <svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 17l-5.6 3 1.3-6.2L3 9.5l6.3-.7z" /></svg>
    </button>
  </article>`;
}

// Live-update rows/tiles in place without re-rendering.
export function patchLive(root, tokens) {
  tokens.forEach((t) => {
    if (t.status !== 'sealed') return;
    const p = progressOf(t);
    root.querySelectorAll(`[data-id="${t.id}"]`).forEach((el) => {
      el.querySelector('[data-mc]')?.replaceChildren(usd(t.mcap));
      el.querySelector('[data-pct]')?.replaceChildren(pct(p));
      el.querySelector('.rope > i')?.style.setProperty('--p', p.toFixed(1));
    });
  });
}
