ALTER TABLE organisations ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;
CREATE UNIQUE INDEX uk_organisations_name ON organisations(name);
