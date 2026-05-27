// ============================================================
// app.js — Korea & Japonsko Trip Planner · Atlas Editorial
// ============================================================

/* ════ STATE ════════════════════════════════════════════════ */
let db = null;
let currentSection = 'dashboard';
let isOnline = navigator.onLine;
let pendingDelete = null;
let editingId = null;
let editingSection = null;
let activitiesFilter = 'all';
let restaurantsFilter = 'all';
let photoCurrent = 0;
const TRIP_DEFAULT_DATE = '2026-09-04';
let calYear = 2026, calMonth = 8; // 0-indexed, 8 = září
let calSelectedDay = null;
let calEventMap = {};

const SECTION_TITLES = {
  dashboard: 'Přehled', flights: 'Cestování', accommodations: 'Ubytování',
  activities: 'Místa', priprava: 'Příprava', restaurants: 'Restaurace',
  transport: 'Jízdní řády', budget: 'Rozpočet', calendar: 'Kalendář',
};
const CAT_ICONS = { 'Letenky':'✈️','Ubytování':'🏨','Aktivity':'🗺️','Jídlo':'🍜','Doprava':'🚆','Ostatní':'💳' };
const CAT_COLORS = { 'Letenky':'#C73A1A','Ubytování':'#1A55A0','Aktivity':'#2A7A3A','Jídlo':'#8A6200','Doprava':'#6B3FA0','Ostatní':'#7A7268' };

const ITINERARY = [
  { d1: 'So 5.9.',  d2: 'St 9.9.',   nights: 4, city: 'Seoul',    country: 'Korea',    tag: 'budha, Sogeumsan bridge'    },
  { d1: 'St 9.9.',  d2: 'Čt 10.9.',  nights: 1, city: 'Gyeongju',    country: 'Korea',    tag: 'Bulguksa temple'       },
  { d1: 'Čt 10.9.', d2: 'Po 14.9.',  nights: 4, city: 'Busan',    country: 'Korea',    tag: 'cable car, Gamcheon village'             },
  { d1: 'Po 14.9.', d2: 'St 16.9.',  nights: 2, city: 'Hiroshima',  country: 'Japonsko', tag: 'Miyajima Island, Genbaku Dome'},
  { d1: 'St 16.9.', d2: 'Ne 20.9.',  nights: 4, city: 'Kyoto',    country: 'Japonsko', tag: 'Kiyomizu-dera, Golden Pavilion, Nara, Osaka'},
  { d1: 'Ne 20.9.', d2: 'So 26.9.',  nights: 6, city: 'Tokyo',    country: 'Japonsko', tag: 'Asakusa, Tokyo Tower, Shibuya, Yokohama'    },
];

const TRIP_PHOTOS = [
  { src: 'assets/Busan-beach.jpg',          caption: 'Busan - pláž' },
  { src: 'assets/Nara-Japonsko.jpg',        caption: 'Nara' },
  { src: 'assets/Busan-cable-car.jpg',      caption: 'Busan - cable car' },
  { src: 'assets/Kyoto-zlaty-pavilon.jpg',  caption: 'Kyoto - Zlatý pavilon' },
  { src: 'assets/Busan-Gamcheon.jpg',       caption: 'Busan - Gamcheon' },
  { src: 'assets/Hiroshima-pamatnik.jpg',   caption: 'Hiroshima - památník' },
  { src: 'assets/Tokyo-Shibuya.jpg',        caption: 'Tokyo - Shibuya' },
];

const MAP_CITIES = [
  // Souřadnice jsou v pixelech originálního obrázku map-asia2.png (650×381)
  // viewBox "40 85 580 285" ořízne bílé okraje a zobrazí obsah
  // lx,ly = konec leader linie (= pozice popisku)
  { name: 'Seoul',     x:  88, y: 215, lx: 138, ly: 170, anchor: 'start'  },
  { name: 'Gyeongju',  x: 118, y: 270, lx: 168, ly: 255, anchor: 'start'  },
  { name: 'Busan',     x: 112, y: 318, lx: 158, ly: 310, anchor: 'start'  },
  { name: 'Fukuoka',   x: 178, y: 285, lx: 130, ly: 338, anchor: 'end'    },
  { name: 'Hiroshima', x: 308, y: 252, lx: 288, ly: 203, anchor: 'middle' },
  { name: 'Osaka',     x: 348, y: 238, lx: 302, ly: 288, anchor: 'end'    },
  { name: 'Kyoto',     x: 365, y: 232, lx: 415, ly: 187, anchor: 'start'  },
  { name: 'Tokyo',     x: 456, y: 190, lx: 510, ly: 147, anchor: 'start'  },
];

/* ════ INIT ═════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  if (!checkConfig()) return;
  registerServiceWorker();
  initSupabase();
  setupOnlineDetection();
  setupNavigation();
  setupModalListeners();
  setupAuthListeners();

  const titleEl = document.getElementById('sidebar-trip-title');
  if (titleEl) {
    const t = CONFIG.TRIP_TITLE || 'Korea & Japonsko';
    const amp = t.indexOf(' & ');
    titleEl.innerHTML = amp > 0
      ? `${t.slice(0, amp)}<br><em class="sidebar-title-line2">&amp; ${t.slice(amp + 3)}</em>`
      : t;
  }

  const session = await getSession();
  if (session) { showApp(); navigateTo('dashboard'); }
  else          { showLogin(); }
});

function checkConfig() {
  if (!CONFIG.SUPABASE_URL || CONFIG.SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
    document.body.innerHTML = `
      <div style="min-height:100dvh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;padding:24px;background:#faf6ee">
        <div style="max-width:440px;text-align:center">
          <div style="font-size:3rem;margin-bottom:16px">⚙️</div>
          <h2 style="font-size:1.4rem;margin-bottom:12px">Konfigurace chybí</h2>
          <p style="color:#857c70;margin-bottom:12px">Vyplňte <code>SUPABASE_URL</code> a <code>SUPABASE_ANON_KEY</code> v souboru <strong>config.js</strong>.</p>
        </div>
      </div>`;
    return false;
  }
  return true;
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
}
function initSupabase() {
  db = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

/* ════ AUTH ═════════════════════════════════════════════════ */
async function getSession() { const { data: { session } } = await db.auth.getSession(); return session; }

function setupAuthListeners() {
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass  = document.getElementById('login-password').value;
    const btn   = document.getElementById('login-btn');
    const errEl = document.getElementById('login-error');
    btn.disabled = true;
    document.getElementById('login-btn-text').textContent = 'Přihlašování…';
    errEl.style.display = 'none';
    const { error } = await db.auth.signInWithPassword({ email, password: pass });
    if (error) {
      errEl.textContent = 'Nesprávný e-mail nebo heslo.';
      errEl.style.display = 'block';
      btn.disabled = false;
      document.getElementById('login-btn-text').textContent = 'Přihlásit se';
    } else {
      showApp(); navigateTo('dashboard');
    }
  });

  document.getElementById('toggle-pass-btn').addEventListener('click', () => {
    const inp = document.getElementById('login-password');
    const ico = document.getElementById('eye-icon');
    if (inp.type === 'password') { inp.type = 'text';     ico.className = 'ti ti-eye-off'; }
    else                         { inp.type = 'password'; ico.className = 'ti ti-eye'; }
  });

  document.getElementById('logout-btn-sidebar').addEventListener('click', logout);
  document.getElementById('logout-btn-topbar').addEventListener('click',  logout);
}

async function logout() { await db.auth.signOut(); showLogin(); }

function showLogin() {
  document.getElementById('login-screen').style.display = '';
  document.getElementById('app').style.display = 'none';
  updateLoginDynamic();
}

function updateLoginDynamic() {
  if (!CONFIG.DEPARTURE_DATE || !CONFIG.RETURN_DATE) return;
  const today = new Date(); today.setHours(0,0,0,0);
  const dep   = new Date(CONFIG.DEPARTURE_DATE + 'T00:00:00');
  const ret   = new Date(CONFIG.RETURN_DATE    + 'T00:00:00');
  const left  = Math.ceil((dep - today) / 86400000);
  const trip  = Math.ceil((ret - dep)   / 86400000);
  const sub   = document.getElementById('login-card-sub');
  const badge = document.getElementById('login-daybadge');
  if (sub) sub.textContent = left > 0
    ? `${left} dní do odjezdu · 8 měst · ${trip} dní`
    : left === 0
      ? `Odjezd dnes · 8 měst · ${trip} dní`
      : `Den pobytu ${Math.abs(left)+1} · 8 měst · ${trip} dní`;
  if (badge) badge.textContent = left >= 0 ? `Den −${left}` : `Den +${Math.abs(left)}`;
  const eyebrow = document.getElementById('login-eyebrow');
  if (eyebrow) eyebrow.textContent = left > 31 ? 'Pomalu se chystáme' : left > 0 ? 'Už se to blíží' : 'Je to tady!';
}
function showApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'grid';
}

/* ════ NAVIGATION ═══════════════════════════════════════════ */
function setupNavigation() {
  document.querySelectorAll('#sidebar-nav .nav-item, .bnav-item').forEach((el) => {
    el.addEventListener('click', () => navigateTo(el.dataset.section));
  });
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add]');
    if (addBtn && !addBtn.disabled) { openAddModal(addBtn.dataset.add); return; }
    const filterBtn = e.target.closest('.filter-btn');
    if (filterBtn) handleFilterClick(filterBtn);

    // Todos
    const delBtn = e.target.closest('[data-todo-delete]');
    if (delBtn) { e.stopPropagation(); todoDelete(delBtn.dataset.todoDelete); return; }
    const todoItem = e.target.closest('.todo-item');
    if (todoItem?.dataset.id && !e.target.closest('.todo-text')) {
      todoToggle(todoItem.dataset.id, !todoItem.classList.contains('done'));
    }
  });
  document.addEventListener('submit', (e) => {
    if (e.target.id === 'todo-add-form') todoAdd(e);
  });
  document.addEventListener('dblclick', (e) => {
    const textEl = e.target.closest('.todo-text');
    if (textEl) { e.stopPropagation(); todoStartEdit(textEl); }
  });
}

