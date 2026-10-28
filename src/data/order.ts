import { getProduct, unitPrice, type Selection } from "@/data/menu";
import type { CartLine, Order, Service } from "@/store/cafe";

export const DELIVERY_FEE = 180;
export const FREE_DELIVERY_FROM = 1200;

export const SERVICE_LABEL: Record<Service, string> = {
  here: "В зале",
  away: "С собой",
  delivery: "Доставка",
};

export type Phase = "принят" | "готовится" | "готов" | "выдан";

export function phaseOf(order: { createdAt: number; collected: boolean }, now: number): Phase {
  if (order.collected) return "выдан";
  const age = now - order.createdAt;
  if (age < 8000) return "принят";
  if (age < 24000) return "готовится";
  return "готов";
}

export function summarize(lines: CartLine[], opts: { redeem: boolean; service: Service }) {
  const rows = lines.map((line) => {
    const product = getProduct(line.productId);
    const unit = product ? unitPrice(product, line) : 0;
    return { line, product, unit, sum: unit * line.qty };
  });
  const subtotal = rows.reduce((sum, row) => sum + row.sum, 0);
  let discount = 0;
  if (opts.redeem) {
    const best = rows
      .filter((row) => row.product?.stamps && row.line.qty > 0)
      .sort((a, b) => b.unit - a.unit)[0];
    if (best) discount = best.unit;
  }
  const after = Math.max(0, subtotal - discount);
  const delivery = opts.service === "delivery" && after < FREE_DELIVERY_FROM ? DELIVERY_FEE : 0;
  return { rows, subtotal, discount, delivery, total: after + delivery };
}

export function orderTitle(order: Order) {
  return order.lines
    .map((line) => {
      const name = getProduct(line.productId)?.name ?? "Позиция";
      return line.qty > 1 ? `${name} ×${line.qty}` : name;
    })
    .join(", ");
}

export function canRedeem(lines: Selection[], stamps: number) {
  if (stamps < 8) return false;
  return lines.some((line) => getProduct(line.productId)?.stamps);
}
