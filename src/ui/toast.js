let host;
export function toast(msg, { kind = 'info', ms = 4200, action } = {}) {
  host ||= document.getElementById('overlays').appendChild(Object.assign(document.createElement('div'), { className: 'toasts', role: 'status', ariaLive: 'polite' }));
  const el = document.createElement('div');
  el.className = `toast toast--${kind}`;
  el.innerHTML = `<span></span>`;
  el.firstChild.textContent = msg;
  if (action) {
    const a = document.createElement('a');
    a.href = action.href; a.textContent = action.label; a.target = '_blank'; a.rel = 'noopener';
    el.append(a);
  }
  host.append(el);
  requestAnimationFrame(() => el.classList.add('in'));
  setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 400); }, ms);
}
