import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  try {
    const docs = await query('SELECT * FROM official_documents ORDER BY date DESC');
    return NextResponse.json(docs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = verifyAuth(request, 'project_admin', 'staff_operator');
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const contentType = request.headers.get('content-type') || '';
    let title = '';
    let document_type = 'official';
    let doc_number = '';
    let date = '';
    let to_agency = '';
    let status = 'ส่งแล้ว';
    let file_url: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      title = String(formData.get('title') || '');
      document_type = String(formData.get('document_type') || 'official');
      doc_number = String(formData.get('doc_number') || '');
      date = String(formData.get('date') || '');
      to_agency = String(formData.get('to_agency') || '');
      status = String(formData.get('status') || 'ส่งแล้ว');

      const file = formData.get('file');
      if (file instanceof File && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const mime = file.type || 'application/octet-stream';
        file_url = `data:${mime};base64,${buffer.toString('base64')}`;
      }
    } else {
      const json = await request.json();
      title = json.title;
      document_type = json.document_type || 'official';
      doc_number = json.doc_number || '';
      date = json.date || '';
      to_agency = json.to_agency || '';
      status = json.status || 'ส่งแล้ว';
      file_url = json.file_url || null;
    }

    const result = await execute(
      'INSERT INTO official_documents (title, document_type, doc_number, date, to_agency, file_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, document_type, doc_number, date, to_agency, file_url, status]
    );

    return NextResponse.json({ message: 'Document logged', id: result.lastID });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
