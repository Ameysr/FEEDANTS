import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';

type Language = 'ENG' | 'HI';

interface CompetitionTopBarProps {
  onBack?: () => void;
  style?: ViewStyle;
}

/** Back navigation + the ENG / हिंदी language toggle. */
export function CompetitionTopBar({ onBack, style }: CompetitionTopBarProps) {
  const [language, setLanguage] = useState<Language>('ENG');

  return (
    <View style={[styles.row, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack}
        style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
        hitSlop={8}
      >
        <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        <Text style={styles.backLabel}>Go back</Text>
      </Pressable>

      <View style={styles.toggle} accessibilityRole="tablist">
        {(['ENG', 'HI'] as const).map((option) => {
          const isActive = language === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              onPress={() => setLanguage(option)}
              style={[styles.segment, isActive ? styles.segmentActive : styles.segmentInactive]}
            >
              <Text style={[styles.segmentLabel, isActive ? styles.segmentLabelActive : styles.segmentLabelInactive]}>
                {option === 'ENG' ? 'ENG' : 'हिंदी'}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
    borderRadius: radius.md,
  },
  backPressed: { opacity: 0.6 },
  backLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  segment: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    minWidth: 46,
    alignItems: 'center',
  },
  segmentActive: { backgroundColor: colors.primary },
  segmentInactive: { backgroundColor: 'transparent' },
  segmentLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  segmentLabelActive: { color: colors.textOnPrimary },
  segmentLabelInactive: { color: colors.primary },
});
