# Supabase → Prisma/Local-Postgres Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Supabase in `server/` with a local PostgreSQL database accessed via Prisma ORM, browsable in Prisma Studio, with HTTP contracts unchanged.

**Architecture:** Homebrew `postgresql@14` hosts a `healthtracker` DB. Prisma owns the schema (two models mapped to existing snake_case tables) and replaces the Supabase JS client. The four API routes call Prisma; `lib/mappers.ts` and all response shapes/status codes are unchanged. A seed script creates a test login.

**Tech Stack:** Next.js 16, Prisma + @prisma/client, PostgreSQL 14, bcryptjs, tsx (seed runner), TypeScript.

All commands run from `/Users/asad/Desktop/repos/HealthTracker/server` unless stated. Spec: `docs/superpowers/specs/2026-05-19-supabase-to-prisma-postgres-design.md`.

---

### Task 1: Start Postgres and create the database

**Files:** none (environment only)

- [ ] **Step 1: Start the Postgres service**

Run: `brew services start postgresql@14`

- [ ] **Step 2: Verify the server is accepting connections**

Run: `pg_isready -h localhost -p 5432`
Expected: `localhost:5432 - accepting connections`

- [ ] **Step 3: Create the database (idempotent)**

Run: `createdb -h localhost healthtracker 2>/dev/null; psql -h localhost -d healthtracker -c "SELECT current_database();"`
Expected: a table showing `healthtracker`. (If `createdb` says "already exists", that is fine — the `psql` line still confirms it.)

No commit (no tracked files changed).

---

### Task 2: Add Prisma dependencies and datasource

**Files:**
- Modify: `server/package.json`
- Create: `server/prisma/schema.prisma`
- Create/Modify: `server/.gitignore` (ensure generated client / `.env` ignored — verify, do not duplicate existing rules)

- [ ] **Step 1: Install dependencies**

Run: `npm install @prisma/client && npm install -D prisma tsx`
Expected: installs succeed; `package.json` gains `@prisma/client` (dependencies) and `prisma`, `tsx` (devDependencies).

- [ ] **Step 2: Create the Prisma schema**

Create `server/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email         String        @unique
  password_hash String
  name          String
  created_at    DateTime      @default(now()) @db.Timestamptz(6)
  entries       HealthEntry[]

  @@map("users")
}

model HealthEntry {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id     String   @db.Uuid
  timestamp   DateTime @db.Timestamptz(6)
  heart_rate  Int
  systolic    Int
  diastolic   Int
  spo2        Int
  temperature Decimal  @db.Decimal
  symptoms    String[] @default([])
  notes       String?
  has_alert   Boolean  @default(false)
  created_at  DateTime @default(now()) @db.Timestamptz(6)
  user        User     @relation(fields: [user_id], references: [id])

  @@map("health_entries")
}
```

- [ ] **Step 3: Verify the schema is valid**

Run: `npx prisma validate`
Expected: `The schema at prisma/schema.prisma is valid 🚀`

- [ ] **Step 4: Commit**

```bash
git add server/package.json server/package-lock.json server/prisma/schema.prisma
git commit -m "build(server): add Prisma + schema for users/health_entries"
```

---

### Task 3: Configure env and run the initial migration

**Files:**
- Modify: `server/.env.local`
- Modify: `server/.env.local.example`

- [ ] **Step 1: Read the current env to preserve `JWT_SECRET`**

Run: `grep -E '^(JWT_SECRET|DATABASE_URL)=' server/.env.local || true`
Note the existing `JWT_SECRET` value (keep it verbatim).

- [ ] **Step 2: Rewrite `server/.env.local`**

Replace the Supabase lines. The file must contain exactly (keep the real existing `JWT_SECRET` value in place of `<existing>`):

```
DATABASE_URL=postgresql://asad@localhost:5432/healthtracker?schema=public
JWT_SECRET=<existing>
```

- [ ] **Step 3: Rewrite `server/.env.local.example`**

```
DATABASE_URL=postgresql://USER@localhost:5432/healthtracker?schema=public
JWT_SECRET=replace-with-a-long-random-string
```

- [ ] **Step 4: Create the initial migration and tables**

