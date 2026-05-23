// Variant 2 — "Atlas Editorial"
// Travel magazine grid. Big Instrument Serif display, italic captions,
// modular numbered itinerary, two-column with map as the editorial spread
// hero. Palette-driven: pass `palette` prop to swap the sidebar tone +
// primary accent without rebuilding the layout. Palettes pull from the
// Korean/Japanese tradition rather than generic Mediterranean terracotta.

const V2 = {
  bg:        '#faf6ee',
  panel:     '#ffffff',
  alt:       '#f1ead9',  // contrast band
  ink:       '#1c1815',
  ink2:      '#3e3830',
  ink3:      '#857c70',
  rule:      '#dccfb6',
  font:  "'DM Sans', sans-serif",
  serif: "'Instrument Serif', 'Newsreader', Georgia, serif",
  mono:  "'DM Mono', ui-monospace, monospace",
};

// Palettes are rooted in actual East-Asian tradition:
// · shu  (朱 + 墨) — sumi-ink walnut sidebar + vermillion accent (torii red)
// · ai   (藍 + 朱) — indigo sidebar (Japanese ai dye) + vermillion accent
// · pine (松 + 青磁) — pine sidebar + celadon-green accent (Korean Goryeo ware)
const V2_PALETTES = {
  shu: {
    label: '朱 · Sumi & Shu',
    desc:  'Inkoust + vermilion. Klasická japonská kombinace — torii brány na sumi pozadí.',
    sb_bg:    '#2a2522',
    sb_text:  '#f5ecd9',
    sb_muted: 'rgba(245,236,217,.55)',
    sb_rule:  'rgba(245,236,217,.1)',
    sb_accent:'#e9614f',
    acc:      '#cf3a2a',
    acc2:     '#cf3a2a',
    sealCh:   '朱',
  },
  ai: {
    label: '藍 · Ai & Shu',
    desc:  'Indigo + vermilion. Ukiyo-e dřevoryt: hluboká modř, varování vermilionem.',
    sb_bg:    '#1d2c4a',
    sb_text:  '#f0e8d3',
    sb_muted: 'rgba(240,232,211,.6)',
    sb_rule:  'rgba(240,232,211,.12)',
    sb_accent:'#e9614f',
    acc:      '#cf3a2a',
    acc2:     '#3e5c8c',
    sealCh:   '藍',
  },
  pine: {
    label: '松 · Pine & Celadon',
    desc:  'Pinie + Goryeo seladon. Korejská keramika, klid hor, mech.',
    sb_bg:    '#28332c',
    sb_text:  '#f0eadb',
    sb_muted: 'rgba(240,234,219,.55)',
    sb_rule:  'rgba(240,234,219,.1)',
    sb_accent:'#a3c4a8',
    acc:      '#6b9079',
    acc2:     '#b54a35',
    sealCh:   '松',
  },
};

