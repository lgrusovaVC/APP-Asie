// V2 — Letenky (Flights)
// Boarding-pass-meets-magazine layout. Two flight blocks (outbound + return)
// with big airport codes, times, route line + plane SVG, then a fold-line
// of metadata (flight numbers, baggage, seat, price, status).

const FLIGHTS = [
  {
    id: 'out',
    label: 'Odlet',
    glyph: '→',
    from: { city: 'Praha',  code: 'PRG', time: '13:50', date: 'Pá 4. 9.',     full: 'Václav Havel · T2' },
    to:   { city: 'Seoul',  code: 'ICN', time: '11:25', date: 'So 5. 9. ⁺¹', full: 'Incheon · T1' },
    stops: [{ city: 'Amsterdam', code: 'AMS', layover: '2h 10' }],
    airline: 'KLM + Korean Air',
    flights: 'KL 1844 · KE 906',
    duration: '14h 35m',
    bags: '2 × 23 kg',
    seat: '28A · 32C',
    price: '14 200 Kč',
    status: 'Rezervováno',
    booked: true,
    photo: PHOTOS.shibuya,
  },
  {
    id: 'ret',
    label: 'Návrat',
    glyph: '←',
    from: { city: 'Tokyo',  code: 'HND', time: '11:40', date: 'Ne 27. 9.', full: 'Haneda · T3' },
    to:   { city: 'Praha',  code: 'PRG', time: '21:00', date: 'Ne 27. 9.', full: 'Václav Havel · T2' },
    stops: [{ city: 'Amsterdam', code: 'AMS', layover: '1h 30' }],
    airline: 'KLM + KLM',
    flights: 'KL 862 · KL 1755',
    duration: '17h 20m',
    bags: '2 × 23 kg',
    seat: 'TBD',
    price: '14 200 Kč',
    status: 'Rezervováno',
    booked: true,
    photo: PHOTOS.tokyo,
  },
];

function PlaneArc({ color = 'currentColor', flip = false }) {
  // Tiny abstract "route arc" with a plane glyph in the middle.
  return (
    <svg viewBox="0 0 200 36" width="100%" height="36" preserveAspectRatio="none" style={{ display: 'block' }}>
      <path d="M 6 28 Q 100 -6, 194 28" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 4" />
      <circle cx="6" cy="28" r="2.5" fill={color} />
      <circle cx="194" cy="28" r="2.5" fill={color} />
      <text x="100" y="14" textAnchor="middle" fontFamily="serif" fontSize="14" fill={color}
            transform={flip ? 'rotate(180 100 14)' : ''}>✈</text>
    </svg>
  );
}

