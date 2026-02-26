import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roles = await db.role.findMany({
    include: { permissions: { include: { permission: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(roles);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { permissionIds, ...data } = await req.json();

  const role = await db.role.create({
    data: {
      ...data,
      permissions: {
        create: (permissionIds as string[]).map((permissionId: string) => ({ permissionId })),
      },
    },
    include: { permissions: { include: { permission: true } } },
  });

  return NextResponse.json(role, { status: 201 });
}
