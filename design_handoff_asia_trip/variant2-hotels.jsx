// V2 — Ubytování (Hotels)
// Photo-led card grid: 1 featured hero hotel + 5 supporting cards in a 3-col
// magazine layout. Each card carries city tag, photo, dates, nights, price,
// rating, booking platform.

const HOTELS = [
  { id: 'h1', city: 'Seoul',     name: 'Hotel Granvia Seoul',     district: 'Jongno-gu',     nights: 5, dates: '4 — 9. 9.',   total: 18400, perNight: 3680, rating: 4.8, platform: 'Booking.com',  booked: true,  photo: PHOTOS.hanok,    note: '12 min od Gwangjang' },
  { id: 'h2', city: 'Busan',     name: 'Park Hyatt Busan',         district: 'Haeundae',      nights: 3, dates: '9 — 12. 9.',  total: 11800, perNight: 3933, rating: 4.7, platform: 'Hyatt přímá',  booked: true,  photo: PHOTOS.gamcheon, note: 'Výhled na zátoku' },
  { id: 'h3', city: 'Fukuoka',   name: 'Hotel Forza Hakata',       district: 'Hakata-ku',     nights: 1, dates: '13 — 14. 9.', total:  2400, perNight: 2400, rating: 4.5, platform: 'Booking.com',  booked: true,  photo: PHOTOS.ramen,    note: '4 min od Hakata station' },
  { id: 'h4', city: 'Hiroshima', name: 'Sheraton Grand Hiroshima', district: 'Higashi-ku',    nights: 1, dates: '14 — 15. 9.', total:  3200, perNight: 3200, rating: 4.6, platform: 'Marriott',     booked: false, photo: PHOTOS.tokyo,    note: 'Hledám alternativy' },
  { id: 'h5', city: 'Kyoto',     name: 'Ryokan Genhouin',          district: 'Higashiyama',   nights: 4, dates: '15 — 19. 9.', total: 24600, perNight: 6150, rating: 4.9, platform: 'Přímá rezervace', booked: true, photo: PHOTOS.bamboo,   note: 'Tradiční ryokan s onsen' },
  { id: 'h6', city: 'Tokyo',     name: 'Park Hyatt Tokyo',         district: 'Shinjuku',      nights: 7, dates: '19 — 26. 9.', total: 38200, perNight: 5457, rating: 4.9, platform: 'Hyatt přímá',  booked: false, photo: PHOTOS.shibuya,  note: 'Čekací listina · zaplaceno depo' },
];

