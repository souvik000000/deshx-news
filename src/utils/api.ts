// Base URL of the backend API.
// - In local dev, leave VITE_API_URL unset: requests go to '/api/...' and Vite proxies/serves them.
// - In production (Firebase Hosting), set VITE_API_URL to your deployed backend's origin
//   (e.g. https://deshx-api.onrender.com) as a build-time env var.
const RAW_BASE = import.meta.env.VITE_API_URL || '';

// Strip any trailing slash so we don't end up with '//api/...'
export const API_BASE = RAW_BASE.replace(/\/$/, '');

/**
 * Builds a full API URL. Pass a path starting with '/api/...'.
 * Example: apiUrl('/api/feed?lang=en') -> 'https://deshx-api.onrender.com/api/feed?lang=en'
 * (or just '/api/feed?lang=en' when VITE_API_URL is unset, e.g. in local dev)
 */
export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
