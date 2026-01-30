import AsyncStorage from '@react-native-async-storage/async-storage';
import { CACHE_TTL_MS } from '../constants';
import type { Station } from '../types/radio';

const CACHE_KEY = '@airwave/cache_top_stations';

interface Cached {
  data: Station[];
  ts: number;
}

export async function getCachedTopStations(): Promise<Station[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: Cached = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.data ?? null;
  } catch {
    return null;
  }
}

export async function setCachedTopStations(stations: Station[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data: stations, ts: Date.now() })
    );
  } catch {
    // ignore
  }
}

export async function clearCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}
