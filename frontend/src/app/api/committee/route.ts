import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const committee = await query('SELECT * FROM committee_members ORDER BY display_order ASC, id ASC');
    return NextResponse.json(committee);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
