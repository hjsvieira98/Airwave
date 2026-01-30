import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Station } from '../types/radio';

const QUEUE_KEY = '@airwave/queue';

export interface QueueState {
  items: Station[];
  isLoaded: boolean;
  loadQueue: () => Promise<void>;
  setQueue: (items: Station[]) => void;
  addToQueue: (station: Station) => void;
  removeFromQueue: (stationId: string) => void;
  clearQueue: () => void;
  getNext: (currentId: string) => Station | null;
  getPrevious: (currentId: string) => Station | null;
}

const persist = async (items: Station[]) => {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
};

export const useQueueStore = create<QueueState>((set, get) => ({
  items: [],
  isLoaded: false,
  loadQueue: async () => {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      set({ items: Array.isArray(list) ? list : [], isLoaded: true });
    } catch {
      set({ items: [], isLoaded: true });
    }
  },
  setQueue: (items) => {
    set({ items });
    persist(items);
  },
  addToQueue: (station) => {
    const { items } = get();
    if (items.some((s) => s.id === station.id)) return;
    const next = [...items, station];
    set({ items: next });
    persist(next);
  },
  removeFromQueue: (stationId) => {
    const { items } = get();
    const next = items.filter((s) => s.id !== stationId);
    set({ items: next });
    persist(next);
  },
  clearQueue: () => {
    set({ items: [] });
    persist([]);
  },
  getNext: (currentId) => {
    const { items } = get();
    const idx = items.findIndex((s) => s.id === currentId);
    if (idx < 0 || idx >= items.length - 1) return null;
    return items[idx + 1] ?? null;
  },
  getPrevious: (currentId) => {
    const { items } = get();
    const idx = items.findIndex((s) => s.id === currentId);
    if (idx <= 0) return null;
    return items[idx - 1] ?? null;
  },
}));
