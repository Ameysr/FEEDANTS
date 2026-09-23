# Feedants — Competition Details Screen (Full-Stack Module)

A functional, production-minded implementation of the **Competition Details** screen from the
Feedants mobile app. Competition data, lifecycle state, remaining spots and the viewer's
registration state are all served by a real backend and stored in MongoDB — nothing is hardcoded
in the app.

| Layer    | Stack                                                                     |
| -------- | ------------------------------------------------------------------------- |
| Mobile   | React Native (Expo SDK 57), TypeScript, expo-router, TanStack Query        |
| Backend  | Node.js, Express, TypeScript, Mongoose, JWT (bcrypt), Zod                  |
| Database | MongoDB                                                                    |

---

## 1. What's implemented

**Competition Details screen** — built to the provided design reference:

1. Header with back navigation + `ENG / हिंदी` language toggle
2. Title card — headline, `Registered` badge, tag pills, certificate note, 3-column stats
   (Prize Pool / Entry Fee / spots-left meter with progress bar)
3. Judge card with intro-video affordance
4. Mint countdown banner (hourglass → `01d : 06h : 28m : 32s` → "Hurry up!")
5. Important Dates 2×2 grid
6. Previous Winners horizontal gallery
7. Tabs — About Competition / Judging Parameters / Rules & Eligibility, with *View more*
8. Rewards (All Positions) table
9. Disclaimer strip
10. Info row — prize-money explainer video + refund / secure-payments trust tile
11. Refer & Earn banner with copyable link
12. "Hear From Our Users" review row
13. Ad placeholder
14. Sticky bottom CTA whose label is derived from live competition state
15. Bottom navigation bar

**Functional behaviour (not just UI):**

- **Join/Register end-to-end** — atomic, capacity-safe, idempotent
- Competition **lifecycle** derived from dates: `UPCOMING → REGISTRATION_OPEN → FULL →
  REGISTRATION_CLOSED → LIVE → ENDED`
- **Remaining spots** tracked live and enforced
- **Time-dependent** countdowns computed against *server* time (device clock skew corrected)
- **User participation state** (registered / not registered) reflected per viewer
- **Consistency under concurrent joins** — see §7

---

## 2. Repository layout

```
FEEDANTS/
├─ backend/                 # Express + MongoDB API
│  └─ src/
│     ├─ config/            # validated env, DB connection, transaction detection
│     ├─ models/            # User, Competition, Participation (+ indexes)
│     ├─ modules/
│     │  ├─ auth/           # register / login / me
│     │  └─ competitions/   # list / detail / join / participants
│     ├─ middleware/        # auth, validation, rate limiting, error handling
│     ├─ utils/             # AppError, competitionState, jwt, logger
│     ├─ scripts/           # seed, dev mongo, concurrency probe
│     └─ tests/             # Jest + Supertest + in-memory Mongo
├─ mobile/                  # Expo React Native app
│  └─ src/
│     ├─ app/               # expo-router routes (list, detail, auth)
│     ├─ api/               # typed API client + contract types
│     ├─ components/
│     │  ├─ ui/             # Card, Button, Badge, Avatar, Skeleton, ...
│     │  └─ competition/    # one component per design section
│     ├─ queries/           # TanStack Query hooks (+ optimistic join)
│     ├─ theme/             # design tokens (single swap point for re-skinning)
│     └─ utils/             # formatting, countdown, storage, error copy
├─ docker-compose.yml       # MongoDB (standalone + optional replica set)
└─ README.md
```

---

## 3. Getting started

### Prerequisites

- Node.js 18+ (developed on Node 24)
- MongoDB — **or** none at all: the backend ships an in-memory MongoDB for development

### 3.1 Backend

```bash
cd backend
npm install
cp .env.example .env          # Windows: copy .env.example .env
```

Pick **one** way to provide MongoDB:

