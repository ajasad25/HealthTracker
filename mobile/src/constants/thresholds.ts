export const HEART_RATE = {
  min: 40,
  max: 200,
  alertAbove: 120,
  unit: 'bpm',
  label: 'Heart Rate',
} as const;

export const SPO2 = {
  min: 70,
  max: 100,
  alertBelow: 90,
  unit: '%',
  label: 'Blood Oxygen',
} as const;

export const TEMPERATURE = {
  min: 34,
  max: 42,
  alertAbove: 39,
  unit: '°C',
  label: 'Temperature',
} as const;

export const BLOOD_PRESSURE = {
  systolic: { min: 50, max: 250, label: 'Systolic' },
  diastolic: { min: 30, max: 150, label: 'Diastolic' },
  unit: 'mmHg',
  label: 'Blood Pressure',
} as const;
