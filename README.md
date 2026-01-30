# Airwave

Production-grade React Native radio streaming app (Expo + TypeScript). Stream real stations via [Radio Browser API](https://api.radio-browser.info/).

## Run

```bash
npm install
npm start
```

Then open in Expo Go (Android/iOS) or run `npm run android` / `npm run ios`.

## Features

- **Home**: Top stations, trending, recently played, resume last station
- **Browse**: Search + filters (genre, country, language), infinite scroll
- **Player**: Play/pause, volume, sleep timer, favorites, background playback
- **Favorites**: Persisted list, remove with button
- **Settings**: Dark/light theme, clear cache, app version

## Stack

- Expo (SDK 54), TypeScript, Expo Router, expo-av, Zustand, AsyncStorage, Axios, Reanimated, Haptics, Linear Gradient

## Project structure

- `app/` – Expo Router screens (tabs + player)
- `components/` – UI (StationCard, MiniPlayer, SkeletonLoader, etc.)
- `hooks/` – useAudioPlayer, useSleepTimer
- `services/` – Radio Browser API client
- `store/` – Zustand (player, settings, favorites, recently played)
- `theme/` – Colors, typography, spacing
- `types/` – Station / API types
- `utils/` – Format, cache
