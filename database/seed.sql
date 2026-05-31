-- ============================================
-- PRESYO PH — Seed Data (for development)
-- Real-ish Philippine prices, May 2026
-- ============================================

-- Seed 6 months of price history (Jan–May 2026)
-- Based on actual PSA/DOE trends for NCR

INSERT INTO price_readings (commodity, price, unit, source, scraped_at) VALUES

-- ═══ RICE ═══
('rice_well_milled',    52.00, 'kg', 'PSA', '2026-01-01'),
('rice_well_milled',    53.50, 'kg', 'PSA', '2026-01-15'),
('rice_well_milled',    54.00, 'kg', 'PSA', '2026-02-01'),
('rice_well_milled',    55.00, 'kg', 'PSA', '2026-02-15'),
('rice_well_milled',    56.50, 'kg', 'PSA', '2026-03-01'),
('rice_well_milled',    57.00, 'kg', 'PSA', '2026-03-15'),
('rice_well_milled',    59.00, 'kg', 'PSA', '2026-04-01'),
('rice_well_milled',    62.00, 'kg', 'PSA', '2026-04-15'),
('rice_well_milled',    64.50, 'kg', 'PSA', '2026-05-01'),
('rice_well_milled',    65.00, 'kg', 'PSA', '2026-05-15'),

('rice_regular_milled', 45.00, 'kg', 'PSA', '2026-01-01'),
('rice_regular_milled', 46.00, 'kg', 'PSA', '2026-01-15'),
('rice_regular_milled', 47.00, 'kg', 'PSA', '2026-02-01'),
('rice_regular_milled', 48.00, 'kg', 'PSA', '2026-02-15'),
('rice_regular_milled', 49.00, 'kg', 'PSA', '2026-03-01'),
('rice_regular_milled', 50.00, 'kg', 'PSA', '2026-03-15'),
('rice_regular_milled', 51.50, 'kg', 'PSA', '2026-04-01'),
('rice_regular_milled', 53.00, 'kg', 'PSA', '2026-04-15'),
('rice_regular_milled', 54.00, 'kg', 'PSA', '2026-05-01'),
('rice_regular_milled', 55.00, 'kg', 'PSA', '2026-05-15'),

-- ═══ PORK ═══
('pork_kasim',  260.00, 'kg', 'PSA', '2026-01-01'),
('pork_kasim',  265.00, 'kg', 'PSA', '2026-01-15'),
('pork_kasim',  270.00, 'kg', 'PSA', '2026-02-01'),
('pork_kasim',  275.00, 'kg', 'PSA', '2026-02-15'),
('pork_kasim',  280.00, 'kg', 'PSA', '2026-03-01'),
('pork_kasim',  285.00, 'kg', 'PSA', '2026-03-15'),
('pork_kasim',  295.00, 'kg', 'PSA', '2026-04-01'),
('pork_kasim',  310.00, 'kg', 'PSA', '2026-04-15'),
('pork_kasim',  320.00, 'kg', 'PSA', '2026-05-01'),
('pork_kasim',  325.00, 'kg', 'PSA', '2026-05-15'),

('pork_liempo', 290.00, 'kg', 'PSA', '2026-01-01'),
('pork_liempo', 295.00, 'kg', 'PSA', '2026-01-15'),
('pork_liempo', 300.00, 'kg', 'PSA', '2026-02-01'),
('pork_liempo', 305.00, 'kg', 'PSA', '2026-02-15'),
('pork_liempo', 310.00, 'kg', 'PSA', '2026-03-01'),
('pork_liempo', 315.00, 'kg', 'PSA', '2026-03-15'),
('pork_liempo', 330.00, 'kg', 'PSA', '2026-04-01'),
('pork_liempo', 345.00, 'kg', 'PSA', '2026-04-15'),
('pork_liempo', 355.00, 'kg', 'PSA', '2026-05-01'),
('pork_liempo', 360.00, 'kg', 'PSA', '2026-05-15'),

-- ═══ POULTRY ═══
('chicken_whole', 170.00, 'kg',    'PSA', '2026-01-01'),
('chicken_whole', 172.00, 'kg',    'PSA', '2026-01-15'),
('chicken_whole', 175.00, 'kg',    'PSA', '2026-02-01'),
('chicken_whole', 178.00, 'kg',    'PSA', '2026-02-15'),
('chicken_whole', 180.00, 'kg',    'PSA', '2026-03-01'),
('chicken_whole', 183.00, 'kg',    'PSA', '2026-03-15'),
('chicken_whole', 188.00, 'kg',    'PSA', '2026-04-01'),
('chicken_whole', 192.00, 'kg',    'PSA', '2026-04-15'),
('chicken_whole', 195.00, 'kg',    'PSA', '2026-05-01'),
('chicken_whole', 197.00, 'kg',    'PSA', '2026-05-15'),

