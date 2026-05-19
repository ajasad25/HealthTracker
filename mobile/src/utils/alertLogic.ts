import { HEART_RATE, SPO2, TEMPERATURE } from '../constants/thresholds';
import type { AlertResult } from '../types';

interface VitalInput {
  heartRate: number;
  systolic: number;
  diastolic: number;
  spo2: number;
  temperature: number;
  symptoms: string[];
  notes?: string;
}

export function checkForAlerts(entry: VitalInput): AlertResult {
  const messages: string[] = [];

  if (entry.heartRate > HEART_RATE.alertAbove) {
    messages.push('Heart rate critically elevated');
  }

  if (entry.spo2 < SPO2.alertBelow) {
    messages.push('Blood oxygen dangerously low');
  }

  if (entry.temperature > TEMPERATURE.alertAbove) {
    messages.push('Fever detected');
  }

  return {
    hasAlert: messages.length > 0,
    messages,
  };
}
