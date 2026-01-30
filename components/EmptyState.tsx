import { type ReactNode } from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '../store/useSettingsStore';
import { getColors } from '../theme';
import { spacing, typography } from '../theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: ReactNode;
  iconName?: IconName;
}

const DEFAULT_ICON: IconName = 'radio-outline';

export function EmptyState({ title, message, icon, iconName = DEFAULT_ICON }: EmptyStateProps) {
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const effective = colorScheme === 'light' || colorScheme === 'dark' ? colorScheme : (useColorScheme() ?? 'dark');
  const colors = getColors(effective);

  const iconElement = icon ?? (
    <Ionicons name={iconName} size={48} color={colors.textMuted} style={styles.icon} />
  );

  return (
    <View style={styles.container}>
      {iconElement}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {message && (
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  icon: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    textAlign: 'center',
  },
  message: {
    ...typography.bodySmall,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
