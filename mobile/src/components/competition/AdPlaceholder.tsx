import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';

interface AdPlaceholderProps {
  style?: ViewStyle;
}

/** Reserved slot for a future ad unit. */
export function AdPlaceholder({ style }: AdPlaceholderProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="megaphone-outline" size={20} color={colors.textMuted} />
      <Text style={styles.label}>Ad Here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 96,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
});
