// Shared helpers used by every page
const Auth = {
  token: () => localStorage.getItem('token'),
  role: () => localStorage.getItem('role'),
  name: () => localStorage.getItem('name'),
  save(d) { localStorage.setItem('token', d.token); localStorage.setItem('role', d.role); localStorage.setItem('name', d.name); },
  logout() { localStorage.clear(); location.href = '/index.html'; },
  home() { return { student: '/student.html', organizer: '/organizer.html', admin: '/admin.html' }[this.role()]; },
  // Call at the top of each dashboard page
  guard(role) {
    if (!this.token() || this.role() !== role) { location.href = '/index.html'; return false; }
    const who = document.getElementById('who');
    if (who) who.textContent = this.name();
    return true;
  }
};

async function api(url, method = 'GET', body) {
  const isForm = body instanceof FormData;
  const headers = {};
  if (!isForm) headers['Content-Type'] = 'application/json';
  if (Auth.token()) headers.Authorization = 'Bearer ' + Auth.token();

  const res = await fetch(url, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && Auth.token()) Auth.logout();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

function showMsg(id, text, type = 'error') {
  const el = document.getElementById(id);
  el.textContent = text; el.className = 'msg show ' + type;
}

// Escape user text before putting it in HTML (prevents XSS)
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function fmtDate(d) {
  const dt = new Date(d);
  return isNaN(dt) ? d : dt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}
