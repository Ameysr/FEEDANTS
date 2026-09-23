import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { Card } from '../ui/Card';

interface PrizeInfoRowProps {
  onPressVideo?: () => void;
  refundPolicyText?: string | null;
  style?: ViewStyle;
}

/**
 * Two side-by-side info tiles: a payout explainer video, and trust signals
 * (refund policy + secure payments).
 */
export function PrizeInfoRow({ onPressVideo, refundPolicyText, style }: PrizeInfoRowProps) {
  return (
    <View style={[styles.row, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Watch video about receiving prize money"
        onPress={onPressVideo}
        style={({ pressed }) => [styles.tilePressable, pressed && styles.pressed]}
      >
        <Card padded={false} style={styles.tile}>
          <View style={styles.thumbnail}>
            <Image
              source={{ uri: 'https://picsum.photos/seed/feedants-payout/400/240' }}
              style={styles.thumbnailImage}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.playOverlay}>
              <Ionicons name="play" size={16} color={colors.textOnPrimary} />
            </View>
          </View>
          <View style={styles.tileBody}>
            <Text style={styles.tileTitle}>How will you receive prize money?</Text>
            <Text style={styles.tileSubtitle}>Watch video to know more</Text>
          </View>
        </Card>
      </Pressable>

      <Card style={[styles.tile, styles.trustTile]}>
        <View style={styles.trustRow}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
          <Text style={styles.trustLabel} numberOfLines={3}>
            {refundPolicyText ?? 'Refund policy'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.trustRow}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
          <View style={styles.trustTextWrap}>
            <Text style={styles.trustLabel}>Secure payments powered by</Text>
            <Text style={styles.razorpay}>Razorpay</Text>
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'stretch' },
  tilePressable: { flex: 1 },
  pressed: { opacity: 0.8 },
  tile: { flex: 1 },
  thumbnail: {
    height: 74,
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailImage: { width: '100%', height: '100%' },
  playOverlay: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
  tileBody: { padding: spacing.md, gap: spacing.xs },
  tileTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  tileSubtitle: {
    fontSize: fontSize.xxs,
    color: colors.textSecondary,
  },
  trustTile: { padding: spacing.md, gap: spacing.md, justifyContent: 'center' },
  trustRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  trustTextWrap: { flex: 1 },
  trustLabel: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    lineHeight: fontSize.xs * 1.45,
  },
  razorpay: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.heavy,
    color: colors.info,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
