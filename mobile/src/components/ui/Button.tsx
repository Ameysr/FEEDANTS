import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  /** Rendered to the left of the label (e.g. an icon). */
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  accessibilityHint,
}: ButtonProps) {
  const isInactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
      accessibilityHint={accessibilityHint}
      onPress={isInactive ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        pressed && !isInactive && pressedStyles[variant],
        isInactive && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? colors.textOnPrimary : colors.primary} />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text style={[styles.label, sizeTextStyles[size], labelStyles[variant]]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fullWidth: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  icon: { marginRight: spacing.sm },
  label: { fontWeight: fontWeight.bold, textAlign: 'center' },
  disabled: { opacity: 0.5 },
});

const sizeStyles = StyleSheet.create({
  md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
});

const sizeTextStyles = StyleSheet.create({
  md: { fontSize: fontSize.md },
  lg: { fontSize: fontSize.lg },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  outline: { backgroundColor: 'transparent', borderColor: colors.primary },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  danger: { backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft },
});

const pressedStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primaryPressed, borderColor: colors.primaryPressed },
  outline: { backgroundColor: colors.primarySoft },
  ghost: { backgroundColor: colors.primarySoft },
  danger: { backgroundColor: '#FBD5D5' },
});

const labelStyles = StyleSheet.create({
  primary: { color: colors.textOnPrimary },
  outline: { color: colors.primary },
  ghost: { color: colors.primary },
  danger: { color: colors.danger },
});
