import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';

interface DisclaimerStripProps {
  text: string;
  style?: ViewStyle;
}

export function DisclaimerStrip({ text, style }: DisclaimerStripProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.chip,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  text: {
    flex: 1,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * 1.6,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
