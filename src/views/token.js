import { getToken, subscribe } from '../lib/api.js';
import { progressOf } from '../ui/cards.js';
import { compare, wireCompare } from '../ui/compare.js';
import { hatchScene, wireHatch } from '../ui/hatch.js';
import { watched, toggleWatch } from '../lib/watch.js';
import { usd, num, pct, ago, esc, short } from '../lib/format.js';

export async function mount(el, { params, toast }) {
  const t = await getToken(params[0]);
  if (!t) {
    el.innerHTML = `<div class="page wrap"><div class="empty"><h1 class="display">No such horse</h1><p class="lede">We could not find that coin. It may have been removed, or the link is wrong.</p><a class="btn" href="#/stable">Back to the stable</a></div></div>`;
    return {};
  }
  const sealed = t.status === 'sealed';
  const p = progressOf(t);
  const left = Math.max(0, t.target - t.mcap);
  el.innerHTML = `
  <div class="page wrap coin">
    <a class="back link" href="#/stable">All coins</a>
    <div class="coin__grid">
      <div class="coin__art ${sealed ? 'is-sealed' : ''}">
        ${sealed ? `
          <div class="crate"><img src="${t.image}" alt="${esc(t.name)} art" width="360" height="360"/><div class="crate__bands" aria-hidden="true"><i></i><i></i></div></div>
          <p class="coin__cargo"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 11V8a5 5 0 0110 0v3M5 11h14v10H5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>Next identity sealed. It opens at ${usd(t.target)}.</p>`
          : hatchScene(t)}
      </div>
      <div class="coin__info">
        <div class="coin__tags">${sealed ? '<span class="tag">Waiting to hatch</span>' : `<span class="tag tag--flare">Hatched ${ago(t.hatchedAt)}</span>`}<span class="tag tag--soft">Launched ${ago(t.createdAt)}</span></div>
        <h1 class="display coin__name">${esc(sealed ? t.name : t.reveal.name)}</h1>
        <p class="coin__tick">$${esc(sealed ? t.ticker : t.reveal.ticker)}${sealed ? '' : ` <span class="muted">was $${esc(t.ticker)}</span>`}</p>
        <p class="lede">${esc(sealed ? t.desc : t.reveal.desc)}</p>

        ${sealed ? `
        <div class="meter">
          <div class="meter__top"><b id="pct" class="display">${pct(p, 1)}</b><span>to the hatch</span></div>
          <span class="rope ${p >= 90 ? 'rope--hot' : ''}"><i id="rope" style="--p:${p.toFixed(1)}"></i></span>
          <div class="meter__bot"><span><b id="mc">${usd(t.mcap)}</b> now</span><span id="left">${usd(left)} to go</span><span><b>${usd(t.target)}</b> target</span></div>
        </div>` : `<div id="cmp-host">${compare(t)}</div>`}

        <dl class="stats">
          <div><dt>Market cap</dt><dd>${usd(t.mcap)}</dd></div>
          <div><dt>24h volume</dt><dd>${usd(t.volume24h || 0)}</dd></div>
          <div><dt>Holders</dt><dd>${num(t.holders)}</dd></div>
          <div><dt>Creator</dt><dd>${esc(short(t.creator))}</dd></div>
        </dl>

        <div class="coin__actions">
          <a class="btn btn--lg" href="https://pump.fun/coin/${encodeURIComponent(t.mint)}" target="_blank" rel="noopener">Trade on pump.fun</a>
          <button class="btn btn--lg btn--ghost" id="watch" aria-pressed="false"></button>
          <button class="btn btn--lg btn--ghost" id="share">Share</button>
        </div>
        <div class="mint"><span>Contract</span><code>${esc(t.mint)}</code><button class="link" id="copy">Copy</button></div>
      </div>
    </div>
  </div>`;

  const w = el.querySelector('#watch');
  const paintW = () => { const on = watched().has(t.id); w.setAttribute('aria-pressed', on); w.textContent = on ? 'Watching' : 'Watch'; };
  paintW();
  w.onclick = () => { const on = toggleWatch(t.id); paintW(); toast(on ? 'Added to your watchlist.' : 'Removed from your watchlist.'); };
  el.querySelector('#copy').onclick = () => { navigator.clipboard?.writeText(t.mint); toast('Contract copied.'); };
  el.querySelector('#share').onclick = async () => {
    const url = location.href;
    try { if (navigator.share) await navigator.share({ title: t.name, url }); else { await navigator.clipboard.writeText(url); toast('Link copied.'); } } catch { /* share closed */ }
  };
  wireCompare(el); wireHatch(el);

  let unsub = () => {};
  if (sealed) {
    unsub = subscribe((all) => {
      const live = all.find((x) => x.id === t.id); if (!live) return;
      const pp = progressOf(live);
      el.querySelector('#pct').textContent = pct(pp, 1);
      el.querySelector('#rope').style.setProperty('--p', pp.toFixed(1));
      el.querySelector('#mc').textContent = usd(live.mcap);
      el.querySelector('#left').textContent = `${usd(Math.max(0, live.target - live.mcap))} to go`;
    });
  }
  return { cleanup: unsub };
}
