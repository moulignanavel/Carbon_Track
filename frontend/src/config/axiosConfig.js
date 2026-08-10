/**
 * axiosConfig.js
 * ─────────────────────────────────────────────────────────────
 * Enhanced Axios configuration with retry logic, interceptors,
 * error handling, and request/response logging.
 * 
 * This replaces the basic axiosInstance.js with advanced features:
 *   - Automatic retry with exponential backoff
 *   - Request/response logging in development
 *   - Centralized error handling
 *   - Request deduplication (optional)
 *   - Cache support (optional)
 */

import axios from 'axios';
import { env } from './env';
import { getToken, clearAuth } from '@/utils/storage';
import { HTTP_STATUS, API_ERRORS } from './constants';

/**
 * Create configured Axios instance
 */
// Debounce flag — prevents multiple simultaneous 401s from each triggering a redirect
let _redirectingTo401 = false;

export function createAxiosInstance() {
  const instance = axios.create({
    baseURL: `${env.api.baseURL}/api`,
    timeout: env.api.timeout,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // ── Request Interceptor: Attach JWT Token ─────────────────────────
  instance.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add request ID for logging
      config.requestId = generateRequestId();

      // Log request in development
      if (env.api.debugAPI) {
        console.log(`[API] Request #${config.requestId}:`, {
          method: config.method.toUpperCase(),
          url: config.url,
          timestamp: new Date().toISOString(),
        });
      }

      return config;
    },
    (error) => {
      console.error('[API] Request error:', error);
      return Promise.reject(error);
    }
  );

  // ── Response Interceptor: Handle Success & Errors ────────────────
  instance.interceptors.response.use(
    (response) => {
      if (env.api.debugAPI) {
        console.log(`[API] Response #${response.config.requestId}:`, {
          status: response.status,
          statusText: response.statusText,
          timestamp: new Date().toISOString(),
        });
      }
      return response;
    },
    (error) => {
      const { response, config, message } = error;

      // Log error details
      if (env.api.debugAPI) {
        console.error(`[API] Error #${config?.requestId}:`, {
          status: response?.status,
          statusText: response?.statusText,
          message,
          data: response?.data,
        });
      }

      // Handle 401 Unauthorized
      if (response?.status === HTTP_STATUS.UNAUTHORIZED) {
        // Do not redirect on 401 from login/register endpoints (wrong password ≠ expired session)
        const isAuthEndpoint =
          config.url?.includes('/auth/login') ||
          config.url?.includes('/auth/register') ||
          config.url?.includes('/auth/google');
        // Do not redirect if already on an auth page path
        const isAuthPage =
          window.location.pathname === '/' ||
          window.location.pathname.startsWith('/login') ||
          window.location.pathname.startsWith('/register') ||
          window.location.pathname.startsWith('/forgot-password') ||
          window.location.pathname.startsWith('/reset-password');

        if (env.auth.autoLogoutOn401 && !isAuthEndpoint && !isAuthPage && !_redirectingTo401) {
          _redirectingTo401 = true;
          clearAuth();
          window.location.replace('/?reason=session_expired');
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
}

/**
 * Create retry wrapper for Axios instance
 * Implements exponential backoff retry logic
 */
export function createRetryableAxiosInstance(baseInstance) {
  const instance = axios.create(baseInstance.defaults);

  // Copy interceptors from base instance
  instance.interceptors.request.handlers = baseInstance.interceptors.request.handlers;
  instance.interceptors.response.handlers = baseInstance.interceptors.response.handlers;

  // Add retry interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config;

      // Initialize retry count
      if (!config.__retryCount) {
        config.__retryCount = 0;
      }

      // Only retry idempotent HTTP methods (GET, HEAD, OPTIONS) to prevent duplicate POST/PUT operations
      const isIdempotent = ['get', 'head', 'options'].includes(config.method?.toLowerCase());

      // Check if should retry
      const shouldRetry =
        isIdempotent &&
        config.__retryCount < env.retries.maxRetries &&
        error.response &&
        [408, 429, 500, 502, 503, 504].includes(error.response.status);

      if (!shouldRetry) {
        return Promise.reject(error);
      }

      config.__retryCount++;

      // Exponential backoff delay
      const delay = env.retries.retryDelay * Math.pow(2, config.__retryCount - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (env.api.debugAPI) {
        console.log(
          `[API] Retrying request #${config.requestId} (attempt ${config.__retryCount}/${env.retries.maxRetries})`
        );
      }

      return instance(config);
    }
  );

  return instance;
}

/**
 * Generate unique request ID for logging
 */
function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format error message from various sources
 */
export function formatErrorMessage(error) {
  // API error response
  if (error.response) {
    const { status, data } = error.response;

    // Custom error message from backend
    if (data?.message) {
      return data.message;
    }

    // Status code based message
    if (status === HTTP_STATUS.UNAUTHORIZED) {
      return API_ERRORS.UNAUTHORIZED;
    }
    if (status === HTTP_STATUS.FORBIDDEN) {
      return API_ERRORS.FORBIDDEN;
    }
    if (status === HTTP_STATUS.NOT_FOUND) {
      return API_ERRORS.NOT_FOUND;
    }
    if (status === HTTP_STATUS.CONFLICT) {
      return API_ERRORS.CONFLICT;
    }
    if (status >= 500) {
      return API_ERRORS.SERVER_ERROR;
    }
    if (status >= 400) {
      return API_ERRORS.VALIDATION_ERROR;
    }
  }

  // Network error
  if (error.message === 'Network Error') {
    return API_ERRORS.NETWORK_ERROR;
  }

  // Timeout error
  if (error.code === 'ECONNABORTED') {
    return API_ERRORS.TIMEOUT;
  }

  // Default error message
  return env.errors.verbose
    ? error.message || API_ERRORS.UNKNOWN_ERROR
    : API_ERRORS.UNKNOWN_ERROR;
}

/**
 * Create the default Axios instance
 */
const baseAxiosInstance = createAxiosInstance();

/**
 * Export retryable instance as default
 */
export const axiosInstance = createRetryableAxiosInstance(baseAxiosInstance);

export default axiosInstance;
