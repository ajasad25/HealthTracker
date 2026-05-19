# HealthTracker Supabase + Next.js Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mock API with a real Next.js backend over Supabase Postgres, restructure into a `mobile/` + `server/` monorepo, add signup, and fix all known UI/responsiveness/config bugs.

**Architecture:** Expo app (`mobile/`) → typed fetch client → Next.js App Router API (`server/`) → Supabase via service-role key. Next.js owns auth (bcrypt + JWT). Server is the source of truth for `has_alert`. Redux Toolkit retained.

**Tech Stack:** Expo 54 / RN 0.81 / React 19 / NativeWind, Redux Toolkit, Next.js 15 (App Router), `@supabase/supabase-js`, `bcryptjs`, `jsonwebtoken`, `zod`, Jest (`jest-expo`).

**Working branch:** `feature/supabase-nextjs-overhaul` (already checked out).

---

## File Structure

```
mobile/   ← all current root files moved here (git mv)
  src/services/api.ts        (NEW, replaces mockApi.ts)
  src/services/storage.ts    (token-only)
  src/store/authSlice.ts     (+signupThunk, real restore)
  src/store/healthSlice.ts   (API-backed)
  src/screens/SignupScreen.tsx (NEW)
  src/components/ScreenContainer.tsx (NEW)
  src/components/ErrorBanner.tsx (NEW)
server/
  app/api/auth/{signup,login,me}/route.ts
  app/api/entries/route.ts
  lib/{supabase,password,jwt,auth,thresholds,alertLogic,validation,mappers}.ts
  __tests__/{alertLogic,password,jwt}.test.ts
```

---

## Phase 0 — Repo Restructure

### Task 0.1: Move Expo app into `mobile/`

**Files:** all root files except `.git/`, `docs/`, `README.md`.

- [ ] **Step 1:** Create dir and move tracked files with git:

```bash
cd /Users/asad/Desktop/repos/HealthTracker
mkdir -p mobile
git mv App.tsx index.ts app.json babel.config.js metro.config.js \
  tailwind.config.js global.css tsconfig.json jest.config.js jest.setup.ts \
  nativewind-env.d.ts package.json package-lock.json .gitignore src assets mobile/
```

- [ ] **Step 2:** Move the gitignored `.gitignore` content awareness — create a fresh root `.gitignore`:

```
node_modules/
.expo/
dist/
.DS_Store
*.log
mobile/node_modules/
server/node_modules/
server/.next/
.env
.env.local
.env*.local
```

Write that to `/Users/asad/Desktop/repos/HealthTracker/.gitignore`.

- [ ] **Step 3:** Verify nothing else stray:

Run: `git status --short && ls`
Expected: `mobile/` contains the app; root has `mobile/ docs/ README.md .gitignore`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: move Expo app into mobile/ for monorepo"
```

### Task 0.2: Scaffold `server/` Next.js app

**Files:** Create `server/` Next.js project.

- [ ] **Step 1:** Scaffold non-interactively:

```bash
cd /Users/asad/Desktop/repos/HealthTracker
npx --yes create-next-app@latest server --ts --app --no-src-dir \
  --no-tailwind --no-eslint --use-npm --import-alias "@/*" --turbopack
