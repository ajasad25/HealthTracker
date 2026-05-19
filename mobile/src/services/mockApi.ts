import type { HealthEntry, User } from '../types';

const MOCK_DELAY = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

const mockUser: User = {
  id: 'user-001',
  name: 'Alex Johnson',
  email: 'alex@example.com',
};

function createSeedEntries(userId: string): HealthEntry[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  return [
    {
      id: 'entry-001',
      userId,
      timestamp: new Date(now - 0 * day).toISOString(),
      heartRate: 72,
      systolic: 120,
      diastolic: 80,
      spo2: 98,
      temperature: 36.6,
      symptoms: [],
      notes: 'Feeling great today',
      hasAlert: false,
    },
    {
      id: 'entry-002',
      userId,
      timestamp: new Date(now - 1 * day).toISOString(),
      heartRate: 130,
      systolic: 145,
      diastolic: 95,
      spo2: 96,
      temperature: 37.2,
      symptoms: ['Palpitations', 'Anxiety'],
      notes: 'After intense workout',
      hasAlert: true,
    },
    {
      id: 'entry-003',
      userId,
      timestamp: new Date(now - 2 * day).toISOString(),
      heartRate: 68,
      systolic: 118,
      diastolic: 76,
      spo2: 88,
      temperature: 36.8,
      symptoms: ['Shortness of Breath', 'Fatigue'],
      hasAlert: true,
    },
    {
      id: 'entry-004',
      userId,
      timestamp: new Date(now - 3 * day).toISOString(),
      heartRate: 75,
      systolic: 122,
      diastolic: 82,
      spo2: 97,
      temperature: 39.5,
      symptoms: ['Fever', 'Body Aches', 'Chills'],
      notes: 'Coming down with something',
      hasAlert: true,
    },
    {
      id: 'entry-005',
      userId,
      timestamp: new Date(now - 4 * day).toISOString(),
      heartRate: 70,
      systolic: 115,
      diastolic: 75,
      spo2: 99,
      temperature: 36.5,
      symptoms: [],
      hasAlert: false,
    },
    {
      id: 'entry-006',
      userId,
      timestamp: new Date(now - 5 * day).toISOString(),
      heartRate: 82,
      systolic: 130,
      diastolic: 85,
      spo2: 96,
      temperature: 36.9,
      symptoms: ['Headache'],
      hasAlert: false,
    },
    {
      id: 'entry-007',
      userId,
      timestamp: new Date(now - 6 * day).toISOString(),
      heartRate: 125,
      systolic: 150,
      diastolic: 98,
      spo2: 87,
      temperature: 39.8,
      symptoms: ['Fever', 'Chest Pain', 'Shortness of Breath', 'Dizziness'],
      notes: 'Went to urgent care',
      hasAlert: true,
    },
    {
      id: 'entry-008',
      userId,
      timestamp: new Date(now - 7 * day).toISOString(),
      heartRate: 66,
      systolic: 110,
      diastolic: 70,
      spo2: 98,
      temperature: 36.4,
      symptoms: [],
      notes: 'Good rest day',
      hasAlert: false,
    },
    {
      id: 'entry-009',
      userId,
      timestamp: new Date(now - 9 * day).toISOString(),
      heartRate: 78,
      systolic: 125,
      diastolic: 80,
      spo2: 95,
      temperature: 37.1,
      symptoms: ['Fatigue', 'Insomnia'],
      hasAlert: false,
    },
    {
      id: 'entry-010',
      userId,
      timestamp: new Date(now - 12 * day).toISOString(),
      heartRate: 71,
      systolic: 118,
      diastolic: 78,
      spo2: 97,
      temperature: 36.7,
      symptoms: ['Congestion', 'Sore Throat'],
      notes: 'Mild cold symptoms',
      hasAlert: false,
    },
  ];
}

export async function login(
  email: string,
  password: string
): Promise<{ user: User; token: string }> {
  await delay(MOCK_DELAY);

  if (password !== 'password123') {
    throw new Error('Invalid email or password');
  }

  return {
    user: { ...mockUser, email },
    token: 'mock-jwt-token-' + generateId(),
  };
}

export async function submitHealthEntry(
  entry: Omit<HealthEntry, 'id'>
): Promise<HealthEntry> {
  await delay(MOCK_DELAY);

  return {
    ...entry,
    id: generateId(),
  };
}

export async function fetchHealthHistory(userId: string): Promise<HealthEntry[]> {
  await delay(MOCK_DELAY);
  return createSeedEntries(userId);
}
