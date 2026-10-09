export const usd = (n) => {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(n >= 1e7 ? 1 : 2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(n >= 1e5 ? 0 : 1)}K`;
  return `$${Math.round(n)}`;
};
export const num = (n) => new Intl.NumberFormat('en-US').format(Math.round(n));
export const pct = (n, d = 0) => `${n.toFixed(d)}%`;
export const short = (addr = '') => (addr.length > 10 ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : addr);
export const ago = (ts) => {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
export const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// Slider helpers: market cap targets live on a log scale.
export const MC_MIN = 10_000;
export const MC_MAX = 10_000_000;
export const mcFromT = (t) => Math.round(MC_MIN * Math.pow(MC_MAX / MC_MIN, t) / 500) * 500;
export const tFromMc = (mc) => Math.log(mc / MC_MIN) / Math.log(MC_MAX / MC_MIN);