```

- [ ] **Step 2:** Add backend deps:

```bash
cd server
npm install @supabase/supabase-js bcryptjs jsonwebtoken zod
npm install -D @types/bcryptjs @types/jsonwebtoken jest ts-jest @types/jest
```

- [ ] **Step 3:** Remove the default marketing page so the app is API-only. Replace `server/app/page.tsx` with:

```tsx
export default function Home() {
  return <main style={{ padding: 24, fontFamily: 'sans-serif' }}>HealthTracker API — see /api/*</main>;
}
```

- [ ] **Step 4:** Create `server/jest.config.js`:

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
};
```

Add to `server/package.json` scripts: `"test": "jest"`.

- [ ] **Step 5:** Create `server/.env.local.example`:

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=replace-with-a-long-random-string
```

- [ ] **Step 6: Commit**

```bash
cd /Users/asad/Desktop/repos/HealthTracker
git add -A && git commit -m "chore: scaffold Next.js backend in server/"
```

---

## Phase 1 — Supabase Project & Schema

### Task 1.1: Create Supabase project (cost-gated)

This task uses the Supabase MCP, not bash.

- [ ] **Step 1:** Call `mcp__supabase__get_cost` with `{ type: "project", organization_id: "oeicnjtmiawwrvptcnjw" }`. Report the exact cost to the user and get explicit confirmation. (Org id from earlier `list_organizations`.)
- [ ] **Step 2:** Call `mcp__supabase__confirm_cost` with the returned parameters to get a `confirm_cost_id`.
- [ ] **Step 3:** Call `mcp__supabase__create_project` `{ name: "healthtracker", organization_id: "oeicnjtmiawwrvptcnjw", confirm_cost_id: <id> }`. Poll `mcp__supabase__get_project` until `status: ACTIVE_HEALTHY`.
- [ ] **Step 4:** Record `project_id`. Call `mcp__supabase__get_project_url` and `mcp__supabase__get_publishable_keys` — but for the **service-role** key, retrieve it from the project API settings (MCP `get_publishable_keys` returns anon/publishable only; the service-role key must be obtained by the user from the Supabase dashboard → Project Settings → API). **Step 4a:** Ask the user to paste the service-role key, then write `server/.env.local` with `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and a generated `JWT_SECRET` (`openssl rand -hex 32`).

### Task 1.2: Apply schema migration

- [ ] **Step 1:** Call `mcp__supabase__apply_migration` with name `init_healthtracker_schema` and SQL:

```sql
create extension if not exists pgcrypto;

create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.health_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  timestamp timestamptz not null,
  heart_rate int not null,
  systolic int not null,
  diastolic int not null,
  spo2 int not null,
  temperature numeric(3,1) not null,
  symptoms text[] not null default '{}',
  notes text,
  has_alert boolean not null default false,
  created_at timestamptz not null default now()
);

create index health_entries_user_ts_idx
  on public.health_entries (user_id, timestamp desc);

alter table public.users enable row level security;
alter table public.health_entries enable row level security;
-- No policies: service-role key (backend only) bypasses RLS.
```

- [ ] **Step 2:** Call `mcp__supabase__list_tables` (schema `public`) — expect `users` and `health_entries`.
- [ ] **Step 3:** Call `mcp__supabase__get_advisors` `{ type: "security" }` — confirm no critical "RLS disabled" findings (RLS is enabled; "no policy" is intended).

---

## Phase 2 — Next.js Backend (TDD for pure logic)

All paths below are under `server/`.

### Task 2.1: Thresholds + alert logic (TDD)

**Files:** Create `lib/thresholds.ts`, `lib/alertLogic.ts`, `__tests__/alertLogic.test.ts`.

- [ ] **Step 1: Write failing test** — `server/__tests__/alertLogic.test.ts`:

```ts
import { checkForAlerts } from '../lib/alertLogic';

test('flags high heart rate', () => {
  const r = checkForAlerts({ heartRate: 130, systolic: 120, diastolic: 80, spo2: 98, temperature: 36.6, symptoms: [] });
  expect(r.hasAlert).toBe(true);
  expect(r.messages).toContain('Heart rate critically elevated');
});

test('no alert for normal vitals', () => {
  const r = checkForAlerts({ heartRate: 72, systolic: 120, diastolic: 80, spo2: 98, temperature: 36.6, symptoms: [] });
  expect(r.hasAlert).toBe(false);
  expect(r.messages).toEqual([]);
});

test('flags low spo2 and fever together', () => {
  const r = checkForAlerts({ heartRate: 70, systolic: 110, diastolic: 70, spo2: 85, temperature: 39.6, symptoms: [] });
  expect(r.messages).toEqual(['Blood oxygen dangerously low', 'Fever detected']);
});
```

- [ ] **Step 2: Run, expect fail**

Run: `cd server && npm test`
Expected: FAIL (cannot find `../lib/alertLogic`).

- [ ] **Step 3: Implement** — `server/lib/thresholds.ts`:

```ts
export const HEART_RATE = { alertAbove: 120 } as const;
export const SPO2 = { alertBelow: 90 } as const;
export const TEMPERATURE = { alertAbove: 39 } as const;
```

`server/lib/alertLogic.ts`:

```ts
import { HEART_RATE, SPO2, TEMPERATURE } from './thresholds';

export interface VitalInput {
  heartRate: number; systolic: number; diastolic: number;
  spo2: number; temperature: number; symptoms: string[]; notes?: string;
}
export interface AlertResult { hasAlert: boolean; messages: string[]; }

export function checkForAlerts(e: VitalInput): AlertResult {
  const messages: string[] = [];
  if (e.heartRate > HEART_RATE.alertAbove) messages.push('Heart rate critically elevated');
  if (e.spo2 < SPO2.alertBelow) messages.push('Blood oxygen dangerously low');
  if (e.temperature > TEMPERATURE.alertAbove) messages.push('Fever detected');
  return { hasAlert: messages.length > 0, messages };
}
```

- [ ] **Step 4: Run, expect pass**

Run: `cd server && npm test`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(server): alert logic with tests"
```

### Task 2.2: Password + JWT helpers (TDD)

**Files:** Create `lib/password.ts`, `lib/jwt.ts`, `__tests__/password.test.ts`, `__tests__/jwt.test.ts`.

- [ ] **Step 1: Write failing tests** — `server/__tests__/password.test.ts`:

```ts
import { hashPassword, verifyPassword } from '../lib/password';

test('hash then verify round-trips', async () => {
  const h = await hashPassword('secret123');
  expect(h).not.toBe('secret123');
  expect(await verifyPassword('secret123', h)).toBe(true);
  expect(await verifyPassword('wrong', h)).toBe(false);
});
```

`server/__tests__/jwt.test.ts`:

```ts
import { signToken, verifyToken } from '../lib/jwt';
process.env.JWT_SECRET = 'test-secret';

test('sign then verify returns payload', () => {
  const t = signToken({ userId: 'u1', email: 'a@b.com' });
  const p = verifyToken(t);
  expect(p.userId).toBe('u1');
  expect(p.email).toBe('a@b.com');
});

test('invalid token throws', () => {
  expect(() => verifyToken('garbage')).toThrow();
});
```

- [ ] **Step 2: Run, expect fail**

Run: `cd server && npm test`
Expected: FAIL (modules missing).

- [ ] **Step 3: Implement** — `server/lib/password.ts`:

```ts
import bcrypt from 'bcryptjs';
export const hashPassword = (p: string) => bcrypt.hash(p, 10);
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h);
```

`server/lib/jwt.ts`:

```ts
import jwt from 'jsonwebtoken';

export interface JwtPayload { userId: string; email: string; }

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET not set');
  return s;
}
export const signToken = (p: JwtPayload) =>
  jwt.sign(p, secret(), { expiresIn: '7d' });
export const verifyToken = (t: string): JwtPayload =>
  jwt.verify(t, secret()) as JwtPayload;
```

- [ ] **Step 4: Run, expect pass**

Run: `cd server && npm test`
Expected: PASS (all suites).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(server): password & jwt helpers with tests"
```

### Task 2.3: Supabase client, auth guard, validation, mappers

**Files:** Create `lib/supabase.ts`, `lib/auth.ts`, `lib/validation.ts`, `lib/mappers.ts`.

- [ ] **Step 1:** `server/lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js';

export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env not set');
  return createClient(url, key, { auth: { persistSession: false } });
}
```

- [ ] **Step 2:** `server/lib/validation.ts`:

```ts
import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export const entrySchema = z.object({
  heartRate: z.number().min(40).max(200),
  systolic: z.number().min(50).max(250),
  diastolic: z.number().min(30).max(150),
  spo2: z.number().min(70).max(100),
  temperature: z.number().min(34).max(42),
  symptoms: z.array(z.string()),
  notes: z.string().max(500).optional(),
  timestamp: z.string().optional(),
});
```

- [ ] **Step 3:** `server/lib/auth.ts`:

```ts
import { NextRequest } from 'next/server';
import { verifyToken, JwtPayload } from './jwt';

export class AuthError extends Error {}

export function requireAuth(req: NextRequest): JwtPayload {
  const h = req.headers.get('authorization') ?? '';
  const m = h.match(/^Bearer (.+)$/);
  if (!m) throw new AuthError('Missing token');
  try {
    return verifyToken(m[1]);
  } catch {
    throw new AuthError('Invalid token');
  }
}
```

- [ ] **Step 4:** `server/lib/mappers.ts` (DB snake_case → API camelCase):

```ts
export interface EntryRow {
  id: string; user_id: string; timestamp: string; heart_rate: number;
  systolic: number; diastolic: number; spo2: number; temperature: number;
  symptoms: string[]; notes: string | null; has_alert: boolean;
}
export function toEntryDto(r: EntryRow) {
  return {
    id: r.id, userId: r.user_id, timestamp: r.timestamp,
    heartRate: r.heart_rate, systolic: r.systolic, diastolic: r.diastolic,
    spo2: r.spo2, temperature: Number(r.temperature),
    symptoms: r.symptoms, notes: r.notes ?? undefined, hasAlert: r.has_alert,
  };
}
export function toUserDto(r: { id: string; email: string; name: string }) {
  return { id: r.id, email: r.email, name: r.name };
}
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(server): supabase client, auth guard, validation, mappers"
```

### Task 2.4: Auth routes (signup, login, me)

**Files:** Create `app/api/auth/signup/route.ts`, `app/api/auth/login/route.ts`, `app/api/auth/me/route.ts`.

- [ ] **Step 1:** `server/app/api/auth/signup/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { signupSchema } from '@/lib/validation';
import { hashPassword } from '@/lib/password';
import { signToken } from '@/lib/jwt';
import { toUserDto } from '@/lib/mappers';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  const { name, email, password } = parsed.data;
  const db = supabaseAdmin();

  const { data: existing } = await db.from('users').select('id').eq('email', email).maybeSingle();
  if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

  const password_hash = await hashPassword(password);
  const { data, error } = await db.from('users')
    .insert({ name, email, password_hash }).select('id,email,name').single();
  if (error || !data) return NextResponse.json({ error: 'Could not create user' }, { status: 500 });

  const token = signToken({ userId: data.id, email: data.email });
  return NextResponse.json({ token, user: toUserDto(data) }, { status: 201 });
}
```

- [ ] **Step 2:** `server/app/api/auth/login/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { loginSchema } from '@/lib/validation';
import { verifyPassword } from '@/lib/password';
import { signToken } from '@/lib/jwt';
import { toUserDto } from '@/lib/mappers';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  const { email, password } = parsed.data;
  const db = supabaseAdmin();

  const { data: user } = await db.from('users')
    .select('id,email,name,password_hash').eq('email', email).maybeSingle();
  if (!user || !(await verifyPassword(password, user.password_hash)))
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

  const token = signToken({ userId: user.id, email: user.email });
  return NextResponse.json({ token, user: toUserDto(user) });
}
```

- [ ] **Step 3:** `server/app/api/auth/me/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth, AuthError } from '@/lib/auth';
import { toUserDto } from '@/lib/mappers';

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const { data } = await supabaseAdmin()
      .from('users').select('id,email,name').eq('id', userId).maybeSingle();
    if (!data) return NextResponse.json({ error: 'User not found' }, { status: 401 });
    return NextResponse.json({ user: toUserDto(data) });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(server): auth routes signup/login/me"
```

### Task 2.5: Entries routes

**Files:** Create `app/api/entries/route.ts`.

- [ ] **Step 1:** `server/app/api/entries/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth, AuthError } from '@/lib/auth';
import { entrySchema } from '@/lib/validation';
import { checkForAlerts } from '@/lib/alertLogic';
import { toEntryDto } from '@/lib/mappers';

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const { data, error } = await supabaseAdmin()
      .from('health_entries').select('*')
      .eq('user_id', userId).order('timestamp', { ascending: false });
    if (error) return NextResponse.json({ error: 'Could not load entries' }, { status: 500 });
    return NextResponse.json((data ?? []).map(toEntryDto));
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const body = await req.json().catch(() => null);
    const parsed = entrySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    const v = parsed.data;
    const { hasAlert } = checkForAlerts(v);
    const { data, error } = await supabaseAdmin().from('health_entries').insert({
      user_id: userId,
      timestamp: v.timestamp ?? new Date().toISOString(),
      heart_rate: v.heartRate, systolic: v.systolic, diastolic: v.diastolic,
      spo2: v.spo2, temperature: v.temperature, symptoms: v.symptoms,
      notes: v.notes ?? null, has_alert: hasAlert,
    }).select('*').single();
    if (error || !data) return NextResponse.json({ error: 'Could not save entry' }, { status: 500 });
    return NextResponse.json(toEntryDto(data), { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Build check**

Run: `cd server && npx next build`
Expected: build succeeds (type-checks all routes).

- [ ] **Step 3: Manual smoke test** (server running via `npm run dev` in `server/`, env set):

```bash
curl -s -XPOST localhost:3000/api/auth/signup -H 'content-type: application/json' \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
# expect {"token":"...","user":{...}}  — save token
curl -s localhost:3000/api/entries -H "authorization: Bearer <TOKEN>"
# expect []
curl -s -XPOST localhost:3000/api/entries -H "authorization: Bearer <TOKEN>" \
  -H 'content-type: application/json' \
  -d '{"heartRate":130,"systolic":120,"diastolic":80,"spo2":98,"temperature":36.6,"symptoms":[]}'
# expect entry JSON with "hasAlert":true
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(server): entries routes (list/create) with server-side alerts"
```

---

## Phase 3 — Mobile Integration

All paths below are under `mobile/`.

### Task 3.1: API client + env

**Files:** Create `src/services/api.ts`; create `mobile/.env.example`; delete `src/services/mockApi.ts` (after slices updated — Task 3.3).

- [ ] **Step 1:** `mobile/.env.example`:

```
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

- [ ] **Step 2:** `mobile/src/services/api.ts`:

```ts
import type { HealthEntry, User } from '../types';

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string, opts: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, headers, ...rest } = opts;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(json?.error ?? `Request failed (${res.status})`);
  return json as T;
}

export const signup = (name: string, email: string, password: string) =>
  request<{ token: string; user: User }>('/api/auth/signup', {
    method: 'POST', body: JSON.stringify({ name, email, password }) });

export const login = (email: string, password: string) =>
  request<{ token: string; user: User }>('/api/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password }) });

export const me = (token: string) =>
  request<{ user: User }>('/api/auth/me', { token });

export const fetchHealthHistory = (token: string) =>
  request<HealthEntry[]>('/api/entries', { token });

export const submitHealthEntry = (
  token: string,
  entry: Omit<HealthEntry, 'id' | 'userId' | 'hasAlert'>,
) => request<HealthEntry>('/api/entries', {
  method: 'POST', token, body: JSON.stringify(entry) });
```

- [ ] **Step 3: Commit**

```bash
cd /Users/asad/Desktop/repos/HealthTracker
git add -A && git commit -m "feat(mobile): typed API client + env example"
```

### Task 3.2: Token-only storage

**Files:** Modify `mobile/src/services/storage.ts`.

- [ ] **Step 1:** Replace entire file contents with:

```ts
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';

export const saveToken = (t: string) => SecureStore.setItemAsync(TOKEN_KEY, t);
export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const clearToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);
```

(Removes `saveEntries`/`getEntries` — fixes the SecureStore 2 KB bug.)

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "fix(mobile): store only JWT in SecureStore"
```

### Task 3.3: Rewire auth + health slices

**Files:** Modify `mobile/src/store/authSlice.ts`, `mobile/src/store/healthSlice.ts`. Then delete `mobile/src/services/mockApi.ts`.

- [ ] **Step 1:** Rewrite `authSlice.ts` thunks (keep slice/reducers/extraReducers shape; add signup, real restore):

```ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthState } from '../types';
import * as api from '../services/api';
import * as storage from '../services/storage';

const initialState: AuthState = { user: null, token: null, isLoading: false, error: null };

export const loginThunk = createAsyncThunk('auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const r = await api.login(email, password);
    await storage.saveToken(r.token);
    return r;
  });

export const signupThunk = createAsyncThunk('auth/signup',
  async ({ name, email, password }: { name: string; email: string; password: string }) => {
    const r = await api.signup(name, email, password);
    await storage.saveToken(r.token);
    return r;
  });

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await storage.clearToken();
});

export const restoreSessionThunk = createAsyncThunk('auth/restoreSession', async () => {
  const token = await storage.getToken();
  if (!token) throw new Error('No token');
  const { user } = await api.me(token);
  return { token, user };
});
```

Keep the existing `createSlice` block but add cases for `signupThunk` (pending/fulfilled/rejected) mirroring `loginThunk`, and ensure `restoreSessionThunk.fulfilled` sets `state.token`/`state.user` from payload (already does). Add to `extraReducers`:

```ts
.addCase(signupThunk.pending, (s) => { s.isLoading = true; s.error = null; })
.addCase(signupThunk.fulfilled, (s, a) => { s.isLoading = false; s.user = a.payload.user; s.token = a.payload.token; })
.addCase(signupThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.error.message ?? 'Signup failed'; })
```

- [ ] **Step 2:** Rewrite `healthSlice.ts` thunks to use API + token from state, drop storage + client alert write:

```ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { HealthState, HealthEntry } from '../types';
import type { RootState } from './store';
import * as api from '../services/api';

const initialState: HealthState = { entries: [], isLoading: false, error: null };

export const fetchEntriesThunk = createAsyncThunk('health/fetchEntries',
  async (_: void, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (!token) throw new Error('Not authenticated');
    return api.fetchHealthHistory(token);
  });

export const addEntryThunk = createAsyncThunk('health/addEntry',
  async (entry: Omit<HealthEntry, 'id' | 'userId' | 'hasAlert'>, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (!token) throw new Error('Not authenticated');
    return api.submitHealthEntry(token, entry);
  });
```

Keep `createSlice` with `clearHealthError`. `extraReducers`: `fetchEntriesThunk.fulfilled` → `state.entries = action.payload` (already newest-first from server, no client sort needed); `addEntryThunk.fulfilled` → `state.entries = [action.payload, ...state.entries]`; pending/rejected set `isLoading`/`error` as before.

- [ ] **Step 3:** Update callers of `fetchEntriesThunk` (was `dispatch(fetchEntriesThunk(user.id))`): in `DashboardScreen.tsx` and `HealthHistoryScreen.tsx`, change to `dispatch(fetchEntriesThunk())`.

- [ ] **Step 4:** Update `AddHealthEntryScreen.tsx` `onSubmit`: build `entryData` without `userId`/`hasAlert` (server adds them):

```ts
const entryData = { ...data, symptoms: selectedSymptoms, timestamp: new Date().toISOString() };
```

`checkForAlerts(entryData)` still used locally for the warning dialog (display only) — keep import. The `addEntryThunk(entryData)` call is unchanged in shape.

- [ ] **Step 5:** Delete `mobile/src/services/mockApi.ts`.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(mobile): API-backed auth & health slices; remove mockApi"
```

### Task 3.4: Signup screen + navigation

**Files:** Create `mobile/src/screens/SignupScreen.tsx`; modify `mobile/src/types/index.ts`, `mobile/src/navigation/RootNavigator.tsx`, `mobile/src/utils/validation.ts`, `mobile/src/screens/LoginScreen.tsx`.

- [ ] **Step 1:** In `types/index.ts` change `AuthStackParamList` to:

```ts
export type AuthStackParamList = { Login: undefined; Signup: undefined; };
```

- [ ] **Step 2:** In `utils/validation.ts` add:

```ts
export const signupSchema = z.object({
  name: z.string({ message: 'Name is required' }).min(1, 'Name is required'),
  email: z.string({ message: 'Email is required' }).email('Invalid email format'),
  password: z.string({ message: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
});
export type SignupFormData = z.infer<typeof signupSchema>;
```

- [ ] **Step 3:** Create `SignupScreen.tsx` — copy `LoginScreen.tsx` structure, add a `name` field, use `signupSchema`/`signupThunk`, and a footer link `TouchableOpacity` → `navigation.navigate('Login')`. Use the `frontend-design` skill for polish and `ScreenContainer` (Task 4.1). Title "Create Account", button "Sign Up".

- [ ] **Step 4:** In `LoginScreen.tsx` add a footer below the hint: `TouchableOpacity` with text "Don't have an account? Sign up" → `navigation.navigate('Signup')`. Add `useNavigation<NativeStackNavigationProp<AuthStackParamList>>()`.

- [ ] **Step 5:** In `RootNavigator.tsx` `AuthNavigator`, register the screen:

```tsx
<AuthStack.Screen name="Signup" component={SignupScreen} />
```

(import `SignupScreen`).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(mobile): signup screen + auth navigation"
```

---

## Phase 4 — UI / Responsiveness / Quality

All paths under `mobile/`.

### Task 4.1: ScreenContainer (safe-area + web/tablet width)

**Files:** Create `mobile/src/components/ScreenContainer.tsx`. Use the `frontend-design` skill.

- [ ] **Step 1:** Create:

```tsx
import React from 'react';
import { View, ScrollView, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props extends ScrollViewProps {
  scroll?: boolean;
  children: React.ReactNode;
}
export default function ScreenContainer({ scroll = true, children, contentContainerStyle, ...rest }: Props) {
  const insets = useSafeAreaInsets();
  const pad = { paddingTop: insets.top + 16 };
  const inner = (
    <View className="w-full max-w-[600px] self-center px-6 pb-8 flex-1" style={pad}>
      {children}
    </View>
  );
  if (!scroll) return <View className="flex-1 bg-neutral-50">{inner}</View>;
  return (
    <ScrollView className="flex-1 bg-neutral-50" keyboardShouldPersistTaps="handled"
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]} {...rest}>
      {inner}
    </ScrollView>
  );
}
```

- [ ] **Step 2:** Adopt in `DashboardScreen`, `AddHealthEntryScreen`, `HealthEntryDetailScreen`: replace the outer `ScrollView`+`View className="px-6 pt-14 pb-8"` with `<ScreenContainer>…</ScreenContainer>`. For `HealthHistoryScreen` (uses FlatList) keep `View` root but wrap header in a `max-w-[600px] self-center w-full` view and add `paddingTop: insets.top + 16` via `useSafeAreaInsets`. For `LoginScreen`/`SignupScreen` keep `KeyboardAvoidingView` but apply the same max-width + safe-area inner wrapper.

- [ ] **Step 3:** Verify no remaining `pt-14`:

Run: `cd mobile && grep -rn "pt-14" src || echo "none"`
Expected: `none`.

- [ ] **Step 4: Commit**

```bash
cd /Users/asad/Desktop/repos/HealthTracker
git add -A && git commit -m "feat(mobile): ScreenContainer with safe-area + responsive width"
```

### Task 4.2: ErrorBanner + surface slice errors

**Files:** Create `mobile/src/components/ErrorBanner.tsx`; modify `DashboardScreen`, `HealthHistoryScreen`, `AddHealthEntryScreen`.

- [ ] **Step 1:** Create:

```tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function ErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <View className="bg-danger-50 border border-danger-200 rounded-xl p-3 mb-4"
      accessibilityRole="alert">
      <Text className="text-danger-600 text-sm text-center">{message}</Text>
    </View>
  );
}
```

- [ ] **Step 2:** In `DashboardScreen` and `AddHealthEntryScreen`, read `const error = useAppSelector(s => s.health.error)` and render `<ErrorBanner message={error} />` near the top of the content. In `HealthHistoryScreen` render it above the `FlatList`.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat(mobile): surface health slice errors via ErrorBanner"
```

### Task 4.3: Accessibility + dead-code removal

**Files:** Modify `Button.tsx`, `SymptomChip.tsx`, `EntryListItem.tsx`, `LoginScreen.tsx` (password toggle); delete `LoadingOverlay.tsx`; remove `expo-status-bar` dep.

- [ ] **Step 1:** `Button.tsx`: add to `<TouchableOpacity>`: `accessibilityRole="button"` and `accessibilityLabel={title}` and `accessibilityState={{ disabled: isDisabled, busy: loading }}`.
- [ ] **Step 2:** `SymptomChip.tsx`: add `accessibilityRole="button"`, `accessibilityState={{ selected }}`, `accessibilityLabel={label}`.
- [ ] **Step 3:** `EntryListItem.tsx`: add `accessibilityRole="button"`, `accessibilityLabel={\`Health entry ${formatDateTime(entry.timestamp)}\`}`.
- [ ] **Step 4:** `LoginScreen.tsx` password toggle `TouchableOpacity`: add `accessibilityRole="button"` and `accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}`. Apply the same in `SignupScreen.tsx` if it has a toggle.
- [ ] **Step 5:** Delete `mobile/src/components/LoadingOverlay.tsx`.
- [ ] **Step 6:** In `mobile/App.tsx` confirm `StatusBar` is from `react-native` (it is). Remove `expo-status-bar` from `mobile/package.json` dependencies. Run `cd mobile && grep -rn "expo-status-bar" src App.tsx || echo none` → expect `none`.
- [ ] **Step 7: Commit**

```bash
cd /Users/asad/Desktop/repos/HealthTracker
git add -A && git commit -m "feat(mobile): accessibility labels; remove dead code"
```

---

## Phase 5 — Test / Config Fixes + Docs

### Task 5.1: Fix Jest config and verify mobile tests

**Files:** Modify `mobile/jest.config.js`, `mobile/package.json`.

- [ ] **Step 1:** `mobile/package.json`: add `"jest-expo"` to devDependencies (`cd mobile && npm install -D jest-expo`) and add scripts `"test": "jest"`.
- [ ] **Step 2:** Rewrite `mobile/jest.config.js`:

```js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testMatch: ['**/src/__tests__/**/*.test.(ts|tsx)'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|react-native-css-interop))',
  ],
};
```

- [ ] **Step 3:** Run mobile tests:

Run: `cd mobile && npx jest`
Expected: PASS — `alertLogic.test.ts`, `validation.test.ts`, `MetricCard.test.tsx` (3 suites green).

- [ ] **Step 4:** If `validation.test.ts` references removed fields, update it to match current schema (it tests `healthEntrySchema`/`loginSchema` which are unchanged; signup schema is new and optional to test). Fix only if red.

- [ ] **Step 5: Commit**

```bash
cd /Users/asad/Desktop/repos/HealthTracker
git add -A && git commit -m "fix(mobile): jest-expo preset; tests green"
```

### Task 5.2: README + CLAUDE.md update

**Files:** Modify root `README.md`; create root `CLAUDE.md` is already moved? (CLAUDE.md was at root before move — Task 0.1 did not move it since it was created after recent commits; verify.)

- [ ] **Step 1:** Check `CLAUDE.md` location: `ls CLAUDE.md mobile/CLAUDE.md 2>/dev/null`. If at root and now stale (paths changed), update it to describe the monorepo: `mobile/` (Expo) and `server/` (Next.js) with the new commands.
- [ ] **Step 2:** Rewrite root `README.md` "Setup & Run" for the monorepo:

```md
## Monorepo layout
- `mobile/` — Expo React Native app
- `server/` — Next.js backend (API over Supabase)

