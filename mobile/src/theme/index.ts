import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/**
 * Design tokens for the Competition Details screen.
 *
 * Every visual value in the app comes from here, so re-skinning to match a
 * forthcoming design only means editing this file + the presentational
 * components - never the data or business logic.
 */
export const colors = {
  primary: '#0E5E59',
  primaryDark: '#0A4743',
  primaryPressed: '#083B38',
  primarySoft: '#E8F5F3',
  primaryTint: '#D3EBE7',

  surface: '#FFFFFF',
  background: '#F4F7F7',
  chip: '#F1F3F4',

  border: '#E4E9E9',
  borderStrong: '#D5DCDC',

  textPrimary: '#0F1B2D',
  textSecondary: '#6B7280',
  textMuted: '#9AA3A8',
  textOnPrimary: '#FFFFFF',

  success: '#15803D',
  successSoft: '#E7F6EC',
  warning: '#B45309',
  warningSoft: '#FEF3C7',
  danger: '#B91C1C',
  dangerSoft: '#FEE2E2',
  info: '#1D4ED8',
  overlay: 'rgba(15, 27, 45, 0.55)',
  scrim: 'rgba(15, 27, 45, 0.06)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const fontSize = {
  xxs: 10,
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 26,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
} as const;

/** Soft card elevation used across every surface. */
export const cardShadow: ViewStyle =
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0F1B2D',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
    },
    android: { elevation: 2 },
    default: { boxShadow: '0 2px 10px rgba(15, 27, 45, 0.06)' } as ViewStyle,
  }) ?? {};

/** Lighter elevation for chips / small controls. */
export const softShadow: ViewStyle =
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0F1B2D',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    android: { elevation: 1 },
    default: { boxShadow: '0 1px 4px rgba(15, 27, 45, 0.05)' } as ViewStyle,
  }) ?? {};

/** Elevation for the sticky bottom CTA. */
export const raisedShadow: ViewStyle =
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0F1B2D',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: { elevation: 8 },
    default: { boxShadow: '0 -2px 12px rgba(15, 27, 45, 0.08)' } as ViewStyle,
  }) ?? {};

export const heading = (size: keyof typeof fontSize = 'xxl'): TextStyle => ({
  fontSize: fontSize[size],
  fontWeight: fontWeight.bold,
  color: colors.textPrimary,
});

export const body = (size: keyof typeof fontSize = 'md'): TextStyle => ({
  fontSize: fontSize[size],
  color: colors.textSecondary,
  lineHeight: fontSize[size] * 1.5,
});

export const theme = {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
  cardShadow,
  softShadow,
  raisedShadow,
};

export type Theme = typeof theme;
