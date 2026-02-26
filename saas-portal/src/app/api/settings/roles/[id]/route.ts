import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { permissionIds, ...data } = await req.json();

  // Replace permissions
  await db.rolePermission.deleteMany({ where: { roleId: id } });

  const role = await db.role.update({
    where: { id },
    data: {
      ...data,
      permissions: {
        create: (permissionIds as string[]).map((permissionId: string) => ({ permissionId })),
      },
    },
    include: { permissions: { include: { permission: true } } },
  });

  return NextResponse.json(role);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.role.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
