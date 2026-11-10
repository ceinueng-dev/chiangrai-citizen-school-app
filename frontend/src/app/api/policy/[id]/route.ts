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
    const { status } = await request.json();
    await execute('UPDATE project_policies SET status = ? WHERE id = ?', [status, Number(id)]);
    return NextResponse.json({ message: 'Policy updated' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
