import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export function useStoredState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(key)
      .then((stored) => {
        if (!mounted || stored === null) return;
        setValue(JSON.parse(stored) as T);
      })
      .finally(() => {
        if (mounted) setReady(true);
      });

    return () => {
      mounted = false;
    };
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => undefined);
  }, [key, ready, value]);

  return [value, setValue, ready] as const;
}
