import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  View,
  useColorScheme,
  Pressable,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSearchStationsInfinite, useFilterOptions } from '../../hooks/useRadioQueries';
import type { Station } from '../../types/radio';
import { useSettingsStore } from '../../store/useSettingsStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import { getColors } from '../../theme';
import { spacing, borderRadius, typography } from '../../theme';
import { StationCard } from '../../components/StationCard';
import { StationCardSkeleton } from '../../components/SkeletonLoader';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';

const DEBOUNCE_MS = 400;
const PAGE_SIZE = 20;

export default function SearchScreen() {
  const { t } = useTranslation();
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const effective = colorScheme === 'light' || colorScheme === 'dark' ? colorScheme : (useColorScheme() ?? 'dark');
  const colors = getColors(effective);

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'name' | 'tag' | 'country' | 'language'>('name');
  const [filterValue, setFilterValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [debouncedFilterValue, setDebouncedFilterValue] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const filterOptions = useFilterOptions({ tagsLimit: 50, countriesLimit: 100, languagesLimit: 50 });
  const tags = filterOptions.tags;
  const countries = filterOptions.countries;
  const languages = filterOptions.languages;

  const searchParams = useMemo(() => {
    if (filterType === 'name' && debouncedQuery.trim()) {
      return { name: debouncedQuery.trim(), limit: PAGE_SIZE };
    }
    if (filterType === 'tag' && debouncedFilterValue) return { tag: debouncedFilterValue, limit: PAGE_SIZE };
    if (filterType === 'country' && debouncedFilterValue) return { country: debouncedFilterValue, limit: PAGE_SIZE };
    if (filterType === 'language' && debouncedFilterValue) return { language: debouncedFilterValue, limit: PAGE_SIZE };
    return {};
  }, [filterType, debouncedQuery, debouncedFilterValue]);

  const searchQuery = useSearchStationsInfinite(searchParams, PAGE_SIZE);

  const stations = useMemo(
    () => searchQuery.data?.pages.flatMap((p) => p) ?? [],
    [searchQuery.data?.pages]
  );
  const loading = searchQuery.isLoading;
  const loadingMore = searchQuery.isFetchingNextPage;
  const error = searchQuery.error;
  const errorMessage = error instanceof Error ? error.message : null;
  const hasMore = searchQuery.hasNextPage ?? false;

  const currentStation = usePlayerStore((s) => s.currentStation);
  const miniPlayerVisible = !!currentStation;

  const hasSearch = !!(searchParams.name || searchParams.tag || searchParams.country || searchParams.language);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(query);
      setDebouncedFilterValue(filterValue);
    }, DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query, filterValue]);

  const onEndReached = useCallback(() => {
    if (!loadingMore && hasMore && stations.length > 0) searchQuery.fetchNextPage();
  }, [loadingMore, hasMore, stations.length, searchQuery.fetchNextPage]);

  const onFilterSelect = useCallback(
    (type: 'tag' | 'country' | 'language', value: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setFilterType(type);
      setFilterValue(value);
      setFilterOpen(false);
    },
    []
  );

  const clearFilter = useCallback(() => {
    setFilterValue('');
    setFilterType('name');
    setQuery('');
    setDebouncedQuery('');
    setDebouncedFilterValue('');
    setFilterOpen(false);
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceElevated }]}>
          <Ionicons name="search" size={22} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t('search.searchPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            editable={filterType === 'name'}
          />
        </View>
        <Pressable
          style={[styles.filterBtn, { backgroundColor: filterValue ? colors.primary : colors.surfaceElevated }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setFilterOpen((v) => !v);
          }}
        >
          <Text style={[styles.filterBtnText, { color: filterValue ? '#fff' : colors.text }]}>{t('search.filter')}</Text>
        </Pressable>
      </View>

      {filterOpen && (
      <View style={[styles.filterPanel, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>{t('search.genre')}</Text>
        <FlatList
          horizontal
          data={tags.slice(0, 20)}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipList}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.chip, { backgroundColor: filterType === 'tag' && filterValue === item ? colors.primary : colors.surfaceElevated }]}
              onPress={() => onFilterSelect('tag', item)}
            >
              <Text style={[styles.chipText, { color: filterType === 'tag' && filterValue === item ? '#fff' : colors.text }]} numberOfLines={1}>{item}</Text>
            </Pressable>
          )}
        />
        <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>{t('search.country')}</Text>
        <FlatList
          horizontal
          data={countries.slice(0, 15)}
          keyExtractor={(item) => item.code}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipList}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.chip, { backgroundColor: filterType === 'country' && filterValue === item.name ? colors.primary : colors.surfaceElevated }]}
              onPress={() => onFilterSelect('country', item.name)}
            >
              <Text style={[styles.chipText, { color: filterType === 'country' && filterValue === item.name ? '#fff' : colors.text }]} numberOfLines={1}>{item.name}</Text>
            </Pressable>
          )}
        />
        <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>{t('search.language')}</Text>
        <FlatList
          horizontal
          data={languages.slice(0, 15)}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipList}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.chip, { backgroundColor: filterType === 'language' && filterValue === item ? colors.primary : colors.surfaceElevated }]}
              onPress={() => onFilterSelect('language', item)}
            >
              <Text style={[styles.chipText, { color: filterType === 'language' && filterValue === item ? '#fff' : colors.text }]} numberOfLines={1}>{item}</Text>
            </Pressable>
          )}
        />
        <Pressable style={[styles.clearBtn, { borderColor: colors.border }]} onPress={clearFilter}>
          <Text style={[styles.clearBtnText, { color: colors.textSecondary }]}>{t('search.clearFilters')}</Text>
        </Pressable>
      </View>
      )}

      {errorMessage && stations.length === 0 ? (
        <ErrorState message={errorMessage} onRetry={() => searchQuery.refetch()} />
      ) : loading && stations.length === 0 ? (
        <View style={styles.loading}>
          {[1, 2, 3, 4, 5].map((i) => (
            <StationCardSkeleton key={i} />
          ))}
        </View>
      ) : stations.length === 0 && !hasSearch ? (
        <EmptyState title={t('search.discoverTitle')} message={t('search.discoverMessage')} iconName="search-outline" />
      ) : stations.length === 0 && hasSearch ? (
        <EmptyState title={t('search.noStationsTitle')} message={t('search.noStationsMessage')} />
      ) : (
        <FlatList
          data={stations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, miniPlayerVisible && { paddingBottom: 120 }]}
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <StationCard station={item} size="small" />
            </View>
          )}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  input: { flex: 1, ...typography.body, paddingVertical: 0 },
  filterBtn: {
    paddingHorizontal: spacing.md,
    height: 48,
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
  },
  filterBtnText: { ...typography.label },
  filterPanel: {
    padding: spacing.md,
    borderBottomWidth: 1,
    maxHeight: 280,
  },
  filterLabel: { ...typography.caption, marginBottom: spacing.xs },
  chipList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  chipText: { ...typography.caption, fontSize: 12 },
  clearBtn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  clearBtnText: { ...typography.caption },
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  cardWrap: { marginBottom: spacing.sm },
  loading: { padding: spacing.md },
  footer: { padding: spacing.lg, alignItems: 'center' },
});
