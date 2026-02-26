import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [customers, products, invoices] = await Promise.all([
    db.customer.count({ where: { active: true } }),
    db.product.count({ where: { active: true } }),
    db.invoice.count(),
    db.invoice.aggregate({ _sum: { total: true }, where: { status: "PAID" } }),
  ]);

  const revenue = await db.invoice.aggregate({
    _sum: { total: true },
    where: { status: "PAID" },
  });

  return NextResponse.json({
    customers,
    products,
    invoices,
    revenue: Number(revenue._sum.total ?? 0),
  });
}
