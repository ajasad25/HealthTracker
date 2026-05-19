# Design: Replace Supabase with local Postgres + Prisma

Date: 2026-05-19
Status: Approved

## Goal

Drop the Supabase dependency from `server/` and run against a local
PostgreSQL database accessed through Prisma ORM, browsable with Prisma
Studio. The mobile app and all HTTP contracts stay unchanged.

## Context

- `server/` (Next.js 16 App Router) is the only project touching the DB.
- Supabase is referenced in exactly 5 files: `lib/supabase.ts` and the
  four route handlers `app/api/auth/{signup,login,me}/route.ts` and
  `app/api/entries/route.ts`.
- Two tables: `users` and `health_entries`. Columns are snake_case;
  `lib/mappers.ts` converts rows to camelCase DTOs (`EntryRow` →
  `toEntryDto`, `toUserDto`) so the mobile `HealthEntry` type matches.
- Unit tests (`npm test`, ts-jest) cover `alertLogic`, `mappers`,
  `validation` only — no DB access.
- Local environment: Homebrew `postgresql@14` is installed (data dir
  `/opt/homebrew/var/postgresql@14`) but the service is not running.
  Homebrew Postgres uses macOS user `asad` as superuser with trust auth
  on localhost (no password).

## Decisions (from brainstorming)

- **Postgres host:** existing local install (`postgresql@14`), started
  via `brew services`.
- **Schema mapping:** keep snake_case columns + `lib/mappers.ts`. Prisma
  model fields are named to match the existing `EntryRow` shape using
  `@map`/`@@map`, so mappers and their tests are untouched.
- **Seed:** create test account `test@healthtracker.dev` / `test1234`.

## Design

### 1. Database

- `brew services start postgresql@14`.
- Create database `healthtracker` owned by role `asad`.
- Connection string (socket/trust, no password):
  `postgresql://asad@localhost:5432/healthtracker?schema=public`

### 2. Prisma setup (`server/`)

- Add `prisma` (devDependency) and `@prisma/client` (dependency).
- New `prisma/schema.prisma`:
  - `datasource db` → `provider = "postgresql"`, `url = env("DATABASE_URL")`.
  - `generator client` → `prisma-client-js`.
  - Model `User` → `@@map("users")`: `id String @id
    @default(dbgenerated("gen_random_uuid()")) @db.Uuid`, `email String
    @unique`, `password_hash String`, `name String`, `created_at
    DateTime @default(now()) @db.Timestamptz`, relation to entries.
  - Model `HealthEntry` → `@@map("health_entries")`: fields named to
    match `EntryRow` (`id`, `user_id`, `timestamp`, `heart_rate`,
    `systolic`, `diastolic`, `spo2`, `temperature`, `symptoms`, `notes`,
    `has_alert`), each `@map` to its existing column. Types: integers for
    vitals, `temperature Decimal @db.Decimal`, `symptoms String[]
    @default([])`, `has_alert Boolean @default(false)`, `notes String?`,
    `timestamp DateTime @db.Timestamptz`, `created_at DateTime
    @default(now())`. FK `user_id` → `users.id`.

  Naming the Prisma fields snake_case to match `EntryRow` means query
  results feed `toEntryDto`/`toUserDto` unchanged. `toEntryDto` already
  wraps temperature in `Number(...)`, which handles Prisma `Decimal`.

### 3. Schema creation

- `npx prisma migrate dev --name init` creates
  `prisma/migrations/` and the two tables. This replaces the Supabase
  schema setup. RLS is intentionally dropped — local single-tenant dev
  DB, no longer relevant.

### 4. Code changes (5 files)

- Delete `lib/supabase.ts`; add `lib/prisma.ts` exporting a singleton
  `PrismaClient` with the Next.js `globalThis` hot-reload guard.
- Rewrite the four routes to use Prisma, preserving response shapes and
  status codes exactly:
  - `auth/signup`: `prisma.user.findUnique({where:{email}})` → 409 if
    present; else `prisma.user.create(...)` → 201 `{token, user}`.
  - `auth/login`: `prisma.user.findUnique({where:{email}})` →
    verifyPassword → 200 `{token, user}` or 401.
  - `auth/me`: lookup by id from auth guard.
  - `entries` GET: `prisma.healthEntry.findMany({where:{user_id:userId},
    orderBy:{timestamp:'desc'}})` → `.map(toEntryDto)`.
  - `entries` POST: validate, `checkForAlerts`, `prisma.healthEntry
    .create(...)` → 201 `toEntryDto`.
  - Keep `requireAuth`/`AuthError` flow and existing error JSON.
- Remove `@supabase/supabase-js` from `package.json` dependencies.

### 5. Seed

- `prisma/seed.ts`: upsert user `test@healthtracker.dev` with bcryptjs
  hash (cost 10) of `test1234`, name `Test User`.
- Add `"prisma": { "seed": "ts-node prisma/seed.ts" }` (or the project's
  existing ts runner) to `server/package.json`; run `npx prisma db seed`.

### 6. Env

- Rewrite `server/.env.local`: remove `SUPABASE_URL` and
  `SUPABASE_SERVICE_ROLE_KEY`; add
  `DATABASE_URL=postgresql://asad@localhost:5432/healthtracker?schema=public`;
  keep `JWT_SECRET`.
- Mirror the change in `server/.env.local.example` (placeholder value).
- `mobile/.env` unchanged (`EXPO_PUBLIC_API_URL=http://localhost:3000`).

### 7. Docs

- Update `CLAUDE.md`: data-flow line, the alerts "service-role" note,
  and the RLS / Supabase gotchas, to describe Prisma + local Postgres.

### 8. Prisma Studio

- `npx prisma studio` → `http://localhost:5555`, browsing `User` and
  `HealthEntry` with the seeded row visible.

## Verification

- `pg_isready` → accepting connections.
- `npx prisma migrate status` → up to date.
- `npx prisma db seed` → succeeds.
- `curl POST /api/auth/signup` (new email) → 201; `curl POST
  /api/auth/login` with seeded creds → 200 with token.
- `npm test` (server) → green (unit tests, no DB).
- `npx next build` → typechecks all routes successfully.
- Prisma Studio loads and shows the seeded user.

## Out of scope

- Docker / containerized Postgres.
- The live Supabase project — left untouched, not deleted.
- Any mobile-side code changes.
- Production / deployment configuration.
