-- =============================================================
-- Serverová pojistka (RLS) — Korea & Japonsko Trip Planner
-- =============================================================
-- Spusťte celý soubor v Supabase → SQL Editor → New query → Run
--
-- Výsledek:
--   • ČTENÍ  — povoleno všem (potřebuje veřejná stránka public.html)
--   • ZÁPIS, ÚPRAVA, MAZÁNÍ — povoleno jen přihlášenému uživateli
--
-- Lze spustit opakovaně, nic nemaže data.
--
-- POZOR: tabulka `documents` tu schválně NENÍ. Má přísnější pravidla
-- (čtení jen po přihlášení) a nastavuje si je supabase-documents.sql.
-- Kdyby se sem přidala, zveřejnila by se tím i vaše vstupenky.
-- =============================================================

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'flights','accommodations','activities','restaurants',
    'transport','expenses','todos','photos'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);

    EXECUTE format('DROP POLICY IF EXISTS "verejne_cteni" ON %I', t);
    EXECUTE format('CREATE POLICY "verejne_cteni" ON %I FOR SELECT USING (true)', t);

    EXECUTE format('DROP POLICY IF EXISTS "zapis_prihlaseni" ON %I', t);
    EXECUTE format('CREATE POLICY "zapis_prihlaseni" ON %I FOR INSERT TO authenticated WITH CHECK (true)', t);

    EXECUTE format('DROP POLICY IF EXISTS "uprava_prihlaseni" ON %I', t);
    EXECUTE format('CREATE POLICY "uprava_prihlaseni" ON %I FOR UPDATE TO authenticated USING (true)', t);

    EXECUTE format('DROP POLICY IF EXISTS "mazani_prihlaseni" ON %I', t);
    EXECUTE format('CREATE POLICY "mazani_prihlaseni" ON %I FOR DELETE TO authenticated USING (true)', t);
  END LOOP;
END $$;
