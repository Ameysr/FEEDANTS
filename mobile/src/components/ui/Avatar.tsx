import { Image } from 'expo-image';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, fontSize, fontWeight } from '../../theme';
import { initials } from '../../utils/format';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
  /** Draws a white ring around the avatar (used in stacked participant lists). */
  ring?: boolean;
  style?: ViewStyle;
}

export function Avatar({ uri, name, size = 44, ring = false, style }: AvatarProps) {
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View
      style={[
        styles.container,
        dimension,
        ring && styles.ring,
        style,
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={dimension} contentFit="cover" transition={200} />
      ) : (
        <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials(name)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ring: {
    borderWidth: 2,
    borderColor: colors.surface,
  },
  initials: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
});
