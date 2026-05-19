import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { HealthState, HealthEntry } from '../types';
import type { RootState } from './store';
import * as mockApi from '../services/mockApi';
import * as storage from '../services/storage';
import { checkForAlerts } from '../utils/alertLogic';

const initialState: HealthState = {
  entries: [],
  isLoading: false,
  error: null,
};

export const fetchEntriesThunk = createAsyncThunk(
  'health/fetchEntries',
  async (userId: string) => {
    const entries = await mockApi.fetchHealthHistory(userId);
    await storage.saveEntries(entries);
    return entries;
  }
);

export const addEntryThunk = createAsyncThunk(
  'health/addEntry',
  async (entry: Omit<HealthEntry, 'id' | 'hasAlert'>, { getState }) => {
    const alertResult = checkForAlerts(entry);
    const fullEntry: Omit<HealthEntry, 'id'> = {
      ...entry,
      hasAlert: alertResult.hasAlert,
    };

    const saved = await mockApi.submitHealthEntry(fullEntry);

    const rootState = getState() as RootState;
    const updatedEntries = [saved, ...rootState.health.entries];
    await storage.saveEntries(updatedEntries);

    return { entry: saved, alertMessages: alertResult.messages };
  }
);

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    clearHealthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEntriesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEntriesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries = action.payload.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      })
      .addCase(fetchEntriesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to fetch entries';
      })
      .addCase(addEntryThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addEntryThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries = [action.payload.entry, ...state.entries];
      })
      .addCase(addEntryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to add entry';
      });
  },
});

export const { clearHealthError } = healthSlice.actions;
export default healthSlice.reducer;
