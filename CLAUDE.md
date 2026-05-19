# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo

Two independent npm projects; run commands from inside the relevant directory.

- `mobile/` — Expo React Native app (SDK 54, React 19, NativeWind, Redux Toolkit)
- `server/` — Next.js 16 App Router backend (API over Supabase; owns auth)

## Commands

```bash
# Mobile (cd mobile)
npm install
npx expo start                                # i / a / w, or scan QR
npx jest                                      # all tests
npx jest src/__tests__/alertLogic.test.ts     # single file
npx jest -t "elevated heart rate"             # by name
npx tsc --noEmit                              # typecheck (no ESLint/Prettier)

# Backend (cd server)
npm install
npm run dev                                   # http://localhost:3000
npm test                                      # ts-jest unit tests
npx next build                                # typechecks all routes
```

No build script for mobile (Expo bundles). Type safety via `tsc` `strict`.
Path alias `@/*` → `src/*` (mobile) / project root (server).

**Dev auth:** real signup/login now. Create an account via the Signup
screen. The mobile app needs `mobile/.env` → `EXPO_PUBLIC_API_URL` set to
the backend (LAN IP on devices, not `localhost`). The backend needs
`server/.env.local` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`JWT_SECRET`).

## Architecture

**Data flow (thunks are the only place these compose):**
`screen → dispatch(thunk) → services/api.ts (fetch) → Next.js /api/* →
Supabase (service-role)`. JWT is stored via `services/storage.ts` in
expo-secure-store; entry history lives in Postgres (not SecureStore).

**State — Redux Toolkit, two slices** (`mobile/src/store/`):
- `authSlice.ts` — `loginThunk`, `signupThunk`, `logoutThunk`,
  `restoreSessionThunk` (calls `/api/auth/me`). Auth gate = `state.auth.token`.
- `healthSlice.ts` — `fetchEntriesThunk()` (no args; reads token from
  state), `addEntryThunk`. Server returns entries newest-first.
- Always use typed hooks `useAppDispatch` / `useAppSelector` (`src/hooks/`).

**Alerts have TWO implementations, intentionally:**
- `server/lib/alertLogic.ts` + `server/lib/thresholds.ts` — **source of
  truth**; computes `has_alert` on `POST /api/entries`. Never trust a
  client-sent alert flag.
- `mobile/src/utils/alertLogic.ts` — display only (warning dialog on
  submit, banners). Keep the two threshold sets in sync when changing rules.

**Backend (`server/`):** route handlers in `app/api/`; pure logic in
`lib/` (`password` bcrypt, `jwt`, `auth` Bearer guard, `validation` zod,
`mappers` snake_case↔camelCase, `supabase` service-role client). API
responses are camelCase to match the mobile `HealthEntry` type. RLS is
enabled with **no policies** — only the service-role backend can reach the
DB; this is intended, not a missing-policy bug.

**Navigation (`mobile/src/navigation/RootNavigator.tsx`):** root stack
swaps `Auth` (Login/Signup) ↔ `Main` on `token`. `Main` = bottom tabs
(Dashboard / AddEntry / History); History wraps a native-stack
(`HistoryList` → `EntryDetail`). Param lists in `src/types/index.ts`.

**Styling:** NativeWind via `className`. Wrap screens in
`components/ScreenContainer` (safe-area insets + max content width;
pass `hasHeader` when the screen has a nav header). Color tokens
(primary teal `#0077A8`, danger/warning/success) in `tailwind.config.js` —
don't hardcode hex.

## Gotchas

- Two `package.json`s — `npm install` in both `mobile/` and `server/`.
- Zod schema in `mobile/src/utils/validation.ts` is the source of truth for
  form validation + types (`react-hook-form` + `@hookform/resolvers/zod`).
- `expo-notifications` / `react-native-chart-kit` installed but unused.
- `.env.local` / `.env` are gitignored; `.env*.example` files are tracked
  via explicit negation in `.gitignore` and `server/.gitignore`.
- The git history has a large rename commit (root → `mobile/`); use
  `git log --follow` for pre-monorepo file history.
