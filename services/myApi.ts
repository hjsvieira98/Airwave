/**
 * Client for your own API (custom backend).
 * Configures baseUrl, timeout and headers; uses the same apiClient as radioApi.
 * To use: set EXPO_PUBLIC_MY_API_URL (e.g. in app.config.js or .env) and call myApi.get/post.
 */

import { API_TIMEOUT_MS, RADIO_BROWSER_BASE } from '../constants';
import { createApiClient } from './apiClient';

export const myApiClient = createApiClient({
  baseUrl: RADIO_BROWSER_BASE,
  timeoutMs: API_TIMEOUT_MS,
  headers: {
    'User-Agent': 'Airwave/1.0',
    'Content-Type': 'application/json',
  },
});

/** Example: GET /me, POST /sessions, etc. */
export const myApi = {
  get: myApiClient.get.bind(myApiClient),
  post: myApiClient.post.bind(myApiClient),
};
