import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { suggestInvoiceNotes } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { customerName, total } = await req.json();

  try {
    const notes = await suggestInvoiceNotes(customerName, total);
    return NextResponse.json({ notes });
  } catch {
    return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
  }
}
