import { useState, useCallback } from 'react';

/**
 * useAsync
 *
 * Generic hook for wrapping async operations with loading / error state.
 *
 * @param {Function} asyncFn  — the async function to call
 * @returns {{ execute, data, isLoading, error, reset }}
 *
 * @example
 * const { execute, data, isLoading } = useAsync(fetchProfile);
 * useEffect(() => { execute(); }, []);
 */
export function useAsync(asyncFn) {
  const [data,      setData]      = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);

  const execute = useCallback(async (...args) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await asyncFn(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [asyncFn]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { execute, data, isLoading, error, reset };
}
