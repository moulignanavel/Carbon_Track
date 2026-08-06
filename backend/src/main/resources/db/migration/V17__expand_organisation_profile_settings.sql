ALTER TABLE organisations ADD COLUMN postal_code VARCHAR(20);
ALTER TABLE organisations ADD COLUMN logo_data LONGTEXT;
ALTER TABLE organisations ADD COLUMN reporting_year INT;
ALTER TABLE organisations ADD COLUMN preferred_unit VARCHAR(20);
ALTER TABLE organisations ADD COLUMN reporting_frequency VARCHAR(30);
