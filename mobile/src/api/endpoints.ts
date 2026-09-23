import { apiRequest, toQueryString } from './client';
import type {
  AuthResult,
  CompetitionDetail,
  CompetitionSummary,
  JoinResult,
  ListCompetitionsParams,
  Paginated,
  Participant,
} from './types';

export const authApi = {
  register: (input: { name: string; email: string; password: string }) =>
    apiRequest<AuthResult>('/auth/register', { method: 'POST', body: input, anonymous: true }),

  login: (input: { email: string; password: string }) =>
    apiRequest<AuthResult>('/auth/login', { method: 'POST', body: input, anonymous: true }),

  me: () => apiRequest<{ user: AuthResult['user'] }>('/auth/me'),
};

export const competitionsApi = {
  list: (params: ListCompetitionsParams = {}, signal?: AbortSignal) =>
    apiRequest<Paginated<CompetitionSummary>>(
      `/competitions${toQueryString({
        page: params.page,
        limit: params.limit,
        category: params.category,
        state: params.state,
        search: params.search,
      })}`,
      { signal },
    ),

  detail: (id: string, signal?: AbortSignal) =>
    apiRequest<CompetitionDetail>(`/competitions/${id}`, { signal }),

  participants: (id: string, page = 1, limit = 20, signal?: AbortSignal) =>
    apiRequest<Paginated<Participant>>(
      `/competitions/${id}/participants${toQueryString({ page, limit })}`,
      { signal },
    ),

  join: (id: string) => apiRequest<JoinResult>(`/competitions/${id}/join`, { method: 'POST' }),
};
