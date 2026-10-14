import type { Brigade, Employee, JobRequest, Partner, Priority, RequestStatus, TimelineEvent } from "./types";

const places = [
  { region: "Астана", city: "Астана", x: 57, y: 29 }, { region: "Алматы", city: "Алматы", x: 74, y: 72 },
  { region: "Карагандинская область", city: "Караганда", x: 59, y: 49 }, { region: "Шымкент", city: "Шымкент", x: 48, y: 78 },
  { region: "Актюбинская область", city: "Актобе", x: 29, y: 47 }, { region: "Павлодарская область", city: "Павлодар", x: 68, y: 30 },
  { region: "Костанайская область", city: "Костанай", x: 42, y: 25 }, { region: "Восточно-Казахстанская область", city: "Усть-Каменогорск", x: 84, y: 40 },
  { region: "Кызылординская область", city: "Кызылорда", x: 44, y: 65 }, { region: "Жамбылская область", city: "Тараз", x: 61, y: 73 },
  { region: "Атырауская область", city: "Атырау", x: 13, y: 56 }, { region: "Мангистауская область", city: "Актау", x: 10, y: 75 },
  { region: "Западно-Казахстанская область", city: "Уральск", x: 17, y: 34 }, { region: "Северо-Казахстанская область", city: "Петропавловск", x: 52, y: 16 },
  { region: "Туркестанская область", city: "Туркестан", x: 47, y: 73 }, { region: "Область Абай", city: "Семей", x: 78, y: 37 },
];
const partnerNames = ["Fiber Build", "KazTelecom Stroy", "Optic Line KZ", "Транстелеком Монтаж", "СвязьИнжиниринг", "QazFiber Group", "Алатау Networks", "СтройОптика", "Steppe Connect", "МонтажСвязь СК", "Orda Fiber", "Digital Infra KZ", "Арнау Телеком", "СеверСтройСвязь", "Turan Cable", "WestNet Service", "Saryarka Fiber", "Altai Communications", "Caspian Telecom", "Zhetysu Connect"];
const partnerPlaces = [2,0,1,3,4,5,6,7,8,9,10,11,12,13,14];
const equipmentPool = ["ГНБ", "Экскаватор", "Автовышка", "Сервисный автомобиль", "Сварочный аппарат", "OTDR", "Воздуходувка", "Компрессор", "Ролики", "Лебедка", "Газоанализатор", "СИЗ"];
const requestStatuses: RequestStatus[] = [
  ...Array(126).fill("Новая"), ...Array(30).fill("На распределении"), ...Array(25).fill("Предложена партнеру"), ...Array(25).fill("Принята"),
  ...Array(35).fill("Запланирована"), ...Array(20).fill("Бригада выехала"), ...Array(100).fill("Строительство"), ...Array(80).fill("Монтаж ВОЛС"),
  ...Array(35).fill("Сварка"), ...Array(25).fill("Измерение"), ...Array(20).fill("Исполнительная документация"), ...Array(20).fill("На приемке"),
  ...Array(12).fill("Требуются исправления"), ...Array(10).fill("Просрочена"), ...Array(121).fill("Завершена"), ...Array(600).fill("Закрыта"),
] as RequestStatus[];
const clientNames = ["Завод ABC", "ТОО «КазМеталл»", "Центр логистики Север", "ГК «Орда»", "Клиника Сункар", "РЦ Арай", "АгроПром KZ", "Школа № 27", "ТЭЦ-2", "Торговый центр Aport", "БЦ Nomad", "АО «ТемирЖол»"];
const priorities: Priority[] = ["Обычный", "Обычный", "Обычный", "Высокий", "Низкий", "Критический"];
const rand = (seed: number, n: number) => { const x = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453; return x - Math.floor(x); };
const dateMinus = (days: number) => { const date = new Date(); date.setDate(date.getDate() - days); return date.toISOString().slice(0, 10); };

