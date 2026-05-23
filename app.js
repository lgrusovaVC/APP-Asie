// ============================================================
// app.js — Korea & Japonsko Trip Planner
// ============================================================

/* ════════════════════════════════════════════════════════════
   STATE
════════════════════════════════════════════════════════════ */
let db = null;
let currentSection = 'dashboard';
let isOnline = navigator.onLine;
let pendingDelete = null;
let pendingModalSave = null;
let editingId = null;
let editingSection = null;
let activitiesFilter = 'all';
let restaurantsFilter = 'all';

const SECTION_TITLES = {
  dashboard:      'Přehled',
  flights:        'Letenky & transfery',
  accommodations: 'Ubytování',
  activities:     'Výlety & aktivity',
  restaurants:    'Restaurace & jídlo',
  transport:      'Jízdní řády',
  budget:         'Rozpočet',
};

const CAT_ICONS = {
  'Letenky':   '✈️',
  'Ubytování': '🏨',
  'Aktivity':  '🗺️',
  'Jídlo':     '🍜',
  'Doprava':   '🚆',
  'Ostatní':   '💳',
};

const CAT_COLORS = {
  'Letenky':   '#f472b6',
  'Ubytování': '#a855f7',
  'Aktivity':  '#3b82f6',
  'Jídlo':     '#fb923c',
  'Doprava':   '#22c55e',
  'Ostatní':   '#6b7280',
};

/* ════════════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  if (!checkConfig()) return;

  registerServiceWorker();
  initSupabase();
  setupOnlineDetection();
  setupNavigation();
  setupModalListeners();
  setupAuthListeners();

  const session = await getSession();
  if (session) {
    showApp();
    navigateTo('dashboard');
  } else {
    showLogin();
  }
});

function checkConfig() {
  if (CONFIG.SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
    document.body.innerHTML = `
      <div style="min-height:100dvh;display:flex;align-items:center;justify-content:center;font-family:Nunito,sans-serif;padding:24px">
        <div style="max-width:480px;text-align:center">
          <div style="font-size:3rem;margin-bottom:16px">⚙️</div>
          <h2 style="font-size:1.4rem;margin-bottom:12px;color:#1e1b4b">Konfigurace chybí</h2>
          <p style="color:#6b7280;margin-bottom:16px">
            Vyplňte <code style="background:#f3e8ff;padding:2px 6px;border-radius:4px">SUPABASE_URL</code>
            a <code style="background:#f3e8ff;padding:2px 6px;border-radius:4px">SUPABASE_ANON_KEY</code>
            v souboru <strong>config.js</strong>.
          </p>
          <p style="color:#6b7280;font-size:.875rem">Viz <strong>SETUP.md</strong> pro instrukce krok za krokem.</p>
        </div>
      </div>`;
    return false;
  }
  return true;
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

function initSupabase() {
  db = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

/* ════════════════════════════════════════════════════════════
   AUTH
════════════════════════════════════════════════════════════ */
async function getSession() {
  const { data: { session } } = await db.auth.getSession();
  return session;
}

function setupAuthListeners() {
  // Login form
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn      = document.getElementById('login-btn');
    const errEl    = document.getElementById('login-error');

    btn.disabled = true;
    document.getElementById('login-btn-text').textContent = 'Přihlašování…';
    errEl.style.display = 'none';

    const { error } = await db.auth.signInWithPassword({ email, password });

    if (error) {
      errEl.textContent = 'Nesprávný e-mail nebo heslo.';
      errEl.style.display = 'block';
      btn.disabled = false;
      document.getElementById('login-btn-text').textContent = 'Přihlásit se';
    } else {
      showApp();
      navigateTo('dashboard');
    }
  });

  // Toggle password visibility
  document.getElementById('toggle-pass-btn').addEventListener('click', () => {
    const inp = document.getElementById('login-password');
    const ico = document.getElementById('eye-icon');
    if (inp.type === 'password') {
      inp.type = 'text';
      ico.className = 'ti ti-eye-off';
    } else {
      inp.type = 'password';
      ico.className = 'ti ti-eye';
    }
  });

  // Logout buttons
  document.getElementById('logout-btn-sidebar').addEventListener('click', logout);
  document.getElementById('logout-btn-topbar').addEventListener('click', logout);
}

async function logout() {
  await db.auth.signOut();
  showLogin();
}

function showLogin() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('app').style.display          = 'none';
}

function showApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display          = 'grid';
  // Apply trip title from config
  document.getElementById('sidebar-trip-title').textContent = CONFIG.TRIP_TITLE;
  document.getElementById('sidebar-trip-year').textContent  = CONFIG.TRIP_YEAR || '';
}

/* ════════════════════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════════════════════ */
function setupNavigation() {
  // Sidebar links
  document.querySelectorAll('#sidebar-nav .nav-item').forEach((el) => {
    el.addEventListener('click', () => navigateTo(el.dataset.section));
  });
  // Bottom nav links
  document.querySelectorAll('.bnav-item').forEach((el) => {
    el.addEventListener('click', () => navigateTo(el.dataset.section));
  });
  // Section add buttons
  document.querySelectorAll('[data-add]').forEach((btn) => {
    btn.addEventListener('click', () => openAddModal(btn.dataset.add));
  });
  // Activity filter
  document.querySelectorAll('#activities-filter .filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activitiesFilter = btn.dataset.filter;
      document.querySelectorAll('#activities-filter .filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderActivitiesFromCache();
    });
  });
  // Restaurant filter
  document.querySelectorAll('#restaurants-filter .filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      restaurantsFilter = btn.dataset.filter;
      document.querySelectorAll('#restaurants-filter .filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderRestaurantsFromCache();
    });
  });
}

