"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, ArrowDownUp, ArrowLeft, ArrowRight, ArrowUpRight, Bell, BriefcaseBusiness, Building2, ChartNoAxesCombined, ChevronDown,
  CircleHelp, ClipboardCheck, FileText, Filter, HardHat, Home, Layers3, LogOut, Map, Menu, Package, Search, Settings,
  ShieldCheck, Truck, UserRound, Users, X, CheckCheck, Sparkles, BellRing,
} from "lucide-react";
import { DashboardPage, GenericSection, LoginPage, NewRequestPage, PartnerDetailPage, PartnersPage, RequestDetailPage, RequestsPage } from "@/components/screens";
import { MapWorkspace } from "@/components/map-workspace";
import { demoBrigades, demoEmployees, demoPartners, demoRequests, getPartnerMatches } from "@/lib/demo-data";
import type { Brigade, Employee, JobRequest, Partner, TimelineEvent } from "@/lib/types";

type Page = "dashboard" | "map" | "requests" | "newRequest" | "detail" | "partners" | "partnerDetail" | "brigades" | "staff" | "equipment" | "gear" | "ppe" | "accreditation" | "documents" | "analytics" | "notifications" | "settings" | "partnerCabinet" | "login";
type NavItem = { id: Page; label: string; icon: React.ReactNode; badge?: string };
const navGroups: { label: string; items: NavItem[] }[] = [
  { label: "ОБЗОР", items: [{ id: "dashboard", label: "Дашборд", icon: <Home size={17} /> }, { id: "map", label: "Карта объектов", icon: <Map size={17} /> }] },
  { label: "РАБОТА", items: [{ id: "requests", label: "Заявки", icon: <BriefcaseBusiness size={17} /> }, { id: "partners", label: "Партнеры", icon: <Building2 size={17} /> }, { id: "brigades", label: "Бригады", icon: <HardHat size={17} /> }, { id: "staff", label: "Сотрудники", icon: <Users size={17} /> }, { id: "equipment", label: "Техника", icon: <Truck size={17} /> }, { id: "gear", label: "Оборудование", icon: <Package size={17} /> }, { id: "ppe", label: "СИЗ", icon: <ShieldCheck size={17} /> }] },
  { label: "КОНТРОЛЬ", items: [{ id: "accreditation", label: "Аккредитация", icon: <ClipboardCheck size={17} /> }, { id: "documents", label: "Документы", icon: <FileText size={17} /> }, { id: "analytics", label: "Аналитика", icon: <ChartNoAxesCombined size={17} /> }] },
];
const pageNames: Record<Page, [string, string]> = {
  dashboard: ["Дашборд", "Операционный обзор платформы"], map: ["Карта объектов", "Заявки, партнеры и инфраструктура в реальном времени"],
  requests: ["Заявки", "Управление заявками и ходом работ"], newRequest: ["Создать заявку", "Новый объект подключения"], detail: ["Карточка заявки", "Детали, этапы и контроль срока"],
  partners: ["Партнеры", "Сеть аккредитованных исполнителей"], partnerDetail: ["Карточка партнера", "Показатели и ресурсы подрядчика"], brigades: ["Бригады", "Доступность строительных команд"],
  staff: ["Сотрудники", "Команда и квалификации партнеров"], equipment: ["Техника", "Спецтехника и транспорт"], gear: ["Оборудование", "Монтажное и измерительное оборудование"],
  ppe: ["Средства защиты", "Обеспеченность и контроль СИЗ"], accreditation: ["Аккредитация", "Проверка соответствия партнеров"], documents: ["Документы", "Документы по объектам и партнерам"],
  analytics: ["Аналитика", "Эффективность сети и выполнение SLA"], notifications: ["Уведомления", "События, требующие внимания"], settings: ["Настройки", "Конфигурация платформы и доступа"],
  partnerCabinet: ["Кабинет партнера", "Рабочее пространство исполнителя"], login: ["Вход", "Авторизация пользователя"],
};

