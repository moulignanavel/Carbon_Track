-- V10: Create challenges and user_challenges tables
-- challenges = server-seeded mission definitions
-- user_challenges = per-user join/progress tracking

CREATE TABLE challenges (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(200)   NOT NULL,
    description  VARCHAR(500),
    category     VARCHAR(50)    NOT NULL,
    metric_type  VARCHAR(50)    NOT NULL,
    target_value DECIMAL(10, 2) NOT NULL,
    xp_reward    INT            NOT NULL DEFAULT 100,
    icon_key     VARCHAR(50),
    period       VARCHAR(20)    NOT NULL DEFAULT 'weekly'
);

CREATE TABLE user_challenges (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT         NOT NULL,
    challenge_id   BIGINT         NOT NULL,
    status         VARCHAR(20)    NOT NULL DEFAULT 'NOT_STARTED',
    progress_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
    joined_at      DATE           NOT NULL,
    completed_at   DATE,
    CONSTRAINT uq_user_challenge UNIQUE (user_id, challenge_id),
    CONSTRAINT fk_uc_challenge FOREIGN KEY (challenge_id) REFERENCES challenges (id)
);
