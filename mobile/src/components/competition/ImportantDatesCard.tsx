import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import type { CompetitionDetail } from '../../api/types';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { formatDateTime } from '../../utils/format';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

interface ImportantDatesCardProps {
  competition: CompetitionDetail;
  style?: ViewStyle;
}

interface DateItem {
  key: string;
  icon: ReactNode;
  label: string;
  value: string;
}

/** 2x2 grid of the competition's key deadlines. */
export function ImportantDatesCard({ competition, style }: ImportantDatesCardProps) {
  const items: DateItem[] = [
    {
      key: 'register',
      icon: <Ionicons name="calendar-outline" size={18} color={colors.primary} />,
      label: 'Register Before',
      value: formatDateTime(competition.registrationClosesAt),
    },
    {
      key: 'submissionStart',
      icon: <Ionicons name="paper-plane-outline" size={18} color={colors.primary} />,
      label: 'Submission Starts',
      value: formatDateTime(competition.submissionStartsAt),
    },
    {
      key: 'submissionEnd',
      icon: <Ionicons name="cloud-upload-outline" size={18} color={colors.primary} />,
      label: 'Submission Ends',
      value: formatDateTime(competition.submissionEndsAt),
    },
    {
      key: 'result',
      icon: <MaterialCommunityIcons name="trophy-outline" size={18} color={colors.primary} />,
      label: 'Result Date',
      value: formatDateTime(competition.resultAt),
    },
  ];

  return (
    <View style={style}>
      <SectionHeader title="Important Dates" />
      <Card>
        <View style={styles.grid}>
          {items.map((item) => (
            <View key={item.key} style={styles.cell}>
              <View style={styles.iconWrap}>{item.icon}</View>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{item.value}</Text>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.lg,
  },
  cell: {
    width: '50%',
    paddingRight: spacing.sm,
    gap: spacing.xs,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  value: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
  },
});
