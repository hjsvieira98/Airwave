import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, useColorScheme, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTopClicked, useTopVotes } from '../../hooks/useRadioQueries';
import type { Station } from '../../types/radio';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useRecentlyPlayedStore } from '../../store/useRecentlyPlayedStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import { getColors } from '../../theme';
import { spacing, typography } from '../../theme';
import { getGreeting } from '../../utils/greeting';
import { StationCardSpotify } from '../../components/StationCardSpotify';
import { ErrorState } from '../../components/ErrorState';

const TOP_LIMIT = 12;
const TRENDING_LIMIT = 10;
const CARD_SIZE = 140;

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const effective = colorScheme === 'light' || colorScheme === 'dark' ? colorScheme : (useColorScheme() ?? 'dark');
  const colors = getColors(effective);

  const [recentItems, setRecentItems] = useState<Station[]>([]);

  const topClicked = useTopClicked(TOP_LIMIT);
  const topVotes = useTopVotes(TRENDING_LIMIT);

  const topStations = topClicked.data ?? [];
  const trendingStations = topVotes.data ?? [];
  const loading = topClicked.isLoading || topVotes.isLoading;
  const refreshing = topClicked.isFetching || topVotes.isFetching;
  const error = topClicked.error ?? topVotes.error;
  const errorMessage = error instanceof Error ? error.message : null;

  const recentlyPlayed = useRecentlyPlayedStore((s) => s.items);
  const recentLoaded = useRecentlyPlayedStore((s) => s.isLoaded);
  const lastStationId = usePlayerStore((s) => s.lastStationId);
  const currentStation = usePlayerStore((s) => s.currentStation);
  const miniPlayerVisible = !!currentStation;

  const greetingKey = getGreeting();
  const greeting = t(`home.good${greetingKey.charAt(0).toUpperCase() + greetingKey.slice(1)}`);

  const refetch = useCallback(() => {
    topClicked.refetch();
    topVotes.refetch();
  }, [topClicked.refetch, topVotes.refetch]);

  useEffect(() => {
    if (recentLoaded) setRecentItems(recentlyPlayed.slice(0, 10));
  }, [recentLoaded, recentlyPlayed]);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (errorMessage && topStations.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <ErrorState message={errorMessage || t('home.failedToLoad')} onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  const showResume = lastStationId && !currentStation;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.text }]}>{greeting}</Text>
        <Pressable
          style={[styles.settingsBtn, { backgroundColor: colors.surface }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(tabs)/settings');
          }}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </Pressable>
      </View>

      <FlatList
        data={[
          ...(showResume ? ['resume'] : []),
          'madeForYou',
          'recent',
          'trending',
        ]}
        keyExtractor={(item) => item}
        contentContainerStyle={[styles.list, miniPlayerVisible && { paddingBottom: 120 }]}
        refreshControl={
          <RefreshControl
            refreshing={!!refreshing && !loading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => {
          if (item === 'resume' && showResume && lastStationId) {
            return (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('home.jumpBackIn')}</Text>
                <Pressable
                  style={[styles.resumeCard, { backgroundColor: colors.surfaceElevated }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/player/${lastStationId}`);
                  }}
                >
                  <View style={[styles.resumeArtwork, { backgroundColor: colors.border }]} />
                  <View style={styles.resumeInfo}>
                    <Text style={[styles.resumeText, { color: colors.text }]}>{t('home.resumeLastStation')}</Text>
                    <Text style={[styles.resumeSubtext, { color: colors.textSecondary }]}>{t('home.tapToContinue')}</Text>
                  </View>
                  <Ionicons name="play-circle" size={48} color={colors.primary} />
                </Pressable>
              </View>
            );
          }
          if (item === 'madeForYou') {
            return (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('home.madeForYou')}</Text>
                {loading ? (
                  <View style={styles.horizontalList}>
                    {[1, 2, 3, 4].map((i) => (
                      <View key={i} style={[styles.skeletonCard, { width: CARD_SIZE, height: CARD_SIZE, backgroundColor: colors.surfaceElevated }]} />
                    ))}
                  </View>
                ) : (
                  <FlatList
                    horizontal
                    data={topStations}
                    keyExtractor={(s) => s.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                    renderItem={({ item: s }) => <StationCardSpotify station={s} size={CARD_SIZE} />}
                  />
                )}
              </View>
            );
          }
          if (item === 'recent' && recentItems.length > 0) {
            return (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('home.recentlyPlayed')}</Text>
                <FlatList
                  horizontal
                  data={recentItems}
                  keyExtractor={(s) => s.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                  renderItem={({ item: s }) => <StationCardSpotify station={s} size={CARD_SIZE} />}
                />
              </View>
            );
          }
          if (item === 'trending') {
            return (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('home.trending')}</Text>
                <FlatList
                  horizontal
                  data={trendingStations}
                  keyExtractor={(s) => s.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                  renderItem={({ item: s }) => <StationCardSpotify station={s} size={CARD_SIZE} />}
                />
              </View>
            );
          }
          return null;
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  greeting: {
    ...typography.h1,
    fontSize: 28,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingBottom: spacing.xxl },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    ...typography.h2,
    fontSize: 22,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  horizontalList: { paddingHorizontal: spacing.md },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: 8,
  },
  resumeArtwork: {
    width: 56,
    height: 56,
    borderRadius: 4,
  },
  resumeInfo: { flex: 1, marginLeft: spacing.md },
  resumeText: { ...typography.label, fontSize: 15 },
  resumeSubtext: { ...typography.caption, marginTop: 2 },
  skeletonCard: { borderRadius: 8, marginRight: spacing.md },
});
