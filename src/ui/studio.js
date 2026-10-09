import { GLYPH_KEYS, PALETTES, discArt } from '../lib/art.js';

// Art picker for the launch form: draw a mascot disc or upload your own image.
export function studio(host, onChange) {
  let mode = 'draw', glyph = 'frog', pal = 0, file = null, url = '';
  const glyphs = GLYPH_KEYS.map((g) => `<button type="button" class="glyph" data-g="${g}" aria-label="${g}" aria-pressed="${g === glyph}"><img src="${discArt(g, 0, { ring: false })}" alt="" width="44" height="44"/></button>`).join('');
  const pals = PALETTES.map(([a, b], i) => `<button type="button" class="swatch" data-p="${i}" aria-label="Colour ${i + 1}" aria-pressed="${i === pal}" style="--a:${a};--b:${b}"></button>`).join('');
  host.innerHTML = `
    <div class="studio">
      <div class="studio__tabs" role="tablist" aria-label="Coin art">
        <button type="button" class="chip" role="tab" data-mode="draw" aria-selected="true">Make a mascot</button>
        <button type="button" class="chip" role="tab" data-mode="upload" aria-selected="false">Upload art</button>
      </div>
      <div class="studio__draw">
        <div class="glyphs" role="group" aria-label="Mascot">${glyphs}</div>
        <div class="swatches" role="group" aria-label="Colours">${pals}</div>
      </div>
      <label class="drop" hidden>
        <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" />
        <span class="drop__msg"><b>Drop an image here</b><small>PNG, JPG, GIF or WebP. Up to 5 MB. Square works best.</small></span>
        <img class="drop__img" alt="" hidden />
      </label>
    </div>`;
  const draw = host.querySelector('.studio__draw');
  const drop = host.querySelector('.drop');
  const input = drop.querySelector('input');
  const img = drop.querySelector('.drop__img');
  const msg = drop.querySelector('.drop__msg');

  async function rasterise(src) {
    const im = new Image(); im.src = src; await im.decode();
    const c = document.createElement('canvas'); c.width = c.height = 512;
    c.getContext('2d').drawImage(im, 0, 0, 512, 512);
    return new Promise((res) => c.toBlob((b) => res(new File([b], 'coin.png', { type: 'image/png' })), 'image/png'));
  }
  async function emit() {
    if (mode === 'draw') { url = discArt(glyph, pal); file = await rasterise(url); }
    onChange({ file, url, mode });
  }
  host.addEventListener('click', (e) => {
    const m = e.target.closest('[data-mode]'), g = e.target.closest('[data-g]'), p = e.target.closest('[data-p]');
    if (m) {
      mode = m.dataset.mode;
      host.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-selected', b === m));
      draw.hidden = mode !== 'draw'; drop.hidden = mode !== 'upload';
      if (mode === 'upload') { file = input.files[0] || null; url = img.src && !img.hidden ? img.src : ''; onChange({ file, url, mode }); } else emit();
    }
    if (g) { glyph = g.dataset.g; host.querySelectorAll('[data-g]').forEach((b) => b.setAttribute('aria-pressed', b === g)); emit(); }
    if (p) { pal = +p.dataset.p; host.querySelectorAll('[data-p]').forEach((b) => b.setAttribute('aria-pressed', b === p)); emit(); }
  });
  const take = (f) => {
    if (!f) return;
    if (!/^image\//.test(f.type)) return onChange({ file: null, url: '', mode, error: 'That file is not an image.' });
    if (f.size > 5 * 1024 * 1024) return onChange({ file: null, url: '', mode, error: 'That image is over 5 MB. Pick a smaller one.' });
    file = f; url = URL.createObjectURL(f);
    img.src = url; img.hidden = false; msg.hidden = true; drop.classList.add('has');
    onChange({ file, url, mode });
  };
  input.addEventListener('change', () => take(input.files[0]));
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => take(e.dataTransfer.files[0]));
  emit();
  return { get: () => ({ file, url, mode }), setGlyph(g) { glyph = g; emit(); } };
}