function navigateTo(section) {
  currentSection = section;
  document.querySelectorAll('.section').forEach((s) => s.classList.remove('active'));
  document.getElementById(`section-${section}`).classList.add('active');
  document.querySelectorAll('.nav-item, .bnav-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.section === section);
  });
  document.getElementById('topbar-title').textContent = SECTION_TITLES[section] || section;
  loadSection(section);
}

function loadSection(s) {
  const map = { dashboard:'loadDashboard', flights:'loadFlights', accommodations:'loadAccommodations',
                activities:'loadActivities', priprava:'loadPriprava', restaurants:'loadRestaurants',
                transport:'loadTransport', budget:'loadBudget', calendar:'loadCalendar' };
  if (map[s]) window[map[s]]();
}

function handleFilterClick(btn) {
  const parentId = btn.closest('.filter-bar')?.id;
  if (parentId === 'activities-filter') {
    activitiesFilter = btn.dataset.filter;
    btn.closest('.filter-bar').querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    renderActivitiesFromCache();
  }
  if (parentId === 'restaurants-filter') {
    restaurantsFilter = btn.dataset.filter;
    btn.closest('.filter-bar').querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    renderRestaurantsFromCache();
  }
}

/* ════ DATA ═════════════════════════════════════════════════ */
async function fetchData(table, order = 'created_at') {
  if (!isOnline) return getCache(table);
  try {
    const { data, error } = await db.from(table).select('*').order(order, { ascending: true });
    if (error) throw error;
    setCache(table, data);
    return data;
  } catch { return getCache(table); }
}
function setCache(t, d) { try { localStorage.setItem(`cache_${t}`, JSON.stringify(d)); } catch {} }
function getCache(t)    { try { return JSON.parse(localStorage.getItem(`cache_${t}`)) || []; } catch { return []; } }

/* ════ ONLINE/OFFLINE ═══════════════════════════════════════ */
function setupOnlineDetection() {
  window.addEventListener('online',  () => { isOnline = true;  updateOnlineUI(); loadSection(currentSection); });
  window.addEventListener('offline', () => { isOnline = false; updateOnlineUI(); });
  updateOnlineUI();
}
function updateOnlineUI() {
  document.getElementById('offline-banner').style.display = isOnline ? 'none' : 'flex';
}

/* ════ SVG MAP ══════════════════════════════════════════════ */
function tripMapSVG() {
  return `<img src="assets/mapa-mesta.png"
               style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;display:block;z-index:1;"
               alt="Mapa trasy Korea — Japonsko">`;
}

const KANJI = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

/* ════ PAGE HEADER HELPER ═══════════════════════════════════ */
function pageHeader({ num, label, h1, accentWord, desc, stats, addSection, addLabel }) {
  const kanji  = KANJI[num] || num;
  const h1Html = accentWord ? h1.replace(accentWord, `<em>${accentWord}</em>`) : h1;

  const addBtnHtml = addSection ? `
    <button class="btn btn-primary btn-add${isOnline ? '' : ' disabled'}"
            data-add="${addSection}"${isOnline ? '' : ' disabled'}>
      <i class="ti ti-plus"></i> ${addLabel || 'Přidat'}
    </button>` : '';

  const statsItemsHtml = (stats || []).map(s => `
    <div class="stats-strip-item">
      <span class="stats-strip-value">${s.value}</span>
      <span class="stats-strip-label">${s.label}</span>
    </div>`).join('');

  const stripHtml = (statsItemsHtml || addBtnHtml) ? `
    <div class="stats-strip">
      ${statsItemsHtml}
      ${addBtnHtml ? `<div class="stats-strip-add">${addBtnHtml}</div>` : ''}
    </div>` : '';

  return `
    <div class="masthead">
      <span>${kanji} · ${label}</span>
    </div>
    <div class="page-header">
      <div>
        <h1 class="page-h1">${h1Html}</h1>
      </div>
      ${desc ? `<p class="page-desc">${desc}</p>` : '<div></div>'}
    </div>
    ${stripHtml}`;
}

/* ════ DASHBOARD ════════════════════════════════════════════ */
async function loadDashboard() {
  const [flights, accommodations, activities, expenses] = await Promise.all([
    fetchData('flights','date'), fetchData('accommodations','checkin'),
    fetchData('activities','date'), fetchData('expenses','date'),
  ]);

  // Polaroid — náhodná fotka mimo prvních 5 v kariéře
  const polaroidPool = TRIP_PHOTOS.length > 5 ? TRIP_PHOTOS.slice(5) : TRIP_PHOTOS;
  const _pp = polaroidPool[Math.floor(Math.random() * polaroidPool.length)];
  const polaroidPhoto = {
    src: _pp.src || `https://images.unsplash.com/photo-${_pp.id}?w=400&auto=format&fit=crop&q=80`,
    caption: _pp.caption,
  };
  const polaroidRotation = (-(Math.random() * 4 + 2)).toFixed(2); // vždy doleva, 2–6°

  const today      = new Date(); today.setHours(0,0,0,0);
  const departure  = new Date(CONFIG.DEPARTURE_DATE + 'T00:00:00');
  const returnDate = new Date(CONFIG.RETURN_DATE    + 'T00:00:00');
  const daysLeft   = Math.ceil((departure - today) / 86400000);
  const tripDays   = Math.ceil((returnDate - departure) / 86400000);
  const totalSpent = expenses.reduce((s,e) => s + parseFloat(e.amount_czk||0), 0);
  const pct        = CONFIG.TOTAL_BUDGET_CZK
    ? Math.min(100, Math.round((totalSpent / CONFIG.TOTAL_BUDGET_CZK) * 100)) : 0;

  // Today formatted for masthead
  const CZ_DAYS = ['Ne','Po','Út','St','Čt','Pá','So'];
  const now = new Date();
  const todayMasthead = `${CZ_DAYS[now.getDay()]} ${now.getDate()}. ${now.getMonth()+1}.`;

  // Days badge
  const daysSign = daysLeft >= 0 ? `-${daysLeft}` : `+${Math.abs(daysLeft)}`;
  const dayStatVal   = daysLeft > 0 ? daysLeft : Math.abs(daysLeft) + 1;
  const dayStatLabel = daysLeft > 0 ? 'Dní do odjezdu' : 'Den pobytu';

  // Prep bars with sub-notes
  const bookedFlights = flights.filter(f => f.booking_ref && f.booking_ref.trim()).length;
  const bookedAccom   = accommodations.filter(a => a.booking_url && a.booking_url.trim()).length;
  const bookedAct     = activities.filter(a => a.status === 'rezervováno' || a.status === 'hotovo').length;
  const prepData = [
    { label: 'Jízdenky',  done: bookedFlights, total: flights.length,       note: 'rezervováno' },
    { label: 'Ubytování', done: bookedAccom,   total: accommodations.length, note: 'rezervováno' },
    { label: 'Aktivity',  done: bookedAct,     total: activities.length,    note: 'rezervováno'  },
  ];
  const prepItems = prepData.map(p => {
    const pctBar = p.total ? Math.min(100, Math.round((p.done/p.total)*100)) : 0;
    return `<div class="prep-item">
      <div class="prep-item-header">
        <span class="prep-label">${p.label}</span>
        <span class="prep-frac">${p.done} / ${p.total}</span>
      </div>
      <div class="prep-bar-wrap">
        <div class="prep-bar-fill" style="width:${pctBar}%;background:var(--acc)"></div>
      </div>
      <div class="prep-note">${p.note}</div>
    </div>`;
  }).join('');

  // Itinerary — first 5 items only (matches design spec), "VŠE →" leads to full list
  const itineraryHtml = ITINERARY.slice(0, 6).map((item, i) => {
    const n = item.nights;
    const nightsLabel = n === 1 ? '1 noc' : n < 5 ? `${n} noci` : `${n} nocí`;
    return `<div class="itinerary-item">
      <div class="itinerary-num">${String(i+1).padStart(2,'0')}</div>
      <div>
        <div class="itinerary-city">${item.city} <em>— ${item.tag}</em></div>
        <div class="itinerary-dates">${item.d1} → ${item.d2} · ${item.country||''}</div>
      </div>
      <div class="itinerary-nights">${nightsLabel}</div>
    </div>`;
  }).join('');

  // Photos carousel strip
  // To add photos: append to TRIP_PHOTOS at top of file.
  //   Unsplash:  { id: '1234567890-abcdef', caption: 'Popisek' }
  //   Vlastní:   { src: 'assets/foto.jpg',  caption: 'Popisek' }
  const photosStripHtml = TRIP_PHOTOS.map((p, i) => {
    const src = p.src
      ? p.src
      : `https://images.unsplash.com/photo-${p.id}?w=400&auto=format&fit=crop&q=80`;
    return `<div class="dash-photo-item" style="background-image:url('${src}')"
      onclick="openPhotoModal(${i})" role="button" tabindex="0">
      <div class="dash-photo-caption">${p.caption}</div>
    </div>`;
  }).join('');

  // Date strings
  const depStr = CONFIG.DEPARTURE_DATE
    ? new Date(CONFIG.DEPARTURE_DATE + 'T00:00:00').toLocaleDateString('cs-CZ', { day:'numeric', month:'numeric', year:'numeric' })
    : '—';
  const retStr = CONFIG.RETURN_DATE
    ? new Date(CONFIG.RETURN_DATE + 'T00:00:00').toLocaleDateString('cs-CZ', { day:'numeric', month:'numeric', year:'numeric' })
    : '—';

  document.getElementById('dashboard-content').innerHTML = `
    <div class="masthead">
      <span>Plán cesty</span>
      <span>${tripDays} dní · 2 země · 8 měst</span>
      <span>Naposledy upraveno · ${todayMasthead}</span>
    </div>

    <div class="dash-hero">
      <div class="dash-hero-bg" style="background-image:url('https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1600&auto=format&fit=crop&q=80')"></div>
      <div class="dash-hero-gradient"></div>
      <div class="dash-hero-inner">
        <div class="dash-hero-top">
          <div>
            <div class="dash-hero-eyebrow">
              Září 2026 · Den
              <span class="dash-hero-daybadge">${daysSign}</span>
            </div>
            <h1 class="dash-hero-title">Tři týdny<br>mezi <em>městy</em> a mořem</h1>
          </div>
        </div>
        <div class="dash-hero-bottom">
          <div class="dash-date-block">
            <div class="dash-date-label">Od</div>
            <div class="dash-date-value">${depStr}</div>
          </div>
          <div class="dash-date-block">
            <div class="dash-date-label">Do</div>
            <div class="dash-date-value">${retStr}</div>
          </div>
          <div class="dash-date-block">
            <div class="dash-date-label">Délka</div>
            <div class="dash-date-value">${tripDays} dní</div>
          </div>
          <div class="dash-cities-list">Seoul · Gyeongju · Busan · Fukuoka · Hiroshima · Kyoto · Osaka · Yokohama · Tokyo</div>
        </div>
      </div>
    </div>

    <div class="dash-map-section">
      <div class="dash-map-col">
        <div class="dash-map-label">
          <div class="dash-map-label-top">Korea — Japonsko</div>
          <div class="dash-map-label-sub">~ 1 700 km · 9 měst</div>
        </div>
        ${tripMapSVG()}
      </div>
      <div class="dash-photos-col">
        <div class="dash-photos-header">
          <div class="dash-photos-title">Cesta snů <em>v obrazech</em></div>
        </div>
        <div class="dash-photos-carousel">
          <div class="dash-photos-strip" id="photos-strip">${photosStripHtml}</div>
          <button class="carousel-btn carousel-prev" id="photo-prev-btn" onclick="photoNav(-1)">&#8249;</button>
          <button class="carousel-btn carousel-next" id="photo-next-btn" onclick="photoNav(1)">&#8250;</button>
        </div>
      </div>
    </div>

    <div class="dash-body">
      <div class="dash-col dash-col-border">
        <div class="dash-col-title">
          <span class="dash-col-h2">Plán cesty <em style="color:var(--ink3)">v šesti etapách</em></span>
          <span class="dash-col-link" onclick="navigateTo('activities')">VŠE →</span>
        </div>
        <div class="itinerary-list">${itineraryHtml}</div>
      </div>
      <div class="dash-col dash-col-border dash-col-prep" style="background:var(--panel)">
        <div class="dash-col-title">
          <span class="dash-col-h2"><em>Stav</em> přípravy</span>
          <span class="dash-col-link" onclick="navigateTo('priprava')">VŠE →</span>
        </div>
        ${prepItems}
        <div class="pull-quote-stats">
          <div>
            <div class="pull-stat-val">${dayStatVal}</div>
            <div class="pull-stat-label">${dayStatLabel}</div>
          </div>
          <div>
            <div class="pull-stat-val">${pct}&thinsp;<em>%</em></div>
            <div class="pull-stat-label">Rozpočtu vyčerpáno</div>
          </div>
        </div>
      </div>
      <div class="dash-col dash-col-alt motto-col">
        <div class="motto-eyebrow">Motto cesty</div>
        <p class="motto-text">„Jedeme oslavit, jak mládneme, a prožít budoucí nezapomenutelné vzpomínky."</p>
        <div class="motto-signature">M + L, podzim 2026</div>
        <div class="polaroid-wrap">
          <div class="polaroid" style="transform:rotate(${polaroidRotation}deg)">
            <div class="polaroid-tape"></div>
            <div class="polaroid-photo" style="background-image:url('${polaroidPhoto.src}')"></div>
            <div class="polaroid-caption">Na co se těšíme</div>
          </div>
        </div>
      </div>
    </div>

    ${tripFooter()}`;

  initPhotoCarousel();
}

