import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { Button } from '../ui/Button';

interface ReferralBannerProps {
  referralLink: string;
  earnText?: string | null;
  onReferNow?: () => void;
  style?: ViewStyle;
}

/** Mint referral card with a copyable link. */
export function ReferralBanner({ referralLink, earnText, onReferNow, style }: ReferralBannerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="megaphone-outline" size={18} color={colors.primary} />
        </View>
        <Text style={styles.heading}>Refer & Earn more discount</Text>
      </View>

      <View style={styles.linkRow}>
        <Text style={styles.link} numberOfLines={1}>
          {referralLink}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Copy referral link"
          onPress={handleCopy}
          style={({ pressed }) => [styles.copyButton, pressed && styles.copyPressed]}
          hitSlop={6}
        >
          <Ionicons
            name={copied ? 'checkmark' : 'copy-outline'}
            size={14}
            color={colors.primary}
          />
          <Text style={styles.copyLabel}>{copied ? 'Copied' : 'Copy Link'}</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Button label="Refer Now" onPress={onReferNow} size="md" style={styles.referButton} />
        {earnText ? <Text style={styles.earnText}>{earnText}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
  },
  link: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryTint,
  },
  copyPressed: { opacity: 0.7 },
  copyLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  referButton: { flex: 1 },
  earnText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
});
