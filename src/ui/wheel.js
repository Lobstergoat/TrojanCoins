// Navigation is the cart wheel. Tap it and the pages roll out above it.
export const PAGES = [
  { path: '/', label: 'Gates', key: '1', hint: 'Home' },
  { path: '/launch', label: 'Launch', key: '2', hint: 'Build a coin' },
  { path: '/stable', label: 'Stable', key: '3', hint: 'Every live coin' },
  { path: '/unveilings', label: 'Unveilings', key: '4', hint: 'What they became' },
  { path: '/barracks', label: 'Barracks', key: '5', hint: 'Tools and rankings' },
];

const wheelSvg = `
<svg viewBox="0 0 100 100" aria-hidden="true" class="wheel__svg">
  <circle cx="50" cy="50" r="44" fill="var(--timber)" stroke="var(--ink)" stroke-width="5"/>
  <circle cx="50" cy="50" r="33" fill="var(--paper)" stroke="var(--ink)" stroke-width="3"/>
  ${[0, 45, 90, 135].map((a) => `<rect x="47" y="17" width="6" height="66" rx="3" fill="var(--timber-deep)" stroke="var(--ink)" stroke-width="2" transform="rotate(${a} 50 50)"/>`).join('')}
  <circle cx="50" cy="50" r="10" fill="var(--flare)" stroke="var(--ink)" stroke-width="3"/>
  <circle cx="50" cy="50" r="3" fill="var(--ink)"/>
</svg>`;

export function mountWheel(el, go) {
  el.innerHTML = `
    <ul class="wheel__items" id="wheel-items" role="list">
      ${PAGES.map((p, i) => `<li style="--i:${i}"><a class="wheel__pill" href="#${p.path}" data-path="${p.path}" tabindex="-1"><span>${p.label}</span><kbd>${p.key}</kbd></a></li>`).join('')}
    </ul>
    <button class="wheel" aria-expanded="false" aria-controls="wheel-items" aria-label="Open menu">${wheelSvg}</button>
    <span class="wheel__here" aria-live="polite"></span>`;
  const btn = el.querySelector('.wheel');
  const svg = el.querySelector('.wheel__svg');
  const here = el.querySelector('.wheel__here');
  let open = false, turns = 0;
  const links = [...el.querySelectorAll('.wheel__pill')];

  function set(v) {
    open = v;
    el.classList.toggle('is-open', v);
    btn.setAttribute('aria-expanded', String(v));
    links.forEach((a) => (a.tabIndex = v ? 0 : -1));
  }
  function spin(deg) { turns += deg; svg.style.transform = `rotate(${turns}deg)`; }
  btn.addEventListener('click', () => { set(!open); spin(open ? 90 : -90); });
  el.addEventListener('click', (e) => { if (e.target.closest('.wheel__pill')) { set(false); spin(180); } });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { set(false); btn.focus(); } });
  document.addEventListener('pointerdown', (e) => { if (open && !el.contains(e.target)) set(false); });

  return {
    setActive(path) {
      const base = '/' + (path.split('/')[1] || '');
      links.forEach((a) => (a.dataset.path === base ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
      const page = PAGES.find((p) => p.path === base);
      here.textContent = page ? page.label : 'Coin';
    },
    toggle: () => btn.click(),
  };
}
