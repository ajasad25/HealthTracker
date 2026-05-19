import { healthEntrySchema, loginSchema } from '../utils/validation';

describe('healthEntrySchema', () => {
  const validEntry = {
    heartRate: 72,
    systolic: 120,
    diastolic: 80,
    spo2: 98,
    temperature: 36.6,
    symptoms: [],
    notes: '',
  };

  it('accepts a valid entry', () => {
    const result = healthEntrySchema.safeParse(validEntry);
    expect(result.success).toBe(true);
  });

  it('rejects heart rate below minimum (40)', () => {
    const result = healthEntrySchema.safeParse({ ...validEntry, heartRate: 30 });
    expect(result.success).toBe(false);
  });

  it('rejects heart rate above maximum (200)', () => {
    const result = healthEntrySchema.safeParse({ ...validEntry, heartRate: 210 });
    expect(result.success).toBe(false);
  });

  it('accepts heart rate at minimum boundary (40)', () => {
    const result = healthEntrySchema.safeParse({ ...validEntry, heartRate: 40 });
    expect(result.success).toBe(true);
  });

  it('accepts heart rate at maximum boundary (200)', () => {
    const result = healthEntrySchema.safeParse({ ...validEntry, heartRate: 200 });
    expect(result.success).toBe(true);
  });

  it('rejects systolic below minimum (50)', () => {
    const result = healthEntrySchema.safeParse({ ...validEntry, systolic: 40 });
    expect(result.success).toBe(false);
  });

  it('rejects systolic above maximum (250)', () => {
    const result = healthEntrySchema.safeParse({ ...validEntry, systolic: 260 });
    expect(result.success).toBe(false);
  });

  it('rejects diastolic below minimum (30)', () => {
    const result = healthEntrySchema.safeParse({ ...validEntry, diastolic: 20 });
    expect(result.success).toBe(false);
  });

  it('rejects diastolic above maximum (150)', () => {
    const result = healthEntrySchema.safeParse({ ...validEntry, diastolic: 160 });
    expect(result.success).toBe(false);
  });

  it('rejects SpO2 below minimum (70)', () => {
    const result = healthEntrySchema.safeParse({ ...validEntry, spo2: 60 });
    expect(result.success).toBe(false);
  });

  it('rejects SpO2 above maximum (100)', () => {
    const result = healthEntrySchema.safeParse({ ...validEntry, spo2: 105 });
    expect(result.success).toBe(false);
  });

  it('rejects temperature below minimum (34)', () => {
    const result = healthEntrySchema.safeParse({ ...validEntry, temperature: 33 });
    expect(result.success).toBe(false);
  });

  it('rejects temperature above maximum (42)', () => {
    const result = healthEntrySchema.safeParse({ ...validEntry, temperature: 43 });
    expect(result.success).toBe(false);
  });

  it('rejects notes longer than 500 characters', () => {
    const result = healthEntrySchema.safeParse({
      ...validEntry,
      notes: 'a'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('accepts notes at exactly 500 characters', () => {
    const result = healthEntrySchema.safeParse({
      ...validEntry,
      notes: 'a'.repeat(500),
    });
    expect(result.success).toBe(true);
  });

  it('accepts entry without optional notes', () => {
    const { notes, ...entryWithoutNotes } = validEntry;
    const result = healthEntrySchema.safeParse(entryWithoutNotes);
    expect(result.success).toBe(true);
  });
});

describe('loginSchema', () => {
  it('accepts valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email format', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty email', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 6 characters', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('accepts password at exactly 6 characters', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '123456',
    });
    expect(result.success).toBe(true);
  });
});
