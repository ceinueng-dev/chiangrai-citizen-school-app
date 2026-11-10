import { NextResponse } from 'next/server';
import { execute, getOne } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyAuth(request, 'project_admin', 'committee_member');
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const memberId = Number(id);

  try {
    const contentType = request.headers.get('content-type') || '';
    let phone = '';
    let email = '';
    let line_contact = '';
    let bio = '';
    let photo_data: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      phone = String(formData.get('phone') || '');
      email = String(formData.get('email') || '');
      line_contact = String(formData.get('line_contact') || '');
      bio = String(formData.get('bio') || '');

      const photo = formData.get('photo');
      if (photo instanceof File && photo.size > 0) {
        const buffer = Buffer.from(await photo.arrayBuffer());
        const mime = photo.type || 'image/jpeg';
        photo_data = `data:${mime};base64,${buffer.toString('base64')}`;
      }
    } else {
      const json = await request.json();
      phone = json.phone || '';
      email = json.email || '';
      line_contact = json.line_contact || '';
      bio = json.bio || '';
      photo_data = json.photo_data || null;
    }

    const member = await getOne('SELECT id FROM committee_members WHERE id = ?', [memberId]);
    if (!member) {
      return NextResponse.json({ error: 'Committee member not found' }, { status: 404 });
    }

    const updateParams: any[] = [phone, email, line_contact, bio];
    let sql = 'UPDATE committee_members SET phone = ?, email = ?, line_contact = ?, bio = ?';

    if (photo_data) {
      sql += ', photo_data = ?';
      updateParams.push(photo_data);
    }

    sql += ' WHERE id = ?';
    updateParams.push(memberId);

    await execute(sql, updateParams);
    return NextResponse.json({ message: 'Committee profile updated' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
