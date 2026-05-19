# HealthTracker — Supabase + Next.js Backend Overhaul

**Date:** 2026-05-19
**Status:** Approved (design)
**Branch:** `feature/supabase-nextjs-overhaul`

## Goal

Replace the in-memory mock API with a real backend, fix all known bugs, and
improve UI/responsiveness/quality. Restructure the repo into a monorepo:
the Expo app in `mobile/`, a new Next.js backend in `server/`, backed by a
new Supabase Postgres project.

## Decisions (locked)

- **Auth ownership:** Next.js owns all authentication. It exposes
  `/api/auth/*`, hashes passwords, issues its own JWT, and talks to Supabase
  via the **service-role key**. The mobile app never talks to Supabase
  directly.
- **Repo layout:** Monorepo. All current root files move into `mobile/`.
  New Next.js app in `server/`. `.git` stays at root. No root workspace
  tooling — each sub-project is run from its own directory.
- **Signup:** Login **and** Signup are supported (new signup screen +
  `/api/auth/signup`).
- **State management:** Redux Toolkit is kept (works well, valued in README).
- **Next.js:** latest stable 15.x, App Router, TypeScript.
- **Dev networking:** API base URL is a manual `EXPO_PUBLIC_API_URL` env
  step, documented in the README (physical devices need the machine LAN IP).

## Out of scope (documented limitations, not bugs)

Push notification wiring, trend charts (`react-native-chart-kit`), offline
mode.

---

## 1. Repository Restructure

```
HealthTracker/
├── mobile/                 # current Expo app (git mv from root)
│   ├── App.tsx, index.ts, src/, app.json, package.json, jest.config.js,
│   │   babel.config.js, metro.config.js, tailwind.config.js, global.css,
│   │   tsconfig.json, jest.setup.ts, nativewind-env.d.ts, assets/
│   └── .env.example        # EXPO_PUBLIC_API_URL=http://<LAN-IP>:3000
├── server/                 # new Next.js backend (App Router)
│   ├── app/api/auth/signup/route.ts
│   ├── app/api/auth/login/route.ts
│   ├── app/api/auth/me/route.ts
│   ├── app/api/entries/route.ts
│   ├── lib/{supabase,jwt,password,auth,alertLogic,thresholds,validation}.ts
│   ├── .env.local.example  # SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET
│   ├── package.json
│   └── tsconfig.json
├── docs/superpowers/specs/
└── README.md               # monorepo run instructions
```

`.git` remains at repo root. Root `.gitignore` updated to cover
`mobile/node_modules`, `server/node_modules`, `server/.next`, `.env*` files.
Moves performed with `git mv` so history follows renames.

---

## 2. Supabase Schema

A **new** Supabase project in `ajasad25's Org`. Cost confirmed with the user
before creation via the Supabase MCP `get_cost` → `confirm_cost` flow.

Auth is custom (not Supabase Auth). Tables:

**`users`**
| column | type | notes |
|---|---|---|
| id | uuid | pk, `default gen_random_uuid()` |
| email | text | `unique not null` |
| password_hash | text | not null (bcrypt) |
| name | text | not null |
| created_at | timestamptz | `default now()` |

**`health_entries`**
| column | type | notes |
|---|---|---|
| id | uuid | pk, `default gen_random_uuid()` |
| user_id | uuid | `references users(id) on delete cascade` |
| timestamp | timestamptz | when the reading was taken |
| heart_rate | int | |
| systolic | int | |
| diastolic | int | |
| spo2 | int | |
| temperature | numeric(3,1) | |
| symptoms | text[] | |
| notes | text | nullable |
| has_alert | boolean | computed server-side |
| created_at | timestamptz | `default now()` |

- Index: `health_entries (user_id, timestamp desc)`.
- **RLS enabled on both tables with no public policies.** The service-role
  key bypasses RLS, so only the Next.js backend can read/write. This is the
  intended lockdown.
- Applied via `apply_migration` (named migration).

---

## 3. Next.js Backend (`server/`)

Stack: Next.js 15 App Router, TypeScript, `@supabase/supabase-js`,
`bcryptjs`, `jsonwebtoken`, `zod`.

