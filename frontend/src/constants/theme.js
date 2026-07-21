/**
 * Theme constants — mirrors the CSS design tokens in index.css.
 * Used programmatically by charts and dynamic colour logic.
 */

export const COLORS = {
  green: {
    50:  '#f4f9f5',
    100: '#e3f0e8',
    200: '#c5dfcd',
    300: '#98c9a7',
    400: '#7FBF8C',
    500: '#2d6a4f',   // Deep forest green — high contrast trend lines
    600: '#437b50',
    700: '#1b4332',
    800: '#2d4f36',
    900: '#1E4432',
  },
  teal: {
    400: '#7FBF8C',
    500: '#2d6a4f',
    600: '#437b50',
  },
  slate: {
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    700: '#334155',
  },
};

/** Chart palette — ordered for consistent recharts series colours */
export const CHART_PALETTE = [
  '#2d6a4f', // deep forest green
  '#2563eb', // blue
  '#d97706', // amber
  '#7c3aed', // violet
  '#dc2626', // red
  '#0891b2', // cyan
  '#f59e0b', // amber accent
];

/** Activity category colours — saturated, high-contrast, distinct per category */
export const CATEGORY_COLORS = {
  transport:    '#2563eb',  // Blue — clear, universal transport symbol
  electricity:  '#d97706',  // Amber — warm, energy feel
  energy:       '#dc2626',  // Red — alerts/danger feel for home energy overuse
  food:         '#16a34a',  // Emerald green — natural, food & plant feel
  shopping:     '#7c3aed',  // Violet — commercial, distinct
  waste:        '#b45309',  // Brown-amber — waste/earth
  other:        '#64748b',  // Slate grey — neutral fallback
};
