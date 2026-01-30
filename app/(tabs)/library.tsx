import { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  useColorScheme,
  Pressable,
  Text,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import type { Station } from '../../types/radio';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useRecentlyPlayedStore } from '../../store/useRecentlyPlayedStore';
import { usePlaylistsStore } from '../../store/usePlaylistsStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import { getColors } from '../../theme';
import { spacing, borderRadius, typography } from '../../theme';
import { StationCard } from '../../components/StationCard';
import { EmptyState } from '../../components/EmptyState';
import { StationCardSpotify } from '../../components/StationCardSpotify';

type LibraryTab = 'favorites' | 'recent' | 'playlists';

export default function LibraryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const effective = colorScheme === 'light' || colorScheme === 'dark' ? colorScheme : (useColorScheme() ?? 'dark');
  const colors = getColors(effective);

  const [activeTab, setActiveTab] = useState<LibraryTab>('favorites');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const favorites = useFavoritesStore((s) => s.favorites);
  const isFavoritesLoaded = useFavoritesStore((s) => s.isLoaded);
  const removeFavorite = useFavoritesStore((s) => s.removeFavorite);
  const recentlyPlayed = useRecentlyPlayedStore((s) => s.items);
  const playlists = usePlaylistsStore((s) => s.playlists);
  const isPlaylistsLoaded = usePlaylistsStore((s) => s.isLoaded);
  const createPlaylist = usePlaylistsStore((s) => s.createPlaylist);
  const deletePlaylist = usePlaylistsStore((s) => s.deletePlaylist);
  const currentStation = usePlayerStore((s) => s.currentStation);
  const miniPlayerVisible = !!currentStation;

  const tabs: { key: LibraryTab; label: string }[] = [
    { key: 'favorites', label: t('library.favorites') },
    { key: 'recent', label: t('library.recentlyPlayed') },
    { key: 'playlists', label: t('library.playlists') },
  ];

  const handleCreatePlaylist = useCallback(() => {
    const name = newPlaylistName.trim();
    if (!name) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    createPlaylist(name);
    setNewPlaylistName('');
    setCreateModalVisible(false);
  }, [newPlaylistName, createPlaylist]);

  const handleDeletePlaylist = useCallback(
    (id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert(t('library.deletePlaylist'), '', [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('library.remove'), style: 'destructive', onPress: () => deletePlaylist(id) },
      ]);
    },
    [deletePlaylist, t]
  );

  if (!isFavoritesLoaded) return null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab(tab.key);
            }}
          >
            <Text style={[styles.tabLabel, { color: activeTab === tab.key ? colors.text : colors.textSecondary }]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'favorites' && (
        <>
          {favorites.length === 0 ? (
            <EmptyState
              title={t('library.emptyFavoritesTitle')}
              message={t('library.emptyFavoritesMessage')}
              iconName="heart-outline"
            />
          ) : (
            <FlatList
              data={favorites}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[styles.list, miniPlayerVisible && { paddingBottom: 120 }]}
              renderItem={({ item }) => (
                <View style={styles.cardRow}>
                  <View style={styles.cardFlex}>
                    <StationCard station={item} size="small" />
                  </View>
                  <Pressable
                    style={[styles.removeBtn, { backgroundColor: colors.error }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      removeFavorite(item.id);
                    }}
                  >
                    <Text style={styles.removeBtnText}>{t('library.remove')}</Text>
                  </Pressable>
                </View>
              )}
            />
          )}
        </>
      )}

      {activeTab === 'recent' && (
        <>
          {recentlyPlayed.length === 0 ? (
            <EmptyState
              title={t('library.recentlyPlayed')}
              message=""
              iconName="time-outline"
            />
          ) : (
            <FlatList
              horizontal
              data={recentlyPlayed}
              keyExtractor={(s) => s.id}
              contentContainerStyle={[styles.horizontalList, miniPlayerVisible && { paddingBottom: 120 }]}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => <StationCardSpotify station={item} size={140} />}
            />
          )}
        </>
      )}

      {activeTab === 'playlists' && (
        <>
          <Pressable
            style={[styles.createBtn, { backgroundColor: colors.surfaceElevated }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setCreateModalVisible(true);
            }}
          >
            <Ionicons name="add" size={24} color={colors.primary} />
            <Text style={[styles.createBtnText, { color: colors.text }]}>{t('library.createPlaylist')}</Text>
          </Pressable>
          {!isPlaylistsLoaded ? null : playlists.length === 0 ? (
            <EmptyState
              title={t('library.emptyPlaylistsTitle')}
              message={t('library.emptyPlaylistsMessage')}
              iconName="list-outline"
            />
          ) : (
            <FlatList
              data={playlists}
              keyExtractor={(p) => p.id}
              contentContainerStyle={[styles.list, miniPlayerVisible && { paddingBottom: 120 }]}
              renderItem={({ item: pl }) => (
                <View style={styles.playlistRow}>
                  <Pressable
                    style={[styles.playlistCard, { backgroundColor: colors.surfaceElevated }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(`/playlist/${pl.id}`);
                    }}
                  >
                    <View style={[styles.playlistArtwork, { backgroundColor: colors.primary }]}>
                      <Ionicons name="list" size={40} color="#fff" />
                    </View>
                    <View style={styles.playlistInfo}>
                      <Text style={[styles.playlistName, { color: colors.text }]}>{pl.name}</Text>
                      <Text style={[styles.playlistCount, { color: colors.textSecondary }]}>
                        {pl.stations.length} {pl.stations.length === 1 ? 'station' : 'stations'}
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    style={[styles.deletePlaylistBtn, { backgroundColor: colors.error }]}
                    onPress={() => handleDeletePlaylist(pl.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                  </Pressable>
                </View>
              )}
            />
          )}
        </>
      )}

      <Modal visible={createModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setCreateModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.surface }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('library.createPlaylist')}</Text>
            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
              placeholder={t('library.playlistName')}
              placeholderTextColor={colors.textMuted}
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
            />
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, { backgroundColor: colors.border }]} onPress={() => setCreateModalVisible(false)}>
                <Text style={[styles.modalBtnText, { color: colors.text }]}>{t('player.close')}</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={handleCreatePlaylist}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>{t('library.createPlaylist')}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  tabRow: { flexDirection: 'row', paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: 'transparent' },
  tab: { paddingVertical: spacing.md, paddingHorizontal: spacing.sm, marginRight: spacing.md },
  tabLabel: { ...typography.label },
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  horizontalList: { padding: spacing.md, paddingBottom: spacing.xxl },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  cardFlex: { flex: 1 },
  removeBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, borderRadius: borderRadius.sm, minWidth: 72, alignItems: 'center' },
  removeBtnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    gap: spacing.sm,
  },
  createBtnText: { ...typography.label },
  playlistRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, paddingHorizontal: spacing.md, gap: spacing.sm },
  playlistCard: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.sm },
  playlistArtwork: { width: 56, height: 56, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  playlistInfo: { marginLeft: spacing.md, flex: 1 },
  playlistName: { ...typography.label, fontSize: 16 },
  playlistCount: { ...typography.caption, marginTop: 2 },
  deletePlaylistBtn: { width: 44, height: 44, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: spacing.lg },
  modalContent: { borderRadius: borderRadius.lg, padding: spacing.lg },
  modalTitle: { ...typography.h3, marginBottom: spacing.md },
  modalInput: { borderWidth: 1, borderRadius: borderRadius.sm, padding: spacing.md, ...typography.body, marginBottom: spacing.lg },
  modalActions: { flexDirection: 'row', gap: spacing.md, justifyContent: 'flex-end' },
  modalBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.sm },
  modalBtnText: { ...typography.label },
});
