-- V7: Expand goals table to support full per-user goal tracking
-- Adds all columns required by the frontend Goals UI.
-- Legacy columns (target_reduction_pct, period_days) are made nullable
-- so existing rows (if any) are not broken.

ALTER TABLE goals
    ADD COLUMN title       VARCHAR(200) NOT NULL DEFAULT '',
    ADD COLUMN description VARCHAR(500),
    ADD COLUMN category    VARCHAR(50)  NOT NULL DEFAULT 'all',
    ADD COLUMN period      VARCHAR(20)  NOT NULL DEFAULT 'monthly',
    ADD COLUMN target_kg   DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN current_kg  DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN end_date    DATE         NOT NULL DEFAULT (CURRENT_DATE),
    MODIFY COLUMN target_reduction_pct DECIMAL(5, 2),
    MODIFY COLUMN period_days          INT;
