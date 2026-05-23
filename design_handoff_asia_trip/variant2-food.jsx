// V2 — Restaurace (Food)
// Editorial mosaic: featured "must-try" card + masonry-ish grid of
// restaurants organised by city. Each card has photo, food type, price
// tier (¥/₩/$), must-try dish, opening hours, status (reservation needed?).

const FOOD = [
  // Featured
  { id: 'f1',  city: 'Tokyo',     name: 'Sukiyabashi Jiro',    kind: 'Sushi',           tier: '$$$$', dish: 'Omakase 20-kus · 25 000 ¥', when: 'Po-Pá · 11:30 / 17:30', mustGo: true, photo: PHOTOS.shibuya,  note: 'Rezervace 3 měsíce předem' },
  // Seoul
  { id: 'f2',  city: 'Seoul',     name: 'Gwangjang Market',    kind: 'Street food',     tier: '$',    dish: 'Bindaetteok · Hoe',         when: 'Denně · 09:00 — 22:00', mustGo: true, photo: PHOTOS.hanok,    note: 'Cash only · walk-in' },
  { id: 'f3',  city: 'Seoul',     name: 'Mingles',             kind: 'Korean fusion',   tier: '$$$$', dish: 'Tasting menu',              when: 'Út-So · 18:00',          mustGo: false, photo: PHOTOS.hanok,   note: 'Michelin ★★ · rez. nutná' },
  { id: 'f4',  city: 'Seoul',     name: 'Hadongkwan',          kind: 'Gomtang',         tier: '$$',   dish: 'Beef bone broth',           when: 'Denně · 11:00 — 21:00', mustGo: false, photo: PHOTOS.hanok,   note: '100 let stará legenda' },
  // Busan
  { id: 'f5',  city: 'Busan',     name: 'Jagalchi Market',     kind: 'Seafood',         tier: '$$',   dish: 'Vyber si rybu nahoře',      when: 'Denně · 05:00 — 22:00', mustGo: true, photo: PHOTOS.gamcheon, note: 'Druhé patro = jídelna' },
  { id: 'f6',  city: 'Busan',     name: 'Haedongchon',         kind: 'Korean BBQ',      tier: '$$$',  dish: 'Hovězí krk + soju',         when: 'Denně · 17:00 — pozdě', mustGo: false, photo: PHOTOS.gamcheon, note: '' },
  // Fukuoka
  { id: 'f7',  city: 'Fukuoka',   name: 'Ichiran Hakata',      kind: 'Ramen',           tier: '$',    dish: 'Tonkotsu ramen',            when: '24/7',                  mustGo: true, photo: PHOTOS.ramen,    note: 'Solo boxy · klasika' },
  { id: 'f8',  city: 'Fukuoka',   name: 'Yatai Tenjin',        kind: 'Street stánky',   tier: '$',    dish: 'Yakitori + ramen',          when: '18:00 — 02:00',         mustGo: false, photo: PHOTOS.ramen,   note: 'Otevřené, jdi po setmění' },
  // Hiroshima
  { id: 'f9',  city: 'Hiroshima', name: 'Okonomimura',         kind: 'Okonomiyaki',     tier: '$$',   dish: 'Hiroshima-yaki',            when: 'Denně · 11:00 — 24:00', mustGo: true, photo: PHOTOS.tokyo,    note: '20+ stánků v patrech' },
  // Kyoto
  { id: 'f10', city: 'Kyoto',     name: 'Nishiki Market',      kind: 'Tržnice',         tier: '$',    dish: 'Tako-tamago, soja, čaje',    when: 'Denně · 09:00 — 18:00', mustGo: true, photo: PHOTOS.bamboo,   note: '"Kjótská kuchyně" street' },
  { id: 'f11', city: 'Kyoto',     name: 'Ippodo Tea House',    kind: 'Matcha + sladké', tier: '$$',   dish: 'Matcha + wagashi',           when: 'Denně · 10:00 — 18:00', mustGo: false, photo: PHOTOS.bamboo,  note: 'Klid mezi turistikou' },
  { id: 'f12', city: 'Kyoto',     name: 'Sushi Iwa',           kind: 'Edomae sushi',    tier: '$$$$', dish: 'Omakase · 15 chodů',         when: 'Út-Ne · 18:00',          mustGo: false, photo: PHOTOS.bamboo,  note: 'Michelin ★ · rez.' },
  // Tokyo
  { id: 'f13', city: 'Tokyo',     name: 'Tsukiji Outer Mkt.',  kind: 'Snídaně + sushi', tier: '$$',   dish: 'Tamago + uni + maguro-don', when: 'Denně · 05:00 — 14:00', mustGo: true, photo: PHOTOS.tokyo,    note: 'Brzy ráno · žádné fronty' },
  { id: 'f14', city: 'Tokyo',     name: 'Tonkatsu Maisen',     kind: 'Tonkatsu',        tier: '$$',   dish: 'Kurobuta filet katsu',      when: 'Denně · 11:00 — 22:00', mustGo: false, photo: PHOTOS.tokyo,   note: 'Aoyama branch' },
];

