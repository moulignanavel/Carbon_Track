import { useState, useEffect } from 'react';

/**
 * useDebounce
 *
 * Returns a debounced version of the value that only updates
 * after the specified delay has elapsed.
 *
 * @param {*}      value — value to debounce
 * @param {number} delay — delay in milliseconds (default 300)
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
