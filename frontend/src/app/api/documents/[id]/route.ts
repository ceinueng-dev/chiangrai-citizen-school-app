import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyAuth(request, 'project_admin', 'staff_operator');
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    await execute('DELETE FROM official_documents WHERE id = ?', [Number(id)]);
    return NextResponse.json({ message: 'Document deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
