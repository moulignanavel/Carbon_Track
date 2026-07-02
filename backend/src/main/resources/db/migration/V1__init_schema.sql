CREATE TABLE organisations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    admin_user_id BIGINT
);

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, 
    org_id BIGINT,
    sustainability_preferences JSON,
    FOREIGN KEY (org_id) REFERENCES organisations(id)
);

CREATE TABLE emission_factors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    activity_type VARCHAR(50) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    kg_co2e_per_unit DECIMAL(10, 4) NOT NULL,
    source VARCHAR(100),
    effective_date DATE NOT NULL
);

CREATE TABLE activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    category VARCHAR(50) NOT NULL, -- transport, electricity, food, shopping
    activity_type VARCHAR(50) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    co2e_kg DECIMAL(10, 2) NOT NULL,
    log_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE goals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    target_reduction_pct DECIMAL(5, 2) NOT NULL,
    period_days INT NOT NULL,
    start_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL, -- ACTIVE, ACHIEVED, MISSED
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE badges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    trigger_type VARCHAR(50) NOT NULL, -- STREAK, GOAL, REDUCTION
    threshold DECIMAL(10, 2) NOT NULL
);

CREATE TABLE user_badges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    badge_id BIGINT,
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (badge_id) REFERENCES badges(id)
);