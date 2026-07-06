/**
 * analyticsMock.js — Mock data for Analytics page
 * Charts & statistics for visualization
 */

/* ─────────────────────────────────────────────────────────────
   Category Breakdown (pie chart)
   ───────────────────────────────────────────────────────────── */
export const CATEGORY_PIE_DATA = [
  { name: 'Transport',   value: 45.2, color: '#3B82F6', percentage: 28 },
  { name: 'Electricity', value: 38.7, color: '#10B981', percentage: 24 },
  { name: 'Food',        value: 35.4, color: '#F59E0B', percentage: 22 },
  { name: 'Shopping',    value: 41.8, color: '#EC4899', percentage: 26 },
];

/* ─────────────────────────────────────────────────────────────
   Weekly Trend Data (line chart)
   ───────────────────────────────────────────────────────────── */
export const WEEKLY_TREND_DATA = [
  { date: 'Mon',   transport: 12.5, electricity: 8.2,  food: 5.3,  shopping: 0,    total: 26.0 },
  { date: 'Tue',   transport: 14.2, electricity: 8.5,  food: 6.1,  shopping: 3.2,  total: 32.0 },
  { date: 'Wed',   transport: 10.8, electricity: 7.9,  food: 5.8,  shopping: 0,    total: 24.5 },
  { date: 'Thu',   transport: 15.3, electricity: 9.1,  food: 6.4,  shopping: 2.1,  total: 32.9 },
  { date: 'Fri',   transport: 18.5, electricity: 8.7,  food: 7.2,  shopping: 5.6,  total: 40.0 },
  { date: 'Sat',   transport: 8.2,  electricity: 8.3,  food: 8.9,  shopping: 8.4,  total: 33.8 },
  { date: 'Sun',   transport: 6.5,  electricity: 7.8,  food: 5.5,  shopping: 1.2,  total: 21.0 },
];

/* ─────────────────────────────────────────────────────────────
   Monthly Comparison Data (bar chart)
   ───────────────────────────────────────────────────────────── */
export const MONTHLY_COMPARISON_DATA = [
  { month: 'Jan', emissions: 245.3, budget: 200, target: 180 },
  { month: 'Feb', emissions: 218.7, budget: 200, target: 180 },
  { month: 'Mar', emissions: 201.4, budget: 200, target: 180 },
  { month: 'Apr', emissions: 189.2, budget: 200, target: 180 },
  { month: 'May', emissions: 175.8, budget: 200, target: 180 },
  { month: 'Jun', emissions: 162.5, budget: 200, target: 180 },
  { month: 'Jul', emissions: 158.3, budget: 200, target: 180 },
];

/* ─────────────────────────────────────────────────────────────
   Category Breakdown by Month (stacked bar)
   ───────────────────────────────────────────────────────────── */
export const CATEGORY_MONTHLY_DATA = [
  { month: 'Jan', transport: 98.5,  electricity: 67.2, food: 52.1,  shopping: 27.5 },
  { month: 'Feb', transport: 88.3,  electricity: 62.5, food: 48.9,  shopping: 19.0 },
  { month: 'Mar', transport: 75.2,  electricity: 58.7, food: 45.3,  shopping: 22.2 },
  { month: 'Apr', transport: 68.9,  electricity: 54.2, food: 42.8,  shopping: 23.3 },
  { month: 'May', transport: 62.4,  electricity: 51.8, food: 39.5,  shopping: 22.1 },
  { month: 'Jun', transport: 55.3,  electricity: 48.9, food: 36.2,  shopping: 22.1 },
  { month: 'Jul', transport: 52.1,  electricity: 47.3, food: 35.8,  shopping: 23.1 },
];

/* ─────────────────────────────────────────────────────────────
   Daily Data (for daily filter)
   ───────────────────────────────────────────────────────────── */
export const DAILY_DATA = [
  { date: '2025-01-01', transport: 12.5, electricity: 8.2,  food: 5.3,  shopping: 0,    total: 26.0 },
  { date: '2025-01-02', transport: 14.2, electricity: 8.5,  food: 6.1,  shopping: 3.2,  total: 32.0 },
  { date: '2025-01-03', transport: 10.8, electricity: 7.9,  food: 5.8,  shopping: 0,    total: 24.5 },
  { date: '2025-01-04', transport: 15.3, electricity: 9.1,  food: 6.4,  shopping: 2.1,  total: 32.9 },
  { date: '2025-01-05', transport: 18.5, electricity: 8.7,  food: 7.2,  shopping: 5.6,  total: 40.0 },
  { date: '2025-01-06', transport: 8.2,  electricity: 8.3,  food: 8.9,  shopping: 8.4,  total: 33.8 },
  { date: '2025-01-07', transport: 6.5,  electricity: 7.8,  food: 5.5,  shopping: 1.2,  total: 21.0 },
];

