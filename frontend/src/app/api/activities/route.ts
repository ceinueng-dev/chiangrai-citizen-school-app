import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  try {
    const activities = await query('SELECT * FROM activities ORDER BY id ASC');
    return NextResponse.json(activities);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = verifyAuth(request, 'project_admin', 'staff_operator');
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { title, description, parent_id, allocated_budget } = await request.json();
    const result = await execute(
      'INSERT INTO activities (title, description, parent_id, allocated_budget) VALUES (?, ?, ?, ?)',
      [title, description, parent_id, allocated_budget || 0]
    );

    return NextResponse.json({ message: 'Activity created', id: result.lastID });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
