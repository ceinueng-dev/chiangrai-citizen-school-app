import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const timeline = await query('SELECT * FROM process_timeline ORDER BY activity_order ASC');
    return NextResponse.json(timeline);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