Run: `npx prisma migrate dev --name init`
Expected: creates `server/prisma/migrations/<timestamp>_init/migration.sql`, applies it, prints "Your database is now in sync", and generates the Prisma Client. (`gen_random_uuid()` is built into Postgres 14 core — no extension needed.)

- [ ] **Step 5: Verify migration status**

Run: `npx prisma migrate status`
Expected: "Database schema is up to date!"

- [ ] **Step 6: Commit**

```bash
git add server/prisma/migrations server/.env.local.example
git commit -m "build(server): init Prisma migration; env uses DATABASE_URL"
```

(`server/.env.local` is gitignored — not committed.)

---

### Task 4: Add the Prisma client singleton

**Files:**
- Create: `server/lib/prisma.ts`

- [ ] **Step 1: Create `server/lib/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p server/tsconfig.json` (or from `server/`: `npx tsc --noEmit`)
Expected: no errors referencing `lib/prisma.ts`.

- [ ] **Step 3: Commit**

```bash
git add server/lib/prisma.ts
git commit -m "feat(server): add Prisma client singleton"
```

---

### Task 5: Migrate the auth/signup route

**Files:**
- Modify: `server/app/api/auth/signup/route.ts`

- [ ] **Step 1: Replace the route body**

Full new contents of `server/app/api/auth/signup/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signupSchema } from '@/lib/validation';
import { hashPassword } from '@/lib/password';
import { signToken } from '@/lib/jwt';
import { toUserDto } from '@/lib/mappers';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  const password_hash = await hashPassword(password);
  const data = await prisma.user
    .create({
      data: { name, email, password_hash },
      select: { id: true, email: true, name: true },
    })
    .catch(() => null);
  if (!data) {
    return NextResponse.json({ error: 'Could not create user' }, { status: 500 });
  }

  const token = signToken({ userId: data.id, email: data.email });
  return NextResponse.json({ token, user: toUserDto(data) }, { status: 201 });
}
```

- [ ] **Step 2: Typecheck**

Run (from `server/`): `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add server/app/api/auth/signup/route.ts
git commit -m "feat(server): signup route uses Prisma"
```

---

### Task 6: Migrate the auth/login route

**Files:**
- Modify: `server/app/api/auth/login/route.ts`

- [ ] **Step 1: Read the current route to preserve exact response shape**

Run: `cat server/app/api/auth/login/route.ts`
Note the response field names and status codes used.

- [ ] **Step 2: Replace the data-access lines with Prisma**

In `server/app/api/auth/login/route.ts`, replace the import `import { supabaseAdmin } from '@/lib/supabase';` with `import { prisma } from '@/lib/prisma';`, and replace the Supabase user lookup:

```typescript
const { data: user } = await supabaseAdmin()
  .from('users')
  .select('*')
  .eq('email', email)
  .maybeSingle();
```

with:

```typescript
const user = await prisma.user.findUnique({ where: { email } });
```

Leave the `verifyPassword`, token signing, `toUserDto`, all status codes (401 on invalid, 200 on success) and response JSON exactly as they already are. (Prisma returns `password_hash` field name, which matches the existing `verifyPassword(password, user.password_hash)` call.)

- [ ] **Step 3: Typecheck**

Run (from `server/`): `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add server/app/api/auth/login/route.ts
git commit -m "feat(server): login route uses Prisma"
```

---

### Task 7: Migrate the auth/me route

**Files:**
- Modify: `server/app/api/auth/me/route.ts`

- [ ] **Step 1: Read the current route**

Run: `cat server/app/api/auth/me/route.ts`
Note how the user id is obtained (auth guard) and the exact response shape.

- [ ] **Step 2: Replace the data-access with Prisma**

