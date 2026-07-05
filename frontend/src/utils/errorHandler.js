/**
 * errorHandler.js
 * ─────────────────────────────────────────────────────────────
 * Centralized error handling and formatting for the entire app.
 * 
 * All error messages go through here for consistency.
 * Handles:
 *  - API errors (axios responses)
 *  - Network errors (no connection)
 *  - Validation errors (form/backend)
 *  - Generic JavaScript errors
 * 
 * Usage:
 *   import { formatError, getErrorMessage, logError } from '@/utils/errorHandler';
 *   
 *   try {
 *     await someAPI();
 *   } catch (error) {
 *     const message = formatError(error);  // User-friendly message
 *     toast.error(message);
 *   }
 */

/**
 * Format error into a user-friendly message string
 * Used for display in toasts, modals, alerts
 * @param {Error|AxiosError} error - The error to format
 * @param {string} fallback - Default message if can't determine error
 * @returns {string} User-friendly error message
 */
export function formatError(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;

  // Axios API error response
  if (error.response) {
    const { status, data } = error.response;

    // Spring Boot validation errors (400 with field errors)
    if (status === 400 && data?.errors) {
      const errors = Object.values(data.errors);
      return Array.isArray(errors) ? errors.join(', ') : errors;
    }

    // Backend error message
    if (data?.message && typeof data.message === 'string') {
      return data.message;
    }

    // Plain text response
    if (typeof data === 'string' && data.length < 250) {
      return data;
    }

    // HTTP status code based fallback
    return getStatusErrorMessage(status);
  }

  // Network or request error (no response received)
  if (error.request && !error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please check your connection and try again.';
    }
    return 'Cannot reach the server. Please check your connection.';
  }

  // Generic JavaScript error
  return error.message || fallback;
}

/**
 * Get user-friendly message for HTTP status code
 * @param {number} status - HTTP status code
 * @returns {string}
 */
export function getStatusErrorMessage(status) {
  const messages = {
    400: 'Invalid request. Please check your input.',
    401: 'Your session has expired. Please login again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'This resource already exists.',
    422: 'Please check your input and try again.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'Server error. Please try again later.',
    502: 'Service temporarily unavailable. Please try again.',
    503: 'Service is under maintenance. Please try again later.',
    504: 'Gateway timeout. Please check your connection and try again.',
  };

  if (status in messages) {
    return messages[status];
  }

  if (status >= 500) {
    return 'A server error occurred. Please try again later.';
  }

  if (status >= 400) {
    return 'A client error occurred. Please check your input and try again.';
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Extract structured error details for logging
 * @param {Error|AxiosError} error
 * @returns {object} Structured error details
 */
export function getErrorDetails(error) {
  if (!error) {
    return { message: 'Unknown error', type: 'unknown' };
  }

  if (error.response) {
    return {
      type: 'axios',
      status: error.response.status,
      statusText: error.response.statusText,
      message: error.response.data?.message || error.message,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data: error.response.data,
    };
  }

  if (error.request) {
    return {
      type: 'network',
      message: error.message,
      code: error.code,
    };
  }

  return {
    type: 'javascript',
    message: error.message,
    stack: error.stack,
  };
}

/**
 * Log error to console with structured format
 * In production, this could send to error tracking service (Sentry, etc)
 * @param {string} context - Where the error occurred (e.g., 'LoginForm', 'DashboardPage')
 * @param {Error|AxiosError} error
 * @param {object} extra - Additional context
 */
export function logError(context, error, extra = {}) {
  const details = getErrorDetails(error);
  const timestamp = new Date().toISOString();

  // Development: Always log
  if (import.meta.env.DEV) {
    console.error(`[${timestamp}] [${context}] Error:`, {
      details,
      extra,
    });
  }

  // Production: Could send to error tracking service
  // Example: Sentry.captureException(error, { tags: { context } });
  if (import.meta.env.PROD && window.__ERROR_TRACKING__) {
    window.__ERROR_TRACKING__.captureException(error, {
      context,
      timestamp,
      details,
      extra,
    });
  }
}

/**
 * Validate if error is a specific type
 * @param {Error} error
 * @param {string} type - 'network' | 'validation' | 'auth' | 'notfound' | 'server'
 * @returns {boolean}
 */
export function isErrorType(error, type) {
  if (!error) return false;

  if (type === 'network') {
    return error.request && !error.response;
  }

  if (type === 'validation') {
    return error.response?.status === 400;
  }

  if (type === 'auth') {
    return error.response?.status === 401;
  }

  if (type === 'notfound') {
    return error.response?.status === 404;
  }

  if (type === 'server') {
    return error.response?.status >= 500;
  }

  return false;
}

// Legacy alias for backward compatibility
export const extractErrorMessage = formatError;

export default {
  formatError,
  getStatusErrorMessage,
  getErrorDetails,
  logError,
  isErrorType,
  extractErrorMessage, // legacy
};

