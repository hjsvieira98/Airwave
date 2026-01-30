import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from '@tanstack/react-query';

/**
 * Custom hook that abstracts GET requests with React Query.
 * Same pattern for all APIs: queryKey + fetcher (fetcher can use apiClient).
 */
export function useApiQuery<TData = unknown, TError = Error>(
  queryKey: QueryKey,
  fetcher: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn: fetcher,
    ...options,
  });
}

/**
 * Custom hook for requests that change data (POST/PUT/DELETE).
 * Use with your API when you need mutations.
 */
export function useApiMutation<TData = unknown, TError = Error, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>
) {
  return useMutation<TData, TError, TVariables>({
    mutationFn,
    ...options,
  });
}

/**
 * Helper to invalidate queries after a mutation (e.g. invalidate list after creating an item).
 */
export function useInvalidateQueries() {
  return useQueryClient().invalidateQueries;
}
