import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Station } from '../types/radio';

const LAST_STATION_KEY = '@airwave/last_station_id';

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

type PlayFn = (station: Station) => void | Promise<void>;
type VoidFn = () => void | Promise<void>;
type SetVolumeFn = (value: number) => void;

export interface PlayerState {
  currentStation: Station | null;
  status: PlaybackStatus;
  error: string | null;
  lastStationId: string | null;
  volume: number;
  setCurrentStation: (station: Station | null) => void;
  setStatus: (status: PlaybackStatus) => void;
  setError: (error: string | null) => void;
  setLastStationId: (id: string | null) => void;
  setVolume: SetVolumeFn;
  play: PlayFn;
  pause: VoidFn;
  resume: VoidFn;
  stop: VoidFn;
  togglePlayPause: VoidFn;
  registerAudioActions: (actions: {
    play: PlayFn;
    pause: VoidFn;
    resume: VoidFn;
    stop: VoidFn;
    setVolume: SetVolumeFn;
    togglePlayPause: VoidFn;
  }) => void;
  loadLastStationId: () => Promise<void>;
  reset: () => void;
}

const noop = () => {};
const noopPlay: PlayFn = () => {};
const noopSetVolume: SetVolumeFn = () => {};

const initialState = {
  currentStation: null as Station | null,
  status: 'idle' as PlaybackStatus,
  error: null as string | null,
  lastStationId: null as string | null,
  volume: 1,
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  ...initialState,
  setCurrentStation: (currentStation) => {
    const lastStationId = currentStation?.id ?? null;
    if (lastStationId) AsyncStorage.setItem(LAST_STATION_KEY, lastStationId);
    set({ currentStation, lastStationId, error: null });
  },
  setStatus: (status) => set({ status, error: status === 'error' ? null : null }),
  setError: (error) => set({ error, status: 'error' as const }),
  setLastStationId: (lastStationId) => set({ lastStationId }),
  setVolume: noopSetVolume,
  play: noopPlay,
  pause: noop,
  resume: noop,
  stop: noop,
  togglePlayPause: noop,
  registerAudioActions: (actions) => {
    set({
      play: actions.play,
      pause: actions.pause,
      resume: actions.resume,
      stop: actions.stop,
      togglePlayPause: actions.togglePlayPause,
      setVolume: (v: number) => {
        const v2 = Math.max(0, Math.min(1, v));
        set({ volume: v2 });
        actions.setVolume(v2);
      },
    });
  },
  loadLastStationId: async () => {
    try {
      const id = await AsyncStorage.getItem(LAST_STATION_KEY);
      if (id) set({ lastStationId: id });
    } catch {
      // ignore
    }
  },
  reset: () => set({ ...initialState, play: noopPlay, pause: noop, resume: noop, stop: noop, togglePlayPause: noop, setVolume: noopSetVolume }),
}));
