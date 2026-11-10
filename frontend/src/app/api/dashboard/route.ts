import { NextResponse } from 'next/server';
import { query, getOne } from '@/lib/db';

export async function GET() {
  try {
    const [info, budget, students, policies, documents] = await Promise.all([
      getOne('SELECT * FROM project_info LIMIT 1'),
      query('SELECT * FROM budget_categories ORDER BY id ASC'),
      query('SELECT * FROM students ORDER BY id ASC'),
      query('SELECT * FROM project_policies ORDER BY id ASC'),
      query('SELECT * FROM official_documents ORDER BY date DESC')
    ]);

    return NextResponse.json({
      info,
      budget,
      students,
      policies,
      documents
    });
  } catch (error: any) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