function V2Sidebar({ active = 'dashboard', palette = 'shu' }) {
  const p = V2_PALETTES[palette] || V2_PALETTES.shu;
  return (
    <aside style={{
      width: 210, flex: '0 0 210px',
      background: p.sb_bg, color: p.sb_text,
      padding: '26px 0 22px',
      display: 'flex', flexDirection: 'column', fontFamily: V2.font,
    }}>
      <div style={{ padding: '0 22px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div style={{ fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.22em', color: p.sb_accent, textTransform: 'uppercase' }}>
            № 01 · Atlas
          </div>
          <div style={{ marginLeft: 'auto', fontFamily: V2.serif, fontSize: 16, color: p.sb_accent, lineHeight: 1 }}>{p.sealCh}</div>
        </div>
        <div style={{ marginTop: 8, fontFamily: V2.serif, fontSize: 26, lineHeight: 0.95, letterSpacing: '-0.01em', color: p.sb_text }}>
          Korea<br/><span style={{ fontStyle: 'italic' }}>&amp; Japonsko</span>
        </div>
        <div style={{ marginTop: 10, fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.14em', color: p.sb_muted }}>
          IX — X · MMXXVI
        </div>
      </div>

      <nav style={{ flex: '1 1 auto', padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {NAV_ITEMS.map((item, i) => {
          const isActive = item.id === active;
          return (
            <a key={item.id} href="#" style={{
              display: 'flex', alignItems: 'baseline', gap: 12,
              padding: '8px 10px',
              textDecoration: 'none',
              color: isActive ? p.sb_text : p.sb_muted,
              fontSize: 13.5,
              borderBottom: `1px solid ${p.sb_rule}`,
              fontFamily: V2.font,
            }}>
              <span style={{ fontFamily: V2.mono, fontSize: 10, color: isActive ? p.sb_accent : p.sb_muted, minWidth: 18, opacity: isActive ? 1 : 0.7 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ flex: 1, fontWeight: isActive ? 500 : 400 }}>{item.label}</span>
              {isActive && <span style={{ color: p.sb_accent }}>●</span>}
            </a>
          );
        })}
      </nav>

      <div style={{ padding: '16px 22px 0', fontSize: 12, color: p.sb_muted }}>
        <a href="#" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          {Icon.logout} Odhlásit se
        </a>
      </div>
    </aside>
  );
}

// Wrapping host that sets CSS vars from the palette. All accent uses below
// reference `var(--v2-acc)` / `var(--v2-acc-2)` so the same JSX renders in
// any palette without per-component rewiring.
function V2Host({ palette, children }) {
  const p = V2_PALETTES[palette] || V2_PALETTES.shu;
  return (
    <div style={{
      display: 'flex', width: '100%', height: '100%', background: V2.bg,
      fontFamily: V2.font, color: V2.ink,
      '--v2-acc':   p.acc,
      '--v2-acc-2': p.acc2,
    }}>
      {children}
    </div>
  );
}

function V2Dashboard({ palette = 'shu' }) {
  return (
    <V2Host palette={palette}>
      <V2Sidebar active="dashboard" palette={palette} />

      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        {/* Masthead band */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 40px', borderBottom: `1px solid ${V2.rule}`,
          fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.16em', color: V2.ink3, textTransform: 'uppercase',
        }}>
          <span>Vydání 01 · Plán cesty</span>
          <span>23 dní · 2 země · 5 měst</span>
          <span>Naposledy upraveno · čt 22. 5.</span>
        </div>

        {/* Cover photo hero — full-width, with title overlay */}
        <section style={{ position: 'relative', height: 340, borderBottom: `1px solid ${V2.rule}` }}>
          <Photo src={PHOTOS.fuji.id} alt={PHOTOS.fuji.alt} w={1600}
            style={{ position: 'absolute', inset: 0 }} />
          {/* readability gradient — strongest at top-left where the headline sits */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(115deg, rgba(20,16,12,0.75) 0%, rgba(20,16,12,0.35) 45%, rgba(20,16,12,0) 75%)',
          }} />
          <div style={{ position: 'relative', height: '100%', padding: '34px 40px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#f5ecd9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.22em', color: 'var(--v2-acc)', textTransform: 'uppercase' }}>
                  Září — Říjen 2026 · Den <span style={{ background: 'var(--v2-acc)', color: V2.bg, padding: '2px 6px', marginLeft: 4 }}>–{TRIP.daysToGo}</span>
                </div>
                <h1 style={{
                  margin: '14px 0 0', fontFamily: V2.serif, fontWeight: 400,
                  fontSize: 64, lineHeight: 0.94, letterSpacing: '-0.025em', color: '#f7eede',
                  textShadow: '0 1px 24px rgba(0,0,0,.3)',
                }}>
                  Tři týdny<br/>mezi <span style={{ fontStyle: 'italic', color: '#e9614f' }}>mořem</span> a horami.
                </h1>
              </div>
              {/* Caption sticker top-right */}
              <div style={{
                marginTop: 6, padding: '6px 10px', background: 'rgba(20,16,12,.55)',
                fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.16em', color: '#f5ecd9', textTransform: 'uppercase',
                backdropFilter: 'blur(4px)',
              }}>
                Foto · {PHOTOS.fuji.caption}
              </div>
            </div>

            {/* Dates strip on the cover */}
            <div style={{
              display: 'flex', gap: 36, paddingTop: 16,
              borderTop: '1px solid rgba(245,236,217,.2)',
              fontFamily: V2.serif, color: '#f5ecd9',
            }}>
              <div>
                <div style={{ fontFamily: V2.mono, fontSize: 9, letterSpacing: '0.18em', color: 'rgba(245,236,217,.6)', textTransform: 'uppercase' }}>Od</div>
                <div style={{ marginTop: 2, fontSize: 19 }}>{TRIP.start}</div>
              </div>
              <div>
                <div style={{ fontFamily: V2.mono, fontSize: 9, letterSpacing: '0.18em', color: 'rgba(245,236,217,.6)', textTransform: 'uppercase' }}>Do</div>
                <div style={{ marginTop: 2, fontSize: 19 }}>{TRIP.end}</div>
              </div>
              <div>
                <div style={{ fontFamily: V2.mono, fontSize: 9, letterSpacing: '0.18em', color: 'rgba(245,236,217,.6)', textTransform: 'uppercase' }}>Délka</div>
                <div style={{ marginTop: 2, fontSize: 19 }}>{TRIP.days} dní</div>
              </div>
              <div style={{ marginLeft: 'auto', fontFamily: V2.serif, fontStyle: 'italic', fontSize: 15, color: 'rgba(245,236,217,.85)', maxWidth: 380, textAlign: 'right' }}>
                Soul · Busan · Fukuoka · Kjóto · Hakone · Tokio
              </div>
            </div>
          </div>
        </section>

        {/* Map + destination photo strip — side-by-side. Map column width
            matches the Itinerář column below (1.2fr in a 1.2/1/1 grid → 1.2fr/2fr here). */}
        <section style={{
          display: 'grid', gridTemplateColumns: '1.2fr 2fr',
          borderBottom: `1px solid ${V2.rule}`,
        }}>
          <div style={{
            position: 'relative', background: V2.alt, borderRight: `1px solid ${V2.rule}`,
            overflow: 'hidden', height: 200,
          }}>
            <div className="paper-grain" style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }} />
            <TripMap
              width="100%" height={200}
              landOpacity={0.32}
              routeStroke={V2_PALETTES[palette].acc} routeDash="4 6"
              cityFill={V2_PALETTES[palette].acc} cityRing={V2.alt}
              labelColor={V2.ink} labelFont={V2.serif} labelSize={32} labelWeight={500}
              cityRadius={8}
              onCityClick={c => console.log('city click:', c.id)}
              style={{ display: 'block', width: '100%', height: '100%' }}
            />
            {/* Title + distance, stacked top-left in the empty sea space */}
            <div style={{ position: 'absolute', top: 12, left: 16 }}>
              <div style={{ fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.2em', color: V2.ink2, textTransform: 'uppercase' }}>
                Korea — Japonsko
              </div>
              <div style={{ marginTop: 3, fontFamily: V2.serif, fontStyle: 'italic', fontSize: 13, color: V2.ink2 }}>
                ~ 2 470 km · 6 zastávek
              </div>
            </div>
          </div>

          {/* Destination thumbnails — horizontal row of 6 */}
          <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <div style={{ fontFamily: V2.serif, fontSize: 18, fontWeight: 400 }}>
                Šest zastávek <span style={{ fontStyle: 'italic', color: V2.ink3, fontSize: 13 }}>v obrazech</span>
              </div>
              <span style={{ fontFamily: V2.mono, fontSize: 10, color: V2.ink3, letterSpacing: '0.1em' }}>06</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, flex: 1 }}>
              {[PHOTOS.hanok, PHOTOS.gamcheon, PHOTOS.ramen, PHOTOS.bamboo, PHOTOS.fuji, PHOTOS.shibuya].map((ph, i) => (
                <Photo key={i} src={ph.id} alt={ph.alt} w={320}
                  style={{ aspectRatio: 'auto' }}
                >
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(0deg, rgba(20,16,12,.7) 0%, rgba(20,16,12,0) 50%)',
                    display: 'flex', alignItems: 'flex-end', padding: '8px 10px',
                  }}>
                    <div style={{
                      fontFamily: V2.mono, fontSize: 9, letterSpacing: '0.14em',
                      color: '#f5ecd9', textTransform: 'uppercase',
                    }}>
                      {ph.city}
                    </div>
                  </div>
                </Photo>
              ))}
            </div>
          </div>
        </section>

        {/* Three columns — Numbered itinerary | Stats | Notes */}
        <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', borderBottom: `1px solid ${V2.rule}` }}>
          <div style={{ padding: '24px 32px', borderRight: `1px solid ${V2.rule}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontFamily: V2.serif, fontSize: 22, fontWeight: 400 }}>
                Itinerář <span style={{ color: V2.ink3, fontStyle: 'italic', fontSize: 14 }}>v sedmi etapách</span>
              </h2>
              <a href="#" style={{ fontSize: 11, fontFamily: V2.mono, color: 'var(--v2-acc)', textDecoration: 'none', letterSpacing: '0.1em' }}>VŠE →</a>
            </div>

            <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {ITINERARY.slice(0, 5).map((it, i) => (
                <li key={i} style={{
                  display: 'grid', gridTemplateColumns: '30px 1fr auto',
                  alignItems: 'baseline', gap: 14,
                  padding: '12px 0',
                  borderTop: i === 0 ? `1px solid ${V2.rule}` : 'none',
                  borderBottom: `1px solid ${V2.rule}`,
                }}>
                  <span style={{ fontFamily: V2.serif, fontSize: 24, color: 'var(--v2-acc)', lineHeight: 1 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div style={{ fontSize: 15, color: V2.ink, fontWeight: 500 }}>
                      {it.city} <span style={{ color: V2.ink3, fontWeight: 400, fontFamily: V2.serif, fontStyle: 'italic', fontSize: 14 }}>— {it.tag}</span>
                    </div>
                    <div style={{ marginTop: 2, fontFamily: V2.mono, fontSize: 10.5, color: V2.ink3, letterSpacing: '0.04em' }}>
                      {it.d1} → {it.d2} · {it.country}
                    </div>
                  </div>
                  <div style={{ fontFamily: V2.serif, fontSize: 14, color: V2.ink2, fontStyle: 'italic' }}>
                    {it.nights} {it.nights === 1 ? 'noc' : it.nights < 5 ? 'noci' : 'nocí'}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div style={{ padding: '24px 28px', borderRight: `1px solid ${V2.rule}`, background: V2.panel }}>
            <h2 style={{ margin: '0 0 18px', fontFamily: V2.serif, fontSize: 22, fontWeight: 400 }}>
              <span style={{ fontStyle: 'italic' }}>Stav</span> přípravy
            </h2>

            {[
              { l: 'Letenky',  v: '2 / 2', p: 100, n: 'KLM · OZ' },
              { l: 'Ubytování', v: '4 / 6', p: 66,  n: 'Booking + Ryokan' },
              { l: 'Aktivity', v: '4 / 9', p: 44,  n: 'rezervováno' },
              { l: 'Doprava',  v: '3 / 5', p: 60,  n: 'JR + KTX' },
            ].map((s, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 13, color: V2.ink }}>{s.l}</span>
                  <span style={{ fontFamily: V2.mono, fontSize: 11, color: V2.ink2 }}>{s.v}</span>
                </div>
                <div style={{ marginTop: 6, height: 3, background: V2.rule, position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, width: `${s.p}%`, background: s.p === 100 ? 'var(--v2-acc-2)' : 'var(--v2-acc)' }} />
                </div>
                <div style={{ marginTop: 4, fontFamily: V2.mono, fontSize: 10, color: V2.ink3, letterSpacing: '0.06em' }}>{s.n}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: '24px 28px', background: V2.alt, position: 'relative' }}>
            <div className="paper-grain" style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.2em', color: 'var(--v2-acc)', textTransform: 'uppercase' }}>
                Poznámka redakce
              </div>
              <p style={{ margin: '14px 0 0', fontFamily: V2.serif, fontStyle: 'italic', fontSize: 22, lineHeight: 1.3, color: V2.ink }}>
                „Mezi&nbsp;Soulem a&nbsp;Tokiem leží Busan — vlastně proto tam letíme.“
              </p>
              <div style={{ marginTop: 14, fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.14em', color: V2.ink3 }}>
                — Plán cesty, ranní káva, leden 2026
              </div>
              <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${V2.rule}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontFamily: V2.serif, fontSize: 36, lineHeight: 1, color: V2.ink }}>{TRIP.daysToGo}</div>
                  <div style={{ marginTop: 6, fontFamily: V2.mono, fontSize: 10, color: V2.ink3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>dní do odjezdu</div>
                </div>
                <div>
                  <div style={{ fontFamily: V2.serif, fontSize: 36, lineHeight: 1, color: V2.ink }}>38<span style={{ fontSize: 18, color: 'var(--v2-acc)' }}>%</span></div>
                  <div style={{ marginTop: 6, fontFamily: V2.mono, fontSize: 10, color: V2.ink3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>rozpočet utracen</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer — running marquee feel */}
        <div style={{
          padding: '14px 40px', display: 'flex', gap: 28, alignItems: 'center',
          fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.16em', color: V2.ink3, textTransform: 'uppercase',
        }}>
          <span>★</span>
          <span>Soul 5n</span><span>·</span>
          <span>Busan 3n</span><span>·</span>
          <span>Fukuoka 1n</span><span>·</span>
          <span>Kjóto 4n</span><span>·</span>
          <span>Hakone 2n</span><span>·</span>
          <span>Tokio 8n</span>
          <span style={{ marginLeft: 'auto', color: 'var(--v2-acc)' }}>úprava itineráře →</span>
        </div>
      </main>
    </V2Host>
  );
}

function V2Trips({ palette = 'shu' }) {
  // Map each activity (by index in TRIPS_SAMPLE) to a photo from the curated set.
  const tripPhotos = [
    PHOTOS.fushimi,  // 0 Fushimi Inari za úsvitu
    PHOTOS.bamboo,   // 1 Arashiyama bambusový les
    PHOTOS.hanok,    // 2 DMZ — closest available (Korean palace/hanok)
    PHOTOS.ramen,    // 3 Trajekt Busan → Fukuoka — Hakata ramen for arrival
    PHOTOS.shibuya,  // 4 teamLab Planets — Tokyo nightlife
    PHOTOS.fuji,     // 5 Onsen v ryokanu
    PHOTOS.tokyo,    // 6 Tsukiji ranní snídaně
    PHOTOS.bamboo,   // 7 Nikkō — forest/mountains stand-in
    PHOTOS.gamcheon, // 8 Gamcheon Culture Village
  ];
  return (
    <V2Host palette={palette}>
      <V2Sidebar active="trips" palette={palette} />

      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 40px', borderBottom: `1px solid ${V2.rule}`,
          fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.16em', color: V2.ink3, textTransform: 'uppercase',
        }}>
          <span>Sekce 04 · Výlety &amp; aktivity</span>
          <span>{TRIPS_SAMPLE.length} položek · {TRIPS_SAMPLE.filter(t => t.booked).length} rezervováno</span>
        </div>

        <header style={{ padding: '36px 40px 28px', borderBottom: `1px solid ${V2.rule}`, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, alignItems: 'end' }}>
          <div>
            <div style={{ fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.2em', color: 'var(--v2-acc)', textTransform: 'uppercase' }}>
              Tematická sekce — 04
            </div>
            <h1 style={{
              margin: '12px 0 0', fontFamily: V2.serif, fontWeight: 400,
              fontSize: 72, lineHeight: 0.9, letterSpacing: '-0.025em',
            }}>
              Devět <span style={{ fontStyle: 'italic', color: 'var(--v2-acc)' }}>záminek</span> vstát.
            </h1>
          </div>
          <p style={{ margin: 0, fontFamily: V2.serif, fontStyle: 'italic', fontSize: 17, color: V2.ink2, lineHeight: 1.45 }}>
            Od chrámů v 5:30 ráno po onseny po setmění — věci, kvůli kterým má smysl odejít z hotelu.
          </p>
        </header>

        <div style={{ padding: '14px 40px', borderBottom: `1px solid ${V2.rule}`, display: 'flex', gap: 22, alignItems: 'center', fontFamily: V2.mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {['Vše · 9', 'Rezervováno · 4', 'Plánuju · 5', 'Brzy ráno · 2', 'Celodenní · 3'].map((t, i) => (
            <button key={t} style={{
              padding: '6px 0', background: 'transparent', border: 'none',
              borderBottom: i === 0 ? `2px solid var(--v2-acc)` : '2px solid transparent',
              color: i === 0 ? V2.ink : V2.ink3, cursor: 'pointer',
              fontFamily: V2.mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>{t}</button>
          ))}
          <span style={{ marginLeft: 'auto', color: 'var(--v2-acc)' }}>+ Nová aktivita</span>
        </div>

        <section style={{ padding: '28px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, paddingBottom: 28, borderBottom: `1px solid ${V2.rule}` }}>
            <article>
              <Photo src={PHOTOS.fushimi.id} alt={PHOTOS.fushimi.alt} w={1200}
                style={{
                  aspectRatio: '16/8',
                  position: 'relative',
                  border: `1px solid ${V2.rule}`,
                }}
              >
                {/* dark gradient for the bottom caption */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(0deg, rgba(20,16,12,.6) 0%, rgba(20,16,12,0) 50%)',
                }} />
                <div style={{ position: 'absolute', bottom: 14, left: 16, fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.16em', color: '#f5ecd9', textTransform: 'uppercase' }}>
                  Foto · {PHOTOS.fushimi.caption}
                </div>
                <div style={{ position: 'absolute', top: 14, left: 14, background: 'var(--v2-acc)', color: V2.bg, padding: '4px 8px', fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                  Hlavní událost
                </div>
              </Photo>
              <div style={{ marginTop: 16 }}>
                <div style={{ fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.16em', color: 'var(--v2-acc)', textTransform: 'uppercase' }}>
                  Kjóto · Den 11
                </div>
                <h3 style={{ margin: '8px 0 0', fontFamily: V2.serif, fontSize: 32, lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em' }}>
                  Fushimi Inari <span style={{ fontStyle: 'italic', color: V2.ink3 }}>za úsvitu</span>
                </h3>
                <p style={{ margin: '10px 0 0', fontFamily: V2.serif, fontStyle: 'italic', fontSize: 15, color: V2.ink2, lineHeight: 1.5 }}>
                  Sraz v 5:30 u prvního torii. Vystoupat na vrchol než dorazí turisté. Snídaně cestou dolů.
                </p>
                <div style={{ marginTop: 14, display: 'flex', gap: 16, fontFamily: V2.mono, fontSize: 11, color: V2.ink3, letterSpacing: '0.06em' }}>
                  <span>05:30 — 08:30</span>
                  <span>·</span>
                  <span>3 hodiny</span>
                  <span>·</span>
                  <span style={{ color: 'var(--v2-acc)' }}>● Rezervováno</span>
                </div>
              </div>
            </article>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {TRIPS_SAMPLE.slice(2, 5).map((t, i) => {
                const ph = tripPhotos[i + 2];
                return (
                  <article key={i} style={{
                    display: 'grid', gridTemplateColumns: '108px 1fr', gap: 14,
                    paddingBottom: 16, borderBottom: i < 2 ? `1px solid ${V2.rule}` : 'none',
                  }}>
                    <Photo src={ph.id} alt={ph.alt} w={300}
                      style={{ aspectRatio: '1', alignSelf: 'start' }}
                    />
                    <div>
                      <div style={{ fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.16em', color: t.booked ? 'var(--v2-acc)' : V2.ink3, textTransform: 'uppercase' }}>
                        {t.city} · {t.day}
                      </div>
                      <h4 style={{ margin: '6px 0 0', fontFamily: V2.serif, fontSize: 20, lineHeight: 1.05, fontWeight: 400 }}>
                        {t.title}
                      </h4>
                      <div style={{ marginTop: 8, display: 'flex', gap: 10, fontFamily: V2.mono, fontSize: 10.5, color: V2.ink3, letterSpacing: '0.04em' }}>
                        <span>{t.time}</span>
                        <span>·</span>
                        <span>{t.dur}</span>
                      </div>
                      <div style={{ marginTop: 6, fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.1em', color: t.booked ? 'var(--v2-acc-2)' : V2.ink3 }}>
                        {t.booked ? '● Rezervováno' : '○ Plánuju'}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
            {TRIPS_SAMPLE.slice(5).map((t, i) => {
              const ph = tripPhotos[i + 5];
              return (
                <article key={i} style={{ background: V2.panel, border: `1px solid ${V2.rule}`, overflow: 'hidden' }}>
                  <Photo src={ph.id} alt={ph.alt} w={500}
                    style={{ aspectRatio: '4/3' }}
                  />
                  <div style={{ padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.14em', color: V2.ink3, textTransform: 'uppercase' }}>
                      <span>{t.city}</span>
                      <span>{t.time}</span>
                    </div>
                    <h4 style={{ margin: '8px 0 0', fontFamily: V2.serif, fontSize: 19, lineHeight: 1.05, fontWeight: 400 }}>
                      {t.title}
                    </h4>
                    <div style={{ marginTop: 6, fontFamily: V2.serif, fontStyle: 'italic', fontSize: 12.5, color: V2.ink2 }}>
                      {t.day} · {t.dur}
                    </div>
                    <div style={{ marginTop: 10, fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.1em', color: t.booked ? 'var(--v2-acc-2)' : 'var(--v2-acc)' }}>
                      {t.booked ? '● Rezervováno' : '○ ' + (t.tag || 'Plánuju')}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </V2Host>
  );
}

Object.assign(window, { V2Dashboard, V2Trips, V2_PALETTES });
