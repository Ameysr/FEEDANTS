import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../../theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

/** Pulsing placeholder block used while competition data loads. */
export function Skeleton({ width = '100%', height = 16, radius: cornerRadius = radius.sm, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.block, { width, height, borderRadius: cornerRadius, opacity }, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

interface SkeletonCardProps {
  style?: ViewStyle;
}

export function SkeletonCard({ style }: SkeletonCardProps) {
  return (
    <Animated.View style={[styles.card, style]}>
      <Skeleton height={120} radius={radius.md} />
      <Skeleton height={20} width="70%" style={styles.gap} />
      <Skeleton height={14} width="40%" style={styles.gapSm} />
      <Skeleton height={14} width="90%" style={styles.gapSm} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: colors.scrim },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  gap: { marginTop: spacing.lg },
  gapSm: { marginTop: spacing.sm },
});
