/**
 * Theme constants — mirrors the CSS design tokens in index.css.
 * Used programmatically by charts and dynamic colour logic.
 */

export const COLORS = {
  green: {
    50:  '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  teal: {
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
  },
  slate: {
    200: '#e2e8f0',
    700: '#334155',
  },
};

/** Chart palette — ordered for consistent recharts series colours */
export const CHART_PALETTE = [
  COLORS.green[500],
  COLORS.teal[500],
  COLORS.green[300],
  COLORS.teal[400],
  COLORS.green[700],
  '#f59e0b', // amber accent for warnings
  '#ef4444', // red accent for over-budget
];

/** Activity category colours */
export const CATEGORY_COLORS = {
  transport:    COLORS.green[500],
  electricity:  '#f59e0b',
  energy:       '#ef4444',
  food:         COLORS.teal[500],
  shopping:     '#8b5cf6',
  waste:        '#dc2626',
  other:        COLORS.slate[700],
};
