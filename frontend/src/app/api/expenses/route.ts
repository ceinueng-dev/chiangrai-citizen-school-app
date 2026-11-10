import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: Request) {
  const auth = verifyAuth(request, 'project_admin', 'staff_operator');
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { category_id, activity_id, amount, description, date } = await request.json();

    const result = await execute(
      'INSERT INTO expenses (category_id, activity_id, amount, description, date) VALUES (?, ?, ?, ?, ?)',
      [category_id, activity_id, amount, description, date]
    );

    await execute(
      'UPDATE budget_categories SET spent_amount = spent_amount + ? WHERE id = ?',
      [amount, category_id]
    );

    return NextResponse.json({ message: 'Expense added', id: result.lastID });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