function navigateTo(section) {
  currentSection = section;

  // Update section visibility
  document.querySelectorAll('.section').forEach((s) => s.classList.remove('active'));
  document.getElementById(`section-${section}`).classList.add('active');

  // Update nav active state
  document.querySelectorAll('.nav-item, .bnav-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.section === section);
  });

  // Update topbar title
  document.getElementById('topbar-title').textContent = SECTION_TITLES[section] || section;

  // Load section data
  loadSection(section);
}

function loadSection(section) {
  switch (section) {
    case 'dashboard':      loadDashboard();      break;
    case 'flights':        loadFlights();        break;
    case 'accommodations': loadAccommodations(); break;
    case 'activities':     loadActivities();     break;
    case 'restaurants':    loadRestaurants();    break;
    case 'transport':      loadTransport();      break;
    case 'budget':         loadBudget();         break;
  }
}

/* ════════════════════════════════════════════════════════════
   DATA HELPERS
════════════════════════════════════════════════════════════ */
async function fetchData(table, order = 'created_at') {
  if (!isOnline) return getCache(table);
  try {
    const { data, error } = await db.from(table).select('*').order(order, { ascending: true });
    if (error) throw error;
    setCache(table, data);
    return data;
  } catch {
    return getCache(table);
  }
}

function setCache(table, data) {
  try { localStorage.setItem(`cache_${table}`, JSON.stringify(data)); } catch {}
}
function getCache(table) {
  try { return JSON.parse(localStorage.getItem(`cache_${table}`)) || []; } catch { return []; }
}

async function deleteRecord(table, id) {
  if (!isOnline) { showToast('Nelze smazat — jste offline.', 'error'); return false; }
  const { error } = await db.from(table).delete().eq('id', id);
  if (error) { showToast('Chyba při mazání.', 'error'); return false; }
  return true;
}

/* ════════════════════════════════════════════════════════════
   ONLINE / OFFLINE
════════════════════════════════════════════════════════════ */
function setupOnlineDetection() {
  window.addEventListener('online',  () => { isOnline = true;  updateOnlineUI(); loadSection(currentSection); });
  window.addEventListener('offline', () => { isOnline = false; updateOnlineUI(); });
  updateOnlineUI();
}
function updateOnlineUI() {
  const banner = document.getElementById('offline-banner');
  banner.style.display = isOnline ? 'none' : 'flex';
  document.querySelectorAll('.btn-add').forEach((btn) => {
    btn.classList.toggle('disabled', !isOnline);
    btn.disabled = !isOnline;
    if (!isOnline) btn.title = 'Dostupné jen online';
    else           btn.title = '';
  });
}

/* ════════════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════════════ */
async function loadDashboard() {
  const [flights, accommodations, activities, expenses] =
    await Promise.all([
      fetchData('flights', 'date'),
      fetchData('accommodations', 'checkin'),
      fetchData('activities', 'date'),
      fetchData('expenses', 'date'),
    ]);

  const totalSpent = expenses.reduce((s, e) => s + parseFloat(e.amount_czk || 0), 0);
  const upcoming   = getUpcoming(flights, accommodations, activities);

  const departure = new Date(CONFIG.DEPARTURE_DATE);
  const today     = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft  = Math.ceil((departure - today) / 86400000);

  const returnDate = new Date(CONFIG.RETURN_DATE);
  const tripDays   = Math.ceil((returnDate - departure) / 86400000);

  let countdownHTML;
  if (daysLeft > 0) {
    countdownHTML = `
      <div class="countdown-number">${daysLeft}</div>
      <div>
        <div class="countdown-label">${daysLeft === 1 ? 'den' : daysLeft < 5 ? 'dny' : 'dní'} do odjezdu</div>
        <div class="countdown-sub">${formatDateCZ(CONFIG.DEPARTURE_DATE)} → ${formatDateCZ(CONFIG.RETURN_DATE)} · ${tripDays} dní</div>
      </div>`;
  } else if (daysLeft === 0) {
    countdownHTML = `<div class="countdown-number">🛫</div><div><div class="countdown-label">Dnes odjíždíte!</div></div>`;
  } else if (today <= returnDate) {
    countdownHTML = `<div class="countdown-number">🌸</div><div><div class="countdown-label">Jste na cestě!</div><div class="countdown-sub">Návrat ${formatDateCZ(CONFIG.RETURN_DATE)}</div></div>`;
  } else {
    countdownHTML = `<div class="countdown-number">🏠</div><div><div class="countdown-label">Cesta skončila</div><div class="countdown-sub">Jaké to bylo?</div></div>`;
  }

  document.getElementById('dashboard-content').innerHTML = `
    <div class="hero">
      <div class="hero-bg" style="background-image:url('${CONFIG.HERO_IMAGE_URL}')"></div>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-title">${CONFIG.TRIP_TITLE}</div>
        <div class="hero-subtitle">${CONFIG.TRIP_SUBTITLE}</div>
        <div class="hero-meta">
          <div class="hero-date-pill"><i class="ti ti-calendar"></i> ${formatDateCZ(CONFIG.DEPARTURE_DATE)}</div>
          <div class="hero-date-pill"><i class="ti ti-calendar-check"></i> ${formatDateCZ(CONFIG.RETURN_DATE)}</div>
          <div class="hero-date-pill"><i class="ti ti-clock"></i> ${tripDays} dní</div>
        </div>
      </div>
    </div>

    <div class="countdown-section">
      <div class="countdown-card">${countdownHTML}</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">✈️</div>
        <div class="stat-value">${flights.length}</div>
        <div class="stat-label">Letenky</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏨</div>
        <div class="stat-value">${accommodations.length}</div>
        <div class="stat-label">Hotely</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🗺️</div>
        <div class="stat-value">${activities.length}</div>
        <div class="stat-label">Aktivity</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-value">${formatKc(totalSpent)}</div>
        <div class="stat-label">Utraceno</div>
      </div>
    </div>

    <div class="upcoming-section">
      <h3>📌 Nadcházející události</h3>
      <div class="upcoming-list">
        ${upcoming.length
          ? upcoming.map(renderUpcomingItem).join('')
          : '<div class="empty-state"><div class="empty-icon"><i class="ti ti-calendar-off"></i></div><h3>Žádné nadcházející události</h3><p>Přidejte letenky, ubytování nebo aktivity.</p></div>'
        }
      </div>
    </div>`;
}

