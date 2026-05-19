import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth, AuthError } from '@/lib/auth';
import { toUserDto } from '@/lib/mappers';

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const { data } = await supabaseAdmin()
      .from('users')
      .select('id,email,name')
      .eq('id', userId)
      .maybeSingle();
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
