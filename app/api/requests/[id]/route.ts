import { NextResponse } from "next/server";
import { getRequest } from "@/lib/demo-store";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; const item = getRequest(id);
  return item ? NextResponse.json(item) : NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
}
