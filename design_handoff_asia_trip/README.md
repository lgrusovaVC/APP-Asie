# Handoff: Asia Trip Planner — Korea &amp; Japan 2026

## Overview

A personal travel planning web app for a 23-day trip through Korea and Japan (Seoul → Busan → Fukuoka → Hiroshima → Kyoto → Tokyo, September 4 — 27, 2026). Seven main screens: Dashboard, Flights, Hotels, Places, Restaurants, Train schedules, Budget. Personal-use tool (single user), no auth, no multi-trip support.

## About the Design Files

The files in this bundle are **design references created in HTML** — high-fidelity prototypes showing the intended look, content structure, and interactive feel. They are **not production code to ship**.

The task is to **recreate these designs in the target codebase**:

- If a stack already exists, use its established patterns (React/Next.js with Tailwind, Vue, SvelteKit, SwiftUI, etc.).
- If starting from scratch, recommended: **Next.js + Tailwind + TypeScript**, or **Astro** if mostly static. Personal-use, so SSR and DB are optional — flat JSON or local storage is fine for the data model below.

The HTML prototypes use React 18 via UMD + Babel inline (compile-on-the-fly) — that approach is for design iteration speed only and **must not** be carried into production.

## Fidelity

**High-fidelity.** All colors, typography, spacing, photography placement, and component composition are intentional and finalized. Recreate pixel-perfectly within the chosen framework's conventions.

Interactions are illustrative — they do not need to work in the prototype, but the README below specifies the intended behavior for each screen and the data model.

---

## Design system

### Colors

Two layers: **paper / ink** (background and content) and **palette accent** (the Sumi & Shu palette is selected; the others are optional themes already supported in the prototype).

#### Paper &amp; ink

| Token       | Hex       | Use                                              |
|-------------|-----------|--------------------------------------------------|
| paper       | `#faf6ee` | Page background (warm cream)                     |
| panel       | `#ffffff` | Card / panel surfaces (light contrast on paper)  |
| alt         | `#f1ead9` | Tinted band / muted surface (notes, callouts)    |
| ink         | `#1c1815` | Primary text, headlines                          |
| ink-2       | `#3e3830` | Secondary text, italic body                      |
| ink-3       | `#857c70` | Muted text, meta, mono labels                    |
| rule        | `#dccfb6` | Hairlines, dividers, table rules                 |

#### Accent palette: 朱 Sumi &amp; Shu (selected)

| Token              | Hex       | Use                                                   |
|--------------------|-----------|-------------------------------------------------------|
| sidebar-bg         | `#2a2522` | Sidebar (warm sumi-walnut, not black)                 |
| sidebar-text       | `#f5ecd9` | Sidebar primary text                                  |
| sidebar-muted      | `rgba(245,236,217,.55)` | Sidebar muted text                       |
| sidebar-rule       | `rgba(245,236,217,.1)`  | Sidebar dividers                         |
| sidebar-accent     | `#e9614f` | Active marker / numbered tab marker in sidebar        |
| accent (primary)   | `#cf3a2a` | **Vermilion** — primary accent, used sparingly        |
| accent-2 (secondary)| `#cf3a2a` | Secondary accent (same in Shu palette; differs in Ai/Pine) |

#### Other palettes (optional themes already supported)

- **藍 Ai &amp; Shu** — `sidebar-bg #1d2c4a` (indigo), `accent #cf3a2a` (vermilion), `accent-2 #3e5c8c`
- **松 Pine &amp; Celadon** — `sidebar-bg #28332c` (pine), `accent #6b9079` (celadon), `accent-2 #b54a35`

### Typography

Three families, all from Google Fonts:

| Family             | Use                                       | Weights used         |
|--------------------|-------------------------------------------|----------------------|
| **Instrument Serif** | Display headlines, big numbers, italic emphasis. Drop-cap-style 56–110px sizes. | 400 regular + italic |
| **Newsreader**     | Secondary serif (V1 Hanji variant, italics). Fallback for Instrument Serif. | 300–600 + italics |
| **DM Sans**        | Body text, UI labels, buttons.            | 400, 500, 600        |
| **DM Mono**        | Meta labels, monos (dates, codes, captions, all-caps masthead bands). | 400, 500 |

```css
@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..500&family=DM+Sans:opsz,wght@9..40,300..700&family=DM+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap');
```