function getUpcoming(flights, accommodations, activities) {
  const all = [];
  flights.forEach((f) => {
    if (f.date) all.push({ date: f.date, type: 'flight', name: `${f.flight_number || 'Let'}: ${f.from_airport} → ${f.to_airport}`, meta: formatDateCZ(f.date) + (f.departure_time ? ' · ' + f.departure_time.slice(0,5) : ''), country: f.country });
  });
  accommodations.forEach((a) => {
    if (a.checkin) all.push({ date: a.checkin, type: 'accommodation', name: a.name, meta: `Check-in ${formatDateCZ(a.checkin)}`, country: a.country });
  });
  activities.filter((a) => a.status !== 'hotovo').forEach((a) => {
    if (a.date) all.push({ date: a.date, type: 'activity', name: a.name, meta: formatDateCZ(a.date) + (a.time ? ' · ' + a.time.slice(0,5) : ''), country: a.country, status: a.status });
  });
  return all.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);
}

function renderUpcomingItem(item) {
  const icons = { flight: '✈️', accommodation: '🏨', activity: '🗺️' };
  return `<div class="upcoming-item">
    <div class="upcoming-dot"></div>
    <div class="upcoming-info">
      <div class="upcoming-name">${esc(item.name)}</div>
      <div class="upcoming-meta">${item.meta}</div>
    </div>
    <div class="upcoming-badge">${countryBadge(item.country)}</div>
  </div>`;
}

/* ════════════════════════════════════════════════════════════
   FLIGHTS
════════════════════════════════════════════════════════════ */
async function loadFlights() {
  const data = await fetchData('flights', 'date');
  const el = document.getElementById('flights-content');
  if (!data.length) { el.innerHTML = emptyState('ti-plane', 'Žádné letenky', 'Přidejte první letenku nebo transfer.'); return; }
  el.innerHTML = data.map(flightCard).join('');
}

function flightCard(f) {
  return `<div class="card">
    <div class="card-header">
      <div>
        <div class="card-title">✈️ ${esc(f.from_airport)} → ${esc(f.to_airport)}</div>
        ${f.flight_number ? `<div class="text-sm text-muted mt-1">${esc(f.flight_number)}</div>` : ''}
      </div>
      <div class="card-actions">
        ${actionBtns('flights', f.id)}
      </div>
    </div>
    <div class="card-body">
      ${row('ti-calendar', formatDateCZ(f.date))}
      ${f.departure_time || f.arrival_time ? row('ti-clock', `${f.departure_time ? f.departure_time.slice(0,5) : '?'} → ${f.arrival_time ? f.arrival_time.slice(0,5) : '?'}`) : ''}
      ${f.booking_ref ? row('ti-ticket', `Booking: ${esc(f.booking_ref)}`) : ''}
      ${f.notes ? row('ti-notes', esc(f.notes)) : ''}
    </div>
    <div class="card-footer">
      ${countryBadge(f.country)}
    </div>
  </div>`;
}

/* ════════════════════════════════════════════════════════════
   ACCOMMODATIONS
════════════════════════════════════════════════════════════ */
async function loadAccommodations() {
  const data = await fetchData('accommodations', 'checkin');
  const el = document.getElementById('accommodations-content');
  if (!data.length) { el.innerHTML = emptyState('ti-bed', 'Žádné ubytování', 'Přidejte první hotel nebo apartmán.'); return; }
  el.innerHTML = data.map(accommodationCard).join('');
}

