import { studio } from '../ui/studio.js';
import { randomIdea } from '../lib/ideas.js';
import { usd, esc, MC_MIN, MC_MAX, mcFromT, tFromMc, short } from '../lib/format.js';
import { connect, getState, onWalletChange, hasPhantom } from '../lib/wallet.js';
import { registerLaunch } from '../lib/api.js';

const PRESETS = [69_000, 420_000, 1_000_000, 6_900_000];
const tier = (mc) =>
  mc < 80_000 ? ['Quick hatch', 'Opens early. Good for a first test.'] :
  mc < 400_000 ? ['Steady siege', 'Time to build a crowd before the hatch.'] :
  mc < 2_000_000 ? ['Long siege', 'Needs real momentum to open.'] : ['Legend', 'Very few coins ever get here.'];

const STEPS = [
  ['art', 'Pinning your art'],
  ['build', 'Building the transaction'],
  ['sign', 'Waiting for Phantom'],
  ['confirm', 'Confirming on Solana'],
];

export async function mount(el, { toast, go }) {
  const draft = (() => { try { return JSON.parse(sessionStorage.getItem('tc.draft') || 'null'); } catch { return null; } })();
  const state = { name: draft?.name || '', ticker: draft?.ticker || '', desc: draft?.desc || '', target: 420_000, dev: '0', tw: '', tg: '', web: '', art: { file: null, url: '' } };
  try { sessionStorage.removeItem('tc.draft'); } catch { /* storage unavailable */ }

  el.innerHTML = `
  <div class="page wrap launch">
    <header class="page__head">
      <h1 class="display">Build the horse</h1>
      <p class="lede">Dress up a coin, choose the market cap that opens the hatch, and launch it on pump.fun.</p>
    </header>
    <div class="launch__grid">
      <form class="launch__form" id="form" novalidate>
        <fieldset class="block">
          <legend class="block__title"><span class="title">The disguise</span><small>What everyone sees at launch</small></legend>
          <div class="field"><span class="label" id="art-l">Coin art</span><div id="studio" aria-labelledby="art-l"></div><p class="err" id="e-art" hidden></p></div>
          <div class="two">
            <div class="field"><label for="name">Name <small><span id="c-name">0</span>/32</small></label><input class="input" id="name" maxlength="32" autocomplete="off" placeholder="Sir Waffle the Brave" /><p class="err" id="e-name" hidden></p></div>
            <div class="field"><label for="ticker">Ticker <small>2 to 10 characters</small></label><input class="input" id="ticker" maxlength="10" autocomplete="off" autocapitalize="characters" placeholder="WAFL" /><p class="err" id="e-ticker" hidden></p></div>
          </div>
          <div class="field"><label for="desc">Description <small><span id="c-desc">0</span>/280</small></label><textarea class="input" id="desc" maxlength="280" placeholder="One or two lines. This is all buyers read."></textarea><p class="err" id="e-desc" hidden></p></div>
          <div class="row-actions"><button type="button" class="btn btn--ghost btn--sm" id="dice"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.6" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/></svg>Surprise me</button><span class="hint">Fills in a name, ticker and description to start from.</span></div>
          <details class="more"><summary>Add links <small>optional</small></summary>
            <div class="two">
              <div class="field"><label for="tw">X / Twitter</label><input class="input" id="tw" placeholder="https://x.com/…" inputmode="url" /></div>
              <div class="field"><label for="tg">Telegram</label><input class="input" id="tg" placeholder="https://t.me/…" inputmode="url" /></div>
            </div>
            <div class="field"><label for="web">Website</label><input class="input" id="web" placeholder="https://…" inputmode="url" /></div>
          </details>
        </fieldset>

        <fieldset class="block">
          <legend class="block__title"><span class="title">The hatch</span><small>When your coin reaches this market cap, it turns into a different meme</small></legend>
          <div class="target">
            <output class="target__out display" id="t-out" for="t-range">$420K</output>
            <div class="target__tier"><b id="t-tier"></b><span id="t-sub"></span></div>
          </div>
          <input class="slider" id="t-range" type="range" min="0" max="1000" value="0" aria-label="Hatch market cap" aria-describedby="t-sub" />
          <div class="slider__ends"><span>${usd(MC_MIN)}</span><span>${usd(MC_MAX)}</span></div>
          <div class="chips" role="group" aria-label="Presets">${PRESETS.map((p) => `<button type="button" class="chip" data-preset="${p}" aria-pressed="false">${usd(p)}</button>`).join('')}</div>
          <p class="hint">The meme it becomes is picked at random at the moment it hatches. Nobody sees it in advance.</p>
        </fieldset>

        <fieldset class="block">
          <legend class="block__title"><span class="title">The launch</span><small>One transaction, signed in Phantom</small></legend>
          <div class="field"><label for="dev">Your first buy <small>SOL, optional</small></label><input class="input" id="dev" inputmode="decimal" value="0" /><p class="hint">Buy some of your own coin in the same transaction. 0 is fine.</p><p class="err" id="e-dev" hidden></p></div>
          <div class="summary" id="summary"></div>
          <button class="btn btn--lg btn--flare launch__go" id="go" type="submit"></button>
          <p class="hint">Launching a coin on pump.fun costs a small network fee plus your first buy, if you add one.</p>
        </fieldset>
      </form>

      <aside class="launch__side" aria-label="Preview">
        <div class="launch__stage" data-horse-stage data-fit="1.0" data-speed="0.3" data-hatch="0" role="img" aria-label="A wooden horse. Drag to turn it."></div>
        <article class="preview">
          <div class="preview__top"><span class="tag tag--soft">Preview</span><span class="tag" id="p-state">Sealed</span></div>
          <div class="preview__main"><img id="p-img" alt="" width="96" height="96" /><div><h2 class="title" id="p-name">Your coin</h2><p class="preview__tick" id="p-tick">$TICKER</p></div></div>
          <p class="preview__desc" id="p-desc">Your description appears here.</p>
          <div class="preview__rope"><span class="rope"><i style="--p:0"></i></span><div><small>Hatches at</small><b id="p-target">$420K</b></div></div>
          <div class="preview__crate"><svg viewBox="0 0 40 40" width="28" height="28" aria-hidden="true"><rect x="5" y="14" width="30" height="21" rx="3" fill="var(--timber)" stroke="var(--ink)" stroke-width="2.5"/><rect x="3" y="8" width="34" height="8" rx="3" fill="var(--timber-deep)" stroke="var(--ink)" stroke-width="2.5"/></svg><span>Next identity: sealed until it hatches</span></div>
        </article>
      </aside>
    </div>
  </div>
  <div class="modal" id="modal" hidden></div>`;

  const $ = (s) => el.querySelector(s);
  const f = { name: $('#name'), ticker: $('#ticker'), desc: $('#desc'), dev: $('#dev'), tw: $('#tw'), tg: $('#tg'), web: $('#web') };
  const range = $('#t-range');

  // ── Art ──
  const st = studio($('#studio'), (a) => {
    state.art = a;
    $('#p-img').src = a.url || '';
    $('#p-img').style.visibility = a.url ? 'visible' : 'hidden';
    show('art', a.error || '');
  });
  state.art = st.get();

  // ── Text fields ──
  f.name.value = state.name; f.ticker.value = state.ticker; f.desc.value = state.desc;
  const sync = () => {
    state.name = f.name.value.trim(); state.ticker = f.ticker.value.replace(/[^a-z0-9]/gi, '').toUpperCase(); state.desc = f.desc.value.trim();
    f.ticker.value = state.ticker;
    $('#c-name').textContent = f.name.value.length; $('#c-desc').textContent = f.desc.value.length;
    $('#p-name').textContent = state.name || 'Your coin';
    $('#p-tick').textContent = '$' + (state.ticker || 'TICKER');
    $('#p-desc').textContent = state.desc || 'Your description appears here.';
    summary();
  };
  ['name', 'ticker', 'desc'].forEach((k) => f[k].addEventListener('input', sync));
  $('#dice').addEventListener('click', () => {
    const i = randomIdea(); f.name.value = i.name; f.ticker.value = i.ticker; f.desc.value = i.desc; sync();
    ['name', 'ticker', 'desc'].forEach((k) => show(k, ''));
    $('#dice').classList.remove('roll'); void $('#dice').offsetWidth; $('#dice').classList.add('roll');
  });

  // ── Target ──
  const setTarget = (mc) => {
    state.target = mc;
    const [a, b] = tier(mc);
    $('#t-out').textContent = usd(mc);
    $('#t-tier').textContent = a; $('#t-sub').textContent = b;
    $('#p-target').textContent = usd(mc);
    el.querySelectorAll('[data-preset]').forEach((c) => c.setAttribute('aria-pressed', +c.dataset.preset === mc));
    // the horse is impatient when the target is low
    const stage = $('.launch__stage');
    stage.dataset.speed = (0.9 - tFromMc(mc) * 0.75).toFixed(2);
    stage.dataset.hatch = Math.max(0, 0.4 - tFromMc(mc) * 0.4).toFixed(2);
    summary();
  };
  range.value = Math.round(tFromMc(state.target) * 1000);
  range.addEventListener('input', () => setTarget(mcFromT(range.value / 1000)));
  el.querySelectorAll('[data-preset]').forEach((c) => c.addEventListener('click', () => { range.value = Math.round(tFromMc(+c.dataset.preset) * 1000); setTarget(+c.dataset.preset); }));

  // ── Summary + wallet ──
  const goBtn = $('#go');
  function summary() {
    const w = getState();
    $('#summary').innerHTML = `
      <dl>
        <div><dt>Coin</dt><dd>${esc(state.name || '—')} <span class="muted">$${esc(state.ticker || '—')}</span></dd></div>
        <div><dt>Hatches at</dt><dd>${usd(state.target)}</dd></div>
        <div><dt>Launching from</dt><dd>${w.connected ? esc(short(w.address)) : 'No wallet connected'}</dd></div>
      </dl>`;
  }
  const offWallet = onWalletChange((w) => {
    goBtn.textContent = w.connected ? 'Launch on pump.fun' : hasPhantom() ? 'Connect Phantom to launch' : 'Install Phantom to launch';
    summary();
  });

  // ── Validation ──
  function show(k, msg) {
    const e = $('#e-' + k); if (!e) return;
    e.textContent = msg; e.hidden = !msg;
    const inp = f[k]; if (inp) inp.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function validate() {
    let first = null;
    const bad = (k, m) => { show(k, m); first ||= (f[k] || $('#studio')); };
    show('art', ''); ['name', 'ticker', 'desc', 'dev'].forEach((k) => show(k, ''));
    if (!state.art.file) bad('art', 'Add art for your coin.');
    if (state.name.length < 2) bad('name', 'Give your coin a name of at least 2 characters.');
    if (state.ticker.length < 2) bad('ticker', 'Use a ticker of 2 to 10 letters or numbers.');
    if (state.desc.length < 8) bad('desc', 'Add a short description, at least 8 characters.');
    const dev = parseFloat(f.dev.value);
    if (Number.isNaN(dev) || dev < 0) bad('dev', 'Enter 0 or a positive amount of SOL.');
    if (first) { first.scrollIntoView({ block: 'center', behavior: 'smooth' }); first.focus?.(); }
    return !first;
  }

  // ── Launch ──
  const modal = $('#modal');
  const draw = (stepKey, extra = '') => {
    const idx = STEPS.findIndex(([k]) => k === stepKey);
    modal.hidden = false;
    modal.innerHTML = `<div class="modal__box" role="dialog" aria-modal="true" aria-labelledby="m-h"><h2 class="display" id="m-h">Launching</h2>
      <ol class="steps">${STEPS.map(([k, label], i) => `<li class="${i < idx ? 'done' : i === idx ? 'now' : ''}"><i></i>${label}</li>`).join('')}</ol>${extra}</div>`;
  };
  $('#form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const w = getState();
    if (!w.connected) {
      try { await connect(); } catch (err) { if (err?.code !== 4001) toast(err.message || 'Could not connect.', { kind: 'error' }); }
      return;
    }
    if (!validate()) return;
    goBtn.disabled = true;
    try {
      draw('art');
      const { uploadMetadata, createOnPumpFun } = await import('../lib/pumpfun.js');
      const metadataUri = await uploadMetadata({ name: state.name, ticker: state.ticker, description: state.desc, file: state.art.file, twitter: f.tw.value.trim(), telegram: f.tg.value.trim(), website: f.web.value.trim() });
      const { signature, mint } = await createOnPumpFun({ name: state.name, ticker: state.ticker, metadataUri, devBuySol: parseFloat(f.dev.value) || 0, onStep: draw });
      await registerLaunch({
        id: mint.slice(0, 8), mint, name: state.name, ticker: state.ticker, desc: state.desc, image: state.art.url.startsWith('blob:') ? await blobToData(state.art.file) : state.art.url,
        target: state.target, mcap: 5000, creator: short(w.address), volume24h: 0, holders: 1, createdAt: Date.now(), status: 'sealed', signature,
      });
      modal.innerHTML = `<div class="modal__box done" role="dialog" aria-modal="true" aria-labelledby="m-h">
        <img src="${state.art.url}" alt="" width="120" height="120"/>
        <h2 class="display" id="m-h">It is live</h2>
        <p class="lede">${esc(state.name)} is on pump.fun and hatches at ${usd(state.target)}.</p>
        <div class="modal__actions"><a class="btn" href="https://pump.fun/coin/${mint}" target="_blank" rel="noopener">View on pump.fun</a><a class="btn btn--ghost" href="#/token/${mint.slice(0, 8)}">Open coin page</a></div>
        <a class="link" href="https://solscan.io/tx/${signature}" target="_blank" rel="noopener">View transaction</a></div>`;
    } catch (err) {
      modal.hidden = true;
      const rejected = err?.code === 4001 || /reject|denied|cancel/i.test(err?.message || '');
      const offline = err instanceof TypeError;
      toast(rejected ? 'You closed the Phantom prompt, so nothing was launched.' : offline ? 'Could not reach pump.fun. Check your connection and try again.' : err.message || 'The launch failed. Nothing was charged.', { kind: 'error' });
    } finally { goBtn.disabled = false; }
  });

  sync(); setTarget(state.target);
  return { cleanup() { offWallet(); } };
}

function blobToData(file) {
  return new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file); });
}
