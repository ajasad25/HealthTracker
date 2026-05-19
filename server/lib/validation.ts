import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const entrySchema = z.object({
  heartRate: z.number().min(40).max(200),
  systolic: z.number().min(50).max(250),
  diastolic: z.number().min(30).max(150),
  spo2: z.number().min(70).max(100),
  temperature: z.number().min(34).max(42),
  symptoms: z.array(z.string()),
  notes: z.string().max(500).optional(),
  timestamp: z.string().optional(),
});
