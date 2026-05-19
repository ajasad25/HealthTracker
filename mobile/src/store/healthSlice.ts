import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { HealthState, HealthEntry } from '../types';
import type { RootState } from './store';
import * as api from '../services/api';

const initialState: HealthState = {
  entries: [],
  isLoading: false,
  error: null,
};

export const fetchEntriesThunk = createAsyncThunk(
  'health/fetchEntries',
  async (_: void, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (!token) throw new Error('Not authenticated');
    return api.fetchHealthHistory(token);
  }
);

export const addEntryThunk = createAsyncThunk(
  'health/addEntry',
  async (
    entry: Omit<HealthEntry, 'id' | 'userId' | 'hasAlert'>,
    { getState }
  ) => {
    const token = (getState() as RootState).auth.token;
    if (!token) throw new Error('Not authenticated');
    return api.submitHealthEntry(token, entry);
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
        state.entries = action.payload;
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
        state.entries = [action.payload, ...state.entries];
      })
      .addCase(addEntryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to add entry';
      });
  },
});

export const { clearHealthError } = healthSlice.actions;
export default healthSlice.reducer;
