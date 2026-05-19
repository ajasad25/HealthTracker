export interface EntryRow {
  id: string;
  user_id: string;
  timestamp: string | Date;
  heart_rate: number;
  systolic: number;
  diastolic: number;
  spo2: number;
  temperature: number | { toString(): string };
  symptoms: string[];
  notes: string | null;
  has_alert: boolean;
}

export function toEntryDto(r: EntryRow) {
  return {
    id: r.id,
    userId: r.user_id,
    timestamp:
      r.timestamp instanceof Date ? r.timestamp.toISOString() : r.timestamp,
    heartRate: r.heart_rate,
    systolic: r.systolic,
    diastolic: r.diastolic,
    spo2: r.spo2,
    temperature: Number(r.temperature),
    symptoms: r.symptoms,
    notes: r.notes ?? undefined,
    hasAlert: r.has_alert,
  };
}

export function toUserDto(r: { id: string; email: string; name: string }) {
  return { id: r.id, email: r.email, name: r.name };
}