**Typographic patterns:**
- **Hero headlines:** Instrument Serif 64–88px, weight 400, line-height 0.9, letter-spacing −0.025em. Italic word inside, colored with `accent`.
- **Section H1:** Instrument Serif 56–72px, weight 400, line-height 0.9, italic emphasis.
- **Section H2:** Instrument Serif 22–28px, weight 400, with secondary italic sub-text.
- **Body:** DM Sans 13–15px, line-height 1.45.
- **Italic body:** Instrument Serif italic 15–17px, used for editorial captions and descriptive paragraphs.
- **Meta / labels:** DM Mono 9–11px, letter-spacing 0.16–0.22em, all-caps, color `ink-3`.
- **Big numbers:** Instrument Serif 36–110px, weight 300 or 400.

### Spacing &amp; layout

- Page outer padding: `40px` horizontal, `28–36px` vertical at section boundaries.
- Card padding: `16–22px`.
- Card grid gaps: `14–24px`.
- Hairline rules everywhere — `1px solid rule`. No box-shadows. No rounded corners (everything is sharp 0 radius — editorial feel).

### Other tokens

| Token       | Value                   |
|-------------|-------------------------|
| border-radius | `0` (sharp corners everywhere) |
| shadow      | None used.              |
| transitions | None used in prototype. If adding: ≤200ms ease for hover, ≤300ms ease-out for content. |

### Paper texture (subtle decoration)

A subtle dotted-pattern overlay used on cream-tinted cards/sections:

```css
.paper-grain {
  background-image:
    radial-gradient(rgba(120,90,60,.05) 1px, transparent 1.2px),
    radial-gradient(rgba(80,50,30,.04) 1px, transparent 1.4px);
  background-size: 3px 3px, 7px 7px;
  background-position: 0 0, 1px 2px;
  opacity: 0.4–0.5; /* per context */
}
```

Applied as an absolute-positioned overlay div on tinted panels (V2.alt background).

---

## Layout shell

Every screen shares:

```
┌───────────┬───────────────────────────────────────────────┐
│           │  Masthead band (DM Mono, 12px 40px)           │
│           ├───────────────────────────────────────────────┤
│  Sidebar  │  Page header (36px 40px 28px)                 │
│  210px    ├───────────────────────────────────────────────┤
│           │  Filter / stats strip (optional)              │
│           ├───────────────────────────────────────────────┤
│           │  Main content (varies per screen)             │
│           ├───────────────────────────────────────────────┤
│           │  Footer band / running data (optional)        │
└───────────┴───────────────────────────────────────────────┘
```

### Sidebar (`width: 210px`)

- Background `#2a2522`, color `#f5ecd9`.
- Top block (padding 0 22px 26px):
  - Tiny mono cap: `№ 01 · ATLAS` in `accent` color.
  - Inline glyph (right): `朱` (or palette glyph) in serif 16px, color `accent`.
  - Brand: "Korea" + "& Japonsko" (italic) in Instrument Serif 26px, line-height 0.95.
  - Sub-line: `IX — X · MMXXVI` in DM Mono 10px, letter-spacing 0.14em, color sidebar-muted.
- Nav items (padding 0 14px). Each item is a row:
  - Mono number (left, 18px column): e.g. `01`. Active = accent color. Inactive = muted.
  - Label (flex 1): DM Sans 13.5px. Active = `sidebar-text` 500 weight. Inactive = `sidebar-muted` 400.
  - Bullet (right): `●` colored `accent` when active.
  - Row separator: `1px solid sidebar-rule` between items.
- Nav items, in order: Přehled, Letenky, Ubytování, **Místa** (the original "Výlety" was renamed), Restaurace, Jízdní řády, Rozpočet.
- Footer (margin-top auto): logout link, sidebar-muted color, with logout icon.

### Masthead band

`12px 40px` padding, top + bottom border `1px solid rule`. Flex row, justify-between. DM Mono 10px, letter-spacing 0.16em, color `ink-3`, ALL CAPS. Usually 3 fields: section number+name (left), key data (center), context/timestamp (right).

### Page header

`36px 40px 28px` padding, bottom border `1px solid rule`. Two-column grid `1.4fr 1fr`:

- Left:
  - Tiny mono cap: `Tematická sekce — 0X` in `accent` color.
  - H1 in Instrument Serif 64–72px, with one italic word colored `accent`.
- Right: italic Instrument Serif 17px body paragraph in `ink-2`.

---

## Screens

### 1. Dashboard (`/`)

Big-cover overview. Sections top to bottom:

