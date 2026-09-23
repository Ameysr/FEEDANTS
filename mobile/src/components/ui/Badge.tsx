import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';

export type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

const toneStyles: Record<BadgeTone, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.primarySoft, fg: colors.primary, border: colors.primary },
  success: { bg: colors.successSoft, fg: colors.success, border: colors.successSoft },
  warning: { bg: colors.warningSoft, fg: colors.warning, border: colors.warningSoft },
  danger: { bg: colors.dangerSoft, fg: colors.danger, border: colors.dangerSoft },
  neutral: { bg: colors.chip, fg: colors.textSecondary, border: colors.border },
};

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  /** Outlined pill (teal border, no fill) - used for the "Registered" badge. */
  outlined?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Badge({ label, tone = 'neutral', outlined = false, icon, style }: BadgeProps) {
  const palette = toneStyles[tone];

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: outlined ? 'transparent' : palette.bg, borderColor: outlined ? palette.border : 'transparent' },
        style,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: { marginRight: spacing.xs },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
});
