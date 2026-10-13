// Admin panel (admin.html)

const $ = id => document.getElementById(id);

const loginView = $('loginView');
const dashView = $('dashView');
const loginForm = $('loginForm');
const loginError = $('loginError');
const loginBtn = $('loginBtn');

const statsEl = $('stats');
const specTable = $('specTable');
const appTable = $('appTable');
const appEmpty = $('appEmpty');
const resultCount = $('resultCount');
const search = $('search');
const fSpec = $('fSpec');
const fLast = $('fLast');
const fDorm = $('fDorm');

const state = {
  applicants: [],      // [{id, fullname, school, isDorm, isLastYear, createdAt, specializations: [{id, specName}]}]
  specializations: [], // [{id, specName, years}]
};

const ICONS = {
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6"/><path d="M16 4a4 4 0 0 1 0 8"/><path d="M22 21c0-3-1.5-5-4-5.7"/></svg>',
  cap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></svg>',
  bed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20V8"/><path d="M2 16h20"/><path d="M22 20v-7a3 3 0 0 0-3-3h-8v6"/><circle cx="6.5" cy="11.5" r="2"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
};

/* ---------- Nézetek ---------- */
function showLogin() {
  dashView.hidden = true;
  loginView.hidden = false;
  loginForm.password.value = '';
  loginForm.password.focus();
}

function showDashboard() {
  loginView.hidden = true;
  dashView.hidden = false;
}

let toastTimer;
function toast(message, isError = false) {
  const el = $('toast');
  el.textContent = message;
  el.classList.toggle('error', isError);
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

/* ---------- Adatok betöltése ---------- */
async function loadData() {
  try {
    const [applicants, specializations] = await Promise.all([
      api('applicants'),
      api('specializations'),
    ]);
    state.applicants = applicants || [];
    state.specializations = specializations || [];
    showDashboard();
    renderAll();
  } catch (err) {
    if (err.status === 401) showLogin();
    else {
      showDashboard();
      toast(err.message, true);
    }
  }
}

/* ---------- Bejelentkezés / kilépés ---------- */
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  loginError.hidden = true;
  const password = loginForm.password.value;
  if (!password) {
    loginError.textContent = 'Add meg a jelszót.';
    loginError.hidden = false;
    return;
  }
  loginBtn.disabled = true;
  try {
    await api('login', { method: 'POST', body: { password } });
    await loadData();
  } catch (err) {
    loginError.textContent = err.status === 401 ? 'Hibás jelszó.' : err.message;
    loginError.hidden = false;
    loginForm.password.select();
  } finally {
    loginBtn.disabled = false;
  }
});

$('logoutBtn').addEventListener('click', async () => {
  try { await api('logout', { method: 'POST' }); } catch { /* mindegy, kiléptetjük */ }
  state.applicants = [];
  showLogin();
});

$('refreshBtn').addEventListener('click', async () => {
  await loadData();
  if (!dashView.hidden) toast('Adatok frissítve');
});

/* ---------- Statisztika ---------- */
function percent(part, total) {
  return total ? Math.round((part / total) * 100) + '%' : '0%';
}

function renderStats() {
  const all = state.applicants;
  const last = all.filter(a => bool(a.isLastYear)).length;
  const dorm = all.filter(a => bool(a.isDorm)).length;
  const lastDorm = all.filter(a => bool(a.isLastYear) && bool(a.isDorm)).length;

  const tile = (icon, label, value, sub) => `
    <div class="stat">
      <div class="stat-label">${icon}${label}</div>
      <div class="stat-value">${value}</div>
      <div class="stat-sub">${sub}</div>
    </div>`;

  statsEl.innerHTML =
    tile(ICONS.users, 'Összes jelentkező', all.length, 'regisztráció összesen') +
    tile(ICONS.cap, 'Végzős', last, `az összes ${percent(last, all.length)}-a`) +
    tile(ICONS.bed, 'Kollégista', dorm, `az összes ${percent(dorm, all.length)}-a`) +
    tile(ICONS.star, 'Végzős és kollégista', lastDorm, `a végzősök ${percent(lastDorm, last)}-a`);
}

function specStats() {
  // Minden meghirdetett szak megjelenik, akkor is, ha 0 jelentkezője van
  const map = new Map();
  state.specializations.forEach(s => map.set(String(s.id), { id: s.id, name: s.specName, total: 0, last: 0, dorm: 0, lastDorm: 0 }));

  state.applicants.forEach(a => {
    const isLast = bool(a.isLastYear);
    const isDorm = bool(a.isDorm);
    (a.specializations || []).forEach(s => {
      const key = String(s.id);
      if (!map.has(key)) map.set(key, { id: s.id, name: s.specName, total: 0, last: 0, dorm: 0, lastDorm: 0 });
      const row = map.get(key);
      row.total++;
      if (isLast) row.last++;
      if (isDorm) row.dorm++;
      if (isLast && isDorm) row.lastDorm++;
    });
  });

  return [...map.values()].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'hu'));
}

