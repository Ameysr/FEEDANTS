import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import type { CompetitionDetail } from '../../api/types';
import { colors, fontSize, fontWeight, radius, spacing, raisedShadow } from '../../theme';
import { formatDate } from '../../utils/format';
import { Button } from '../ui/Button';

export interface CtaState {
  label: string;
  sublabel?: string;
  disabled: boolean;
  /** What pressing the button should do. */
  intent: 'join' | 'sign-in' | 'upload' | 'blocked';
}

/**
 * Derive the sticky CTA purely from the server's derived state + viewer info.
 * This is the single place that decides what the primary action means.
 */
export function getCtaState(competition: CompetitionDetail): CtaState {
  const isRegistered = competition.viewer?.isRegistered ?? false;

  if (isRegistered) {
    return { label: 'Upload Submission', sublabel: 'Registered', disabled: false, intent: 'upload' };
  }

  switch (competition.joinBlockedReason) {
    case 'AUTH_REQUIRED':
      return { label: 'Sign in to Join', disabled: false, intent: 'sign-in' };
    case 'NOT_OPEN':
      return {
        label: `Registration opens ${formatDate(competition.registrationOpensAt)}`,
        sublabel: 'Set a reminder',
        disabled: true,
        intent: 'blocked',
      };
    case 'FULL':
      return { label: 'Competition Full', sublabel: 'All spots are booked', disabled: true, intent: 'blocked' };
    case 'CLOSED':
      return { label: 'Registration Closed', sublabel: 'Judging in progress', disabled: true, intent: 'blocked' };
    case 'ENDED':
      return { label: 'Competition Ended', disabled: true, intent: 'blocked' };
    case 'ALREADY_JOINED':
      return { label: 'You are registered', disabled: true, intent: 'blocked' };
    default:
      return {
        label: 'Join Competition',
        sublabel:
          competition.spotsLeft > 0 ? `${competition.spotsLeft} of ${competition.maxParticipants} spots left` : undefined,
        disabled: !competition.canJoin,
        intent: 'join',
      };
  }
}

interface JoinCtaProps {
  competition: CompetitionDetail;
  onPress: () => void;
  isPending?: boolean;
  style?: ViewStyle;
}

/** Sticky bottom action bar whose label reflects the competition's live state. */
export function JoinCta({ competition, onPress, isPending = false, style }: JoinCtaProps) {
  const cta = getCtaState(competition);

  return (
    <View style={[styles.bar, raisedShadow, style]}>
      <Button
        label={cta.label}
        onPress={onPress}
        disabled={cta.disabled}
        loading={isPending}
        size="lg"
        fullWidth
        accessibilityHint={cta.sublabel}
        icon={
          cta.intent === 'upload' ? (
            <Ionicons name="cloud-upload-outline" size={18} color={colors.textOnPrimary} />
          ) : cta.intent === 'join' ? (
            <Ionicons name="add-circle-outline" size={18} color={colors.textOnPrimary} />
          ) : undefined
        }
      />
      {cta.sublabel ? (
        <Text style={[styles.sublabel, cta.disabled && styles.sublabelMuted]}>{cta.sublabel}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    gap: spacing.xs,
  },
  sublabel: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  sublabelMuted: { color: colors.textSecondary },
});
