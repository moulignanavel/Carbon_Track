/**
 * activityContextValue.js
 * ─────────────────────────────────────────────────────────────
 * Holds the shared React context object for activity logs.
 * Kept in its own module so HMR updates to ActivityContext.jsx
 * never invalidate the context reference (which would cause
 * "must be used within a Provider" errors).
 */
import { createContext } from 'react';

const ActivityContext = createContext(null);
export default ActivityContext;
