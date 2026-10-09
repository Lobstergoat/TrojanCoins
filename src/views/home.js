import { listTokens, listUnveilings, getStats, subscribe } from '../lib/api.js';
import { coinRow, patchLive, progressOf } from '../ui/cards.js';
import { compare, wireCompare } from '../ui/compare.js';
import { CHARACTERS, trackEyes } from '../ui/characters.js';
import { footer } from '../ui/footer.js';
import { esc, ago, num, usd } from '../lib/format.js';

const STEPS = [
  { h: 'Launch it in disguise.', p: 'Give your coin a name, a ticker and art. It goes live on pump.fun like any other coin, and nobody can tell what is inside.' },
  { h: 'Set the number.', p: 'Pick the market cap that opens the hatch. Every trade pushes the coin closer, and the progress rope shows exactly how far is left.' },
  { h: 'The hatch opens.', p: 'The moment the coin reaches your number, it steps out as a different meme: new art, new name, new ticker. Holders keep their tokens.' },
];

const CREW = {
  sinon: [
    'Pick art that still reads at the size of a thumbnail. Busy art turns to mush at 40 pixels.',
    'Keep the ticker short. Four or five letters is plenty.',
    'A lower target hatches sooner. A higher one gives the coin longer to grow first.',
    'The description is the only thing buyers read before they buy. Make them smile.',
  ],
  cassandra: [
    'Most coins go to zero. I said so. Nobody listened.',
    'Only spend what you can lose. I mean that kindly.',
    'A coin that hatches is not guaranteed to go up. A new face does not change the odds.',
    'Check who made a coin before you buy it. Every time.',
  ],
};

