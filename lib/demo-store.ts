import { demoBrigades, demoPartners, demoRequests, getPartnerMatches } from "@/lib/demo-data";
import type { Brigade, JobRequest, Partner, RequestStatus, TimelineEvent } from "@/lib/types";

type Store = { requests: JobRequest[]; partners: Partner[]; brigades: Brigade[] };
declare global { var __fphDemoStore: Store | undefined; }

export const store: Store = globalThis.__fphDemoStore ??= {
  requests: structuredClone(demoRequests), partners: structuredClone(demoPartners), brigades: structuredClone(demoBrigades),
};

export function nowEvent(action: string, actor = "Система", kind: TimelineEvent["kind"] = "system"): TimelineEvent {
  const now = new Date(); return { date: now.toISOString().slice(0, 10), time: now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }), actor, action, kind };
}

export function getRequest(id: string) { return store.requests.find((r) => r.id === id); }

export function assignRequest(id: string, partnerId?: string) {
  const request = getRequest(id); if (!request) return { error: "Заявка не найдена", status: 404 as const };
  const matches = getPartnerMatches(request, store.partners);
  const partner = partnerId ? store.partners.find((p) => p.id === partnerId) : matches[0]?.partner;
  if (!partner || partner.accredited !== "Аккредитован" || partner.freeTeams < 1) return { error: "Нет подходящего свободного партнера", status: 409 as const };
  request.partnerId = partner.id; request.status = "Предложена партнеру";
  request.timeline.push(nowEvent(`Заявка направлена партнеру ${partner.shortName}`, "Система подбора", "system"));
  return { request, partner, matches };
}

export function setRequestStatus(id: string, status: RequestStatus, actor = "Диспетчер") {
  const request = getRequest(id); if (!request) return undefined;
  request.status = status; request.timeline.push(nowEvent(`Статус изменен: ${status}`, actor, "success")); return request;
}

