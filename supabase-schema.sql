-- =============================================================
-- Supabase Schema — Korea & Japonsko Trip Planner
-- =============================================================
-- Spusťte celý tento soubor v Supabase → SQL Editor → New query
-- RLS není potřeba — aplikace používá jeden sdílený účet
-- =============================================================

-- ── Letenky & transfery ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS flights (
  id             UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  flight_number  TEXT,
  date           DATE    NOT NULL,
  departure_time TIME,
  arrival_time   TIME,
  from_airport   TEXT    NOT NULL,
  to_airport     TEXT    NOT NULL,
  booking_ref    TEXT,
  notes          TEXT,
  country        TEXT    DEFAULT 'Transfer',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Ubytování ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accommodations (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT    NOT NULL,
  address     TEXT,
  checkin     DATE    NOT NULL,
  checkout    DATE    NOT NULL,
  price_czk   NUMERIC(10,2),
  booking_url TEXT,
  notes       TEXT,
  country     TEXT    DEFAULT 'Korea',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Výlety & aktivity ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activities (
  id         UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT    NOT NULL,
  date       DATE,
  time       TIME,
  location   TEXT,
  price      NUMERIC(10,2),
  url        TEXT,
  status     TEXT    DEFAULT 'naplánováno'
               CHECK (status IN ('naplánováno', 'rezervováno', 'hotovo')),
  notes      TEXT,
  country    TEXT    DEFAULT 'Korea',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Restaurace & jídlo ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS restaurants (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  address      TEXT,
  cuisine_type TEXT,
  price_range  TEXT DEFAULT '$',
  url          TEXT,
  notes        TEXT,
  country      TEXT DEFAULT 'Korea',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Jízdní řády ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transport (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  route_from  TEXT    NOT NULL,
  route_to    TEXT    NOT NULL,
  date        DATE,
  time        TIME,
  price       NUMERIC(10,2),
  ticket_type TEXT,
  notes       TEXT,
  country     TEXT    DEFAULT 'Korea',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Výdaje ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  category    TEXT    NOT NULL
                CHECK (category IN ('Letenky','Ubytování','Aktivity','Jídlo','Doprava','Ostatní')),
  amount_czk  NUMERIC(10,2) NOT NULL,
  description TEXT,
  date        DATE    NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexy ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_flights_date        ON flights(date);
CREATE INDEX IF NOT EXISTS idx_accommodations_ci   ON accommodations(checkin);
CREATE INDEX IF NOT EXISTS idx_activities_date     ON activities(date);
CREATE INDEX IF NOT EXISTS idx_activities_status   ON activities(status);
CREATE INDEX IF NOT EXISTS idx_restaurants_country ON restaurants(country);
CREATE INDEX IF NOT EXISTS idx_transport_date      ON transport(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category   ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date       ON expenses(date);

-- ── updated_at trigger ───────────────────────────────────────
CREATE OR REPLACE FUNCTION _set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DO $do$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['flights','accommodations','activities','restaurants','transport','expenses']
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_updated_at ON %I;
       CREATE TRIGGER trg_updated_at
         BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION _set_updated_at();',
      t, t
    );
  END LOOP;
END; $do$;

-- ── RLS (záměrně vypnuto) ────────────────────────────────────
-- Aplikace používá jeden sdílený přihlašovací účet.
-- Pro přístup z frontendu se používá anon key + JWT session.
-- Pokud chcete data zabezpečit, zapněte RLS a přidejte policy:
--   ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
--   CREATE POLICY "auth_only" ON flights USING (auth.role() = 'authenticated');
