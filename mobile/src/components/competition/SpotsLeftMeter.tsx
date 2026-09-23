import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, fontSize, fontWeight, spacing } from '../../theme';
import { ProgressBar } from '../ui/ProgressBar';

interface SpotsLeftMeterProps {
  participantCount: number;
  maxParticipants: number;
  spotsLeft: number;
  /** Label above the bar, e.g. "1/20 Booked". */
  showBookedLabel?: boolean;
  style?: ViewStyle;
}

/**
 * Remaining-capacity indicator. Colour escalates as the competition fills so
 * scarcity is visible at a glance.
 */
export function SpotsLeftMeter({
  participantCount,
  maxParticipants,
  spotsLeft,
  showBookedLabel = true,
  style,
}: SpotsLeftMeterProps) {
  const fillRatio = maxParticipants > 0 ? participantCount / maxParticipants : 0;

  const barColor = spotsLeft === 0 ? colors.danger : fillRatio >= 0.8 ? colors.warning : colors.primary;

  const remainingLabel =
    spotsLeft === 0
      ? 'All spots booked'
      : spotsLeft === 1
        ? 'Only 1 spot left'
        : `Only ${spotsLeft} spots left`;

  if (spotsLeft === 0) {
    return (
      <View style={[styles.container, style]}>
        {showBookedLabel ? (
          <Text style={styles.bookedLabel}>
            {participantCount}/{maxParticipants} Booked
          </Text>
        ) : null}
        <ProgressBar progress={1} color={colors.danger} trackColor={colors.dangerSoft} />
        <Text style={[styles.remaining, { color: colors.danger }]}>{remainingLabel}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {showBookedLabel ? (
        <Text style={styles.bookedLabel}>
          {participantCount}/{maxParticipants} Booked
        </Text>
      ) : null}
      <ProgressBar progress={fillRatio} color={barColor} />
      <Text style={[styles.remaining, spotsLeft <= 3 && { color: colors.warning }]}>{remainingLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs + 2, minWidth: 96 },
  bookedLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  remaining: {
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
});
