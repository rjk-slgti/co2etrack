import { useEffect, useMemo, useState } from 'react';

type InitialValue<T> = T | (() => T);
type Updater<T> = T | ((current: T) => T);

const LOCAL_EVENT_NAME = 'co2etrack-local-storage';

function resolveInitialValue<T>(initialValue: InitialValue<T>) {
  return typeof initialValue === 'function'
    ? (initialValue as () => T)()
    : initialValue;
}

function readStoredValue<T>(key: string, initialValue: InitialValue<T>) {
  if (typeof window === 'undefined') {
    return resolveInitialValue(initialValue);
  }

  const stored = window.localStorage.getItem(key);
  if (!stored) {
    return resolveInitialValue(initialValue);
  }

  try {
    return JSON.parse(stored) as T;
  } catch {
    window.localStorage.removeItem(key);
    return resolveInitialValue(initialValue);
  }
}

export function useLocalStorageState<T>(key: string, initialValue: InitialValue<T>) {
  const [value, setValue] = useState<T>(() => readStoredValue(key, initialValue));
  const initial = useMemo(() => initialValue, [initialValue]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key) return;
      setValue(readStoredValue(key, initial));
    };

    const handleLocalEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ key: string; value: T }>;
      if (customEvent.detail?.key !== key) return;
      setValue(customEvent.detail.value);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(LOCAL_EVENT_NAME, handleLocalEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(LOCAL_EVENT_NAME, handleLocalEvent as EventListener);
    };
  }, [initial, key]);

  const updateValue = (nextValue: Updater<T>) => {
    setValue((current) => {
      const resolved =
        typeof nextValue === 'function'
          ? (nextValue as (current: T) => T)(current)
          : nextValue;

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(resolved));
        window.dispatchEvent(
          new CustomEvent(LOCAL_EVENT_NAME, {
            detail: { key, value: resolved },
          })
        );
      }

      return resolved;
    });
  };

  return [value, updateValue] as const;
}