/* ════ PHOTO CAROUSEL ═══════════════════════════════════════ */
function initPhotoCarousel() {
  photoCurrent = 0;
  updatePhotoButtons();
}

function updatePhotoButtons() {
  const prevBtn = document.getElementById('photo-prev-btn');
  const nextBtn = document.getElementById('photo-next-btn');
  if (!prevBtn || !nextBtn) return;
  const maxIdx = Math.max(0, TRIP_PHOTOS.length - 6);
  const showArrows = TRIP_PHOTOS.length > 6;
  prevBtn.style.display = showArrows ? '' : 'none';
  nextBtn.style.display = showArrows ? '' : 'none';
  prevBtn.style.opacity = photoCurrent === 0 ? '0.3' : '1';
  nextBtn.style.opacity = photoCurrent >= maxIdx ? '0.3' : '1';
}

function photoNav(dir) {
  const strip = document.getElementById('photos-strip');
  if (!strip) return;
  const gap = 8;
  const visCount = 6;
  const maxIdx = Math.max(0, TRIP_PHOTOS.length - visCount);
  photoCurrent = Math.max(0, Math.min(photoCurrent + dir, maxIdx));
  const itemW = Math.floor((strip.parentElement.offsetWidth - gap * (visCount - 1)) / visCount);
  strip.style.transform = `translateX(-${photoCurrent * (itemW + gap)}px)`;
  updatePhotoButtons();
}

/* ════ TODOS ════════════════════════════════════════════════ */
function renderTodosHtml(todos) {
  const itemsHtml = todos.map(t => `
    <div class="todo-item${t.done ? ' done' : ''}" data-id="${t.id}">
      <div class="todo-checkbox"><i class="ti ti-check todo-checkbox-icon"></i></div>
      <span class="todo-text">${esc(t.text)}</span>
      <button class="todo-delete" data-todo-delete="${t.id}" title="Smazat"><i class="ti ti-x"></i></button>
    </div>`).join('');
  return `
    ${todos.length
      ? `<div class="todo-list">${itemsHtml}</div>`
      : '<div class="dash-todo-empty">Žádné položky zatím nepřidány.</div>'}
    <form class="todo-add-form" id="todo-add-form">
      <input class="todo-add-input" id="todo-add-input" type="text" placeholder="Přidat úkol…" maxlength="200" autocomplete="off">
      <button class="todo-add-btn" type="submit" title="Přidat">✓</button>
    </form>`;
}

async function refreshTodos() {
  const todos = await fetchData('todos', 'created_at');
  const container = document.querySelector('.dash-todo');
  if (!container) return;
  container.innerHTML = `<div class="dash-todo-title">K vyřízení</div>${renderTodosHtml(todos)}`;
}

async function todoToggle(id, newDone) {
  const item = document.querySelector(`.todo-item[data-id="${id}"]`);
  if (item) item.classList.toggle('done', newDone);
  const { error } = await db.from('todos').update({ done: newDone }).eq('id', id);
  if (error) {
    if (item) item.classList.toggle('done', !newDone);
    showToast('Nepodařilo se uložit.', 'error');
    return;
  }
  const cached = getCache('todos');
  setCache('todos', cached.map(t => t.id === id ? { ...t, done: newDone } : t));
}

async function todoAdd(e) {
  e.preventDefault();
  const input = document.getElementById('todo-add-input');
  const text = (input?.value || '').trim();
  if (!text) return;
  input.value = '';
  input.disabled = true;
  const { error } = await db.from('todos').insert({ text });
  input.disabled = false;
  if (error) { showToast('Nepodařilo se přidat úkol.', 'error'); return; }
  await refreshTodos();
  document.getElementById('todo-add-input')?.focus();
}

function todoStartEdit(textEl) {
  if (textEl.querySelector('input')) return; // už editujeme
  const currentText = textEl.textContent.trim();
  const id = textEl.closest('.todo-item').dataset.id;
  textEl.innerHTML = `<input class="todo-edit-input" type="text" value="${esc(currentText)}" maxlength="200">`;
  const input = textEl.querySelector('input');
  input.focus();
  input.select();
  const save = () => todoSaveEdit(id, textEl, input.value.trim(), currentText);
  input.addEventListener('blur', save);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')  { e.preventDefault(); input.blur(); }
    if (e.key === 'Escape') { textEl.textContent = currentText; }
  });
}

async function todoSaveEdit(id, textEl, newText, oldText) {
  if (!newText || newText === oldText) { textEl.textContent = oldText; return; }
  textEl.textContent = newText;
  const { error } = await db.from('todos').update({ text: newText }).eq('id', id);
  if (error) { textEl.textContent = oldText; showToast('Nepodařilo se uložit změnu.', 'error'); return; }
  const cached = getCache('todos');
  setCache('todos', cached.map(t => t.id === id ? { ...t, text: newText } : t));
}

async function todoDelete(id) {
  const { error } = await db.from('todos').delete().eq('id', id);
  if (error) { showToast('Nepodařilo se smazat úkol.', 'error'); return; }
  await refreshTodos();
}

/* ════ PŘÍPRAVA ═════════════════════════════════════════════ */
async function loadPriprava() {
  const todos = await fetchData('todos', 'created_at');
  const el = document.getElementById('priprava-content');
  el.innerHTML = pageHeader({
    num: 5, label: 'Příprava',
    h1: 'Co vyřídit před odletem', accentWord: 'před odletem',
    desc: 'Sdílený seznam úkolů pro nás oba',
  }) + `
  <div class="section-body">
    <div class="priprava-todo-wrap">
      <div class="dash-todo-title">K vyřízení</div>
      ${renderTodosHtml(todos)}
    </div>
  </div>
  ${tripFooter()}`;
}

