/**
 * goalsMock.js
 * ─────────────────────────────────────────────────────────────
 * Mock data for the Goal Tracking module.
 * Swap GoalContext to real API calls when the backend is ready.
 *
 * Goal shape:
 *   id           — unique number
 *   title        — display name
 *   description  — optional note
 *   category     — 'all' | 'transport' | 'electricity' | 'food' | 'shopping' | 'energy'
 *   period       — 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
 *   target       — number (kg CO₂e)
 *   current      — number (kg CO₂e tracked so far)
 *   startDate    — ISO date string "YYYY-MM-DD"
 *   endDate      — ISO date string "YYYY-MM-DD"
 *   createdAt    — ISO date string
 *   color        — hex accent colour (optional override)
 */

const today      = new Date();
const fmt        = (d) => d.toISOString().split('T')[0];
const addDays    = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const addMonths  = (d, n) => { const r = new Date(d); r.setMonth(r.getMonth() + n); return r; };

const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
const monthEnd   = new Date(today.getFullYear(), today.getMonth() + 1, 0);
const yearStart  = new Date(today.getFullYear(), 0, 1);
const yearEnd    = new Date(today.getFullYear(), 11, 31);
const weekStart  = addDays(today, -today.getDay() + 1);
const weekEnd    = addDays(weekStart, 6);

export const MOCK_GOALS = [
  {
    id:          1,
    title:       'Monthly Carbon Budget',
    description: 'Keep total monthly emissions under 150 kg CO₂e',
    category:    'all',
    period:      'monthly',
    target:      150,
    current:     65.9,
    startDate:   fmt(monthStart),
    endDate:     fmt(monthEnd),
    createdAt:   fmt(addDays(today, -5)),
  },
  {
    id:          2,
    title:       'Transport Cap',
    description: 'Reduce car and flight emissions',
    category:    'transport',
    period:      'monthly',
    target:      60,
    current:     16.0,
    startDate:   fmt(monthStart),
    endDate:     fmt(monthEnd),
    createdAt:   fmt(addDays(today, -5)),
  },
  {
    id:          3,
    title:       'Home Energy Reduction',
    description: 'Cut gas and electricity usage',
    category:    'energy',
    period:      'monthly',
    target:      40,
    current:     41.2,
    startDate:   fmt(monthStart),
    endDate:     fmt(monthEnd),
    createdAt:   fmt(addDays(today, -5)),
  },
  {
    id:          4,
    title:       'Weekly Food Goal',
    description: 'Eat less meat, reduce food emissions',
    category:    'food',
    period:      'weekly',
    target:      15,
    current:     12.6,
    startDate:   fmt(weekStart),
    endDate:     fmt(weekEnd),
    createdAt:   fmt(addDays(today, -2)),
  },
  {
    id:          5,
    title:       'Annual Net Zero Target',
    description: 'Full year carbon reduction goal',
    category:    'all',
    period:      'annual',
    target:      1200,
    current:     521,
    startDate:   fmt(yearStart),
    endDate:     fmt(yearEnd),
    createdAt:   fmt(yearStart),
  },
  {
    id:          6,
    title:       'Sustainable Shopping',
    description: 'Limit new clothing and electronics',
    category:    'shopping',
    period:      'quarterly',
    target:      80,
    current:     90.6,
    startDate:   '2026-04-01',
    endDate:     '2026-06-30',
    createdAt:   '2026-04-01',
  },
];

/**
 * Timeline history — weekly snapshots for each goal (for spark lines).
 * Each entry: { week: 'Wk N', value: number }
 */
export const MOCK_GOAL_HISTORY = {
  1: [
    { week: 'Wk 1', value: 0    },
    { week: 'Wk 2', value: 18.4 },
    { week: 'Wk 3', value: 39.1 },
    { week: 'Wk 4', value: 65.9 },
  ],
  2: [
    { week: 'Wk 1', value: 0    },
    { week: 'Wk 2', value: 4.5  },
    { week: 'Wk 3', value: 10.2 },
    { week: 'Wk 4', value: 16.0 },
  ],
  3: [
    { week: 'Wk 1', value: 0    },
    { week: 'Wk 2', value: 11.4 },
    { week: 'Wk 3', value: 27.3 },
    { week: 'Wk 4', value: 41.2 },
  ],
  4: [
    { week: 'Mon', value: 0    },
    { week: 'Wed', value: 7.2  },
    { week: 'Fri', value: 10.1 },
    { week: 'Sun', value: 12.6 },
  ],
  5: [
    { week: 'Jan', value: 0    },
    { week: 'Feb', value: 98.2  },
    { week: 'Mar', value: 201.0 },
    { week: 'Apr', value: 312.4 },
    { week: 'May', value: 430.1 },
    { week: 'Jun', value: 521.0 },
  ],
  6: [
    { week: 'Apr', value: 0    },
    { week: 'May', value: 22.8 },
    { week: 'Jun', value: 90.6 },
  ],
};