```bash
# Option A - no MongoDB installed (easiest for a quick look)
npm run mongo:dev             # terminal 1: in-memory MongoDB on :27017

# Option B - Docker
docker compose up -d          # standalone MongoDB on :27017

# Option C - Docker with transactions enabled (single-node replica set)
docker compose --profile rs up -d    # then set MONGODB_URI to :27018 in .env

# Option D - MongoDB Atlas: set MONGODB_URI in .env to your connection string
```

Then, in a second terminal:

```bash
npm run seed                  # 7 competitions covering every lifecycle state + demo users
npm run dev                   # API on http://localhost:4000
```

Health check: <http://localhost:4000/health>

**Seed data** (dates are generated relative to now, so every state is always demoable):

| Competition                   | State               | Spots    |
| ----------------------------- | ------------------- | -------- |
| Feedants Classical Dance      | `REGISTRATION_OPEN` | 1/20     |
| Feedants Singing Star         | `REGISTRATION_OPEN` | 8/50     |
| Feedants Short Film Fest      | `UPCOMING`          | 0/30     |
| Feedants Photography Contest  | `FULL`              | 100/100  |
| Feedants Poetry Slam          | `REGISTRATION_CLOSED` | 12/40  |
| Feedants Standup Comedy       | `LIVE`              | 15/60    |
| Feedants Sketch Battle        | `ENDED`             | 20/50    |

**Demo login:** `demo@feedants.com` / `Password123`

### 3.2 Mobile app

```bash
cd mobile
npm install
cp .env.example .env          # Windows: copy .env.example .env
npx expo start                # press w (web), a (Android), i (iOS) - or scan with Expo Go
```

`feedants` is the URL scheme, so `npx expo start --web` opens the same app in a browser.

**Pointing the app at the backend** — the app resolves the API URL in this order:

1. `EXPO_PUBLIC_API_URL` if set
2. The Expo dev-server host (so a **physical device on the same Wi-Fi works with no config**)
3. `10.0.2.2` on Android emulator, `localhost` elsewhere

### 3.3 Environment variables

**`backend/.env`**

| Variable         | Purpose                                          | Example                                |
| ---------------- | ------------------------------------------------ | -------------------------------------- |
| `NODE_ENV`       | Environment                                      | `development`                          |
| `PORT`           | HTTP port                                        | `4000`                                 |
| `MONGODB_URI`    | MongoDB connection string                        | `mongodb://127.0.0.1:27017/feedants`   |
| `JWT_SECRET`     | Signing secret (min 16 chars)                    | long random string                     |
| `JWT_EXPIRES_IN` | Token lifetime                                   | `7d`                                   |
| `BCRYPT_ROUNDS`  | Password hashing cost                            | `10`                                   |
| `CORS_ORIGIN`    | Comma-separated allow-list, or `*`               | `*`                                    |

Env is validated with Zod at boot — the server refuses to start on misconfiguration.

**`mobile/.env`**

| Variable              | Purpose                | Example                              |
| --------------------- | ---------------------- | ------------------------------------ |
| `EXPO_PUBLIC_API_URL` | Backend base URL       | `http://localhost:4000/api/v1`       |

---

## 4. API reference

Base URL: `/api/v1` — every response uses a `{ success, data }` / `{ success, error }` envelope.
Errors carry a stable machine-readable `code` that the client maps to user-facing copy.

### Auth

| Method | Path             | Auth | Description                          |
| ------ | ---------------- | ---- | ------------------------------------ |
| POST   | `/auth/register` | —    | Create account → `{ user, accessToken }` |
| POST   | `/auth/login`    | —    | Sign in → `{ user, accessToken }`    |
| GET    | `/auth/me`       | ✅   | Current user                         |

### Competitions

| Method | Path                            | Auth     | Description                                        |
| ------ | ------------------------------- | -------- | -------------------------------------------------- |
| GET    | `/competitions`                 | optional | Paginated list; filters `state`, `category`, `search` |
| GET    | `/competitions/:id`             | optional | Detail + derived state + viewer context            |
| POST   | `/competitions/:id/join`        | ✅       | Register for the competition                       |
| GET    | `/competitions/:id/participants`| —        | Paginated participants                             |

