export const REQUEST_STATUSES = [
  "Новая", "На распределении", "Предложена партнеру", "Принята", "Запланирована",
  "Бригада выехала", "Строительство", "Монтаж ВОЛС", "Сварка", "Измерение",
  "Исполнительная документация", "На приемке", "Требуются исправления", "Завершена", "Закрыта", "Отменена", "Просрочена",
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export type Priority = "Критический" | "Высокий" | "Обычный" | "Низкий";
export type TimelineEvent = { date: string; time: string; actor: string; action: string; kind?: "success" | "warning" | "system" };
export type JobRequest = {
  id: string; client: string; objectName: string; region: string; city: string; district: string; address: string;
  type: string; partnerId?: string; brigadeId?: string; status: RequestStatus; sla: number; deadline: string;
  priority: Priority; volume: number; cost: number; createdAt: string; x: number; y: number; overdue: boolean;
  contact: string; phone: string; speed: string; fibers: number; cable: string; splices: number;
  trench: number; hdd: boolean; aerial: boolean; lift: boolean; excavator: boolean; description: string;
  timeline: TimelineEvent[]; photos: string[]; documents: string[];
};
export type Partner = {
  id: string; name: string; shortName: string; bin: string; region: string; city: string; phone: string; email: string;
  teams: number; freeTeams: number; load: number; rating: number; avgDays: number; overdueRate: number; costPerKm: number;
  accredited: "Аккредитован" | "Требует проверки" | "Не соответствует"; types: string[]; equipment: string[]; x: number; y: number;
};
export type Brigade = { id: string; name: string; partnerId: string; members: number; qualification: string; region: string; status: "Доступна" | "В работе" | "Недоступна"; equipment: string; currentTask?: string };
export type Employee = { id: string; name: string; role: string; partnerId: string; region: string; qualification: string; status: "На объекте" | "Доступен" | "Отпуск" };
