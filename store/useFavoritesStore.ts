import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Station } from '../types/radio';

const FAVORITES_KEY = '@airwave/favorites';
const MAX_FAVORITES = 100;

export interface FavoritesState {
  favorites: Station[];
  isLoaded: boolean;
  loadFavorites: () => Promise<void>;
  addFavorite: (station: Station) => Promise<void>;
  removeFavorite: (stationId: string) => Promise<void>;
  isFavorite: (stationId: string) => boolean;
}

const persistFavorites = async (stations: Station[]) => {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(stations));
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  isLoaded: false,
  loadFavorites: async () => {
    try {
      const raw = await AsyncStorage.getItem(FAVORITES_KEY);
      const list = raw ? JSON.parse(raw) : [];
      set({ favorites: Array.isArray(list) ? list : [], isLoaded: true });
    } catch {
      set({ favorites: [], isLoaded: true });
    }
  },
  addFavorite: async (station) => {
    const { favorites } = get();
    if (favorites.some((f) => f.id === station.id) || favorites.length >= MAX_FAVORITES) return;
    const next = [...favorites, station];
    set({ favorites: next });
    await persistFavorites(next);
  },
  removeFavorite: async (stationId) => {
    const { favorites } = get();
    const next = favorites.filter((f) => f.id !== stationId);
    set({ favorites: next });
    await persistFavorites(next);
  },
  isFavorite: (stationId) => get().favorites.some((f) => f.id === stationId),
}));
