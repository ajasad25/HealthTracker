export interface HealthEntry {
  id: string;
  userId: string;
  timestamp: string;
  heartRate: number;
  systolic: number;
  diastolic: number;
  spo2: number;
  temperature: number;
  symptoms: string[];
  notes?: string;
  hasAlert: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface HealthState {
  entries: HealthEntry[];
  isLoading: boolean;
  error: string | null;
}

export type VitalStatus = 'normal' | 'warning' | 'danger';

export interface AlertResult {
  hasAlert: boolean;
  messages: string[];
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  AddEntry: undefined;
  History: undefined;
};

export type HistoryStackParamList = {
  HistoryList: undefined;
  EntryDetail: { entryId: string };
};
