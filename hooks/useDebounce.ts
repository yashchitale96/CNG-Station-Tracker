import { useState, useEffect } from 'react';

/**
 * A hook that returns a debounced value after a specified delay.
 * Useful for reducing the frequency of updates in search inputs or other rapidly changing values.
 * @param value The value to debounce
 * @param delay The delay in milliseconds before updating the debounced value
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
