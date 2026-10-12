if (Auth.guard('organizer')) {
  const list = document.getElementById('events');

  async function load() {
    try {
      const events = await api('/api/events/mine');
      list.innerHTML = events.length ? events.map(e => `
        <article class="event">
          ${e.image ? `<img class="poster" src="${esc(e.image)}" alt="Poster for ${esc(e.title)}">` : ''}
          <span class="badge ${esc(e.status)}">${esc(e.status)}</span>
          <h3>${esc(e.title)}</h3>
          <div class="meta">${esc(fmtDate(e.event_date))} · ${esc(e.venue || 'No venue')}</div>
          <p>${esc(e.description)}</p>
          <div class="meta">${e.status === 'approved' ? e.registered_count + ' students registered' : e.status === 'pending' ? 'Waiting for admin decision' : 'Rejected by admin'}</div>
        </article>`).join('') : '<div class="empty">You have not created any events yet. Use the form above to send your first request.</div>';
    } catch (err) { showMsg('msg', err.message); }
  }

  document.getElementById('eventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', document.getElementById('title').value.trim());
    fd.append('description', document.getElementById('description').value.trim());
    fd.append('venue', document.getElementById('venue').value.trim());
    fd.append('event_date', document.getElementById('event_date').value);
    const file = document.getElementById('image').files[0];
    if (file) fd.append('image', file);

    try {
      const data = await api('/api/events', 'POST', fd);
      showMsg('msg', data.message, 'success');
      e.target.reset();
      load();
    } catch (err) { showMsg('msg', err.message); }
  });
  load();
}