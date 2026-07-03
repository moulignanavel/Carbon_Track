INSERT INTO emission_factors (activity_type, unit, kg_co2e_per_unit, source, effective_date) VALUES
('car', 'km', 0.2100, 'IPCC', '2026-01-01'),
('flight', 'km', 0.1500, 'EPA', '2026-01-01'),
('public_transit', 'km', 0.0500, 'IPCC', '2026-01-01'),
('grid', 'kWh', 0.4500, 'EPA', '2026-01-01'),
('solar', 'kWh', 0.0200, 'IPCC', '2026-01-01'),
('wind', 'kWh', 0.0150, 'IPCC', '2026-01-01'),
('meat', 'serving', 3.0000, 'FAO', '2026-01-01'),
('vegetarian', 'serving', 1.2000, 'FAO', '2026-01-01'),
('vegan', 'serving', 0.5000, 'FAO', '2026-01-01'),
('electronics', 'USD', 0.8000, 'EPA', '2026-01-01'),
('clothing', 'USD', 0.4000, 'EPA', '2026-01-01');
