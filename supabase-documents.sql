-- =============================================================
-- Supabase — Dokumenty (vstupenky, jízdenky, pojištění…)
-- =============================================================
-- Spusťte celý tento soubor v Supabase → SQL Editor → New query.
-- Vytvoří tabulku documents a Storage bucket "documents".
--
-- POZOR — tahle tabulka má jiná pravidla než zbytek aplikace:
-- čtení je povoleno JEN přihlášenému uživateli, ne veřejnosti.
-- Proto NENÍ v seznamu tabulek v supabase-rls.sql a nesmí tam být přidána.
-- =============================================================

-- ── Tabulka dokumentů ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_path TEXT NOT NULL,             -- cesta v bucketu (pro mazání)
  url          TEXT NOT NULL,             -- veřejná URL souboru
  filename     TEXT,                      -- původní název souboru
  title        TEXT NOT NULL,             -- název, pod kterým se zobrazuje
  kind         TEXT DEFAULT 'image',      -- 'image' | 'pdf'
  category     TEXT DEFAULT 'Ostatní',    -- Vstupenky | Jízdenky | Ostatní
  date_from    DATE,                      -- NULL + NULL = platí pro celou cestu
  date_to      DATE,                      -- jednodenní doklad: date_from = date_to
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_from ON documents(date_from);

-- trigger na updated_at (funkce _set_updated_at už existuje ze základního schématu)
DROP TRIGGER IF EXISTS trg_updated_at ON documents;
CREATE TRIGGER trg_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION _set_updated_at();

-- ── RLS — čtení jen po přihlášení ────────────────────────────
-- Tohle je ten rozdíl oproti ostatním tabulkám: bez přihlášení
-- se nedá zjistit ani to, jaké dokumenty existují, ani jejich adresy.
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cteni_prihlaseni"  ON documents;
CREATE POLICY "cteni_prihlaseni"  ON documents FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "zapis_prihlaseni"  ON documents;
CREATE POLICY "zapis_prihlaseni"  ON documents FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "uprava_prihlaseni" ON documents;
CREATE POLICY "uprava_prihlaseni" ON documents FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "mazani_prihlaseni" ON documents;
CREATE POLICY "mazani_prihlaseni" ON documents FOR DELETE TO authenticated USING (true);

-- ── Storage bucket ───────────────────────────────────────────
-- Bucket je veřejný, aby soubory mohl nakešovat service worker
-- (kvůli offline režimu). Adresy jsou náhodné a nedají se uhodnout
-- a jejich seznam je díky RLS výše dostupný jen po přihlášení.
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "documents_upload" ON storage.objects;
CREATE POLICY "documents_upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "documents_update" ON storage.objects;
CREATE POLICY "documents_update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "documents_delete" ON storage.objects;
CREATE POLICY "documents_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "documents_read" ON storage.objects;
CREATE POLICY "documents_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');
