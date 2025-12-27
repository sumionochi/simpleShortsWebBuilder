// /app/api/deleteProgress/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/index";
import { progressSaved } from "@/lib/schema";
import { eq } from "drizzle-orm/expressions";

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const progressId = url.searchParams.get("id");

  if (!progressId) {
    return NextResponse.json({ error: "Progress ID is required." }, { status: 400 });
  }

  try {
    await db.delete(progressSaved).where(eq(progressSaved.id, progressId));
    return NextResponse.json({ message: "Progress deleted successfully." });
  } catch (error) {
    console.error("Error deleting progress:", error);
    return NextResponse.json({ error: "Failed to delete progress." }, { status: 500 });
  }
}
