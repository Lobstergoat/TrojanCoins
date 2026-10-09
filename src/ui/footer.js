export const footer = () => `
<footer class="foot wrap">
  <div class="foot__top">
    <p class="display foot__sign">Hide something<br/>in a horse.</p>
    <a class="btn btn--lg btn--flare" href="#/launch">Launch a coin</a>
  </div>
  <div class="foot__bot">
    <span>© ${new Date().getFullYear()} TrojanCoins</span>
    <nav aria-label="Footer"><a href="#/stable">Stable</a><a href="#/unveilings">Unveilings</a><a href="#/barracks">Barracks</a></nav>
    <p>Memecoins are volatile and can lose all of their value. Nothing here is financial advice. Only spend what you can afford to lose.</p>
  </div>
</footer>`;
