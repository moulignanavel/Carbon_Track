/**
 * dashboardMock.js
 * ─────────────────────────────────────────────────────────────
 * Comprehensive mock data for the CarbonTrack dashboard.
 *
 * When the backend is ready, replace these exports with real API
 * calls — the dashboard components only import from this file
 * (or from DashboardContext), so the swap is a one-line change
 * per data source.
 *
 * All emission values are in kg CO₂e.
 */

import { CATEGORY_COLORS, CHART_PALETTE } from '@/constants/theme';

/* ══════════════════════════════════════════════════════════════
   KPI STATS
   ══════════════════════════════════════════════════════════════ */

export const MOCK_KPI = {
  today: {
    value: 4.82,
    delta: -0.63,         // negative = improvement
    deltaLabel: 'vs yesterday',
    trend: 'down',        // down = good for emissions
  },
  weekly: {
    value: 28.4,
    delta: -3.1,
    deltaLabel: 'vs last week',
    trend: 'down',
  },
  monthly: {
    value: 112.7,
    delta: +8.2,
    deltaLabel: 'vs last month',
    trend: 'up',          // up = worse
  },
  avgPerDay: {
    value: 3.76,
    delta: -0.4,
    deltaLabel: 'vs last 30 days',
    trend: 'down',
  },
};

/* ══════════════════════════════════════════════════════════════
   GOAL PROGRESS
   ══════════════════════════════════════════════════════════════ */

export const MOCK_GOALS = [
  {
    id: 1,
    title:    'Monthly Budget',
    target:   150,
    current:  112.7,
    unit:     'kg CO₂e',
    category: 'all',
    period:   'Jul 2026',
    daysLeft: 26,
  },
  {
    id: 2,
    title:    'Transport Cap',
    target:   60,
    current:  38.4,
    unit:     'kg CO₂e',
    category: 'transport',
    period:   'Jul 2026',
    daysLeft: 26,
  },
  {
    id: 3,
    title:    'Energy Reduction',
    target:   40,
    current:  41.2,   // slightly over — visual warning
    unit:     'kg CO₂e',
    category: 'energy',
    period:   'Jul 2026',
    daysLeft: 26,
  },
];

/* ══════════════════════════════════════════════════════════════
   WEEKLY TREND  (last 7 days, one point per day)
   ══════════════════════════════════════════════════════════════ */

export const MOCK_WEEKLY_TREND = [
  { day: 'Mon', emissions: 5.2,  transport: 2.8, energy: 1.4, food: 0.7, other: 0.3 },
  { day: 'Tue', emissions: 3.8,  transport: 1.6, energy: 1.2, food: 0.8, other: 0.2 },
  { day: 'Wed', emissions: 6.1,  transport: 3.5, energy: 1.5, food: 0.9, other: 0.2 },
  { day: 'Thu', emissions: 2.9,  transport: 0.8, energy: 1.3, food: 0.6, other: 0.2 },
  { day: 'Fri', emissions: 5.6,  transport: 2.4, energy: 2.1, food: 0.8, other: 0.3 },
  { day: 'Sat', emissions: 4.1,  transport: 1.2, energy: 1.8, food: 0.7, other: 0.4 },
  { day: 'Sun', emissions: 0.7,  transport: 0.0, energy: 0.4, food: 0.2, other: 0.1 },
];

/* ══════════════════════════════════════════════════════════════
   MONTHLY COMPARISON  (last 6 months)
   ══════════════════════════════════════════════════════════════ */

export const MOCK_MONTHLY_COMPARISON = [
  { month: 'Feb',  emissions: 148.3, target: 160 },
  { month: 'Mar',  emissions: 135.6, target: 155 },
  { month: 'Apr',  emissions: 142.1, target: 150 },
  { month: 'May',  emissions: 119.4, target: 145 },
  { month: 'Jun',  emissions: 104.5, target: 140 },
  { month: 'Jul',  emissions: 112.7, target: 135 },
];

/* ══════════════════════════════════════════════════════════════
   CATEGORY PIE  (current month)
   ══════════════════════════════════════════════════════════════ */

export const MOCK_CATEGORY_DATA = [
  { name: 'Transport', value: 38.4,  category: 'transport' },
  { name: 'Energy',    value: 41.2,  category: 'energy'    },
  { name: 'Food',      value: 22.6,  category: 'food'      },
  { name: 'Shopping',  value: 6.8,   category: 'shopping'  },
  { name: 'Waste',     value: 3.7,   category: 'waste'     },
];

/* ══════════════════════════════════════════════════════════════
   RECENT ACTIVITIES
   ══════════════════════════════════════════════════════════════ */