/* ─────────────────────────────────────────────────────────────
   Yearly Data (for yearly filter)
   ───────────────────────────────────────────────────────────── */
export const YEARLY_DATA = [
  { year: '2021', transport: 1200, electricity: 800, food: 500, shopping: 345.3 },
  { year: '2022', transport: 1100, electricity: 750, food: 480, shopping: 182.7 },
  { year: '2023', transport: 900,  electricity: 650, food: 400, shopping: 151.4 },
  { year: '2024', transport: 800,  electricity: 600, food: 350, shopping: 139.2 },
  { year: '2025', transport: 750,  electricity: 550, food: 320, shopping: 138.3 },
];

/* ─────────────────────────────────────────────────────────────
   Named exports for Reports page
   ───────────────────────────────────────────────────────────── */
export const MOCK_DAILY           = DAILY_DATA;
export const MOCK_WEEKLY          = WEEKLY_TREND_DATA;
export const MOCK_MONTHLY         = CATEGORY_MONTHLY_DATA;
export const MOCK_YEARLY          = YEARLY_DATA;

export const MOCK_SUMMARY = {
  daily: {
    total: { value: 4.82, prev: 5.45 },
    topCat: { value: 'Transport', share: '62%' },
    avgPerEntry: { value: 2.41, prev: 2.72 },
    entries: { value: 2, prev: 2 },
    target: { value: 5.0, period: 'Daily' },
  },
  weekly: {
    total: { value: 28.40, prev: 31.50 },
    topCat: { value: 'Electricity', share: '38%' },
    avgPerEntry: { value: 3.55, prev: 3.93 },
    entries: { value: 8, prev: 8 },
    target: { value: 35.0, period: 'Weekly' },
  },
  monthly: {
    total: { value: 112.70, prev: 120.90 },
    topCat: { value: 'Transport', share: '40%' },
    avgPerEntry: { value: 3.76, prev: 4.03 },
    entries: { value: 30, prev: 30 },
    target: { value: 150.0, period: 'Monthly' },
  },
  yearly: {
    total: { value: 1450.00, prev: 1680.00 },
    topCat: { value: 'Transport', share: '45%' },
    avgPerEntry: { value: 4.02, prev: 4.67 },
    entries: { value: 360, prev: 360 },
    target: { value: 1800.0, period: 'Yearly' },
  },
};

export const MOCK_CATEGORY_BREAKDOWN = {
  daily: [
    { name: 'Transport', category: 'transport', value: 3.00, prev: 3.50 },
    { name: 'Electricity', category: 'electricity', value: 1.00, prev: 1.10 },
    { name: 'Food', category: 'food', value: 0.82, prev: 0.85 },
  ],
  weekly: [
    { name: 'Transport', category: 'transport', value: 10.80, prev: 12.50 },
    { name: 'Electricity', category: 'electricity', value: 9.10, prev: 10.20 },
    { name: 'Food', category: 'food', value: 5.30, prev: 5.80 },
    { name: 'Shopping', category: 'shopping', value: 3.20, prev: 3.00 },
  ],
  monthly: [
    { name: 'Transport', category: 'transport', value: 45.20, prev: 52.10 },
    { name: 'Electricity', category: 'electricity', value: 38.70, prev: 35.80 },
    { name: 'Food', category: 'food', value: 15.40, prev: 20.20 },
    { name: 'Shopping', category: 'shopping', value: 13.40, prev: 12.80 },
  ],
  yearly: [
    { name: 'Transport', category: 'transport', value: 580.00, prev: 680.00 },
    { name: 'Electricity', category: 'electricity', value: 420.00, prev: 480.00 },
    { name: 'Food', category: 'food', value: 250.00, prev: 320.00 },
    { name: 'Shopping', category: 'shopping', value: 200.00, prev: 200.00 },
  ],
};

export const MOCK_TOP_ACTIVITIES = [
  { rank: 1, label: 'Flight NYC → London', emissions: 0.85, category: 'transport', icon: '✈️' },
  { rank: 2, label: 'Gasoline Car Commute', emissions: 0.18, category: 'transport', icon: '🚗' },
  { rank: 3, label: 'Grid Electricity Consumption', emissions: 0.12, category: 'electricity', icon: '⚡' },
  { rank: 4, label: 'Beef Steak Dinner', emissions: 0.08, category: 'food', icon: '🥩' },
  { rank: 5, label: 'New Clothes Purchase', emissions: 0.05, category: 'shopping', icon: '🛍️' },
];