function FlightCard({ f, palette }) {
  const acc = V2_PALETTES[palette].acc;
  return (
    <article style={{
      border: `1px solid ${V2.rule}`, background: V2.panel,
      display: 'grid', gridTemplateColumns: '280px 1fr',
      overflow: 'hidden',
    }}>
      {/* Left: photo banner with label sticker */}
      <Photo src={f.photo.id} alt={f.photo.alt} w={600}
        style={{ position: 'relative', minHeight: 280 }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,16,12,.55) 0%, rgba(20,16,12,0) 50%, rgba(20,16,12,.6) 100%)' }} />
        <div style={{ position: 'absolute', top: 16, left: 16 }}>
          <div style={{ background: acc, color: V2.bg, padding: '4px 10px', fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            {f.label}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 16, left: 16, fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.16em', color: '#f5ecd9', textTransform: 'uppercase' }}>
          {f.from.code} {f.glyph} {f.to.code}
        </div>
      </Photo>

      {/* Right: ticket content */}
      <div style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column' }}>
        {/* Times + codes header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 1fr', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontFamily: V2.serif, fontSize: 44, lineHeight: 0.95, fontWeight: 400, color: V2.ink, letterSpacing: '-0.02em' }}>
              {f.from.time}
            </div>
            <div style={{ marginTop: 4, fontFamily: V2.mono, fontSize: 11, color: V2.ink2, letterSpacing: '0.08em' }}>
              {f.from.code} · {f.from.city}
            </div>
            <div style={{ marginTop: 2, fontFamily: V2.serif, fontStyle: 'italic', fontSize: 12, color: V2.ink3 }}>
              {f.from.date}
            </div>
          </div>

          <div style={{ textAlign: 'center', color: acc }}>
            <PlaneArc color={acc} flip={f.id === 'ret'} />
            <div style={{ marginTop: 6, fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.1em', color: V2.ink2 }}>
              {f.duration}
            </div>
            <div style={{ marginTop: 2, fontFamily: V2.mono, fontSize: 9, letterSpacing: '0.06em', color: V2.ink3 }}>
              {f.stops.length === 0 ? 'Přímý let' : `${f.stops.length}× přestup`}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: V2.serif, fontSize: 44, lineHeight: 0.95, fontWeight: 400, color: V2.ink, letterSpacing: '-0.02em' }}>
              {f.to.time}
            </div>
            <div style={{ marginTop: 4, fontFamily: V2.mono, fontSize: 11, color: V2.ink2, letterSpacing: '0.08em' }}>
              {f.to.code} · {f.to.city}
            </div>
            <div style={{ marginTop: 2, fontFamily: V2.serif, fontStyle: 'italic', fontSize: 12, color: V2.ink3 }}>
              {f.to.date}
            </div>
          </div>
        </div>

        {/* Airports + stops */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 1fr', alignItems: 'baseline', gap: 12, marginTop: 6, fontSize: 11, color: V2.ink3 }}>
          <div style={{ fontFamily: V2.mono, letterSpacing: '0.04em' }}>{f.from.full}</div>
          <div style={{ fontFamily: V2.mono, fontSize: 10, textAlign: 'center' }}>via {f.stops.map(s => s.code).join(', ')}</div>
          <div style={{ fontFamily: V2.mono, letterSpacing: '0.04em', textAlign: 'right' }}>{f.to.full}</div>
        </div>

        {/* "Tear line" + ticket footer */}
        <div style={{
          marginTop: 'auto', paddingTop: 18,
          borderTop: `1px dashed ${V2.rule}`,
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14,
        }}>
          {[
            { l: 'Letenky',  v: f.flights },
            { l: 'Letecké', v: f.airline },
            { l: 'Zavazadla', v: f.bags },
            { l: 'Sedadla',  v: f.seat },
            { l: 'Cena',     v: f.price },
          ].map((kv, i) => (
            <div key={i}>
              <div style={{ fontFamily: V2.mono, fontSize: 9, letterSpacing: '0.16em', color: V2.ink3, textTransform: 'uppercase' }}>{kv.l}</div>
              <div style={{ marginTop: 4, fontFamily: V2.serif, fontSize: 14, color: V2.ink }}>{kv.v}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${V2.rule}`, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{
            padding: '4px 9px', fontFamily: V2.mono, fontSize: 10,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            background: acc, color: V2.bg,
          }}>
            ● {f.status}
          </span>
          <span style={{ fontFamily: V2.mono, fontSize: 10, color: V2.ink3, letterSpacing: '0.06em' }}>
            Booking #KE26-{f.id.toUpperCase()}047 · uloženo v Apple Wallet
          </span>
          <a href="#" style={{ marginLeft: 'auto', fontFamily: V2.mono, fontSize: 10, color: acc, textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Otevřít →
          </a>
        </div>
      </div>
    </article>
  );
}

function V2Flights({ palette = 'shu' }) {
  const acc = V2_PALETTES[palette].acc;
  return (
    <V2Host palette={palette}>
      <V2Sidebar active="flights" palette={palette} />

      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 40px', borderBottom: `1px solid ${V2.rule}`,
          fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.16em', color: V2.ink3, textTransform: 'uppercase',
        }}>
          <span>Sekce 02 · Letenky</span>
          <span>2 lety · 31h 55m ve vzduchu · 28 400 Kč</span>
        </div>

        <header style={{ padding: '36px 40px 28px', borderBottom: `1px solid ${V2.rule}`, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, alignItems: 'end' }}>
          <div>
            <div style={{ fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.2em', color: acc, textTransform: 'uppercase' }}>
              Tematická sekce — 02
            </div>
            <h1 style={{ margin: '12px 0 0', fontFamily: V2.serif, fontWeight: 400, fontSize: 72, lineHeight: 0.9, letterSpacing: '-0.025em' }}>
              Z Prahy <span style={{ fontStyle: 'italic', color: acc }}>a zpátky</span>.
            </h1>
          </div>
          <p style={{ margin: 0, fontFamily: V2.serif, fontStyle: 'italic', fontSize: 17, color: V2.ink2, lineHeight: 1.45 }}>
            Dva lety přes Amsterdam. Příchod v Soulu odpoledne, návrat z Tokia ten samý den, jen o devět&nbsp;hodin pozadu.
          </p>
        </header>

        {/* Quick stats */}
        <div style={{ padding: '20px 40px', borderBottom: `1px solid ${V2.rule}`, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          {[
            { k: 'Lety',         v: '2 / 2',     n: 'rezervováno' },
            { k: 'Ve vzduchu',   v: '31 h 55',   n: 'KLM + KE' },
            { k: 'Přestupy',     v: '2',         n: 'AMS na obě strany' },
            { k: 'Cena celkem',  v: '28 400 Kč', n: 'pro dva' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.16em', color: V2.ink3, textTransform: 'uppercase' }}>{s.k}</div>
              <div style={{ marginTop: 6, fontFamily: V2.serif, fontSize: 28, color: V2.ink, lineHeight: 1, fontWeight: 400 }}>{s.v}</div>
              <div style={{ marginTop: 4, fontFamily: V2.serif, fontStyle: 'italic', fontSize: 12, color: V2.ink3 }}>{s.n}</div>
            </div>
          ))}
        </div>

        {/* Flight cards */}
        <section style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {FLIGHTS.map(f => <FlightCard key={f.id} f={f} palette={palette} />)}
        </section>

        {/* Reminders */}
        <section style={{ padding: '0 40px 32px' }}>
          <div style={{ background: V2.alt, padding: '20px 24px', position: 'relative' }}>
            <div className="paper-grain" style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }} />
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '180px 1fr', gap: 28, alignItems: 'baseline' }}>
              <div style={{ fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.2em', color: acc, textTransform: 'uppercase' }}>
                Připomenutí
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {[
                  ['Online check-in', '24 h před odletem · KLM app'],
                  ['Pasport', 'Platnost ≥ 6 měsíců, do března 2027'],
                  ['ESTA / K-ETA', 'Korea: K-ETA podáno (✓), Japan: visa-free'],
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

Object.assign(window, { V2Flights });
