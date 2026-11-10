import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const rows = await query(`
      SELECT 
        a.*, 
        e.amount as expense_amount, e.description as expense_desc, e.category_id, c.name as category_name,
        l.id as log_id, l.description as log_desc, l.photo_url, l.latitude, l.longitude, l.timestamp as log_time
      FROM activities a
      LEFT JOIN expenses e ON a.id = e.activity_id
      LEFT JOIN budget_categories c ON e.category_id = c.id
      LEFT JOIN activity_logs l ON a.id = l.activity_id
      ORDER BY a.id ASC
    `);

    const activitiesMap: Record<string, any> = {};
    rows.forEach((row: any) => {
      if (!activitiesMap[row.id]) {
        activitiesMap[row.id] = {
          id: row.id,
          parent_id: row.parent_id,
          title: row.title,
          description: row.description,
          allocated_budget: row.allocated_budget || 0,
          expenses: [],
          logs: [],
          sub_activities: [],
          total_expense: 0
        };
      }

      if (row.expense_amount && !activitiesMap[row.id].expenses.find((e: any) => e.description === row.expense_desc && e.amount === row.expense_amount)) {
        activitiesMap[row.id].expenses.push({
          amount: row.expense_amount,
          description: row.expense_desc,
          category_id: row.category_id,
          category_name: row.category_name
        });
        activitiesMap[row.id].total_expense += Number(row.expense_amount || 0);
      }

      if (row.log_id && !activitiesMap[row.id].logs.find((l: any) => l.id === row.log_id)) {
        activitiesMap[row.id].logs.push({
          id: row.log_id,
          description: row.log_desc,
          photo_url: row.photo_url,
          latitude: row.latitude,
          longitude: row.longitude,
          timestamp: row.log_time
        });
      }
    });

    const rootActivities: any[] = [];
    Object.values(activitiesMap).forEach((activity: any) => {
      if (activity.parent_id) {
        if (activitiesMap[activity.parent_id]) {
          activitiesMap[activity.parent_id].sub_activities.push(activity);
        }
      } else {
        rootActivities.push(activity);
      }
    });

    return NextResponse.json(rootActivities);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
