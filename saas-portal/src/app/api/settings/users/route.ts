import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await db.user.findMany({
    select: { id: true, name: true, email: true, active: true, createdAt: true, role: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { password, ...data } = await req.json();
  if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: { ...data, password: hashed },
    select: { id: true, name: true, email: true, active: true, role: { select: { name: true } } },
  });

  return NextResponse.json(user, { status: 201 });
}
