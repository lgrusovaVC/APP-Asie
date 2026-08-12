-- =============================================================
-- Supabase — Koš (vratné mazání)
-- =============================================================
-- Spusťte celý tento soubor v Supabase → SQL Editor → New query.
-- Lze spustit opakovaně, nic nemaže data.
--
-- Co to dělá: každá tabulka dostane sloupec deleted_at.
-- Mazání v aplikaci od teď jen zapíše čas do tohoto sloupce,
-- záznam zmizí ze všech seznamů, ale zůstane v databázi.
-- Koš v aplikaci ukazuje právě tyhle záznamy a umí je vrátit.
-- Nenávratně se smažou teprve vysypáním z koše.
-- =============================================================

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'flights','accommodations','activities','restaurants',
    'transport','expenses','todos','photos','documents'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ', t);

    -- částečný index: zrychlí běžné načítání, které bere jen nesmazané
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_%s_deleted_at ON %I (deleted_at) WHERE deleted_at IS NULL',
      t, t);
  END LOOP;
END $$;

-- =============================================================
-- Poznámka k oprávněním
-- =============================================================
-- Vracení z koše je běžný UPDATE a trvalé smazání běžný DELETE,
-- takže stačí pravidla, která už tabulky mají z supabase-rls.sql
-- (a u documents ze supabase-documents.sql). Nic dalšího netřeba.
--
-- Pozor: u tabulek s veřejným čtením zůstanou smazané záznamy
-- čitelné přes API, dokud je nevysypete z koše. Aplikace je skrývá,
-- ale nejsou pryč — to je cena za možnost je vrátit.