function renderSpecTable() {
  const rows = specStats();
  const max = Math.max(1, ...rows.map(r => r.total));
  const num = n => `<td class="num${n === 0 ? ' zero' : ''}">${n}</td>`;

  if (rows.length === 0) {
    specTable.innerHTML = '<tr><td colspan="5" class="empty">Még nincs felvéve egyetlen szak sem.</td></tr>';
    return;
  }

  specTable.innerHTML = rows.map(r => `
    <tr class="spec-row" tabindex="0" data-spec="${esc(r.id)}" title="${esc(r.name)}: ${r.total} jelentkező">
      <td class="spec-cell">
        <div class="spec-cell-name">${esc(r.name)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${(r.total / max) * 100}%"></div></div>
      </td>
      ${num(r.total)}${num(r.last)}${num(r.dorm)}${num(r.lastDorm)}
    </tr>`).join('');
}

// Szakra kattintva szűrjük a jelentkezői listát
function selectSpec(row) {
  fSpec.value = row.dataset.spec;
  renderList();
  $('listPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
specTable.addEventListener('click', e => {
  const row = e.target.closest('.spec-row');
  if (row) selectSpec(row);
});
specTable.addEventListener('keydown', e => {
  const row = e.target.closest('.spec-row');
  if (row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); selectSpec(row); }
});

/* ---------- Jelentkezők listája ---------- */
function fillSpecFilter() {
  const current = fSpec.value;
  fSpec.innerHTML = '<option value="">Minden szak</option>' + state.specializations
    .map(s => `<option value="${esc(s.id)}">${esc(s.specName)}</option>`).join('');
  fSpec.value = state.specializations.some(s => String(s.id) === current) ? current : '';
}

function formatDate(value) {
  if (!value) return '–';
  const d = new Date(String(value).replace(' ', 'T'));
  if (isNaN(d)) return esc(value);
  return d.toLocaleString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function filteredApplicants() {
  const q = search.value.trim().toLocaleLowerCase('hu');
  return state.applicants.filter(a => {
    if (q && !`${a.fullname} ${a.school}`.toLocaleLowerCase('hu').includes(q)) return false;
    if (fSpec.value && !(a.specializations || []).some(s => String(s.id) === fSpec.value)) return false;
    if (fLast.value && bool(a.isLastYear) !== (fLast.value === '1')) return false;
    if (fDorm.value && bool(a.isDorm) !== (fDorm.value === '1')) return false;
    return true;
  });
}

function renderList() {
  const list = filteredApplicants();
  const total = state.applicants.length;
  resultCount.textContent = list.length === total
    ? `${total} jelentkezés`
    : `${list.length} találat / ${total} jelentkezés`;

  if (list.length === 0) {
    appTable.innerHTML = '';
    appEmpty.innerHTML = total === 0
      ? '<strong>Még nincs jelentkező</strong>Amint valaki kitölti az űrlapot, itt megjelenik.'
      : '<strong>Nincs találat</strong>Próbálj más keresést vagy szűrőt.';
    appEmpty.hidden = false;
    return;
  }
  appEmpty.hidden = true;

  appTable.innerHTML = list.map(a => `
    <tr>
      <td>
        <div class="app-name">${esc(a.fullname)}</div>
        <div class="app-school">${esc(a.school)}</div>
      </td>
      <td><div class="chips">${(a.specializations || []).map(s => `<span class="chip">${esc(s.specName)}</span>`).join('') || '–'}</div></td>
      <td>${bool(a.isDorm) ? '<span class="chip">Kollégista</span>' : '<span class="chip chip-muted">Bejárós</span>'}</td>
      <td>${bool(a.isLastYear) ? '<span class="chip chip-yes">Igen</span>' : '<span class="chip chip-muted">Nem</span>'}</td>
      <td class="date">${formatDate(a.createdAt)}</td>
      <td><button class="icon-btn" type="button" data-delete="${esc(a.id)}" title="Törlés" aria-label="${esc(a.fullname)} törlése">${ICONS.trash}</button></td>
    </tr>`).join('');
}

[search, fSpec, fLast, fDorm].forEach(el => el.addEventListener('input', renderList));

/* ---------- Törlés ---------- */
const dialog = $('confirmDialog');

appTable.addEventListener('click', e => {
  const btn = e.target.closest('[data-delete]');
  if (!btn) return;
  const applicant = state.applicants.find(a => String(a.id) === btn.dataset.delete);
  if (!applicant) return;

  $('confirmText').innerHTML = `Biztosan törlöd <strong>${esc(applicant.fullname)}</strong> (${esc(applicant.school)}) jelentkezését? Ez nem vonható vissza.`;
  dialog.returnValue = '';
  dialog.showModal();
  dialog.addEventListener('close', async () => {
    if (dialog.returnValue !== 'ok') return;
    try {
      await api(`applicants?id=${encodeURIComponent(applicant.id)}`, { method: 'DELETE' });
      state.applicants = state.applicants.filter(a => a !== applicant);
      renderAll();
      toast('Jelentkezés törölve');
    } catch (err) {
      if (err.status === 401) showLogin();
      else toast(err.message, true);
    }
  }, { once: true });
});

/* ---------- Indítás ---------- */
function renderAll() {
  renderStats();
  renderSpecTable();
  fillSpecFilter();
  renderList();
}

loadData();
