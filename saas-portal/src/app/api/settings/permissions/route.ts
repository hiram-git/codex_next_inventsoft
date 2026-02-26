import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const permissions = await db.permission.findMany({ orderBy: [{ module: "asc" }, { action: "asc" }] });
  return NextResponse.json(permissions);
}
