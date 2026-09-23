import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import type { Judge } from '../../api/types';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { Avatar } from '../ui/Avatar';
import { Card } from '../ui/Card';

interface JudgeCardProps {
  judge: Judge;
  onPressIntroVideo?: () => void;
  style?: ViewStyle;
}

/** Judge profile with an intro-video affordance. */
export function JudgeCard({ judge, onPressIntroVideo, style }: JudgeCardProps) {
  return (
    <Card style={[styles.card, style]}>
      <Avatar uri={judge.avatarUrl} name={judge.name} size={56} />

      <View style={styles.info}>
        <Text style={styles.role}>{judge.role}</Text>
        <Text style={styles.name}>{judge.name}</Text>
        {judge.subtitle ? <Text style={styles.subtitle}>{judge.subtitle}</Text> : null}
        {judge.experienceText ? <Text style={styles.experience}>{judge.experienceText}</Text> : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Play ${judge.name} intro video`}
        onPress={onPressIntroVideo}
        style={({ pressed }) => [styles.playWrapper, pressed && styles.playPressed]}
        hitSlop={6}
      >
        <View style={styles.playButton}>
          <Ionicons name="play" size={18} color={colors.textOnPrimary} />
        </View>
        <Text style={styles.playLabel}>Intro Video</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  info: { flex: 1 },
  role: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  experience: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xs,
  },
  playWrapper: { alignItems: 'center', gap: spacing.xs },
  playPressed: { opacity: 0.7 },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
  playLabel: {
    fontSize: fontSize.xxs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
});
