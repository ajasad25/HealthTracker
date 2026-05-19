import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth, AuthError } from '@/lib/auth';
import { entrySchema } from '@/lib/validation';
import { checkForAlerts } from '@/lib/alertLogic';
import { toEntryDto } from '@/lib/mappers';

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const { data, error } = await supabaseAdmin()
      .from('health_entries')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    if (error) {
      return NextResponse.json({ error: 'Could not load entries' }, { status: 500 });
    }
    return NextResponse.json((data ?? []).map(toEntryDto));
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const body = await req.json().catch(() => null);
    const parsed = entrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const v = parsed.data;
    const { hasAlert } = checkForAlerts(v);
    const { data, error } = await supabaseAdmin()
      .from('health_entries')
      .insert({
        user_id: userId,
        timestamp: v.timestamp ?? new Date().toISOString(),
        heart_rate: v.heartRate,
        systolic: v.systolic,
        diastolic: v.diastolic,
        spo2: v.spo2,
        temperature: v.temperature,
        symptoms: v.symptoms,
        notes: v.notes ?? null,
        has_alert: hasAlert,
      })
      .select('*')
      .single();
    if (error || !data) {
      return NextResponse.json({ error: 'Could not save entry' }, { status: 500 });
    }
    return NextResponse.json(toEntryDto(data), { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
