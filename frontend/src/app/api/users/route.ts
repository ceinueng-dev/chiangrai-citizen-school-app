import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { verifyAuth, validRoles, validStatuses, hashPassword } from '@/lib/auth';

export async function GET(request: Request) {
  const auth = verifyAuth(request, 'super_admin');
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const users = await query(`
      SELECT id, full_name, email, phone, line_contact, role, status, notes, created_at 
      FROM app_users 
      ORDER BY status ASC, role ASC, full_name ASC
    `);
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = verifyAuth(request, 'super_admin');
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { full_name, email, phone, line_contact, role, status, password, notes } = await request.json();
    const normalizedRole = validRoles.includes(role) ? role : 'public_viewer';
    const normalizedStatus = validStatuses.includes(status) ? status : 'active';

    if (!full_name || !email) {
      return NextResponse.json({ error: 'Full name and email are required' }, { status: 400 });
    }

    const passwordData = hashPassword(password || 'ChangeMe123!');
    const result = await execute(
      `INSERT INTO app_users (full_name, email, phone, line_contact, role, status, password_hash, password_salt, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, email, phone || '', line_contact || '', normalizedRole, normalizedStatus, passwordData.hash, passwordData.salt, notes || '']
    );

    return NextResponse.json({ message: 'User created', id: result.lastID });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
