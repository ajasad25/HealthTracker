import * as SecureStore from 'expo-secure-store';
import type { HealthEntry } from '../types';

const TOKEN_KEY = 'auth_token';
const ENTRIES_KEY = 'health_entries';

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function saveEntries(entries: HealthEntry[]): Promise<void> {
  await SecureStore.setItemAsync(ENTRIES_KEY, JSON.stringify(entries));
}

export async function getEntries(): Promise<HealthEntry[]> {
  const raw = await SecureStore.getItemAsync(ENTRIES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as HealthEntry[];
  } catch {
    return [];
  }
}
