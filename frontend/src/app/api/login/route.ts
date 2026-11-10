import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getOne } from '@/lib/db';
import { hashPassword, sanitizeUser, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await getOne<any>('SELECT * FROM app_users WHERE lower(email) = lower(?)', [email]);
    if (!user || user.status !== 'active' || !user.password_hash || !user.password_salt) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const candidate = hashPassword(password, user.password_salt).hash;
    const valid = crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(user.password_hash, 'hex'));
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    return NextResponse.json({
      user: sanitizeUser(user),
      token: signToken(user)
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