1. **Masthead band** — "Vydání 01 · Plán cesty | 23 dní · 2 země · 5 měst | Naposledy upraveno · čt 22. 5."
2. **Cover photo hero** (`height: 340px`):
   - Full-width background photo (Mt. Fuji or chosen hero image).
   - Diagonal gradient overlay for legibility: `linear-gradient(115deg, rgba(20,16,12,0.75) 0%, rgba(20,16,12,0.35) 45%, rgba(20,16,12,0) 75%)`.
   - Top-left: tiny mono cap "Září — Říjen 2026 · DEN", then "–N" inverted badge with `accent` background.
   - H1 "Tři týdny mezi mořem a horami." Instrument Serif 64px, line-height 0.94, italic "mořem" colored `#e9614f`. Slight `text-shadow: 0 1px 24px rgba(0,0,0,.3)`.
   - Top-right corner: photo credit sticker — `rgba(20,16,12,.55)` bg with backdrop blur, "Foto · Mt. Fuji — pohled z Chureito".
   - Bottom: thin top border + dates strip (Od / Do / Délka), DM Mono 9px caps + Instrument Serif 19px values, with city list on far right.
3. **Map + photo strip** (border-bottom rule):
   - Grid `1.2fr 2fr`.
   - Left: 200px-tall map block with `#f1ead9` background and paper-grain overlay. SVG map (see Map component below).
     - Top-left: stacked label — "Korea — Japonsko" (DM Mono 10px caps) and "~ 2 470 km · 6 zastávek" (italic serif 13px).
   - Right: padding 16px 24px. Header row: "Šest zastávek v obrazech" (serif 18 + italic 13). 6-column photo grid; each photo `aspect-ratio: 1`, with city tag bottom-left in tiny mono caps.
4. **Three-column body** (`1.2fr 1fr 1fr`, all separated by 1px rules):
   - **Itinerář v sedmi etapách** — numbered list of stages. Each row: serif 24 numeral (acc colored), city + italic tag + date range + nights count.
   - **Stav přípravy** — progress bars (Letenky 2/2, Ubytování 4/6, Aktivity 4/9, Doprava 3/5). Bar fill `accent` (or `accent-2` if 100%), track `rule`, height 3px.
   - **Poznámka redakce** — tinted cream band with paper-grain. Italic serif pull-quote + author meta. Bottom: 2-column big numbers (days-to-go, % spent).
5. **Footer marquee** — DM Mono 10px caps: "★ Soul 5n · Busan 3n · Fukuoka 1n · Kyoto 4n · Hakone 2n · Tokio 8n", "úprava itineráře →" right-aligned in accent.

### 2. Flights (`/flights`)

- Header "Z Prahy *a zpátky*." (italic "a zpátky" in accent).
- 4-column stats strip: Lety 2/2, Ve vzduchu 31h 55, Přestupy 2, Cena 28 400 Kč.
- **Two flight cards** (outbound + return), each:
  - Grid `280px 1fr`.
  - Left: photo with sticker (top-left: "Odlet"/"Návrat" in accent), route code bottom-left (`PRG → ICN`).
  - Right: ticket-style content. Top row (`1fr 100px 1fr`):
    - Departure time (Instrument Serif 44px), airport code + city + date below.
    - Center: arc SVG with plane glyph, duration "14h 35m", "Přímý let" or "1× přestup".
    - Arrival time (right-aligned), same hierarchy.
  - Airport names row in DM Mono 11px below.
  - **Dashed "tear line"** (border-top dashed) + 5-column key-value grid: Letenky / Letecké / Zavazadla / Sedadla / Cena.
  - Footer row with status pill (`accent` background filled badge, "● Rezervováno") + booking ref + "Otevřít →".
- Bottom **Připomenutí** panel — tinted cream band, 3-column tips (Online check-in, Pasport, ESTA/K-ETA).

### 3. Hotels (`/hotels`)

- Header "Šest *postelí*, šest měst." (italic "postelí" in accent).
- 4-column stats strip (nights, total cost, avg/night, booked count).
- **Featured hero card** (Hotel Granvia Seoul / longest stay): 16:9 photo + 4-column key-value grid (Datum / Cena celkem / Za noc / Platforma).
- **3-column grid** of 5 supporting hotel cards. Each card: 4:3 photo with city/nights overlay top-left + booked badge top-right (if applicable), then padding 16x18px content with name (serif 20) + ★ rating, italic district + note, 3-col grid (Datum / Cena celkem / Za noc), status pill bottom-left, "Detail →" right.

