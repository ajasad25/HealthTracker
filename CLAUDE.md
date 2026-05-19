# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install            # install dependencies
npx expo start         # start dev server (then press i / a / w, or scan QR)
npx expo start --ios   # / --android / --web
npx jest               # run all tests
npx jest src/__tests__/alertLogic.test.ts   # run a single test file
npx jest -t "elevated heart rate"           # run tests matching a name
npx tsc --noEmit       # typecheck (no separate lint setup)
```

There is no ESLint/Prettier config and no build script — Expo handles bundling. Type safety is enforced via `tsc` with `strict: true`.

**Login during development:** any email + password `password123` (enforced in `src/services/mockApi.ts`).

## Architecture

React Native + Expo (SDK 54, React 19) app for logging vitals and surfacing health alerts. TypeScript throughout, path alias `@/*` → `src/*` (configured in both `tsconfig.json` and `jest.config.js`).

**State — Redux Toolkit, two slices:**
- `store/authSlice.ts` — `loginThunk`, `logoutThunk`, `restoreSessionThunk`. Auth gate is the presence of `state.auth.token`.
- `store/healthSlice.ts` — `fetchEntriesThunk`, `addEntryThunk`. Entries are kept sorted newest-first.
- Always use the typed hooks `useAppDispatch` / `useAppSelector` (in `src/hooks/`), never the raw react-redux hooks.

**Data flow is layered — thunks are the only place these compose:**
`screen → dispatch(thunk) → services/mockApi (simulated REST, 400ms delay) → services/storage (expo-secure-store, encrypted at rest)`. `mockApi` has no backend; `fetchHealthHistory` regenerates the same seed entries on every call, so added entries do not survive a refetch. Persisted data also lives in SecureStore under `auth_token` and `health_entries`.

**Alert logic is deliberately decoupled:** `utils/alertLogic.ts#checkForAlerts` is a pure function driven by `constants/thresholds.ts` (HR > 120, SpO2 < 90, temp > 39°C). It is called inside `addEntryThunk` to set the `hasAlert` flag *and* independently in the detail screen. Add/adjust alert rules here and in `thresholds.ts` — not in components or slices. Thresholds are the single source of truth shared with `utils/validation.ts` (Zod schemas + inferred form types).

**Navigation (`navigation/RootNavigator.tsx`):** nested navigators. Root stack swaps `Auth` ↔ `Main` based on `token`. `Main` is a bottom-tab navigator (Dashboard / AddEntry / History); the History tab wraps its own native-stack (`HistoryList` → `EntryDetail`). Param lists for every navigator live in `src/types/index.ts` alongside all shared interfaces.

**Styling:** NativeWind (Tailwind for RN) via `className`. The healthcare color system (primary teal `#0077A8`, danger/warning/success) is defined in `tailwind.config.js`; reference those tokens rather than hardcoding hex values in components.

## Gotchas

- `jest.config.js` uses the key `setupFilesAfterSetup` (not the standard `setupFilesAfterEnv`), so `jest.setup.ts` is currently **not** loaded by Jest. Fix the key if you add setup that tests depend on.
- Forms use `react-hook-form` + `@hookform/resolvers/zod`; the Zod schema in `utils/validation.ts` is the source of truth for both validation and form types.
- expo-notifications and react-native-chart-kit are installed but unused (push alerts and trend charts are not wired up).