function HotelCard({ h, palette, featured = false }) {
  const acc = V2_PALETTES[palette].acc;
  const acc2 = V2_PALETTES[palette].acc2;
  return (
    <article style={{
      background: V2.panel, border: `1px solid ${V2.rule}`,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <Photo src={h.photo.id} alt={h.photo.alt} w={featured ? 1000 : 500}
        style={{
          aspectRatio: featured ? '16/9' : '4/3',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(20,16,12,.65)', color: '#f5ecd9',
                       padding: '4px 9px', fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
                       backdropFilter: 'blur(4px)' }}>
          {h.city} · {h.nights} {h.nights === 1 ? 'noc' : h.nights < 5 ? 'noci' : 'nocí'}
        </div>
        {featured && (
          <div style={{ position: 'absolute', top: 12, right: 12, background: acc, color: V2.bg,
                         padding: '4px 9px', fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            Hlavní pobyt
          </div>
        )}
      </Photo>

      <div style={{ padding: featured ? '20px 24px' : '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <h3 style={{
            margin: 0, fontFamily: V2.serif, fontSize: featured ? 28 : 20, lineHeight: 1.05,
            fontWeight: 400, letterSpacing: '-0.01em', color: V2.ink,
          }}>
            {h.name}
          </h3>
          <span style={{ fontFamily: V2.mono, fontSize: 11, color: V2.ink2, letterSpacing: '0.02em' }}>
            ★ {h.rating}
          </span>
        </div>
        <div style={{ marginTop: 4, fontFamily: V2.serif, fontStyle: 'italic', fontSize: featured ? 14 : 13, color: V2.ink3 }}>
          {h.district} · {h.note}
        </div>

        <div style={{
          marginTop: 14, paddingTop: 12, borderTop: `1px solid ${V2.rule}`,
          display: 'grid', gridTemplateColumns: featured ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)', gap: 10,
        }}>
          {[
            { k: 'Datum',       v: h.dates },
            { k: 'Cena celkem', v: h.total.toLocaleString('cs') + ' Kč' },
            { k: 'Za noc',      v: h.perNight.toLocaleString('cs') + ' Kč' },
            ...(featured ? [{ k: 'Platforma', v: h.platform }] : []),
          ].map((kv, i) => (
            <div key={i}>
              <div style={{ fontFamily: V2.mono, fontSize: 9, letterSpacing: '0.14em', color: V2.ink3, textTransform: 'uppercase' }}>{kv.k}</div>
              <div style={{ marginTop: 3, fontFamily: V2.serif, fontSize: featured ? 16 : 14, color: V2.ink }}>{kv.v}</div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 'auto', paddingTop: 12,
          display: 'flex', alignItems: 'center', gap: 12,
          fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          <span style={{ color: h.booked ? acc2 : V2.ink3 }}>
            {h.booked ? '● Rezervováno' : '○ Plánuju'}
          </span>
          {!featured && (
            <span style={{ color: V2.ink3 }}>{h.platform}</span>
          )}
          <a href="#" style={{ marginLeft: 'auto', color: acc, textDecoration: 'none' }}>Detail →</a>
        </div>
      </div>
    </article>
  );
}

function V2Hotels({ palette = 'shu' }) {
  const acc = V2_PALETTES[palette].acc;
  const totalNights = HOTELS.reduce((s, h) => s + h.nights, 0);
  const totalCost = HOTELS.reduce((s, h) => s + h.total, 0);
  const bookedCount = HOTELS.filter(h => h.booked).length;
  const [featured, ...rest] = HOTELS;

  return (
    <V2Host palette={palette}>
      <V2Sidebar active="hotels" palette={palette} />

      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 40px', borderBottom: `1px solid ${V2.rule}`,
          fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.16em', color: V2.ink3, textTransform: 'uppercase',
        }}>
          <span>Sekce 03 · Ubytování</span>
          <span>{HOTELS.length} ubytování · {totalNights} nocí · {bookedCount} rezervováno</span>
        </div>

        <header style={{ padding: '36px 40px 28px', borderBottom: `1px solid ${V2.rule}`, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, alignItems: 'end' }}>
          <div>
            <div style={{ fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.2em', color: acc, textTransform: 'uppercase' }}>
              Tematická sekce — 03
            </div>
            <h1 style={{ margin: '12px 0 0', fontFamily: V2.serif, fontWeight: 400, fontSize: 72, lineHeight: 0.9, letterSpacing: '-0.025em' }}>
              Šest <span style={{ fontStyle: 'italic', color: acc }}>postelí</span>, šest měst.
            </h1>
          </div>
          <p style={{ margin: 0, fontFamily: V2.serif, fontStyle: 'italic', fontSize: 17, color: V2.ink2, lineHeight: 1.45 }}>
            Mix moderního a tradičního: korejské hotely v Soulu a Busanu, ryokan v Kjótu, Park Hyatt v Tokiu jako finále.
          </p>
        </header>

        {/* Filter / stats strip */}
        <div style={{ padding: '20px 40px', borderBottom: `1px solid ${V2.rule}`, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          {[
            { k: 'Nocí celkem',  v: totalNights,                                             n: '23 dní cesty' },
            { k: 'Cena celkem',  v: totalCost.toLocaleString('cs') + ' Kč',                  n: 'předběžné odhady' },
            { k: 'Průměrně/noc', v: Math.round(totalCost / totalNights).toLocaleString('cs') + ' Kč', n: 'včetně ryokanu' },
            { k: 'Stav',         v: `${bookedCount} / ${HOTELS.length}`,                     n: 'rezervováno' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.16em', color: V2.ink3, textTransform: 'uppercase' }}>{s.k}</div>
              <div style={{ marginTop: 6, fontFamily: V2.serif, fontSize: 28, color: V2.ink, lineHeight: 1, fontWeight: 400 }}>{s.v}</div>
              <div style={{ marginTop: 4, fontFamily: V2.serif, fontStyle: 'italic', fontSize: 12, color: V2.ink3 }}>{s.n}</div>
            </div>
          ))}
        </div>

        {/* Featured + grid */}
        <section style={{ padding: '28px 40px 36px' }}>
          {/* Featured (Park Hyatt Tokyo as the climax — actually let's use the longest stay) */}
          <HotelCard h={featured} palette={palette} featured />

          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {rest.map(h => <HotelCard key={h.id} h={h} palette={palette} />)}
          </div>
        </section>
      </main>
    </V2Host>
  );
}

Object.assign(window, { V2Hotels });