function accommodationCard(a) {
  const nights = a.checkin && a.checkout
    ? Math.ceil((new Date(a.checkout) - new Date(a.checkin)) / 86400000) : null;
  return `<div class="card">
    <div class="card-header">
      <div class="card-title">🏨 ${esc(a.name)}</div>
      <div class="card-actions">${actionBtns('accommodations', a.id)}</div>
    </div>
    <div class="card-body">
      ${a.address ? row('ti-map-pin', esc(a.address)) : ''}
      ${row('ti-calendar', `Check-in: ${formatDateCZ(a.checkin)}`)}
      ${row('ti-calendar-check', `Check-out: ${formatDateCZ(a.checkout)}${nights ? ` (${nights} nocí)` : ''}`)}
      ${a.price_czk ? row('ti-currency-koruna', `${formatKc(a.price_czk)} Kč`) : ''}
      ${a.booking_url ? row('ti-link', `<a href="${esc(a.booking_url)}" target="_blank" rel="noopener">Odkaz na rezervaci</a>`) : ''}
      ${a.notes ? row('ti-notes', esc(a.notes)) : ''}
    </div>
    <div class="card-footer">
      ${countryBadge(a.country)}
      ${a.price_czk ? `<span class="price-tag">${formatKc(a.price_czk)} Kč</span>` : ''}
    </div>
  </div>`;
}

/* ════════════════════════════════════════════════════════════
   ACTIVITIES
════════════════════════════════════════════════════════════ */
async function loadActivities() {
  await fetchData('activities', 'date');
  renderActivitiesFromCache();
}

function renderActivitiesFromCache() {
  const data = getCache('activities');
  const filtered = activitiesFilter === 'all' ? data : data.filter((a) => a.status === activitiesFilter);
  const el = document.getElementById('activities-content');
  if (!filtered.length) { el.innerHTML = emptyState('ti-map-pin', 'Žádné aktivity', 'Přidejte výlet nebo aktivitu.'); return; }
  el.innerHTML = filtered.map(activityCard).join('');
}

function activityCard(a) {
  const statusMap = { 'naplánováno': ['badge-planned', 'Naplánováno'], 'rezervováno': ['badge-booked', 'Rezervováno'], 'hotovo': ['badge-done', 'Hotovo'] };
  const [cls, label] = statusMap[a.status] || ['badge-planned', a.status];
  return `<div class="card">
    <div class="card-header">
      <div class="card-title">🗺️ ${esc(a.name)}</div>
      <div class="card-actions">${actionBtns('activities', a.id)}</div>
    </div>
    <div class="card-body">
      ${a.date ? row('ti-calendar', formatDateCZ(a.date) + (a.time ? ' · ' + a.time.slice(0,5) : '')) : ''}
      ${a.location ? row('ti-map-pin', esc(a.location)) : ''}
      ${a.price ? row('ti-currency-koruna', `${formatKc(a.price)} Kč`) : ''}
      ${a.url ? row('ti-link', `<a href="${esc(a.url)}" target="_blank" rel="noopener">Odkaz</a>`) : ''}
      ${a.notes ? row('ti-notes', esc(a.notes)) : ''}
    </div>
    <div class="card-footer">
      ${countryBadge(a.country)}
      <span class="badge ${cls}">${label}</span>
    </div>
  </div>`;
}

/* ════════════════════════════════════════════════════════════
   RESTAURANTS
════════════════════════════════════════════════════════════ */
async function loadRestaurants() {
  await fetchData('restaurants', 'created_at');
  renderRestaurantsFromCache();
}

function renderRestaurantsFromCache() {
  const data = getCache('restaurants');
  const filtered = restaurantsFilter === 'all' ? data : data.filter((r) => r.country === restaurantsFilter);
  const el = document.getElementById('restaurants-content');
  if (!filtered.length) { el.innerHTML = emptyState('ti-utensils', 'Žádné restaurace', 'Přidejte restauraci nebo kavárnu.'); return; }
  el.innerHTML = filtered.map(restaurantCard).join('');
}

function restaurantCard(r) {
  const priceColors = { '$': 'var(--success)', '$$': 'var(--warning)', '$$$': 'var(--peach)', '$$$$': 'var(--error)' };
  return `<div class="card">
    <div class="card-header">
      <div class="card-title">🍜 ${esc(r.name)}</div>
      <div class="card-actions">${actionBtns('restaurants', r.id)}</div>
    </div>
    <div class="card-body">
      ${r.address ? row('ti-map-pin', esc(r.address)) : ''}
      ${r.cuisine_type ? row('ti-chef-hat', esc(r.cuisine_type)) : ''}
      ${r.price_range ? row('ti-coins', `<span style="font-weight:800;color:${priceColors[r.price_range] || 'var(--text)'}">${r.price_range}</span>`) : ''}
      ${r.url ? row('ti-link', `<a href="${esc(r.url)}" target="_blank" rel="noopener">Odkaz / recenze</a>`) : ''}
      ${r.notes ? row('ti-notes', esc(r.notes)) : ''}
    </div>
    <div class="card-footer">
      ${countryBadge(r.country)}
      ${r.price_range ? `<span class="price-tag" style="color:${priceColors[r.price_range] || 'var(--purple)'}">${r.price_range}</span>` : ''}
    </div>
  </div>`;
}

