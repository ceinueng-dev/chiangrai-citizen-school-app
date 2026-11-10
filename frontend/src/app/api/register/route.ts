import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { full_name, email, phone, line_contact, password, notes } = await request.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedName = String(full_name || '').trim();

    if (!normalizedName || !normalizedEmail || !password) {
      return NextResponse.json({ error: 'Full name, email and password are required' }, { status: 400 });
    }

    if (String(password).length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const passwordData = hashPassword(password);
    const result = await execute(
      `INSERT INTO app_users (full_name, email, phone, line_contact, role, status, password_hash, password_salt, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        normalizedName,
        normalizedEmail,
        phone || '',
        line_contact || '',
        'participant_learner',
        'inactive',
        passwordData.hash,
        passwordData.salt,
        notes || 'สมัครผ่านหน้า Register รอผู้ดูแลระบบอนุมัติ'
      ]
    );

    return NextResponse.json({ message: 'Registration submitted', id: result.lastID });
  } catch (error: any) {
    if (/unique/i.test(error.message || '')) {
      return NextResponse.json({ error: 'This email is already registered' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
