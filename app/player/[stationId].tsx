import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { Station } from '../../types/radio';
import { useStationById } from '../../hooks/useRadioQueries';
import { FALLBACK_ARTWORK } from '../../types/radio';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useQueueStore } from '../../store/useQueueStore';
import { usePlaylistsStore } from '../../store/usePlaylistsStore';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { useSleepTimer } from '../../hooks/useSleepTimer';
import { getColors } from '../../theme';
import { spacing, borderRadius, typography } from '../../theme';
import { formatDuration } from '../../utils/format';
import { ErrorState } from '../../components/ErrorState';

const SLEEP_OPTIONS = [15, 30, 45, 60, 90];

export default function PlayerScreen() {
  const { stationId } = useLocalSearchParams<{ stationId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const effective = colorScheme === 'light' || colorScheme === 'dark' ? colorScheme : (useColorScheme() ?? 'dark');
  const colors = getColors(effective);

  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const autoPlayedRef = useRef<string | null>(null);
  const playlists = usePlaylistsStore((s) => s.playlists);
  const addStationToPlaylist = usePlaylistsStore((s) => s.addStationToPlaylist);

  const currentStation = usePlayerStore((s) => s.currentStation);
  const isAlreadyPlayingThisStation = currentStation?.id === stationId;
  const stationQuery = useStationById(stationId, {
    placeholderData: isAlreadyPlayingThisStation ? currentStation : undefined,
    enabled: !!stationId && !isAlreadyPlayingThisStation, // Skip refetch when already playing this station
  });
  const station = stationQuery.data ?? (isAlreadyPlayingThisStation ? currentStation : null);
  const loading = !isAlreadyPlayingThisStation && stationQuery.isLoading;
  const error = !stationId
    ? t('player.missingStation')
    : stationQuery.isError
      ? (stationQuery.error instanceof Error ? stationQuery.error.message : t('player.stationNotFound'))
      : stationQuery.data === null && !stationQuery.isLoading
        ? t('player.stationNotFound')
        : null;
  const isFavorite = useFavoritesStore((s) => s.isFavorite);
  const addFavorite = useFavoritesStore((s) => s.addFavorite);
  const removeFavorite = useFavoritesStore((s) => s.removeFavorite);
  const addToQueue = useQueueStore((s) => s.addToQueue);
  const getNext = useQueueStore((s) => s.getNext);
  const getPrevious = useQueueStore((s) => s.getPrevious);

  const {
    status,
    volume,
    play,
    stop,
    togglePlayPause,
    setVolume,
  } = useAudioPlayer();

  const { remainingSeconds, isActive: sleepActive, start: startSleep, cancel: cancelSleep } = useSleepTimer(() => {
    stop();
    setShowSleepPicker(false);
  });

  const isCurrentStation = stationId === currentStation?.id;
  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';
  const fav = station ? isFavorite(station.id) : false;
  const displayStation = station ?? (currentStation?.id === stationId ? currentStation : null);
  const nextStation = displayStation ? getNext(displayStation.id) : null;
  const prevStation = displayStation ? getPrevious(displayStation.id) : null;

  useEffect(() => {
    if (stationId) autoPlayedRef.current = null;
  }, [stationId]);

  // Auto-play when entering the player: start the station the user clicked on (unless it's already playing).
  useEffect(() => {
    if (!stationId || !displayStation || displayStation.id !== stationId || autoPlayedRef.current === stationId) return;
    if (isAlreadyPlayingThisStation) return; // Already playing this station, don't reload stream
    autoPlayedRef.current = stationId;
    addToQueue(displayStation);
    play(displayStation);
  }, [stationId, displayStation, isAlreadyPlayingThisStation, play, addToQueue]);

  const handlePlayPause = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!displayStation) return;
    if (isCurrentStation) {
      togglePlayPause();
    } else {
      addToQueue(displayStation);
      play(displayStation);
    }
  }, [displayStation, isCurrentStation, play, togglePlayPause, addToQueue]);

  const handleStop = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    stop();
    router.back();
  }, [stop, router]);

  const handleFavorite = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!displayStation) return;
    if (fav) removeFavorite(displayStation.id);
    else addFavorite(displayStation);
  }, [displayStation, fav, addFavorite, removeFavorite]);

  const handleAddToQueue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!displayStation) return;
    addToQueue(displayStation);
  }, [displayStation, addToQueue]);

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!displayStation) return;
    try {
      await Share.share({
        message: `${displayStation.name} – ${displayStation.country || 'Radio'}\n${displayStation.homepage || displayStation.streamUrl}`,
        title: displayStation.name,
        url: Platform.OS === 'ios' ? displayStation.streamUrl : undefined,
      });
    } catch {
      // ignore
    }
  }, [displayStation]);

  const handleNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (nextStation) play(nextStation);
  }, [nextStation, play]);

  const handlePrevious = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (prevStation) play(prevStation);
  }, [prevStation, play]);

  const handleSleep = useCallback((minutes: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    startSleep(minutes);
    setShowSleepPicker(false);
  }, [startSleep]);

  if (loading && !displayStation) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('player.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !displayStation) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <ErrorState message={error} onRetry={() => (stationId ? stationQuery.refetch() : router.back())} />
      </SafeAreaView>
    );
  }

  if (!displayStation) return null;

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary + '40', colors.background, colors.background]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            style={[styles.backBtn, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <Ionicons name="chevron-down" size={28} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn.duration(300)} style={styles.artworkWrap}>
            <View style={[styles.artwork, { backgroundColor: colors.surfaceElevated }]}>
              <Animated.Image
                source={{ uri: displayStation.favicon || FALLBACK_ARTWORK }}
                style={styles.artworkImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.liveBadgeWrap}>
              <View style={[styles.liveBadge, { backgroundColor: isPlaying ? colors.primary : colors.textMuted }]}>
                <Text style={styles.liveText}>{isPlaying ? t('player.live') : t('player.paused')}</Text>
              </View>
            </View>
            {isLoading && (
              <View style={styles.connectingWrap}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.connectingText, { color: colors.textSecondary }]}>{t('player.connecting')}</Text>
              </View>
            )}
          </Animated.View>

          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.text }]}>{displayStation.name}</Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              {[displayStation.country, displayStation.tags.slice(0, 2).join(', ')].filter(Boolean).join(' · ') || 'Radio'}
            </Text>
          </View>

          <View style={styles.controls}>
            <Pressable
              style={[styles.controlBtn, { opacity: prevStation ? 1 : 0.4 }]}
              onPress={handlePrevious}
              disabled={!prevStation}
            >
              <Ionicons name="play-skip-back" size={32} color={colors.text} />
            </Pressable>
            <Pressable
              style={[styles.playButton, { backgroundColor: colors.primary }]}
              onPress={handlePlayPause}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={36} color="#fff" />
              )}
            </Pressable>
            <Pressable
              style={[styles.controlBtn, { opacity: nextStation ? 1 : 0.4 }]}
              onPress={handleNext}
              disabled={!nextStation}
            >
              <Ionicons name="play-skip-forward" size={32} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.actions}>
            <Pressable onPress={handleFavorite} style={styles.actionBtn}>
              <Ionicons name={fav ? 'heart' : 'heart-outline'} size={26} color={fav ? colors.primary : colors.textMuted} style={styles.actionIcon} />
              <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>{t('player.favorite')}</Text>
            </Pressable>
            <Pressable onPress={handleAddToQueue} style={styles.actionBtn}>
              <Ionicons name="list-outline" size={26} color={colors.textMuted} style={styles.actionIcon} />
              <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>{t('player.addToQueue')}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowAddToPlaylist(true);
              }}
              style={styles.actionBtn}
            >
              <Ionicons name="add-circle-outline" size={26} color={colors.textMuted} style={styles.actionIcon} />
              <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>{t('library.addToPlaylist')}</Text>
            </Pressable>
            <Pressable onPress={handleShare} style={styles.actionBtn}>
              <Ionicons name="share-outline" size={26} color={colors.textMuted} style={styles.actionIcon} />
              <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>{t('player.share')}</Text>
            </Pressable>
            <Pressable onPress={() => setShowSleepPicker((v) => !v)} style={styles.actionBtn}>
              <Ionicons name="time-outline" size={26} color={colors.textMuted} style={styles.actionIcon} />
              <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>{t('player.sleep')}</Text>
            </Pressable>
          </View>

          <View style={[styles.volumeRow, { borderColor: colors.border }]}>
            <Ionicons name="volume-medium-outline" size={20} color={colors.textSecondary} />
            <View style={styles.sliderWrap}>
              {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                <Pressable
                  key={v}
                  style={[styles.thumb, { backgroundColor: volume >= v ? colors.primary : colors.border }]}
                  onPress={() => setVolume(v)}
                />
              ))}
            </View>
          </View>

          {sleepActive && remainingSeconds !== null && (
            <View style={[styles.sleepBar, { backgroundColor: colors.surfaceElevated }]}>
              <Text style={[styles.sleepText, { color: colors.text }]}>
                {t('player.sleepRemaining', { time: formatDuration(remainingSeconds) })}
              </Text>
              <Pressable onPress={cancelSleep} style={[styles.sleepCancel, { backgroundColor: colors.error }]}>
                <Text style={styles.sleepCancelText}>{t('player.cancel')}</Text>
              </Pressable>
            </View>
          )}

