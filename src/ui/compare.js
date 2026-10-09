import { esc, ago, usd } from '../lib/format.js';

// Before/after wipe. The range input does the dragging and gives keyboard + screen reader support.
export function compare(t) {
  const r = t.reveal;
  return `
  <div class="cmp" style="--pos:50" data-cmp>
    <div class="cmp__pane cmp__pane--after">
      <img src="${r.image}" alt="" width="260" height="260" />
      <div class="cmp__txt"><span class="tag tag--flare">After · hatched ${ago(t.hatchedAt)}</span><h3 class="display">${esc(r.name)}</h3><p>$${esc(r.ticker)}</p><small>${esc(r.desc)}</small></div>
    </div>
    <div class="cmp__pane cmp__pane--before">
      <img src="${t.image}" alt="" width="260" height="260" />
      <div class="cmp__txt"><span class="tag tag--soft">Before</span><h3 class="display">${esc(t.name)}</h3><p>$${esc(t.ticker)}</p><small>${esc(t.desc)}</small></div>
    </div>
    <div class="cmp__bar" aria-hidden="true"><span><svg viewBox="0 0 24 24" width="22" height="22"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div>
    <input class="cmp__range" type="range" min="0" max="100" value="50" aria-label="Reveal ${esc(r.name)}: drag to compare before and after" />
    <div class="cmp__meta"><span>Hatched at ${usd(t.mcap)}</span><span>Target ${usd(t.target)}</span></div>
  </div>`;
}

export function wireCompare(root) {
  const cmp = root.querySelector('[data-cmp]');
  if (!cmp) return;
  const range = cmp.querySelector('input');
  const set = (v) => cmp.style.setProperty('--pos', v);
  range.addEventListener('input', () => set(range.value));
  // little intro nudge so people know it moves
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced) {
    let t0 = null;
    const io = new IntersectionObserver((en) => {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      const step = (ts) => {
        t0 ??= ts;
        const k = (ts - t0) / 1400;
        if (k >= 1) { set(50); range.value = 50; return; }
        const v = 50 + Math.sin(k * Math.PI * 2) * 22 * (1 - k);
        set(v); range.value = v; requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(cmp);
  }
}
