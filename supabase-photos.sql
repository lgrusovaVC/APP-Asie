-- =============================================================
-- Supabase — Deník cesty (fotky na mapě)
-- =============================================================
-- Spusťte celý tento soubor v Supabase → SQL Editor → New query
-- Vytvoří tabulku photos a Storage bucket "photos" včetně policies.
-- =============================================================

-- ── Tabulka fotek ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS photos (
  id           UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_path TEXT    NOT NULL,          -- cesta v bucketu (pro mazání)
  url          TEXT    NOT NULL,          -- veřejná URL fotky
  lat          DOUBLE PRECISION,          -- NULL = fotka bez polohy
  lng          DOUBLE PRECISION,
  taken_at     TIMESTAMPTZ,               -- datum a čas pořízení (z EXIF)
  place        TEXT,                      -- název místa/města (reverzní geokódování)
  caption      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- trigger na updated_at (funkce _set_updated_at už existuje ze základního schématu)
DROP TRIGGER IF EXISTS trg_updated_at ON photos;
CREATE TRIGGER trg_updated_at
  BEFORE UPDATE ON photos
  FOR EACH ROW EXECUTE FUNCTION _set_updated_at();

-- ── Storage bucket ───────────────────────────────────────────
-- Veřejný bucket: fotky lze zobrazit přes URL bez přihlášení
-- (později poslouží i pro sdílení s rodinou).
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Nahrávat a mazat smí jen přihlášený uživatel
DROP POLICY IF EXISTS "photos_upload" ON storage.objects;
CREATE POLICY "photos_upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'photos');

DROP POLICY IF EXISTS "photos_update" ON storage.objects;
CREATE POLICY "photos_update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'photos');

DROP POLICY IF EXISTS "photos_delete" ON storage.objects;
CREATE POLICY "photos_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'photos');

-- Veřejné čtení objektů (nutné pro public URL)
DROP POLICY IF EXISTS "photos_read" ON storage.objects;
CREATE POLICY "photos_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');
