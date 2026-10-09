// Pins the single WebGL horse to whichever [data-horse-stage] element is most in view.
export function startStage(horse, canvas) {
  const vfov = () => (window.innerWidth / window.innerHeight < 0.9 ? 42 : 30);
  let on = true;
  function tick() {
    requestAnimationFrame(tick);
    const stages = document.querySelectorAll('[data-horse-stage]');
    let best = null, bestArea = 0;
    const vh = window.innerHeight, vw = window.innerWidth;
    stages.forEach((el) => {
      const r = el.getBoundingClientRect();
      const w = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
      const h = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      const a = w * h;
      if (a > bestArea && a > 0.22 * r.width * r.height) { bestArea = a; best = { el, r }; }
    });
    if (!best) {
      if (on) { on = false; canvas.style.opacity = '0'; horse.pause(); }
      return;
    }
    if (!on) { on = true; canvas.style.opacity = '1'; horse.resume(); }
    const { el, r } = best;
    const d = el.dataset;
    const fov = (vfov() * Math.PI) / 180;
    const dist = 17;
    const worldH = 2 * Math.tan(fov / 2) * dist; // world units spanning the viewport height
    const unitPx = (6.9 / worldH) * vh; // pixel height of horse at scale 1
    const fit = Math.min(r.height / unitPx, (r.width / vw) * (worldH * (vw / vh)) / 7.4);
    const s = fit * parseFloat(d.fit || '1');
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const wx = ((cx / vw) - 0.5) * worldH * (vw / vh);
    const wy = -((cy / vh) - 0.5) * worldH + 2.7 - 4.2 * 0.0;
    horse.setPose({
      x: wx, y: wy - 3.3 * s, s,
      speed: parseFloat(d.speed || '0.38'),
      hatch: parseFloat(d.hatch || '0'),
      tilt: parseFloat(d.tilt || '0'),
    });
  }
  requestAnimationFrame(tick);

  // drag + knock
  let startX = 0, moved = 0;
  document.addEventListener('pointerdown', (e) => {
    const st = e.target.closest?.('[data-horse-stage]');
    if (!st) return;
    startX = e.clientX; moved = 0; horse.drag.start(e.clientX);
    st.setPointerCapture?.(e.pointerId);
    st.classList.add('is-grabbing');
    const mv = (ev) => { moved += Math.abs(ev.clientX - startX); startX = ev.clientX; horse.drag.move(ev.clientX); };
    const up = () => {
      horse.drag.end(); st.classList.remove('is-grabbing');
      st.removeEventListener('pointermove', mv); st.removeEventListener('pointerup', up); st.removeEventListener('pointercancel', up);
      if (moved < 6) st.dispatchEvent(new CustomEvent('horse:knock', { bubbles: true, detail: { x: e.clientX, y: e.clientY } }));
    };
    st.addEventListener('pointermove', mv); st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up);
  });
  document.addEventListener('horse:knock', () => horse.knock());
}