/* ════════════════════════════════════════════════════════════
   TRANSPORT
════════════════════════════════════════════════════════════ */
async function loadTransport() {
  const data = await fetchData('transport', 'date');
  const el = document.getElementById('transport-content');
  if (!data.length) { el.innerHTML = emptyState('ti-train', 'Žádné spoje', 'Přidejte vlak, metro nebo autobus.'); return; }
  el.innerHTML = data.map(transportCard).join('');
}

function transportCard(t) {
  return `<div class="card">
    <div class="card-header">
      <div class="card-title">🚆 ${esc(t.route_from)} → ${esc(t.route_to)}</div>
      <div class="card-actions">${actionBtns('transport', t.id)}</div>
    </div>
    <div class="card-body">
      ${t.date ? row('ti-calendar', formatDateCZ(t.date) + (t.time ? ' · ' + t.time.slice(0,5) : '')) : ''}
      ${t.ticket_type ? row('ti-ticket', esc(t.ticket_type)) : ''}
      ${t.price ? row('ti-currency-koruna', `${formatKc(t.price)} Kč`) : ''}
      ${t.notes ? row('ti-notes', esc(t.notes)) : ''}
    </div>
    <div class="card-footer">
      ${countryBadge(t.country)}
      ${t.price ? `<span class="price-tag">${formatKc(t.price)} Kč</span>` : ''}
    </div>
  </div>`;
}

/* ════════════════════════════════════════════════════════════
   BUDGET
════════════════════════════════════════════════════════════ */
async function loadBudget() {
  const data = await fetchData('expenses', 'date');
  renderBudget(data);
}

function renderBudget(expenses) {
  const total  = CONFIG.TOTAL_BUDGET_CZK || 0;
  const spent  = expenses.reduce((s, e) => s + parseFloat(e.amount_czk || 0), 0);
  const remain = total - spent;
  const pct    = total ? Math.min(100, Math.round((spent / total) * 100)) : 0;

  // Per-category totals
  const cats   = ['Letenky','Ubytování','Aktivity','Jídlo','Doprava','Ostatní'];
  const catTot = {};
  cats.forEach((c) => { catTot[c] = 0; });
  expenses.forEach((e) => { if (catTot[e.category] !== undefined) catTot[e.category] += parseFloat(e.amount_czk || 0); });

  const catRows = cats.map((c) => {
    const amt = catTot[c];
    const catPct = spent ? Math.round((amt / spent) * 100) : 0;
    return `<div class="cat-row">
      <div class="cat-label">
        <span>${CAT_ICONS[c]}</span>
        <span>${c}</span>
      </div>
      <div class="cat-bar-wrap">
        <div class="cat-bar-fill" style="width:${catPct}%;background:${CAT_COLORS[c]}"></div>
      </div>
      <div class="cat-amount">${formatKc(amt)} Kč</div>
    </div>`;
  }).join('');

  const expenseItems = [...expenses].sort((a, b) => b.date.localeCompare(a.date)).map((e) => `
    <div class="expense-item">
      <div class="expense-cat-icon">${CAT_ICONS[e.category] || '💳'}</div>
      <div class="expense-info">
        <div class="expense-desc">${esc(e.description || e.category)}</div>
        <div class="expense-meta">${e.category} · ${formatDateCZ(e.date)}</div>
      </div>
      <div class="expense-amount">${formatKc(e.amount_czk)} Kč</div>
      <div class="expense-actions">
        <button class="btn-icon edit" onclick="openEditModal('expenses','${e.id}')" title="Upravit"><i class="ti ti-pencil"></i></button>
        <button class="btn-icon delete" onclick="confirmDelete('expenses','${e.id}')" title="Smazat"><i class="ti ti-trash"></i></button>
      </div>
    </div>`).join('');

  document.getElementById('budget-content').innerHTML = `
    <div class="budget-overview">
      <div class="budget-overview-card total">
        <div class="bov-label">Celkový rozpočet</div>
        <div class="bov-amount total">${formatKc(total)} Kč</div>
        <div class="budget-progress-bar"><div class="budget-progress-fill" style="width:${pct}%"></div></div>
        <div class="text-sm text-muted mt-1">${pct}% utraceno</div>
      </div>
      <div class="budget-overview-card spent">
        <div class="bov-label">Utraceno</div>
        <div class="bov-amount spent">${formatKc(spent)} Kč</div>
      </div>
      <div class="budget-overview-card remaining">
        <div class="bov-label">Zbývá</div>
        <div class="bov-amount remain ${remain < 0 ? 'spent' : ''}">${formatKc(Math.abs(remain))} Kč${remain < 0 ? ' (překročeno)' : ''}</div>
      </div>
    </div>

    <div class="budget-categories">
      <h3>Výdaje podle kategorií</h3>
      ${catRows}
    </div>

    <div class="expenses-list">
      ${expenses.length ? expenseItems : `<div class="empty-state"><div class="empty-icon"><i class="ti ti-receipt-off"></i></div><h3>Žádné výdaje</h3><p>Přidejte první výdaj.</p></div>`}
    </div>`;
}

