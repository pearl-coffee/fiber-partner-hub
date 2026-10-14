import { NextRequest, NextResponse } from "next/server";
import { setRequestStatus } from "@/lib/demo-store";
import { REQUEST_STATUSES } from "@/lib/types";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; const body = await request.json().catch(() => ({})) as { status?: string; actor?: string };
  if (!body.status || !REQUEST_STATUSES.includes(body.status as typeof REQUEST_STATUSES[number])) return NextResponse.json({ error: "Недопустимый статус заявки" }, { status: 400 });
  const item = setRequestStatus(id, body.status as typeof REQUEST_STATUSES[number], body.actor);
  return item ? NextResponse.json(item) : NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
}
