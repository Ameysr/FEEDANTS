import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, fontSize, fontWeight, spacing } from '../../theme';
import { Avatar } from '../ui/Avatar';

export type NavKey = 'home' | 'explore' | 'create' | 'competitions' | 'profile';

interface BottomNavBarProps {
  active?: NavKey;
  onNavigate?: (key: NavKey) => void;
  profileName?: string;
  profileAvatar?: string | null;
  style?: ViewStyle;
}

const ITEMS: Array<{ key: NavKey; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = [
  { key: 'home', label: 'Home', icon: 'home-outline' },
  { key: 'explore', label: 'Explore', icon: 'compass-outline' },
  { key: 'create', label: '', icon: 'add' },
  { key: 'competitions', label: 'Competitions', icon: 'trophy-outline' },
  { key: 'profile', label: 'Profile', icon: 'person-outline' },
];

/** Five-slot bottom navigation with an elevated centre action. */
export function BottomNavBar({
  active = 'competitions',
  onNavigate,
  profileName = 'Profile',
  profileAvatar,
  style,
}: BottomNavBarProps) {
  return (
    <View style={[styles.bar, style]}>
      {ITEMS.map((item) => {
        const isActive = item.key === active;

        if (item.key === 'create') {
          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel="Create"
              onPress={() => onNavigate?.(item.key)}
              style={({ pressed }) => [styles.slot, pressed && styles.pressed]}
            >
              <View style={styles.createButton}>
                <Ionicons name="add" size={26} color={colors.textOnPrimary} />
              </View>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onNavigate?.(item.key)}
            style={({ pressed }) => [styles.slot, pressed && styles.pressed]}
          >
            {item.key === 'profile' ? (
              <Avatar uri={profileAvatar} name={profileName} size={22} />
            ) : (
              <Ionicons
                name={item.icon}
                size={22}
                color={isActive ? colors.primary : colors.textMuted}
              />
            )}
            <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  slot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: spacing.xs,
  },
  pressed: { opacity: 0.6 },
  label: {
    fontSize: fontSize.xxs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  labelActive: { color: colors.primary, fontWeight: fontWeight.bold },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    borderWidth: 3,
    borderColor: colors.surface,
  },
});
