import { useInfiniteQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiQuery } from './useApiQuery';
import { radioApi, type SearchParams } from '../services/radioApi';
import type { Station } from '../types/radio';

const QUERY_KEYS = {
  topClicked: (limit: number) => ['radio', 'topClicked', limit] as const,
  topVotes: (limit: number) => ['radio', 'topVotes', limit] as const,
  station: (id: string) => ['radio', 'station', id] as const,
  search: (params: SearchParams) => ['radio', 'search', params] as const,
  tags: (limit: number) => ['radio', 'tags', limit] as const,
  countries: (limit: number) => ['radio', 'countries', limit] as const,
  languages: (limit: number) => ['radio', 'languages', limit] as const,
};

export function useTopClicked(limit: number, options?: Omit<UseQueryOptions<Station[]>, 'queryKey' | 'queryFn'>) {
  return useApiQuery(QUERY_KEYS.topClicked(limit), () => radioApi.getTopClicked(limit), options);
}

export function useTopVotes(limit: number, options?: Omit<UseQueryOptions<Station[]>, 'queryKey' | 'queryFn'>) {
  return useApiQuery(QUERY_KEYS.topVotes(limit), () => radioApi.getTopVotes(limit), options);
}

export function useStationById(
  stationId: string | undefined,
  options?: Omit<UseQueryOptions<Station | null>, 'queryKey' | 'queryFn'>
) {
  return useApiQuery(
    QUERY_KEYS.station(stationId ?? ''),
    () => (stationId ? radioApi.getStationById(stationId) : Promise.resolve(null)),
    { enabled: !!stationId, ...options }
  );
}

export function useSearchStations(
  params: SearchParams,
  options?: Omit<UseQueryOptions<Station[]>, 'queryKey' | 'queryFn'>
) {
  const hasSearch = !!(params.name?.trim() || params.tag || params.country || params.language);
  return useApiQuery(QUERY_KEYS.search(params), () => radioApi.search(params), {
    enabled: hasSearch,
    ...options,
  });
}

export function useSearchStationsInfinite(
  params: Omit<SearchParams, 'offset'> & { offset?: number },
  pageSize: number
) {
  const hasSearch = !!(params.name?.trim() || params.tag || params.country || params.language);
  const searchParams = { ...params, limit: pageSize };
  return useInfiniteQuery({
    queryKey: ['radio', 'search', searchParams, 'infinite'],
    queryFn: ({ pageParam }) =>
      radioApi.search({ ...params, limit: pageSize, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.length === pageSize ? lastPageParam + lastPage.length : undefined,
    enabled: hasSearch,
  });
}

export function useFilterOptions(options?: {
  tagsLimit?: number;
  countriesLimit?: number;
  languagesLimit?: number;
}) {
  const { tagsLimit = 50, countriesLimit = 100, languagesLimit = 50 } = options ?? {};
  const tagsQuery = useApiQuery(QUERY_KEYS.tags(tagsLimit), () => radioApi.getTags(tagsLimit));
  const countriesQuery = useApiQuery(QUERY_KEYS.countries(countriesLimit), () =>
    radioApi.getCountries(countriesLimit)
  );
  const languagesQuery = useApiQuery(QUERY_KEYS.languages(languagesLimit), () =>
    radioApi.getLanguages(languagesLimit)
  );
  return {
    tags: tagsQuery.data ?? [],
    countries: countriesQuery.data ?? [],
    languages: languagesQuery.data ?? [],
    isLoading: tagsQuery.isLoading || countriesQuery.isLoading || languagesQuery.isLoading,
    refetch: () => {
      tagsQuery.refetch();
      countriesQuery.refetch();
      languagesQuery.refetch();
    },
  };
}
