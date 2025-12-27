// /app/api/loadProgress/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/index';
import { progressSaved } from '@/lib/schema';
import { eq } from 'drizzle-orm/expressions';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
  }

  try {
    const [progressData] = await db
      .select()
      .from(progressSaved)
      .where(eq(progressSaved.id, id));

    if (progressData) {
      return NextResponse.json(progressData);
    } else {
      return NextResponse.json({ error: 'Progress not found.' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error loading progress:', error);
    return NextResponse.json({ error: 'Failed to load progress.' }, { status: 500 });
  }
}