## Backend (server/)
cd server
cp .env.local.example .env.local   # fill SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET
npm install
npm run dev                        # http://localhost:3000
npm test

## Mobile (mobile/)
cd mobile
cp .env.example .env               # set EXPO_PUBLIC_API_URL to your machine LAN IP:3000
npm install
npx expo start
npx jest
```

Update the README's "Known Limitations" (mock API → real backend; persistence now real) and "Architecture" sections accordingly.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "docs: monorepo README + CLAUDE.md"
```

### Task 5.3: Final end-to-end verification

- [ ] **Step 1:** Backend tests: `cd server && npm test` → all PASS.
- [ ] **Step 2:** Backend build: `cd server && npx next build` → success.
- [ ] **Step 3:** Mobile tests: `cd mobile && npx jest` → all PASS.
- [ ] **Step 4:** Mobile typecheck: `cd mobile && npx tsc --noEmit` → no errors.
- [ ] **Step 5:** Manual E2E with `server` running + `mobile` pointed at it: signup → add alerting entry → see warning dialog → save → history shows it → detail shows alert banner → logout → relaunch restores session (me endpoint) showing correct user. Document results.
- [ ] **Step 6:** Use `superpowers:finishing-a-development-branch` to decide merge/PR.

---

## Self-Review Notes

- **Spec coverage:** §1 restructure→T0.1/0.2; §2 schema→T1.1/1.2; §3 backend→T2.1–2.5; §4 mobile→T3.1–3.4; §5 UI→T4.1–4.3; §6 tests/docs→T5.1–5.2. All covered.
- **Type consistency:** API returns camelCase matching `HealthEntry` (`heartRate`,`hasAlert`); `toEntryDto` enforces it. `submitHealthEntry` omits `id`/`userId`/`hasAlert`; `addEntryThunk` arg type matches. `restoreSessionThunk` returns `{token,user}` matching existing fulfilled reducer.
- **Known non-TDD tasks:** file moves, Supabase creation, Next routes — verified via build/curl instead of unit tests (justified: I/O-bound, no pure logic).
- **Risk:** service-role key handled via user paste + gitignored `.env.local`; never committed.