{showSleepPicker && (
          <View style={[styles.sleepPicker, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Text style={[styles.sleepPickerTitle, { color: colors.text }]}>{t('player.sleepTimer')}</Text>
            <View style={styles.sleepOptions}>
              {SLEEP_OPTIONS.map((m) => (
                <Pressable
                  key={m}
                  style={[styles.sleepOption, { backgroundColor: colors.primaryMuted }]}
                  onPress={() => handleSleep(m)}
                >
                  <Text style={[styles.sleepOptionText, { color: colors.primary }]}>{m} min</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => setShowSleepPicker(false)} style={styles.sleepClose}>
              <Text style={[styles.sleepCloseText, { color: colors.textSecondary }]}>{t('player.close')}</Text>
            </Pressable>
          </View>
        )}

          {showAddToPlaylist && (
            <View style={[styles.sleepPicker, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <Text style={[styles.sleepPickerTitle, { color: colors.text }]}>{t('library.addToPlaylist')}</Text>
              {playlists.length === 0 ? (
                <Text style={[styles.sleepCloseText, { color: colors.textSecondary }]}>
                  {t('library.emptyPlaylistsTitle')}
                </Text>
              ) : (
                playlists.map((pl) => (
                  <Pressable
                    key={pl.id}
                    style={[styles.playlistOption, { backgroundColor: colors.surface }]}
                    onPress={() => {
                      if (displayStation) {
                        addStationToPlaylist(pl.id, displayStation);
                        setShowAddToPlaylist(false);
                      }
                    }}
                  >
                    <Text style={[styles.playlistOptionText, { color: colors.text }]}>{pl.name}</Text>
                    <Text style={[styles.sleepCloseText, { color: colors.textSecondary }]}>
                      {pl.stations.length} {pl.stations.length === 1 ? 'station' : 'stations'}
                    </Text>
                  </Pressable>
                ))
              )}
              <Pressable onPress={() => setShowAddToPlaylist(false)} style={styles.sleepClose}>
                <Text style={[styles.sleepCloseText, { color: colors.textSecondary }]}>{t('player.close')}</Text>
              </Pressable>
            </View>
          )}
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  loadingText: { ...typography.bodySmall },
  artworkWrap: { alignItems: 'center', marginBottom: spacing.lg },
  artwork: {
    width: 280,
    height: 280,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  artworkImage: { width: '100%', height: '100%' },
  liveBadgeWrap: { position: 'absolute', bottom: spacing.md, alignSelf: 'center' },
  connectingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  connectingText: { ...typography.bodySmall },
  liveBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  liveText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  info: { alignItems: 'center', marginBottom: spacing.xl },
  name: { ...typography.h1, textAlign: 'center', fontSize: 26 },
  meta: { ...typography.bodySmall, marginTop: spacing.xs, textAlign: 'center' },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  controlBtn: { padding: spacing.sm },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
  },
  actionBtn: { alignItems: 'center' },
  actionIcon: { marginBottom: spacing.xs },
  actionLabel: { ...typography.caption },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  sliderWrap: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  thumb: { width: 16, height: 16, borderRadius: 8 },
  sleepBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  sleepText: { ...typography.bodySmall },
  sleepCancel: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  sleepCancelText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  sleepPicker: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  sleepPickerTitle: { ...typography.h3, marginBottom: spacing.md },
  sleepOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sleepOption: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  sleepOptionText: { ...typography.label },
  sleepClose: { marginTop: spacing.md, alignItems: 'center' },
  sleepCloseText: { ...typography.bodySmall },
  playlistOption: {
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  playlistOptionText: { ...typography.label },
});
