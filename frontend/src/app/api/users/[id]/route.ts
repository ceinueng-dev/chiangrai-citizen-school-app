import { NextResponse } from 'next/server';
import { execute, getOne } from '@/lib/db';
import { verifyAuth, validRoles, validStatuses, hashPassword } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyAuth(request, 'super_admin');
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const userId = Number(id);

  try {
    const { full_name, email, phone, line_contact, role, status, password, notes } = await request.json();
    const updates: string[] = [];
    const updateParams: any[] = [];

    if (status === 'inactive' && auth.user?.id === userId) {
      return NextResponse.json({ error: 'You cannot deactivate your own active admin session' }, { status: 400 });
    }

    if (full_name !== undefined) {
      updates.push('full_name = ?');
      updateParams.push(full_name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      updateParams.push(email);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      updateParams.push(phone);
    }
    if (line_contact !== undefined) {
      updates.push('line_contact = ?');
      updateParams.push(line_contact);
    }
    if (validRoles.includes(role)) {
      updates.push('role = ?');
      updateParams.push(role);
    }
    if (validStatuses.includes(status)) {
      updates.push('status = ?');
      updateParams.push(status);
    }
    if (password !== undefined && password !== '') {
      const passwordData = hashPassword(password);
      updates.push('password_hash = ?');
      updateParams.push(passwordData.hash);
      updates.push('password_salt = ?');
      updateParams.push(passwordData.salt);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      updateParams.push(notes);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    updateParams.push(userId);
    await execute(`UPDATE app_users SET ${updates.join(', ')} WHERE id = ?`, updateParams);

    const user = await getOne(
      'SELECT id, full_name, email, phone, line_contact, role, status, notes, created_at FROM app_users WHERE id = ?',
      [userId]
    );

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ message: 'User updated', user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
