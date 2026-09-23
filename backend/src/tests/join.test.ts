import request from 'supertest';
import { createApp } from '../app';
import { Competition } from '../models/Competition';
import { Participation } from '../models/Participation';
import { setSupportsTransactions } from '../config/db';
import { API, DAY, bearer, createCompetition, registerUser } from './helpers';

const app = createApp();

// Exercises BOTH write strategies: transactional (replica set) and the
// compensating-write fallback (standalone Mongo). Correctness must hold either way.
const modes = [true, false];

describe.each(modes)('POST /competitions/:id/join (transactions=%s)', (transactionsEnabled) => {
  beforeEach(() => setSupportsTransactions(transactionsEnabled));

  it('joins successfully and increments the participant counter', async () => {
    const competition = await createCompetition({ maxParticipants: 20, participantCount: 1 });
    const user = await registerUser(app);

    const res = await request(app)
      .post(`${API}/competitions/${competition.id}/join`)
      .set('Authorization', bearer(user.token));

    expect(res.status).toBe(201);
    expect(res.body.data.participation.competitionId).toBe(String(competition.id));
    expect(res.body.data.spotsLeft).toBe(18);

    const fresh = await Competition.findById(competition.id);
    expect(fresh?.participantCount).toBe(2);

    const participations = await Participation.countDocuments({ competitionId: competition.id });
    expect(participations).toBe(1);
  });

  it('rejects a second join without inflating the counter', async () => {
    const competition = await createCompetition({ maxParticipants: 20, participantCount: 0 });
    const user = await registerUser(app);

    const first = await request(app)
      .post(`${API}/competitions/${competition.id}/join`)
      .set('Authorization', bearer(user.token));
    const second = await request(app)
      .post(`${API}/competitions/${competition.id}/join`)
      .set('Authorization', bearer(user.token));

    expect(first.status).toBe(201);
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe('ALREADY_REGISTERED');

    const fresh = await Competition.findById(competition.id);
    expect(fresh?.participantCount).toBe(1);
    expect(await Participation.countDocuments({ competitionId: competition.id })).toBe(1);
  });

  it('rejects joining a full competition with 409 COMPETITION_FULL', async () => {
    const competition = await createCompetition({ maxParticipants: 5, participantCount: 5 });
    const user = await registerUser(app);

    const res = await request(app)
      .post(`${API}/competitions/${competition.id}/join`)
      .set('Authorization', bearer(user.token));

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('COMPETITION_FULL');

    const fresh = await Competition.findById(competition.id);
    expect(fresh?.participantCount).toBe(5);
  });

  it('rejects joining before registration opens', async () => {
    const competition = await createCompetition({
      registrationOpensAt: new Date(Date.now() + 1 * DAY),
      registrationClosesAt: new Date(Date.now() + 3 * DAY),
      startAt: new Date(Date.now() + 4 * DAY),
      endAt: new Date(Date.now() + 9 * DAY),
    });
    const user = await registerUser(app);

    const res = await request(app)
      .post(`${API}/competitions/${competition.id}/join`)
      .set('Authorization', bearer(user.token));

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('REGISTRATION_NOT_OPEN');
  });

  it('rejects joining after registration closes', async () => {
    const competition = await createCompetition({
      registrationClosesAt: new Date(Date.now() - 1 * DAY),
      startAt: new Date(Date.now() + 1 * DAY),
      endAt: new Date(Date.now() + 4 * DAY),
    });
    const user = await registerUser(app);

    const res = await request(app)
      .post(`${API}/competitions/${competition.id}/join`)
      .set('Authorization', bearer(user.token));

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('REGISTRATION_CLOSED');
  });

  it('rejects joining an ended competition', async () => {
    const competition = await createCompetition({ endAt: new Date(Date.now() - 1 * DAY) });
    const user = await registerUser(app);

    const res = await request(app)
      .post(`${API}/competitions/${competition.id}/join`)
      .set('Authorization', bearer(user.token));

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('COMPETITION_ENDED');
  });

  it('requires authentication', async () => {
    const competition = await createCompetition();

    const res = await request(app).post(`${API}/competitions/${competition.id}/join`);

    expect(res.status).toBe(401);
  });

  it('returns 404 for an unknown competition', async () => {
    const user = await registerUser(app);

    const res = await request(app)
      .post(`${API}/competitions/64b000000000000000000000/join`)
      .set('Authorization', bearer(user.token));

    expect(res.status).toBe(404);
  });

  /**
   * The headline guarantee: with far more contenders than spots, exactly
   * `maxParticipants` requests may succeed and the counter must never exceed it.
   */
  it('never oversells under a concurrent burst of joins', async () => {
    const maxParticipants = 10;
    const contenders = 25;

    const competition = await createCompetition({ maxParticipants, participantCount: 0 });
    const users = await Promise.all(Array.from({ length: contenders }, () => registerUser(app)));

    const results = await Promise.all(
      users.map((user) =>
        request(app)
          .post(`${API}/competitions/${competition.id}/join`)
          .set('Authorization', bearer(user.token)),
      ),
    );

    const succeeded = results.filter((r) => r.status === 201);
    const rejected = results.filter((r) => r.status === 409);

    expect(succeeded).toHaveLength(maxParticipants);
    expect(rejected).toHaveLength(contenders - maxParticipants);
    expect(rejected.every((r) => r.body.error.code === 'COMPETITION_FULL')).toBe(true);

    const fresh = await Competition.findById(competition.id);
    expect(fresh?.participantCount).toBe(maxParticipants);
    expect(fresh!.participantCount).toBeLessThanOrEqual(fresh!.maxParticipants);

    const participations = await Participation.countDocuments({
      competitionId: competition.id,
      status: 'registered',
    });
    expect(participations).toBe(maxParticipants);
  });
});