`GET /competitions/:id` returns everything the screen needs to render — including the derived
fields, so the UI contains no business logic:

```jsonc
{
  "id": "...", "title": "Feedants Classical Dance", "subtitle": "...",
  "description": "...", "bannerUrl": "...", "organizer": "Feedants",
  "category": "Dance", "tags": ["Dance", "Multi-Win"],
  "certificateText": "Winners get certificate", "disclaimer": "...",
  "refundPolicyText": "...", "entryFee": 99, "prizePool": 1500,

  "registrationOpensAt": "...", "registrationClosesAt": "...",
  "startAt": "...", "endAt": "...",
  "submissionStartsAt": "...", "submissionEndsAt": "...", "resultAt": "...",

  "maxParticipants": 20, "participantCount": 1, "spotsLeft": 19,

  "state": "REGISTRATION_OPEN",        // derived, never stored
  "canJoin": true,
  "joinBlockedReason": null,           // NOT_OPEN | CLOSED | FULL | ALREADY_JOINED | ENDED | AUTH_REQUIRED
  "nextMilestone": { "type": "REGISTRATION_CLOSES", "at": "..." },

  "judge": { "name": "Manju Dubey", "role": "Judge", "avatarUrl": "...", "...": "..." },
  "prizes": [{ "position": 1, "label": "1st", "amount": 550 }],
  "previousWinners": [{ "name": "...", "rank": "1st Winner" }],
  "aboutText": "...", "judgingParameters": ["..."], "rulesAndEligibility": ["..."],

  "viewer": { "isRegistered": false, "registeredAt": null },  // null when anonymous
  "serverTime": "2026-09-22T10:00:00.000Z"                    // drives the countdown
}
```

---

## 5. Data model

**`users`** — `name`, `email` (unique, lowercased), `passwordHash` (`select: false`), `avatarUrl`.
`passwordHash` is never serialized.

**`competitions`** — content, prize table, judge, previous winners, tab content, and the date
boundaries. Two fields carry the business weight:

- `participantCount` — a **denormalized counter**, atomically maintained. This is the single
  source of truth for capacity (fast reads; the counter is only ever mutated by guarded updates).
- `maxParticipants` — capacity ceiling.

Indexes: `registrationClosesAt`, `{ category, startAt }`, text index on `title` + `tags`.

**`participations`** — `userId`, `competitionId`, `status`, `registeredAt`.

- **Unique compound index `{ userId, competitionId }`** (partial on `status: "registered"`) —
  makes double registration impossible at the database level, not just in application code.
- Index `{ competitionId, registeredAt }` for participant listing.

`state` and `spotsLeft` are **derived at read time**, never persisted — they cannot drift.

---

## 6. Business rules & edge cases

| Rule                          | Behaviour                                                        |
| ----------------------------- | ---------------------------------------------------------------- |
| Registration window           | Join only between `registrationOpensAt` and `registrationClosesAt` |
| Capacity                      | Join only while `participantCount < maxParticipants`             |
| Duplicate registration        | `409 ALREADY_REGISTERED`; counter untouched                       |
| Competition full              | `409 COMPETITION_FULL`                                           |
| Before opening / after closing| `409 REGISTRATION_NOT_OPEN` / `409 REGISTRATION_CLOSED`           |
| Competition ended             | `409 COMPETITION_ENDED`                                          |
| Unauthenticated join          | `401 UNAUTHORIZED`; the UI shows "Sign in to Join"               |
| Malformed / unknown id        | `400 VALIDATION_ERROR` / `404 NOT_FOUND`                         |
| Duplicate email               | `409 EMAIL_TAKEN` (safe against concurrent signups)              |
| Login with wrong credentials  | `401 INVALID_CREDENTIALS` — identical for "no such user" and "wrong password" (no account enumeration) |
| Brute force / abuse           | Rate limiting on `/auth/*`, `/join`, and globally                |

