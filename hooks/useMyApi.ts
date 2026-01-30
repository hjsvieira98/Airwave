import type { QueryKey } from '@tanstack/react-query';
import { useApiQuery, useApiMutation } from './useApiQuery';
import { myApi } from '../services/myApi';

/**
 * GET requests to your API with React Query.
 * e.g. useMyApiQuery(['me'], () => myApi.get('/me'))
 */
export function useMyApiQuery<TData = unknown, TError = Error>(
  queryKey: QueryKey,
  fetcher: () => Promise<TData>,
  options?: Parameters<typeof useApiQuery<TData, TError>>[2]
) {
  return useApiQuery<TData, TError>(queryKey, fetcher, options);
}

/**
 * Mutations for your API (POST/PUT/DELETE).
 * e.g. useMyApiMutation((body) => myApi.post('/sessions', body))
 */
export function useMyApiMutation<TData = unknown, TError = Error, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Parameters<typeof useApiMutation<TData, TError, TVariables>>[1]
) {
  return useApiMutation<TData, TError, TVariables>(mutationFn, options);
}