('chicken_egg',   8.80, 'piece', 'PSA', '2026-01-01'),
('chicken_egg',   8.90, 'piece', 'PSA', '2026-01-15'),
('chicken_egg',   9.00, 'piece', 'PSA', '2026-02-01'),
('chicken_egg',   9.10, 'piece', 'PSA', '2026-02-15'),
('chicken_egg',   9.20, 'piece', 'PSA', '2026-03-01'),
('chicken_egg',   9.25, 'piece', 'PSA', '2026-03-15'),
('chicken_egg',   9.30, 'piece', 'PSA', '2026-04-01'),
('chicken_egg',   9.31, 'piece', 'PSA', '2026-04-15'),
('chicken_egg',   9.24, 'piece', 'PSA', '2026-05-01'),
('chicken_egg',   9.30, 'piece', 'PSA', '2026-05-15'),

-- ═══ FISH ═══
('fish_galunggong', 210.00, 'kg', 'PSA', '2026-01-01'),
('fish_galunggong', 215.00, 'kg', 'PSA', '2026-01-15'),
('fish_galunggong', 220.00, 'kg', 'PSA', '2026-02-01'),
('fish_galunggong', 218.00, 'kg', 'PSA', '2026-02-15'),
('fish_galunggong', 225.00, 'kg', 'PSA', '2026-03-01'),
('fish_galunggong', 230.00, 'kg', 'PSA', '2026-03-15'),
('fish_galunggong', 247.68,'kg', 'PSA', '2026-04-01'),
('fish_galunggong', 233.27,'kg', 'PSA', '2026-04-15'),
('fish_galunggong', 238.78,'kg', 'PSA', '2026-05-01'),
('fish_galunggong', 240.00, 'kg', 'PSA', '2026-05-15'),

-- ═══ VEGETABLES ═══
('vegetable_tomato',       55.00,  'kg', 'PSA', '2026-01-01'),
('vegetable_tomato',       58.00,  'kg', 'PSA', '2026-02-01'),
('vegetable_tomato',       62.00,  'kg', 'PSA', '2026-03-01'),
('vegetable_tomato',       70.00,  'kg', 'PSA', '2026-04-01'),
('vegetable_tomato',       75.00,  'kg', 'PSA', '2026-05-01'),
('vegetable_tomato',       78.00,  'kg', 'PSA', '2026-05-15'),

('vegetable_baguio_beans', 100.00, 'kg', 'PSA', '2026-01-01'),
('vegetable_baguio_beans', 108.00, 'kg', 'PSA', '2026-02-01'),
('vegetable_baguio_beans', 113.17, 'kg', 'PSA', '2026-03-01'),
('vegetable_baguio_beans', 115.79, 'kg', 'PSA', '2026-04-01'),
('vegetable_baguio_beans', 124.86, 'kg', 'PSA', '2026-04-15'),
('vegetable_baguio_beans', 129.49, 'kg', 'PSA', '2026-05-01'),

-- ═══ FUEL (DOE NCR) ═══
('fuel_gasoline_ron91', 72.00,  'liter', 'DOE', '2026-01-07'),
('fuel_gasoline_ron91', 73.50,  'liter', 'DOE', '2026-01-14'),
('fuel_gasoline_ron91', 74.00,  'liter', 'DOE', '2026-01-21'),
('fuel_gasoline_ron91', 75.20,  'liter', 'DOE', '2026-02-04'),
('fuel_gasoline_ron91', 76.80,  'liter', 'DOE', '2026-02-18'),
('fuel_gasoline_ron91', 78.00,  'liter', 'DOE', '2026-03-04'),
('fuel_gasoline_ron91', 80.50,  'liter', 'DOE', '2026-03-18'),
('fuel_gasoline_ron91', 85.00,  'liter', 'DOE', '2026-04-01'),
('fuel_gasoline_ron91', 96.50,  'liter', 'DOE', '2026-04-13'), -- peak (Tariff related)
('fuel_gasoline_ron91', 91.00,  'liter', 'DOE', '2026-04-21'),
('fuel_gasoline_ron91', 88.00,  'liter', 'DOE', '2026-05-05'),
('fuel_gasoline_ron91', 84.54,  'liter', 'DOE', '2026-05-26'),

('fuel_diesel',  60.00, 'liter', 'DOE', '2026-01-07'),
('fuel_diesel',  61.50, 'liter', 'DOE', '2026-01-21'),
('fuel_diesel',  63.00, 'liter', 'DOE', '2026-02-04'),
('fuel_diesel',  65.00, 'liter', 'DOE', '2026-02-18'),
('fuel_diesel',  68.00, 'liter', 'DOE', '2026-03-04'),
('fuel_diesel',  72.00, 'liter', 'DOE', '2026-03-18'),
('fuel_diesel',  78.00, 'liter', 'DOE', '2026-04-01'),
('fuel_diesel', 153.70, 'liter', 'DOE', '2026-04-13'), -- peak
('fuel_diesel', 130.00, 'liter', 'DOE', '2026-04-21'),
('fuel_diesel',  95.00, 'liter', 'DOE', '2026-05-05'),
('fuel_diesel',  82.79, 'liter', 'DOE', '2026-05-26');