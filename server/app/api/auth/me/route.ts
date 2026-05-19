import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth';
import { toUserDto } from '@/lib/mappers';

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const data = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });
    if (!data) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }
    return NextResponse.json({ user: toUserDto(data) });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
