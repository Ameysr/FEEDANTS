/**
 * Standalone concurrency probe.
 *
 * Fires N simultaneous join requests at a running API and verifies the
 * competition never oversells. Useful evidence for the demo recording.
 *
 *   npm run concurrency -- <competitionId> [contenders]
 *   API_URL=http://localhost:4000/api/v1 npm run concurrency -- 6712... 50
 */
const API_URL = process.env.API_URL ?? 'http://localhost:4000/api/v1';
const competitionId = process.argv[2];
const contenders = Number(process.argv[3] ?? 50);

if (!competitionId) {
  console.error('Usage: npm run concurrency -- <competitionId> [contenders]');
  process.exit(1);
}

interface Json {
  success: boolean;
  data?: any;
  error?: { code: string; message: string };
}

async function call(path: string, init?: RequestInit): Promise<{ status: number; body: Json }> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  });
  return { status: res.status, body: (await res.json()) as Json };
}

async function main(): Promise<void> {
  console.log(`\nTarget:      ${API_URL}/competitions/${competitionId}`);
  console.log(`Contenders:  ${contenders}\n`);

  const before = await call(`/competitions/${competitionId}`);
  if (before.status !== 200) {
    console.error('Could not load competition:', before.status, before.body.error);
    process.exit(1);
  }
  const { maxParticipants, participantCount } = before.body.data;
  const spots = maxParticipants - participantCount;
  console.log(`Capacity:    ${participantCount}/${maxParticipants} booked  (${spots} spots free)\n`);

  console.log('Registering contenders...');
  const stamp = Date.now();
  const registrations = await Promise.all(
    Array.from({ length: contenders }, async (_, i) => {
      const res = await call('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: `Load Tester ${i + 1}`,
          email: `load.${stamp}.${i + 1}@example.com`,
          password: 'Password123',
        }),
      });
      return { token: res.body.data?.accessToken as string | undefined, status: res.status };
    }),
  );

  const tokens = registrations.map((r) => r.token).filter((t): t is string => Boolean(t));
  const rateLimited = registrations.filter((r) => r.status === 429).length;

  console.log(`Registered ${tokens.length} contenders.`);
  if (rateLimited > 0) {
    console.log(
      `  note: ${rateLimited} registrations were rate limited (the API allows 30 auth requests / 15 min / IP).`,
    );
    console.log('  run this against a fresh window, or with the server started in NODE_ENV=test, for more contenders.');
  }

  console.log('\nFiring simultaneous join requests...');
  const started = Date.now();
  const results = await Promise.all(
    tokens.map((token) =>
      call(`/competitions/${competitionId}/join`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
      }),
    ),
  );
  const elapsed = Date.now() - started;

  const byCode = new Map<string, number>();
  let created = 0;
  for (const r of results) {
    if (r.status === 201) created += 1;
    const key = r.status === 201 ? '201 CREATED' : `${r.status} ${r.body.error?.code ?? 'ERROR'}`;
    byCode.set(key, (byCode.get(key) ?? 0) + 1);
  }

  const after = await call(`/competitions/${competitionId}`);
  const finalCount = after.body.data.participantCount;

  console.log(`\nCompleted in ${elapsed}ms\n`);
  console.table(Object.fromEntries([...byCode.entries()].map(([k, v]) => [k, v])));
  console.log(`\nSuccessful joins:      ${created}`);
  console.log(`Counter before/after:  ${participantCount} -> ${finalCount}`);
  console.log(`Capacity:              ${maxParticipants}`);

  const oversold = finalCount > maxParticipants;
  const consistent = finalCount === Math.min(participantCount + created, maxParticipants);

  console.log(`\nOversold:              ${oversold ? 'YES (BUG!)' : 'no'}`);
  console.log(`Counter consistent:    ${consistent ? 'yes' : 'NO (BUG!)'}\n`);

  process.exit(oversold || !consistent ? 1 : 0);
}

main().catch((err) => {
  console.error('Concurrency probe failed', err);
  process.exit(1);
});
