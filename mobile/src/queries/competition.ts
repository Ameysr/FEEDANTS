import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { competitionsApi } from '../api/endpoints';
import type { CompetitionDetail, ListCompetitionsParams } from '../api/types';

export const competitionKeys = {
  all: ['competitions'] as const,
  lists: () => ['competitions', 'list'] as const,
  list: (params: ListCompetitionsParams) => ['competitions', 'list', params] as const,
  details: () => ['competitions', 'detail'] as const,
  detail: (id: string) => ['competitions', 'detail', id] as const,
  participants: (id: string) => ['competitions', 'participants', id] as const,
};

export function useCompetitions(params: ListCompetitionsParams = {}) {
  return useQuery({
    queryKey: competitionKeys.list(params),
    queryFn: ({ signal }) => competitionsApi.list(params, signal),
  });
}

export function useCompetition(id: string | undefined) {
  return useQuery({
    queryKey: competitionKeys.detail(id ?? ''),
    queryFn: ({ signal }) => competitionsApi.detail(id as string, signal),
    enabled: Boolean(id),
  });
}

export function useParticipants(id: string | undefined, limit = 12) {
  return useQuery({
    queryKey: [...competitionKeys.participants(id ?? ''), limit],
    queryFn: ({ signal }) => competitionsApi.participants(id as string, 1, limit, signal),
    enabled: Boolean(id),
  });
}

/**
 * Join a competition.
 *
 * Optimistically decrements the visible spot count so the UI feels instant,
 * then revalidates from the server. On failure the snapshot is restored and the
 * server's error code is surfaced to the caller.
 */
export function useJoinCompetition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => competitionsApi.join(id),

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: competitionKeys.detail(id) });
      const previous = queryClient.getQueryData<CompetitionDetail>(competitionKeys.detail(id));

      if (previous) {
        queryClient.setQueryData<CompetitionDetail>(competitionKeys.detail(id), {
          ...previous,
          participantCount: previous.participantCount + 1,
          spotsLeft: Math.max(0, previous.spotsLeft - 1),
        });
      }

      return { previous };
    },

    onError: (_error, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(competitionKeys.detail(id), context.previous);
      }
    },

    onSettled: (_data, _error, id) => {
      // The server's view is authoritative - always resync after a round trip.
      void queryClient.invalidateQueries({ queryKey: competitionKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: competitionKeys.participants(id) });
      void queryClient.invalidateQueries({ queryKey: competitionKeys.lists() });
    },
  });
}
