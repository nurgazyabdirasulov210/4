export function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

export function rub(value: number) {
  const abs = Math.abs(Math.round(value));
  const body = String(abs).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  return `${value < 0 ? "−" : ""}${body}\u00a0₽`;
}

export function digits(value: string) {
  return value.replace(/\D/g, "");
}

export function isoDay(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseIsoDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y || 1970, (m || 1) - 1, d || 1);
}
