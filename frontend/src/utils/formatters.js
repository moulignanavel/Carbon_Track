/**
 * Formatting helpers used across the dashboard.
 */

/**
 * Format a CO₂e value with smart unit scaling.
 * < 1 kg → grams, ≥ 1000 kg → tonnes
 */
export function formatEmission(kg, decimals = 2) {
  if (kg === null || kg === undefined) return '—';
  if (kg < 1) return `${(kg * 1000).toFixed(decimals)} g CO₂e`;
  if (kg >= 1000) return `${(kg / 1000).toFixed(decimals)} t CO₂e`;
  return `${kg.toFixed(decimals)} kg CO₂e`;
}

/**
 * Format a date string or Date object to a readable locale date.
 */
export function formatDate(value, options = {}) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(value));
}

/**
 * Format a number with thousand separators.
 */
export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Compute a percentage with safe division.
 */
export function toPercent(part, total, decimals = 1) {
  if (!total) return '0%';
  return `${((part / total) * 100).toFixed(decimals)}%`;
}

/**
 * Capitalise the first letter of a string.
 */
export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