**Environment (`server/.env.local`):**
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`.

**`lib/` modules**
- `supabase.ts` — service-role client (server-only, never shipped to client).
- `password.ts` — `hash()`, `verify()` (bcryptjs).
- `jwt.ts` — `sign({userId,email})` (7-day expiry), `verify()`.
- `auth.ts` — `requireAuth(req)` → parses `Authorization: Bearer`, returns
  user or throws 401.
- `thresholds.ts` + `alertLogic.ts` — port of mobile constants;
  `checkForAlerts()` is the **server source of truth** for `has_alert`.
- `validation.ts` — Zod schemas for each endpoint body.

**Endpoints**
| Method | Path | Body | Auth | Returns |
|---|---|---|---|---|
| POST | `/api/auth/signup` | `{email,password,name}` | — | `{token,user}` (201) |
| POST | `/api/auth/login` | `{email,password}` | — | `{token,user}` |
| GET | `/api/auth/me` | — | Bearer | `{user}` |
| GET | `/api/entries` | — | Bearer | `HealthEntry[]` newest-first |
| POST | `/api/entries` | vitals+symptoms+notes | Bearer | created `HealthEntry` (201) |

- All bodies validated with Zod. Errors → `{ error: string }` with
  400 (validation) / 401 (auth) / 409 (duplicate email) / 500.
- `password_hash` is never returned in any response.
- Server recomputes `has_alert` on POST; client-sent alert flags are ignored.
- Response shape uses camelCase (`heartRate`, `hasAlert`) to match the
  existing mobile `HealthEntry` type; mapping done in the route layer.

---

## 4. Mobile App Integration (`mobile/`)

- **`src/services/api.ts`** replaces `mockApi.ts`. Typed `fetch` wrapper:
  base URL from `process.env.EXPO_PUBLIC_API_URL`; attaches Bearer token;
  throws typed errors with server message. `mockApi.ts` deleted.
- **`src/services/storage.ts`**: keep only `saveToken`/`getToken`/
  `clearToken` (JWT is small, SecureStore is correct for it). Delete
  `saveEntries`/`getEntries` — removes the SecureStore ~2 KB bug; entries
  now live in Supabase.
- **`store/authSlice.ts`**: `loginThunk`, **new `signupThunk`**,
  `restoreSessionThunk` now calls `GET /api/auth/me` (fixes hardcoded-user
  bug), `logoutThunk` clears token.
- **`store/healthSlice.ts`**: `fetchEntriesThunk` → `GET /api/entries`;
  `addEntryThunk` → `POST /api/entries` (no client storage write, no
  client `has_alert` write). `checkForAlerts` retained for **display only**
  (Dashboard/Detail banners).
- **Navigation**: `AuthStackParamList` gains `Signup`; `AuthNavigator`
  registers it; `LoginScreen` links to it.
- **New `SignupScreen`** — name/email/password, Zod-validated, styled to
  match `LoginScreen`.

---

## 5. UI / Responsiveness / Quality Fixes

- **`ScreenContainer` component**: applies `useSafeAreaInsets()` top padding
  (replaces every hardcoded `pt-14`) and `max-w-[600px] w-full self-center`
  for web/tablet. Adopted by all 5 screens + Signup.
- **Error visibility**: reusable `ErrorBanner`; show `health.error` on
  Dashboard/History/Add and auth errors on Login/Signup.
- **Accessibility**: `accessibilityRole`/`accessibilityLabel` on `Button`,
  `SymptomChip`, `EntryListItem`, the password-visibility toggle.
- **Dead code**: delete the unused `LoadingOverlay` component (the submit
  button already shows a loading state, so it is redundant); remove the
  unused `expo-status-bar` dependency (`App.tsx` uses RN `StatusBar`).
- Use the `frontend-design` skill when building `ScreenContainer`,
  `SignupScreen`, and `ErrorBanner` so visual quality stays high.

---

## 6. Test / Config Fixes

- `mobile/jest.config.js`: `preset: 'jest-expo'` (add `jest-expo` devDep),
  fix `setupFilesAfterSetup` → `setupFilesAfterEnv`. Existing tests
  (`alertLogic`, `validation`, `MetricCard`) must pass.
- `server/`: tests for `lib/alertLogic.ts` (pure) and `lib/jwt`/`password`
  round-trips.
- README rewritten for the monorepo: how to run `server` (env, Supabase)
  and `mobile` (env, LAN IP), how to run both test suites.

---

## Data Flow (after)

```
SignupScreen/LoginScreen
  → authSlice thunk → api.ts (fetch) → Next.js /api/auth/* → Supabase users
  → JWT stored in SecureStore

AddHealthEntryScreen
  → addEntryThunk → api.ts → POST /api/entries
    → server validates (Zod) + computes has_alert → Supabase health_entries
  → returned entry prepended to Redux store

DashboardScreen/HistoryScreen
  → fetchEntriesThunk → GET /api/entries → Supabase → Redux (sorted)
```

## Error Handling

- Backend: Zod validation → 400; bad credentials / missing-or-invalid JWT
  → 401; duplicate signup email → 409; unexpected → 500. Always
  `{ error }`.
- Mobile: `api.ts` throws on non-2xx with the server `error` string;
  thunks put it in slice `error`; UI renders `ErrorBanner`.

## Testing Strategy

- Backend pure-logic unit tests (alert logic, jwt, password).
- Mobile existing Jest suite restored to green via `jest-expo`.
- Manual end-to-end: signup → login → add entry (alert + non-alert) →
  history → detail → logout → restore session.

## Risks / Notes

- Big rename commit when moving files into `mobile/` (git tracks renames).
- Physical-device dev requires LAN IP in `EXPO_PUBLIC_API_URL` (documented).
- Service-role key must never reach the client — server-only, gitignored.
- Supabase project creation has a cost; confirmed with user before creating.
