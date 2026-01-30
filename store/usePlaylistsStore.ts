import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Station } from '../types/radio';

const PLAYLISTS_KEY = '@airwave/playlists';

export interface Playlist {
  id: string;
  name: string;
  stations: Station[];
  createdAt: number;
}

export interface PlaylistsState {
  playlists: Playlist[];
  isLoaded: boolean;
  loadPlaylists: () => Promise<void>;
  createPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  addStationToPlaylist: (playlistId: string, station: Station) => void;
  removeStationFromPlaylist: (playlistId: string, stationId: string) => void;
  getPlaylistsContaining: (stationId: string) => Playlist[];
}

const generateId = () => `pl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const persist = async (playlists: Playlist[]) => {
  try {
    await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  } catch {
    // ignore
  }
};

export const usePlaylistsStore = create<PlaylistsState>((set, get) => ({
  playlists: [],
  isLoaded: false,
  loadPlaylists: async () => {
    try {
      const raw = await AsyncStorage.getItem(PLAYLISTS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      set({ playlists: Array.isArray(list) ? list : [], isLoaded: true });
    } catch {
      set({ playlists: [], isLoaded: true });
    }
  },
  createPlaylist: (name) => {
    const { playlists } = get();
    const newPl: Playlist = {
      id: generateId(),
      name,
      stations: [],
      createdAt: Date.now(),
    };
    const next = [...playlists, newPl];
    set({ playlists: next });
    persist(next);
  },
  deletePlaylist: (id) => {
    const { playlists } = get();
    const next = playlists.filter((p) => p.id !== id);
    set({ playlists: next });
    persist(next);
  },
  renamePlaylist: (id, name) => {
    const { playlists } = get();
    const next = playlists.map((p) => (p.id === id ? { ...p, name } : p));
    set({ playlists: next });
    persist(next);
  },
  addStationToPlaylist: (playlistId, station) => {
    const { playlists } = get();
    const next = playlists.map((p) => {
      if (p.id !== playlistId) return p;
      if (p.stations.some((s) => s.id === station.id)) return p;
      return { ...p, stations: [...p.stations, station] };
    });
    set({ playlists: next });
    persist(next);
  },
  removeStationFromPlaylist: (playlistId, stationId) => {
    const { playlists } = get();
    const next = playlists.map((p) =>
      p.id === playlistId ? { ...p, stations: p.stations.filter((s) => s.id !== stationId) } : p
    );
    set({ playlists: next });
    persist(next);
  },
  getPlaylistsContaining: (stationId) => {
    return get().playlists.filter((p) => p.stations.some((s) => s.id === stationId));
  },
}));
