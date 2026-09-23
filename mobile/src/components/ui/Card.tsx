import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { cardShadow, colors, radius, spacing } from '../../theme';

interface CardProps extends ViewProps {
  /** Apply default inner padding. Defaults to true. */
  padded?: boolean;
  /** Adds the soft elevation used for primary surfaces. */
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** White, rounded, softly bordered surface - the base container for every section. */
export function Card({ padded = true, elevated = true, style, children, ...rest }: CardProps) {
  return (
    <View style={[styles.card, padded && styles.padded, elevated && cardShadow, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  padded: {
    padding: spacing.lg,
  },
});
