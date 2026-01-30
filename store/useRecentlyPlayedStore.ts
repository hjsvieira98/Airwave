import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Station } from '../types/radio';

const RECENTLY_PLAYED_KEY = '@airwave/recently_played';
const MAX_RECENT = 50;

export interface RecentlyPlayedState {
  items: Station[];
  isLoaded: boolean;
  load: () => Promise<void>;
  add: (station: Station) => Promise<void>;
  clear: () => Promise<void>;
}

const persist = async (items: Station[]) => {
  await AsyncStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(items));
};

export const useRecentlyPlayedStore = create<RecentlyPlayedState>((set, get) => ({
  items: [],
  isLoaded: false,
  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(RECENTLY_PLAYED_KEY);
      const list = raw ? JSON.parse(raw) : [];
      set({ items: Array.isArray(list) ? list : [], isLoaded: true });
    } catch {
      set({ items: [], isLoaded: true });
    }
  },
  add: async (station) => {
    const { items } = get();
    const filtered = items.filter((s) => s.id !== station.id);
    const next = [station, ...filtered].slice(0, MAX_RECENT);
    set({ items: next });
    await persist(next);
  },
  clear: async () => {
    set({ items: [] });
    await AsyncStorage.removeItem(RECENTLY_PLAYED_KEY);
  },
}));
