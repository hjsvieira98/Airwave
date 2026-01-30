import { usePlayerStore } from '../store/usePlayerStore';

/**
 * Thin wrapper around the player store. Actual audio is controlled by
 * AudioController (mounted in root layout) so playback continues when
 * navigating between screens.
 */
export function useAudioPlayer() {
  const currentStation = usePlayerStore((s) => s.currentStation);
  const status = usePlayerStore((s) => s.status);
  const volume = usePlayerStore((s) => s.volume);
  const play = usePlayerStore((s) => s.play);
  const stop = usePlayerStore((s) => s.stop);
  const pause = usePlayerStore((s) => s.pause);
  const resume = usePlayerStore((s) => s.resume);
  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);
  const setVolume = usePlayerStore((s) => s.setVolume);

  return {
    currentStation,
    status,
    volume,
    play,
    stop,
    pause,
    resume,
    togglePlayPause,
    setVolume,
  };
}
