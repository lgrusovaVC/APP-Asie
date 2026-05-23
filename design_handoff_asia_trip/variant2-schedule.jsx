// V2 — Jízdní řády (Schedule / Transport)
// Two big passes (JR Pass JP, Korea Rail Pass KR) up top, then a
// chronological journey log with each train/ferry as a row (timetable
// feel — departure → arrival, train name, status). Plus a small "key
// stations" sidebar.

const TRANSPORT = [
  { id: 't1', date: 'Čt 10. 9.',  type: 'KTX',     code: '105',         line: 'KTX Gyeongbu',
    from: { code: 'SUR', city: 'Seoul Station',  time: '08:15' },
    to:   { code: 'PUS', city: 'Busan',           time: '10:55' },
    dur: '2h 40', dist: '417 km', class: '1. třída', price: '2 380 Kč', booked: true, pass: 'Korea Rail Pass' },
  { id: 't2', date: 'Ne 13. 9.',  type: 'Trajekt', code: 'Beetle',      line: 'JR Beetle',
    from: { code: 'PUS', city: 'Busan Terminal', time: '09:00' },
    to:   { code: 'HKT', city: 'Hakata Port',     time: '12:45' },
    dur: '3h 45', dist: '212 km', class: 'Standard', price: '2 950 Kč', booked: true, pass: '—' },
  { id: 't3', date: 'Po 14. 9.',  type: 'Shink.',  code: 'Sakura 547',  line: 'Sakura · Sanyo',
    from: { code: 'HKT', city: 'Hakata',          time: '11:08' },
    to:   { code: 'HSM', city: 'Hiroshima',       time: '12:14' },
    dur: '1h 06', dist: '281 km', class: 'Reserved',  price: 'JR Pass', booked: true, pass: 'JR Pass' },
  { id: 't4', date: 'Út 15. 9.',  type: 'Shink.',  code: 'Hikari 466',  line: 'Hikari · Sanyo/Tokaido',
    from: { code: 'HSM', city: 'Hiroshima',       time: '14:23' },
    to:   { code: 'KYT', city: 'Kyoto',           time: '16:00' },
    dur: '1h 37', dist: '361 km', class: 'Reserved',  price: 'JR Pass', booked: true, pass: 'JR Pass' },
  { id: 't5', date: 'Pá 18. 9.',  type: 'Lokálka', code: 'Sagano',      line: 'Sagano Scenic',
    from: { code: 'KYT', city: 'Saga-Arashiyama', time: '09:30' },
    to:   { code: 'KAM', city: 'Kameoka Torokko', time: '09:55' },
    dur: '0h 25', dist: '7 km',  class: 'Reserved',  price: '880 Kč',   booked: false, pass: '—' },
  { id: 't6', date: 'So 19. 9.',  type: 'Shink.',  code: 'Nozomi 218',  line: 'Nozomi · Tokaido',
    from: { code: 'KYT', city: 'Kyoto',           time: '10:13' },
    to:   { code: 'TYO', city: 'Tokyo',           time: '12:28' },
    dur: '2h 15', dist: '514 km', class: 'Reserved',  price: '3 250 Kč',  booked: false, pass: 'Mimo JR Pass' },
  { id: 't7', date: 'So 26. 9.',  type: 'JR Lokál', code: 'Nikko Line', line: 'Tobu Nikko',
    from: { code: 'TYO', city: 'Asakusa',         time: '07:30' },
    to:   { code: 'NKO', city: 'Tobu-Nikko',      time: '09:25' },
    dur: '1h 55', dist: '125 km', class: 'Standard',  price: '1 600 Kč',  booked: false, pass: '—' },
];

