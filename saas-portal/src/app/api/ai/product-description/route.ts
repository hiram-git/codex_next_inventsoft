import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateProductDescription } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, category } = await req.json();

  try {
    const description = await generateProductDescription(name, category);
    return NextResponse.json({ description });
  } catch {
    return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
  }
}
