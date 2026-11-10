import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: Request) {
  const auth = verifyAuth(request, 'project_admin', 'staff_operator');
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const contentType = request.headers.get('content-type') || '';
    let activity_id = 0;
    let description = '';
    let latitude: number | null = null;
    let longitude: number | null = null;
    let photo_url: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      activity_id = Number(formData.get('activity_id') || 0);
      description = String(formData.get('description') || '');
      const latVal = formData.get('latitude');
      const lngVal = formData.get('longitude');
      latitude = latVal ? parseFloat(String(latVal)) : null;
      longitude = lngVal ? parseFloat(String(lngVal)) : null;

      const photo = formData.get('photo');
      if (photo instanceof File && photo.size > 0) {
        const buffer = Buffer.from(await photo.arrayBuffer());
        const mime = photo.type || 'image/jpeg';
        photo_url = `data:${mime};base64,${buffer.toString('base64')}`;
      }
    } else {
      const json = await request.json();
      activity_id = Number(json.activity_id || 0);
      description = json.description || '';
      latitude = json.latitude || null;
      longitude = json.longitude || null;
      photo_url = json.photo_url || null;
    }

    const result = await execute(
      'INSERT INTO activity_logs (activity_id, description, photo_url, latitude, longitude) VALUES (?, ?, ?, ?, ?)',
      [activity_id, description, photo_url, latitude, longitude]
    );

    return NextResponse.json({ message: 'Log recorded', id: result.lastID });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