State precedence is ordered so a past-dated competition can never report as open even if its
registration window is inconsistent.

---

## 7. Concurrency & consistency

The headline requirement: **the system must never oversell a competition**, even with thousands
of simultaneous joins.

Joining performs two writes (claim a spot; record the participation). Correctness relies on
database-level guarantees rather than application-level checks:

1. **Atomic guarded reserve.** A single document update both checks capacity and increments the
   counter:

   ```js
   Competition.findOneAndUpdate(
     {
       _id,
       registrationOpensAt: { $lte: now },
       registrationClosesAt: { $gte: now },
       $expr: { $lt: ['$participantCount', '$maxParticipants'] }, // capacity check
     },
     { $inc: { participantCount: 1 } },
     { new: true },
   )
   ```

   MongoDB executes this atomically per document, so there is no read-then-write race. If it
   returns `null`, the document is re-read to report the precise reason (`FULL` / `NOT_OPEN` /
   `CLOSED` / `ENDED`).

2. **Unique index dedupe.** The participation insert is protected by
   `{ userId, competitionId }` unique, so a double-tap or replayed request fails with `E11000`
   instead of creating a duplicate.

3. **Two write strategies.**
   - On a **replica set / Atlas** (transactions available, auto-detected at boot), both writes run
     in one **transaction** — all-or-nothing.
   - On **standalone MongoDB**, the reservation is rolled back with a **compensating write**
     (`$inc: { participantCount: -1 }`) if the insert fails, so the counter can never drift upward.

**Proof, not just claims.** `backend/src/tests/join.test.ts` fires **25 concurrent joins at a
10-spot competition** and asserts exactly 10 succeed, 15 are rejected with `COMPETITION_FULL`,
`participantCount === 10`, and exactly 10 participation documents exist. The suite runs that test
**twice — with transactions enabled and disabled** — so both strategies are covered.
`npm run concurrency` does the same against a running server for a live demo.

---

## 8. Testing

```bash
cd backend
npm test          # 44 tests: auth, lifecycle states, join rules, concurrency
npm run typecheck
```

Coverage: registration/login/`me` incl. negative cases; derived state for all six lifecycle
states; viewer state before and after joining; `AUTH_REQUIRED` for anonymous viewers; milestone
selection for the countdown; list filtering/pagination; participants listing; every join failure
mode; and the concurrency guarantee under both write strategies.

> The suite spins up a **single-node MongoDB replica set in memory** (via
> `mongodb-memory-server`), which is what allows transactions to be exercised. The first run
> downloads a MongoDB binary (~600 MB) — subsequent runs are fast.

```bash
cd mobile && npx tsc --noEmit      # type-check the app
```

---

## 9. Assumptions

- **One competition "kind."** Any participant may register; no teams, age gating, or paid
  checkout flow. `entryFee` is displayed but payment is out of scope.
- **Capacity is a single global counter** (`maxParticipants`). Waitlisting is not implemented.
- **Join is the only mutating action** in v1. Leave/withdraw, waitlist auto-promotion and entry
  submission are modelled in the schema but not exposed.
- **All timestamps are stored in UTC** and sent as ISO-8601; formatting is a client concern.
- **One participation per user per competition.**
- **Seed dates are relative to run time** so every lifecycle state is demoable at any moment.
- Static-ish content (judge bio, referral copy, disclaimers) is stored in MongoDB rather than in
  the app, since the brief requires the screen to be database-driven.

## 10. Technical decisions

- **Derived state, not stored state.** `state` / `spotsLeft` / `nextMilestone` / `canJoin` are
  computed from dates + the counter on every read. Storing them would require a cron job and
  would inevitably go stale.
