import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const landing = searchParams.get('landing');

    const filters: string[] = [];
    const params: any[] = [];

    if (status) {
      filters.push('status = ?');
      params.push(status);
    }

    if (landing === 'true') {
      filters.push('show_on_landing = ?');
      params.push(1);
    }

    const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const news = await query(
      `SELECT * FROM news_updates ${where} ORDER BY event_date DESC, created_at DESC, id DESC`,
      params
    );

    return NextResponse.json(news);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = verifyAuth(request, 'project_admin', 'committee_member', 'staff_operator');
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const contentType = request.headers.get('content-type') || '';
    let title = '';
    let summary = '';
    let event_date = '';
    let status = 'draft';
    let show_on_landing = 0;
    const images: string[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      title = String(formData.get('title') || '');
      summary = String(formData.get('summary') || '');
      event_date = String(formData.get('event_date') || new Date().toISOString().split('T')[0]);
      status = String(formData.get('status')) === 'published' ? 'published' : 'draft';
      const landingVal = String(formData.get('show_on_landing'));
      show_on_landing = landingVal === 'true' || landingVal === '1' ? 1 : 0;

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
      title = json.title;
      summary = json.summary || '';
      event_date = json.event_date || new Date().toISOString().split('T')[0];
      status = json.status === 'published' ? 'published' : 'draft';
      show_on_landing = json.show_on_landing ? 1 : 0;
      if (Array.isArray(json.images)) {
        images.push(...json.images);
      }
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const image_data = images[0] || null;
    const image_data_list = images.length > 0 ? JSON.stringify(images) : null;

    const result = await execute(
      `INSERT INTO news_updates (title, summary, event_date, status, show_on_landing, image_data, image_data_list)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        summary,
        event_date,
        status,
        show_on_landing,
        image_data,
        image_data_list
      ]
    );

    return NextResponse.json({ message: 'News update created', id: result.lastID });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
