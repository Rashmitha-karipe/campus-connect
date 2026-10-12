if (Auth.guard('student')) {
  let events = [], onlyMine = false, openId = null;
  const list = document.getElementById('events');
  const modal = document.getElementById('eventModal');
  const modalBody = document.getElementById('modalBody');

  const poster = e => e.image ? `<img class="poster" src="${esc(e.image)}" alt="Poster for ${esc(e.title)}">` : '';
  const actionBtn = e => e.is_registered
    ? `<button class="quiet" data-cancel="${e.id}">Cancel registration</button>`
    : `<button data-reg="${e.id}">Register</button>`;

  async function load() {
    try { events = await api('/api/events'); render(); if (openId) showModal(openId); }
    catch (err) { showMsg('msg', err.message); }
  }

  function render() {
    const shown = onlyMine ? events.filter(e => e.is_registered) : events;
    if (!shown.length) {
      list.innerHTML = `<div class="empty">${onlyMine ? 'You have not registered for any event yet.' : 'No approved events yet. Check back soon.'}</div>`;
      return;
    }
    list.innerHTML = shown.map(e => `
      <article class="event" data-id="${e.id}">
        ${poster(e)}
        <h3>${esc(e.title)}</h3>
        <div class="meta">${esc(fmtDate(e.event_date))} · ${esc(e.venue || 'Venue to be announced')}</div>
        <div class="meta">By ${esc(e.organizer)} · ${e.registered_count} registered</div>
        <div class="actions">
          <button class="quiet" data-view="${e.id}">Details</button>
          ${actionBtn(e)}
        </div>
      </article>`).join('');
  }

  function showModal(id) {
    const e = events.find(x => x.id === Number(id));
    if (!e) { modal.close(); return; }
    openId = e.id;
    modalBody.innerHTML = `
      ${poster(e)}
      <h2 style="margin-top:.8rem">${esc(e.title)}</h2>
      <div class="meta">${esc(fmtDate(e.event_date))} · ${esc(e.venue || 'Venue to be announced')}</div>
      <p>${esc(e.description) || 'No description provided.'}</p>
      <div class="meta">By ${esc(e.organizer)} · ${e.registered_count} registered</div>
      <div class="actions">${actionBtn(e)}</div>`;
    if (!modal.open) modal.showModal();
  }

  async function handleClick(ev) {
    const reg = ev.target.dataset.reg, cancel = ev.target.dataset.cancel, view = ev.target.dataset.view;
    try {
      if (reg) { await api(`/api/events/${reg}/register`, 'POST'); showMsg('msg', 'You are registered!', 'success'); load(); }
      else if (cancel) { await api(`/api/events/${cancel}/register`, 'DELETE'); showMsg('msg', 'Registration cancelled', 'success'); load(); }
      else if (view) showModal(view);
      else if (ev.target.closest('.event')) showModal(ev.target.closest('.event').dataset.id);
    } catch (err) { showMsg('msg', err.message); }
  }
  list.addEventListener('click', handleClick);
  modalBody.addEventListener('click', handleClick);

  document.getElementById('closeModal').onclick = () => modal.close();
  modal.addEventListener('click', (ev) => { if (ev.target === modal) modal.close(); }); // click outside
  modal.addEventListener('close', () => { openId = null; });

  const tabAll = document.getElementById('tabAll'), tabMine = document.getElementById('tabMine');
  function setTab(mine) {
    onlyMine = mine;
    tabAll.classList.toggle('active', !mine); tabMine.classList.toggle('active', mine);
    render();
  }
  tabAll.onclick = () => setTab(false);
  tabMine.onclick = () => setTab(true);
  load();
}