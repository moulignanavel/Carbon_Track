/**
 * API Services Barrel Export
 * ─────────────────────────────────────────────────────────────
 * Central export point for all API services.
 * 
 * Usage:
 *   import { authService, activityService } from '@/services/api'
 *   
 * Or use the default services object:
 *   import apiServices from '@/services/api'
 *   apiServices.auth.login(...)
 */

export { default as authService } from './authService';
export { default as leaderboardService } from './leaderboardService';
export { default as goalService } from './goalService';
export { default as activityService } from './activityService';
export { default as userService } from './userService';
export { default as organisationService } from './organisationService';
export { default as dashboardService } from './dashboardService';

// Aggregate all services
const apiServices = {
  auth: require('./authService').default,
  leaderboard: require('./leaderboardService').default,
  goals: require('./goalService').default,
  activities: require('./activityService').default,
  user: require('./userService').default,
  organisation: require('./organisationService').default,
  dashboard: require('./dashboardService').default,
};

export default apiServices;