/* ════════════════════════════════════════════════════════════
   MODAL SYSTEM
════════════════════════════════════════════════════════════ */
function setupModalListeners() {
  document.getElementById('modal-close-btn').addEventListener('click',  closeModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
  document.getElementById('modal-save-btn').addEventListener('click',   saveModalForm);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });
  document.getElementById('confirm-cancel-btn').addEventListener('click', closeConfirm);
  document.getElementById('confirm-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('confirm-overlay')) closeConfirm();
  });
}

function openAddModal(section) {
  if (!isOnline) { showToast('Přidávání dostupné jen online.', 'error'); return; }
  editingId      = null;
  editingSection = section;
  document.getElementById('modal-title').textContent = `Přidat — ${SECTION_TITLES[section] || section}`;
  document.getElementById('modal-body').innerHTML    = buildForm(section, {});
  document.getElementById('modal-overlay').style.display = 'flex';
}

async function openEditModal(section, id) {
  if (!isOnline) { showToast('Úpravy dostupné jen online.', 'error'); return; }
  editingId      = id;
  editingSection = section;

  // Find the record in cache first
  const table = sectionToTable(section);
  const cache = getCache(table);
  const item  = cache.find((r) => r.id === id);

  document.getElementById('modal-title').textContent = `Upravit — ${SECTION_TITLES[section] || section}`;
  document.getElementById('modal-body').innerHTML    = buildForm(section, item || {});
  document.getElementById('modal-overlay').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  editingId      = null;
  editingSection = null;
}

