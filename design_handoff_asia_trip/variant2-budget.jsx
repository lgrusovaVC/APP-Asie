// V2 — Rozpočet (Budget)
// Editorial money page: big hero number, SVG donut for category split,
// per-city stacked bar, and a chronological spending log.

const BUDGET = {
  total: 125000,
  spent: 47200,
  currency: 'Kč',
  categories: [
    { id: 'flights',    name: 'Letenky',     spent: 28400, budget: 30000, color: 'acc' },
    { id: 'hotels',     name: 'Ubytování',   spent: 14200, budget: 48000, color: 'acc2' },
    { id: 'activities', name: 'Aktivity',    spent:  4600, budget: 12000, color: 'ink' },
    { id: 'transport',  name: 'Doprava',     spent:     0, budget: 17600, color: 'ink2' },
    { id: 'food',       name: 'Jídlo',       spent:     0, budget: 14400, color: 'ink3' },
    { id: 'misc',       name: 'Ostatní',     spent:     0, budget:  3000, color: 'rule' },
  ],
  byCity: [
    { city: 'Soul',      budget: 18000, spent: 12200 },
    { city: 'Busan',     budget: 14000, spent:  6800 },
    { city: 'Fukuoka',   budget:  5000, spent:  3400 },
    { city: 'Hiroshima', budget:  5000, spent:  3200 },
    { city: 'Kyoto',     budget: 28000, spent: 14400 },
    { city: 'Tokyo',     budget: 55000, spent:  7200 },
  ],
  log: [
    { date: 'Po 19. 5.',  what: 'Letenky KLM + Korean Air (zpáteční, 2×)', cat: 'Letenky',   amount: 28400 },
    { date: 'St 21. 5.',  what: 'Hotel Granvia Seoul · 5 nocí',             cat: 'Ubytování', amount:  9200 },
    { date: 'Čt 22. 5.',  what: 'Hotel Granvia Seoul · druhá platba',       cat: 'Ubytování', amount:  9200 },
    { date: 'Pá 23. 5.',  what: 'DMZ tour rezervace',                       cat: 'Aktivity',  amount:  2800 },
    { date: 'Ne 25. 5.',  what: 'teamLab Planets · 2× lístek',              cat: 'Aktivity',  amount:  1800 },
  ],
};

function Donut({ items, palette, size = 220, stroke = 28, accents }) {
  const total = items.reduce((s, i) => s + i.spent, 0);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <g transform={`translate(${size/2} ${size/2}) rotate(-90)`}>
        <circle r={r} fill="none" stroke={V2.rule} strokeWidth={stroke} />
        {items.map((it, i) => {
          if (it.spent <= 0) return null;
          const portion = it.spent / total;
          const length = portion * c;
          const seg = (
            <circle
              key={i}
              r={r} fill="none"
              stroke={accents[it.color] || V2.ink}
              strokeWidth={stroke}
              strokeDasharray={`${length} ${c}`}
              strokeDashoffset={-offset}
            />
          );
          offset += length;
          return seg;
        })}
      </g>
      <text x={size/2} y={size/2 - 6} textAnchor="middle"
        fontFamily="'Instrument Serif', 'Newsreader', serif" fontSize="36" fill={V2.ink} fontWeight="400">
        38%
      </text>
      <text x={size/2} y={size/2 + 16} textAnchor="middle"
        fontFamily="'DM Mono', monospace" fontSize="9" letterSpacing="2" fill={V2.ink3}>
        UTRACENO
      </text>
    </svg>
  );
}

