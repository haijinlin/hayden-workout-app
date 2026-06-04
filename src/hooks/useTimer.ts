import { useCallback, useEffect, useRef, useState } from "react";

export function useTimer(initialSeconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const id = useRef<number | null>(null);

  // Update displayed seconds when a new initial value is passed in.
  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setRunning(false);
  }, [initialSeconds]);

  useEffect(() => {
    if (!running) return;
    id.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (id.current !== null) {
        clearInterval(id.current);
        id.current = null;
      }
    };
  }, [running]);

  const reset = useCallback(
    (secs: number = initialSeconds) => {
      setSecondsLeft(secs);
      setRunning(false);
    },
    [initialSeconds]
  );

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);

  return {
    secondsLeft,
    running,
    start,
    pause,
    reset,
  };
}
