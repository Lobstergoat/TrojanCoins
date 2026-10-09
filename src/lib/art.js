// Procedural token art. Every coin gets a drawn mascot on a coloured disc,
// returned as a data URI so it works anywhere an <img> does.

const EYES = (x1, x2, y, r = 5) =>
  `<circle cx="${x1}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x2}" cy="${y}" r="${r}" fill="#fff"/>` +
  `<circle cx="${x1 + 1}" cy="${y + 1}" r="${r * 0.5}" fill="#0a1f3d"/><circle cx="${x2 + 1}" cy="${y + 1}" r="${r * 0.5}" fill="#0a1f3d"/>`;

const GLYPHS = {
  frog: (c) => `
    <ellipse cx="50" cy="60" rx="30" ry="24" fill="${c}"/>
    <circle cx="34" cy="38" r="12" fill="${c}"/><circle cx="66" cy="38" r="12" fill="${c}"/>
    ${EYES(34, 66, 38, 7)}
    <path d="M36 66q14 12 28 0" stroke="#0a1f3d" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  dog: (c) => `
    <ellipse cx="26" cy="46" rx="11" ry="22" fill="#0a1f3d" opacity=".78" transform="rotate(12 26 46)"/>
    <ellipse cx="74" cy="46" rx="11" ry="22" fill="#0a1f3d" opacity=".78" transform="rotate(-12 74 46)"/>
    <circle cx="50" cy="52" r="26" fill="${c}"/>
    ${EYES(40, 60, 46, 5)}
    <ellipse cx="50" cy="62" rx="9" ry="7" fill="#fff"/><ellipse cx="50" cy="59" rx="4.5" ry="3.2" fill="#0a1f3d"/>`,
  cat: (c) => `
    <path d="M24 44L26 18l18 14zM76 44L74 18 56 32z" fill="${c}"/>
    <circle cx="50" cy="54" r="27" fill="${c}"/>
    ${EYES(40, 60, 50, 5)}
    <path d="M46 62l4 4 4-4" stroke="#0a1f3d" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 56h14M14 64l13-4M86 56H72M86 64l-13-4" stroke="#0a1f3d" stroke-width="2" stroke-linecap="round"/>`,
  bear: (c) => `
    <circle cx="28" cy="30" r="11" fill="${c}"/><circle cx="72" cy="30" r="11" fill="${c}"/>
    <circle cx="50" cy="54" r="29" fill="${c}"/>
    ${EYES(39, 61, 48, 4.5)}
    <ellipse cx="50" cy="63" rx="12" ry="9" fill="#fff" opacity=".9"/><ellipse cx="50" cy="60" rx="4.5" ry="3.5" fill="#0a1f3d"/>`,
  ghost: (c) => `
    <path d="M24 82V46a26 26 0 0152 0v36l-9-7-8 7-9-7-9 7-8-7z" fill="${c}"/>
    ${EYES(40, 60, 46, 6)}
    <ellipse cx="50" cy="63" rx="5" ry="6.5" fill="#0a1f3d"/>`,
  bird: (c) => `
    <circle cx="48" cy="54" r="28" fill="${c}"/>
    <path d="M72 50l20 6-20 8z" fill="#ffb02e"/>
    <path d="M40 24q6-12 14 0q-4 2-6 8z" fill="${c}"/>
    <circle cx="52" cy="46" r="6" fill="#fff"/><circle cx="53" cy="47" r="3" fill="#0a1f3d"/>
    <path d="M26 62q16 20 36 4" fill="#fff" opacity=".35"/>`,
  moon: (c) => `
    <path d="M62 18a34 34 0 100 64A28 28 0 0162 18z" fill="${c}"/>
    <circle cx="40" cy="52" r="4" fill="#0a1f3d"/><path d="M34 66q8 6 16 0" stroke="#0a1f3d" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="74" cy="30" r="3" fill="#fff"/><circle cx="82" cy="52" r="2" fill="#fff"/><circle cx="72" cy="72" r="2.5" fill="#fff"/>`,
  mushroom: (c) => `
    <path d="M18 54a32 30 0 0164 0z" fill="${c}"/>
    <circle cx="36" cy="40" r="6" fill="#fff"/><circle cx="58" cy="34" r="5" fill="#fff"/><circle cx="68" cy="48" r="4" fill="#fff"/>
    <rect x="38" y="54" width="24" height="26" rx="8" fill="#fff"/>
    <circle cx="45" cy="64" r="2.4" fill="#0a1f3d"/><circle cx="55" cy="64" r="2.4" fill="#0a1f3d"/>`,
  chili: (c) => `
    <path d="M30 28q22-12 40 10q10 22-8 40q-6 6-10 2q10-14 2-32q-8-14-24-8z" fill="${c}"/>
    <path d="M30 28q-4-10 4-14q4 4 2 12z" fill="#0f8a5f"/>
    <circle cx="58" cy="56" r="3" fill="#fff"/><circle cx="66" cy="52" r="3" fill="#fff"/>`,
  skull: (c) => `
    <path d="M24 56a26 28 0 1152 0v10H62v10H38V66H24z" fill="${c}"/>
    <ellipse cx="38" cy="52" rx="7" ry="8" fill="#0a1f3d"/><ellipse cx="62" cy="52" rx="7" ry="8" fill="#0a1f3d"/>
    <path d="M47 62h6l-3 6z" fill="#0a1f3d"/>`,
  blob: (c) => `
    <path d="M24 78q-6-26 6-44q12-14 26-10q16 6 18 30q2 16-4 24z" fill="${c}"/>
    ${EYES(42, 62, 46, 6)}
    <path d="M42 62q10 8 20 0" stroke="#0a1f3d" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  crown: (c) => `
    <path d="M20 70l-4-34 20 16 14-24 14 24 20-16-4 34z" fill="${c}"/>
    <rect x="20" y="70" width="60" height="8" rx="3" fill="${c}" opacity=".8"/>
    <circle cx="36" cy="60" r="3" fill="#fff"/><circle cx="50" cy="56" r="3" fill="#fff"/><circle cx="64" cy="60" r="3" fill="#fff"/>`,
  fish: (c) => `
    <path d="M18 50q22-30 48-8l16-12v40L66 58q-26 22-48-8z" fill="${c}"/>
    <circle cx="36" cy="46" r="4" fill="#fff"/><circle cx="37" cy="46" r="2" fill="#0a1f3d"/>
    <path d="M48 40q4 10 0 20" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>`,
  rock: (c) => `
    <path d="M18 74l8-32 20-18 24 6 12 26-6 18z" fill="${c}"/>
    ${EYES(42, 60, 52, 5)}
    <path d="M44 66h14" stroke="#0a1f3d" stroke-width="3" stroke-linecap="round"/>`,
};

export const GLYPH_KEYS = Object.keys(GLYPHS);

export const PALETTES = [
  ['#1f4fe0', '#ffd23f'],
  ['#ffd23f', '#1f4fe0'],
  ['#ff5a36', '#fff3d6'],
  ['#0f8a5f', '#d9f5c6'],
  ['#7a3df0', '#ffd7f0'],
  ['#0a1f3d', '#7de0c5'],
  ['#ffb3c7', '#c8402a'],
  ['#7de0c5', '#0a1f3d'],
];

export function discArt(glyph, paletteIndex = 0, { ring = true } = {}) {
  const [bg, fg] = PALETTES[paletteIndex % PALETTES.length];
  const draw = GLYPHS[glyph] || GLYPHS.blob;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<defs><clipPath id="c"><circle cx="50" cy="50" r="50"/></clipPath></defs>` +
    `<g clip-path="url(#c)"><rect width="100" height="100" fill="${bg}"/>` +
    `<circle cx="50" cy="50" r="38" fill="#fff" opacity=".12"/>` +
    draw(fg) +
    (ring ? `<circle cx="50" cy="50" r="48" fill="none" stroke="#0a1f3d" stroke-opacity=".25" stroke-width="3"/>` : '') +
    `</g></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
