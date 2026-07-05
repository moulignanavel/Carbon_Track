/**
 * axiosInstance.js
 * ─────────────────────────────────────────────────────────────
 * Shared Axios client used by every API service module.
 * 
 * NOTE: This file now delegates to the enhanced config in src/config/axiosConfig.js
 * For advanced features (retry logic, logging, etc.), use the config directly.
 * 
 * This module is kept for backward compatibility with existing API files.
 * New API files should import from @/config/axiosConfig instead.
 * 
 * CORS note: Spring Boot has CORS disabled in SecurityConfig.
 * The Vite dev-server proxy (vite.config.js) bridges the gap
 * in development. For production, configure your reverse-proxy
 * or re-enable CORS on the backend.
 */

// Import enhanced Axios instance from config
import { axiosInstance } from '@/config/axiosConfig';

export default axiosInstance;
