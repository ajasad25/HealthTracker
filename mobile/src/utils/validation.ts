import { z } from 'zod';
import { HEART_RATE, SPO2, TEMPERATURE, BLOOD_PRESSURE } from '../constants/thresholds';

export const healthEntrySchema = z.object({
  heartRate: z
    .number({ message: 'Heart rate is required' })
    .min(HEART_RATE.min, `Must be at least ${HEART_RATE.min}`)
    .max(HEART_RATE.max, `Must be at most ${HEART_RATE.max}`),
  systolic: z
    .number({ message: 'Systolic is required' })
    .min(BLOOD_PRESSURE.systolic.min, `Must be at least ${BLOOD_PRESSURE.systolic.min}`)
    .max(BLOOD_PRESSURE.systolic.max, `Must be at most ${BLOOD_PRESSURE.systolic.max}`),
  diastolic: z
    .number({ message: 'Diastolic is required' })
    .min(BLOOD_PRESSURE.diastolic.min, `Must be at least ${BLOOD_PRESSURE.diastolic.min}`)
    .max(BLOOD_PRESSURE.diastolic.max, `Must be at most ${BLOOD_PRESSURE.diastolic.max}`),
  spo2: z
    .number({ message: 'SpO2 is required' })
    .min(SPO2.min, `Must be at least ${SPO2.min}`)
    .max(SPO2.max, `Must be at most ${SPO2.max}`),
  temperature: z
    .number({ message: 'Temperature is required' })
    .min(TEMPERATURE.min, `Must be at least ${TEMPERATURE.min}`)
    .max(TEMPERATURE.max, `Must be at most ${TEMPERATURE.max}`),
  symptoms: z.array(z.string()),
  notes: z.string().max(500, 'Notes must be 500 characters or fewer').optional(),
});

export type HealthEntryFormData = z.infer<typeof healthEntrySchema>;

export const loginSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .email('Invalid email format'),
  password: z
    .string({ message: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
