// Three illustrated residents of the horse. Their eyes follow the cursor and
// each one answers when you click them.

const eye = (cx, cy, r, extra = '') =>
  `<g class="eye" data-cx="${cx}" data-cy="${cy}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="#0a1f3d" stroke-width="3"/><circle class="pupil" cx="${cx}" cy="${cy}" r="${r * 0.48}" fill="#0a1f3d"/>${extra}</g>`;

const SINON = `
<svg viewBox="0 0 240 320" class="char__svg" role="img" aria-label="Sinon, wearing a bronze helmet with a flare-red crest">
  <ellipse cx="120" cy="306" rx="82" ry="9" fill="#0a1f3d" opacity=".14"/>
  <g class="char__body">
    <path d="M52 312c0-62 20-116 68-116s68 54 68 116z" fill="#1f4fe0" stroke="#0a1f3d" stroke-width="4"/>
    <path d="M86 204l34 40 34-40" fill="none" stroke="#eef2ee" stroke-width="6" stroke-linejoin="round"/>
    <rect x="52" y="262" width="136" height="14" fill="#eef2ee" opacity=".9"/>
    <g class="char__arm"><path d="M178 238c26 8 38 30 30 52" fill="none" stroke="#0a1f3d" stroke-width="22" stroke-linecap="round"/><path d="M178 238c26 8 38 30 30 52" fill="none" stroke="#1f4fe0" stroke-width="14" stroke-linecap="round"/>
      <g transform="translate(200 280)"><rect x="-16" y="-6" width="34" height="18" rx="4" fill="#c99a5b" stroke="#0a1f3d" stroke-width="3"/><rect x="-10" y="-20" width="8" height="16" fill="#c99a5b" stroke="#0a1f3d" stroke-width="3"/><circle cx="14" cy="-2" r="3" fill="#0a1f3d"/></g></g>
    <rect x="104" y="170" width="32" height="34" rx="10" fill="#f0c398" stroke="#0a1f3d" stroke-width="4"/>
    <circle cx="120" cy="124" r="56" fill="#f0c398" stroke="#0a1f3d" stroke-width="4"/>
    ${eye(98, 128, 12)}${eye(144, 128, 12)}
    <path d="M84 106l26 6" stroke="#0a1f3d" stroke-width="5" stroke-linecap="round"/><path d="M134 112l26-12" stroke="#0a1f3d" stroke-width="5" stroke-linecap="round"/>
    <path class="mouth" d="M98 158q26 18 46-6" fill="none" stroke="#0a1f3d" stroke-width="5" stroke-linecap="round"/>
    <path d="M62 112a58 54 0 01116 0z" fill="#d9a441" stroke="#0a1f3d" stroke-width="4"/>
    <path d="M120 58c-6-22 12-34 36-26-10 6-14 16-12 26z" fill="#ff5a36" stroke="#0a1f3d" stroke-width="4" stroke-linejoin="round"/>
    <rect x="58" y="106" width="124" height="12" rx="6" fill="#d9a441" stroke="#0a1f3d" stroke-width="4"/>
  </g>
</svg>`;

const CASSANDRA = `
<svg viewBox="0 0 240 320" class="char__svg" role="img" aria-label="Cassandra, wearing a laurel wreath with a hand raised to her cheek">
  <ellipse cx="120" cy="306" rx="82" ry="9" fill="#0a1f3d" opacity=".14"/>
  <g class="char__body">
    <path d="M48 312c0-66 24-118 72-118s72 52 72 118z" fill="#eef2ee" stroke="#0a1f3d" stroke-width="4"/>
    <path d="M70 214c20 20 80 20 100 0" fill="none" stroke="#1f4fe0" stroke-width="10"/>
    <path d="M56 288h128" stroke="#1f4fe0" stroke-width="10"/>
    <path d="M62 140c-18 50-10 100 18 120l20-30 40 0 20 30c28-20 36-70 18-120z" fill="#0a1f3d" opacity=".0"/>
    <path d="M60 130c-14 54-4 98 20 118l16-46h48l16 46c24-20 34-64 20-118z" fill="#16315a" stroke="#0a1f3d" stroke-width="4"/>
    <rect x="104" y="170" width="32" height="34" rx="10" fill="#e5b088" stroke="#0a1f3d" stroke-width="4"/>
    <circle cx="120" cy="124" r="54" fill="#e5b088" stroke="#0a1f3d" stroke-width="4"/>
    <path d="M66 118c4-44 36-60 70-52 26 6 40 28 38 52-22-6-44-24-52-40-10 22-30 36-56 40z" fill="#16315a" stroke="#0a1f3d" stroke-width="4" stroke-linejoin="round"/>
    ${eye(100, 130, 14)}${eye(142, 130, 14)}
    <path d="M84 104q14-10 28-2M132 102q14-8 28 2" fill="none" stroke="#0a1f3d" stroke-width="5" stroke-linecap="round"/>
    <ellipse class="mouth" cx="121" cy="164" rx="8" ry="10" fill="#0a1f3d"/>
    <g class="char__arm"><path d="M178 262c24-10 30-44 6-72" fill="none" stroke="#0a1f3d" stroke-width="22" stroke-linecap="round"/><path d="M178 262c24-10 30-44 6-72" fill="none" stroke="#eef2ee" stroke-width="14" stroke-linecap="round"/><circle cx="170" cy="168" r="14" fill="#e5b088" stroke="#0a1f3d" stroke-width="4"/></g>
    ${[0, 1, 2, 3, 4, 5, 6].map((i) => { const a = Math.PI + (i / 6) * Math.PI; const x = 120 + Math.cos(a) * 58, y = 112 + Math.sin(a) * 56; return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="11" ry="6" fill="#0f8a5f" stroke="#0a1f3d" stroke-width="3" transform="rotate(${(a * 180 / Math.PI + 90).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; }).join('')}
  </g>
</svg>`;

