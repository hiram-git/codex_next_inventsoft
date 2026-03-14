import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { almacenes } from '@/db/schema';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as {
    nombre?: string;
    descripcion?: string;
    ubicacion?: string;
    activo?: boolean;
  };

  const rows = await db
    .update(almacenes)
    .set({
      nombre: body.nombre?.trim(),
      descripcion: body.descripcion?.trim(),
      ubicacion: body.ubicacion?.trim(),
      activo: body.activo,
    })
    .where(eq(almacenes.id, Number(id)))
    .returning();

  if (!rows[0]) {
    return NextResponse.json({ error: 'Almacén no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ ...rows[0], id: String(rows[0].id) });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const rows = await db.delete(almacenes).where(eq(almacenes.id, Number(id))).returning();

  if (!rows[0]) {
    return NextResponse.json({ error: 'Almacén no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
