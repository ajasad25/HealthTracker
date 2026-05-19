import { checkForAlerts } from '../lib/alertLogic';

test('flags high heart rate', () => {
  const r = checkForAlerts({ heartRate: 130, systolic: 120, diastolic: 80, spo2: 98, temperature: 36.6, symptoms: [] });
  expect(r.hasAlert).toBe(true);
  expect(r.messages).toContain('Heart rate critically elevated');
});

test('no alert for normal vitals', () => {
  const r = checkForAlerts({ heartRate: 72, systolic: 120, diastolic: 80, spo2: 98, temperature: 36.6, symptoms: [] });
  expect(r.hasAlert).toBe(false);
  expect(r.messages).toEqual([]);
});

test('flags low spo2 and fever together', () => {
  const r = checkForAlerts({ heartRate: 70, systolic: 110, diastolic: 70, spo2: 85, temperature: 39.6, symptoms: [] });
  expect(r.messages).toEqual(['Blood oxygen dangerously low', 'Fever detected']);
});
