import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { password, ...data } = await req.json();

  const updateData = password
    ? { ...data, password: await bcrypt.hash(password, 12) }
    : data;

  const user = await db.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, active: true, role: { select: { name: true } } },
  });

  return NextResponse.json(user);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
