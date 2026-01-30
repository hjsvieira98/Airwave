import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { Station } from '../types/radio';
import { useSettingsStore } from '../store/useSettingsStore';
import { getColors } from '../theme';
import { spacing, borderRadius, typography } from '../theme';
import { FALLBACK_ARTWORK } from '../types/radio';
import { formatNumber } from '../utils/format';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface StationCardProps {
  station: Station;
  size?: 'small' | 'medium' | 'large';
}

export function StationCard({ station, size = 'medium' }: StationCardProps) {
  const router = useRouter();
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const effective = colorScheme === 'light' || colorScheme === 'dark' ? colorScheme : (useColorScheme() ?? 'dark');
  const colors = getColors(effective);

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };
  const onPressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/player/${station.id}`);
  };

  const isSmall = size === 'small';
  const isLarge = size === 'large';
  const artSize = isSmall ? 64 : isLarge ? 140 : 96;

  return (
    <AnimatedPressable
      style={[
        styles.card,
        { backgroundColor: colors.surface, shadowColor: colors.cardShadow },
        animatedStyle,
      ]}
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <View style={[styles.artwork, { width: artSize, height: artSize, backgroundColor: colors.border }]}>
        <Animated.Image
          source={{ uri: station.favicon || FALLBACK_ARTWORK }}
          style={[styles.artworkImage, { width: artSize, height: artSize }]}
          resizeMode="cover"
        />
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {station.name}
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
          {[station.country, station.tags[0]].filter(Boolean).join(' · ') || 'Radio'}
        </Text>
        {!isSmall && (station.clickCount > 0 || station.votes > 0) && (
          <Text style={[styles.stats, { color: colors.textMuted }]}>
            {station.clickCount > 0 && `${formatNumber(station.clickCount)} clicks`}
            {station.clickCount > 0 && station.votes > 0 && ' · '}
            {station.votes > 0 && `${formatNumber(station.votes)} votes`}
          </Text>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  artwork: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  artworkImage: {
    borderRadius: borderRadius.md,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    ...typography.body,
    fontWeight: '600',
  },
  meta: {
    ...typography.caption,
    marginTop: 4,
  },
  stats: {
    ...typography.caption,
    marginTop: 2,
    fontSize: 11,
  },
});
