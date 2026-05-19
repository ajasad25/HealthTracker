import { format, isToday } from 'date-fns';
import type { VitalStatus } from '../types';
import { HEART_RATE, SPO2, TEMPERATURE } from '../constants/thresholds';

export function formatDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }
  return format(date, 'MMM d, yyyy h:mm a');
}

export function formatDate(timestamp: string): string {
  return format(new Date(timestamp), 'MMM d, yyyy');
}

export function formatTime(timestamp: string): string {
  return format(new Date(timestamp), 'h:mm a');
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function getHeartRateStatus(value: number): VitalStatus {
  if (value > HEART_RATE.alertAbove) return 'danger';
  if (value > 100) return 'warning';
  return 'normal';
}

export function getSpo2Status(value: number): VitalStatus {
  if (value < SPO2.alertBelow) return 'danger';
  if (value < 94) return 'warning';
  return 'normal';
}

export function getTemperatureStatus(value: number): VitalStatus {
  if (value > TEMPERATURE.alertAbove) return 'danger';
  if (value > 37.5) return 'warning';
  return 'normal';
}

export function getBloodPressureStatus(systolic: number, diastolic: number): VitalStatus {
  if (systolic > 180 || diastolic > 120) return 'danger';
  if (systolic > 140 || diastolic > 90) return 'warning';
  return 'normal';
}