function FoodCard({ r, palette, big = false }) {
  const acc = V2_PALETTES[palette].acc;
  const acc2 = V2_PALETTES[palette].acc2;
  return (
    <article style={{
      background: V2.panel, border: `1px solid ${V2.rule}`,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <Photo src={r.photo.id} alt={r.photo.alt} w={big ? 1000 : 400}
        style={{ aspectRatio: big ? '16/9' : '4/3', position: 'relative' }}
      >
        <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(20,16,12,.65)', color: '#f5ecd9',
                       padding: '3px 8px', fontFamily: V2.mono, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase',
                       backdropFilter: 'blur(4px)' }}>
          {r.city} · {r.kind}
        </div>
        {r.mustGo && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: acc, color: V2.bg,
                         padding: '3px 8px', fontFamily: V2.mono, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            ★ Must-try
          </div>
        )}
        <div style={{
          position: 'absolute', bottom: 10, right: 10,
          fontFamily: V2.serif, fontSize: big ? 14 : 12, color: '#f5ecd9',
          background: 'rgba(20,16,12,.55)', padding: '2px 7px',
          backdropFilter: 'blur(4px)',
        }}>
          {r.tier}
        </div>
      </Photo>

      <div style={{ padding: big ? '18px 22px' : '12px 14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h4 style={{ margin: 0, fontFamily: V2.serif, fontSize: big ? 26 : 17, lineHeight: 1.05, fontWeight: 400, color: V2.ink, letterSpacing: '-0.01em' }}>
          {r.name}
        </h4>
        <div style={{ marginTop: 4, fontFamily: V2.serif, fontStyle: 'italic', fontSize: big ? 14 : 12, color: V2.ink2 }}>
          {r.dish}
        </div>
        {r.note && (
          <div style={{ marginTop: 6, fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.04em', color: V2.ink3 }}>
            {r.note}
          </div>
        )}
        <div style={{
          marginTop: 'auto', paddingTop: 10,
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: V2.mono, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          <span style={{ color: V2.ink3 }}>{r.when}</span>
          <a href="#" style={{ marginLeft: 'auto', color: acc, textDecoration: 'none' }}>Mapa →</a>
        </div>
      </div>
    </article>
  );
}

function V2Food({ palette = 'shu' }) {
  const acc = V2_PALETTES[palette].acc;
  const cities = ['Seoul', 'Busan', 'Fukuoka', 'Hiroshima', 'Kyoto', 'Tokyo'];
  const cityCounts = Object.fromEntries(cities.map(c => [c, FOOD.filter(r => r.city === c).length]));
  const featured = FOOD[0];

  return (
    <V2Host palette={palette}>
      <V2Sidebar active="food" palette={palette} />

      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 40px', borderBottom: `1px solid ${V2.rule}`,
          fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.16em', color: V2.ink3, textTransform: 'uppercase',
        }}>
          <span>Sekce 05 · Restaurace &amp; jídlo</span>
          <span>{FOOD.length} míst · {FOOD.filter(r => r.mustGo).length} must-try</span>
        </div>

        <header style={{ padding: '36px 40px 28px', borderBottom: `1px solid ${V2.rule}`, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, alignItems: 'end' }}>
          <div>
            <div style={{ fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.2em', color: acc, textTransform: 'uppercase' }}>
              Tematická sekce — 05
            </div>
            <h1 style={{ margin: '12px 0 0', fontFamily: V2.serif, fontWeight: 400, fontSize: 72, lineHeight: 0.9, letterSpacing: '-0.025em' }}>
              Sto <span style={{ fontStyle: 'italic', color: acc }}>chutí</span> Asie.
            </h1>
          </div>
          <p style={{ margin: 0, fontFamily: V2.serif, fontStyle: 'italic', fontSize: 17, color: V2.ink2, lineHeight: 1.45 }}>
            Od pouličního pojang-macha v Soulu po Michelin sushi v Tokiu — místa, co stojí za zápis do deníku.
          </p>
        </header>

        {/* City tabs */}
        <div style={{ padding: '14px 40px', borderBottom: `1px solid ${V2.rule}`, display: 'flex', gap: 22, alignItems: 'center', fontFamily: V2.mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <button style={{
            padding: '6px 0', background: 'transparent', border: 'none',
            borderBottom: `2px solid ${acc}`,
            color: V2.ink, cursor: 'pointer',
            fontFamily: V2.mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>Vše · {FOOD.length}</button>
          {cities.map(c => (
            <button key={c} style={{
              padding: '6px 0', background: 'transparent', border: 'none',
              color: V2.ink3, cursor: 'pointer', borderBottom: '2px solid transparent',
              fontFamily: V2.mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>{c} · {cityCounts[c]}</button>
          ))}
          <span style={{ marginLeft: 'auto', color: acc }}>+ Nové místo</span>
        </div>

        {/* Featured */}
        <section style={{ padding: '28px 40px 0' }}>
          <FoodCard r={featured} palette={palette} big />
        </section>

        {/* By-city sections */}
        {cities.map(city => {
          const items = FOOD.filter(r => r.city === city && r.id !== featured.id);
          if (items.length === 0) return null;
          return (
            <section key={city} style={{ padding: '24px 40px 0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, paddingBottom: 12, borderBottom: `1px solid ${V2.rule}` }}>
                <h2 style={{ margin: 0, fontFamily: V2.serif, fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em' }}>
                  {city}
                </h2>
                <span style={{ fontFamily: V2.mono, fontSize: 10, color: V2.ink3, letterSpacing: '0.1em' }}>
                  {items.length} {items.length === 1 ? 'místo' : items.length < 5 ? 'místa' : 'míst'}
                </span>
                <span style={{ marginLeft: 'auto', fontFamily: V2.serif, fontStyle: 'italic', fontSize: 13, color: V2.ink3 }}>
                  {items.filter(r => r.mustGo).length} must-try
                </span>
              </div>
              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {items.map(r => <FoodCard key={r.id} r={r} palette={palette} />)}
              </div>
            </section>
          );
        })}

        <div style={{ height: 24 }} />
      </main>
    </V2Host>
  );
}

Object.assign(window, { V2Food });
