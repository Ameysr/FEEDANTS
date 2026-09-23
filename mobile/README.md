# Feedants — Mobile App

Expo React Native client for the Feedants Competition Details module.

The full project documentation — architecture, API reference, data model, business rules,
concurrency design and how to run everything — lives in the [root README](../README.md).

## Quick start

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
npx expo start           # press w / a / i, or scan the QR with Expo Go
```

The backend must be running (see the root README). If `EXPO_PUBLIC_API_URL` is unset, the app
derives the API host from the Expo dev server, which usually works on a physical device with no
configuration.

## Structure

```
src/
├─ app/                      # expo-router routes
│  ├─ index.tsx              # competition list
│  ├─ login.tsx
│  ├─ register.tsx
│  └─ competition/[id].tsx   # Competition Details screen
├─ api/                      # typed API client + contract types
├─ auth/                     # AuthContext (JWT + SecureStore persistence)
├─ components/
│  ├─ ui/                    # Card, Button, Badge, Avatar, Skeleton, TextField, ...
│  └─ competition/           # one component per design section
├─ hooks/useCountdown.ts     # server-time-corrected countdown
├─ queries/                  # TanStack Query hooks (+ optimistic join)
├─ theme/                    # design tokens — the single re-skin point
└─ utils/                    # formatting, storage, error copy
```

## Notes

- **Design tokens** live in `src/theme`. Re-skinning touches tokens and presentational components
  only; API, queries and business logic stay untouched.
- **The screen holds no business rules.** `state`, `canJoin`, `joinBlockedReason`, `spotsLeft` and
  `nextMilestone` all come from the API, so the UI is a pure function of server data.
- **Countdowns** are computed against server time to survive device clock skew.
- **Joining** is optimistic and always revalidated against the server.

## Type checking

```bash
npx tsc --noEmit
```
