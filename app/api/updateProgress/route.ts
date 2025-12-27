// /app/api/updateProgress/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/index";
import { progressSaved } from "@/lib/schema";
import { eq } from "drizzle-orm/expressions";

export async function PUT(req: Request) {
  const url = new URL(req.url);
  const progressId = url.searchParams.get("id");

  if (!progressId) {
    return NextResponse.json(
      { error: "Progress ID is required." },
      { status: 400 }
    );
  }

  try {
    const progressData = await req.json();

    if ("id" in progressData) {
      delete progressData.id;
    }

    await db
      .update(progressSaved)
      .set(progressData)
      .where(eq(progressSaved.id, progressId));

    return NextResponse.json({ message: "Progress updated successfully." });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress." },
      { status: 500 }
    );
  }
}