function PassCard({ name, region, days, price, used, total, accent, secondary }) {
  return (
    <div style={{
      background: V2.panel, border: `1px solid ${V2.rule}`,
      padding: '20px 22px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: accent }} />
      <div style={{ marginLeft: 12 }}>
        <div style={{ fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.2em', color: accent, textTransform: 'uppercase' }}>
          {region}
        </div>
        <div style={{ marginTop: 6, fontFamily: V2.serif, fontSize: 28, lineHeight: 1, fontWeight: 400, letterSpacing: '-0.01em' }}>
          {name}
        </div>
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontFamily: V2.mono, fontSize: 9, letterSpacing: '0.14em', color: V2.ink3, textTransform: 'uppercase' }}>Platnost</div>
            <div style={{ marginTop: 3, fontFamily: V2.serif, fontSize: 18, color: V2.ink }}>{days} dní</div>
          </div>
          <div>
            <div style={{ fontFamily: V2.mono, fontSize: 9, letterSpacing: '0.14em', color: V2.ink3, textTransform: 'uppercase' }}>Cena</div>
            <div style={{ marginTop: 3, fontFamily: V2.serif, fontSize: 18, color: V2.ink }}>{price}</div>
          </div>
          <div>
            <div style={{ fontFamily: V2.mono, fontSize: 9, letterSpacing: '0.14em', color: V2.ink3, textTransform: 'uppercase' }}>Použito</div>
            <div style={{ marginTop: 3, fontFamily: V2.serif, fontSize: 18, color: V2.ink }}>{used} / {total}</div>
          </div>
        </div>
        {/* Mini progress */}
        <div style={{ marginTop: 14, height: 3, background: V2.rule, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, width: `${(used/total)*100}%`, background: secondary || accent }} />
        </div>
      </div>
    </div>
  );
}

function V2Schedule({ palette = 'shu' }) {
  const acc = V2_PALETTES[palette].acc;
  const acc2 = V2_PALETTES[palette].acc2;
  const totalDist = TRANSPORT.reduce((s, t) => s + parseInt(t.dist), 0);
  const bookedCount = TRANSPORT.filter(t => t.booked).length;

  return (
    <V2Host palette={palette}>
      <V2Sidebar active="schedule" palette={palette} />

      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 40px', borderBottom: `1px solid ${V2.rule}`,
          fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.16em', color: V2.ink3, textTransform: 'uppercase',
        }}>
          <span>Sekce 06 · Doprava na místě</span>
          <span>{TRANSPORT.length} segmentů · {bookedCount} rezervováno · {totalDist.toLocaleString('cs')} km</span>
        </div>

        <header style={{ padding: '36px 40px 28px', borderBottom: `1px solid ${V2.rule}`, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, alignItems: 'end' }}>
          <div>
            <div style={{ fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.2em', color: acc, textTransform: 'uppercase' }}>
              Tematická sekce — 06
            </div>
            <h1 style={{ margin: '12px 0 0', fontFamily: V2.serif, fontWeight: 400, fontSize: 72, lineHeight: 0.9, letterSpacing: '-0.025em' }}>
              Vlakem, <span style={{ fontStyle: 'italic', color: acc }}>lodí</span>, <span style={{ fontStyle: 'italic' }}>shinkansenem</span>.
            </h1>
          </div>
          <p style={{ margin: 0, fontFamily: V2.serif, fontStyle: 'italic', fontSize: 17, color: V2.ink2, lineHeight: 1.45 }}>
            Sedm úseků, dva passy. KTX z Soulu do Busanu, trajekt přes moře, pak JR Pass až do Tokia.
          </p>
        </header>

        {/* Passes */}
        <section style={{ padding: '28px 40px 24px', borderBottom: `1px solid ${V2.rule}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <PassCard name="Korea Rail Pass"  region="대한민국 · KR" days="3"  price="3 400 Kč"   used="1" total="3"  accent={acc}  secondary={acc} />
          <PassCard name="Japan Rail Pass · Green" region="日本 · JP" days="14" price="14 200 Kč" used="0" total="14" accent={acc2} secondary={acc} />
        </section>

        {/* Stats strip */}
        <div style={{ padding: '20px 40px', borderBottom: `1px solid ${V2.rule}`, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          {[
            { k: 'Kilometrů celkem', v: totalDist.toLocaleString('cs'),  n: 'po souši i moři' },
            { k: 'Hodin v dopravě',  v: '13 h 47',                       n: 'včetně přestupů' },
            { k: 'Nejdelší úsek',    v: 'Kyoto → Tokyo',                 n: '514 km · Nozomi' },
            { k: 'Rezervováno',      v: `${bookedCount} / ${TRANSPORT.length}`, n: 'zbytek koupit do 1.9.' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.16em', color: V2.ink3, textTransform: 'uppercase' }}>{s.k}</div>
              <div style={{ marginTop: 6, fontFamily: V2.serif, fontSize: 26, color: V2.ink, lineHeight: 1.05, fontWeight: 400 }}>{s.v}</div>
              <div style={{ marginTop: 4, fontFamily: V2.serif, fontStyle: 'italic', fontSize: 12, color: V2.ink3 }}>{s.n}</div>
            </div>
          ))}
        </div>

        {/* Timetable */}
        <section style={{ padding: '24px 40px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontFamily: V2.serif, fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em' }}>
              Jízdní řád <span style={{ fontStyle: 'italic', color: V2.ink3, fontSize: 16 }}>chronologicky</span>
            </h2>
            <a href="#" style={{ fontFamily: V2.mono, fontSize: 11, color: acc, textDecoration: 'none', letterSpacing: '0.1em' }}>EXPORT CSV →</a>
          </div>

          {/* Column header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '92px 1fr 90px 1fr 80px 1fr 100px 20px',
            gap: 14, padding: '10px 0', borderTop: `1px solid ${V2.rule}`, borderBottom: `1px solid ${V2.rule}`,
            fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.14em', color: V2.ink3, textTransform: 'uppercase',
          }}>
            <div>Datum</div>
            <div>Linka</div>
            <div>Odjezd</div>
            <div>Z</div>
            <div>Příjezd</div>
            <div>Do</div>
            <div>Stav</div>
            <div />
          </div>

          {TRANSPORT.map((t, i) => (
            <div key={t.id} style={{
              display: 'grid',
              gridTemplateColumns: '92px 1fr 90px 1fr 80px 1fr 100px 20px',
              gap: 14, padding: '16px 0', alignItems: 'center',
              borderBottom: `1px solid ${V2.rule}`,
            }}>
              <div>
                <div style={{ fontFamily: V2.serif, fontSize: 14, color: V2.ink }}>{t.date}</div>
                <div style={{ marginTop: 2, fontFamily: V2.mono, fontSize: 10, color: V2.ink3, letterSpacing: '0.04em' }}>{t.dist} · {t.dur}</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.14em', color: acc, textTransform: 'uppercase' }}>{t.type}</span>
                  <span style={{ fontFamily: V2.serif, fontSize: 15, color: V2.ink }}>{t.code}</span>
                </div>
                <div style={{ marginTop: 2, fontFamily: V2.serif, fontStyle: 'italic', fontSize: 12, color: V2.ink3 }}>{t.line}</div>
              </div>
              <div style={{ fontFamily: V2.serif, fontSize: 22, color: V2.ink, lineHeight: 1 }}>{t.from.time}</div>
              <div>
                <div style={{ fontFamily: V2.mono, fontSize: 11, color: V2.ink2, letterSpacing: '0.04em' }}>{t.from.code}</div>
                <div style={{ marginTop: 2, fontFamily: V2.serif, fontSize: 13, color: V2.ink }}>{t.from.city}</div>
              </div>
              <div style={{ fontFamily: V2.serif, fontSize: 22, color: V2.ink, lineHeight: 1 }}>{t.to.time}</div>
              <div>
                <div style={{ fontFamily: V2.mono, fontSize: 11, color: V2.ink2, letterSpacing: '0.04em' }}>{t.to.code}</div>
                <div style={{ marginTop: 2, fontFamily: V2.serif, fontSize: 13, color: V2.ink }}>{t.to.city}</div>
              </div>
              <div style={{ fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {t.booked ? (
                  <span style={{ color: acc2 }}>● Rezerv.</span>
                ) : (
                  <span style={{ color: V2.ink3 }}>○ Koupit</span>
                )}
                <div style={{ marginTop: 2, fontFamily: V2.serif, fontStyle: 'italic', fontSize: 11, textTransform: 'none', color: V2.ink3, letterSpacing: 0 }}>
                  {t.pass || t.price}
                </div>
              </div>
              <div style={{ fontFamily: V2.serif, fontSize: 16, color: V2.ink3, textAlign: 'center' }}>›</div>
            </div>
          ))}
        </section>

        {/* Tips */}
        <section style={{ padding: '0 40px 32px' }}>
          <div style={{ background: V2.alt, padding: '20px 24px', position: 'relative' }}>
            <div className="paper-grain" style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }} />
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '180px 1fr', gap: 28 }}>
              <div style={{ fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.2em', color: acc, textTransform: 'uppercase' }}>
                Tipy &amp; pravidla
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {[
                  ['Pasmo IC karta', 'Pro tokijské metro a JR linky · dobít 5 000 ¥'],
                  ['Rezervace Shinkansen', 'JR Pass holders zdarma · rezervovat 30 dní předem'],
                  ['Tsushima trajekt', 'Beetle: check-in 60 min předem · pasport!'],
                ].map(([k, v], i) => (
                  <li key={i}>
                    <div style={{ fontFamily: V2.serif, fontSize: 15, color: V2.ink }}>{k}</div>
                    <div style={{ marginTop: 3, fontFamily: V2.mono, fontSize: 10.5, color: V2.ink3, letterSpacing: '0.04em' }}>{v}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </V2Host>
  );
}

Object.assign(window, { V2Schedule });
