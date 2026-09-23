import type { Express } from 'express';
import request from 'supertest';
import { Competition } from '../models/Competition';

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export const API = '/api/v1';

export function makeCompetitionData(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const now = Date.now();
  return {
    title: 'Test Competition',
    subtitle: 'Test subtitle',
    description: 'A competition used in automated tests.',
    organizer: 'Feedants',
    category: 'Dance',
    tags: ['Dance', 'Test'],
    entryFee: 0,
    prizePool: 1000,
    registrationOpensAt: new Date(now - 2 * DAY),
    registrationClosesAt: new Date(now + 2 * DAY),
    startAt: new Date(now + 3 * DAY),
    endAt: new Date(now + 10 * DAY),
    maxParticipants: 10,
    participantCount: 0,
    prizes: [],
    previousWinners: [],
    judgingParameters: [],
    rulesAndEligibility: [],
    ...overrides,
  };
}

export async function createCompetition(overrides: Record<string, unknown> = {}) {
  return Competition.create(makeCompetitionData(overrides));
}

export interface RegisteredUser {
  token: string;
  id: string;
  email: string;
}

let userCounter = 0;

/** Registers a fresh user through the public API and returns their access token. */
export async function registerUser(app: Express, overrides: Partial<{ name: string; email: string; password: string }> = {}): Promise<RegisteredUser> {
  userCounter += 1;
  const email = overrides.email ?? `user${userCounter}.${Date.now()}@example.com`;
  const password = overrides.password ?? 'Password123';

  const res = await request(app)
    .post(`${API}/auth/register`)
    .send({ name: overrides.name ?? `User ${userCounter}`, email, password });

  if (res.status !== 201) {
    throw new Error(`Failed to register test user: ${res.status} ${JSON.stringify(res.body)}`);
  }

  return { token: res.body.data.accessToken, id: res.body.data.user.id, email };
}

export const bearer = (token: string): string => `Bearer ${token}`;
