# Health Tracker

A React Native health monitoring app (Expo, TypeScript, Redux Toolkit,
NativeWind) backed by a Next.js API over Supabase Postgres. Track vitals,
log symptoms, and receive real-time health alerts.

## Monorepo layout

- `mobile/` — Expo React Native app
- `server/` — Next.js backend (REST API over Supabase; owns auth)
- `docs/superpowers/` — design spec & implementation plan

## Backend (`server/`)

```bash
cd server
cp .env.local.example .env.local
# Fill in:
#   SUPABASE_URL                 (Supabase project URL)
#   SUPABASE_SERVICE_ROLE_KEY    (Supabase dashboard → Project Settings → API)
#   JWT_SECRET                   (any long random string, e.g. `openssl rand -hex 32`)
npm install
npm run dev          # http://localhost:3000
npm test             # alert logic / jwt / password unit tests
```

### API

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/api/auth/signup` | — | `{ name, email, password }` |
| POST | `/api/auth/login` | — | `{ email, password }` |
| GET | `/api/auth/me` | Bearer | — |
| GET | `/api/entries` | Bearer | — |
| POST | `/api/entries` | Bearer | vitals + symptoms + notes |

Passwords are bcrypt-hashed; the server issues a 7-day JWT and is the
source of truth for the `hasAlert` flag. Supabase is reached only with the
service-role key (server-side); RLS is enabled with no public policies, so
the database is unreachable except through this backend.

## Mobile (`mobile/`)

```bash
cd mobile
cp .env.example .env
# Set EXPO_PUBLIC_API_URL to the backend URL.
# Physical device / emulator: use your machine's LAN IP, NOT localhost,
#   e.g. EXPO_PUBLIC_API_URL=http://192.168.1.50:3000
npm install
npx expo start       # press i / a / w, or scan the QR code
npx jest             # 35 unit tests (alert logic, validation, MetricCard)
npx tsc --noEmit     # typecheck
```

Run the backend first, then the mobile app pointed at it.

## Architecture

```
mobile/src/
  navigation/  # RootNavigator: auth-gated; Auth(Login/Signup) ↔ Main tabs
  screens/     # Login, Signup, Dashboard, AddHealthEntry, History, Detail
  components/  # MetricCard, VitalInput, SymptomChip, AlertBanner, Button,
               # ScreenContainer (safe-area + responsive width), ErrorBanner,
               # EmptyState, EntryListItem
  store/       # Redux store + authSlice + healthSlice (API-backed thunks)
  services/    # api.ts (typed fetch client), storage.ts (JWT in SecureStore)
  utils/       # alertLogic (display), validation (zod), formatters
  types/       # shared interfaces & navigation param types
  constants/   # thresholds, symptom list, color palette

server/
  app/api/     # auth/{signup,login,me}, entries route handlers
  lib/         # supabase, password (bcrypt), jwt, auth guard, validation,
               # alertLogic (source of truth), thresholds, mappers
```

### Design decisions

- **Next.js owns auth.** Custom `users` table + bcrypt + app-issued JWT.
  The mobile app never talks to Supabase directly; the service-role key
  stays server-side.
- **Server computes alerts.** `checkForAlerts` runs on the backend so the
  `hasAlert` flag can't be spoofed by the client (still used client-side
  purely for display banners).
- **Responsive by default.** `ScreenContainer` applies safe-area insets and
  a max content width so the UI works on notched phones, tablets, and web.
- **Redux Toolkit retained** for predictable, debuggable health-data state
  with built-in async-thunk loading/error handling.
- **JWT-only SecureStore.** Only the small token is persisted in the device
  secure enclave; entry history lives in Postgres (avoids SecureStore's
  ~2 KB per-value limit).

## Known limitations

- No push notifications (`expo-notifications` not wired to alerts).
- No trend charts (`react-native-chart-kit` unused).
- No offline mode — the backend must be reachable.
- Single Supabase project; no per-environment config beyond `.env`.
