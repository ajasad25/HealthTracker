# Health Tracker

A React Native health monitoring application built with Expo, TypeScript, Redux Toolkit, and NativeWind. Track vitals, log symptoms, and receive real-time health alerts.

## Setup & Run

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on specific platform
npx expo start --android
npx expo start --ios
npx expo start --web

# Run tests
npx jest
```

**Login credentials:** Any email + password `password123`

## Architecture

```
src/
  app/             # Navigation (RootNavigator with auth-gated routing)
  screens/         # LoginScreen, DashboardScreen, AddHealthEntryScreen,
                   # HealthHistoryScreen, HealthEntryDetailScreen
  components/      # Reusable UI: MetricCard, VitalInput, SymptomChip,
                   # AlertBanner, Button, LoadingOverlay, EmptyState, EntryListItem
  store/           # Redux store + authSlice + healthSlice
  hooks/           # useAppDispatch, useAppSelector (typed Redux hooks)
  services/        # mockApi (simulated REST), storage (expo-secure-store)
  utils/           # alertLogic (decoupled health alerts), validation (zod schemas),
                   # formatters (date/time/status helpers)
  types/           # All TypeScript interfaces and navigation param types
  constants/       # Thresholds, symptom list, color palette
  __tests__/       # Jest tests for alertLogic, validation, MetricCard
```

## Design Decisions

### Why Redux Toolkit over Zustand/Context

- **Predictable state** — Redux's single store with strict unidirectional data flow makes health data state changes traceable and debuggable. For a health app where data integrity matters, this predictability is critical.
- **Async thunks** — `createAsyncThunk` provides built-in loading/error/success state management for API calls and SecureStore operations without extra boilerplate.
- **DevTools** — Redux DevTools enable time-travel debugging, which is invaluable when diagnosing state issues across auth and health data flows.
- **Scalability** — As the app grows (e.g., adding provider sharing, medication tracking), Redux's slice pattern scales cleanly without the prop-drilling issues of Context.

### NativeWind (Tailwind CSS)

Chosen for rapid, consistent styling with utility classes. The design system colors in `tailwind.config.js` ensure healthcare-appropriate visual consistency (primary teal, danger red, warning amber, success green) across all components.

### Zod + react-hook-form

- Zod provides runtime validation with TypeScript type inference — the schema is the single source of truth for both validation rules and form types.
- react-hook-form minimizes re-renders with uncontrolled inputs and integrates seamlessly with Zod via `@hookform/resolvers`.

### expo-secure-store

Used for persisting auth tokens and health entry data. SecureStore encrypts data at rest using the device's secure enclave (Keychain on iOS, EncryptedSharedPreferences on Android), appropriate for health-related data.

### Alert Logic Separation

`checkForAlerts()` is a pure function in `utils/alertLogic.ts`, completely decoupled from UI and Redux. This design:
- Makes alert logic independently testable (see `__tests__/alertLogic.test.ts`)
- Allows reuse in both the Redux thunk (setting `hasAlert` flag) and the detail screen
- Enables future extension (e.g., push notifications) without touching UI code

## Features

- **Authentication** — Login with form validation, session persistence via SecureStore
- **Dashboard** — Time-of-day greeting, today's vitals summary with color-coded status indicators, alert banners
- **Health Entry Form** — Validated numeric inputs for all vitals, multi-select symptom chips, optional notes (500 char limit)
- **Alert System** — Automatic detection of critical heart rate (>120), low SpO2 (<90), and fever (>39°C) with in-app warnings
- **History** — Chronological FlatList with pull-to-refresh, entry badges, alert indicators
- **Detail View** — Full vital display with status colors, symptom chips, notes, and alert/normal banners

## Known Limitations

- **Mock API only** — All data is simulated with 400ms delays; no real backend. Seed data regenerates on each fetch.
- **No real authentication** — Any email works with the hardcoded password. No account creation flow.
- **No data persistence across sessions** — SecureStore has a ~2KB limit per key on some platforms; large entry histories may be truncated.
- **No push notifications** — expo-notifications is installed but not wired to alert logic (infrastructure is in place).
- **No charts** — react-native-chart-kit is installed but trend visualization is not yet implemented.
- **Single user** — No multi-user or provider sharing capability.

## Assumptions

- Users enter vitals manually (no device/wearable integration)
- Metric units (°C, mmHg) — no imperial conversion
- Alert thresholds are fixed constants, not user-configurable
- The app is used by a single person on a single device
- Network connectivity is not required (all data is local/mocked)
