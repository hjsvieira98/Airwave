# Airwave

A production-ready React Native radio streaming app. Discover and stream thousands of live radio stations worldwide, with a Spotify-like UI, background playback, and full offline-first state.

**Data source:** [Radio Browser API](https://api.radio-browser.info/) (public, no API key required).

---

## Features

- **Home** – Greeting, “Jump back in” (resume last station), “Made for you” (top stations), recently played, trending
- **Search** – Full-text search and filters by genre (tag), country, and language; infinite scroll; debounced input
- **Library** – Liked stations, recently played, and custom playlists (create, add stations, remove)
- **Player** – Full-screen player with artwork, play/pause, volume, previous/next (queue), add to queue/playlist, share, sleep timer
- **Mini player** – Persistent bar above tabs; tap to open full player; playback continues when navigating
- **Settings** – Dark/light theme, language (EN/PT), clear cache, app version and data source info
- **Background playback** – Audio continues when the app is minimised or the screen is locked (iOS/Android)
- **Internationalisation** – English and Portuguese (UI and copy)

---

## Tech stack

| Area | Stack |
|------|--------|
| Framework | Expo SDK 54, React 19, React Native, TypeScript |
| Routing | Expo Router (file-based, tabs + stack) |
| Audio | expo-av (streaming, background mode) |
| Data & API | React Query (TanStack), fetch via `apiClient`, no axios |
| State | Zustand (player, settings, favorites, recently played, queue, playlists) |
| Persistence | AsyncStorage (last station, favorites, recent, queue, playlists, theme, locale) |
| UI | React Native core, Safe Area, Reanimated, Linear Gradient, Ionicons |
| i18n | i18next, react-i18next, expo-localization |

---

## Prerequisites

- Node.js 18+
- npm (or yarn/pnpm)
- Expo Go (optional, for quick testing) or a dev/build toolchain for iOS/Android

---

## Getting started

### Install

```bash
git clone <repo-url>
cd Airwave
npm install
```

### Run

```bash
npm start
```

Then:

- Scan the QR code with **Expo Go** (Android/iOS), or
- Press `a` for Android emulator / `i` for iOS simulator, or
- Run `npm run android` / `npm run ios` to open the dev client on a device/emulator.

### Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Start and open on Android |
| `npm run ios` | Start and open on iOS |
| `npm run web` | Start for web (limited audio support) |

---

## Configuration

### Environment variables (optional)

Create a `.env` or set in `app.config.js` (with Expo’s `extra` or `env`):

| Variable | Description | Default |
|----------|-------------|---------|
| `EXPO_PUBLIC_RADIO_BROWSER_URL` | Radio Browser API base URL | `https://de1.api.radio-browser.info/json` |
| `EXPO_PUBLIC_MY_API_URL` | Your own API base URL (for `myApi`) | `https://api.example.com` |

API base URLs are defined in `constants/api.ts` and re-exported from `constants/index.ts`.

---

## Project structure

```
Airwave/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout (QueryClient, AudioController, Stack)
│   ├── index.tsx           # Entry redirect
│   ├── (tabs)/             # Tab navigator
│   │   ├── _layout.tsx     # Tabs + MiniPlayer
│   │   ├── home.tsx
│   │   ├── search.tsx
│   │   ├── library.tsx
│   │   └── settings.tsx
│   ├── player/[stationId].tsx
│   └── playlist/[playlistId].tsx
├── assets/                 # Icons, splash, favicon
├── components/             # Reusable UI
│   ├── AudioController.tsx # Global audio (mount in root layout)
│   ├── MiniPlayer.tsx
│   ├── StationCard.tsx, StationCardSpotify.tsx
│   ├── EmptyState.tsx, ErrorState.tsx
│   ├── SectionHeader.tsx
│   └── SkeletonLoader.tsx
├── constants/              # App-wide constants
│   ├── index.ts            # Stale time, timeout, cache TTL, etc.
│   └── api.ts              # API base URLs (RADIO_BROWSER_BASE, MY_API_BASE_URL)
├── hooks/
│   ├── useAudioPlayer.ts   # Thin wrapper over player store
│   ├── useApiQuery.ts      # GET + mutations with React Query
│   ├── useRadioQueries.ts  # useTopClicked, useStationById, useSearchStationsInfinite, etc.
│   ├── useMyApi.ts         # useMyApiQuery, useMyApiMutation (your API)
│   └── useSleepTimer.ts
├── i18n/
│   ├── index.ts            # i18next config, locale detection
│   └── locales/            # en.json, pt.json
├── services/
│   ├── apiClient.ts        # createApiClient (fetch, timeout, headers)
│   ├── radioApi.ts         # Radio Browser API (stations, search, tags, countries, languages)
│   └── myApi.ts            # Your API client (get/post)
├── store/                  # Zustand
│   ├── usePlayerStore.ts   # Current station, status, play/pause/stop, registerAudioActions
│   ├── useSettingsStore.ts # Theme, locale
│   ├── useFavoritesStore.ts
│   ├── useRecentlyPlayedStore.ts
│   ├── useQueueStore.ts
│   └── usePlaylistsStore.ts
├── theme/                  # Colors (light/dark), typography, spacing, borderRadius
├── types/                  # Station, RadioBrowserStationRaw, mapApiStationToStation
├── utils/                  # format, cache, greeting
├── app.json
├── package.json
└── tsconfig.json
```

---

## Architecture

- **Single source of truth for playback** – `usePlayerStore` holds current station and status; actual audio is owned by `AudioController` (mounted once in root layout). Hooks and screens call store actions; no duplicate sound instances.
- **API layer** – `apiClient` (fetch + timeout + JSON) is used by `radioApi` and `myApi`. All Radio Browser usage goes through React Query (`useRadioQueries`, `useApiQuery`). Your API can use `useMyApiQuery` / `useMyApiMutation`.
- **Constants** – Timeouts, cache TTL, query stale time, and API base URLs live in `constants/` to avoid magic numbers and centralise config.
- **Theme** – `theme/index.ts` exports light/dark palettes and typography; screens use `getColors(effective)` and `useSettingsStore` for theme.

---

## Internationalisation (i18n)

- **Libraries:** i18next, react-i18next, expo-localization.
- **Locales:** English (`en`), Portuguese (`pt`). Locale is stored in settings and persisted.
- **Usage:** `useTranslation()` in components; keys live in `i18n/locales/en.json` and `pt.json`.

---

## Building for production

- **Development build (recommended for background audio):**  
  `npx expo run:ios` / `npx expo run:android`  
  Background audio is configured (e.g. `UIBackgroundModes: ["audio"]` on iOS) and works in dev builds; it may not work in Expo Go.

- **EAS Build:**  
  Configure `eas.json` and run `eas build --platform ios` or `--platform android` for store-ready binaries.

---

## Data source and licensing

- Station data and stream URLs come from the [Radio Browser API](https://api.radio-browser.info/).  
- Check the API’s terms and the licensing of each station for distribution and usage.

---

## License

Private project. All rights reserved.