export const demoPartners: Partner[] = partnerNames.map((name, i) => {
  const place = places[partnerPlaces[i % partnerPlaces.length]];
  const isReview = i === 18 || i === 19;
  return {
    id: `par-${String(i + 1).padStart(3, "0")}`, name: `ТОО «${name}»`, shortName: name, bin: `12${String(8340000 + i * 2137).padStart(10, "0")}`,
    region: place.region, city: place.city, phone: `+7 7${i % 8 + 1}2 555 ${String(10 + i).padStart(2, "0")} ${String(20 + i).padStart(2, "0")}`,
    email: `dispatch@${name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 14)}.kz`, teams: 2 + (i % 7), freeTeams: 1 + (i % 3), load: 42 + ((i * 13) % 49),
    rating: i === 0 ? 96 : 86 + ((i * 7) % 14), avgDays: 16 + ((i * 5) % 13), overdueRate: Number((1 + (i * 0.37) % 3.8).toFixed(1)),
    costPerKm: 175000 + ((i * 13750) % 115000), accredited: isReview ? "Требует проверки" : "Аккредитован",
    types: i % 3 === 0 ? ["Строительство ВОЛС", "ГНБ", "Аварийный ремонт"] : ["Строительство ВОЛС", "Подключение", "Монтаж ВОЛС"],
    equipment: equipmentPool.filter((_, ix) => (ix + i) % 3 !== 0), x: place.x + (rand(i + 12, 2) - 0.5) * 3, y: place.y + (rand(i + 8, 4) - 0.5) * 3,
  };
});

const initialTimeline = (id: string, status: RequestStatus): TimelineEvent[] => [
  { date: dateMinus(8), time: "09:00", actor: "Система", action: `Заявка ${id} зарегистрирована`, kind: "system" },
  { date: dateMinus(8), time: "09:01", actor: "Система подбора", action: "Определены подходящие партнеры: 4", kind: "system" },
  ...(status !== "Новая" ? [{ date: dateMinus(7), time: "10:15", actor: "Диспетчер", action: `Заявка переведена в статус «${status}»`, kind: "success" as const }] : []),
];

export const demoRequests: JobRequest[] = Array.from({ length: 1284 }, (_, i) => {
  const place = places[Math.floor(rand(i + 1, 4) * places.length)];
  const status = requestStatuses[i];
  const id = `FPH-${String(i + 1).padStart(6, "0")}`;
  const overdue = i >= 181 && i < 204;
  const createdAge = 2 + Math.floor(rand(i + 7, 8) * 82);
  const deadline = overdue ? dateMinus(1 + (i % 14)) : dateMinus(-(4 + (i % 42)));
  const partner = i % 8 === 0 ? undefined : demoPartners[i % demoPartners.length];
  return {
    id, client: clientNames[Math.floor(rand(i + 5, 2) * clientNames.length)], objectName: `${clientNames[Math.floor(rand(i + 5, 2) * clientNames.length)]} · площадка ${i % 5 + 1}`,
    region: place.region, city: place.city, district: `${place.city} · район ${i % 4 + 1}`, address: `ул. ${["Сарыарка", "Абая", "Промышленная", "Тауелсиздик", "Кунаева"][i % 5]}, ${12 + i % 170}`,
    type: ["Строительство ВОЛС", "Подключение", "Монтаж ВОЛС", "Аварийный ремонт"][Math.floor(rand(i + 1, 12) * 4)], partnerId: partner?.id, status,
    sla: 30, deadline, priority: priorities[Math.floor(rand(i + 13, 1) * priorities.length)], volume: Number((0.8 + rand(i + 6, 11) * 12).toFixed(1)),
    cost: 180000 + Math.round(rand(i + 4, 3) * 2400000), createdAt: dateMinus(createdAge), x: place.x + (rand(i + 41, 3) - 0.5) * 8, y: place.y + (rand(i + 45, 5) - 0.5) * 9,
    overdue, contact: ["Айдар Нурланов", "Алина Ким", "Марат Садыков", "Данияр Ермеков"][i % 4], phone: `+7 70${i % 10} 123 ${String(i % 100).padStart(2, "0")} ${String(i % 90 + 10).padStart(2, "0")}`,
    speed: ["1 Гбит/с", "10 Гбит/с", "100 Мбит/с"][i % 3], fibers: [12, 24, 48, 96][i % 4], cable: ["ОКП-24", "ОКБ-48", "ОКГТ-96"][i % 3], splices: 2 + i % 18,
    trench: Number((rand(i + 4, 15) * 4).toFixed(1)), hdd: i % 3 === 0, aerial: i % 4 === 0, lift: i % 5 === 0, excavator: i % 3 !== 0,
    description: "Подключение производственного объекта к магистральной сети. Требуется исполнительная документация и контроль качества сварных соединений.",
    timeline: initialTimeline(id, status), photos: [], documents: [],
  };
});

