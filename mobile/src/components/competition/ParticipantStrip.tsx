import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import type { Participant } from '../../api/types';
import { colors, fontSize, fontWeight, spacing } from '../../theme';
import { Avatar } from '../ui/Avatar';

interface ParticipantStripProps {
  participants: Participant[];
  total: number;
  maxVisible?: number;
  style?: ViewStyle;
}

/**
 * Overlapping avatar stack of registered participants, plus a "+N" overflow
 * chip. Gives the registration count a human face.
 */
export function ParticipantStrip({ participants, total, maxVisible = 6, style }: ParticipantStripProps) {
  if (total === 0) return null;

  const visible = participants.slice(0, maxVisible);
  const overflow = Math.max(0, total - visible.length);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.stack}>
        {visible.map((participant, index) => (
          <Avatar
            key={participant.id}
            uri={participant.user.avatarUrl}
            name={participant.user.name}
            size={30}
            ring
            style={index === 0 ? undefined : styles.overlap}
          />
        ))}
        {overflow > 0 ? (
          <View style={[styles.overflow, styles.overlap]}>
            <Text style={styles.overflowText}>+{overflow}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.label}>
        {total} {total === 1 ? 'participant' : 'participants'} registered
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stack: { flexDirection: 'row', alignItems: 'center' },
  overlap: { marginLeft: -10 },
  overflow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.chip,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowText: {
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
  },
  label: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
});
