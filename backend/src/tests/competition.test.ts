import request from 'supertest';
import { createApp } from '../app';
import { API, DAY, bearer, createCompetition, registerUser } from './helpers';

const app = createApp();

const offsets = {
  upcoming: { registrationOpensAt: () => new Date(Date.now() + 1 * DAY) },
  open: {},
  closed: {
    registrationClosesAt: () => new Date(Date.now() - 1 * DAY),
    startAt: () => new Date(Date.now() + 1 * DAY),
    endAt: () => new Date(Date.now() + 5 * DAY),
  },
  live: {
    registrationClosesAt: () => new Date(Date.now() - 3 * DAY),
    startAt: () => new Date(Date.now() - 1 * DAY),
    endAt: () => new Date(Date.now() + 1 * DAY),
  },
  ended: { endAt: () => new Date(Date.now() - 1 * DAY) },
};

describe('GET /competitions/:id (detail + derived state)', () => {
  const cases: Array<{ name: string; overrides: Record<string, unknown>; state: string; reason: string }> = [
    { name: 'upcoming', overrides: { registrationOpensAt: offsets.upcoming.registrationOpensAt() }, state: 'UPCOMING', reason: 'NOT_OPEN' },
    { name: 'registration open', overrides: {}, state: 'REGISTRATION_OPEN', reason: '' },
    { name: 'full', overrides: { maxParticipants: 5, participantCount: 5 }, state: 'FULL', reason: 'FULL' },
    { name: 'registration closed', overrides: { registrationClosesAt: offsets.closed.registrationClosesAt(), startAt: offsets.closed.startAt(), endAt: offsets.closed.endAt() }, state: 'REGISTRATION_CLOSED', reason: 'CLOSED' },
    { name: 'live', overrides: { registrationClosesAt: offsets.live.registrationClosesAt(), startAt: offsets.live.startAt(), endAt: offsets.live.endAt() }, state: 'LIVE', reason: 'CLOSED' },
    { name: 'ended', overrides: { endAt: offsets.ended.endAt() }, state: 'ENDED', reason: 'ENDED' },
  ];

  it.each(cases)('reports $state for a $name competition', async ({ overrides, state }) => {
    const competition = await createCompetition(overrides);

    const res = await request(app).get(`${API}/competitions/${competition.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.state).toBe(state);
    expect(res.body.data.serverTime).toEqual(expect.any(String));
  });

  it('reports AUTH_REQUIRED for an anonymous viewer on an open competition', async () => {
    const competition = await createCompetition({ maxParticipants: 20, participantCount: 1 });

    const res = await request(app).get(`${API}/competitions/${competition.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.state).toBe('REGISTRATION_OPEN');
    expect(res.body.data.canJoin).toBe(false);
    expect(res.body.data.joinBlockedReason).toBe('AUTH_REQUIRED');
    expect(res.body.data.viewer).toBeNull();
  });

  it('reports canJoin=true and correct spotsLeft for an authenticated viewer', async () => {
    const competition = await createCompetition({ maxParticipants: 20, participantCount: 1 });
    const user = await registerUser(app);

    const res = await request(app)
      .get(`${API}/competitions/${competition.id}`)
      .set('Authorization', bearer(user.token));

    expect(res.body.data.canJoin).toBe(true);
    expect(res.body.data.joinBlockedReason).toBeNull();
    expect(res.body.data.spotsLeft).toBe(19);
    expect(res.body.data.participantCount).toBe(1);
    expect(res.body.data.maxParticipants).toBe(20);
    expect(res.body.data.viewer).toEqual({ isRegistered: false, registeredAt: null });
  });

  it('reflects the viewer registration state after joining', async () => {
    const competition = await createCompetition({ maxParticipants: 20, participantCount: 1 });
    const user = await registerUser(app);
    await request(app)
      .post(`${API}/competitions/${competition.id}/join`)
      .set('Authorization', bearer(user.token));

    const res = await request(app)
      .get(`${API}/competitions/${competition.id}`)
      .set('Authorization', bearer(user.token));

    expect(res.body.data.viewer.isRegistered).toBe(true);
    expect(res.body.data.viewer.registeredAt).toEqual(expect.any(String));
    expect(res.body.data.canJoin).toBe(false);
    expect(res.body.data.joinBlockedReason).toBe('ALREADY_JOINED');
    expect(res.body.data.spotsLeft).toBe(18);
  });

  it('exposes the next milestone for the countdown', async () => {
    const closesAt = new Date(Date.now() + 2 * DAY);
    const competition = await createCompetition({ registrationClosesAt: closesAt });

    const res = await request(app).get(`${API}/competitions/${competition.id}`);

    expect(res.body.data.nextMilestone).toEqual({ type: 'REGISTRATION_CLOSES', at: closesAt.toISOString() });
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).get(`${API}/competitions/64b000000000000000000000`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 400 for a malformed id', async () => {
    const res = await request(app).get(`${API}/competitions/not-an-id`);
    expect(res.status).toBe(400);
  });
});

describe('GET /competitions (list)', () => {
  it('filters by lifecycle state', async () => {
    await createCompetition({ title: 'Open One' });
    await createCompetition({ title: 'Ended One', endAt: new Date(Date.now() - DAY) });

    const res = await request(app).get(`${API}/competitions`).query({ state: 'ENDED' });

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].title).toBe('Ended One');
    expect(res.body.data.total).toBe(1);
  });

  it('paginates', async () => {
    await Promise.all(Array.from({ length: 5 }, (_, i) => createCompetition({ title: `C${i}` })));

    const res = await request(app).get(`${API}/competitions`).query({ page: 2, limit: 2 });

    expect(res.body.data.items).toHaveLength(2);
    expect(res.body.data.total).toBe(5);
    expect(res.body.data.totalPages).toBe(3);
  });

  it('rejects an invalid limit', async () => {
    const res = await request(app).get(`${API}/competitions`).query({ limit: 999 });
    expect(res.status).toBe(400);
  });
});

describe('GET /competitions/:id/participants', () => {
  it('lists registered participants', async () => {
    const competition = await createCompetition({ maxParticipants: 10 });
    const user = await registerUser(app, { name: 'Aditi Sharma' });
    await request(app).post(`${API}/competitions/${competition.id}/join`).set('Authorization', bearer(user.token));

    const res = await request(app).get(`${API}/competitions/${competition.id}/participants`);

    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(1);
    expect(res.body.data.items[0].user.name).toBe('Aditi Sharma');
  });
});
