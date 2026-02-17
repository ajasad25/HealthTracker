import { checkForAlerts } from '../utils/alertLogic';

const baseEntry = {
  heartRate: 72,
  systolic: 120,
  diastolic: 80,
  spo2: 98,
  temperature: 36.6,
  symptoms: [],
};

describe('checkForAlerts', () => {
  it('returns no alerts for normal vitals', () => {
    const result = checkForAlerts(baseEntry);
    expect(result.hasAlert).toBe(false);
    expect(result.messages).toHaveLength(0);
  });

  it('triggers alert when heart rate exceeds 120', () => {
    const result = checkForAlerts({ ...baseEntry, heartRate: 130 });
    expect(result.hasAlert).toBe(true);
    expect(result.messages).toContain('Heart rate critically elevated');
  });

  it('does not trigger alert at exactly 120 heart rate', () => {
    const result = checkForAlerts({ ...baseEntry, heartRate: 120 });
    expect(result.hasAlert).toBe(false);
  });

  it('triggers alert when SpO2 falls below 90', () => {
    const result = checkForAlerts({ ...baseEntry, spo2: 88 });
    expect(result.hasAlert).toBe(true);
    expect(result.messages).toContain('Blood oxygen dangerously low');
  });

  it('does not trigger alert at exactly 90 SpO2', () => {
    const result = checkForAlerts({ ...baseEntry, spo2: 90 });
    expect(result.hasAlert).toBe(false);
  });

  it('triggers alert when temperature exceeds 39', () => {
    const result = checkForAlerts({ ...baseEntry, temperature: 39.5 });
    expect(result.hasAlert).toBe(true);
    expect(result.messages).toContain('Fever detected');
  });

  it('does not trigger alert at exactly 39 temperature', () => {
    const result = checkForAlerts({ ...baseEntry, temperature: 39 });
    expect(result.hasAlert).toBe(false);
  });

  it('triggers multiple alerts simultaneously', () => {
    const result = checkForAlerts({
      ...baseEntry,
      heartRate: 150,
      spo2: 85,
      temperature: 40,
    });
    expect(result.hasAlert).toBe(true);
    expect(result.messages).toHaveLength(3);
    expect(result.messages).toContain('Heart rate critically elevated');
    expect(result.messages).toContain('Blood oxygen dangerously low');
    expect(result.messages).toContain('Fever detected');
  });

  it('triggers only relevant alerts', () => {
    const result = checkForAlerts({
      ...baseEntry,
      heartRate: 130,
      spo2: 95,
      temperature: 40,
    });
    expect(result.hasAlert).toBe(true);
    expect(result.messages).toHaveLength(2);
    expect(result.messages).toContain('Heart rate critically elevated');
    expect(result.messages).toContain('Fever detected');
    expect(result.messages).not.toContain('Blood oxygen dangerously low');
  });
});
