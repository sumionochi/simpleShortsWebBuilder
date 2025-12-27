// /app/api/saveProgress/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/index';
import { progressSaved } from '@/lib/schema';

export async function POST(req: Request) {
  try {
    const progressData = await req.json();
    
    if (!progressData.profile_id) {
      return NextResponse.json({ error: 'Profile ID is required to save progress.' }, { status: 400 });
    }

    console.log("Received progressData:", progressData);

    const [insertedProgress] = await db
      .insert(progressSaved)
      .values(progressData)
      .returning({
        id: progressSaved.id,
        name: progressSaved.name,
      });

    console.log("Inserted data:", insertedProgress);
    return NextResponse.json({ message: 'Progress saved successfully.', progress: insertedProgress });
  } catch (error) {
    console.error('Error saving progress:', error);
    return NextResponse.json({ error: 'Failed to save progress.' }, { status: 500 });
  }
}
