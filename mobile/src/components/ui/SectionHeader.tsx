import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, fontSize, fontWeight, spacing } from '../../theme';

interface SectionHeaderProps {
  title: string;
  /** Optional element rendered on the trailing edge (e.g. "See all"). */
  action?: React.ReactNode;
  style?: ViewStyle;
}

export function SectionHeader({ title, action, style }: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title}>{title}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
});
