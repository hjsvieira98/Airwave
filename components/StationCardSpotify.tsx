import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { Station } from '../types/radio';
import { useSettingsStore } from '../store/useSettingsStore';
import { getColors } from '../theme';
import { spacing, borderRadius } from '../theme';
import { FALLBACK_ARTWORK } from '../types/radio';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface StationCardSpotifyProps {
  station: Station;
  size?: number;
}

export function StationCardSpotify({ station, size = 140 }: StationCardSpotifyProps) {
  const router = useRouter();
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const effective = colorScheme === 'light' || colorScheme === 'dark' ? colorScheme : (useColorScheme() ?? 'dark');
  const colors = getColors(effective);

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.96, { damping: 15 });
  };
  const onPressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/player/${station.id}`);
  };

  return (
    <AnimatedPressable
      style={[styles.wrap, { width: size }, animatedStyle]}
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <View style={[styles.artwork, { width: size, height: size, backgroundColor: colors.surfaceElevated }]}>
        <Animated.Image
          source={{ uri: station.favicon || FALLBACK_ARTWORK }}
          style={[styles.artworkImage, { width: size, height: size }]}
          resizeMode="cover"
        />
      </View>
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
        {station.name}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
        {station.country || 'Radio'}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginRight: spacing.md,
  },
  artwork: {
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  artworkImage: {
    borderRadius: borderRadius.sm,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
