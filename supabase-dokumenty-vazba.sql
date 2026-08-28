-- =============================================================
-- Supabase — Propojení dokumentu s konkrétním záznamem
-- =============================================================
-- Spusťte celý tento soubor v Supabase → SQL Editor → New query.
-- Lze spustit opakovaně, nic nemaže data.
--
-- Co to dělá: dokument si může pamatovat, ke které cestě patří.
-- Palubní lístek se pak ukáže přímo na kartě daného letu v sekci Cestování.
--
-- Dvojice sloupců je schválně obecná (název tabulky + id záznamu),
-- takže se stejným způsobem dá později navázat i ubytování nebo aktivita —
-- stačí doplnit položku do seznamu DOC_LINK_KINDS v app.js, nic v databázi.
-- =============================================================

ALTER TABLE documents ADD COLUMN IF NOT EXISTS linked_table TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS linked_id    UUID;

CREATE INDEX IF NOT EXISTS idx_documents_linked
  ON documents (linked_table, linked_id)
  WHERE linked_table IS NOT NULL;
