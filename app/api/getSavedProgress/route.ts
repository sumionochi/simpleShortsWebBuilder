// /app/api/getProgressByProfile/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/index';
import { progressSaved } from '@/lib/schema';
import { eq } from 'drizzle-orm/expressions';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const profileId = url.searchParams.get('profile_id');

  if (!profileId) {
    return NextResponse.json({ error: 'Profile ID is required to fetch progress.' }, { status: 400 });
  }

  try {
    const progressList = await db
      .select()
      .from(progressSaved)
      .where(eq(progressSaved.profile_id, profileId));

    if (progressList.length === 0) {
      return NextResponse.json({ message: 'No progress saved yet.' });
    }

    return NextResponse.json({ progressList });
  } catch (error) {
    console.error('Error fetching progress by profile:', error);
    return NextResponse.json({ error: 'Failed to fetch progress.' }, { status: 500 });
  }
}



