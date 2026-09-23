import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import type { Prize } from '../../api/types';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { formatCurrency } from '../../utils/format';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const POSITION_ICONS: IconName[] = ['medal', 'medal-outline', 'star', 'star-outline', 'trophy-outline', 'trophy'];

function iconForPosition(position: number): IconName {
  return POSITION_ICONS[(position - 1) % POSITION_ICONS.length] ?? 'medal';
}

interface RewardsTableProps {
  prizes: Prize[];
  style?: ViewStyle;
}

/** Payout breakdown for every winning position. */
export function RewardsTable({ prizes, style }: RewardsTableProps) {
  if (prizes.length === 0) return null;

  const sorted = [...prizes].sort((a, b) => a.position - b.position);

  return (
    <View style={style}>
      <SectionHeader title="Rewards (All Positions)" />
      <Card padded={false}>
        {sorted.map((prize, index) => (
          <View
            key={`${prize.position}-${prize.label}`}
            style={[styles.row, index < sorted.length - 1 && styles.divider]}
          >
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons
                name={iconForPosition(prize.position)}
                size={18}
                color={index === 0 ? colors.primary : colors.textSecondary}
              />
            </View>
            <Text style={styles.label}>{prize.label} Position</Text>
            <Text style={styles.amount}>{formatCurrency(prize.amount)}</Text>
          </View>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  amount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.heavy,
    color: colors.primary,
  },
});
