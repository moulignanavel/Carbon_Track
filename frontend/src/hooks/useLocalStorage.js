import { useState } from 'react';

/**
 * useLocalStorage
 *
 * Like useState, but synced to localStorage.
 *
 * @param {string} key          — localStorage key
 * @param {*}      initialValue — default value if key is absent
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      console.warn(`useLocalStorage: failed to set "${key}"`, err);
    }
  };

  return [storedValue, setValue];
}
