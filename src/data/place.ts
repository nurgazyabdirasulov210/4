import { isoDay } from "@/lib/ru";

export const PLACES = [
  {
    id: "bronnaya",
    name: "На Бронной",
    address: "Малая Бронная, 24",
    area: "Патриаршие пруды",
    note: "12 минут пешком от «Пушкинской»",
    hours: "Пн–пт 8:00–22:00 · сб–вс 9:00–22:00",
    live: true,
  },
  {
    id: "water",
    name: "У воды",
    address: "Крымская набережная",
    area: "Откроемся в ноябре",
    note: "Пока заказы и столы только на Бронной",
    hours: "Скоро",
    live: false,
  },
] as const;

export function hoursFor(date: Date) {
  const day = date.getDay();
  const weekend = day === 0 || day === 6;
  return { open: weekend ? 9 : 8, close: 22 };
}

export function isOpen(date: Date) {
  const { open, close } = hoursFor(date);
  const hour = date.getHours() + date.getMinutes() / 60;
  return hour >= open && hour < close;
}

export function pace(date: Date) {
  if (!isOpen(date)) return null;
  const hour = date.getHours();
  if (hour < 10) return { queue: 4, minutes: 9 };
  if (hour < 12) return { queue: 2, minutes: 6 };
  if (hour < 14) return { queue: 3, minutes: 8 };
  if (hour < 17) return { queue: 1, minutes: 5 };
  if (hour < 19) return { queue: 3, minutes: 7 };
  return { queue: 2, minutes: 6 };
}

export function greeting(date: Date) {
  const hour = date.getHours();
  if (hour < 5) return "Доброй ночи";
  if (hour < 12) return "Доброе утро";
  if (hour < 17) return "Добрый день";
  return "Добрый вечер";
}

export function openLabel(date: Date) {
  const { open } = hoursFor(date);
  if (isOpen(date)) return "открыто";
  const hour = date.getHours() + date.getMinutes() / 60;
  if (hour >= hoursFor(date).close) return "закрыто до завтра";
  return `закрыто до ${String(open).padStart(2, "0")}:00`;
}

function clock(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function orderSlots(now: Date) {
  const list: { id: string; label: string }[] = [];
  if (isOpen(now)) list.push({ id: "now", label: "Сейчас" });

  const start = new Date(now);
  if (!isOpen(now)) {
    const { open, close } = hoursFor(now);
    const hour = now.getHours() + now.getMinutes() / 60;
    if (hour >= close) start.setDate(start.getDate() + 1);
    const next = hoursFor(start);
    start.setHours(next.open, 0, 0, 0);
  } else {
    const step = 15 * 60 * 1000;
    const rounded = Math.ceil(start.getTime() / step) * step;
    start.setTime(rounded <= now.getTime() ? rounded + step : rounded);
  }

  for (let i = 0; i < 8; i += 1) {
    const slot = new Date(start.getTime() + i * 15 * 60 * 1000);
    const { open, close } = hoursFor(slot);
    const minutes = slot.getHours() * 60 + slot.getMinutes();
    if (isoDay(slot) !== isoDay(start)) break;
    if (minutes < open * 60 || minutes >= close * 60) break;
    const label = clock(slot);
    list.push({ id: label, label });
  }

  if (list.length === 0) {
    const { open } = hoursFor(start);
    list.push({ id: "open", label: `К ${String(open).padStart(2, "0")}:00` });
  }
  return list;
}

export function reserveTimes(day: Date, now: Date) {
  const { open, close } = hoursFor(day);
  const times: string[] = [];
  const sameDay = isoDay(day) === isoDay(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  for (let minutes = open * 60; minutes < close * 60; minutes += 30) {
    if (sameDay && minutes <= nowMinutes + 30) continue;
    const label = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
    times.push(label);
  }
  return times;
}

export const ZONES = [
  { id: "window", label: "У окна" },
  { id: "hall", label: "Зал" },
  { id: "quiet", label: "Тихий" },
] as const;

export type ZoneId = (typeof ZONES)[number]["id"];

export function zoneLabel(id: ZoneId) {
  return ZONES.find((zone) => zone.id === id)?.label ?? "Зал";
}
