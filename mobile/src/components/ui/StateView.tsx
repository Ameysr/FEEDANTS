import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { Button } from './Button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
  /** `inline` renders a compact banner instead of a full-screen block. */
  variant?: 'block' | 'inline';
}

export function ErrorState({ message, onRetry, style, variant = 'block' }: ErrorStateProps) {
  if (variant === 'inline') {
    return (
      <View style={[styles.inline, style]}>
        <Ionicons name="alert-circle" size={18} color={colors.danger} />
        <Text style={styles.inlineText}>{message}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.block, style]}>
      <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <Button label="Try again" variant="outline" onPress={onRetry} style={styles.action} /> : null}
    </View>
  );
}

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  style?: ViewStyle;
}

export function EmptyState({ title, message, icon = 'search-outline', style }: EmptyStateProps) {
  return (
    <View style={[styles.block, style]}>
      <Ionicons name={icon} size={40} color={colors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  message: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.5,
  },
  action: { marginTop: spacing.md },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  inlineText: {
    flex: 1,
    color: colors.danger,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
