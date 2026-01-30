import { useCallback, useEffect, useRef, useState } from 'react';

export interface SleepTimerState {
  remainingSeconds: number | null;
  isActive: boolean;
  start: (minutes: number) => void;
  cancel: () => void;
}

export function useSleepTimer(onExpire: () => void): SleepTimerState {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const cancel = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRemainingSeconds(null);
  }, []);

  const start = useCallback(
    (minutes: number) => {
      cancel();
      const total = Math.max(1, Math.floor(minutes)) * 60;
      setRemainingSeconds(total);

      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev === null || prev <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            onExpireRef.current();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [cancel]
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    remainingSeconds,
    isActive: remainingSeconds !== null && remainingSeconds > 0,
    start,
    cancel,
  };
}
