-- ============================================
-- PRESYO PH — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Main price readings table
--    Every scraper run inserts rows here
CREATE TABLE IF NOT EXISTS price_readings (
  id              BIGSERIAL PRIMARY KEY,
  commodity       TEXT NOT NULL,        -- e.g. "rice_well_milled", "fuel_diesel"
  display_name    TEXT,                 -- raw label from source
  price           NUMERIC(10, 2) NOT NULL,
  price_min       NUMERIC(10, 2),       -- for fuel (DOE gives min/max range)
  price_max       NUMERIC(10, 2),
  unit            TEXT DEFAULT 'kg',    -- 'kg', 'liter', 'piece'
  region          TEXT DEFAULT 'NCR',   -- for future regional expansion
  source          TEXT NOT NULL,        -- 'PSA', 'DOE', 'USER'
  scraped_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast queries by commodity + date
CREATE INDEX idx_price_readings_commodity ON price_readings (commodity, scraped_at DESC);
CREATE INDEX idx_price_readings_source ON price_readings (source, scraped_at DESC);

-- 2. User-submitted prices (crowdsourced)
CREATE TABLE IF NOT EXISTS user_submissions (
  id              BIGSERIAL PRIMARY KEY,
  commodity       TEXT NOT NULL,
  price           NUMERIC(10, 2) NOT NULL,
  unit            TEXT DEFAULT 'kg',
  store_name      TEXT,                 -- e.g. "Puregold Cubao", "Kamuning wet market"
  store_type      TEXT,                 -- 'wet_market', 'supermarket', 'sari_sari', 'palengke'
  city            TEXT,
  barangay        TEXT,
  verified        BOOLEAN DEFAULT FALSE,
  upvotes         INT DEFAULT 0,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_submissions_commodity ON user_submissions (commodity, submitted_at DESC);
CREATE INDEX idx_user_submissions_city ON user_submissions (city, submitted_at DESC);

-- 2b. User baskets table (for saving shopping baskets)
CREATE TABLE IF NOT EXISTS user_baskets (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  commodity       TEXT NOT NULL,
  quantity        NUMERIC(10, 2) NOT NULL,
  unit            TEXT DEFAULT 'kg',
  saved_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_baskets_user ON user_baskets (user_id, saved_at DESC);
CREATE INDEX idx_user_baskets_commodity ON user_baskets (commodity);

-- 3. Commodity reference table
CREATE TABLE IF NOT EXISTS commodities (
  key             TEXT PRIMARY KEY,     -- e.g. "rice_well_milled"
  display_name    TEXT NOT NULL,        -- e.g. "Well-Milled Rice"
  category        TEXT NOT NULL,        -- 'grains', 'meat', 'poultry', 'fish', 'vegetables', 'fuel'
  unit            TEXT DEFAULT 'kg',
  icon            TEXT,                 -- emoji or icon name
  sort_order      INT DEFAULT 0
);

-- Seed commodity reference data
INSERT INTO commodities (key, display_name, category, unit, icon, sort_order) VALUES
  ('rice_well_milled',      'Well-Milled Rice',     'grains',     'kg',     '🌾', 1),
  ('rice_regular_milled',   'Regular Milled Rice',  'grains',     'kg',     '🌾', 2),
  ('pork_kasim',            'Pork Kasim',           'meat',       'kg',     '🥩', 3),
  ('pork_liempo',           'Pork Liempo',          'meat',       'kg',     '🥩', 4),
  ('chicken_whole',         'Whole Chicken',        'poultry',    'kg',     '🍗', 5),
  ('chicken_egg',           'Chicken Egg',          'poultry',    'piece',  '🥚', 6),
  ('fish_galunggong',       'Galunggong',           'fish',       'kg',     '🐟', 7),
  ('fish_bangus',           'Bangus',               'fish',       'kg',     '🐟', 8),
  ('vegetable_tomato',      'Tomato',               'vegetables', 'kg',     '🍅', 9),
  ('vegetable_ampalaya',    'Ampalaya',             'vegetables', 'kg',     '🥬', 10),
  ('vegetable_baguio_beans','Baguio Beans',         'vegetables', 'kg',     '🫘', 11),
  ('vegetable_cabbage',     'Repolyo (Cabbage)',    'vegetables', 'kg',     '🥬', 12),
  ('fuel_gasoline_ron91',   'Gasoline RON 91',      'fuel',       'liter',  '⛽', 13),
  ('fuel_gasoline_ron95',   'Gasoline RON 95',      'fuel',       'liter',  '⛽', 14),
  ('fuel_diesel',           'Diesel',               'fuel',       'liter',  '⛽', 15),
  ('fuel_kerosene',         'Kerosene',             'fuel',       'liter',  '🪔', 16)
ON CONFLICT (key) DO NOTHING;

-- 4. Helpful view: latest price per commodity
CREATE OR REPLACE VIEW latest_prices AS
SELECT DISTINCT ON (commodity)
  pr.commodity,
  c.display_name,
  c.category,
  c.unit,
  c.icon,
  pr.price,
  pr.price_min,
  pr.price_max,
  pr.source,
  pr.scraped_at
FROM price_readings pr
LEFT JOIN commodities c ON c.key = pr.commodity
ORDER BY commodity, scraped_at DESC;

-- 5. Helpful view: week-over-week price change
CREATE OR REPLACE VIEW price_changes AS
WITH ranked AS (
  SELECT
    commodity,
    price,
    scraped_at,
    LAG(price) OVER (PARTITION BY commodity ORDER BY scraped_at) AS prev_price
  FROM price_readings
)
SELECT
  r.commodity,
  c.display_name,
  c.category,
  c.icon,
  c.unit,
  r.price AS current_price,
  r.prev_price,
  ROUND(((r.price - r.prev_price) / r.prev_price * 100)::numeric, 2) AS pct_change,
  r.scraped_at
FROM ranked r
LEFT JOIN commodities c ON c.key = r.commodity
WHERE r.prev_price IS NOT NULL
ORDER BY r.scraped_at DESC, ABS((r.price - r.prev_price) / r.prev_price) DESC;

-- 6. Enable Row Level Security (good practice)
ALTER TABLE price_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_baskets ENABLE ROW LEVEL SECURITY;

-- Allow public reads on price_readings and commodities
CREATE POLICY "Public can read prices" ON price_readings FOR SELECT USING (true);
CREATE POLICY "Public can read commodities" ON commodities FOR SELECT USING (true);

-- Allow anyone to submit prices (for crowdsourcing)
CREATE POLICY "Anyone can submit prices" ON user_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read submissions" ON user_submissions FOR SELECT USING (true);

-- User baskets policies (users can only access their own)
CREATE POLICY "Users can read their own baskets" ON user_baskets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own baskets" ON user_baskets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own baskets" ON user_baskets FOR DELETE USING (auth.uid() = user_id);