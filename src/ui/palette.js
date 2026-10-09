import { PAGES } from './wheel.js';
import { listTokens } from '../lib/api.js';
import { esc, usd } from '../lib/format.js';

let el, input, list, items = [], idx = 0, all = [];

export async function openPalette(go) {
  if (el) return;
  all = await listTokens();
  el = document.createElement('div');
  el.className = 'palette';
  el.innerHTML = `
    <div class="palette__scrim"></div>
    <div class="palette__box" role="dialog" aria-modal="true" aria-label="Jump to">
      <input class="palette__input" placeholder="Jump to a page or search coins" aria-label="Search" autocomplete="off" spellcheck="false" />
      <ul class="palette__list" role="listbox"></ul>
      <div class="palette__foot"><span>Enter to open</span><span>Esc to close</span></div>
    </div>`;
  document.getElementById('overlays').append(el);
  input = el.querySelector('input'); list = el.querySelector('ul');
  requestAnimationFrame(() => el.classList.add('in'));
  input.focus();
  render('');
  input.addEventListener('input', () => render(input.value));
  el.querySelector('.palette__scrim').addEventListener('click', close);
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowDown') { e.preventDefault(); sel(idx + 1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); sel(idx - 1); }
    if (e.key === 'Enter' && items[idx]) { go(items[idx].path); close(); }
    if (e.key === 'Tab') { e.preventDefault(); input.focus(); }
  });
  list.addEventListener('click', (e) => {
    const li = e.target.closest('li'); if (li) { go(items[+li.dataset.i].path); close(); }
  });
  function render(q) {
    q = q.trim().toLowerCase();
    const pages = PAGES.filter((p) => !q || p.label.toLowerCase().includes(q) || p.hint.toLowerCase().includes(q))
      .map((p) => ({ path: p.path, title: p.label, sub: p.hint, tag: 'Page' }));
    const coins = all.filter((t) => q && (t.name.toLowerCase().includes(q) || t.ticker.toLowerCase().includes(q)))
      .slice(0, 6).map((t) => ({ path: `/token/${t.id}`, title: t.name, sub: `$${t.ticker} · ${usd(t.mcap)}`, tag: 'Coin', img: t.image }));
    items = [...pages, ...coins];
    idx = 0;
    list.innerHTML = items.length
      ? items.map((it, i) => `<li role="option" data-i="${i}" ${i === 0 ? 'aria-selected="true"' : ''}>${it.img ? `<img src="${it.img}" alt="" />` : '<span class="palette__dot"></span>'}<b>${esc(it.title)}</b><i>${esc(it.sub)}</i><em>${it.tag}</em></li>`).join('')
      : `<li class="palette__empty">No match. Try a coin name or ticker.</li>`;
  }
  function sel(n) {
    if (!items.length) return;
    idx = (n + items.length) % items.length;
    [...list.children].forEach((li, i) => { li.toggleAttribute('aria-selected', i === idx); if (i === idx) li.scrollIntoView({ block: 'nearest' }); });
  }
}
export function close() {
  if (!el) return;
  const e = el; el = null;
  e.classList.remove('in'); setTimeout(() => e.remove(), 200);
}
