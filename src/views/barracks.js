import { listHeroes, listTokens } from '../lib/api.js';
import { randomIdea } from '../lib/ideas.js';
import { usd, esc, num } from '../lib/format.js';
import { watched } from '../lib/watch.js';

export async function mount(el, { go, toast }) {
  const [heroes, all] = await Promise.all([listHeroes(), listTokens()]);
  const w = watched();
  const mine = all.filter((t) => w.has(t.id));
  let idea = randomIdea();

  el.innerHTML = `
  <div class="page wrap">
    <header class="page__head">
      <h1 class="display">Barracks</h1>
      <p class="lede">Tools for planning a launch, ideas when you are stuck, and the people who hatch the most.</p>
    </header>
    <div class="bar-grid">
      <section class="panel calc" aria-labelledby="calc-h">
        <h2 class="title" id="calc-h">Hatch math</h2>
        <p class="muted">See what a position is worth if a coin reaches its target.</p>
        <div class="field"><label for="c-in">You spend <small>USD</small></label><input class="input" id="c-in" inputmode="decimal" value="100" /></div>
        <div class="field"><label for="c-entry">Entry market cap <small id="c-entry-v"></small></label><input class="slider" id="c-entry" type="range" min="0" max="1000" value="120" /></div>
        <div class="field"><label for="c-exit">Target market cap <small id="c-exit-v"></small></label><input class="slider" id="c-exit" type="range" min="0" max="1000" value="520" /></div>
        <div class="calc__out" aria-live="polite"><div><small>Worth at target</small><b class="display" id="c-val">$0</b></div><div><small>Multiple</small><b class="display" id="c-x">0x</b></div></div>
        <p class="hint">Fees, slippage and price impact are not included. This is arithmetic, not a forecast.</p>
      </section>

      <section class="panel idea" aria-labelledby="idea-h">
        <h2 class="title" id="idea-h">Name the horse</h2>
        <p class="muted">Stuck? Roll for a name, ticker and description.</p>
        <div class="idea__card" id="idea"></div>
        <div class="idea__actions"><button class="btn btn--ghost" id="roll">Roll again</button><button class="btn" id="use">Use this in a launch</button></div>
      </section>

      <section class="panel heroes" aria-labelledby="h-h">
        <h2 class="title" id="h-h">Hall of heroes</h2>
        <p class="muted">Launchers ranked by coins launched.</p>
        <table class="table">
          <thead><tr><th scope="col">Rank</th><th scope="col">Launcher</th><th scope="col" class="r">Launched</th><th scope="col" class="r">Hatched</th><th scope="col" class="r">Best run</th></tr></thead>
          <tbody>${heroes.map((h) => `<tr><td>${h.rank}</td><th scope="row">${esc(h.name)}</th><td class="r">${num(h.launched)}</td><td class="r">${num(h.hatches)}</td><td class="r">${h.bestMultiple.toFixed(1)}x</td></tr>`).join('')}</tbody>
        </table>
      </section>

      <section class="panel watch" aria-labelledby="w-h">
        <h2 class="title" id="w-h">Your watchlist</h2>
        ${mine.length ? `<ul role="list" class="watch__list">${mine.map((t) => `<li><a href="#/token/${t.id}"><img src="${t.status === 'sealed' ? t.image : t.reveal.image}" alt="" width="40" height="40"/><b>${esc(t.status === 'sealed' ? t.name : t.reveal.name)}</b><small>${usd(t.mcap)}</small></a></li>`).join('')}</ul>`
          : `<p class="muted">Star a coin in the stable and it will show up here.</p><a class="btn btn--ghost btn--sm" href="#/stable">Open the stable</a>`}
      </section>
    </div>
  </div>`;

  const $ = (s) => el.querySelector(s);
  const mc = (v) => Math.round(10_000 * Math.pow(1000, v / 1000) / 500) * 500;
  const calc = () => {
    const spend = parseFloat($('#c-in').value) || 0;
    const a = mc($('#c-entry').value), b = mc($('#c-exit').value);
    $('#c-entry-v').textContent = usd(a); $('#c-exit-v').textContent = usd(b);
    const x = b / a;
    $('#c-val').textContent = usd(spend * x);
    $('#c-x').textContent = (x >= 10 ? x.toFixed(0) : x.toFixed(2)) + 'x';
  };
  ['#c-in', '#c-entry', '#c-exit'].forEach((s) => $(s).addEventListener('input', calc));
  calc();

  const paint = () => {
    $('#idea').innerHTML = `<h3 class="display">${esc(idea.name)}</h3><p class="idea__tick">$${esc(idea.ticker)}</p><p>${esc(idea.desc)}</p>`;
    $('#idea').classList.remove('flip'); void $('#idea').offsetWidth; $('#idea').classList.add('flip');
  };
  paint();
  $('#roll').onclick = () => { idea = randomIdea(); paint(); };
  $('#use').onclick = () => {
    try { sessionStorage.setItem('tc.draft', JSON.stringify({ name: idea.name, ticker: idea.ticker, desc: idea.desc })); } catch { /* storage unavailable */ }
    go('/launch');
  };
  return {};
}
