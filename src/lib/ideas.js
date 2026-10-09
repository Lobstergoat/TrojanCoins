// Name, ticker and description starters used by the "Surprise me" buttons.
const A = ['Sir', 'Captain', 'Professor', 'Baron', 'Lord', 'Granny', 'Doctor', 'Agent', 'Mayor', 'Chef', 'Admiral', 'Uncle'];
const B = ['Waffle', 'Pickle', 'Noodle', 'Biscuit', 'Gizmo', 'Turnip', 'Pretzel', 'Muffin', 'Walnut', 'Banjo', 'Quokka', 'Bagel'];
const C = ['the Brave', 'of Doom', 'Jr', 'McFly', 'the Wise', 'Esq', 'Prime', 'the Third', 'Unlimited', 'of Mars', 'Supreme', 'Classic'];
const D = [
  'Has strong opinions about toast.', 'Never reads the terms. Always accepts the cookies.', 'Arrived late and took charge anyway.',
  'Believes every Tuesday is a holiday.', 'Gives financial advice exclusively in riddles.', 'Sleeps through every dip on purpose.',
  'Collects tiny hats. Wears none of them.', 'Will explain the plan. The plan changes.', 'Runs entirely on snacks and spite.',
  'Technically a landlord of a small cloud.', 'Smells faintly of victory and soup.', 'Please do not feed after midnight.',
];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

export function randomIdea() {
  const b = pick(B), a = pick(A), c = Math.random() > 0.5 ? ' ' + pick(C) : '';
  const name = `${a} ${b}${c}`.trim();
  const ticker = (b.slice(0, 3) + (c ? pick(C).replace(/\W/g, '').slice(0, 1) : b.slice(3, 4))).toUpperCase().slice(0, 5);
  return { name, ticker, desc: pick(D) };
}
