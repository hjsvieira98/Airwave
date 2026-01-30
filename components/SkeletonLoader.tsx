import { useEffect } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSettingsStore } from '../store/useSettingsStore';
import { getColors } from '../theme';
import { spacing, borderRadius } from '../theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius: br = borderRadius.sm,
  style,
}: SkeletonLoaderProps) {
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const effective = colorScheme === 'light' || colorScheme === 'dark' ? colorScheme : (useColorScheme() ?? 'dark');
  const colors = getColors(effective);

  const opacity = useSharedValue(0.4);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.8, { duration: 800 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: br,
          backgroundColor: colors.border,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function StationCardSkeleton() {
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const effective = colorScheme === 'light' || colorScheme === 'dark' ? colorScheme : (useColorScheme() ?? 'dark');
  const colors = getColors(effective);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <SkeletonLoader width={96} height={96} borderRadius={borderRadius.md} />
      <View style={styles.info}>
        <SkeletonLoader width="80%" height={16} style={styles.title} />
        <SkeletonLoader width="50%" height={12} style={styles.subtitle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {},
});
