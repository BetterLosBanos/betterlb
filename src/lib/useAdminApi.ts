/**
 * React hook for admin API calls
 *
 * Provides loading, error, and data states for API operations.
 *
 * @example
 * ```tsx
 * // Simple fetch
 * const { data, loading, error, refresh } = useAdminApi(
 *   () => adminApi.documents.list({ limit: 20 })
 * );
 *
 * // With dependencies
 * const { data, loading, error } = useAdminApi(
 *   () => adminApi.documents.list({ type: documentType }),
 *   [documentType]
 * );
 *
 * // Mutation
 * const { mutate, loading, error } = useAdminMutation(
 *   (data) => adminApi.documents.create(data)
 * );
 * ```
 */

import { useCallback, useEffect, useState } from 'react';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export interface MutationState<TData = unknown, TVariables = unknown> {
  mutate: (variables: TVariables) => Promise<TData | null>;
  loading: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Hook for data fetching with loading/error states
 */
export function useAdminApi<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[] = []
): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, ...deps]);

  return { data, loading, error, refresh: fetchData };
}

/**
 * Hook for mutations (create, update, delete)
 */
export function useAdminMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>
): MutationState<TData, TVariables> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | null> => {
      try {
        setLoading(true);
        setError(null);
        const result = await mutationFn(variables);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { mutate, loading, error, reset };
}