/* ════ FLIGHTS ══════════════════════════════════════════════ */
async function loadFlights() {
  const data = await fetchData('flights', 'date');
  const el = document.getElementById('flights-content');
  el.innerHTML = pageHeader({
    num: 2, label: 'Cestování',
    h1: 'Z Prahy do Asie a zpátky',   accentWord: 'do Asie',
    desc: 'Přehled letů, přestupů a transferů',
    stats: [{ value: `${data.length}`, label: 'cest celkem' }],
    addSection: 'flights', addLabel: 'Přidat letenku / jízdenku',
  }) + `<div class="section-body">
    ${data.length
      ? `<div class="flights-list">${data.map(flightCard).join('')}</div>`
      : emptyState('ti-plane', 'Žádné letenky', 'Přidejte první letenku nebo transfer.')
    }
  </div>
  ${tripFooter()}`;
}

function flightCard(f) {
  const typeLabel = (f.country || 'Letadlo').toUpperCase();
  const photoMap = {
    'Letadlo': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&auto=format&fit=crop&q=80',
    'Vlak':    'https://images.unsplash.com/photo-1759270977492-233b68936939?w=400&auto=format&fit=crop&q=80',
    'Bus':     'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&auto=format&fit=crop&q=80',
    'Loď':     'https://images.unsplash.com/photo-1548032885-b5e38734688a?w=400&auto=format&fit=crop&q=80',
    'Taxi':    'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?w=400&auto=format&fit=crop&q=80',
  };
  const photo = photoMap[f.country] || photoMap['Letadlo'];
  const statusBadge = f.booking_ref
    ? `<span class="badge badge-booked">Rezervováno · ${esc(f.booking_ref)}</span>`
    : `<span class="badge badge-planned">Naplánováno</span>`;

  const arrDate = formatDateCZ(f.arrival_date || f.date);

  return `<div class="flight-card">
    <div class="flight-vis" style="background-image:url('${photo}')">
      <div class="flight-vis-overlay"></div>
      <div class="flight-vis-content">
        <div class="flight-vis-top">
          <span class="flight-vis-badge">${typeLabel}</span>
          ${f.duration ? `<span class="flight-vis-duration">${esc(f.duration)}</span>` : ''}
        </div>
        <div class="flight-vis-route">
          <span class="flight-vis-code">${esc(f.from_airport||'?')}</span>
          <span class="flight-vis-arrow">→</span>
          <span class="flight-vis-code">${esc(f.to_airport||'?')}</span>
        </div>
      </div>
    </div>
    <div class="flight-main">
      <div class="flight-times">
        <div class="flight-endpoint">
          <div class="flight-date">${formatDateCZ(f.date)}</div>
          <div class="flight-time">${f.departure_time ? f.departure_time.slice(0,5) : '—:—'}</div>
          <div class="flight-code">${esc(f.from_airport||'')}</div>
        </div>
        <div class="flight-route-center">
          ${countryBadge(f.country)}
          <div class="flight-route-line"><i class="ti ti-plane"></i></div>
          ${f.flight_number ? `<div class="flight-route-meta"><span>${esc(f.flight_number)}</span></div>` : ''}
        </div>
        <div class="flight-endpoint right">
          <div class="flight-date">${arrDate}</div>
          <div class="flight-time">${f.arrival_time ? f.arrival_time.slice(0,5) : '—:—'}</div>
          <div class="flight-code">${esc(f.to_airport||'')}</div>
        </div>
      </div>
      <div class="flight-main-footer">
        <div class="flight-status-group">${statusBadge}</div>
        ${f.notes ? `<div class="flight-footer-notes">${esc(f.notes)}</div>` : '<div></div>'}
        <div class="flight-action-btns">
          <button class="btn-icon delete" onclick="confirmDelete('flights','${f.id}')" title="Smazat"><i class="ti ti-trash"></i></button>
        </div>
      </div>
    </div>
    <button class="flight-edit-btn" onclick="openEditModal('flights','${f.id}')" title="Upravit">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    </button>
  </div>`;
}

/* ════ ACCOMMODATIONS ═══════════════════════════════════════ */
async function loadAccommodations() {
  const data = await fetchData('accommodations', 'checkin');
  const nights = data.reduce((s,a) => {
    if (!a.checkin||!a.checkout) return s;
    return s + Math.max(0, Math.ceil((new Date(a.checkout)-new Date(a.checkin))/86400000));
  }, 0);
  const totalCost = data.reduce((s,a) => s + parseFloat(a.price_czk||0), 0);

  const el = document.getElementById('accommodations-content');
  const nocForm = nights === 1 ? 'noc' : nights <= 4 ? 'noci' : 'nocí';
  el.innerHTML = pageHeader({
    num: 3, label: 'Ubytování',
    h1: nights > 0 ? `${nights} ${nocForm} na cestě` : 'Hotel, hostel, ryokan.',
    accentWord: nights > 0 ? `${nights}` : 'ryokan',
    desc: 'Seznam ubytování na naší cestě',
    stats: [
      { value: `${nights}`, label: 'nocí celkem' },
      { value: `${formatKc(totalCost)} Kč`, label: 'cena celkem' },
      { value: `${data.length}`, label: 'ubytování' },
    ],
    addSection: 'accommodations', addLabel: 'Přidat ubytování',
  }) + `<div class="section-body">
    ${data.length
      ? `<div class="cards-grid">${data.map(accommodationCard).join('')}</div>`
      : emptyState('ti-bed', 'Žádné ubytování', 'Přidejte první hotel nebo apartmán.')
    }
  </div>
  ${tripFooter()}`;
}

function accomNocLabel(n) {
  if (n === 1) return '1 noc';
  if (n <= 4) return `${n} noci`;
  return `${n} nocí`;
}

function accomHeroImg(a) {
  const text = `${a.name||''} ${a.address||''} ${a.notes||''}`.toLowerCase();
  if (/busan|pusan|haeundae|gamcheon/.test(text))   return 'assets/Busan-beach.jpg';
  if (/kyoto|kiyomizu|higashiyama|gion/.test(text)) return 'assets/Kyoto-zlaty-pavilon.jpg';
  if (/hiroshima|miyajima/.test(text))              return 'assets/Hiroshima-pamatnik.jpg';
  if (/tokyo|shibuya|asakusa|shinjuku|ueno/.test(text)) return 'assets/Tokyo-Shibuya.jpg';
  if (/nara/.test(text))                            return 'assets/Nara-Japonsko.jpg';
  if (/seoul|jongno|hongdae|myeongdong|itaewon/.test(text))
    return 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=400&auto=format&fit=crop&q=80';
  if (/gyeongju|bulguksa/.test(text))
    return 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&auto=format&fit=crop&q=80';
  if (/fukuoka|hakata/.test(text))
    return 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=400&auto=format&fit=crop&q=80';
  if (/hakone|onsen|ryokan/.test(text))
    return 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400&auto=format&fit=crop&q=80';
  if (/osaka|dotonbori/.test(text))
    return 'https://images.unsplash.com/photo-1588598207040-7ac3da45e571?w=400&auto=format&fit=crop&q=80';
  return a.country === 'Japonsko'
    ? 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=400&auto=format&fit=crop&q=80';
}

function shortDateNoYear(iso) {
  if (!iso) return '—';
  const CZ_DAYS = ['Ne','Po','Út','St','Čt','Pá','So'];
  const d = new Date(iso + 'T00:00:00');
  return `${CZ_DAYS[d.getDay()]} ${d.getDate()}.${d.getMonth()+1}.`;
}

function accommodationCard(a) {
  const nights = a.checkin && a.checkout
    ? Math.max(0, Math.ceil((new Date(a.checkout)-new Date(a.checkin))/86400000)) : null;
  const heroImg = accomHeroImg(a);
  const dateRange = a.checkin && a.checkout
    ? `${shortDateNoYear(a.checkin)} – ${shortDateNoYear(a.checkout)}` : null;
  return `<div class="hotel-card">
    <div class="hotel-hero">
      <img class="hotel-hero-img" src="${heroImg}" alt="${esc(a.name)}" loading="lazy">
      <div class="hotel-hero-overlay"></div>
      <div class="hotel-hero-info">
        ${nights ? `<span class="hotel-nights-badge">${accomNocLabel(nights)}</span>` : '<span></span>'}
        <div class="hotel-action-btns">
          <button class="btn-icon delete" onclick="confirmDelete('accommodations','${a.id}')" title="Smazat"><i class="ti ti-trash"></i></button>
        </div>
      </div>
    </div>
    <div class="hotel-body">
      <div class="hotel-name-row">
        <div class="hotel-name">${esc(a.name)}</div>
        ${a.address ? `<span class="hotel-address">${esc(a.address)}</span>` : ''}
      </div>
      <div class="hotel-meta">
        <div class="hotel-row hotel-row-date${dateRange ? '' : ' hotel-row-empty'}"><i class="ti ti-calendar"></i><span>${dateRange || '—'}</span></div>
        <div class="hotel-row${a.price_czk ? '' : ' hotel-row-empty'}"><i class="ti ti-receipt"></i><span>${a.price_czk ? formatKc(a.price_czk) + ' Kč' : '—'}</span></div>
        <div class="hotel-row${a.booking_url ? '' : ' hotel-row-empty'}"><i class="ti ti-link"></i>${a.booking_url ? `<a href="${esc(a.booking_url)}" target="_blank" rel="noopener">Odkaz na rezervaci</a>` : '<span>—</span>'}</div>
        <div class="hotel-row hotel-row-notes${a.notes ? '' : ' hotel-row-empty'}"><i class="ti ti-notes"></i><span>${a.notes ? esc(a.notes) : '—'}</span></div>
      </div>
      <div class="hotel-footer">
        ${countryBadge(a.country)}
      </div>
    </div>
    <button class="hotel-edit-btn" onclick="openEditModal('accommodations','${a.id}')" title="Upravit">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    </button>
  </div>`;
}

