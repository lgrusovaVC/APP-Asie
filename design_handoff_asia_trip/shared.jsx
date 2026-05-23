// Shared data + a small stylised Korea+Japan map used by all three variants.
// The map is intentionally abstract — blob-shapes for landmasses, dots for
// cities, dashed lines for the route. Treat it as a travel-journal sketch
// rather than a literal cartographic map.

const TRIP = {
  start: '4. 9. 2026',
  end:   '27. 9. 2026',
  days:  23,
  daysToGo: 105,
  cities: [
    { id: 'icn', name: 'Seoul',     country: 'KR', x: 108, y: 200, nights: 5, lblDx:  10, lblDy:  -8, anchor: 'start'  },
    { id: 'pus', name: 'Busan',     country: 'KR', x: 126, y: 250, nights: 3, lblDx:  10, lblDy:   8, anchor: 'start'  },
    { id: 'fuk', name: 'Fukuoka',   country: 'JP', x: 215, y: 270, nights: 1, lblDx:   0, lblDy:  22, anchor: 'middle' },
    { id: 'hir', name: 'Hiroshima', country: 'JP', x: 280, y: 240, nights: 1, lblDx:   0, lblDy: -14, anchor: 'middle' },
    { id: 'kyo', name: 'Kyoto',     country: 'JP', x: 320, y: 220, nights: 4, lblDx:   0, lblDy: -14, anchor: 'middle' },
    { id: 'tyo', name: 'Tokyo',     country: 'JP', x: 360, y: 188, nights: 8, lblDx:  12, lblDy:  -8, anchor: 'start'  },
  ],
};

const ITINERARY = [
  { d1: 'Pá 4. 9.',  d2: 'Po 7. 9.',   nights: 3, city: 'Soul',     country: 'Korea',   tag: 'Příjezd · Jongno',     note: 'Bukchon, Gwangjang, jet-lag walks' },
  { d1: 'Po 7. 9.',  d2: 'Čt 10. 9.',  nights: 3, city: 'Soul',     country: 'Korea',   tag: 'DMZ · Hongdae',       note: 'Výlet do DMZ, palácové muzeum' },
  { d1: 'Čt 10. 9.', d2: 'Ne 13. 9.',  nights: 3, city: 'Busan',    country: 'Korea',   tag: 'Pobřeží',              note: 'Gamcheon, Haeundae, tržnice Jagalchi' },
  { d1: 'Ne 13. 9.', d2: 'Po 14. 9.',  nights: 1, city: 'Fukuoka',  country: 'Japonsko', tag: 'Trajekt',              note: 'Beetle z Busanu, ramen yatai' },
  { d1: 'Po 14. 9.', d2: 'Pá 18. 9.',  nights: 4, city: 'Kjóto',    country: 'Japonsko', tag: 'Chrámy · Higashiyama', note: 'Fushimi Inari za úsvitu, bambusový les' },
  { d1: 'Pá 18. 9.', d2: 'Ne 20. 9.',  nights: 2, city: 'Hakone',   country: 'Japonsko', tag: 'Onsen',                note: 'Ryokan s výhledem na Fudži' },
  { d1: 'Ne 20. 9.', d2: 'Ne 27. 9.',  nights: 7, city: 'Tokio',    country: 'Japonsko', tag: 'Finále',               note: 'Shibuya, teamLab, Nikkō daytrip' },
];