### 4. Places (formerly "Výlety", now "Místa") (`/places`)

- Header "Co děláme, *kdy*." or "Devět *záminek* vstát."
- Tab strip: "Vše · 9 | Rezervováno · 4 | Plánuju · 5 | Brzy ráno · 2 | Celodenní · 3" — active tab has 2px accent underline.
- **Featured pair** (`1.4fr 1fr`):
  - Featured event card (Fushimi Inari za úsvitu): 16:8 photo with "Hlavní událost" badge (accent bg) top-left, "Foto · Fushimi Inari, 05:42" caption bottom-left. Below: section meta + H3 + italic description + time/duration/status.
  - 3 stacked secondary cards: thumbnail (108x108) + meta + title + time/duration + status.
- **4-column compact grid** for remaining places. Each card: 4:3 photo, then padded content with city+time, H4, italic day+duration, status mono caps.

### 5. Restaurants (`/food`)

- Header "Sto *chutí* Asie." or similar.
- City tab strip (Vše · 14 | Seoul · 3 | Busan · 2 | …).
- **Featured "Must-try"** card big (16:9 hero photo with city/kind + price tier sticker overlays).
- **City sections** (Seoul, Busan, Fukuoka, Hiroshima, Kyoto, Tokyo):
  - Section header: city H2 + count meta + right-aligned "X must-try" italic.
  - 4-column food card grid. Card: 4:3 photo with city/kind label top-left, "★ Must-try" accent badge top-right (conditional), price tier ($/$$/$$$/$$$$) bottom-right pill. Content: name (serif 17), italic dish, mono note, footer with hours + "Mapa →".

### 6. Train schedules (`/schedule`)

- Header "Vlakem, *lodí*, *shinkansenem*." (two italics).
- **Two large pass cards** (Korea Rail Pass + JR Pass) side-by-side. Each: left vertical accent bar (4px), name (serif 28), 3-col grid (Platnost / Cena / Použito) + thin progress bar at bottom.
- 4-col stats strip (Kilometrů / Hodin v dopravě / Nejdelší úsek / Rezervováno).
- **Timetable** — chronological list. Column headers: Datum / Linka / Odjezd / Z / Příjezd / Do / Stav.
  - Each row: `92px 1fr 90px 1fr 80px 1fr 100px 20px` grid.
  - Date column: date in serif 14 + distance/duration in mono 10.
  - Linka: type tag (`KTX`/`Shink.`/`Trajekt`) in mono caps accent + train code in serif 15, then italic line name.
  - Times: big Instrument Serif 22px.
  - Status: "● Rezerv." (accent-2) or "○ Koupit" (ink-3), then italic pass name/price below.
- Bottom **Tipy &amp; pravidla** panel — tinted cream band, 3-col tips (Pasmo IC, Shinkansen rezervace, Tsushima trajekt).

### 7. Budget (`/budget`)

- Header "Sto dvacet pět *tisíc*." (italic "tisíc" in accent).
- **Hero section** (`1.2fr 220px 1fr`, padding 32px 40px):
  - Left: small mono "Utraceno k …", then huge number "47 200" (Instrument Serif 110px, weight 300), with "Kč" 32px ink-3. Italic serif sub-line. Wide 6px progress bar with floating % label above.
  - Center: **SVG donut chart** (220×220, stroke 28px). Track in `rule`, segments per category colored. Center label: "38%" (serif 36) + "UTRACENO" (mono 9 caps).
  - Right: legend — for each category: 10×10 colored square + name (serif 14) + spent/budget mono.
- **Two-column** (`1.05fr 1fr`):
  - **Per-city stacked bars**: row per city. Label + spent/budget in mono. Bar (10px) with `rule` track, `V2.alt` for budget portion width, `accent` for spent portion (within that).
  - **Recent spending log**: chronological rows `76px 1fr auto`. Date mono / what (sans + mono cat below) / amount (serif 18).
- Bottom **Předpověď** panel — tinted cream band. 3 columns: label / italic forecast quote / right-aligned big "+14 200 Kč" reserve.

---

## Components reused across screens

### `<Photo src alt w>` 

Wraps a `<div role="img" aria-label={alt}>` with `background-image: url(unsplash-url)`, cover/center, with a fallback `#e7ddc8` color. Accepts children for overlays (gradient + caption stickers).

