import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getColors } from '../../theme';
import { spacing, typography, borderRadius } from '../../theme';
import { clearCache } from '../../utils/cache';
import { supportedLocales, localeNames, type Locale } from '../../i18n';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const setColorScheme = useSettingsStore((s) => s.setColorScheme);
  const locale = useSettingsStore((s) => s.locale);
  const setLocale = useSettingsStore((s) => s.setLocale);
  const effective = colorScheme === 'light' || colorScheme === 'dark' ? colorScheme : (useColorScheme() ?? 'dark');
  const colors = getColors(effective);

  const toggleTheme = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  }, [colorScheme, setColorScheme]);

  const queryClient = useQueryClient();
  const handleClearCache = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearCache();
    queryClient.invalidateQueries({ queryKey: ['radio'] });
  }, [queryClient]);

  const handleLocale = useCallback(
    (l: Locale) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setLocale(l);
    },
    [setLocale]
  );

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.appearance')}</Text>
          <Pressable
            style={[styles.row, { borderBottomColor: colors.border }]}
            onPress={toggleTheme}
          >
            <Text style={[styles.rowLabel, { color: colors.text }]}>{t('settings.theme')}</Text>
            <Text style={[styles.rowValue, { color: colors.primary }]}>
              {colorScheme === 'dark' ? t('settings.dark') : t('settings.light')}
            </Text>
          </Pressable>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.language')}</Text>
          {supportedLocales.map((l, i) => (
            <Pressable
              key={l}
              style={[
                styles.row,
                { borderBottomColor: colors.border, borderBottomWidth: i === supportedLocales.length - 1 ? 0 : 1 },
              ]}
              onPress={() => handleLocale(l)}
            >
              <Text style={[styles.rowLabel, { color: colors.text }]}>{localeNames[l]}</Text>
              {locale === l && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              )}
            </Pressable>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.data')}</Text>
          <Pressable
            style={[styles.row, { borderBottomColor: colors.border }]}
            onPress={handleClearCache}
          >
            <Text style={[styles.rowLabel, { color: colors.text }]}>{t('settings.clearCache')}</Text>
            <Text style={[styles.rowHint, { color: colors.textMuted }]}>{t('settings.clearCacheHint')}</Text>
          </Pressable>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.about')}</Text>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>{t('settings.version')}</Text>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{version}</Text>
          </View>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>{t('settings.dataSource')}</Text>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]} numberOfLines={1}>
              {t('settings.radioBrowserApi')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  section: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  sectionTitle: {
    ...typography.caption,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  rowLabel: { ...typography.body },
  rowValue: { ...typography.bodySmall },
  rowHint: { ...typography.caption },
});
