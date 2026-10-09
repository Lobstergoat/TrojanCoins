import { discArt } from './art.js';

const now = Date.now();
const m = (min) => now - min * 60_000;

// Each coin: what it is today, where it's headed, and (once hatched) what it became.
const mk = (id, name, ticker, desc, glyph, pal, creator, mcap, target, vol, holders, created, extra = {}) => ({
  id, name, ticker, desc, image: discArt(glyph, pal), creator, mcap, target, volume24h: vol, holders,
  createdAt: created, status: 'sealed', mint: `${id}Pump${creator.slice(0, 4)}7Qx9`, ...extra,
});

const hatched = (before, after, hatchedAt, finalMcap) => ({
  ...before, status: 'hatched', hatchedAt, mcap: finalMcap,
  reveal: after,
});

const base = [
  mk('b01', 'Sir Hopsalot', 'HOPS', 'A frog of immense dignity. Will not explain himself.', 'frog', 0, '7xK2mNpQ', 61200, 69000, 412000, 1284, m(190)),
  mk('b02', 'Doge Intern', 'DINT', 'Unpaid, unbothered, extremely online.', 'dog', 2, 'Fp3aR9Lw', 288400, 420000, 1380000, 4410, m(880)),
  mk('b03', 'Cat Cabinet', 'MEOW1', 'Nine lives, nine ministers, zero policy.', 'cat', 4, '3dVhT8uE', 14800, 100000, 61000, 311, m(40)),
  mk('b04', 'Bear Market Bob', 'BOB', 'Hibernating since the last cycle. Wakes at the target.', 'bear', 3, '9QcZy2Bn', 733000, 1000000, 3200000, 9820, m(2400)),
  mk('b05', 'Ghost Ledger', 'GHLD', 'Haunts every wallet that forgot to sell.', 'ghost', 5, 'Hn6WeP4s', 41900, 250000, 205000, 902, m(120)),
  mk('b06', 'Moon Landlord', 'LUNA2', 'Owns the moon. Charges rent in lamports.', 'moon', 1, 'Rt8uXk5J', 118300, 150000, 690000, 2056, m(560)),
  mk('b07', 'Spore Sage', 'SPORE', 'Grows in the dark. Advice is mostly vibes.', 'mushroom', 2, '2jLmV7aD', 9300, 69000, 28000, 187, m(22)),
  mk('b08', 'Hot Take Chili', 'SPICY', 'Every opinion arrives pre-roasted.', 'chili', 6, 'Yb4gC1Qo', 478000, 500000, 2100000, 6011, m(1700)),
  mk('b09', 'Cursed Pebble', 'ROCKY', 'A rock. Aggressively a rock.', 'rock', 5, 'Kd9sN3Zf', 24100, 1000000, 94000, 540, m(75)),
  mk('b10', 'Captain Carp', 'CARP', 'Sails the mempool. Never docks.', 'fish', 7, 'Wm5hB8Pt', 76400, 100000, 301000, 1530, m(330)),
];

// Coins that already hatched, with what they turned into.
const old = [
  hatched(
    mk('h01', 'Wizard Sock', 'SOCK', 'A single sock with magical ambitions.', 'blob', 4, 'Lp2dQ6Ye', 0, 100000, 0, 3902, m(9600)),
    { name: 'Pixel Pigeon', ticker: 'COO', desc: 'Delivers messages, and occasionally your portfolio.', image: discArt('bird', 1) },
    m(1440), 241000),
  hatched(
    mk('h02', 'Tax Goblin', 'TAXG', 'Collects. Never gives back.', 'skull', 5, 'Vc7nA3Rk', 0, 250000, 0, 5110, m(14000)),
    { name: 'Gentle Giraffe', ticker: 'NECK', desc: 'Tall, calm, and above all this.', image: discArt('crown', 2) },
    m(2880), 612000),
  hatched(
    mk('h03', 'Pancake Pharaoh', 'PCPH', 'Rules the breakfast dynasty.', 'cat', 6, 'Ez1wM9Hu', 0, 69000, 0, 2208, m(5000)),
    { name: 'Lunar Lobster', ticker: 'CLAW', desc: 'Pinches pennies on the dark side of the moon.', image: discArt('fish', 0) },
    m(310), 118000),
  hatched(
    mk('h04', 'Lofi Llama', 'LOLA', 'Beats to relax and stake to.', 'dog', 3, 'Gt4fS8Xi', 0, 420000, 0, 7340, m(22000)),
    { name: 'Salty Spud', ticker: 'TATER', desc: 'Fried, baked, or mashed. Always undervalued.', image: discArt('moon', 3) },
    m(5200), 1210000),
];

export const SEED_TOKENS = [...base, ...old];
export const SEED_HEROES = [
  ['Mara.sol', 41, 12.4], ['0xHector', 36, 9.1], ['PriamsPick', 29, 7.7], ['Odd.Eus', 24, 6.2],
  ['Penelope', 19, 5.3], ['Argo_Anon', 17, 4.8], ['TeukrosBow', 14, 3.9], ['Achilles.sol', 12, 3.1],
].map(([name, launched, best], i) => ({ rank: i + 1, name, launched, bestMultiple: best, hatches: Math.round(launched * 0.62) }));
