/**
 * API base URLs and endpoint config. Single place for all external API origins.
 * Use env vars for secrets or per-environment overrides (e.g. EXPO_PUBLIC_MY_API_URL).
 */

/** Radio Browser API (public, no auth). Override with EXPO_PUBLIC_RADIO_BROWSER_URL if needed. */
export const RADIO_BROWSER_BASE =
  process.env.EXPO_PUBLIC_RADIO_BROWSER_URL ?? 'https://de1.api.radio-browser.info/json';

