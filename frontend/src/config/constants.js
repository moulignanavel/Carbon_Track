/**
 * constants.js
 * ─────────────────────────────────────────────────────────────
 * Application constants and configurations.
 * Centralized place for magic numbers and string constants.
 */

// ── HTTP Status Codes ─────────────────────────────────────────────
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// ── API Error Messages ────────────────────────────────────────────
export const API_ERRORS = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNAUTHORIZED: 'Your session has expired. Please login again.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  CONFLICT: 'The resource already exists.',
  SERVER_ERROR: 'A server error occurred. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
};

// ── User Roles ────────────────────────────────────────────────────
export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  ORG_ADMIN: 'ORG_ADMIN',
};

// ── API Endpoints (relative to /api) ──────────────────────────────
export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/auth/reset-password',

  // Users
  USERS_PROFILE: '/users/profile',
  USERS_UPDATE_PROFILE: '/users/profile',

  // Activity Logs
  ACTIVITY_LOGS: '/activity-logs',
  ACTIVITY_LOGS_CREATE: '/activity-logs',
  ACTIVITY_LOGS_TRANSPORT: '/activity-logs/transport',
  ACTIVITY_LOGS_ELECTRICITY: '/activity-logs/electricity',
  ACTIVITY_LOGS_FOOD: '/activity-logs/food',
  ACTIVITY_LOGS_SHOPPING: '/activity-logs/shopping',
  ACTIVITY_LOGS_SCAN: '/activity-logs/scan',
  ACTIVITY_LOGS_DELETE: (id) => `/activity-logs/${id}`,

  // Goals
  GOALS: '/goals',
  GOALS_CREATE: '/goals',
  GOALS_UPDATE: (id) => `/goals/${id}`,
  GOALS_DELETE: (id) => `/goals/${id}`,

  // Leaderboard
  LEADERBOARD_COMMUNITY: '/leaderboard',
  LEADERBOARD_SEARCH: '/leaderboard/search',

  // Organisation Dashboard
  ORG_DASHBOARD: (id) => `/organisations/${id}/dashboard`,
  ORG_CSR_REPORT: (id) => `/organisations/${id}/csr-report`,

  // Recommendations (if applicable)
  RECOMMENDATIONS: '/recommendations',
};

// ── Cache Keys ────────────────────────────────────────────────────
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  ACTIVITY_LOGS: 'activity_logs',
  LEADERBOARD: 'leaderboard',
  ORG_DASHBOARD: 'org_dashboard',
  GOALS: 'goals',
};

// ── Activity Categories ───────────────────────────────────────────
export const ACTIVITY_CATEGORIES = {
  TRANSPORTATION: 'Transportation',
  ENERGY: 'Energy',
  WASTE: 'Waste',
  FOOD: 'Food',
  OTHER: 'Other',
};

// ── Activity Types ────────────────────────────────────────────────
export const ACTIVITY_TYPES = {
  PUBLIC_TRANSPORT: 'Public Transport',
  BICYCLE: 'Bicycle',
  CARPOOL: 'Carpool',
  WALKING: 'Walking',
  ELECTRIC_VEHICLE: 'Electric Vehicle',
  RENEWABLE_ENERGY: 'Renewable Energy',
  ENERGY_EFFICIENT_APPLIANCE: 'Energy Efficient Appliance',
  WATER_CONSERVATION: 'Water Conservation',
  RECYCLING: 'Recycling',
  COMPOSTING: 'Composting',
  PLANT_BASED_MEAL: 'Plant-based Meal',
  LOCAL_PRODUCE: 'Local Produce',
};

// ── Pagination Defaults ───────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_SIZE: 20,
  MAX_SIZE: 100,
};

// ── Leaderboard ───────────────────────────────────────────────────
export const LEADERBOARD = {
  TOP_THREE_LIMIT: 3,
  TOP_TEN_LIMIT: 10,
  TOP_FIFTY_LIMIT: 50,
  MEDALS: {
    GOLD: '🥇',
    SILVER: '🥈',
    BRONZE: '🥉',
  },
};

// ── Date Formats ──────────────────────────────────────────────────
export const DATE_FORMATS = {
  DISPLAY_DATE: 'MMM dd, yyyy',
  DISPLAY_TIME: 'h:mm a',
  DISPLAY_DATETIME: 'MMM dd, yyyy h:mm a',
  API_DATE: 'yyyy-MM-dd',
  API_DATETIME: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSz',
};

// ── UI Constants ──────────────────────────────────────────────────
export const UI = {
  ANIMATION_DURATION_FAST: 150,
  ANIMATION_DURATION_NORMAL: 300,
  ANIMATION_DURATION_SLOW: 500,
  TOAST_DURATION_DEFAULT: 3000,
  TOAST_DURATION_ERROR: 5000,
  MODAL_ANIMATION_DURATION: 200,
};

// ── Request Timeout ───────────────────────────────────────────────
export const REQUEST_TIMEOUT = {
  DEFAULT: 60000,
  LONG_RUNNING: 90000,
  REPORT_EXPORT: 60000,
};

// ── Validation ────────────────────────────────────────────────────
export const VALIDATION = {
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 100,
  MIN_ACTIVITY_AMOUNT: 0.01,
  MAX_ACTIVITY_AMOUNT: 999999,
};

// ── Color Codes (for charts, badges, etc.) ───────────────────────
export const COLORS = {
  PRIMARY: '#16a34a',   // Green
  SECONDARY: '#0d9488',  // Teal
  SUCCESS: '#16a34a',    // Green
  WARNING: '#f59e0b',    // Amber
  DANGER: '#ef4444',     // Red
  INFO: '#06b6d4',       // Cyan
  NEUTRAL: '#64748b',    // Slate
};

export default {
  HTTP_STATUS,
  API_ERRORS,
  USER_ROLES,
  API_ENDPOINTS,
  CACHE_KEYS,
  ACTIVITY_CATEGORIES,
  ACTIVITY_TYPES,
  PAGINATION,
  LEADERBOARD,
  DATE_FORMATS,
  UI,
  REQUEST_TIMEOUT,
  VALIDATION,
  COLORS,
};