Replace `import { supabaseAdmin } from '@/lib/supabase';` with `import { prisma } from '@/lib/prisma';`. Replace the Supabase user fetch (a `.from('users').select(...).eq('id', userId).maybeSingle()` form) with:

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { id: true, email: true, name: true },
});
```

Preserve the existing auth-guard / `AuthError` → 401 handling, the not-found handling, and the existing success response (`toUserDto(user)` / same JSON shape and status).

- [ ] **Step 3: Typecheck**

Run (from `server/`): `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add server/app/api/auth/me/route.ts
git commit -m "feat(server): me route uses Prisma"
```

---

### Task 8: Migrate the entries route

**Files:**
- Modify: `server/app/api/entries/route.ts`

- [ ] **Step 1: Replace the route body**

Full new contents of `server/app/api/entries/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth';
import { entrySchema } from '@/lib/validation';
import { checkForAlerts } from '@/lib/alertLogic';
import { toEntryDto } from '@/lib/mappers';

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const data = await prisma.healthEntry.findMany({
      where: { user_id: userId },
      orderBy: { timestamp: 'desc' },
    });
    return NextResponse.json(data.map(toEntryDto));
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const body = await req.json().catch(() => null);
    const parsed = entrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const v = parsed.data;
    const { hasAlert } = checkForAlerts(v);
    const data = await prisma.healthEntry
      .create({
        data: {
          user_id: userId,
          timestamp: v.timestamp ? new Date(v.timestamp) : new Date(),
          heart_rate: v.heartRate,
          systolic: v.systolic,
          diastolic: v.diastolic,
          spo2: v.spo2,
          temperature: v.temperature,
          symptoms: v.symptoms,
          notes: v.notes ?? null,
          has_alert: hasAlert,
        },
      })
      .catch(() => null);
    if (!data) {
      return NextResponse.json({ error: 'Could not save entry' }, { status: 500 });
    }
    return NextResponse.json(toEntryDto(data), { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

Note: `toEntryDto` expects `EntryRow` (snake_case + `temperature` numeric). Prisma returns matching field names; `temperature` is a `Prisma.Decimal` and `toEntryDto` already wraps it in `Number(...)`, so the DTO output is unchanged.

- [ ] **Step 2: Typecheck**

Run (from `server/`): `npx tsc --noEmit`
Expected: no errors. If `toEntryDto`'s `EntryRow` type rejects `Prisma.Decimal` for `temperature`, widen `EntryRow.temperature` in `server/lib/mappers.ts` to `number | { toString(): string }` (do NOT change `toEntryDto`'s `Number(r.temperature)` body). Re-run typecheck.

- [ ] **Step 3: Run unit tests (mappers/alertLogic/validation)**

Run: `npm test`
Expected: all suites pass (these tests use plain numbers, no DB).

- [ ] **Step 4: Commit**

```bash
git add server/app/api/entries/route.ts server/lib/mappers.ts
git commit -m "feat(server): entries route uses Prisma"
```

---

### Task 9: Remove Supabase

**Files:**
- Delete: `server/lib/supabase.ts`
- Modify: `server/package.json`

- [ ] **Step 1: Confirm no remaining references**

Run: `grep -rn "supabase" server --include="*.ts" | grep -v node_modules`
Expected: no output. (If any line prints, fix that file before continuing.)

- [ ] **Step 2: Delete the client and uninstall the dep**

Run: `git rm server/lib/supabase.ts && (cd server && npm uninstall @supabase/supabase-js)`
Expected: file removed; `@supabase/supabase-js` gone from `package.json`.

- [ ] **Step 3: Typecheck + tests**

Run (from `server/`): `npx tsc --noEmit && npm test`
Expected: no type errors; all tests pass.

- [ ] **Step 4: Commit**

```bash
git add server/lib server/package.json server/package-lock.json
git commit -m "chore(server): remove Supabase client and dependency"
```

---

### Task 10: Seed script

**Files:**
- Create: `server/prisma/seed.ts`
- Modify: `server/package.json` (add `prisma.seed`)

- [ ] **Step 1: Create `server/prisma/seed.ts`**

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'test@healthtracker.dev';
  const password_hash = await bcrypt.hash('test1234', 10);
  await prisma.user.upsert({
    where: { email },
    update: { password_hash, name: 'Test User' },
    create: { email, password_hash, name: 'Test User' },
  });
  console.log(`Seeded user: ${email} / test1234`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

- [ ] **Step 2: Add the Prisma seed config to `server/package.json`**

Add this top-level key (sibling of `"scripts"`):

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

- [ ] **Step 3: Run the seed**

Run: `npx prisma db seed`
Expected: `Seeded user: test@healthtracker.dev / test1234`

- [ ] **Step 4: Verify the row exists**

Run: `psql -h localhost -d healthtracker -c "SELECT email, name FROM users;"`
Expected: one row, `test@healthtracker.dev | Test User`.

- [ ] **Step 5: Commit**

```bash
git add server/prisma/seed.ts server/package.json
git commit -m "feat(server): Prisma seed creates test account"
```

---

### Task 11: End-to-end verification

**Files:** none

- [ ] **Step 1: Restart the backend (fresh env/client)**

Stop any running `next dev` for `server/`, then from `server/` run `npm run dev` (background). Wait for "Ready".

- [ ] **Step 2: Login with the seeded account**

Run: `curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@healthtracker.dev","password":"test1234"}' -w "\nHTTP %{http_code}\n"`
Expected: `HTTP 200`, JSON body containing `"token"` and a `user` object.

- [ ] **Step 3: Signup a fresh account**

Run: `curl -s -X POST http://localhost:3000/api/auth/signup -H "Content-Type: application/json" -d '{"name":"E2E","email":"e2e@healthtracker.dev","password":"e2epass1"}' -w "\nHTTP %{http_code}\n"`
Expected: `HTTP 201`, JSON with `"token"`.

- [ ] **Step 4: Create + list an entry (uses the token from Step 3)**

Capture the token from Step 3, then:
`TOKEN=<token>; curl -s -X POST http://localhost:3000/api/entries -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"heartRate":72,"systolic":120,"diastolic":80,"spo2":98,"temperature":98.6,"symptoms":[],"notes":"ok"}' -w "\nHTTP %{http_code}\n"`
Expected: `HTTP 201`, body with camelCase fields (`heartRate`, `hasAlert`).
Then: `curl -s http://localhost:3000/api/entries -H "Authorization: Bearer $TOKEN"`
Expected: JSON array containing the entry just created.

- [ ] **Step 5: Production typecheck of all routes**

Run (from `server/`): `npx next build`
Expected: build completes, all routes typecheck.

- [ ] **Step 6: Open Prisma Studio**

Run (from `server/`, background): `npx prisma studio`
Expected: serves `http://localhost:5555`; `User` table shows the seeded + e2e users, `HealthEntry` shows the created entry.

No commit (verification only).

---

### Task 12: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update the data-flow and architecture wording**

In `CLAUDE.md`, replace Supabase/service-role/RLS descriptions with Prisma + local Postgres. Specifically:
- Data flow line: `… → Next.js /api/* → Prisma → local PostgreSQL` (drop "Supabase (service-role)").
- Alerts source-of-truth note: keep wording, no Supabase reference change needed there (it doesn't mention Supabase) — leave as is.
- Backend paragraph: replace "`supabase` service-role client" with "`prisma` client singleton (`lib/prisma.ts`)"; replace the "RLS is enabled with no policies …" sentence with: "The DB is a local Postgres owned by Prisma migrations (`server/prisma/`); no RLS — single-tenant dev DB."
- Dev auth section: replace the `server/.env.local` requirement `(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET)` with `(DATABASE_URL, JWT_SECRET)`. Add: "Seeded login: `test@healthtracker.dev` / `test1234` (`npx prisma db seed`)."
- Gotchas: replace the `.env*.example` Supabase mention only if present; add "Postgres: `brew services start postgresql@14`; browse with `npx prisma studio`."

- [ ] **Step 2: Verify no stale Supabase references remain in docs**

Run: `grep -ni "supabase" CLAUDE.md`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: CLAUDE.md reflects Prisma + local Postgres"
```

---

## Self-Review

**Spec coverage:** DB start/create (T1), Prisma deps+schema (T2), migration+env (T3), client singleton (T4), 4 routes migrated (T5–T8), Supabase removal (T9), seed (T10), verification incl. Prisma Studio (T11), docs (T12). All spec sections mapped.

**Placeholder scan:** No TBD/TODO. Route bodies given in full where rewritten (T5, T8) or as exact line replacements with the surrounding contract preserved (T6, T7) — login/me routes are modified-in-place because their non-DB logic must be read and preserved verbatim; the cat step makes that explicit.

**Type consistency:** `prisma` (named export) used identically across T4–T8. Prisma model field names (`user_id`, `heart_rate`, `password_hash`, `has_alert`, `healthEntry`, `user`) consistent with `schema.prisma` in T2 and with `EntryRow` in `lib/mappers.ts`. `temperature` Decimal→`Number()` handling called out in T8 with an explicit fallback. `DATABASE_URL` consistent between T3 env and T2 datasource.
