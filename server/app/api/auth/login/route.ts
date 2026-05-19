import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { loginSchema } from '@/lib/validation';
import { verifyPassword } from '@/lib/password';
import { signToken } from '@/lib/jwt';
import { toUserDto } from '@/lib/mappers';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const db = supabaseAdmin();

  const { data: user } = await db
    .from('users')
    .select('id,email,name,password_hash')
    .eq('email', email)
    .maybeSingle();
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const token = signToken({ userId: user.id, email: user.email });
  return NextResponse.json({ token, user: toUserDto(user) });
}
