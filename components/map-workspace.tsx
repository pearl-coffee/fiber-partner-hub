"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowUpRight, Building2, ChevronDown, Crosshair, Layers2, LocateFixed, MapPin, RotateCcw, Search, Users, X } from "lucide-react";
import type { JobRequest, Partner } from "@/lib/types";
import { getPartnerMatches, mapRegions } from "@/lib/demo-data";
import { resolveMapProvider } from "@/lib/map-provider";

type Props = {
  requests: JobRequest[]; partners: Partner[]; selectedId?: string; onSelect: (id: string) => void;
  onOpen: (id: string) => void; onPartner: (id: string) => void; compact?: boolean;
};

const colorFor = (request: JobRequest) => request.overdue ? "late" : request.status === "Новая" || request.status === "На распределении" ? "new" : ["Завершена", "Закрыта"].includes(request.status) ? "done" : request.status === "Требуются исправления" || request.status === "Просрочена" ? "issue" : "active";
const mapPercent = (value: number) => `${value.toFixed(4)}%`;

export function MapWorkspace({ requests, partners, selectedId, onSelect, onOpen, onPartner, compact = false }: Props) {
  const mapProvider = resolveMapProvider("schematic");
  const [region, setRegion] = useState("Все регионы");
  const [city, setCity] = useState("Все города");
  const [status, setStatus] = useState("Все статусы");
  const [partnerId, setPartnerId] = useState("Все партнеры");
  const [type, setType] = useState("Любой тип работ");
  const [priority, setPriority] = useState("Любой приоритет");
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [search, setSearch] = useState("");
  const [showTeams, setShowTeams] = useState(true);
  const [showPartners, setShowPartners] = useState(true);
  const [layersOpen, setLayersOpen] = useState(false);
  const regionList = ["Все регионы", ...Array.from(new Set(requests.map((r) => r.region))).sort()];
  const cityList = ["Все города", ...Array.from(new Set(requests.filter((r) => region === "Все регионы" || r.region === region).map((r) => r.city))).sort()];
  const filtered = useMemo(() => requests.filter((r) =>
    (region === "Все регионы" || r.region === region) && (city === "Все города" || r.city === city) &&
    (status === "Все статусы" || r.status === status) && (partnerId === "Все партнеры" || r.partnerId === partnerId) &&
    (type === "Любой тип работ" || r.type === type) && (priority === "Любой приоритет" || r.priority === priority) && (!onlyOverdue || r.overdue) &&
    (!search || `${r.id} ${r.client} ${r.address} ${r.city}`.toLowerCase().includes(search.toLowerCase()))
  ), [requests, region, city, status, partnerId, type, priority, onlyOverdue, search]);
  const visibleBase = [
    ...filtered.filter((r) => r.overdue).slice(0, 23),
    ...filtered.filter((r) => r.status === "Новая").slice(0, 20),
    ...filtered.filter((r) => !r.overdue && !["Новая", "Завершена", "Закрыта", "Отменена"].includes(r.status)).slice(0, 28),
    ...filtered.filter((r) => ["Завершена", "Закрыта"].includes(r.status)).slice(0, 18),
  ].filter((r, i, all) => all.findIndex((x) => x.id === r.id) === i);
  const pinnedSelected = requests.find((r) => r.id === selectedId);
  const visible = pinnedSelected && !visibleBase.some((r) => r.id === pinnedSelected.id) ? [...visibleBase, pinnedSelected] : visibleBase;
  const selected = requests.find((r) => r.id === selectedId) ?? visible[0];
  const matches = selected ? getPartnerMatches(selected, partners) : [];
  const filterCount = [region !== "Все регионы", city !== "Все города", status !== "Все статусы", partnerId !== "Все партнеры", type !== "Любой тип работ", priority !== "Любой приоритет", onlyOverdue].filter(Boolean).length;
  const reset = () => { setRegion("Все регионы"); setCity("Все города"); setStatus("Все статусы"); setPartnerId("Все партнеры"); setType("Любой тип работ"); setPriority("Любой приоритет"); setOnlyOverdue(false); setSearch(""); };

  return <div className={`map-layout ${compact ? "map-layout-compact" : ""}`}>
    <aside className="map-filters">
      <div className="map-filters-head"><div><span className="eyebrow">Рабочая область</span><h3>Фильтры карты</h3></div><span className="filter-count">{filterCount ? filterCount : <SlidersMark />}</span></div>
      <label className="filter-search"><Search size={15} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Заявка, клиент, адрес" /></label>
      <div className="filter-scroll">
        <FilterSelect label="Регион" value={region} options={regionList} onChange={(v) => { setRegion(v); setCity("Все города"); }} />
        <FilterSelect label="Город" value={city} options={cityList} onChange={setCity} />
        <FilterSelect label="Статус заявки" value={status} options={["Все статусы", "Новая", "На распределении", "Предложена партнеру", "Принята", "Запланирована", "Бригада выехала", "Строительство", "Монтаж ВОЛС", "Сварка", "Измерение", "Исполнительная документация", "На приемке", "Требуются исправления", "Завершена", "Закрыта", "Просрочена"]} onChange={setStatus} />
        <FilterSelect label="Партнер" value={partnerId} options={["Все партнеры", ...partners.map((p) => p.id)]} displayOptions={["Все партнеры", ...partners.map((p) => p.shortName)]} onChange={setPartnerId} />
        <FilterSelect label="Тип работ" value={type} options={["Любой тип работ", "Строительство ВОЛС", "Подключение", "Монтаж ВОЛС", "Аварийный ремонт"]} onChange={setType} />
        <div className="filter-row"><FilterSelect label="Приоритет" value={priority} options={["Любой приоритет", "Критический", "Высокий", "Обычный", "Низкий"]} onChange={setPriority} /></div>
        <button className={`filter-toggle ${onlyOverdue ? "selected" : ""}`} onClick={() => setOnlyOverdue(!onlyOverdue)}><span className="toggle-dot" />Только с просрочкой<span className="toggle-switch" /></button>
        <button className="clear-filters" onClick={reset}><RotateCcw size={13} /> Сбросить фильтры</button>
      </div>
      <div className="filter-summary"><Activity size={14} /><span>На карте: <b>{filtered.length.toLocaleString("ru-RU")}</b> заявок</span></div>
    </aside>

    <section className="map-main">
      <div className="map-toolbar">
        <div className="map-title"><span className="live-dot" /><div><b>Карта объектов</b><small>Последнее обновление — только что</small></div></div>
        <div className="map-toolbar-actions"><div className="map-legend"><span><i className="legend-dot new" />Новые</span><span><i className="legend-dot active" />В работе</span><span><i className="legend-dot done" />Выполнены</span><span><i className="legend-dot late" />Просрочка</span></div>
          <div className="layer-wrap"><button className={`icon-button ${layersOpen ? "is-active" : ""}`} title="Слои карты" onClick={() => setLayersOpen(!layersOpen)}><Layers2 size={16} /></button>{layersOpen && <div className="layers-popover"><b>Слои карты</b><label><input type="checkbox" checked={showPartners} onChange={(e) => setShowPartners(e.target.checked)} />Партнеры</label><label><input type="checkbox" checked={showTeams} onChange={(e) => setShowTeams(e.target.checked)} />Бригады</label><label><input type="checkbox" defaultChecked />Существующая инфраструктура</label><label><input type="checkbox" defaultChecked />Границы регионов</label></div>}</div>
          <button className="icon-button" title="Мое местоположение" onClick={() => { setRegion("Все регионы"); setCity("Все города"); }}><LocateFixed size={16} /></button>
        </div>
      </div>
      <div className="map-canvas" onClick={() => layersOpen && setLayersOpen(false)}>
        <svg className="map-background" viewBox="0 0 1000 520" preserveAspectRatio="none" role="img" aria-label="Схематичная карта Казахстана с инфраструктурой">
          <defs><pattern id="mapGrid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke="#e5ecea" strokeWidth="0.75" /></pattern><filter id="soft"><feGaussianBlur stdDeviation="6" /></filter></defs>
          <rect width="1000" height="520" fill="#eef4f1" /><rect width="1000" height="520" fill="url(#mapGrid)" />
          <path d="M72 197 110 148 178 136 213 107 277 116 307 92 368 107 405 78 458 95 500 76 544 94 597 70 648 91 704 78 747 100 802 101 839 130 898 140 926 177 901 208 919 238 886 257 895 292 859 315 836 351 793 354 771 395 724 389 690 418 649 400 612 430 573 411 538 434 494 411 453 438 411 417 370 435 334 411 290 419 255 391 218 383 206 349 167 334 163 299 129 279 130 246 92 232Z" fill="#f7f9f3" stroke="#cad8d2" strokeWidth="2.1" />
          <path d="M90 231 170 214 220 236 300 211 368 222 432 191 500 201 572 169 641 185 704 155 761 175 832 154 894 177M137 286 219 272 290 296 358 265 420 282 495 257 560 277 620 245 686 259 748 231 813 250 872 219M206 351 277 330 340 354 398 324 466 339 526 311 594 333 656 303 712 320 775 291 840 309" fill="none" stroke="#dbe3d9" strokeWidth="1.3" />
          <path d="M255 158 315 214 369 259 432 306 490 337 536 386M575 126 566 186 596 239 582 294 621 337 646 390M313 340 379 300 440 261 485 214 549 169 605 131M721 117 697 171 704 224 749 273 785 326" fill="none" stroke="#d6bca2" strokeWidth="2" strokeDasharray="6 5" opacity=".8" />
          <path d="M370 240 425 220 476 238 522 211 575 222 625 204M405 313 460 294 508 311 550 285 601 299 646 277" fill="none" stroke="#b9d6d5" strokeWidth="2.5" opacity=".85" />
          <circle cx="580" cy="253" r="80" fill="#86afe9" opacity=".07" filter="url(#soft)" />
        </svg>
        <div className="map-network-lines" aria-hidden="true"><span /><span /><span /><span /></div>
        {mapRegions.map((p) => <span key={p.city} className="map-city-label" style={{ left: `${p.x}%`, top: `${p.y}%` }}>{p.city}</span>)}
        {visible.map((r, i) => <button key={r.id} className={`map-marker ${colorFor(r)} ${selected?.id === r.id ? "is-selected" : ""}`} style={{ left: mapPercent(r.x), top: mapPercent(r.y), zIndex: selected?.id === r.id ? 20 : 2 + (i % 5) }} onClick={() => onSelect(r.id)} title={`${r.id} · ${r.client} · ${r.status}`}><span className="marker-core" />{selected?.id === r.id && <span className="marker-id">{r.id}</span>}</button>)}
        {showPartners && partners.map((p, i) => <button key={p.id} className={`partner-map-marker ${selected?.partnerId === p.id ? "is-current" : ""}`} style={{ left: mapPercent(p.x), top: mapPercent(p.y) }} title={p.name} onClick={(e) => { e.stopPropagation(); onPartner(p.id); }}><Building2 size={12} /></button>)}
        {showTeams && <div className="team-cluster cluster-one" title="Доступные бригады · Астана"><Users size={12} /><b>8</b></div>}
        {showTeams && <div className="team-cluster cluster-two" title="Доступные бригады · Алматы"><Users size={12} /><b>11</b></div>}
        <div className="map-zoom"><button onClick={() => {}} aria-label="Увеличить">+</button><button onClick={() => {}} aria-label="Уменьшить">−</button><span className="zoom-divider" /><button title="Центрировать карту" onClick={() => setSearch("")}><Crosshair size={14} /></button></div>
        <div className="map-attribution">Fiber Partner Hub · {mapProvider.label}</div>
        <div className="map-result-count"><MapPin size={13} />{visible.length} маркеров <ChevronDown size={13} /></div>
      </div>
    </section>

    <aside className="map-inspector">
      <div className="inspector-head"><div><span className="eyebrow">Выбранный объект</span><h3>Детали заявки</h3></div><button className="quiet-icon" onClick={() => selected && onOpen(selected.id)} title="Открыть карточку"><ArrowUpRight size={17} /></button></div>
      {selected ? <>
        <div className="inspector-id-row"><span className="request-id">{selected.id}</span><StatusChip status={selected.status} overdue={selected.overdue} /></div>
        <h2 className="inspector-client">{selected.client}</h2><p className="inspector-address"><MapPin size={14} />{selected.city}, {selected.address.replace(`г. ${selected.city}, `, "")}</p>
        <div className="inspector-specs"><div><small>Тип работ</small><b>{selected.type}</b></div><div><small>Объем</small><b>{selected.volume.toLocaleString("ru-RU")} км</b></div><div><small>SLA</small><b>{selected.sla} дней</b></div><div><small>Дедлайн</small><b>{formatDate(selected.deadline)}</b></div></div>
        <div className="sla-line"><div><span>До дедлайна</span><b className={selected.overdue ? "text-danger" : ""}>{selected.overdue ? "Просрочено" : `${daysLeft(selected.deadline)} дней`}</b></div><div className="sla-progress"><i className={selected.overdue ? "expired" : ""} style={{ width: `${selected.overdue ? 100 : Math.max(14, 100 - daysLeft(selected.deadline) / selected.sla * 100)}%` }} /></div></div>
        <div className="match-box"><div className="match-box-heading"><span className="match-spark">✦</span><div><b>Подходящие партнеры</b><small>Расчет по 7 критериям</small></div><span className="match-count">{matches.length}</span></div>
          {matches.slice(0, 2).map((m, i) => <div className="mini-match" key={m.partner.id}><span className={`match-rank rank-${i + 1}`}>{i + 1}</span><div className="mini-match-name"><b>{m.partner.shortName}</b><small>{m.distance} км · {m.partner.freeTeams} свободные бригады</small></div><b className="match-score">{m.score}<small>%</small></b></div>)}
        </div>
        <button className="button button-primary button-full" onClick={() => onOpen(selected.id)}>Открыть заявку <ArrowUpRight size={15} /></button>
      </> : <div className="empty-state compact-empty"><MapPin size={22} /><b>Выберите объект на карте</b><span>Кликните на любой маркер, чтобы увидеть детали заявки</span></div>}
      <div className="inspector-bottom"><span><span className="live-dot" />Система обновляет данные автоматически</span></div>
    </aside>
  </div>;
}

function FilterSelect({ label, value, options, displayOptions, onChange }: { label: string; value: string; options: string[]; displayOptions?: string[]; onChange: (v: string) => void }) {
  return <label className="filter-field"><span>{label}</span><select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((option, i) => <option key={option} value={option}>{displayOptions?.[i] ?? option}</option>)}</select></label>;
}
function StatusChip({ status, overdue }: { status: JobRequest["status"]; overdue: boolean }) {
  const type = overdue || status === "Просрочена" ? "late" : status === "Новая" || status === "На распределении" ? "new" : ["Завершена", "Закрыта"].includes(status) ? "done" : status === "Требуются исправления" ? "warning" : "active";
  return <span className={`status-chip status-${type}`}><i />{overdue && status !== "Просрочена" ? "Просрочена" : status}</span>;
}
function SlidersMark() { return <span className="sliders-mark">≡</span>; }
function formatDate(value: string) { return new Date(`${value}T12:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }); }
function daysLeft(value: string) { return Math.max(0, Math.ceil((new Date(`${value}T23:59:59`).getTime() - Date.now()) / 86400000)); }
