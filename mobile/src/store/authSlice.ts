import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthState } from '../types';
import * as mockApi from '../services/mockApi';
import * as storage from '../services/storage';

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const result = await mockApi.login(email, password);
    await storage.saveToken(result.token);
    return result;
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await storage.clearToken();
});

export const restoreSessionThunk = createAsyncThunk(
  'auth/restoreSession',
  async () => {
    const token = await storage.getToken();
    if (!token) {
      throw new Error('No token found');
    }
    return {
      token,
      user: {
        id: 'user-001',
        name: 'Alex Johnson',
        email: 'alex@example.com',
      },
    };
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Login failed';
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      })
      .addCase(restoreSessionThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(restoreSessionThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(restoreSessionThunk.rejected, (state) => {
        state.isLoading = false;
        state.token = null;
        state.user = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
