import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyAuth(request, 'project_admin', 'committee_member', 'staff_operator');
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const newsId = Number(id);

  try {
    const contentType = request.headers.get('content-type') || '';
    const updates: string[] = [];
    const updateParams: any[] = [];
    const images: string[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const title = formData.get('title');
      const summary = formData.get('summary');
      const event_date = formData.get('event_date');
      const status = formData.get('status');
      const show_on_landing = formData.get('show_on_landing');

      if (title !== null) {
        if (!String(title).trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        updates.push('title = ?');
        updateParams.push(String(title).trim());
      }
      if (summary !== null) {
        updates.push('summary = ?');
        updateParams.push(String(summary));
      }
      if (event_date !== null) {
        updates.push('event_date = ?');
        updateParams.push(String(event_date));
      }
      if (status !== null) {
        updates.push('status = ?');
        updateParams.push(String(status) === 'published' ? 'published' : 'draft');
      }
      if (show_on_landing !== null) {
        const val = String(show_on_landing);
        updates.push('show_on_landing = ?');
        updateParams.push(val === '1' || val === 'true' ? 1 : 0);
      }

      const fileEntries = formData.getAll('images');
      for (const entry of fileEntries) {
        if (entry instanceof File && entry.size > 0) {
          const buffer = Buffer.from(await entry.arrayBuffer());
          const mime = entry.type || 'image/jpeg';
          images.push(`data:${mime};base64,${buffer.toString('base64')}`);
        }
      }
    } else {
      const json = await request.json();
      if (json.title !== undefined) {
        if (!String(json.title).trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        updates.push('title = ?');
        updateParams.push(String(json.title).trim());
      }
      if (json.summary !== undefined) {
        updates.push('summary = ?');
        updateParams.push(String(json.summary));
      }
      if (json.event_date !== undefined) {
        updates.push('event_date = ?');
        updateParams.push(String(json.event_date));
      }
      if (json.status !== undefined) {
        updates.push('status = ?');
        updateParams.push(json.status === 'published' ? 'published' : 'draft');
      }
      if (json.show_on_landing !== undefined) {
        updates.push('show_on_landing = ?');
        updateParams.push(json.show_on_landing ? 1 : 0);
      }
      if (Array.isArray(json.images)) {
        images.push(...json.images);
      }
    }

    if (images.length > 0) {
      updates.push('image_data = ?');
      updateParams.push(images[0]);
      updates.push('image_data_list = ?');
      updateParams.push(JSON.stringify(images));
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    updateParams.push(newsId);
    await execute(`UPDATE news_updates SET ${updates.join(', ')} WHERE id = ?`, updateParams);

    return NextResponse.json({ message: 'News update changed' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyAuth(request, 'project_admin', 'committee_member', 'staff_operator');
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    await execute('DELETE FROM news_updates WHERE id = ?', [Number(id)]);
    return NextResponse.json({ message: 'News update deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
