import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoices = await db.invoice.findMany({
    include: { customer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items, subtotal, tax, total, ...rest } = await req.json();

  const invoice = await db.invoice.create({
    data: {
      ...rest,
      subtotal,
      tax,
      total,
      items: {
        create: items.map((item: { productId?: string; description: string; quantity: number; unitPrice: number; subtotal?: number }) => ({
          productId: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice,
        })),
      },
    },
    include: { items: true, customer: true },
  });

  return NextResponse.json(invoice, { status: 201 });
}
