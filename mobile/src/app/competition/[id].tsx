import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/auth/AuthContext';
import { AdPlaceholder } from '@/components/competition/AdPlaceholder';
import { BottomNavBar } from '@/components/competition/BottomNavBar';
import { CompetitionTopBar } from '@/components/competition/CompetitionTopBar';
import { ContentTabs } from '@/components/competition/ContentTabs';
import { CountdownBanner } from '@/components/competition/CountdownBanner';
import { DisclaimerStrip } from '@/components/competition/DisclaimerStrip';
import { ImportantDatesCard } from '@/components/competition/ImportantDatesCard';
import { JoinCta, getCtaState } from '@/components/competition/JoinCta';
import { JudgeCard } from '@/components/competition/JudgeCard';
import { ParticipantStrip } from '@/components/competition/ParticipantStrip';
import { PreviousWinners } from '@/components/competition/PreviousWinners';
import { PrizeInfoRow } from '@/components/competition/PrizeInfoRow';
import { ReferralBanner } from '@/components/competition/ReferralBanner';
import { ReviewsRow } from '@/components/competition/ReviewsRow';
import { RewardsTable } from '@/components/competition/RewardsTable';
import { TitleCard } from '@/components/competition/TitleCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/StateView';
import { useCountdown } from '@/hooks/useCountdown';
import { useCompetition, useJoinCompetition, useParticipants } from '@/queries/competition';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme';
import { describeApiError } from '@/utils/errors';

interface Feedback {
  tone: 'success' | 'error';
  message: string;
}

export default function CompetitionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const competitionQuery = useCompetition(id);
  const participantsQuery = useParticipants(id, 8);
  const joinMutation = useJoinCompetition();

  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const competition = competitionQuery.data;
  // The server tells us which boundary is next; the hook corrects for clock skew.
  const countdown = useCountdown(competition?.nextMilestone?.at ?? null, competition?.serverTime);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const runJoin = async () => {
    if (!id) return;
    setFeedback(null);
    try {
      const result = await joinMutation.mutateAsync(id);
      setFeedback({
        tone: 'success',
        message:
          result.spotsLeft === 0
            ? "You're registered! That was the last spot."
            : `You're registered! ${result.spotsLeft} spot${result.spotsLeft === 1 ? '' : 's'} left.`,
      });
    } catch (error) {
      setFeedback({ tone: 'error', message: describeApiError(error) });
    }
  };

  const handlePrimaryAction = () => {
    if (!competition) return;
    const cta = getCtaState(competition);

    switch (cta.intent) {
      case 'sign-in':
        router.push('/login');
        return;
      case 'join':
        void runJoin();
        return;
      case 'upload':
        Alert.alert(
          'Upload Submission',
          'You are registered for this competition. Submission upload opens during the submission window.',
        );
        return;
      default:
        return;
    }
  };

  const openVideo = (url?: string | null) => {
    if (!url) {
      Alert.alert('Video', 'No intro video available.');
      return;
    }
    void Linking.openURL(url).catch(() => Alert.alert('Video', 'Could not open the video link.'));
  };

  const isLoading = competitionQuery.isLoading;
  const isError = competitionQuery.isError;

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.topSafe}>
        <CompetitionTopBar onBack={goBack} />
      </SafeAreaView>

      {isLoading ? (
        <DetailSkeleton />
      ) : isError || !competition ? (
        <ErrorState
          message={describeApiError(competitionQuery.error)}
          onRetry={() => void competitionQuery.refetch()}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          accessibilityRole="scrollbar"
        >
          <TitleCard competition={competition} />

          <ParticipantStrip
            participants={participantsQuery.data?.items ?? []}
            total={competition.participantCount}
          />

          {competition.judge ? (
            <JudgeCard
              judge={competition.judge}
              onPressIntroVideo={() => openVideo(competition.judge?.introVideoUrl)}
            />
          ) : null}

          {competition.nextMilestone ? (
            <CountdownBanner milestoneType={competition.nextMilestone.type} countdown={countdown.label} />
          ) : null}

          <ImportantDatesCard competition={competition} />

          <PreviousWinners
            winners={competition.previousWinners}
            onPressWinner={(winner) => openVideo(winner.videoUrl)}
          />

          <ContentTabs competition={competition} />

          <RewardsTable prizes={competition.prizes} />

          {competition.disclaimer ? <DisclaimerStrip text={competition.disclaimer} /> : null}

          <PrizeInfoRow
            refundPolicyText={competition.refundPolicyText}
            onPressVideo={() => openVideo('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
          />

          <ReferralBanner
            referralLink={`https://feedants.app/ref/${user?.id ?? 'guest'}`}
            earnText={competition.referralEarnText}
            onReferNow={() => Alert.alert('Refer & Earn', 'Sharing options will open here.')}
          />

          <ReviewsRow subtitle={competition.reviewSectionText} />

          <AdPlaceholder />
        </ScrollView>
      )}

      {feedback ? <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback(null)} /> : null}

      {competition ? (
        <JoinCta competition={competition} onPress={handlePrimaryAction} isPending={joinMutation.isPending} />
      ) : null}

      <View style={[styles.navWrapper, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
        <BottomNavBar
          active="competitions"
          profileName={user?.name ?? 'Profile'}
          profileAvatar={user?.avatarUrl}
          onNavigate={(key) => {
            if (key === 'home' || key === 'explore') goBack();
          }}
        />
      </View>
    </View>
  );
}

function FeedbackBanner({ feedback, onDismiss }: { feedback: Feedback; onDismiss: () => void }) {
  const isSuccess = feedback.tone === 'success';

  return (
    <View style={[styles.feedback, isSuccess ? styles.feedbackSuccess : styles.feedbackError]}>
      <Ionicons
        name={isSuccess ? 'checkmark-circle' : 'alert-circle'}
        size={18}
        color={isSuccess ? colors.success : colors.danger}
      />
      <Text style={[styles.feedbackText, { color: isSuccess ? colors.success : colors.danger }]}>
        {feedback.message}
      </Text>
      <Text onPress={onDismiss} style={styles.feedbackDismiss} accessibilityRole="button">
        Dismiss
      </Text>
    </View>
  );
}

function DetailSkeleton() {
  return (
    <ScrollView contentContainerStyle={styles.content} scrollEnabled={false}>
      <View style={styles.skeletonCard}>
        <Skeleton height={24} width="70%" />
        <Skeleton height={14} width="40%" style={styles.skeletonGap} />
        <Skeleton height={14} width="90%" style={styles.skeletonGap} />
        <Skeleton height={56} radius={radius.md} style={styles.skeletonGapLg} />
      </View>
      <View style={styles.skeletonCard}>
        <Skeleton height={56} radius={radius.md} />
      </View>
      <View style={styles.skeletonCard}>
        <Skeleton height={44} radius={radius.md} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  topSafe: { backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  navWrapper: { backgroundColor: colors.surface },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  feedbackSuccess: { backgroundColor: colors.successSoft },
  feedbackError: { backgroundColor: colors.dangerSoft },
  feedbackText: { flex: 1, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  feedbackDismiss: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
  },
  skeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  skeletonGap: { marginTop: spacing.md },
  skeletonGapLg: { marginTop: spacing.lg },
});
