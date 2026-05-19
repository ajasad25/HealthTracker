import type { HealthEntry, User } from '../types';

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function request<T>(
  path: string,
  opts: RequestInit & { token?: string } = {}
): Promise<T> {
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
  if (!res.ok) {
    throw new Error(json?.error ?? `Request failed (${res.status})`);
  }
  return json as T;
}

export const signup = (name: string, email: string, password: string) =>
  request<{ token: string; user: User }>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

export const login = (email: string, password: string) =>
  request<{ token: string; user: User }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const me = (token: string) =>
  request<{ user: User }>('/api/auth/me', { token });

export const fetchHealthHistory = (token: string) =>
  request<HealthEntry[]>('/api/entries', { token });

export const submitHealthEntry = (
  token: string,
  entry: Omit<HealthEntry, 'id' | 'userId' | 'hasAlert'>
) =>
  request<HealthEntry>('/api/entries', {
    method: 'POST',
    token,
    body: JSON.stringify(entry),
  });