/* ════ ACTIVITIES ═══════════════════════════════════════════ */
async function loadActivities() {
  await fetchData('activities', 'date');
  renderActivitiesFromCache();
}

function activityEffectiveStatus(a) {
  if (a.status === 'hotovo') return 'hotovo';
  if (a.date) {
    const today = new Date(); today.setHours(0,0,0,0);
    if (new Date(a.date + 'T00:00:00') < today) return 'hotovo';
  }
  return a.status || 'naplánováno';
}

function renderActivitiesFromCache() {
  const raw = getCache('activities');

  const data = raw
    .map(a => ({ ...a, _status: activityEffectiveStatus(a) }))
    .sort((a, b) => {
      const d = (a.date||'').localeCompare(b.date||'');
      return d !== 0 ? d : (a.time||'').localeCompare(b.time||'');
    });

  const counts = { all: 0, naplánováno: 0, rezervováno: 0, hotovo: 0 };
  data.forEach(a => {
    if (counts[a._status] !== undefined) counts[a._status]++;
    if (a._status !== 'hotovo') counts.all++;
  });
  const filtered = activitiesFilter === 'all'
    ? data.filter(a => a._status !== 'hotovo')
    : data.filter(a => a._status === activitiesFilter);

  const header = pageHeader({
    num: 4, label: 'Místa',
    h1: 'Důvody vstávat brzo', accentWord: 'vstávat',
    desc: 'Chrámy, výlety, příroda. Vše co stojí za brzké vstávání.',
    stats: [{ value: `${data.length}`, label: 'zážitků' }],
    addSection: 'activities', addLabel: 'Přidat aktivitu',
  });

  const filterBar = `<div class="filter-bar" id="activities-filter">
    <button class="filter-btn ${activitiesFilter==='all'?'active':''}" data-filter="all">Harmonogram <span class="filter-count">${counts.all}</span></button>
    <button class="filter-btn ${activitiesFilter==='rezervováno'?'active':''}" data-filter="rezervováno">Rezervováno <span class="filter-count">${counts.rezervováno}</span></button>
    <button class="filter-btn ${activitiesFilter==='naplánováno'?'active':''}" data-filter="naplánováno">Naplánováno <span class="filter-count">${counts.naplánováno}</span></button>
    <button class="filter-btn ${activitiesFilter==='hotovo'?'active':''}" data-filter="hotovo">Hotovo <span class="filter-count">${counts.hotovo}</span></button>
  </div>`;

  document.getElementById('activities-content').innerHTML = header + filterBar + `<div class="section-body">
    ${filtered.length
      ? `<div class="activity-list">${filtered.map(activityCard).join('')}</div>`
      : emptyState('ti-map-pin', 'Žádné aktivity', 'Přidejte výlet nebo aktivitu.')
    }
  </div>
  ${tripFooter()}`;
}

function activityCard(a) {
  const status = a._status || a.status || 'naplánováno';
  const sMap = { 'naplánováno':['badge-planned','Naplánováno'], 'rezervováno':['badge-booked','Rezervováno'], 'hotovo':['badge-done','Hotovo'] };
  const [cls, label] = sMap[status] || ['badge-planned', status];
  const hasPrice = a.price !== null && a.price !== undefined && a.price !== '';
  return `<div class="activity-card${a.photo_url ? ' activity-card-photo' : ''}">
    <div class="activity-date-col">
      ${countryBadge(a.country)}
      ${a.date ? `<div class="activity-date">${shortDateNoYear(a.date)}</div>` : ''}
      ${a.time ? `<div class="activity-time">${a.time.slice(0,5)}</div>` : ''}
    </div>
    ${a.photo_url ? `<div class="activity-photo" style="background-image:url('${esc(a.photo_url)}')"></div>` : ''}
    <div class="activity-main">
      <div class="activity-name">
        ${a.url ? `<a href="${esc(a.url)}" target="_blank" rel="noopener" class="activity-name-link">${esc(a.name)}</a>` : esc(a.name)}
      </div>
      <div class="activity-detail${(a.location || a.map_url) ? '' : ' activity-detail-empty'}">
        ${a.location ? esc(a.location) : (a.map_url ? '' : '—')}
        ${a.map_url ? `<a href="${esc(a.map_url)}" target="_blank" rel="noopener" class="activity-map-icon" title="Otevřít mapu"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></a>` : ''}
      </div>
      <div class="activity-detail activity-detail-notes${a.notes ? '' : ' activity-detail-empty'}">${a.notes ? esc(a.notes) : '—'}</div>
      <div class="activity-detail${hasPrice ? '' : ' activity-detail-empty'}">
        ${hasPrice ? `Cena ${formatKc(a.price)} Kč` : '—'}
      </div>
    </div>
    <div class="activity-badges">
      <span class="badge ${cls}">${label}</span>
    </div>
    <button class="activity-edit-btn" onclick="openEditModal('activities','${a.id}')" title="Upravit">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    </button>
  </div>`;
}

/* ════ RESTAURANTS ══════════════════════════════════════════ */
async function loadRestaurants() {
  await fetchData('restaurants', 'created_at');
  renderRestaurantsFromCache();
}

function renderRestaurantsFromCache() {
  const data = getCache('restaurants');
  const cntKorea = data.filter(r => r.country==='Korea').length;
  const cntJapan = data.filter(r => r.country==='Japonsko').length;
  const filtered = restaurantsFilter==='all' ? data : data.filter(r => r.country===restaurantsFilter);

  const header = pageHeader({
    num: 5, label: 'Restaurace',
    h1: 'Sto chutí Asie.', accentWord: 'chutí',
    desc: 'Od pouličního pojang-macha v Seule po sushi omakase v Tokiu.',
    stats: [{ value: `${data.length}`, label: 'míst' }],
    addSection: 'restaurants', addLabel: 'Přidat restauraci',
  });

  const filterBar = `<div class="filter-bar" id="restaurants-filter">
    <button class="filter-btn ${restaurantsFilter==='all'?'active':''}" data-filter="all">Vše <span class="filter-count">${data.length}</span></button>
    <button class="filter-btn ${restaurantsFilter==='Korea'?'active':''}" data-filter="Korea">🇰🇷 Korea <span class="filter-count">${cntKorea}</span></button>
    <button class="filter-btn ${restaurantsFilter==='Japonsko'?'active':''}" data-filter="Japonsko">🇯🇵 Japonsko <span class="filter-count">${cntJapan}</span></button>
  </div>`;

  document.getElementById('restaurants-content').innerHTML = header + filterBar + `<div class="section-body">
    ${filtered.length
      ? `<div class="cards-grid">${filtered.map(restaurantCard).join('')}</div>`
      : emptyState('ti-utensils', 'Žádné restaurace', 'Přidejte restauraci nebo kavárnu.')
    }
  </div>
  ${tripFooter()}`;
}

function restaurantCard(r) {
  const priceMap = { '$':'#2A7A3A', '$$':'#8A6200', '$$$':'#C73A1A', '$$$$':'#6B1A8A' };
  return `<div class="card">
    <div class="card-header">
      <div class="card-title">${esc(r.name)}</div>
      <div class="card-actions">${actionBtns('restaurants', r.id)}</div>
    </div>
    <div class="card-body">
      ${r.address ? cardRow('ti-map-pin', esc(r.address)) : ''}
      ${r.cuisine_type ? cardRow('ti-chef-hat', esc(r.cuisine_type)) : ''}
      ${r.price_range ? cardRow('ti-coins', `<span style="font-weight:700;color:${priceMap[r.price_range]||'inherit'}">${r.price_range}</span>`) : ''}
      ${r.url ? cardRow('ti-link', `<a href="${esc(r.url)}" target="_blank" rel="noopener">Recenze / mapa</a>`) : ''}
      ${r.notes ? cardRow('ti-notes', esc(r.notes)) : ''}
    </div>
    <div class="card-footer">${countryBadge(r.country)}</div>
  </div>`;
}

/* ════ TRANSPORT ════════════════════════════════════════════ */
async function loadTransport() {
  const data = await fetchData('transport', 'date');

  const el = document.getElementById('transport-content');
  el.innerHTML = pageHeader({
    num: 6, label: 'Jízdní řády',
    h1: 'Vlakem, lodí, shinkansenem.', accentWord: 'lodí',
    desc: 'Vlaky, autobusy, trajekty — doprava na místě.',
    stats: [
      { value: `${data.length}`, label: 'spojů' },
      { value: `${formatKc(data.reduce((s,t)=>s+parseFloat(t.price||0),0))} Kč`, label: 'cena dopravy' },
    ],
    addSection: 'transport', addLabel: 'Přidat spoj',
  }) + `<div class="section-body">
    ${data.length ? `
    <div class="transport-table-wrap">
      <table class="transport-table">
        <thead>
          <tr>
            <th>Datum</th>
            <th>Typ</th>
            <th>Čas</th>
            <th>Odkud</th>
            <th></th>
            <th>Kam</th>
            <th>Cena</th>
            <th>Poznámky</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${data.map(transportRow).join('')}</tbody>
      </table>
    </div>` : emptyState('ti-train', 'Žádné spoje', 'Přidejte vlak, metro nebo autobus.')
    }
  </div>
  ${tripFooter()}`;
}

function transportRow(t) {
  return `<tr class="transport-row">
    <td class="transport-date">${t.date ? formatDateCZ(t.date) : '—'}</td>
    <td><span class="transport-type-badge">${esc(t.ticket_type||'—')}</span></td>
    <td class="transport-time">${t.time ? t.time.slice(0,5) : '—:—'}</td>
    <td class="transport-route">${esc(t.route_from||'')}</td>
    <td><i class="ti ti-arrow-right transport-arrow"></i></td>
    <td class="transport-route">${esc(t.route_to||'')}</td>
    <td class="transport-price">${t.price ? formatKc(t.price)+' Kč' : '—'}</td>
    <td class="transport-date">${t.notes ? esc(t.notes) : ''}</td>
    <td class="transport-actions">${actionBtns('transport', t.id)}</td>
  </tr>`;
}

