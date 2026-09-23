import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { milestoneLabel } from '../../utils/format';
import type { MilestoneType } from '../../api/types';

interface CountdownBannerProps {
  milestoneType: MilestoneType;
  /** Pre-formatted "01d : 06h : 28m : 32s". */
  countdown: string;
  style?: ViewStyle;
}

/** Mint banner counting down to the competition's next lifecycle boundary. */
export function CountdownBanner({ milestoneType, countdown, style }: CountdownBannerProps) {
  const urgent = milestoneType === 'REGISTRATION_CLOSES';

  return (
    <View style={[styles.banner, style]} accessibilityRole="timer" accessibilityLabel={`${milestoneLabel(milestoneType)} ${countdown}`}>
      <View style={styles.side}>
        <Ionicons name="hourglass-outline" size={15} color={colors.primary} />
        <Text style={styles.sideLabel} numberOfLines={2}>
          {milestoneLabel(milestoneType)}
        </Text>
      </View>

      <Text style={styles.timer}>{countdown}</Text>

      <View style={[styles.side, styles.sideRight]}>
        <Ionicons name="alarm-outline" size={15} color={urgent ? colors.warning : colors.primary} />
        <Text style={[styles.sideLabel, urgent && styles.urgentLabel]} numberOfLines={1}>
          Hurry up!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 1,
  },
  sideRight: { justifyContent: 'flex-end' },
  sideLabel: {
    fontSize: fontSize.xxs + 1,
    color: colors.primary,
    fontWeight: fontWeight.medium,
    flexShrink: 1,
  },
  urgentLabel: { color: colors.warning },
  timer: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.heavy,
    color: colors.primary,
    letterSpacing: 0.2,
  },
});
