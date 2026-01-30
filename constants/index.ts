/**
 * App-wide constants. Keeps magic numbers in one place for easier tuning and consistency.
 */

/** React Query: time until data is considered stale (refetch on mount after this). */
export const QUERY_STALE_TIME_MS = 1000 * 60 * 5; // 5 min

/** React Query: number of retries for failed requests. */
export const QUERY_RETRY_COUNT = 1;

/** HTTP client default timeout. */
export const API_TIMEOUT_MS = 15000;

/** Top stations cache TTL (AsyncStorage). */
export const CACHE_TTL_MS = 1000 * 60 * 30; // 30 min

/** Max reconnect attempts when stream disconnects (expo-av). */
export const MAX_RECONNECT_ATTEMPTS = 3;

// Re-export API base URLs so everything lives under constants
export { RADIO_BROWSER_BASE } from './api';