const TRIPS_SAMPLE = [
  { title: 'Fushimi Inari za úsvitu',  city: 'Kjóto',   day: 'Út 15. 9.',  time: '05:30', dur: '3 h',  kind: 'walk',    booked: true,  tag: 'Brzy ráno' },
  { title: 'Arashiyama bambusový les', city: 'Kjóto',   day: 'St 16. 9.',  time: '07:00', dur: '4 h',  kind: 'walk',    booked: false, tag: 'Plánuju' },
  { title: 'DMZ — celodenní výlet',    city: 'Soul',    day: 'Út 8. 9.',   time: '07:30', dur: '9 h',  kind: 'tour',    booked: true,  tag: 'Rezervováno' },
  { title: 'Trajekt Busan → Fukuoka',  city: 'Busan',   day: 'Ne 13. 9.',  time: '09:00', dur: '3 h',  kind: 'ferry',   booked: true,  tag: 'JR Beetle' },
  { title: 'teamLab Planets',          city: 'Tokio',   day: 'Po 21. 9.',  time: '10:00', dur: '2 h',  kind: 'museum',  booked: false, tag: 'Koupit lístky' },
  { title: 'Onsen v ryokanu',          city: 'Hakone',  day: 'Pá 18. 9.',  time: '17:00', dur: '—',    kind: 'onsen',   booked: true,  tag: 'Hotel' },
  { title: 'Tsukiji ranní snídaně',    city: 'Tokio',   day: 'Út 22. 9.',  time: '06:30', dur: '2 h',  kind: 'food',    booked: false, tag: 'Tipy od Hany' },
  { title: 'Nikkō — daytrip vlakem',   city: 'Tokio',   day: 'So 26. 9.',  time: '08:00', dur: '11 h', kind: 'tour',    booked: false, tag: 'Pokud bude počasí' },
  { title: 'Gamcheon Culture Village', city: 'Busan',   day: 'Pá 11. 9.',  time: '14:00', dur: '3 h',  kind: 'walk',    booked: false, tag: '' },
];

