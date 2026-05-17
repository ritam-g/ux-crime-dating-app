/**
 * @file axios.js
 * @description Central axios client configured for cookie-based authentication.
 *
 * This instance sends credentials automatically so the browser includes the
 * HTTP-only JWT cookie on every request to the backend.
 */
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
