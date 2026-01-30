import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { usePlayerStore } from '../store/usePlayerStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { getColors } from '../theme';
import { spacing, borderRadius, typography } from '../theme';
import { FALLBACK_ARTWORK } from '../types/radio';
import { useEffect } from 'react';

const TAB_BAR_HEIGHT = 56;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MiniPlayer() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const effective = colorScheme === 'light' || colorScheme === 'dark' ? colorScheme : (useColorScheme() ?? 'dark');
  const colors = getColors(effective);

  const currentStation = usePlayerStore((s) => s.currentStation);
  const status = usePlayerStore((s) => s.status);
  const isPlaying = status === 'playing';

  const bottomOffset = TAB_BAR_HEIGHT + insets.bottom;

  const progressWidth = useSharedValue(0);
  useEffect(() => {
    if (!currentStation || !isPlaying) {
      progressWidth.value = 0;
      return;
    }
    progressWidth.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      false
    );
  }, [currentStation?.id, isPlaying]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  if (!currentStation) return null;

  const statusLabel = isPlaying ? t('player.live') : t('player.paused');

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/player/${currentStation.id}`);
  };

  return (
    <AnimatedPressable
      entering={FadeInDown.duration(200)}
      style={[styles.container, { backgroundColor: colors.surfaceElevated, bottom: bottomOffset }]}
      onPress={handlePress}
    >
      {isPlaying && (
        <Animated.View style={[styles.progressBar, { backgroundColor: colors.primary }, progressStyle]} />
      )}
      <View style={[styles.content, { paddingTop: isPlaying ? 2 : spacing.sm }]}>
        <View style={[styles.artwork, { backgroundColor: colors.border }]}>
          <Animated.Image
            source={{ uri: currentStation.favicon || FALLBACK_ARTWORK }}
            style={styles.artworkImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {currentStation.name}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {currentStation.country || t('common.live')}
          </Text>
        </View>
        <View style={[styles.liveBadge, { backgroundColor: isPlaying ? colors.primary : colors.textMuted }]}>
          <Text style={styles.liveText}>{statusLabel}</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 3,
    borderRadius: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    ...typography.label,
    fontSize: 15,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  liveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
});