/* ════ BUDGET ═══════════════════════════════════════════════ */
async function loadBudget() {
  const data = await fetchData('expenses', 'date');
  renderBudget(data);
}

function renderBudget(expenses) {
  const total  = CONFIG.TOTAL_BUDGET_CZK || 0;
  const spent  = expenses.reduce((s,e) => s + parseFloat(e.amount_czk||0), 0);
  const remain = total - spent;
  const pct    = total ? Math.min(100, Math.round((spent/total)*100)) : 0;

  const r = 35; const circ = +(2 * Math.PI * r).toFixed(1);
  const dashOffset = +(circ - (pct/100)*circ).toFixed(1);
  const donutSvg = `<div class="donut-container">
    <svg class="donut-svg" viewBox="0 0 100 100">
      <circle class="donut-track" cx="50" cy="50" r="${r}"/>
      <circle class="donut-fill" cx="50" cy="50" r="${r}"
              stroke-dasharray="${circ}" stroke-dashoffset="${dashOffset}"/>
    </svg>
    <div class="donut-center">
      <span class="donut-pct">${pct}%</span>
      <span class="donut-lbl">utraceno</span>
    </div>
  </div>`;

  const cats = ['Letenky','Ubytování','Aktivity','Jídlo','Doprava','Ostatní'];
  const catTotals = {}; cats.forEach(c => { catTotals[c] = 0; });
  expenses.forEach(e => { if (catTotals[e.category] !== undefined) catTotals[e.category] += parseFloat(e.amount_czk||0); });

  const catRows = cats.map(cat => {
    const amt = catTotals[cat];
    const catPct = spent ? Math.round((amt/spent)*100) : 0;
    return `<div class="cat-row">
      <div class="cat-label">
        <div class="cat-label-dot" style="background:${CAT_COLORS[cat]}"></div>
        <span>${cat}</span>
      </div>
      <div class="cat-bar-wrap"><div class="cat-bar-fill" style="width:${catPct}%;background:${CAT_COLORS[cat]}"></div></div>
      <div class="cat-amount">${formatKc(amt)} Kč</div>
    </div>`;
  }).join('');

  const legendHtml = cats.map(cat => `
    <div class="budget-legend-item">
      <div class="budget-legend-dot" style="background:${CAT_COLORS[cat]}"></div>
      <span class="budget-legend-name">${cat}</span>
      <span class="budget-legend-nums">${formatKc(catTotals[cat])} Kč</span>
    </div>`).join('');

  const expItems = [...expenses].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(e => `
    <div class="expense-item">
      <div class="transport-date" style="font-size:11px">${e.date ? new Date(e.date+'T00:00:00').toLocaleDateString('cs-CZ',{day:'numeric',month:'numeric'}) : '—'}</div>
      <div class="expense-info">
        <div class="expense-desc">${esc(e.description||e.category)}</div>
        <div class="expense-meta">${e.category}</div>
      </div>
      <div class="expense-amount">${formatKc(e.amount_czk)} Kč</div>
      <div class="expense-actions">
        <button class="btn-icon edit"   onclick="openEditModal('expenses','${e.id}')" title="Upravit"><i class="ti ti-pencil"></i></button>
        <button class="btn-icon delete" onclick="confirmDelete('expenses','${e.id}')" title="Smazat"><i class="ti ti-trash"></i></button>
      </div>
    </div>`).join('');

  const budgetHeadline = budgetWords(total);
  const el = document.getElementById('budget-content');
  el.innerHTML = pageHeader({
    num: 7, label: 'Rozpočet',
    h1: budgetHeadline.text, accentWord: budgetHeadline.accent,
    desc: `Celkem ${formatKc(total)} Kč na ${Math.ceil((new Date(CONFIG.RETURN_DATE)-new Date(CONFIG.DEPARTURE_DATE))/86400000)} dní.`,
    stats: [
      { value: `${formatKc(total)} Kč`, label: 'celkový rozpočet' },
      { value: `${formatKc(spent)} Kč`, label: 'utraceno' },
      { value: `${formatKc(Math.abs(remain))} Kč`, label: remain >= 0 ? 'zbývá' : 'překročeno' },
    ],
    addSection: 'expenses', addLabel: 'Přidat výdaj',
  }) + `
  <div class="budget-hero">
    <div class="budget-hero-col">
      <div class="budget-spent-label">Utraceno</div>
      <div class="budget-spent-big">${formatKc(spent)} <span class="budget-spent-currency">Kč</span></div>
      <div class="budget-spent-sub">ze stropu ${formatKc(total)} Kč</div>
      <div class="budget-progress-wrap">
        <div class="budget-progress-bar">
          <div class="budget-progress-fill" style="width:${pct}%"></div>
        </div>
        <div class="budget-progress-label">${pct}% · zbývá ${formatKc(remain)} Kč</div>
      </div>
    </div>
    <div class="budget-hero-col" style="display:flex;align-items:center;justify-content:center">
      ${donutSvg}
    </div>
    <div class="budget-hero-col">
      <div class="budget-lower-title">Přehled kategorií</div>
      <div class="budget-legend">${legendHtml}</div>
    </div>
  </div>

  <div class="budget-lower">
    <div class="budget-lower-col">
      <div class="budget-lower-title">Výdaje podle kategorií</div>
      ${catRows}
    </div>
    <div class="budget-lower-col">
      <div class="budget-lower-title">Poslední výdaje</div>
      <div class="expenses-list">
        ${expenses.length ? expItems : `<div class="empty-state" style="padding:30px 0"><p>Žádné výdaje.</p></div>`}
      </div>
    </div>
  </div>
  ${tripFooter()}`;
}

function budgetWords(amount) {
  const map = [
    { min:200000, text:'Dvě stě tisíc.',       accent:'stě' },
    { min:150000, text:'Sto padesát tisíc.',   accent:'padesát' },
    { min:125000, text:'Sto dvacet pět tisíc.', accent:'tisíc' },
    { min:100000, text:'Sto tisíc.',           accent:'tisíc' },
    { min:75000,  text:'Sedmdesát pět tisíc.', accent:'pět' },
    { min:50000,  text:'Padesát tisíc.',       accent:'tisíc' },
    { min:0,      text:`${formatKc(amount)} Kč.`, accent:'Kč' },
  ];
  return map.find(m => amount >= m.min) || map[map.length-1];
}

/* ════ MODAL ════════════════════════════════════════════════ */
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
  editingId = null; editingSection = section;
  document.getElementById('modal-title').textContent = `Přidat — ${SECTION_TITLES[section]||section}`;
  document.getElementById('modal-body').innerHTML = buildForm(section, {});
  document.getElementById('modal-overlay').style.display = 'flex';
}

function openEditModal(section, id) {
  if (!isOnline) { showToast('Úpravy dostupné jen online.', 'error'); return; }
  editingId = id; editingSection = section;
  const item = getCache(sectionToTable(section)).find(r => r.id === id) || {};
  document.getElementById('modal-title').textContent = `Upravit — ${SECTION_TITLES[section]||section}`;
  document.getElementById('modal-body').innerHTML = buildForm(section, item);
  document.getElementById('modal-overlay').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  editingId = null; editingSection = null;
}