### `<TripMap>`

SVG, viewBox `0 0 481 381`. Renders the uploaded Korea+Japan silhouette PNG (`assets/map-asia.png`) as an `<image>` element, optionally with transparency. On top:

- Dashed polyline route through the cities.
- City dots: 16px invisible click hit-area + 7.5px ring (paper bg color) + 5px filled circle (accent color).
- City labels: serif 26–32px, weight 400–500, with paint-order stroke ring (3.5px paper-bg stroke around text for legibility).

Each city has properties: `{ id, name, x, y, nights, lblDx, lblDy, anchor }`. `onCityClick(city)` callback for navigation to per-city detail.

### Status pill

```
padding: 4–5px 9–10px;
font-family: DM Mono;
font-size: 10–11px;
letter-spacing: 0.1em;
text-transform: uppercase;
```

Two states:
- **Booked**: background `accent`, color `paper`, bullet `●`, text e.g. "Rezervováno".
- **Planned**: transparent background, border `1px solid rule`, color `ink-3`, bullet `○`, text e.g. "Plánuju".

### Tinted callout panel

```
background: V2.alt; /* #f1ead9 */
padding: 20px 24px;
position: relative;
```

With absolute-positioned `.paper-grain` overlay (opacity 0.4). Used for "Poznámka redakce", "Připomenutí", "Tipy &amp; pravidla", "Předpověď".

### Filter tabs (underline-style)

Row of buttons in DM Mono 11px caps letter-spacing 0.1em. Active tab has `border-bottom: 2px solid accent` and `color: ink`. Inactive tabs are `ink-3` with transparent border.

---

## Data model

For a Next.js/local-JSON implementation, the data can live in flat files. The shape inferred from the design:

```typescript
type City = {
  id: 'icn'|'pus'|'fuk'|'hir'|'kyo'|'tyo';
  name: string;       // Display name (Seoul, Busan, …)
  country: 'KR'|'JP';
  x: number;          // Map x (in viewBox 0–481)
  y: number;          // Map y (in viewBox 0–381)
  nights: number;
};

type Trip = {
  name: string;
  start: string;      // '2026-09-04'
  end: string;        // '2026-09-27'
  days: number;       // 23
  cities: City[];
};

type ItineraryStage = {
  from: string; to: string; nights: number;
  city: string; country: string; tag: string; note: string;
};

type Activity = {
  id: string; title: string; city: string;
  day: string; time: string; duration: string;
  kind: 'walk'|'tour'|'ferry'|'museum'|'onsen'|'food';
  booked: boolean; tag: string;
  photo: string;      // photo id slug
};

type Flight = {
  id: 'out'|'ret'; label: string;
  from: { city, code, time, date, full };
  to:   { city, code, time, date, full };
  stops: { city, code, layover }[];
  airline: string; flights: string; duration: string;
  bags: string; seat: string; price: string;
  status: string; booked: boolean;
  photo: string;
};

type Hotel = {
  id: string; city: string; name: string; district: string;
  nights: number; dates: string;
  total: number; perNight: number;        // in CZK
  rating: number; platform: string;
  booked: boolean; photo: string; note: string;
};

type Restaurant = {
  id: string; city: string; name: string;
  kind: string;                            // 'Sushi', 'Ramen', ...
  tier: '$'|'$$'|'$$$'|'$$$$';
  dish: string; when: string;
  mustGo: boolean; photo: string; note: string;
};

type TransportLeg = {
  id: string; date: string;
  type: 'KTX'|'Shink.'|'Trajekt'|'Lokálka'|'JR Lokál';
  code: string; line: string;
  from: { code, city, time };
  to:   { code, city, time };
  duration: string; distance: string; class: string;
  price: string; booked: boolean; pass: string;
};

type Budget = {
  total: number;                          // 125000 CZK
  spent: number;
  categories: { id, name, spent, budget, color }[];
  byCity:     { city, budget, spent }[];
  log:        { date, what, cat, amount }[];
};
```

Recommended structure:

```
data/
  trip.json
  itinerary.json
  activities.json
  flights.json
  hotels.json
  restaurants.json
  transport.json
  budget.json
public/
  assets/
    map-asia.png        # silhouette mask, included in this bundle
photos/
  (user photos, or Unsplash slugs)
```

---

## Interactions &amp; behavior

The prototype is visual only — implement these as the codebase allows:

