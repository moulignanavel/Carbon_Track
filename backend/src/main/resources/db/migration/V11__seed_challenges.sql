-- V11: Seed built-in weekly/one-time eco challenges
-- metric_type values:
--   REDUCE_EMISSIONS  → progress_value = total CO2e emitted (lower is better, target is ceiling)
--   LOG_DAYS          → progress_value = distinct log dates in period
--   LOG_ENTRIES       → progress_value = count of activity log entries
--   STAY_UNDER        → alias for REDUCE_EMISSIONS (semantic clarity for UI)

INSERT INTO challenges (title, description, category, metric_type, target_value, xp_reward, icon_key, period) VALUES
('Green Commuter',
 'Keep your transport emissions under 5 kg CO2e this week. Walk, cycle, or take public transit.',
 'transport', 'STAY_UNDER', 5.00, 150, 'car', 'weekly'),

('Plant Power Week',
 'Log at least 3 food or diet activities this week to track your dietary footprint.',
 'food', 'LOG_ENTRIES', 3.00, 100, 'salad', 'weekly'),

('Energy Saver',
 'Keep electricity and energy emissions under 10 kg CO2e this week.',
 'electricity', 'STAY_UNDER', 10.00, 120, 'zap', 'weekly'),

('Logging Streak',
 'Log your activities on at least 5 out of 7 days this week.',
 'all', 'LOG_DAYS', 5.00, 200, 'calendar', 'weekly'),

('Shopping Detox',
 'Record zero shopping emissions this week. Resist impulse purchases!',
 'shopping', 'STAY_UNDER', 0.01, 180, 'shopping-bag', 'weekly'),

('Carbon Budget',
 'Stay under a total of 20 kg CO2e emissions across all categories this week.',
 'all', 'STAY_UNDER', 20.00, 250, 'leaf', 'weekly'),

('First Step',
 'Log your very first carbon activity. Every journey begins with a single step!',
 'all', 'LOG_ENTRIES', 1.00, 50, 'star', 'one_time'),

('Consistency King',
 'Log activities every single day for 7 consecutive days this week.',
 'all', 'LOG_DAYS', 7.00, 300, 'trophy', 'weekly');
