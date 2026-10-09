import { esc } from '../lib/format.js';

// Replayable hatch animation: the crate shakes, the lid pops, the new coin steps out.
export function hatchScene(t) {
  const r = t.reveal;
  return `
  <div class="hatch" data-hatch>
    <div class="hatch__ring"></div><div class="hatch__ring hatch__ring--2"></div>
    <div class="hatch__before"><img src="${t.image}" alt="" width="200" height="200"/><b>${esc(t.name)}</b><small>$${esc(t.ticker)}</small></div>
    <svg class="hatch__crate" viewBox="0 0 220 200" aria-hidden="true">
      <rect x="20" y="60" width="180" height="130" rx="8" fill="#c99a5b" stroke="#0a1f3d" stroke-width="5"/>
      <path d="M20 100h180M20 140h180" stroke="#8a5a2b" stroke-width="5"/>
      <rect x="20" y="60" width="26" height="130" fill="#8a5a2b" opacity=".4"/><rect x="174" y="60" width="26" height="130" fill="#8a5a2b" opacity=".4"/>
      <g class="hatch__lid"><rect x="12" y="38" width="196" height="30" rx="8" fill="#8a5a2b" stroke="#0a1f3d" stroke-width="5"/></g>
      <circle cx="110" cy="132" r="14" fill="#d9a441" stroke="#0a1f3d" stroke-width="4"/><rect x="106" y="132" width="8" height="16" fill="#0a1f3d"/>
    </svg>
    <div class="hatch__after"><img src="${r.image}" alt="" width="200" height="200"/><b>${esc(r.name)}</b><small>$${esc(r.ticker)}</small></div>
    <button class="btn btn--sm hatch__replay" type="button">Replay the hatch</button>
  </div>`;
}
export function wireHatch(root) {
  const h = root.querySelector('[data-hatch]');
  if (!h) return;
  const play = () => { h.classList.remove('go'); void h.offsetWidth; h.classList.add('go'); };
  h.querySelector('.hatch__replay').addEventListener('click', play);
  const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { io.disconnect(); play(); } }, { threshold: 0.5 });
  io.observe(h);
}