- **Sidebar navigation** — standard Next.js `Link` / Vue router. Active item determined by current route.
- **TripMap city dots** — clicking a city navigates to `/places?city=<id>` (or a per-city detail page). Cursor `pointer`, hover state could enlarge the ring slightly (not in prototype).
- **Card "Detail →" / "Mapa →"** — navigate to detail view, or open external map app (Google Maps deep link).
- **Filter tabs** — client-side filter of the current list (no fetch needed for small lists).
- **All form-like UI is decorative** — there are no forms in the prototype; if the user wants to add CRUD, that's a future scope.
- **No authentication** — single-user, personal-use tool. If multi-device sync is wanted, point at a simple backing store (Supabase, Firebase, or just commit JSON to a private repo).
- **Status pills** — toggle `booked` field on click would be nice but not in prototype.

### Responsive

The prototype is designed at 1240px wide artboards. For real implementation:
- ≥ 1100px: layout as designed.
- 768–1100px: sidebar collapses to a top horizontal nav, multi-column grids drop to 2 cols.
- < 768px: single column, photos full-width, hero text scales down ~70%, big numbers ~60%.

The prototype does **not** mock responsive states — derive them from these rules.

---

## Assets

### Map

`assets/map-asia.png` — included in this handoff. Pre-processed silhouette of Korea + Japan (481×381px, transparent PNG, dark ink fill, white sea = transparent). Use as-is in the SVG `<image>` element or convert to inline SVG paths if pixel-perfect scaling is needed.

If pixel-sharp rendering at large sizes is required, vectorize the PNG (Inkscape's "Trace Bitmap" or Adobe Illustrator's "Image Trace") and embed as inline SVG paths.

### Photos

The prototype uses Unsplash hotlinks via `https://images.unsplash.com/photo-{slug}?w={w}&auto=format&fit=crop&q=80`. The slug catalog is in `shared.jsx` (`PHOTOS` object).

**For production**: replace with self-hosted photos (the user's own photos, ideally). The `<Photo>` component just needs the URL — keep the props shape, only swap the source.

**Photography style:** evocative travel photography — neon Tokyo nights, dawn Kyoto temples, Korean food markets, Mt. Fuji landscapes. Mix wide landscape + tight detail shots. Avoid generic stock-photo people-posing.

### Fonts

All three families loaded from Google Fonts via the `<link>` tag in `index.html`. For production, self-host with `next/font` (Next.js) or equivalent to avoid third-party requests.

### Icons

Inline SVG, 16×16 viewBox 0 0 24 24, `stroke: currentColor`, `stroke-width: 1.6`, no fill. Defined in `shared.jsx` `Icon` object. Set is small (7 icons + logout) — keep inline or migrate to a Lucide / Heroicons subset.

---

## Files in this bundle

| File                      | Purpose                                                |
|---------------------------|--------------------------------------------------------|
| `index.html`              | Entry point. Loads fonts + React UMD + JSX scripts.    |
| `app.jsx`                 | Mounts the design canvas containing all 7 screens.     |
| `design-canvas.jsx`       | Pan/zoom canvas wrapper (presentation only, not production). |
| `shared.jsx`              | Trip data, photo catalog, `<TripMap>`, `<Photo>`, icons. |
| `variant2-atlas.jsx`      | Dashboard + Places screens, palette host.              |
| `variant2-flights.jsx`    | Flights screen.                                        |
| `variant2-hotels.jsx`     | Hotels screen.                                         |
| `variant2-food.jsx`       | Restaurants screen.                                    |
| `variant2-schedule.jsx`   | Schedule / Transport screen.                           |
| `variant2-budget.jsx`     | Budget screen.                                         |
| `assets/map-asia.png`     | Korea + Japan map silhouette.                          |

The `variant1-hanji.jsx` and `variant3-wabi.jsx` files (alternative palettes that were explored and rejected) are not part of the chosen design and are not included.

---

## Acceptance criteria (suggested)

A reasonable definition of "done" for the recreated app:

1. All 7 screens render at 1240px viewport pixel-matching the design within ~2px tolerance.
2. Colors, typography, and spacing match the tokens above exactly.
3. Sidebar navigation works (active state, route changes).
4. Cities on the map are clickable and route to the right place.
5. Data is sourced from JSON files (or equivalent), not hard-coded in components — so the user can edit the trip without touching code.
6. Photos load with a paper-cream fallback color while loading or on error.
7. Responsive: layout doesn't break at 768px, doesn't horizontal-scroll on mobile.