// Keep the brief's reference object available as the first result in the demo.
const reference = demoRequests[123];
Object.assign(reference, {
  client: "Завод ABC", objectName: "Завод ABC · производственная площадка", region: "Карагандинская область", city: "Караганда", district: "Караганда · район 2",
  address: "г. Караганда, ул. Промышленная, 17", type: "Строительство ВОЛС", partnerId: undefined, status: "Новая" as RequestStatus, sla: 30, volume: 4.8, priority: "Высокий" as Priority,
  x: 59, y: 49, overdue: false, deadline: dateMinus(-30),
});

export const demoBrigades: Brigade[] = Array.from({ length: 54 }, (_, i) => {
  const partner = demoPartners[i % demoPartners.length];
  const status = i < 42 ? "Доступна" : i < 52 ? "В работе" : "Недоступна";
  return { id: `BR-${String(i + 1).padStart(3, "0")}`, name: `Бригада ${String(i + 1).padStart(2, "0")}`, partnerId: partner.id, members: 4 + (i % 3), qualification: i % 3 === 0 ? "ГНБ · сварка · измерения" : "Строительство ВОЛС · сварка", region: partner.region, status, equipment: partner.equipment.slice(0, 4).join(", "), currentTask: status === "В работе" ? `FPH-${String(220 + i).padStart(6, "0")}` : undefined };
});

export const demoEmployees: Employee[] = Array.from({ length: 108 }, (_, i) => {
  const partner = demoPartners[i % demoPartners.length];
  return { id: `EMP-${String(i + 1).padStart(4, "0")}`, name: ["Александр Ким", "Марат Садыков", "Руслан Ибраев", "Айдана Нурланова", "Данияр Ермеков", "Нуржан Ахметов"][i % 6], role: ["Бригадир", "Монтажник ВОЛС", "Сварщик оптики", "Инженер-измеритель", "Водитель спецтехники"][i % 5], partnerId: partner.id, region: partner.region, qualification: ["III группа · ВОЛС", "OTDR · сварка", "Охрана труда · ГНБ"][i % 3], status: i % 11 === 0 ? "Отпуск" : i % 3 ? "На объекте" : "Доступен" };
});

export const equipment = ["Экскаватор", "Мини-экскаватор", "Установка ГНБ", "Автовышка", "Сервисный автомобиль", "Грузовой автомобиль", "Прицеп", "Сварочный аппарат", "OTDR", "Воздуходувка", "Компрессор", "Ролики и лебедки"];
export const ppe = ["Каски", "Спецодежда", "Защитная обувь", "Газоанализаторы", "Страховочная система", "Сигнальные жилеты", "Защитные очки"];
export const mapRegions = places;

export function getPartnerMatches(request: JobRequest, partners: Partner[] = demoPartners) {
  return partners.filter((p) => p.accredited === "Аккредитован" && p.types.some((t) => t === request.type || t === "Строительство ВОЛС"))
    .map((p) => {
      const dlat = (p.y - request.y) * 1.11;
      const dlon = (p.x - request.x) * 1.11 * Math.cos((request.y * Math.PI) / 180);
      const distance = Math.sqrt(dlat * dlat + dlon * dlon) * 8;
      const distanceScore = Math.max(0, 100 - distance / 3.5);
      const capacityScore = p.freeTeams > 0 ? 100 : Math.max(0, 80 - p.load);
      const speedScore = Math.max(0, 100 - Math.max(0, p.avgDays - 15) * 3.4);
      const techScore = p.equipment.includes("Сварочный аппарат") && p.equipment.includes("OTDR") ? 100 : 72;
      const costScore = Math.max(0, Math.min(100, 100 - (p.costPerKm - 150000) / 2500));
      const score = Math.round(distanceScore * .25 + capacityScore * .2 + p.rating * .15 + speedScore * .15 + 94 * .1 + techScore * .1 + costScore * .05);
      return { partner: p, distance: Math.max(1, Math.round(distance)), score };
    }).sort((a, b) => b.score - a.score).slice(0, 3);
}

export const statusProgress: Record<RequestStatus, number> = {
  "Новая": 4, "На распределении": 8, "Предложена партнеру": 12, "Принята": 18, "Запланирована": 24, "Бригада выехала": 30,
  "Строительство": 46, "Монтаж ВОЛС": 60, "Сварка": 70, "Измерение": 79, "Исполнительная документация": 87,
  "На приемке": 94, "Требуются исправления": 89, "Завершена": 100, "Закрыта": 100, "Отменена": 0, "Просрочена": 44,
};