function V2Budget({ palette = 'shu' }) {
  const acc = V2_PALETTES[palette].acc;
  const acc2 = V2_PALETTES[palette].acc2;
  const accents = {
    acc:   acc,
    acc2:  acc2,
    ink:   V2.ink,
    ink2:  V2.ink2,
    ink3:  V2.ink3,
    rule:  V2.rule,
  };

  const pct = Math.round((BUDGET.spent / BUDGET.total) * 100);
  const remaining = BUDGET.total - BUDGET.spent;
  const cityMax = Math.max(...BUDGET.byCity.map(c => c.budget));

  return (
    <V2Host palette={palette}>
      <V2Sidebar active="budget" palette={palette} />

      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 40px', borderBottom: `1px solid ${V2.rule}`,
          fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.16em', color: V2.ink3, textTransform: 'uppercase',
        }}>
          <span>Sekce 07 · Rozpočet</span>
          <span>{BUDGET.spent.toLocaleString('cs')} / {BUDGET.total.toLocaleString('cs')} Kč · {pct}% utraceno</span>
        </div>

        <header style={{ padding: '36px 40px 28px', borderBottom: `1px solid ${V2.rule}`, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, alignItems: 'end' }}>
          <div>
            <div style={{ fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.2em', color: acc, textTransform: 'uppercase' }}>
              Tematická sekce — 07
            </div>
            <h1 style={{ margin: '12px 0 0', fontFamily: V2.serif, fontWeight: 400, fontSize: 72, lineHeight: 0.9, letterSpacing: '-0.025em' }}>
              Sto dvacet pět <span style={{ fontStyle: 'italic', color: acc }}>tisíc</span>.
            </h1>
          </div>
          <p style={{ margin: 0, fontFamily: V2.serif, fontStyle: 'italic', fontSize: 17, color: V2.ink2, lineHeight: 1.45 }}>
            Strop na celé tři týdny. Letenky a Tokio uberou nejvíc — Korea + japonský venkov drží náklady nízko.
          </p>
        </header>

        {/* Hero: big number + donut + key stats */}
        <section style={{ padding: '32px 40px', borderBottom: `1px solid ${V2.rule}`, display: 'grid', gridTemplateColumns: '1.2fr 220px 1fr', gap: 36, alignItems: 'center' }}>
          {/* Big number */}
          <div>
            <div style={{ fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.2em', color: V2.ink3, textTransform: 'uppercase' }}>
              Utraceno k 22. 5. 2026
            </div>
            <div style={{ marginTop: 8, fontFamily: V2.serif, fontWeight: 300, fontSize: 110, lineHeight: 0.85, color: V2.ink, letterSpacing: '-0.04em' }}>
              {BUDGET.spent.toLocaleString('cs')}
              <span style={{ fontSize: 32, color: V2.ink3, marginLeft: 8, fontFamily: V2.mono, letterSpacing: '0.02em' }}>Kč</span>
            </div>
            <div style={{ marginTop: 14, fontFamily: V2.serif, fontStyle: 'italic', fontSize: 16, color: V2.ink2 }}>
              ze stropu {BUDGET.total.toLocaleString('cs')} Kč · zbývá {remaining.toLocaleString('cs')} Kč
            </div>
            {/* Wide thin progress */}
            <div style={{ marginTop: 22, height: 6, background: V2.rule, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: acc }} />
              <div style={{ position: 'absolute', top: -22, left: `${pct}%`, transform: 'translateX(-50%)',
                            fontFamily: V2.mono, fontSize: 10, color: acc, letterSpacing: '0.06em' }}>
                {pct}%
              </div>
            </div>
          </div>

          {/* Donut */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Donut items={BUDGET.categories} palette={palette} accents={accents} />
          </div>

          {/* Legend */}
          <div>
            <div style={{ fontFamily: V2.serif, fontSize: 18, fontWeight: 400, marginBottom: 12 }}>
              Podle <span style={{ fontStyle: 'italic' }}>kategorií</span>
            </div>
            {BUDGET.categories.map((cat, i) => (
              <div key={cat.id} style={{
                display: 'grid', gridTemplateColumns: '12px 1fr auto',
                gap: 10, alignItems: 'center',
                padding: '7px 0', borderTop: i > 0 ? `1px solid ${V2.rule}` : 'none',
              }}>
                <span style={{ width: 10, height: 10, background: accents[cat.color] || V2.ink, borderRadius: 0 }} />
                <span style={{ fontFamily: V2.serif, fontSize: 14, color: V2.ink }}>{cat.name}</span>
                <span style={{ fontFamily: V2.mono, fontSize: 11, color: V2.ink2 }}>
                  {cat.spent.toLocaleString('cs')} <span style={{ color: V2.ink3 }}>/ {cat.budget.toLocaleString('cs')}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Per-city + log */}
        <section style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', borderBottom: `1px solid ${V2.rule}` }}>
          {/* Per-city stacked bar */}
          <div style={{ padding: '28px 32px', borderRight: `1px solid ${V2.rule}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontFamily: V2.serif, fontSize: 24, fontWeight: 400 }}>
                Podle <span style={{ fontStyle: 'italic' }}>měst</span>
              </h2>
              <span style={{ fontFamily: V2.mono, fontSize: 11, color: V2.ink3, letterSpacing: '0.06em' }}>
                Celkem {BUDGET.byCity.reduce((s, c) => s + c.budget, 0).toLocaleString('cs')} Kč
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {BUDGET.byCity.map(c => {
                const wBudget = (c.budget / cityMax) * 100;
                const wSpent = (c.spent / c.budget) * wBudget;
                return (
                  <div key={c.city}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                      <span style={{ fontFamily: V2.serif, fontSize: 15, color: V2.ink }}>{c.city}</span>
                      <span style={{ fontFamily: V2.mono, fontSize: 11, color: V2.ink2 }}>
                        <span style={{ color: V2.ink }}>{c.spent.toLocaleString('cs')}</span>
                        <span style={{ color: V2.ink3 }}> / {c.budget.toLocaleString('cs')} Kč</span>
                      </span>
                    </div>
                    <div style={{ height: 10, background: V2.rule, position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${wBudget}%`, background: V2.alt }} />
                      <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${wSpent}%`, background: acc }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent log */}
          <div style={{ padding: '28px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontFamily: V2.serif, fontSize: 24, fontWeight: 400 }}>
                Poslední <span style={{ fontStyle: 'italic' }}>výdaje</span>
              </h2>
              <a href="#" style={{ fontFamily: V2.mono, fontSize: 11, color: acc, textDecoration: 'none', letterSpacing: '0.1em' }}>VŠE →</a>
            </div>
            {BUDGET.log.map((row, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '76px 1fr auto',
                gap: 14, alignItems: 'baseline',
                padding: '12px 0', borderTop: `1px solid ${V2.rule}`,
              }}>
                <div style={{ fontFamily: V2.mono, fontSize: 11, color: V2.ink3, letterSpacing: '0.04em' }}>{row.date}</div>
                <div>
                  <div style={{ fontSize: 14, color: V2.ink }}>{row.what}</div>
                  <div style={{ marginTop: 2, fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.14em', color: V2.ink3, textTransform: 'uppercase' }}>{row.cat}</div>
                </div>
                <div style={{ fontFamily: V2.serif, fontSize: 18, color: V2.ink }}>
                  {row.amount.toLocaleString('cs')} <span style={{ fontSize: 12, color: V2.ink3 }}>Kč</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Forecast note */}
        <section style={{ padding: '24px 40px 32px' }}>
          <div style={{ background: V2.alt, padding: '20px 24px', position: 'relative' }}>
            <div className="paper-grain" style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }} />
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: 28, alignItems: 'center' }}>
              <div style={{ fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.2em', color: acc, textTransform: 'uppercase' }}>
                Předpověď
              </div>
              <p style={{ margin: 0, fontFamily: V2.serif, fontStyle: 'italic', fontSize: 17, color: V2.ink, lineHeight: 1.4 }}>
                Při průměrných výdajích by zbylo cca 14&nbsp;200&nbsp;Kč rezerva — místo na ryokan upgrade v Hakone nebo extra omakase v Tokiu.
              </p>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: V2.serif, fontSize: 36, color: V2.ink, lineHeight: 1, fontWeight: 400 }}>+14 200 Kč</div>
                <div style={{ marginTop: 4, fontFamily: V2.mono, fontSize: 10, letterSpacing: '0.14em', color: V2.ink3, textTransform: 'uppercase' }}>rezerva</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </V2Host>
  );
}

Object.assign(window, { V2Budget });
