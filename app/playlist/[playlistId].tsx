import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import type { Station } from '../../types/radio';
import { useSettingsStore } from '../../store/useSettingsStore';
import { usePlaylistsStore } from '../../store/usePlaylistsStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import { getColors } from '../../theme';
import { spacing, borderRadius, typography } from '../../theme';
import { StationCard } from '../../components/StationCard';
import { EmptyState } from '../../components/EmptyState';

export default function PlaylistDetailScreen() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const effective = colorScheme === 'light' || colorScheme === 'dark' ? colorScheme : (useColorScheme() ?? 'dark');
  const colors = getColors(effective);

  const playlists = usePlaylistsStore((s) => s.playlists);
  const removeStationFromPlaylist = usePlaylistsStore((s) => s.removeStationFromPlaylist);
  const currentStation = usePlayerStore((s) => s.currentStation);
  const miniPlayerVisible = !!currentStation;

  const playlist = playlists.find((p) => p.id === playlistId);
  const stations = playlist?.stations ?? [];

  const handleRemove = useCallback(
    (stationId: string) => {
      if (!playlistId) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      removeStationFromPlaylist(playlistId, stationId);
    },
    [playlistId, removeStationFromPlaylist]
  );

  if (!playlist) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={[styles.backBtn, { backgroundColor: colors.surfaceElevated }]} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>{t('library.playlists')}</Text>
        </View>
        <EmptyState title={t('library.emptyPlaylistsTitle')} message="" iconName="list-outline" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          style={[styles.backBtn, { backgroundColor: colors.surfaceElevated }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {playlist.name}
        </Text>
      </View>

      {stations.length === 0 ? (
        <EmptyState
          title={t('library.emptyPlaylistTitle')}
          message={t('library.emptyPlaylistMessage')}
          iconName="add-circle-outline"
        />
      ) : (
        <FlatList
          data={stations}
          keyExtractor={(s) => s.id}
          contentContainerStyle={[styles.list, miniPlayerVisible && { paddingBottom: 120 }]}
          renderItem={({ item }) => (
            <View style={styles.cardRow}>
              <View style={styles.cardFlex}>
                <StationCard station={item} size="small" />
              </View>
              <Pressable
                style={[styles.removeBtn, { backgroundColor: colors.error }]}
                onPress={() => handleRemove(item.id)}
              >
                <Text style={styles.removeBtnText}>{t('library.remove')}</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.h3, flex: 1 },
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  cardFlex: { flex: 1 },
  removeBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, borderRadius: borderRadius.sm, minWidth: 72, alignItems: 'center' },
  removeBtnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
});