async function saveModalForm() {
  if (!editingSection) return;
  const form = document.getElementById('modal-body').querySelector('.modal-form');
  if (!form) return;
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  const data = collectForm(form);
  if (!validateForm(form)) return;

  const table = sectionToTable(editingSection);
  const btn = document.getElementById('modal-save-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader-2" style="animation:spin .8s linear infinite"></i> Ukládám…';

  let ok = false;
  if (editingId) {
    const { error } = await db.from(table).update(data).eq('id', editingId);
    ok = !error;
  } else {
    const { error } = await db.from(table).insert(data);
    ok = !error;
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="ti ti-check"></i> Uložit';

  if (ok) {
    showToast(editingId ? 'Záznam upraven.' : 'Záznam přidán.', 'success');
    const sec = editingSection;
    closeModal();
    loadSection(sec === 'expenses' ? 'budget' : sec);
  } else {
    showToast('Chyba při ukládání. Zkuste to znovu.', 'error');
  }
}

function collectForm(form) {
  const data = {};
  form.querySelectorAll('[name]').forEach(el => {
    const v = el.value.trim();
    data[el.name] = v === '' ? null : v;
  });
  return data;
}
function validateForm(form) {
  let ok = true;
  form.querySelectorAll('[required]').forEach(el => {
    if (!el.value.trim()) { el.classList.add('error'); ok = false; }
  });
  return ok;
}
function sectionToTable(section) {
  return { expenses:'expenses', flights:'flights', accommodations:'accommodations',
           activities:'activities', restaurants:'restaurants', transport:'transport' }[section] || section;
}

/* ════ CONFIRM DELETE ═══════════════════════════════════════ */
function confirmDelete(section, id) {
  if (!isOnline) { showToast('Mazání dostupné jen online.', 'error'); return; }
  pendingDelete = { section, id };
  document.getElementById('confirm-overlay').style.display = 'flex';
  document.getElementById('confirm-ok-btn').onclick = executeDelete;
}
async function executeDelete() {
  if (!pendingDelete) return;
  const { section, id } = pendingDelete;
  const { error } = await db.from(sectionToTable(section)).delete().eq('id', id);
  closeConfirm();
  if (!error) { showToast('Záznam smazán.', 'success'); loadSection(section==='expenses'?'budget':section); }
  else         { showToast('Chyba při mazání.', 'error'); }
}
function closeConfirm() {
  document.getElementById('confirm-overlay').style.display = 'none';
  pendingDelete = null;
}

/* ════ FORM BUILDERS ════════════════════════════════════════ */
function buildForm(section, d) {
  const forms = { flights:flightsForm, accommodations:accommodationsForm, activities:activitiesForm,
                  restaurants:restaurantsForm, transport:transportForm, expenses:expensesForm };
  return forms[section] ? forms[section](d) : '<p>Neznámá sekce.</p>';
}

const countryOpts = (val='', includeTransfer=true) => `
  <option value="Korea"    ${val==='Korea'    ?'selected':''}>🇰🇷 Korea</option>
  <option value="Japonsko" ${val==='Japonsko' ?'selected':''}>🇯🇵 Japonsko</option>
  <option value="Praha"    ${val==='Praha'    ?'selected':''}>🇨🇿 Praha</option>
  ${includeTransfer ? `<option value="Transfer" ${val==='Transfer'?'selected':''}>🔄 Transfer</option>` : ''}`;

/* ════ CALENDAR ═════════════════════════════════════════════ */
async function loadCalendar() {
  const el = document.getElementById('calendar-content');
  el.innerHTML = pageHeader({
    num: 8, label: 'Kalendář',
    h1: 'Co se kdy děje.',
    accentWord: 'kdy',
    desc: 'Kliknutím na den zobrazíte vše naplánované',
    stats: [],
  }) + `<div class="section-body"><div id="cal-root" class="cal-root"></div></div>
  ${tripFooter()}`;

  const [flights, accs, acts, trans] = await Promise.all([
    fetchData('flights','date'),
    fetchData('accommodations','checkin'),
    fetchData('activities','date'),
    fetchData('transport','date'),
  ]);

  calEventMap = buildCalEventMap(flights, accs, acts, trans);
  calSelectedDay = null;
  renderCalendarMonth();
}

function buildCalEventMap(flights, accs, acts, trans) {
  const map = {};
  const add = (dateStr, type, label, icon, sub) => {
    if (!dateStr) return;
    const key = dateStr.slice(0,10);
    if (!map[key]) map[key] = [];
    map[key].push({type, label, icon, sub});
  };

  flights.forEach(f => add(f.date, 'flight',
    `${esc(f.from_airport||'?')} → ${esc(f.to_airport||'?')}`, 'ti-plane',
    f.departure_time ? f.departure_time.slice(0,5) : null));

  accs.forEach(a => {
    if (!a.checkin || !a.checkout) return;
    let d = new Date(a.checkin + 'T00:00:00');
    const end = new Date(a.checkout + 'T00:00:00');
    while (d < end) {
      const key = d.toISOString().slice(0,10);
      const sub = key === a.checkin ? 'Check-in' : (key === new Date(new Date(a.checkout).getTime()-86400000).toISOString().slice(0,10) ? 'Check-out' : null);
      add(key, 'accommodation', esc(a.name), 'ti-bed', sub);
      d.setDate(d.getDate()+1);
    }
  });

  acts.forEach(a => add(a.date, 'activity', esc(a.name), 'ti-map-pin',
    a.time ? a.time.slice(0,5) : null));

  trans.forEach(t => add(t.date, 'transport',
    `${esc(t.route_from||'?')} → ${esc(t.route_to||'?')}`, 'ti-train',
    t.time ? t.time.slice(0,5) : null));

  return map;
}

function renderCalendarMonth() {
  const root = document.getElementById('cal-root');
  if (!root) return;

  const MONTHS = ['Leden','Únor','Březen','Duben','Květen','Červen',
                   'Červenec','Srpen','Září','Říjen','Listopad','Prosinec'];
  const DAYS = ['Po','Út','St','Čt','Pá','So','Ne'];

  const firstDay = new Date(calYear, calMonth, 1);
  const lastDay  = new Date(calYear, calMonth + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7;

  let cells = '';
  for (let i = 0; i < startDow; i++) cells += `<div class="cal-day other-month"></div>`;

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const events  = calEventMap[dateStr] || [];
    const inTrip  = dateStr >= '2026-09-04' && dateStr <= '2026-09-27';
    const isSel   = dateStr === calSelectedDay;
    const types   = [...new Set(events.map(e => e.type))];
    const dots    = types.map(t => `<span class="cal-dot cal-dot-${t}"></span>`).join('');
    cells += `<div class="cal-day${inTrip?' in-trip':''}${isSel?' selected':''}${events.length?' has-events':''}"
      onclick="calSelectDay('${dateStr}')">
      <span class="cal-day-num">${d}</span>
      ${dots ? `<div class="cal-dots">${dots}</div>` : ''}
    </div>`;
  }

  let detail = '';
  if (calSelectedDay) {
    const events = calEventMap[calSelectedDay] || [];
    const d = new Date(calSelectedDay + 'T00:00:00');
    const dayLabel = `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    const TYPE_LABELS = { flight:'Cestování', accommodation:'Ubytování', activity:'Výlet', transport:'Doprava' };
    if (events.length) {
      const items = events.map(e => `
        <div class="cal-event-item cal-event-${e.type}">
          <div class="cal-event-icon"><i class="ti ${e.icon}"></i></div>
          <div class="cal-event-body">
            <div class="cal-event-type">${TYPE_LABELS[e.type]||e.type}</div>
            <div class="cal-event-label">${e.label}</div>
            ${e.sub ? `<div class="cal-event-sub">${e.sub}</div>` : ''}
          </div>
        </div>`).join('');
      detail = `<div class="cal-detail"><div class="cal-detail-date">${dayLabel}</div><div class="cal-detail-events">${items}</div></div>`;
    } else {
      detail = `<div class="cal-detail"><div class="cal-detail-date">${dayLabel}</div><div class="cal-detail-empty">Žádné naplánované události</div></div>`;
    }
  }

  root.innerHTML = `
    <div class="cal-month-title">${MONTHS[calMonth]} ${calYear}</div>
    <div class="cal-weekdays">${DAYS.map(d=>`<div class="cal-weekday">${d}</div>`).join('')}</div>
    <div class="cal-grid">${cells}</div>
    ${detail}`;
}

function calSelectDay(dateStr) {
  calSelectedDay = calSelectedDay === dateStr ? null : dateStr;
  renderCalendarMonth();
}

function flightsForm(d) { return `<form class="modal-form">
  <div class="form-row-3">
    <div class="form-group"><label>Číslo spoje</label><input name="flight_number" value="${esc(d.flight_number||'')}" placeholder="KE902"></div>
    <div class="form-group"><label>Booking reference</label><input name="booking_ref" value="${esc(d.booking_ref||'')}" placeholder="XABCDE"></div>
    <div class="form-group"><label>Typ</label><select name="country">
      <option value="Letadlo" ${(d.country||'Letadlo')==='Letadlo'?'selected':''}>Letadlo</option>
      <option value="Vlak"    ${d.country==='Vlak'   ?'selected':''}>Vlak</option>
      <option value="Bus"     ${d.country==='Bus'    ?'selected':''}>Bus</option>
      <option value="Loď"     ${d.country==='Loď'   ?'selected':''}>Loď</option>
      <option value="Taxi"    ${d.country==='Taxi'   ?'selected':''}>Taxi</option>
    </select></div>
  </div>
  <div class="form-row-3">
    <div class="form-group"><label>Datum odjezdu <span class="form-required">*</span></label><input type="date" name="date" value="${d.date||TRIP_DEFAULT_DATE}" required></div>
    <div class="form-group"><label>Čas odjezdu</label><input type="time" name="departure_time" value="${d.departure_time||''}"></div>
    <div class="form-group"><label>Odkud <span class="form-required">*</span></label><input name="from_airport" value="${esc(d.from_airport||'')}" placeholder="PRG" required></div>
  </div>
  <div class="form-row-3">
    <div class="form-group"><label>Datum příjezdu</label><input type="date" name="arrival_date" value="${d.arrival_date||TRIP_DEFAULT_DATE}"></div>
    <div class="form-group"><label>Čas příjezdu</label><input type="time" name="arrival_time" value="${d.arrival_time||''}"></div>
    <div class="form-group"><label>Kam <span class="form-required">*</span></label><input name="to_airport" value="${esc(d.to_airport||'')}" placeholder="ICN" required></div>
  </div>
  <div class="form-row-3">
    <div class="form-group"><label>Doba cesty</label><input name="duration" value="${esc(d.duration||'')}" placeholder="14h 30m"></div>
    <div class="form-group form-span-2"><label>Poznámky</label><input name="notes" value="${esc(d.notes||'')}"></div>
  </div>
</form>`; }

function accommodationsForm(d) { return `<form class="modal-form">
  <div class="form-group"><label>Město <span class="form-required">*</span></label><input name="name" value="${esc(d.name||'')}" placeholder="Seoul" required></div>
  <div class="form-group"><label>Adresa / název hotelu</label><input name="address" value="${esc(d.address||'')}"></div>
  <div class="form-row">
    <div class="form-group"><label>Check-in <span class="form-required">*</span></label><input type="date" name="checkin" value="${d.checkin||TRIP_DEFAULT_DATE}" required></div>
    <div class="form-group"><label>Check-out <span class="form-required">*</span></label><input type="date" name="checkout" value="${d.checkout||TRIP_DEFAULT_DATE}" required></div>
  </div>
  <div class="form-row">
    <div class="form-group"><label>Cena (Kč)</label><input type="number" name="price_czk" value="${d.price_czk||''}" min="0"></div>
    <div class="form-group"><label>Země</label><select name="country">${countryOpts(d.country, false)}</select></div>
  </div>
  <div class="form-group"><label>Odkaz na booking</label><input type="url" name="booking_url" value="${esc(d.booking_url||'')}"></div>
  <div class="form-group"><label>Poznámky</label><textarea name="notes">${esc(d.notes||'')}</textarea></div>
</form>`; }

function activitiesForm(d) {
  const statuses = ['naplánováno','rezervováno'];
  const sOpts = statuses.map(s => `<option value="${s}" ${d.status===s?'selected':''}>${s}</option>`).join('');
  return `<form class="modal-form">
  <div class="form-group"><label>Název <span class="form-required">*</span></label><input name="name" value="${esc(d.name||'')}" required></div>
  <div class="form-row">
    <div class="form-group"><label>Datum</label><input type="date" name="date" value="${d.date||TRIP_DEFAULT_DATE}"></div>
    <div class="form-group"><label>Čas</label><input type="time" name="time" value="${d.time||''}"></div>
  </div>
  <div class="form-group"><label>Místo</label><input name="location" value="${esc(d.location||'')}"></div>
  <div class="form-row">
    <div class="form-group"><label>Cena (Kč)</label><input type="number" name="price" value="${d.price != null ? d.price : ''}" min="0"></div>
    <div class="form-group"><label>Status</label><select name="status">${sOpts}</select></div>
  </div>
  <div class="form-row">
    <div class="form-group"><label>Země</label><select name="country">${countryOpts(d.country, false)}</select></div>
    <div class="form-group"><label>Odkaz</label><input type="url" name="url" value="${esc(d.url||'')}"></div>
  </div>
  <div class="form-row">
    <div class="form-group"><label>Odkaz na mapu</label><input type="url" name="map_url" value="${esc(d.map_url||'')}" placeholder="https://maps.google.com/..."></div>
    <div class="form-group"><label>Foto (URL)</label><input type="url" name="photo_url" value="${esc(d.photo_url||'')}" placeholder="https://..."></div>
  </div>
  <div class="form-group"><label>Poznámky</label><textarea name="notes">${esc(d.notes||'')}</textarea></div>
</form>`; }

function restaurantsForm(d) {
  const rOpts = ['$','$$','$$$','$$$$'].map(r => `<option value="${r}" ${d.price_range===r?'selected':''}>${r}</option>`).join('');
  return `<form class="modal-form">
  <div class="form-group"><label>Název <span class="form-required">*</span></label><input name="name" value="${esc(d.name||'')}" required></div>
  <div class="form-group"><label>Adresa</label><input name="address" value="${esc(d.address||'')}"></div>
  <div class="form-row">
    <div class="form-group"><label>Typ kuchyně</label><input name="cuisine_type" value="${esc(d.cuisine_type||'')}"></div>
    <div class="form-group"><label>Cenová hladina</label><select name="price_range">${rOpts}</select></div>
  </div>
  <div class="form-row">
    <div class="form-group"><label>Země</label><select name="country">${countryOpts(d.country, false)}</select></div>
    <div class="form-group"><label>Odkaz</label><input type="url" name="url" value="${esc(d.url||'')}"></div>
  </div>
  <div class="form-group"><label>Poznámky</label><textarea name="notes">${esc(d.notes||'')}</textarea></div>
</form>`; }

function transportForm(d) {
  const types = ['Shinkansen','KTX','Metro','Bus','Taxi','Trajekt','Jiné'];
  const tOpts = types.map(t => `<option value="${t}" ${d.ticket_type===t?'selected':''}>${t}</option>`).join('');
  return `<form class="modal-form">
  <div class="form-row">
    <div class="form-group"><label>Odkud <span class="form-required">*</span></label><input name="route_from" value="${esc(d.route_from||'')}" placeholder="Osaka" required></div>
    <div class="form-group"><label>Kam <span class="form-required">*</span></label><input name="route_to" value="${esc(d.route_to||'')}" placeholder="Kyoto" required></div>
  </div>
  <div class="form-row">
    <div class="form-group"><label>Datum</label><input type="date" name="date" value="${d.date||TRIP_DEFAULT_DATE}"></div>
    <div class="form-group"><label>Čas odjezdu</label><input type="time" name="time" value="${d.time||''}"></div>
  </div>
  <div class="form-row">
    <div class="form-group"><label>Typ</label><select name="ticket_type">${tOpts}</select></div>
    <div class="form-group"><label>Cena (Kč)</label><input type="number" name="price" value="${d.price||''}" min="0"></div>
  </div>
  <div class="form-group"><label>Země</label><select name="country">${countryOpts(d.country)}</select></div>
  <div class="form-group"><label>Poznámky</label><textarea name="notes">${esc(d.notes||'')}</textarea></div>
</form>`; }

function expensesForm(d) {
  const cats = ['Letenky','Ubytování','Aktivity','Jídlo','Doprava','Ostatní'];
  const cOpts = cats.map(c => `<option value="${c}" ${d.category===c?'selected':''}>${CAT_ICONS[c]} ${c}</option>`).join('');
  return `<form class="modal-form">
  <div class="form-group"><label>Kategorie <span class="form-required">*</span></label><select name="category" required>${cOpts}</select></div>
  <div class="form-row">
    <div class="form-group"><label>Částka (Kč) <span class="form-required">*</span></label><input type="number" name="amount_czk" value="${d.amount_czk||''}" min="0" step="1" required></div>
    <div class="form-group"><label>Datum <span class="form-required">*</span></label><input type="date" name="date" value="${d.date||todayISO()}" required></div>
  </div>
  <div class="form-group"><label>Popis</label><input name="description" value="${esc(d.description||'')}"></div>
</form>`; }

/* ════ PHOTO LIGHTBOX ═══════════════════════════════════════ */
let _lbIdx = 0;

function openPhotoModal(idx) {
  _lbIdx = idx;
  let lb = document.getElementById('photo-lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'photo-lightbox';
    lb.className = 'photo-lightbox';
    lb.innerHTML = `
      <div class="photo-lightbox-overlay" onclick="closePhotoModal()"></div>
      <div class="photo-lightbox-inner">
        <button class="photo-lightbox-close" onclick="closePhotoModal()">✕</button>
        <div class="photo-lb-stage">
          <button class="photo-lb-prev" onclick="lbNav(-1)">&#8249;</button>
          <img class="photo-lightbox-img" id="photo-lb-img" src="" alt="">
          <button class="photo-lb-next" onclick="lbNav(1)">&#8250;</button>
        </div>
        <div class="photo-lightbox-caption" id="photo-lb-caption"></div>
      </div>`;
    document.body.appendChild(lb);
    document.addEventListener('keydown', _lbKeyHandler);
  }
  _lbRender();
  lb.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function lbNav(dir) {
  _lbIdx = (_lbIdx + dir + TRIP_PHOTOS.length) % TRIP_PHOTOS.length;
  _lbRender();
}

function _lbKeyHandler(e) {
  const lb = document.getElementById('photo-lightbox');
  if (!lb || lb.style.display === 'none') return;
  if (e.key === 'Escape')     closePhotoModal();
  if (e.key === 'ArrowLeft')  lbNav(-1);
  if (e.key === 'ArrowRight') lbNav(1);
}

function _lbRender() {
  const p = TRIP_PHOTOS[_lbIdx];
  const src = p.src
    ? p.src
    : `https://images.unsplash.com/photo-${p.id}?w=1400&auto=format&fit=crop&q=80`;
  const largeSrc = src.includes('unsplash.com') ? src.replace('w=400', 'w=1400') : src;
  const img = document.getElementById('photo-lb-img');
  img.style.opacity = '0';
  img.src = largeSrc;
  img.onload = () => { img.style.opacity = '1'; };
  document.getElementById('photo-lb-caption').textContent = p.caption;
  const lb = document.getElementById('photo-lightbox');
  lb.querySelector('.photo-lb-prev').style.opacity = _lbIdx === 0 ? '0.25' : '1';
  lb.querySelector('.photo-lb-next').style.opacity = _lbIdx === TRIP_PHOTOS.length - 1 ? '0.25' : '1';
}

function closePhotoModal() {
  const lb = document.getElementById('photo-lightbox');
  if (lb) lb.style.display = 'none';
  document.body.style.overflow = '';
}

/* ════ TOAST ════════════════════════════════════════════════ */
function showToast(msg, type='info') {
  const icons = { success:'ti-check', error:'ti-alert-circle', info:'ti-info-circle' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="ti ${icons[type]||'ti-info-circle'}"></i> ${msg}`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/* ════ UTILS ════════════════════════════════════════════════ */
function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
function formatDateCZ(iso) {
  if (!iso) return '—';
  const d = new Date(iso+'T00:00:00');
  return `${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()}`;
}
function formatKc(n) { return (parseFloat(n)||0).toLocaleString('cs-CZ',{maximumFractionDigits:0}); }
function todayISO()  { return new Date().toISOString().slice(0,10); }

function countryBadge(country) {
  const map = { 'Korea':['badge-korea','KOREA'], 'Japonsko':['badge-japan','JAPONSKO'],
                'Praha':['badge-transfer','PRAHA'], 'Transfer':['badge-transfer','TRANSFER'],
                'Obě':['badge-both','OBĚ'] };
  const [cls, label] = map[country] || ['badge-both', country||''];
  return label ? `<span class="badge ${cls}">${label}</span>` : '';
}
function cardRow(icon, content) {
  return `<div class="card-row"><i class="ti ${icon}"></i><span>${content}</span></div>`;
}
function actionBtns(section, id) {
  return `<button class="btn-icon edit"   onclick="openEditModal('${section}','${id}')" title="Upravit"><i class="ti ti-pencil"></i></button>
          <button class="btn-icon delete" onclick="confirmDelete('${section}','${id}')" title="Smazat"><i class="ti ti-trash"></i></button>`;
}
function emptyState(icon, title, sub) {
  return `<div class="empty-state"><i class="ti ${icon}"></i><h3>${title}</h3><p>${sub}</p></div>`;
}

function tripFooter() {
  return `<div class="dash-footer">
    <span>★</span>
    <span>Seoul 4n</span><span>·</span>
    <span>Gyeongju 1n</span><span>·</span>
    <span>Busan 4n</span><span>·</span>
    <span>Hiroshima 2n</span><span>·</span>
    <span>Kyoto 4n</span><span>·</span>
    <span>Tokyo 6n</span>
  </div>`;
}

const _s = document.createElement('style');
_s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
document.head.appendChild(_s);
