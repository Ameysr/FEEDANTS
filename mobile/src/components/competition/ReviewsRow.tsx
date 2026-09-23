import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { Card } from '../ui/Card';

interface ReviewsRowProps {
  subtitle?: string | null;
  onPress?: () => void;
  style?: ViewStyle;
}

/** Entry point into participant reviews. */
export function ReviewsRow({ subtitle, onPress, style }: ReviewsRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Hear from our users"
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed, style]}
    >
      <Card style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primary} />
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>Hear From Our Users</Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle ?? 'See what participants say about Feedants'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
