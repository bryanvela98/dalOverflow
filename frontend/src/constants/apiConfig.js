/**
 * API Configuration
 * Centralized configuration for API endpoints
 * Supports both development and production environments
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5001/api"
    : "http://csci5308-vm2.research.cs.dal.ca:5001/api");

export default API_BASE_URL;
