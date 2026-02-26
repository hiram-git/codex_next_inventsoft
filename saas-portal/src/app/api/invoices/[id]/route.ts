import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const invoice = await db.invoice.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, customer: true },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { items, subtotal, tax, total, ...rest } = await req.json();

  // Delete old items and recreate
  await db.invoiceItem.deleteMany({ where: { invoiceId: id } });

  const invoice = await db.invoice.update({
    where: { id },
    data: {
      ...rest,
      subtotal,
      tax,
      total,
      items: {
        create: items.map((item: { productId?: string; description: string; quantity: number; unitPrice: number }) => ({
          productId: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice,
        })),
      },
    },
    include: { items: true },
  });
  return NextResponse.json(invoice);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const data = await req.json();
  const invoice = await db.invoice.update({ where: { id }, data });
  return NextResponse.json(invoice);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.invoice.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