export async function mount(el) {
  const [tokens, unveil, stats] = await Promise.all([listTokens(), listUnveilings(), getStats()]);
  const gates = tokens.filter((t) => t.status === 'sealed').sort((a, b) => progressOf(b) - progressOf(a)).slice(0, 5);
  const ticker = unveil.map((t) => `<span class="tick"><img src="${t.image}" alt="" width="26" height="26"/>${esc(t.name)}<i>→</i><img src="${t.reveal.image}" alt="" width="26" height="26"/><b>${esc(t.reveal.name)}</b><small>${ago(t.hatchedAt)}</small></span>`).join('');
  const sentryLines = [
    `${num(stats.sealed)} horses are sealed at the gates right now.`,
    `${num(stats.hatched)} have already hatched.`,
    `${usd(stats.volume24h)} changed hands in the last day. I counted twice.`,
    'Nobody gets in. Except horses.',
  ];

  el.innerHTML = `
  <section class="hero" aria-labelledby="hero-title">
    <h1 id="hero-title" class="sr-only">TrojanCoins</h1>
    <div class="hero__word hero__word--a display" aria-hidden="true">Trojan</div>
    <div class="hero__word hero__word--b display" aria-hidden="true">Coins</div>
    <div class="hero__stage" data-horse-stage data-fit="1.04" data-speed="0.42" role="img" aria-label="A wooden horse on a cart, slowly turning. Drag to spin it, click to knock."></div>
    <div class="hero__copy wrap">
      <p class="hero__line title">Launch one coin.<br/>It hatches into another.</p>
      <div class="hero__side">
        <p class="lede">Set the market cap. When your coin reaches it, the hatch opens and a different meme steps out with new art, a new name and a new ticker.</p>
        <div class="hero__cta"><a class="btn btn--lg" href="#/launch">Open the hatch</a><a class="btn btn--lg btn--ghost" href="#/stable">Browse the stable</a></div>
      </div>
    </div>
    <p class="hero__hint" aria-hidden="true">Drag to turn it. Click to knock.</p>
    <div class="knock" id="knock" aria-hidden="true"></div>
    <div class="ticker" aria-label="Recent unveilings"><div class="ticker__track">${ticker}${ticker}</div></div>
  </section>

  <section class="gift" id="gift" aria-label="How it works">
    <div class="gift__sticky">
      <div class="gift__text">
        <ol class="gift__rail" aria-hidden="true">${STEPS.map((_, i) => `<li data-rail="${i}"><span>${i + 1}</span></li>`).join('')}<i class="gift__fill"></i></ol>
        <div class="gift__steps">
          ${STEPS.map((s, i) => `<article class="gift__step ${i === 0 ? 'is-on' : ''}" data-step="${i}"><h2 class="display">${s.h}</h2><p class="lede">${s.p}</p>${i === 1 ? '<div class="gift__rope"><span class="rope"><i style="--p:0"></i></span><small>Progress to your target</small></div>' : ''}</article>`).join('')}
        </div>
      </div>
      <div class="gift__stage" data-horse-stage data-fit="0.92" data-speed="0.25" data-hatch="0"></div>
    </div>
  </section>

  <section class="gates-sec wrap" aria-labelledby="gates-h">
    <header class="sec-head">
      <h2 id="gates-h" class="display">Closest to hatching</h2>
      <p class="lede">These coins are nearest to their target. When the rope fills, the hatch opens.</p>
    </header>
    <div class="rows" id="rows">${gates.map(coinRow).join('')}</div>
    <a class="btn btn--ghost sec-more" href="#/stable">See every coin</a>
  </section>

  <section class="crew" aria-labelledby="crew-h">
    <div class="wrap">
      <header class="sec-head">
        <h2 id="crew-h" class="display">Meet who is inside</h2>
        <p class="lede">Three residents of the horse. Click any of them. They have opinions.</p>
      </header>
      <div class="crew__row">
        ${['sinon', 'cassandra', 'sentry'].map((k) => `
        <article class="char" data-char="${k}">
          <div class="bubble" aria-live="polite"><p>${esc(k === 'sentry' ? sentryLines[0] : CREW[k][0])}</p></div>
          <button class="char__btn" aria-label="Talk to ${CHARACTERS[k].name}">${CHARACTERS[k].svg}</button>
          <h3 class="title">${CHARACTERS[k].name}</h3>
          <p class="muted">${CHARACTERS[k].role}</p>
        </article>`).join('')}
      </div>
    </div>
  </section>

  <section class="siege" aria-labelledby="siege-h">
    <div class="wrap">
      <header class="sec-head sec-head--night">
        <h2 id="siege-h" class="display">What they became</h2>
        <p class="lede">Drag the divider. Every one of these started as something else.</p>
      </header>
      <div class="siege__pick" role="tablist" aria-label="Choose an unveiling">
        ${unveil.map((t, i) => `<button class="pick" role="tab" aria-selected="${i === 0}" data-pick="${t.id}"><img src="${t.image}" alt="" width="44" height="44"/><i>→</i><img src="${t.reveal.image}" alt="" width="44" height="44"/><span>${esc(t.reveal.name)}</span></button>`).join('')}
      </div>
      <div id="siege-cmp">${unveil[0] ? compare(unveil[0]) : ''}</div>
      <a class="btn btn--night" href="#/unveilings">All unveilings</a>
    </div>
  </section>

  ${footer()}`;

  // ── Knock ──
  const knock = el.querySelector('#knock');
  const lines = ['Who is there?', 'Nobody. Just a horse.', 'Please do not open it.', 'It is perfectly empty in here.', 'Sinon says hi.', 'We come in peace. Mostly.'];
  let li = 0;
  el.querySelector('.hero__stage').addEventListener('horse:knock', (e) => {
    knock.textContent = lines[li++ % lines.length];
    knock.style.left = e.detail.x + 'px'; knock.style.top = e.detail.y + 'px';
    knock.classList.remove('go'); void knock.offsetWidth; knock.classList.add('go');
  });

  // ── Scroll story: horse hatch + step swap ──
  const gift = el.querySelector('#gift');
  const stage = el.querySelector('.gift__stage');
  const steps = [...el.querySelectorAll('.gift__step')];
  const rails = [...el.querySelectorAll('[data-rail]')];
  const fill = el.querySelector('.gift__fill');
  const rope = el.querySelector('.gift__rope .rope > i');
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const onScroll = () => {
    const r = gift.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    const p = clamp(-r.top / total);
    const idx = p < 0.36 ? 0 : p < 0.7 ? 1 : 2;
    steps.forEach((s, i) => s.classList.toggle('is-on', i === idx));
    rails.forEach((s, i) => s.classList.toggle('is-on', i <= idx));
    fill.style.setProperty('--f', (p * 100).toFixed(1));
    rope?.style.setProperty('--p', (clamp((p - 0.3) / 0.38) * 100).toFixed(0));
    stage.dataset.hatch = idx === 2 ? '1' : idx === 1 ? String(clamp((p - 0.36) / 0.34) * 0.22) : '0';
    stage.dataset.speed = idx === 2 ? '0.12' : '0.25';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Live rows ──
  const unsub = subscribe((all) => patchLive(el, all));

  // ── Crew ──
  const stopEyes = trackEyes(el.querySelector('.crew'));
  el.querySelectorAll('.char').forEach((c) => {
    const k = c.dataset.char;
    const pool = k === 'sentry' ? sentryLines : CREW[k];
    let n = 0;
    c.querySelector('.char__btn').addEventListener('click', () => {
      n = (n + 1) % pool.length;
      const b = c.querySelector('.bubble p');
      b.textContent = pool[n];
      c.classList.remove('bounce'); void c.offsetWidth; c.classList.add('bounce');
      c.querySelector('.bubble').classList.remove('swap'); void c.offsetWidth; c.querySelector('.bubble').classList.add('swap');
    });
  });

  // ── Unveil picker ──
  const cmpHost = el.querySelector('#siege-cmp');
  wireCompare(cmpHost);
  el.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => {
    el.querySelectorAll('[data-pick]').forEach((x) => x.setAttribute('aria-selected', x === b));
    const t = unveil.find((u) => u.id === b.dataset.pick);
    cmpHost.innerHTML = compare(t); wireCompare(cmpHost);
  }));

  return { cleanup() { window.removeEventListener('scroll', onScroll); unsub(); stopEyes(); } };
}
