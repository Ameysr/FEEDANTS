import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import type { CompetitionSummary } from '../../api/types';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { formatDate, formatCurrency } from '../../utils/format';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { StateBadge } from './StateBadge';

interface CompetitionListCardProps {
  competition: CompetitionSummary;
  onPress: () => void;
  style?: ViewStyle;
}

/** Compact competition row used in the browse list. */
export function CompetitionListCard({ competition, onPress, style }: CompetitionListCardProps) {
  const fillRatio =
    competition.maxParticipants > 0 ? competition.participantCount / competition.maxParticipants : 0;
  const isRegistered = competition.viewer?.isRegistered ?? false;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${competition.title}, ${competition.state}`}
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed, style]}
    >
      <Card padded={false}>
        <View style={styles.row}>
          <View style={styles.thumb}>
            {competition.bannerUrl ? (
              <Image
                source={{ uri: competition.bannerUrl }}
                style={styles.thumbImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <Ionicons name="trophy-outline" size={22} color={colors.primary} />
            )}
          </View>

          <View style={styles.body}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={2}>
                {competition.title}
              </Text>
              {isRegistered ? (
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              ) : null}
            </View>

            <StateBadge state={competition.state} />

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="pricetag-outline" size={12} color={colors.textSecondary} />
                <Text style={styles.metaText}>
                  {competition.entryFee === 0 ? 'Free' : formatCurrency(competition.entryFee)}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="trophy-outline" size={12} color={colors.textSecondary} />
                <Text style={styles.metaText}>{formatCurrency(competition.prizePool)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                <Text style={styles.metaText}>{formatDate(competition.startAt)}</Text>
              </View>
            </View>

            <View style={styles.spotsRow}>
              <ProgressBar
                progress={fillRatio}
                height={4}
                color={competition.spotsLeft === 0 ? colors.danger : colors.primary}
                style={styles.progress}
              />
              <Text style={styles.spotsText}>
                {competition.spotsLeft === 0
                  ? 'Full'
                  : `${competition.spotsLeft} spot${competition.spotsLeft === 1 ? '' : 's'} left`}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  row: { flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  thumb: {
    width: 84,
    height: 84,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: { width: '100%', height: '100%' },
  body: { flex: 1, gap: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  title: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    lineHeight: fontSize.md * 1.35,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: fontSize.xxs, color: colors.textSecondary, fontWeight: fontWeight.medium },
  spotsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  progress: { flex: 1 },
  spotsText: {
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
  },
});
