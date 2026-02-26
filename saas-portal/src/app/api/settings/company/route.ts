import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const company = await db.company.findFirst();
  return NextResponse.json(company ?? {});
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const existing = await db.company.findFirst();

  let company;
  if (existing) {
    company = await db.company.update({ where: { id: existing.id }, data });
  } else {
    company = await db.company.create({ data });
  }

  return NextResponse.json(company);
}
