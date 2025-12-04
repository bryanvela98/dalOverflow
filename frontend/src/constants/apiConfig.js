/**
 * API Configuration
 * Centralized configuration for API endpoints
 * Supports both development and production environments
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5001/api"
    : "https://reclinate-progestational-verda.ngrok-free.dev/api");

export default API_BASE_URL;
