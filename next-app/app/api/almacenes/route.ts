import { NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { almacenes } from '@/db/schema';

export async function GET() {
  const rows = await db.select().from(almacenes).orderBy(asc(almacenes.nombre));
  return NextResponse.json(rows.map((row) => ({ ...row, id: String(row.id) })));
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    nombre?: string;
    descripcion?: string;
    ubicacion?: string;
    activo?: boolean;
  };

  if (!body.nombre?.trim()) {
    return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
  }

  const rows = await db
    .insert(almacenes)
    .values({
      nombre: body.nombre.trim(),
      descripcion: body.descripcion?.trim() ?? '',
      ubicacion: body.ubicacion?.trim() ?? '',
      activo: body.activo ?? true,
    })
    .returning();

  return NextResponse.json({ ...rows[0], id: String(rows[0].id) }, { status: 201 });
}
