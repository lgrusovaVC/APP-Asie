# SETUP — Korea & Japonsko Trip Planner

Instrukce krok za krokem pro nasazení aplikace.

---

## 1. Vytvoření Supabase projektu

1. Jděte na [supabase.com](https://supabase.com) a přihlaste se / zaregistrujte.
2. Klikněte **New project**.
3. Vyplňte:
   - **Organization** — vaše organizace (nebo si vytvořte novou)
   - **Name** — např. `korea-japonsko-trip`
   - **Database Password** — silné heslo (uložte si ho)
   - **Region** — vyberte nejbližší (např. `Central EU (Frankfurt)`)
4. Klikněte **Create new project** — čekejte ~2 minuty na inicializaci.

---

## 2. Spuštění SQL migrace

1. V Supabase dashboardu otevřete **SQL Editor** (ikona databáze vlevo).
2. Klikněte **New query**.
3. Zkopírujte celý obsah souboru `supabase-schema.sql` a vložte ho do editoru.
4. Klikněte **Run** (nebo `Ctrl+Enter`).
5. V sekci **Table Editor** si ověřte, že se vytvořily tabulky:
   `flights`, `accommodations`, `activities`, `restaurants`, `transport`, `expenses`.

---

## 3. Vytvoření přihlašovacího účtu

1. V Supabase dashboardu přejděte do **Authentication** → **Users**.
2. Klikněte **Add user** → **Create new user**.
3. Vyplňte:
   - **Email** — váš sdílený e-mail (např. `trip@email.cz`)
   - **Password** — sdílené heslo (obě uživatelky ho budou znát)
   - **Auto Confirm User** — zaškrtněte ✓
4. Klikněte **Create user**.

> Registrace z aplikace je záměrně vypnuta — účet se vytváří pouze ručně zde.

---

## 4. Vyplnění config.js

1. Otevřete soubor **config.js** v textovém editoru.
2. V Supabase dashboardu přejděte do **Settings** → **API**.
3. Zkopírujte hodnoty:
   - **Project URL** → vložte do `SUPABASE_URL`
   - **anon / public** (pod "Project API keys") → vložte do `SUPABASE_ANON_KEY`
4. Upravte dle potřeby:
   - `DEPARTURE_DATE` — datum odjezdu ve formátu `YYYY-MM-DD`
   - `RETURN_DATE`    — datum návratu
   - `TOTAL_BUDGET_CZK` — celkový rozpočet v Kč
   - `TRIP_TITLE` / `TRIP_SUBTITLE` — název cesty

**Výsledný config.js by měl vypadat takto:**
```js
const CONFIG = {
  SUPABASE_URL:      'https://abcdefghijklm.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…',
  TRIP_TITLE:        'Korea & Japonsko',
  TRIP_YEAR:         '2026',
  DEPARTURE_DATE:    '2026-09-01',
  RETURN_DATE:       '2026-09-21',
  TOTAL_BUDGET_CZK:  150000,
  …
};
```

> **Bezpečnost:** `anon key` je veřejný klíč určený pro klientské aplikace —
> je bezpečné ho mít ve frontendu. Nikdy nesdílejte `service_role` klíč.

---

## 5. Nasazení na GitHub Pages

### 5a. Vytvoření repozitáře

1. Jděte na [github.com](https://github.com) a přihlaste se.
2. Klikněte **New repository**.
3. Nastavte:
   - **Repository name** — např. `korea-japonsko-trip`
   - **Visibility** — **Private** (doporučeno, aby config.js nebyl veřejný)
4. Klikněte **Create repository**.

### 5b. Nahrání souborů

```bash
# Inicializace git repozitáře v adresáři aplikace
git init
git add .
git commit -m "Initial commit — Korea & Japonsko trip planner"

# Propojení s GitHub repozitářem (URL zkopírujte z GitHubu)
git remote add origin https://github.com/VAŠE_USERNAME/korea-japonsko-trip.git
git branch -M main
git push -u origin main
```

### 5c. Zapnutí GitHub Pages

1. V repozitáři přejděte do **Settings** → **Pages**.
2. Pod **Source** vyberte **Deploy from a branch**.
3. Větev: `main`, složka: `/ (root)`.
4. Klikněte **Save**.
5. Za ~1-2 minuty bude aplikace dostupná na:
   `https://VAŠE_USERNAME.github.io/korea-japonsko-trip/`

---

## 6. Ověření funkčnosti

Po nasazení otestujte:

- [ ] Aplikace se načte bez chyby konfigurace
- [ ] Přihlášení s e-mailem a heslem funguje
- [ ] Přihlášení přetrvá po refreshi stránky
- [ ] Přidání záznamu (letenka, ubytování…) funguje
- [ ] Záznam je viditelný i po refreshi (načtení z Supabase)
- [ ] Funguje na mobilu (Chrome / Safari)
- [ ] Při vypnutí internetu se zobrazí offline banner

---

## Tipy

- **Sdílené přihlášení:** obě uživatelky se přihlašují stejným e-mailem a heslem — mohou být přihlášeny zároveň, data jsou společná.
- **Hero obrázek:** URL obrázku na dashboardu lze změnit v `config.js` → `HERO_IMAGE_URL`.
- **Offline:** při první návštěvě s internetem se aplikace zkešuje — pak funguje i bez připojení (jen pro čtení).
- **Mobilní PWA:** na iOS/Android lze přidat na plochu přes "Přidat na plochu" v prohlížeči.
