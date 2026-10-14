import { NextRequest, NextResponse } from "next/server";
import { store, nowEvent } from "@/lib/demo-store";
import type { JobRequest, Priority } from "@/lib/types";

export function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams; const status = query.get("status"); const region = query.get("region"); const search = query.get("q")?.toLowerCase();
  const rows = store.requests.filter((r) => (!status || r.status === status) && (!region || r.region === region) && (!search || `${r.id} ${r.client} ${r.city} ${r.address}`.toLowerCase().includes(search)));
  const limit = Math.min(200, Math.max(1, Number(query.get("limit") ?? 50))); const offset = Math.max(0, Number(query.get("offset") ?? 0));
  return NextResponse.json({ total: rows.length, items: rows.slice(offset, offset + limit) });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as Partial<JobRequest> | null;
  if (!body?.client || !body?.city || !body?.address) return NextResponse.json({ error: "Обязательные поля: client, city, address" }, { status: 400 });
  const nextNumber = Math.max(...store.requests.map((r) => Number(r.id.slice(-6)))) + 1; const id = `FPH-${String(nextNumber).padStart(6, "0")}`; const createdAt = new Date().toISOString().slice(0, 10);
  const item: JobRequest = {
    id, client: body.client, objectName: body.objectName ?? body.client, region: body.region ?? "Карагандинская область", city: body.city, district: body.district ?? "",
    address: body.address, type: body.type ?? "Строительство ВОЛС", partnerId: undefined, status: "Новая", sla: body.sla ?? 30,
    deadline: body.deadline ?? new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10), priority: (body.priority as Priority) ?? "Обычный", volume: body.volume ?? 1,
    cost: body.cost ?? 0, createdAt, x: body.x ?? 59, y: body.y ?? 49, overdue: false, contact: body.contact ?? "", phone: body.phone ?? "", speed: body.speed ?? "1 Гбит/с",
    fibers: body.fibers ?? 24, cable: body.cable ?? "ОКБ-48", splices: body.splices ?? 2, trench: body.trench ?? 0, hdd: body.hdd ?? false, aerial: body.aerial ?? false,
    lift: body.lift ?? false, excavator: body.excavator ?? false, description: body.description ?? "", timeline: [nowEvent("Заявка создана", "API", "success")], photos: [], documents: body.documents ?? [],
  };
  store.requests.unshift(item); return NextResponse.json(item, { status: 201 });
}
