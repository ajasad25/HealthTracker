import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth';
import { entrySchema } from '@/lib/validation';
import { checkForAlerts } from '@/lib/alertLogic';
import { toEntryDto } from '@/lib/mappers';

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const data = await prisma.healthEntry.findMany({
      where: { user_id: userId },
      orderBy: { timestamp: 'desc' },
    });
    return NextResponse.json(data.map(toEntryDto));
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
    const data = await prisma.healthEntry
      .create({
        data: {
          user_id: userId,
          timestamp: v.timestamp ? new Date(v.timestamp) : new Date(),
          heart_rate: v.heartRate,
          systolic: v.systolic,
          diastolic: v.diastolic,
          spo2: v.spo2,
          temperature: v.temperature,
          symptoms: v.symptoms,
          notes: v.notes ?? null,
          has_alert: hasAlert,
        },
      })
      .catch(() => null);
    if (!data) {
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