export const MOCK_RECENT_ACTIVITIES = [
  {
    id: 1,
    category:    'transport',
    activityType:'Car (Petrol)',
    amount:      24,
    unit:        'km',
    emissions:   4.32,
    logDate:     '2026-07-05',
    icon:        '🚗',
  },
  {
    id: 2,
    category:    'energy',
    activityType:'Electricity',
    amount:      8.5,
    unit:        'kWh',
    emissions:   1.96,
    logDate:     '2026-07-05',
    icon:        '⚡',
  },
  {
    id: 3,
    category:    'food',
    activityType:'Beef',
    amount:      0.25,
    unit:        'kg',
    emissions:   6.75,
    logDate:     '2026-07-04',
    icon:        '🥩',
  },
  {
    id: 4,
    category:    'transport',
    activityType:'Train',
    amount:      42,
    unit:        'km',
    emissions:   1.22,
    logDate:     '2026-07-04',
    icon:        '🚆',
  },
  {
    id: 5,
    category:    'shopping',
    activityType:'Clothing',
    amount:      2,
    unit:        'items',
    emissions:   6.80,
    logDate:     '2026-07-03',
    icon:        '👕',
  },
  {
    id: 6,
    category:    'waste',
    activityType:'Landfill',
    amount:      1.2,
    unit:        'kg',
    emissions:   0.38,
    logDate:     '2026-07-03',
    icon:        '🗑️',
  },
  {
    id: 7,
    category:    'energy',
    activityType:'Natural Gas',
    amount:      3.2,
    unit:        'kWh',
    emissions:   0.70,
    logDate:     '2026-07-02',
    icon:        '🔥',
  },
];

/* ══════════════════════════════════════════════════════════════
   QUICK LOG  — frequently used activity shortcuts
   ══════════════════════════════════════════════════════════════ */

export const MOCK_QUICK_LOG_ITEMS = [
  { id: 'car',         label: 'Car trip',     icon: '🚗', category: 'transport', activityType: 'car_petrol'   },
  { id: 'electricity', label: 'Electricity',  icon: '⚡', category: 'energy',    activityType: 'electricity'  },
  { id: 'meal',        label: 'Meal',         icon: '🍽️', category: 'food',      activityType: 'beef'         },
  { id: 'flight',      label: 'Flight',       icon: '✈️', category: 'transport', activityType: 'flight_short' },
  { id: 'bus',         label: 'Bus',          icon: '🚌', category: 'transport', activityType: 'bus'          },
  { id: 'custom',      label: 'Custom…',      icon: '＋', category: null,        activityType: null           },
];

/* ══════════════════════════════════════════════════════════════
   ECO RECOMMENDATIONS
   ══════════════════════════════════════════════════════════════ */

export const MOCK_RECOMMENDATIONS = [
  {
    id: 1,
    title:   'Switch to an EV',
    impact:  'Save ~18 kg CO₂e/month',
    detail:  'Based on your 24 km/day car commute, switching to electric could cut transport emissions by 70%.',
    tag:     'High impact',
    tagColor:'green',
    icon:    '🚗',
  },
  {
    id: 2,
    title:   'Reduce beef consumption',
    impact:  'Save ~12 kg CO₂e/month',
    detail:  'Replacing beef with chicken twice a week makes a significant difference.',
    tag:     'Easy win',
    tagColor:'teal',
    icon:    '🥦',
  },
  {
    id: 3,
    title:   'Install smart heating',
    impact:  'Save ~8 kg CO₂e/month',
    detail:  'A smart thermostat reduces energy waste by 15–20%.',
    tag:     'Home',
    tagColor:'yellow',
    icon:    '🌡️',
  },
];

/* ══════════════════════════════════════════════════════════════
   LEADERBOARD
   ══════════════════════════════════════════════════════════════ */

export const MOCK_LEADERBOARD = [
  { rank: 1,  username: 'eco_alice',   avatar: null, monthly: 48.2,  badge: '🏆', delta: -12.4, isCurrentUser: false },
  { rank: 2,  username: 'green_bob',   avatar: null, monthly: 61.7,  badge: '🥈', delta: -8.1,  isCurrentUser: false },
  { rank: 3,  username: 'terra_carol', avatar: null, monthly: 74.3,  badge: '🥉', delta: -5.6,  isCurrentUser: false },
  { rank: 4,  username: 'you',         avatar: null, monthly: 112.7, badge: null,  delta: +8.2,  isCurrentUser: true  },
  { rank: 5,  username: 'dave_green',  avatar: null, monthly: 118.4, badge: null,  delta: +3.1,  isCurrentUser: false },
];

/* ══════════════════════════════════════════════════════════════
   BADGES / ACHIEVEMENTS
   ══════════════════════════════════════════════════════════════ */

export const MOCK_BADGES = [
  { id: 1, emoji: '🌱', label: 'Green Starter',    desc: 'First activity logged',       earned: true,  earnedDate: 'Jun 2026' },
  { id: 2, emoji: '📊', label: 'Data Tracker',     desc: '10 activities logged',         earned: true,  earnedDate: 'Jun 2026' },
  { id: 3, emoji: '🚲', label: 'Green Commuter',   desc: 'Used green transport 5× in a week', earned: true, earnedDate: 'Jul 2026' },
  { id: 4, emoji: '🔥', label: '7-Day Streak',     desc: 'Logged every day for a week', earned: false, earnedDate: null       },
  { id: 5, emoji: '🌍', label: 'Carbon Conscious', desc: 'Under 100 kg in a month',     earned: false, earnedDate: null       },
  { id: 6, emoji: '⚡', label: 'Net Zero Hero',    desc: 'Offset your full month',      earned: false, earnedDate: null       },
];
