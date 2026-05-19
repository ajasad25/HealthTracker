import { HEART_RATE, SPO2, TEMPERATURE } from './thresholds';

export interface VitalInput {
  heartRate: number;
  systolic: number;
  diastolic: number;
  spo2: number;
  temperature: number;
  symptoms: string[];
  notes?: string;
}

export interface AlertResult {
  hasAlert: boolean;
  messages: string[];
}

export function checkForAlerts(e: VitalInput): AlertResult {
  const messages: string[] = [];
  if (e.heartRate > HEART_RATE.alertAbove) messages.push('Heart rate critically elevated');
  if (e.spo2 < SPO2.alertBelow) messages.push('Blood oxygen dangerously low');
  if (e.temperature > TEMPERATURE.alertAbove) messages.push('Fever detected');
  return { hasAlert: messages.length > 0, messages };
}
