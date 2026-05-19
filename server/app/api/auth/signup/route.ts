import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { signupSchema } from '@/lib/validation';
import { hashPassword } from '@/lib/password';
import { signToken } from '@/lib/jwt';
import { toUserDto } from '@/lib/mappers';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const { name, email, password } = parsed.data;
  const db = supabaseAdmin();

  const { data: existing } = await db
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  const password_hash = await hashPassword(password);
  const { data, error } = await db
    .from('users')
    .insert({ name, email, password_hash })
    .select('id,email,name')
    .single();
  if (error || !data) {
    return NextResponse.json({ error: 'Could not create user' }, { status: 500 });
  }

  const token = signToken({ userId: data.id, email: data.email });
  return NextResponse.json({ token, user: toUserDto(data) }, { status: 201 });
}
