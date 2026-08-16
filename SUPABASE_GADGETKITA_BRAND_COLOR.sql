-- ============================================================
-- GadgetKita — SQL Migration: Brands, Colors, & Product Enhancements
-- Supabase: https://ymrwiczatpedhkxfnfyn.supabase.co
-- ============================================================

-- 1. TABEL BRANDS
CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands are viewable by everyone" ON brands
  FOR SELECT USING (true);

CREATE POLICY "Brands can be managed by authenticated users" ON brands
  FOR ALL USING (auth.role() = 'authenticated');

-- 2. TABEL COLORS (Warna Solid & Dual-Tone Terbelah 2)
CREATE TABLE IF NOT EXISTS colors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'solid', -- 'solid' atau 'dual'
  hex1 TEXT NOT NULL,
  hex2 TEXT, -- opsional untuk dual tone
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Colors are viewable by everyone" ON colors
  FOR SELECT USING (true);

CREATE POLICY "Colors can be managed by authenticated users" ON colors
  FOR ALL USING (auth.role() = 'authenticated');

-- 3. UPDATE TABEL PRODUCTS
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{}'::jsonb;
