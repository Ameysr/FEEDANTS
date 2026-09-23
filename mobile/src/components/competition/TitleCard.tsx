import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import type { CompetitionDetail } from '../../api/types';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { formatCurrency } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { SpotsLeftMeter } from './SpotsLeftMeter';
import { StateBadge } from './StateBadge';

interface TitleCardProps {
  competition: CompetitionDetail;
  style?: ViewStyle;
}

/**
 * Headline block: title, registration badge, tags, certificate note and the
 * three-column stat row (prize pool / entry fee / spots left).
 */
export function TitleCard({ competition, style }: TitleCardProps) {
  const isRegistered = competition.viewer?.isRegistered ?? false;
  const isFree = competition.entryFee === 0;

  return (
    <Card style={style}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{competition.title}</Text>
        {isRegistered ? (
          <Badge
            label="Registered"
            tone="primary"
            outlined
            icon={<Ionicons name="checkmark-circle" size={13} color={colors.primary} />}
          />
        ) : (
          <StateBadge state={competition.state} />
        )}
      </View>

      {competition.subtitle ? <Text style={styles.subtitle}>{competition.subtitle}</Text> : null}

      {competition.tags.length > 0 ? (
        <View style={styles.tags}>
          {competition.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagLabel}>{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {competition.certificateText ? (
        <View style={styles.certificateRow}>
          <MaterialCommunityIcons name="trophy-outline" size={16} color={colors.primary} />
          <Text style={styles.certificateText}>{competition.certificateText}</Text>
        </View>
      ) : null}

      <View style={styles.statsRow}>
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>Prize Pool</Text>
          <Text style={styles.statValue}>{formatCurrency(competition.prizePool)}</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>Entry Fee</Text>
          <Text style={styles.statValue}>{isFree ? 'Free' : formatCurrency(competition.entryFee)}</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.spotsColumn}>
          <SpotsLeftMeter
            participantCount={competition.participantCount}
            maxParticipants={competition.maxParticipants}
            spotsLeft={competition.spotsLeft}
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    flex: 1,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.heavy,
    color: colors.textPrimary,
    lineHeight: fontSize.xxl * 1.25,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    backgroundColor: colors.chip,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  tagLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  certificateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  certificateText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  statColumn: { flex: 1, gap: spacing.xs },
  spotsColumn: { flex: 1.4 },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.heavy,
    color: colors.primary,
  },
});
