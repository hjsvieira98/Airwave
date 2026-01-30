import { useCallback, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { MAX_RECONNECT_ATTEMPTS } from '../constants';
import type { Station } from '../types/radio';
import { usePlayerStore } from '../store/usePlayerStore';
import { useRecentlyPlayedStore } from '../store/useRecentlyPlayedStore';

/** Audio mode so playback continues in background (app minimised or screen locked). */
const BACKGROUND_AUDIO_MODE = {
  allowsRecordingIOS: false,
  playsInSilentModeIOS: true,
  staysActiveInBackground: true,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
} as const;

const validateStreamUrl = (url: string): boolean => {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};


export function AudioController() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const reconnectAttempts = useRef(0);

  const setCurrentStation = usePlayerStore((s) => s.setCurrentStation);
  const setStatus = usePlayerStore((s) => s.setStatus);
  const setError = usePlayerStore((s) => s.setError);
  const volume = usePlayerStore((s) => s.volume);
  const registerAudioActions = usePlayerStore((s) => s.registerAudioActions);
  const addRecent = useRecentlyPlayedStore((s) => s.add);

  const unloadSound = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch {
        // ignore
      }
      soundRef.current = null;
    }
  }, []);

  const stop = useCallback(async () => {
    await unloadSound();
    setCurrentStation(null);
    setStatus('idle');
    reconnectAttempts.current = 0;
  }, [unloadSound, setCurrentStation, setStatus]);

  const play = useCallback(
    async (station: Station) => {
      if (!validateStreamUrl(station.streamUrl)) {
        setError('Invalid stream URL');
        setStatus('error');
        return;
      }

      // Only one station at a time: always unload any current sound before starting another.
      await unloadSound();

      setCurrentStation(station);
      setStatus('loading');
      setError(null);
      addRecent(station);

      try {
        await Audio.setAudioModeAsync(BACKGROUND_AUDIO_MODE);

        const { sound } = await Audio.Sound.createAsync(
          { uri: station.streamUrl },
          { shouldPlay: true, volume },
          (playbackStatus) => {
            if (!playbackStatus.isLoaded) return;
            if (playbackStatus.didJustFinish) {
              if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts.current += 1;
                soundRef.current?.replayAsync();
              } else {
                setStatus('error');
                setError('Stream disconnected');
              }
            }
          }
        );

        soundRef.current = sound;
        setStatus('playing');
        reconnectAttempts.current = 0;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Playback failed';
        setError(message);
        setStatus('error');
        await unloadSound();
        setCurrentStation(null);
      }
    },
    [volume, unloadSound, setCurrentStation, setStatus, setError, addRecent]
  );

  const pause = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setStatus('paused');
    }
  }, [setStatus]);

  const resume = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setStatus('playing');
    }
  }, [setStatus]);

  const togglePlayPause = useCallback(async () => {
    const station = usePlayerStore.getState().currentStation;
    const status = usePlayerStore.getState().status;
    if (!station) return;
    if (status === 'playing') {
      await pause();
    } else if (status === 'paused' || status === 'loading') {
      await resume();
    }
  }, [pause, resume]);

  const setVolumeImpl = useCallback((value: number) => {
    const v = Math.max(0, Math.min(1, value));
    if (soundRef.current) {
      soundRef.current.setVolumeAsync(v);
    }
  }, []);

  // Set background audio mode as soon as the controller mounts.
  useEffect(() => {
    Audio.setAudioModeAsync(BACKGROUND_AUDIO_MODE).catch(() => {});
  }, []);

  useEffect(() => {
    registerAudioActions({
      play,
      pause,
      resume,
      stop,
      setVolume: setVolumeImpl,
      togglePlayPause,
    });
  }, [registerAudioActions, play, pause, resume, stop, setVolumeImpl, togglePlayPause]);

  return null;
}
