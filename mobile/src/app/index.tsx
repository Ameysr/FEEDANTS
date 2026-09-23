import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CompetitionState } from '@/api/types';
import { useAuth } from '@/auth/AuthContext';
import { BottomNavBar } from '@/components/competition/BottomNavBar';
import { CompetitionListCard } from '@/components/competition/CompetitionListCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateView';
import { useCompetitions } from '@/queries/competition';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme';
import { describeApiError } from '@/utils/errors';

type Filter = 'ALL' | CompetitionState;

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'REGISTRATION_OPEN', label: 'Open' },
  { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'FULL', label: 'Full' },
  { key: 'LIVE', label: 'Live' },
  { key: 'ENDED', label: 'Ended' },
];

export default function CompetitionsScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<Filter>('ALL');

  const { data, isLoading, isError, error, refetch, isRefetching } = useCompetitions({
    state: filter === 'ALL' ? undefined : filter,
    limit: 20,
  });

  const competitions = data?.items ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Competitions</Text>
          <Text style={styles.subtitle}>
            {isAuthenticated ? `Welcome back, ${user?.name.split(' ')[0]}` : 'Browse and join live competitions'}
          </Text>
        </View>

        {isAuthenticated ? (
          <View style={styles.avatarChip}>
            <Ionicons name="person-circle-outline" size={30} color={colors.primary} />
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/login')}
            style={({ pressed }) => [styles.signInButton, pressed && styles.pressed]}
          >
            <Text style={styles.signInLabel}>Sign in</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.filterRow}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => {
            const isActive = item.key === filter;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                onPress={() => setFilter(item.key)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>{item.label}</Text>
              </Pressable>
            );
          }}
        />
      </View>

      {isLoading ? (
        <View style={styles.list}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : isError ? (
        <ErrorState message={describeApiError(error)} onRetry={() => void refetch()} />
      ) : (
        <FlatList
          data={competitions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              title="No competitions here"
              message="Try a different filter, or pull down to refresh."
              icon="trophy-outline"
            />
          }
          renderItem={({ item }) => (
            <CompetitionListCard
              competition={item}
              onPress={() => router.push({ pathname: '/competition/[id]', params: { id: item.id } })}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      <BottomNavBar active="competitions" profileName={user?.name ?? 'Profile'} profileAvatar={user?.avatarUrl} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  headerText: { flex: 1 },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.heavy,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  avatarChip: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  signInLabel: { color: colors.textOnPrimary, fontWeight: fontWeight.bold, fontSize: fontSize.sm },
  pressed: { opacity: 0.8 },
  filterRow: { marginBottom: spacing.md },
  filterContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textSecondary },
  filterLabelActive: { color: colors.textOnPrimary },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: 0 },
  separator: { height: spacing.md },
});
