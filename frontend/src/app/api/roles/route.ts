import { NextResponse } from 'next/server';
import { userRoles } from '@/lib/auth';

export async function GET() {
  return NextResponse.json(userRoles);
}