// Trip map — renders the uploaded Korea+Japan silhouette
// (assets/map-asia.png) directly as an SVG <image>, with route line + city
// dots + labels drawn on top in the same SVG coordinate space (viewBox
// 0 0 481 381 matches the PNG natively). Cities are clickable via
// `onCityClick`.
//
// `landOpacity` controls how strong the silhouette reads (the PNG itself
// is ink-coloured; opacity is enough to make it sit calmly in any palette).
function TripMap({
  width = 640, height = 380,
  preserveAspectRatio = 'xMidYMid meet',
  landOpacity = 0.32,
  routeStroke = '#cf3a2a',
  routeDash = '3 5',
  cityFill = '#cf3a2a',
  cityRing = '#f7f3ea',
  labelColor = '#1e1a17',
  labelFont = "'DM Sans', sans-serif",
  labelSize = 16,
  labelWeight = 500,
  showLabels = true,
  showRoute = true,
  cityRadius = 5,
  onCityClick,
  className = '',
  style = {},
}) {
  const cities = TRIP.cities.filter(c => c.nights > 0);
  const routePts = cities.map(c => `${c.x},${c.y}`).join(' ');

  return (
    <svg
      viewBox="0 0 481 381"
      width={width}
      height={height}
      preserveAspectRatio={preserveAspectRatio}
      className={className}
      style={style}
    >
      <image
        href="assets/map-asia.png"
        x="0" y="0" width="481" height="381"
        opacity={landOpacity}
        preserveAspectRatio="xMidYMid meet"
      />

      {showRoute && (
        <polyline
          points={routePts}
          fill="none"
          stroke={routeStroke}
          strokeWidth="3.5"
          strokeDasharray={routeDash}
          strokeLinecap="round"
        />
      )}

      {cities.map(c => (
        <g
          key={c.id}
          transform={`translate(${c.x} ${c.y})`}
          style={{ cursor: onCityClick ? 'pointer' : 'default' }}
          onClick={() => onCityClick && onCityClick(c)}
        >
          {/* invisible hit-area for easier click */}
          <circle r={16} fill="transparent" />
          <circle r={cityRadius + 2.5} fill={cityRing} />
          <circle r={cityRadius} fill={cityFill} />
          {showLabels && (
            <text
              x={c.lblDx ?? cityRadius + 6}
              y={c.lblDy ?? 4}
              textAnchor={c.anchor || 'start'}
              fontFamily={labelFont}
              fontSize={labelSize}
              fontWeight={labelWeight}
              fill={labelColor}
              style={{ paintOrder: 'stroke', stroke: cityRing, strokeWidth: 3.5 }}
            >
              {c.name}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

// Tiny vector icons used in nav (24px viewBox)
const Icon = {
  dashboard: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>,
  flight:    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13l3 1 4-5 8 8 2-1-4-9 5-3a2 2 0 0 0-2-3l-9 5-9-4-1 2 8 4-5 4z"/></svg>,
  hotel:     <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20V8h7v12M10 12h11v8M14 15h3"/></svg>,
  trip:      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/></svg>,
  food:      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4v8a4 4 0 0 0 4 4v4M8 4v8M16 4c-2 0-3 2-3 5s1 5 3 5v6"/></svg>,
  schedule:  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>,
  budget:    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 14c.5 1 1.7 1.5 3 1.5 1.7 0 3-.8 3-2s-1-1.7-3-2-3-.8-3-2 1.3-2 3-2 2.5.5 3 1.5M12 6v2M12 16v2"/></svg>,
  logout:    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4h5v16h-5M9 8l-4 4 4 4M5 12h11"/></svg>,
};

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Přehled',     icon: Icon.dashboard },
  { id: 'flights',   label: 'Letenky',     icon: Icon.flight },
  { id: 'hotels',    label: 'Ubytování',   icon: Icon.hotel },
  { id: 'trips',     label: 'Místa',       icon: Icon.trip },
  { id: 'food',      label: 'Restaurace',  icon: Icon.food },
  { id: 'schedule',  label: 'Jízdní řády', icon: Icon.schedule },
  { id: 'budget',    label: 'Rozpočet',    icon: Icon.budget },
];

// Curated Unsplash photo set for the trip. ID is the photo identifier;
// caption + city used in captions. The defaults are evocative-of-Asia
// stock photos — swap each `id` for your own photo URL slug once you have
// personal photos, and the rest of the layout stays identical.
const PHOTOS = {
  fuji:     { id: '1545569341-9eb8b30979d9', alt: 'Hora Fudži za podzimního rána',         city: 'Hakone',  caption: 'Mt. Fuji — pohled z Chureito' },
  fushimi:  { id: '1480796927426-f609979314bd', alt: 'Japonská ulička za soumraku',         city: 'Kjóto',   caption: 'Kjóto, ranní procházka' },
  shibuya:  { id: '1542051841857-5f90071e7989', alt: 'Šibuja v noci, neon a déšť',          city: 'Tokio',   caption: 'Shibuya, po dešti' },
  bamboo:   { id: '1493997181344-712f2f19d87a', alt: 'Bambusový les v Arashiyamě',           city: 'Kjóto',   caption: 'Arashiyama' },
  tokyo:    { id: '1492571350019-22de08371fd3', alt: 'Japonská krajina',                     city: 'Tokio',   caption: 'Yanaka, ranní káva' },
  hanok:    { id: '1517154421773-0529f29ea451', alt: 'Korejské hanok střechy',               city: 'Soul',    caption: 'Bukchon hanok' },
  gamcheon: { id: '1601295864265-8e8569e2c2e3', alt: 'Barevné domky Gamcheonu',              city: 'Busan',   caption: 'Gamcheon Culture Village' },
  ramen:    { id: '1591814468924-caf88d1232e1', alt: 'Miska ramen s vejci',                  city: 'Fukuoka', caption: 'Hakata ramen yatai' },
};

function photoUrl(id, w = 800) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&auto=format&fit=crop&q=80`;
}

// Simple bg-image wrapper — gives a colored fallback if the network drops.
function Photo({ src, alt, w = 800, style = {}, fallback = '#e7ddc8', children }) {
  return (
    <div
      role="img"
      aria-label={alt}
      style={{
        backgroundImage: `url("${photoUrl(src, w)}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: fallback,
        position: 'relative',
        ...style,
      }}
    >{children}</div>
  );
}

Object.assign(window, { TRIP, ITINERARY, TRIPS_SAMPLE, TripMap, Icon, NAV_ITEMS, PHOTOS, photoUrl, Photo });
