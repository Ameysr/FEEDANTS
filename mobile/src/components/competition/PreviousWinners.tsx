import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import type { PreviousWinner } from '../../api/types';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { SectionHeader } from '../ui/SectionHeader';

interface PreviousWinnersProps {
  winners: PreviousWinner[];
  onPressWinner?: (winner: PreviousWinner) => void;
  style?: ViewStyle;
}

const THUMB_SIZE = 104;

/** Horizontally scrolling gallery of last season's winners. */
export function PreviousWinners({ winners, onPressWinner, style }: PreviousWinnersProps) {
  if (winners.length === 0) return null;

  return (
    <View style={style}>
      <SectionHeader title="Previous Winners" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        accessibilityRole="list"
      >
        {winners.map((winner) => (
          <Pressable
            key={`${winner.name}-${winner.rank}`}
            accessibilityRole="button"
            accessibilityLabel={`${winner.name}, ${winner.rank}`}
            onPress={() => onPressWinner?.(winner)}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <View style={styles.thumb}>
              <Image
                source={{ uri: winner.thumbnailUrl ?? undefined }}
                style={styles.thumbImage}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.playOverlay}>
                <Ionicons name="play" size={14} color={colors.textOnPrimary} />
              </View>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {winner.name}
            </Text>
            <Text style={styles.rank} numberOfLines={1}>
              {winner.rank}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.md, paddingRight: spacing.lg },
  item: { width: THUMB_SIZE, alignItems: 'center' },
  itemPressed: { opacity: 0.75 },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImage: { width: '100%', height: '100%' },
  playOverlay: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
  name: {
    marginTop: spacing.sm,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  rank: {
    fontSize: fontSize.xxs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
