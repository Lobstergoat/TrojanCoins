const KEY = 'tc.watch';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
export const watched = () => new Set(read());
export function toggleWatch(id) {
  const s = watched();
  s.has(id) ? s.delete(id) : s.add(id);
  try { localStorage.setItem(KEY, JSON.stringify([...s])); } catch { /* storage unavailable */ }
  return s.has(id);
}