export default function HomePage() {
  const [page, setPage] = useState<Page>("dashboard");
  const [requests, setRequests] = useState<JobRequest[]>(() => structuredClone(demoRequests));
  const [partners, setPartners] = useState<Partner[]>(() => structuredClone(demoPartners));
  const [brigades, setBrigades] = useState<Brigade[]>(() => structuredClone(demoBrigades));
  const [employees] = useState<Employee[]>(() => structuredClone(demoEmployees));
  const [selectedRequestId, setSelectedRequestId] = useState("FPH-000124");
  const [selectedPartnerId, setSelectedPartnerId] = useState("par-001");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [signedIn, setSignedIn] = useState(true);
  const [role, setRole] = useState("Руководитель");
  const searchRef = useRef<HTMLInputElement>(null);
  const selectedRequest = requests.find((r) => r.id === selectedRequestId) ?? requests[0];
  const selectedPartner = partners.find((p) => p.id === selectedPartnerId) ?? partners[0];
  const filteredSearchResults = useMemo(() => query.trim() ? requests.filter((r) => `${r.id} ${r.client} ${r.city} ${r.address}`.toLowerCase().includes(query.toLowerCase())).slice(0, 5) : [], [query, requests]);
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 3400); };

  useEffect(() => {
    const raw = localStorage.getItem("fph.demo.state.v2");
    if (raw) {
      try {
        const data = JSON.parse(raw) as { requests?: JobRequest[]; brigades?: Brigade[]; partners?: Partner[] };
        if (data.requests?.length) setRequests(data.requests);
        if (data.brigades?.length) setBrigades(data.brigades);
        if (data.partners?.length) setPartners(data.partners);
      } catch { localStorage.removeItem("fph.demo.state.v2"); }
    }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem("fph.demo.state.v2", JSON.stringify({ requests, brigades, partners })); }, [loaded, requests, brigades, partners]);
  useEffect(() => { const handler = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); searchRef.current?.focus(); } if (e.key === "Escape") { setProfileOpen(false); setQuery(""); } }; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, []);

  const go = (next: Page) => { setPage(next); setMobileMenu(false); setProfileOpen(false); if (next === "dashboard") setRole("Руководитель"); };
  const updateRequest = (id: string, updater: (current: JobRequest) => JobRequest) => setRequests((current) => current.map((r) => r.id === id ? updater(r) : r));
  const addEvent = (action: string, actor: string, kind: TimelineEvent["kind"] = "system"): TimelineEvent => {
    const now = new Date(); return { date: now.toISOString().slice(0, 10), time: now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }), actor, action, kind };
  };
  const openRequest = (id: string) => { setSelectedRequestId(id); go("detail"); };
  const openPartner = (id: string) => { setSelectedPartnerId(id); go("partnerDetail"); };

  const createRequest = (data: Partial<JobRequest>) => {
    const id = `FPH-${String(requests.length + 1).padStart(6, "0")}`; const now = new Date().toISOString().slice(0, 10);
    const request: JobRequest = {
      id, client: data.client || "Новый клиент", objectName: data.objectName || data.client || "Новый объект", region: data.region || "Карагандинская область", city: data.city || "Караганда",
      district: data.district || "Центральный район", address: data.address || "г. Караганда, адрес уточняется", type: data.type || "Строительство ВОЛС", status: "Новая", sla: data.sla || 30,
      deadline: data.deadline || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10), priority: data.priority || "Обычный", volume: data.volume || 1,
      cost: Math.round((data.volume || 1) * 1430000), createdAt: now, x: data.x || 59, y: data.y || 49, overdue: false, contact: data.contact || "Не указано", phone: data.phone || "Не указан",
      speed: data.speed || "1 Гбит/с", fibers: data.fibers || 24, cable: data.cable || "ОКБ-48", splices: data.splices || 2, trench: data.trench || 0,
      hdd: data.hdd || false, aerial: data.aerial || false, lift: data.lift || false, excavator: data.excavator || false, description: data.description || "",
      timeline: [addEvent("Заявка создана", "Алексей Иванов", "success"), addEvent("Система определила подходящих партнеров", "Система подбора", "system")], photos: [], documents: data.documents || [],
    };
    setRequests((current) => [request, ...current]); setSelectedRequestId(id); go("detail"); showToast(`Заявка ${id} создана. Подобраны 3 подходящих партнера.`);
  };
  const assignPartner = (partnerId: string) => {
    const p = partners.find((x) => x.id === partnerId); if (!p || !selectedRequest) return;
    updateRequest(selectedRequest.id, (r) => ({ ...r, partnerId, status: "Предложена партнеру", timeline: [...r.timeline, addEvent(`Заявка направлена партнеру ${p.shortName}`, "Система подбора", "system")] }));
    showToast(`Предложение отправлено партнеру ${p.shortName}. Ожидаем ответ в течение 2 часов.`);
  };
  const acceptOffer = () => {
    if (!selectedRequest) return; const p = partners.find((x) => x.id === selectedRequest.partnerId);
    updateRequest(selectedRequest.id, (r) => ({ ...r, status: "Принята", timeline: [...r.timeline, addEvent("Партнер принял заявку", p?.shortName ?? "Партнер", "success")] }));
    showToast(`${p?.shortName ?? "Партнер"} принял заявку ${selectedRequest.id}.`);
  };
  const declineOffer = () => {
    if (!selectedRequest) return;
    const ranked = getPartnerMatches(selectedRequest, partners); const currentIndex = ranked.findIndex((m) => m.partner.id === selectedRequest.partnerId); const next = ranked.slice(currentIndex + 1).find((m) => m.partner.id !== selectedRequest.partnerId);
    if (next) {
      updateRequest(selectedRequest.id, (r) => ({ ...r, partnerId: next.partner.id, status: "Предложена партнеру", timeline: [...r.timeline, addEvent(`${partners.find((p) => p.id === r.partnerId)?.shortName ?? "Партнер"} отказался · заявка направлена ${next.partner.shortName}`, "Система подбора", "warning")] }));
      showToast(`Предложение передано следующему партнеру: ${next.partner.shortName}.`);
    } else {
      updateRequest(selectedRequest.id, (r) => ({ ...r, partnerId: undefined, status: "На распределении", timeline: [...r.timeline, addEvent("Все партнеры отклонили предложение · требуется вмешательство диспетчера", "Система", "warning")] }));
      showToast("Свободных партнеров в очереди не осталось. Диспетчеру отправлено уведомление.");
    }
  };
  const assignBrigade = (brigadeId: string) => {
    if (!selectedRequest) return; const b = brigades.find((x) => x.id === brigadeId); if (!b) return;
    setBrigades((current) => current.map((x) => x.id === brigadeId ? { ...x, status: "В работе", currentTask: selectedRequest.id } : x));
    setPartners((current) => current.map((p) => p.id === b.partnerId ? { ...p, freeTeams: Math.max(0, p.freeTeams - 1), load: Math.min(100, p.load + 8) } : p));
    updateRequest(selectedRequest.id, (r) => ({ ...r, brigadeId, status: "Запланирована", timeline: [...r.timeline, addEvent(`${b.name} назначена на объект`, b.name, "success")] }));
    showToast(`${b.name} назначена. Заявка запланирована к строительству.`);
  };
  const advanceRequest = () => {
    if (!selectedRequest) return;
    const sequence: JobRequest["status"][] = ["Запланирована", "Бригада выехала", "Строительство", "Монтаж ВОЛС", "Сварка", "Измерение", "Исполнительная документация", "На приемке", "Завершена"];
    const next = selectedRequest.status === "Требуются исправления" ? "Измерение" : sequence[Math.min(sequence.length - 1, Math.max(0, sequence.indexOf(selectedRequest.status) + 1))];
    updateRequest(selectedRequest.id, (r) => ({ ...r, status: next, timeline: [...r.timeline, addEvent(`Этап изменен: ${next}`, "Алексей Иванов", "success")] }));
    showToast(`Заявка ${selectedRequest.id} переведена в статус «${next}».`);
  };
  const uploadFile = (name: string, type: "photo" | "document") => {
    if (!selectedRequest) return;
    updateRequest(selectedRequest.id, (r) => ({ ...r, photos: type === "photo" ? [...r.photos, name] : r.photos, documents: type === "document" ? [...r.documents, name] : r.documents, timeline: [...r.timeline, addEvent(type === "photo" ? `Загружено фото: ${name}` : `Загружен документ: ${name}`, "Бригадир", "success")] }));
    showToast(type === "photo" ? "Фото добавлено к заявке." : "Документ добавлен к заявке.");
  };
  const closeRequest = () => {
    if (!selectedRequest) return;
    if (selectedRequest.brigadeId) setBrigades((current) => current.map((b) => b.id === selectedRequest.brigadeId ? { ...b, status: "Доступна", currentTask: undefined } : b));
    if (selectedRequest.partnerId) setPartners((current) => current.map((p) => p.id === selectedRequest.partnerId ? { ...p, freeTeams: p.freeTeams + (selectedRequest.brigadeId ? 1 : 0), load: Math.max(0, p.load - (selectedRequest.brigadeId ? 8 : 0)) } : p));
    updateRequest(selectedRequest.id, (r) => ({ ...r, status: "Закрыта", overdue: false, timeline: [...r.timeline, addEvent("Приемка завершена · заявка закрыта", "Приемщик", "success")] }));
    showToast(`Объект ${selectedRequest.id} принят и закрыт.`);
  };
  const title = pageNames[page];

  if (page === "login" || !signedIn) return <LoginPage onLogin={() => { setSignedIn(true); setRole("Руководитель"); go("dashboard"); showToast("Добро пожаловать в Fiber Partner Hub."); }} />;

  return <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
    {mobileMenu && <button className="mobile-scrim" onClick={() => setMobileMenu(false)} aria-label="Закрыть меню" />}
    <aside className={`sidebar ${mobileMenu ? "mobile-open" : ""}`}>
      <div className="sidebar-brand"><span className="brand-mark"><Logo /></span>{!sidebarCollapsed && <div className="brand-wordmark"><b>FIBER<span>HUB</span></b><small>PARTNER PLATFORM</small></div>}<button className="sidebar-collapse" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title="Свернуть меню"><ArrowDownUp size={14} /></button><button className="sidebar-close" onClick={() => setMobileMenu(false)}><X size={19} /></button></div>
      <div className="sidebar-workspace"><span className="workspace-avatar">FP</span>{!sidebarCollapsed && <div><b>Fiber Partner</b><small>Сеть Казахстана <ChevronDown size={11} /></small></div>}<ChevronDown size={14} className="workspace-chevron" /></div>
      <nav className="main-nav">{navGroups.map((group) => <div className="nav-group" key={group.label}><span className="nav-group-label">{!sidebarCollapsed ? group.label : "···"}</span>{group.items.map((item) => <button key={item.id} className={`nav-item ${page === item.id || (page === "detail" && item.id === "requests") || (page === "partnerDetail" && item.id === "partners") ? "active" : ""}`} onClick={() => go(item.id)} title={sidebarCollapsed ? item.label : undefined}><span className="nav-item-icon">{item.icon}</span>{!sidebarCollapsed && <><span>{item.label}</span>{item.id === "requests" && <i className="nav-count">23</i>}</>}</button>)}</div>)}
        <div className="nav-group partner-group"><span className="nav-group-label">{!sidebarCollapsed ? "ПАРТНЕР" : "···"}</span><button className={`nav-item ${page === "partnerCabinet" ? "active" : ""}`} onClick={() => { setRole("Партнер"); go("partnerCabinet"); }} title={sidebarCollapsed ? "Кабинет партнера" : undefined}><span className="nav-item-icon"><BriefcaseBusiness size={17} /></span>{!sidebarCollapsed && <><span>Кабинет партнера</span><i className="nav-live-dot" /></>}</button></div>
      </nav>
      <div className="sidebar-bottom"><button className={`nav-item ${page === "notifications" ? "active" : ""}`} onClick={() => go("notifications")} title={sidebarCollapsed ? "Уведомления" : undefined}><span className="nav-item-icon"><Bell size={17} /></span>{!sidebarCollapsed && <><span>Уведомления</span><i className="notification-nav-badge">3</i></>}</button><button className={`nav-item ${page === "settings" ? "active" : ""}`} onClick={() => go("settings")} title={sidebarCollapsed ? "Настройки" : undefined}><span className="nav-item-icon"><Settings size={17} /></span>{!sidebarCollapsed && <span>Настройки</span>}</button><div className="sidebar-help"><CircleHelp size={15} />{!sidebarCollapsed && <><span>Центр помощи</span><ArrowUpRight size={13} /></>}</div><button className="user-mini" onClick={() => setProfileOpen(!profileOpen)}><span className="user-avatar">АИ</span>{!sidebarCollapsed && <div><b>Алексей Иванов</b><small>{role}</small></div>}<ChevronDown size={13} /></button></div>
    </aside>
    <div className="app-main"><header className="topbar"><div className="topbar-left"><button className="mobile-menu-button" onClick={() => setMobileMenu(true)}><Menu size={19} /></button><div className="breadcrumbs"><span>Рабочее пространство</span><span>/</span><b>{title[0]}</b></div></div><div className="topbar-right"><div className={`global-search ${query ? "search-focused" : ""}`}><Search size={15} /><input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && filteredSearchResults[0]) { openRequest(filteredSearchResults[0].id); setQuery(""); } }} placeholder="Поиск по объектам и заявкам" /><kbd>⌘ K</kbd>{query && <button onClick={() => setQuery("")} className="search-clear"><X size={12} /></button>}{query && <div className="search-results">{filteredSearchResults.length ? filteredSearchResults.map((r) => <button key={r.id} onClick={() => { openRequest(r.id); setQuery(""); }}><span className="tiny-status-dot" data-status={r.overdue ? "late" : r.status === "Новая" ? "new" : "active"} /><div><b>{r.id} · {r.client}</b><small>{r.city} · {r.status}</small></div><ArrowRight size={14} /></button>) : <span>Ничего не найдено</span>}</div>}</div><button className="topbar-icon" onClick={() => go("notifications")} title="Уведомления"><Bell size={17} /><i /></button><span className="topbar-divider" /><button className="topbar-profile" onClick={() => setProfileOpen(!profileOpen)}><span className="user-avatar">АИ</span><span><b>Алексей Иванов</b><small>{role}</small></span><ChevronDown size={14} /></button>{profileOpen && <div className="profile-menu"><div className="profile-menu-head"><span className="user-avatar">АИ</span><div><b>Алексей Иванов</b><small>alexey@fiberhub.kz</small></div></div><button onClick={() => { setRole("Руководитель"); go("dashboard"); }}><ChartNoAxesCombined size={15} />Рабочий кабинет</button><button onClick={() => { setRole("Партнер"); go("partnerCabinet"); }}><BriefcaseBusiness size={15} />Кабинет партнера</button><button onClick={() => go("settings")}><Settings size={15} />Настройки профиля</button><span className="profile-menu-line" /><button onClick={() => { setSignedIn(false); go("login"); }}><LogOut size={15} />Выйти из системы</button></div>}</div></header>
      <div className="page-topline"><div><h1>{title[0]}</h1><span>{title[1]}</span></div>{page === "dashboard" && <div className="topline-actions"><span className="region-chip"><MapPinPin />Вся сеть Казахстана <ChevronDown size={13} /></span><button className="button button-outline" onClick={() => openRequest("FPH-000124")}><Sparkles size={14} />Показать демо-сценарий</button></div>}{page === "requests" && <div className="topline-date"><span className="live-dot" />Актуально · {requests.length.toLocaleString("ru-RU")} объектов</div>}</div>
      <main className="page-content">
        {page === "dashboard" && <DashboardPage requests={requests} partners={partners} brigades={brigades} map={<MapWorkspace requests={requests} partners={partners} selectedId={selectedRequestId} onSelect={setSelectedRequestId} onOpen={openRequest} onPartner={openPartner} compact />} />}
        {page === "map" && <MapWorkspace requests={requests} partners={partners} selectedId={selectedRequestId} onSelect={setSelectedRequestId} onOpen={openRequest} onPartner={openPartner} />}
        {page === "requests" && <RequestsPage requests={requests} partners={partners} onOpen={openRequest} onCreate={() => go("newRequest")} />}
        {page === "newRequest" && <NewRequestPage partners={partners} onCancel={() => go("requests")} onCreate={createRequest} />}
        {page === "detail" && selectedRequest && <RequestDetailPage request={selectedRequest} partners={partners} brigades={brigades} onBack={() => go("requests")} onAssign={assignPartner} onAccept={acceptOffer} onDecline={declineOffer} onAssignBrigade={assignBrigade} onAdvance={advanceRequest} onUpload={uploadFile} onClose={closeRequest} />}
        {page === "partners" && <PartnersPage partners={partners} requests={requests} onOpen={openPartner} />}
        {page === "partnerDetail" && selectedPartner && <PartnerDetailPage partner={selectedPartner} requests={requests} brigades={brigades} employees={employees} onBack={() => go("partners")} />}
        {["brigades", "staff", "equipment", "gear", "ppe", "accreditation", "documents", "analytics", "notifications", "settings", "partnerCabinet"].includes(page) && <GenericSection page={page} partners={partners} brigades={brigades} employees={employees} requests={requests} onOpen={openRequest} onPartner={openPartner} />}
      </main><footer className="app-footer"><span>FIBER PARTNER HUB <i>·</i> DEMO ENVIRONMENT</span><span>Все данные синхронизированы <i className="footer-live" /></span></footer>
    </div>
    {profileOpen && <button className="profile-scrim" aria-label="Закрыть меню профиля" onClick={() => setProfileOpen(false)} />}
    {toast && <div className="toast-message"><span><CheckCheck size={17} /></span>{toast}<button onClick={() => setToast("")}><X size={14} /></button></div>}
  </div>;
}

function Logo() { return <span className="logo-mark-shape"><i /><i /><i /></span>; }
function MapPinPin() { return <Map size={14} />; }
