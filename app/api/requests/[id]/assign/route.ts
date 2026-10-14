import { NextRequest, NextResponse } from "next/server";
import { assignRequest } from "@/lib/demo-store";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; const body = await request.json().catch(() => ({})) as { partnerId?: string };
  const result = assignRequest(id, body.partnerId);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ request: result.request, partner: result.partner, top3: result.matches });
}