const SENTRY = `
<svg viewBox="0 0 240 320" class="char__svg" role="img" aria-label="The Sentry, a sleepy guard leaning on a spear">
  <ellipse cx="120" cy="306" rx="82" ry="9" fill="#0a1f3d" opacity=".14"/>
  <g class="char__body">
    <rect x="186" y="40" width="10" height="266" rx="5" fill="#c99a5b" stroke="#0a1f3d" stroke-width="4"/>
    <path d="M191 8l16 36h-32z" fill="#d9a441" stroke="#0a1f3d" stroke-width="4" stroke-linejoin="round"/>
    <path d="M50 312c0-62 20-116 70-116s70 54 70 116z" fill="#d9a441" stroke="#0a1f3d" stroke-width="4"/>
    <path d="M70 232h100M64 264h112" stroke="#0a1f3d" stroke-width="4" opacity=".4"/>
    <circle cx="120" cy="226" r="14" fill="#1f4fe0" stroke="#0a1f3d" stroke-width="4"/>
    <rect x="104" y="172" width="32" height="32" rx="10" fill="#d1a070" stroke="#0a1f3d" stroke-width="4"/>
    <circle cx="120" cy="126" r="54" fill="#d1a070" stroke="#0a1f3d" stroke-width="4"/>
    <g class="eye sleepy" data-cx="98" data-cy="134"><circle cx="98" cy="134" r="11" fill="#fff" stroke="#0a1f3d" stroke-width="3"/><circle class="pupil" cx="98" cy="136" r="5" fill="#0a1f3d"/><path d="M85 134a13 13 0 0126 0z" fill="#d1a070" stroke="#0a1f3d" stroke-width="3"/></g>
    <g class="eye sleepy" data-cx="142" data-cy="134"><circle cx="142" cy="134" r="11" fill="#fff" stroke="#0a1f3d" stroke-width="3"/><circle class="pupil" cx="142" cy="136" r="5" fill="#0a1f3d"/><path d="M129 134a13 13 0 0126 0z" fill="#d1a070" stroke="#0a1f3d" stroke-width="3"/></g>
    <path d="M102 164q18 6 36 0" fill="none" stroke="#0a1f3d" stroke-width="5" stroke-linecap="round" class="mouth"/>
    <path d="M62 116a58 54 0 01116 0z" fill="#9aa6b8" stroke="#0a1f3d" stroke-width="4"/>
    <path d="M114 60h12v-22h-12z" fill="#1f4fe0" stroke="#0a1f3d" stroke-width="4"/>
    <path d="M120 38c-30-4-44 12-40 36M120 38c30-4 44 12 40 36" fill="none" stroke="#1f4fe0" stroke-width="10" stroke-linecap="round"/>
    <rect x="58" y="110" width="124" height="12" rx="6" fill="#9aa6b8" stroke="#0a1f3d" stroke-width="4"/>
    <g class="zzz" fill="#1f4fe0" font-family="Bricolage Grotesque Variable, sans-serif" font-weight="800"><text x="168" y="86" font-size="24">z</text><text x="184" y="62" font-size="32">z</text><text x="204" y="32" font-size="40">z</text></g>
  </g>
</svg>`;

export const CHARACTERS = {
  sinon: { name: 'Sinon', role: 'Launch tips', svg: SINON },
  cassandra: { name: 'Cassandra', role: 'Risk notes', svg: CASSANDRA },
  sentry: { name: 'The Sentry', role: 'Gate status', svg: SENTRY },
};

export function trackEyes(root) {
  const eyes = [...root.querySelectorAll('.eye')];
  let raf = 0, px = 0, py = 0;
  const update = () => {
    raf = 0;
    for (const e of eyes) {
      const pupil = e.querySelector('.pupil');
      const r = e.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = px - cx, dy = py - cy;
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 220) * (e.classList.contains('sleepy') ? 2.5 : 5);
      pupil.style.transform = `translate(${((dx / d) * k).toFixed(2)}px, ${((dy / d) * k).toFixed(2)}px)`;
    }
  };
  const move = (ev) => { px = ev.clientX; py = ev.clientY; if (!raf) raf = requestAnimationFrame(update); };
  window.addEventListener('pointermove', move, { passive: true });
  return () => window.removeEventListener('pointermove', move);
}
