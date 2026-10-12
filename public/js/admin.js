if (Auth.guard('admin')) {
  let status = 'pending';
  const list = document.getElementById('events');

  async function load() {
    try {
      const events = await api('/api/admin/events?status=' + status);
      list.innerHTML = events.length ? events.map(e => `
        <article class="event">
          ${e.image ? `<img class="poster" src="${esc(e.image)}" alt="Poster for ${esc(e.title)}">` : ''}
          <h3>${esc(e.title)}</h3>
          <div class="meta">${esc(fmtDate(e.event_date))} · ${esc(e.venue || 'No venue')}</div>
          <p>${esc(e.description)}</p>
          <div class="meta">Requested by ${esc(e.organizer)}</div>
          <div class="actions">
            ${e.status !== 'approved' ? `<button class="ok" data-id="${e.id}" data-set="approved">Approve</button>` : ''}
            ${e.status !== 'rejected' ? `<button class="bad" data-id="${e.id}" data-set="rejected">Reject</button>` : ''}
          </div>
        </article>`).join('') : `<div class="empty">No ${status} events.</div>`;
    } catch (err) { showMsg('msg', err.message); }
  }

  list.addEventListener('click', async (ev) => {
    const { id, set } = ev.target.dataset;
    if (!id) return;
    try { await api('/api/admin/events/' + id, 'PATCH', { status: set }); load(); }
    catch (err) { showMsg('msg', err.message); }
  });

  document.querySelectorAll('.tabs button').forEach(btn => btn.addEventListener('click', () => {
    status = btn.dataset.status;
    document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('active', b === btn));
    load();
  }));
  load();
}