async function saveModalForm() {
  if (!editingSection) return;
  const form = document.getElementById('modal-body').querySelector('.modal-form');
  if (!form) return;

  // Clear previous errors
  form.querySelectorAll('.error').forEach((el) => el.classList.remove('error'));

  const data  = collectForm(form);
  const valid = validateForm(form, data);
  if (!valid) return;

  const table = sectionToTable(editingSection);
  const saveBtn = document.getElementById('modal-save-btn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="ti ti-loader-2" style="animation:spin 1s linear infinite"></i> Ukládám…';

  let ok;
  if (editingId) {
    const { error } = await db.from(table).update(data).eq('id', editingId);
    ok = !error;
    if (error) console.error(error);
  } else {
    const { error } = await db.from(table).insert(data);
    ok = !error;
    if (error) console.error(error);
  }

  saveBtn.disabled = false;
  saveBtn.innerHTML = '<i class="ti ti-check"></i> Uložit';

  if (ok) {
    showToast(editingId ? 'Záznam upraven.' : 'Záznam přidán.', 'success');
    closeModal();
    loadSection(editingSection === 'expenses' ? 'budget' : editingSection);
  } else {
    showToast('Chyba při ukládání. Zkuste to znovu.', 'error');
  }
}

function collectForm(form) {
  const data = {};
  form.querySelectorAll('[name]').forEach((el) => {
    const v = el.value.trim();
    data[el.name] = v === '' ? null : v;
  });
  return data;
}

function validateForm(form, data) {
  let valid = true;
  form.querySelectorAll('[required]').forEach((el) => {
    if (!el.value.trim()) {
      el.classList.add('error');
      valid = false;
    }
  });
  return valid;
}

function sectionToTable(section) {
  const map = { expenses: 'expenses', flights: 'flights', accommodations: 'accommodations',
                activities: 'activities', restaurants: 'restaurants', transport: 'transport' };
  return map[section] || section;
}

/* ════════════════════════════════════════════════════════════
   CONFIRM DELETE
════════════════════════════════════════════════════════════ */
function confirmDelete(section, id) {
  if (!isOnline) { showToast('Mazání dostupné jen online.', 'error'); return; }
  pendingDelete = { section, id };
  document.getElementById('confirm-overlay').style.display = 'flex';
  document.getElementById('confirm-ok-btn').onclick = executeDelete;
}

async function executeDelete() {
  if (!pendingDelete) return;
  const { section, id } = pendingDelete;
  const table = sectionToTable(section);
  const { error } = await db.from(table).delete().eq('id', id);
  closeConfirm();
  if (!error) {
    showToast('Záznam smazán.', 'success');
    loadSection(section === 'expenses' ? 'budget' : section);
  } else {
    showToast('Chyba při mazání.', 'error');
  }
}

function closeConfirm() {
  document.getElementById('confirm-overlay').style.display = 'none';
  pendingDelete = null;
}

/* ════════════════════════════════════════════════════════════
   FORM BUILDERS
════════════════════════════════════════════════════════════ */
function buildForm(section, d) {
  switch (section) {
    case 'flights':        return flightsForm(d);
    case 'accommodations': return accommodationsForm(d);
    case 'activities':     return activitiesForm(d);
    case 'restaurants':    return restaurantsForm(d);
    case 'transport':      return transportForm(d);
    case 'expenses':       return expensesForm(d);
    default: return '<p>Neznámá sekce.</p>';
  }
}

const countryOptions = (val = '') => `
  <option value="Korea"     ${val==='Korea'     ? 'selected':''}>🇰🇷 Korea</option>
  <option value="Japonsko"  ${val==='Japonsko'  ? 'selected':''}>🇯🇵 Japonsko</option>
  <option value="Obě"       ${val==='Obě'       ? 'selected':''}>🌏 Obě</option>
  <option value="Transfer"  ${val==='Transfer'  ? 'selected':''}>🔄 Transfer</option>`;

function flightsForm(d) {
  return `<form class="modal-form" id="modal-form">
    <div class="form-row">
      <div class="form-group">
        <label>Číslo letu</label>
        <input name="flight_number" value="${esc(d.flight_number||'')}" placeholder="KE123">
      </div>
      <div class="form-group">
        <label>Datum <span class="form-required">*</span></label>
        <input type="date" name="date" value="${d.date||''}" required>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Odletové letiště <span class="form-required">*</span></label>
        <input name="from_airport" value="${esc(d.from_airport||'')}" placeholder="PRG" required>
      </div>
      <div class="form-group">
        <label>Příletové letiště <span class="form-required">*</span></label>
        <input name="to_airport" value="${esc(d.to_airport||'')}" placeholder="ICN" required>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Odlet</label>
        <input type="time" name="departure_time" value="${d.departure_time||''}">
      </div>
      <div class="form-group">
        <label>Přílet</label>
        <input type="time" name="arrival_time" value="${d.arrival_time||''}">
      </div>
    </div>
    <div class="form-group">
      <label>Booking reference</label>
      <input name="booking_ref" value="${esc(d.booking_ref||'')}" placeholder="ABC123">
    </div>
    <div class="form-group">
      <label>Země / typ</label>
      <select name="country">${countryOptions(d.country)}</select>
    </div>
    <div class="form-group">
      <label>Poznámky</label>
      <textarea name="notes" placeholder="Terminál, přestup…">${esc(d.notes||'')}</textarea>
    </div>
  </form>`;
}

function accommodationsForm(d) {
  return `<form class="modal-form" id="modal-form">
    <div class="form-group">
      <label>Název <span class="form-required">*</span></label>
      <input name="name" value="${esc(d.name||'')}" placeholder="Hotel Sakura" required>
    </div>
    <div class="form-group">
      <label>Adresa</label>
      <input name="address" value="${esc(d.address||'')}" placeholder="123 Gangnam-gu, Seoul">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Check-in <span class="form-required">*</span></label>
        <input type="date" name="checkin" value="${d.checkin||''}" required>
      </div>
      <div class="form-group">
        <label>Check-out <span class="form-required">*</span></label>
        <input type="date" name="checkout" value="${d.checkout||''}" required>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Cena (Kč)</label>
        <input type="number" name="price_czk" value="${d.price_czk||''}" min="0" placeholder="12500">
      </div>
      <div class="form-group">
        <label>Země</label>
        <select name="country">${countryOptions(d.country)}</select>
      </div>
    </div>
    <div class="form-group">
      <label>Odkaz na booking</label>
      <input type="url" name="booking_url" value="${esc(d.booking_url||'')}" placeholder="https://booking.com/…">
    </div>
    <div class="form-group">
      <label>Poznámky</label>
      <textarea name="notes" placeholder="WiFi heslo, adresa na mapu…">${esc(d.notes||'')}</textarea>
    </div>
  </form>`;
}

function activitiesForm(d) {
  const statuses = ['naplánováno','rezervováno','hotovo'];
  const statusOpts = statuses.map((s) => `<option value="${s}" ${d.status===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('');
  return `<form class="modal-form" id="modal-form">
    <div class="form-group">
      <label>Název <span class="form-required">*</span></label>
      <input name="name" value="${esc(d.name||'')}" placeholder="Gyeongbokgung palác" required>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Datum</label>
        <input type="date" name="date" value="${d.date||''}">
      </div>
      <div class="form-group">
        <label>Čas</label>
        <input type="time" name="time" value="${d.time||''}">
      </div>
    </div>
    <div class="form-group">
      <label>Místo / lokace</label>
      <input name="location" value="${esc(d.location||'')}" placeholder="Seoul, Korea">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Cena (Kč)</label>
        <input type="number" name="price" value="${d.price||''}" min="0">
      </div>
      <div class="form-group">
        <label>Status</label>
        <select name="status">${statusOpts}</select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Země</label>
        <select name="country">${countryOptions(d.country)}</select>
      </div>
      <div class="form-group">
        <label>Odkaz</label>
        <input type="url" name="url" value="${esc(d.url||'')}" placeholder="https://…">
      </div>
    </div>
    <div class="form-group">
      <label>Poznámky</label>
      <textarea name="notes">${esc(d.notes||'')}</textarea>
    </div>
  </form>`;
}

function restaurantsForm(d) {
  const ranges = ['$','$$','$$$','$$$$'];
  const rangeOpts = ranges.map((r) => `<option value="${r}" ${d.price_range===r?'selected':''}>${r}</option>`).join('');
  const countryOpts = `
    <option value="Korea"    ${d.country==='Korea'    ? 'selected':''}>🇰🇷 Korea</option>
    <option value="Japonsko" ${d.country==='Japonsko' ? 'selected':''}>🇯🇵 Japonsko</option>
    <option value="Obě"      ${d.country==='Obě'      ? 'selected':''}>🌏 Obě</option>`;
  return `<form class="modal-form" id="modal-form">
    <div class="form-group">
      <label>Název <span class="form-required">*</span></label>
      <input name="name" value="${esc(d.name||'')}" placeholder="Jinju Hoetjip" required>
    </div>
    <div class="form-group">
      <label>Adresa</label>
      <input name="address" value="${esc(d.address||'')}" placeholder="Myeongdong, Seoul">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Typ kuchyně</label>
        <input name="cuisine_type" value="${esc(d.cuisine_type||'')}" placeholder="Korejské BBQ">
      </div>
      <div class="form-group">
        <label>Cenová hladina</label>
        <select name="price_range">${rangeOpts}</select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Země</label>
        <select name="country">${countryOpts}</select>
      </div>
      <div class="form-group">
        <label>Odkaz / recenze</label>
        <input type="url" name="url" value="${esc(d.url||'')}" placeholder="https://…">
      </div>
    </div>
    <div class="form-group">
      <label>Poznámky</label>
      <textarea name="notes">${esc(d.notes||'')}</textarea>
    </div>
  </form>`;
}

function transportForm(d) {
  const types = ['Shinkansen','KTX','Metro','Bus','Taxi','Trajekt','Jiné'];
  const typeOpts = types.map((t) => `<option value="${t}" ${d.ticket_type===t?'selected':''}>${t}</option>`).join('');
  return `<form class="modal-form" id="modal-form">
    <div class="form-row">
      <div class="form-group">
        <label>Odkud <span class="form-required">*</span></label>
        <input name="route_from" value="${esc(d.route_from||'')}" placeholder="Osaka" required>
      </div>
      <div class="form-group">
        <label>Kam <span class="form-required">*</span></label>
        <input name="route_to" value="${esc(d.route_to||'')}" placeholder="Kyoto" required>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Datum</label>
        <input type="date" name="date" value="${d.date||''}">
      </div>
      <div class="form-group">
        <label>Čas odjezdu</label>
        <input type="time" name="time" value="${d.time||''}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Typ jízdenky</label>
        <select name="ticket_type">${typeOpts}</select>
      </div>
      <div class="form-group">
        <label>Cena (Kč)</label>
        <input type="number" name="price" value="${d.price||''}" min="0">
      </div>
    </div>
    <div class="form-group">
      <label>Země</label>
      <select name="country">${countryOptions(d.country)}</select>
    </div>
    <div class="form-group">
      <label>Poznámky</label>
      <textarea name="notes" placeholder="Číslo vlaku, platforma…">${esc(d.notes||'')}</textarea>
    </div>
  </form>`;
}

function expensesForm(d) {
  const cats = ['Letenky','Ubytování','Aktivity','Jídlo','Doprava','Ostatní'];
  const catOpts = cats.map((c) => `<option value="${c}" ${d.category===c?'selected':''}>${CAT_ICONS[c]} ${c}</option>`).join('');
  return `<form class="modal-form" id="modal-form">
    <div class="form-group">
      <label>Kategorie <span class="form-required">*</span></label>
      <select name="category" required>${catOpts}</select>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Částka (Kč) <span class="form-required">*</span></label>
        <input type="number" name="amount_czk" value="${d.amount_czk||''}" min="0" step="1" required>
      </div>
      <div class="form-group">
        <label>Datum <span class="form-required">*</span></label>
        <input type="date" name="date" value="${d.date || todayISO()}" required>
      </div>
    </div>
    <div class="form-group">
      <label>Popis</label>
      <input name="description" value="${esc(d.description||'')}" placeholder="Narita Express, vstupenky…">
    </div>
  </form>`;
}

/* ════════════════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════════════════ */
function showToast(msg, type = 'info') {
  const icons = { success: 'ti-check', error: 'ti-alert-circle', info: 'ti-info-circle' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="ti ${icons[type] || 'ti-info-circle'}"></i> ${msg}`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

/* ════════════════════════════════════════════════════════════
   UTILITIES
════════════════════════════════════════════════════════════ */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function formatDateCZ(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('cs-CZ', { day:'numeric', month:'short', year:'numeric' });
}

function formatKc(n) {
  const num = parseFloat(n) || 0;
  return num.toLocaleString('cs-CZ', { maximumFractionDigits: 0 });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function countryBadge(country) {
  const map = {
    'Korea':    ['badge-korea',    '🇰🇷 Korea'],
    'Japonsko': ['badge-japan',    '🇯🇵 Japonsko'],
    'Transfer': ['badge-transfer', '🔄 Transfer'],
    'Obě':      ['badge-both',     '🌏 Obě'],
  };
  const [cls, label] = map[country] || ['badge-both', country || ''];
  return label ? `<span class="badge ${cls}">${label}</span>` : '';
}

function row(icon, content) {
  return `<div class="card-row"><i class="ti ${icon}"></i><span>${content}</span></div>`;
}

function actionBtns(section, id) {
  return `
    <button class="btn-icon edit"   onclick="openEditModal('${section}','${id}')"  title="Upravit"><i class="ti ti-pencil"></i></button>
    <button class="btn-icon delete" onclick="confirmDelete('${section}','${id}')"  title="Smazat"><i class="ti ti-trash"></i></button>`;
}

function emptyState(icon, title, sub) {
  return `<div class="empty-state">
    <div class="empty-icon"><i class="ti ${icon}"></i></div>
    <h3>${title}</h3>
    <p>${sub}</p>
  </div>`;
}

// CSS spin keyframe for loading button (injected once)
const spinStyle = document.createElement('style');
spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(spinStyle);
