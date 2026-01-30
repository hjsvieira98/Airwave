export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const },
  h2: { fontSize: 24, fontWeight: '700' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodySmall: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  label: { fontSize: 14, fontWeight: '600' as const },
  overline: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.5 },
} as const;

const SPOTIFY_GREEN = '#1DB954';
const SPOTIFY_GREEN_DARK = '#1ed760';

export const lightColors = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceElevated: '#FFFFFF',
  primary: SPOTIFY_GREEN,
  primaryMuted: '#b3ffd4',
  text: '#000000',
  textSecondary: '#535353',
  textMuted: '#727272',
  border: '#E5E5E5',
  error: '#E91429',
  success: SPOTIFY_GREEN,
  cardShadow: 'rgba(0,0,0,0.08)',
  overlay: 'rgba(0,0,0,0.5)',
} as const;

export const darkColors = {
  background: '#121212',
  surface: '#181818',
  surfaceElevated: '#282828',
  primary: SPOTIFY_GREEN,
  primaryMuted: SPOTIFY_GREEN_DARK,
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textMuted: '#727272',
  border: '#282828',
  error: '#E91429',
  success: SPOTIFY_GREEN,
  cardShadow: 'rgba(0,0,0,0.4)',
  overlay: 'rgba(0,0,0,0.7)',
} as const;

export type ColorScheme = 'light' | 'dark';

export const getColors = (scheme: ColorScheme) =>
  scheme === 'dark' ? darkColors : lightColors;