- **Server-authoritative time.** Every response carries `serverTime`; the countdown hook computes
  a device-vs-server offset so a wrong device clock can't produce a wrong countdown.
- **Denormalized `participantCount` with guarded writes.** Counting participation documents on
  every read would not scale; the counter is only ever modified by atomic, capacity-checked
  updates.
- **Stable error codes as API contract.** The client maps codes → copy (including localisation
  readiness), instead of parsing human-readable messages.
- **Transactions *and* a compensating-write fallback.** Local development on standalone MongoDB
  stays correct, while production/Atlas gets true atomicity.
- **Optimistic join with server revalidation.** The spot count drops instantly for responsiveness,
  then the server's view wins — so a failed join instantly restores the correct number.
- **Theme-token layer.** All colours/spacing/typography live in `src/theme`. Re-skinning to a new
  design touches tokens + presentational components only; API, queries and business logic are
  untouched.
- **Component-per-design-section.** Each of the 15 design blocks is its own reusable component;
  the screen is a thin composition, and `Card`/`Button`/`Badge`/`Avatar`/`Skeleton` are shared.
- **Every screen state designed for:** loading (skeletons), empty, error + retry, offline
  (`NETWORK_ERROR` with the attempted URL), optimistic, and success feedback.

## 11. Trade-offs

| Decision                                  | Cost                                                        |
| ----------------------------------------- | ----------------------------------------------------------- |
| Denormalized counter                      | Writes must always go through guarded updates; a manual DB edit can desync it |
| Derived state at read time                | Slightly more CPU per request, in exchange for never being wrong |
| Compensating writes on standalone MongoDB | Two round trips and a small rollback window vs. free transactions |
| No waitlist in v1                         | A full competition is a dead end for new users              |
| External Unsplash/Picsum imagery          | Keeps the repo light; a real product would own its assets   |
| Polling/refetch instead of realtime       | Spot counts can be ~15s stale without a pull-to-refresh    |

## 12. What I'd do next for production

1. **Realtime spot updates** via WebSocket/SSE so the "spots left" meter is live for everyone.
2. **Waitlist + auto-promotion** on withdrawal, using the same atomic primitives.
3. **Payments** (Razorpay order → webhook → participation confirmation) with idempotency keys.
4. **Redis** for rate limiting, session denylists and hot-competition caching.
5. **Cursor-based pagination** and a dedicated read model if the list grows large.
6. **Observability** — structured logs with request ids, metrics on join success/failure reasons,
   tracing, and alerting on capacity rejections.
7. **CI/CD** — GitHub Actions running tests + typecheck on both packages, migrations, staging.
8. **Mobile polish** — offline cache persistence, push reminders for registration deadlines,
   E2E tests (Maestro/Detox), accessibility audit and i18n wired to the `ENG / हिंदी` toggle.
9. **Admin surface** for creating competitions and exporting participant lists.

---

## 13. Demo script (for the screen recording)

```bash
# terminal 1
cd backend && npm run mongo:dev
# terminal 2
cd backend && npm run seed && npm run dev
# terminal 3
cd mobile && npx expo start
```

1. Open **Feedants Classical Dance** → spot meter reads `1/20 Booked`, "Only 19 spots left",
   countdown to registration close.
2. Press **Join Competition** while signed out → routed to sign in (demo account is one tap).
3. Sign in → **Join Competition** → count drops to `2/20`, CTA becomes "Upload Submission /
   Registered", badge flips to *Registered*.
4. Press Join again (or replay the request) → `ALREADY_REGISTERED`, counter unchanged.
5. Open **Feedants Photography Contest** → CTA disabled as *Competition Full*.
6. Open **Short Film Fest / Poetry Slam / Standup Comedy / Sketch Battle** → *Registration opens…*,
   *Registration Closed*, *Live Now*, *Ended* respectively.
7. Run `npm run concurrency -- <competitionId> 40` to show 40 simultaneous joins never overselling.
