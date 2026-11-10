import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: Request) {
  const auth = verifyAuth(request, 'project_admin', 'staff_operator');
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { student_id, hours, date } = await request.json();
    if (!student_id || !hours || !date) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const result = await execute(
      'INSERT INTO attendance (student_id, date, hours_logged) VALUES (?, ?, ?)',
      [student_id, date, hours]
    );

    await execute(
      'UPDATE students SET total_hours = total_hours + ? WHERE id = ?',
      [hours, student_id]
    );

    return NextResponse.json({ message: 'Attendance logged', id: result.lastID });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
