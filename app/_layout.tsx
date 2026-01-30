import '../i18n';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AudioController } from '../components';
import { QUERY_RETRY_COUNT, QUERY_STALE_TIME_MS } from '../constants';
import { useSettingsStore } from '../store/useSettingsStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useRecentlyPlayedStore } from '../store/useRecentlyPlayedStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { useQueueStore } from '../store/useQueueStore';
import { usePlaylistsStore } from '../store/usePlaylistsStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME_MS,
      retry: QUERY_RETRY_COUNT,
    },
  },
});

export default function RootLayout() {
  const scheme = useColorScheme();
  const loadTheme = useSettingsStore((s) => s.loadTheme);
  const loadLocale = useSettingsStore((s) => s.loadLocale);
  const setColorScheme = useSettingsStore((s) => s.setColorScheme);
  const loadFavorites = useFavoritesStore((s) => s.loadFavorites);
  const loadRecent = useRecentlyPlayedStore((s) => s.load);
  const loadLastStationId = usePlayerStore((s) => s.loadLastStationId);
  const loadQueue = useQueueStore((s) => s.loadQueue);
  const loadPlaylists = usePlaylistsStore((s) => s.loadPlaylists);
  const colorScheme = useSettingsStore((s) => s.colorScheme);

  useEffect(() => {
    loadTheme();
    loadLocale();
  }, [loadTheme, loadLocale]);

  useEffect(() => {
    const theme = useSettingsStore.getState().colorScheme;
    if (theme === 'light' || theme === 'dark') {
      setColorScheme(theme);
    }
  }, [scheme]);

  useEffect(() => {
    loadFavorites();
    loadRecent();
    loadLastStationId();
    loadQueue();
    loadPlaylists();
  }, [loadFavorites, loadRecent, loadLastStationId, loadQueue, loadPlaylists]);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <AudioController />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="player/[stationId]" options={{ presentation: 'card' }} />
        <Stack.Screen name="playlist/[playlistId]" options={{ presentation: 'card' }} />
      </Stack>
    </QueryClientProvider>
  );
}
