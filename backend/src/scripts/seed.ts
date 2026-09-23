/**
 * Seed the database with competitions covering EVERY lifecycle state, plus
 * demo users and participations, so the Competition Details screen can be
 * demoed end-to-end without hand-crafting data.
 *
 * Dates are generated RELATIVE to run time so "registration closes in 1d 6h"
 * is always true whenever you run it.
 *
 *   npm run seed
 */
import { connectDB, disconnectDB } from '../config/db';
import { Competition } from '../models/Competition';
import { Participation } from '../models/Participation';
import { User, hashPassword } from '../models/User';
import { logger } from '../utils/logger';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const BASE = Date.now();
const at = (offsetMs: number): Date => new Date(BASE + offsetMs);

const DEMO_EMAIL = 'demo@feedants.com';
const DEMO_PASSWORD = 'Password123';
const SEED_EMAIL_DOMAIN = 'seed.feedants.test';

const img = (seed: string, w = 800, h = 450): string => `https://picsum.photos/seed/${seed}/${w}/${h}`;
const face = (id: number): string => `https://i.pravatar.cc/150?img=${id}`;

interface SeedCompetition {
  key: string;
  data: Record<string, unknown>;
  /** Number of participations to generate (must equal participantCount intent). */
  participants: number;
}

const competitions: SeedCompetition[] = [
  {
    key: 'classical-dance',
    participants: 1,
    data: {
      title: 'Feedants Classical Dance',
      subtitle: 'Show your grace, own the stage',
      description:
        'A classical dance competition celebrating Indian heritage. Perform any classical form, upload your submission video before the deadline, and get judged by professionals on technique, expression, and stage presence.',
      aboutText:
        'Feedants Classical Dance is an online competition open to dancers of all levels. Record a 2-5 minute performance in any classical style, upload it during the submission window, and our panel of professional judges will score your entry on technique, expression, rhythm, and costume. Winners receive certificates and cash prizes.',
      bannerUrl: img('feedants-classical-dance'),
      organizer: 'Feedants',
      category: 'Dance',
      tags: ['Dance', 'Multi-Win'],
      certificateText: 'Winners get certificate',
      disclaimer:
        'Judging eligibility: entries must be original performances recorded by the participant. Feedants judges decisions are final and binding.',
      refundPolicyText: 'Full refund if cancelled 48 hours before the registration deadline.',
      entryFee: 99,
      prizePool: 1500,
      registrationOpensAt: at(-2 * DAY),
      registrationClosesAt: at(1 * DAY + 6 * HOUR + 28 * MINUTE + 32_000),
      startAt: at(2 * DAY),
      endAt: at(9 * DAY),
      submissionStartsAt: at(2 * DAY),
      submissionEndsAt: at(8 * DAY),
      resultAt: at(9 * DAY),
      maxParticipants: 20,
      judge: {
        name: 'Manju Dubey',
        role: 'Judge',
        subtitle: 'Professional Kathak Dancer',
        experienceText: '12+ Years of Experience',
        avatarUrl: face(45),
        introVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      prizes: [
        { position: 1, label: '1st', amount: 550 },
        { position: 2, label: '2nd', amount: 300 },
        { position: 3, label: '3rd', amount: 240 },
        { position: 4, label: '4th', amount: 200 },
        { position: 5, label: '5th', amount: 130 },
        { position: 6, label: '6th', amount: 80 },
      ],
      previousWinners: [
        { name: 'Aditi Sharma', rank: '1st Winner', thumbnailUrl: img('winner-dance-1', 400, 400), videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
        { name: 'Rahul Verma', rank: '2nd Winner', thumbnailUrl: img('winner-dance-2', 400, 400), videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
        { name: 'Sneha Patil', rank: '3rd Winner', thumbnailUrl: img('winner-dance-3', 400, 400), videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
        { name: 'Meera Iyer', rank: '4th Winner', thumbnailUrl: img('winner-dance-4', 400, 400), videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      ],
      judgingParameters: [
        'Technique and posture - 30%',
        'Expression and abhinaya - 25%',
        'Rhythm and taalam - 25%',
        'Costume and presentation - 20%',
      ],
      rulesAndEligibility: [
        'Open to participants of all ages.',
        'Submission must be between 2 and 5 minutes.',
        'Only original recordings are allowed; no edited or dubbed audio.',
        'One entry per participant.',
      ],
      referralEarnText: 'You earn ₹10 for every signup',
      reviewSectionText: 'See what participants say about Feedants',
    },
  },
  {
    key: 'singing-star',
    participants: 8,
    data: {
      title: 'Feedants Singing Star',
      subtitle: 'Let your voice travel',
      description:
        'Solo singing competition across Bollywood, classical, and indie genres. Upload a single-take video and compete for a ₹3,000 prize pool.',
      aboutText:
        'Feedants Singing Star is a solo singing competition. Pick any genre, record a single-take performance, and get scored on pitch, tone, and stage presence.',
      bannerUrl: img('feedants-singing-star'),
      organizer: 'Feedants',
      category: 'Music',
      tags: ['Singing', 'Solo'],
      certificateText: 'Winners get certificate',
      entryFee: 49,
      prizePool: 3000,
      registrationOpensAt: at(-1 * DAY),
      registrationClosesAt: at(5 * DAY),
      startAt: at(6 * DAY),
      endAt: at(12 * DAY),
      submissionStartsAt: at(6 * DAY),
      submissionEndsAt: at(11 * DAY),
      resultAt: at(12 * DAY),
      maxParticipants: 50,
      judge: {
        name: 'Ananya Rao',
        role: 'Judge',
        subtitle: 'Playback Singer',
        experienceText: '9+ Years of Experience',
        avatarUrl: face(32),
      },
      prizes: [
        { position: 1, label: '1st', amount: 1500 },
        { position: 2, label: '2nd', amount: 900 },
        { position: 3, label: '3rd', amount: 600 },
      ],
      previousWinners: [
        { name: 'Karan Mehta', rank: '1st Winner', thumbnailUrl: img('winner-sing-1', 400, 400) },
      ],
      judgingParameters: ['Pitch accuracy - 40%', 'Tone quality - 30%', 'Stage presence - 30%'],
      rulesAndEligibility: ['Open to solo participants only.', 'Single take, no autotune.'],
      referralEarnText: 'You earn ₹10 for every signup',
      reviewSectionText: 'See what participants say about Feedants',
    },
  },
  {
    key: 'short-film-fest',
    participants: 0,
    data: {
      title: 'Feedants Short Film Fest',
      subtitle: 'Tell a story in five minutes',
      description:
        'A short film competition for storytellers. Registration opens soon - get your crew ready and secure an early spot.',
      aboutText:
        'Feedants Short Film Fest invites filmmakers to submit a short film under five minutes. Judged on story, cinematography, and editing.',
      bannerUrl: img('feedants-short-film'),
      organizer: 'Feedants',
      category: 'Film',
      tags: ['Film', 'Team'],
      entryFee: 199,
      prizePool: 10000,
      registrationOpensAt: at(3 * DAY),
      registrationClosesAt: at(10 * DAY),
      startAt: at(11 * DAY),
      endAt: at(25 * DAY),
      submissionStartsAt: at(11 * DAY),
      submissionEndsAt: at(24 * DAY),
      resultAt: at(25 * DAY),
      maxParticipants: 30,
      prizes: [
        { position: 1, label: '1st', amount: 6000 },
        { position: 2, label: '2nd', amount: 2500 },
        { position: 3, label: '3rd', amount: 1500 },
      ],
      previousWinners: [],
      judgingParameters: ['Story - 40%', 'Cinematography - 30%', 'Editing - 30%'],
      rulesAndEligibility: ['Runtime must be under 5 minutes.', 'Original score or licensed music only.'],
    },
  },
  {
    key: 'photography-contest',
    participants: 100,
    data: {
      title: 'Feedants Photography Contest',
      subtitle: 'Frame the moment',
      description:
        'Our most popular photography contest. All 100 spots are booked - this one fills fast every season.',
      aboutText:
        'Feedants Photography Contest is a themed photography challenge. This season the theme is "Streets of India".',
      bannerUrl: img('feedants-photography'),
      organizer: 'Feedants',
      category: 'Photography',
      tags: ['Photography', 'Solo'],
      entryFee: 79,
      prizePool: 5000,
      registrationOpensAt: at(-5 * DAY),
      registrationClosesAt: at(2 * DAY),
      startAt: at(3 * DAY),
      endAt: at(10 * DAY),
      submissionStartsAt: at(3 * DAY),
      submissionEndsAt: at(9 * DAY),
      resultAt: at(10 * DAY),
      maxParticipants: 100,
      prizes: [
        { position: 1, label: '1st', amount: 3000 },
        { position: 2, label: '2nd', amount: 1300 },
        { position: 3, label: '3rd', amount: 700 },
      ],
      previousWinners: [
        { name: 'Ishaan Kapoor', rank: '1st Winner', thumbnailUrl: img('winner-photo-1', 400, 400) },
        { name: 'Tara Nair', rank: '2nd Winner', thumbnailUrl: img('winner-photo-2', 400, 400) },
      ],
      judgingParameters: ['Composition - 35%', 'Lighting - 30%', 'Storytelling - 35%'],
      rulesAndEligibility: ['One entry per participant.', 'Minor colour grading allowed; no compositing.'],
    },
  },
  {
    key: 'poetry-slam',
    participants: 12,
    data: {
      title: 'Feedants Poetry Slam',
      subtitle: 'Words that land',
      description:
        'Spoken word and written poetry competition. Registration has closed - the slam begins in two days.',
      aboutText: 'Feedants Poetry Slam invites poets to submit original work in Hindi or English.',
      bannerUrl: img('feedants-poetry'),
      organizer: 'Feedants',
      category: 'Literature',
      tags: ['Poetry', 'Solo'],
      entryFee: 0,
      prizePool: 2000,
      registrationOpensAt: at(-10 * DAY),
      registrationClosesAt: at(-1 * DAY),
      startAt: at(2 * DAY),
      endAt: at(5 * DAY),
      submissionStartsAt: at(2 * DAY),
      submissionEndsAt: at(4 * DAY),
      resultAt: at(5 * DAY),
      maxParticipants: 40,
      prizes: [
        { position: 1, label: '1st', amount: 1200 },
        { position: 2, label: '2nd', amount: 500 },
        { position: 3, label: '3rd', amount: 300 },
      ],
      previousWinners: [],
      judgingParameters: ['Originality - 40%', 'Delivery - 30%', 'Language - 30%'],
      rulesAndEligibility: ['Original work only.', 'Maximum 300 words.'],
    },
  },
  {
    key: 'standup-comedy',
    participants: 15,
    data: {
      title: 'Feedants Standup Comedy',
      subtitle: 'Make them laugh',
      description:
        'The competition is live right now. Registration closed three days ago and judging is underway.',
      aboutText: 'Feedants Standup Comedy is a live comedy competition judged on writing and performance.',
      bannerUrl: img('feedants-standup'),
      organizer: 'Feedants',
      category: 'Comedy',
      tags: ['Comedy', 'Solo'],
      entryFee: 99,
      prizePool: 4000,
      registrationOpensAt: at(-12 * DAY),
      registrationClosesAt: at(-3 * DAY),
      startAt: at(-1 * DAY),
      endAt: at(2 * DAY),
      submissionStartsAt: at(-1 * DAY),
      submissionEndsAt: at(1 * DAY),
      resultAt: at(2 * DAY),
      maxParticipants: 60,
      prizes: [
        { position: 1, label: '1st', amount: 2500 },
        { position: 2, label: '2nd', amount: 1000 },
        { position: 3, label: '3rd', amount: 500 },
      ],
      previousWinners: [{ name: 'Vikram Singh', rank: '1st Winner', thumbnailUrl: img('winner-comedy-1', 400, 400) }],
      judgingParameters: ['Writing - 50%', 'Delivery - 50%'],
      rulesAndEligibility: ['No offensive content.', 'Maximum 5 minutes on stage.'],
    },
  },
  {
    key: 'sketch-battle',
    participants: 20,
    data: {
      title: 'Feedants Sketch Battle',
      subtitle: 'Draw outside the lines',
      description: 'A fast-paced sketching battle that has already concluded. Browse the results and winning entries.',
      aboutText: 'Feedants Sketch Battle is a timed sketching competition judged on creativity and execution.',
      bannerUrl: img('feedants-sketch'),
      organizer: 'Feedants',
      category: 'Art',
      tags: ['Art', 'Solo'],
      entryFee: 59,
      prizePool: 2500,
      registrationOpensAt: at(-30 * DAY),
      registrationClosesAt: at(-20 * DAY),
      startAt: at(-15 * DAY),
      endAt: at(-3 * DAY),
      submissionStartsAt: at(-15 * DAY),
      submissionEndsAt: at(-4 * DAY),
      resultAt: at(-3 * DAY),
      maxParticipants: 50,
      prizes: [
        { position: 1, label: '1st', amount: 1500 },
        { position: 2, label: '2nd', amount: 700 },
        { position: 3, label: '3rd', amount: 300 },
      ],
      previousWinners: [
        { name: 'Nisha Gupta', rank: '1st Winner', thumbnailUrl: img('winner-sketch-1', 400, 400) },
        { name: 'Arjun Das', rank: '2nd Winner', thumbnailUrl: img('winner-sketch-2', 400, 400) },
      ],
      judgingParameters: ['Creativity - 40%', 'Execution - 40%', 'Time management - 20%'],
      rulesAndEligibility: ['Digital or traditional media allowed.'],
    },
  },
];

async function run(): Promise<void> {
  await connectDB();

  logger.info('Clearing existing competitions, participations and seed users...');
  await Promise.all([
    Competition.deleteMany({}),
    Participation.deleteMany({}),
    User.deleteMany({ email: new RegExp(`@${SEED_EMAIL_DOMAIN}$`) }),
  ]);

  // Demo login account (upserted so re-running keeps the same credentials).
  const demoPasswordHash = await hashPassword(DEMO_PASSWORD);
  const demoUser = await User.findOneAndUpdate(
    { email: DEMO_EMAIL },
    { name: 'Demo User', email: DEMO_EMAIL, passwordHash: demoPasswordHash },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  // One shared hash for all generated participants keeps seeding fast.
  const seedPasswordHash = await hashPassword('Password123');

  const created: Array<{ title: string; key: string; id: unknown; state: string }> = [];

  for (const entry of competitions) {
    const competition = await Competition.create({ ...entry.data, participantCount: 0 });

    let registered = 0;
    if (entry.participants === 1) {
      // A single recognisable participant for the primary (design) competition.
      const participant = await User.findOneAndUpdate(
        { email: `aditi@${SEED_EMAIL_DOMAIN}` },
        { name: 'Aditi Sharma', email: `aditi@${SEED_EMAIL_DOMAIN}`, passwordHash: seedPasswordHash, avatarUrl: face(20) },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
      await Participation.create({
        userId: participant._id,
        competitionId: competition._id,
        status: 'registered',
        registeredAt: at(-1 * DAY),
      });
      registered = 1;
    } else if (entry.participants > 1) {
      const users = await User.insertMany(
        Array.from({ length: entry.participants }, (_, i) => ({
          name: `${entry.key} participant ${i + 1}`,
          email: `p${i + 1}.${entry.key}@${SEED_EMAIL_DOMAIN}`,
          passwordHash: seedPasswordHash,
          avatarUrl: face((i % 70) + 1),
        })),
      );
      await Participation.insertMany(
        users.map((user, i) => ({
          userId: user._id,
          competitionId: competition._id,
          status: 'registered' as const,
          registeredAt: new Date(BASE - (entry.participants - i) * HOUR),
        })),
      );
      registered = users.length;
    }

    if (registered > 0) {
      await Competition.updateOne({ _id: competition._id }, { $set: { participantCount: registered } });
    }
    created.push({
      title: competition.title,
      key: entry.key,
      id: competition._id,
      state: 'computed at read time',
    });
  }

  logger.info(`Seeded ${created.length} competitions and ${created.length} participation sets.`);

  // eslint-disable-next-line no-console
  console.log('\n=== Seed complete ===');
  // eslint-disable-next-line no-console
  console.table(
    created.map((c) => ({ Competition: c.title, Id: String(c.id) })),
  );
  // eslint-disable-next-line no-console
  console.log(`\nDemo login:  ${DEMO_EMAIL}  /  ${DEMO_PASSWORD}  (id ${demoUser._id})\n`);

  await disconnectDB();
  process.exit(0);
}

run().catch(async (err) => {
  logger.error('Seeding failed', err);
  await disconnectDB().catch(() => undefined);
  process.exit(1);
});
