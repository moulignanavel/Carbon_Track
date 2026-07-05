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
  { year: '2021', emissions: 2845.3, budget: 2400, target: 2160 },
  { year: '2022', emissions: 2512.7, budget: 2400, target: 2160 },
  { year: '2023', emissions: 2101.4, budget: 2400, target: 2160 },
  { year: '2024', emissions: 1889.2, budget: 2400, target: 2160 },
  { year: '2025', emissions: 1758.3, budget: 2400, target: 2160 },
];

/* ─────────────────────────────────────────────────────────────
   Summary Stats for Cards
   ───────────────────────────────────────────────────────────── */
export const ANALYTICS_SUMMARY = {
  thisWeek: {
    total: 210.2,
    change: -12.5, // percentage from last week
    byCategory: {
      transport: 85.5,
      electricity: 58.3,
      food: 45.2,
      shopping: 21.2,
    },
  },
  thisMonth: {
    total: 858.3,
    change: -8.2,
    budget: 200,
    target: 180,
  },
  thisYear: {
    total: 1758.3,
    change: -18.5,
    avgPerMonth: 146.5,
  },
  allTime: {
    total: 8958.5,
    avgPerMonth: 224.6,
  },
};

/* ─────────────────────────────────────────────────────────────
   Top Emitters by Category (table data)
   ───────────────────────────────────────────────────────────── */
export const TOP_EMITTERS = {
  transport: [
    { activity: 'Car Commute (25 km)',     emissions: 5.2,  frequency: 'daily',   color: '#3B82F6' },
    { activity: 'Flight (NYC → LAX)',      emissions: 0.85, frequency: 'monthly', color: '#3B82F6' },
    { activity: 'Gas Delivery (Whole Foods)', emissions: 2.1, frequency: 'weekly',  color: '#3B82F6' },
  ],
  electricity: [
    { activity: 'Heating (Winter)',        emissions: 3.2,  frequency: 'daily',   color: '#10B981' },
    { activity: 'Air Conditioning',        emissions: 2.8,  frequency: 'daily',   color: '#10B981' },
    { activity: 'Appliances',              emissions: 2.1,  frequency: 'daily',   color: '#10B981' },
  ],
  food: [
    { activity: 'Beef Steak (200g)',       emissions: 4.5,  frequency: 'weekly',  color: '#F59E0B' },
    { activity: 'Cheese (150g)',           emissions: 2.1,  frequency: 'weekly',  color: '#F59E0B' },
    { activity: 'Chocolate (100g)',        emissions: 1.8,  frequency: 'monthly', color: '#F59E0B' },
  ],
  shopping: [
    { activity: 'New Clothes (5 items)',   emissions: 8.4,  frequency: 'monthly', color: '#EC4899' },
    { activity: 'Electronics',             emissions: 12.5, frequency: 'yearly',  color: '#EC4899' },
    { activity: 'Furniture',               emissions: 45.2, frequency: 'yearly',  color: '#EC4899' },
  ],
};

/* ─────────────────────────────────────────────────────────────
   Named exports for Reports page
   ───────────────────────────────────────────────────────────── */
export const MOCK_DAILY           = DAILY_DATA;
export const MOCK_WEEKLY          = WEEKLY_TREND_DATA;
export const MOCK_MONTHLY         = MONTHLY_COMPARISON_DATA;
export const MOCK_YEARLY          = YEARLY_DATA;
export const MOCK_CATEGORY_BREAKDOWN = CATEGORY_MONTHLY_DATA;
export const MOCK_SUMMARY         = ANALYTICS_SUMMARY;
export const MOCK_TOP_ACTIVITIES  = TOP_EMITTERS;
