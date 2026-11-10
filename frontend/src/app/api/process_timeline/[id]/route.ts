import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyAuth(request, 'project_admin');
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    const { start_month, end_month } = await request.json();
    const start = Math.max(0, Math.min(6, Number(start_month)));
    const end = Math.max(start, Math.min(6, Number(end_month)));

    await execute(
      'UPDATE process_timeline SET start_month = ?, end_month = ? WHERE id = ?',
      [start, end, Number(id)]
    );
    return NextResponse.json({ message: 'Timeline updated' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
