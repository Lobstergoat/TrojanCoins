import { listUnveilings } from '../lib/api.js';
import { compare, wireCompare } from '../ui/compare.js';
import { esc, ago, usd } from '../lib/format.js';

export async function mount(el) {
  const list = await listUnveilings();
  let cur = list[0];
  el.innerHTML = `
  <div class="page wrap">
    <header class="page__head">
      <h1 class="display">Unveilings</h1>
      <p class="lede">Every hatch, newest first. Drag the divider to see what each coin was and what it became.</p>
    </header>
    ${list.length ? `
    <div class="unv">
      <div class="unv__stage" id="stage">${compare(cur)}</div>
      <ul class="unv__list" role="list">
        ${list.map((t) => `
          <li><button class="unv__item" data-id="${t.id}" aria-pressed="${t === cur}">
            <img src="${t.image}" alt="" width="52" height="52"/><i aria-hidden="true">→</i><img src="${t.reveal.image}" alt="" width="52" height="52"/>
            <span class="unv__names"><b>${esc(t.reveal.name)}</b><small>was ${esc(t.name)}</small></span>
            <span class="unv__meta"><b>${usd(t.mcap)}</b><small>${ago(t.hatchedAt)}</small></span>
          </button></li>`).join('')}
      </ul>
    </div>` : `<div class="empty"><h2 class="title">Nothing has hatched yet</h2><p class="muted">When a coin reaches its target, the unveiling shows up here.</p><a class="btn" href="#/launch">Launch a coin</a></div>`}
  </div>`;
  const stage = el.querySelector('#stage');
  if (stage) {
    wireCompare(stage);
    el.querySelectorAll('.unv__item').forEach((b) => b.addEventListener('click', () => {
      cur = list.find((t) => t.id === b.dataset.id);
      el.querySelectorAll('.unv__item').forEach((x) => x.setAttribute('aria-pressed', x === b));
      stage.innerHTML = compare(cur); wireCompare(stage);
      if (window.innerWidth < 960) stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }));
  }
  return {};
}
