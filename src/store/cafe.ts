import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getProduct, lineKey, type Selection } from "@/data/menu";
import type { ZoneId } from "@/data/place";

export type Service = "here" | "away" | "delivery";

export type CartLine = Selection & { key: string };

export type Order = {
  id: string;
  number: string;
  createdAt: number;
  lines: CartLine[];
  total: number;
  service: Service;
  slot: string;
  name: string;
  phone: string;
  address: string;
  table: string;
  comment: string;
  collected: boolean;
  freeRedeemed: boolean;
};

export type Reservation = {
  id: string;
  createdAt: number;
  day: string;
  time: string;
  guests: number;
  zone: ZoneId;
  name: string;
  phone: string;
  note: string;
};

type Profile = { name: string; phone: string; address: string };

type PlaceInput = {
  total: number;
  service: Service;
  slot: string;
  name: string;
  phone: string;
  address: string;
  table: string;
  comment: string;
  freeRedeemed: boolean;
};

type CafeState = Profile & {
  lines: CartLine[];
  orders: Order[];
  reservations: Reservation[];
  stamps: number;
  favorites: string[];
  productId: string | null;
  notice: string | null;
  addLine: (line: Selection) => void;
  setQty: (key: string, qty: number) => void;
  placeOrder: (input: PlaceInput) => Order | null;
  collectOrder: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setProfile: (patch: Partial<Profile>) => void;
  addReservation: (input: Omit<Reservation, "id" | "createdAt">) => Reservation;
  cancelReservation: (id: string) => void;
  openProduct: (id: string) => void;
  closeProduct: () => void;
  flash: (message: string) => void;
};

const memoryStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

let noticeTimer: ReturnType<typeof setTimeout> | undefined;

export const useCafe = create<CafeState>()(
  persist(
    (set, get) => ({
      lines: [],
      orders: [],
      reservations: [],
      stamps: 0,
      favorites: [],
      name: "",
      phone: "",
      address: "",
      productId: null,
      notice: null,
      addLine: (line) => {
        const key = lineKey(line);
        const lines = get().lines;
        const found = lines.find((item) => item.key === key);
        const next = found
          ? lines.map((item) =>
              item.key === key ? { ...item, qty: Math.min(9, item.qty + line.qty) } : item,
            )
          : [...lines, { ...line, key, qty: Math.min(9, Math.max(1, line.qty)) }];
        set({ lines: next });
      },
      setQty: (key, qty) => {
        set({
          lines:
            qty <= 0
              ? get().lines.filter((item) => item.key !== key)
              : get().lines.map((item) =>
                  item.key === key ? { ...item, qty: Math.min(9, qty) } : item,
                ),
        });
      },
      placeOrder: (input) => {
        const lines = get().lines;
        if (lines.length === 0) return null;
        const createdAt = Date.now();
        const drinkQty = lines.reduce((sum, line) => {
          const product = getProduct(line.productId);
          return sum + (product?.stamps ? line.qty : 0);
        }, 0);
        let stamps = get().stamps;
        if (input.freeRedeemed && stamps >= 8) stamps -= 8;
        const earned = input.freeRedeemed ? Math.max(0, drinkQty - 1) : drinkQty;
        stamps += earned;
        const order: Order = {
          id: crypto.randomUUID(),
          number: `А-${String(createdAt).slice(-4)}`,
          createdAt,
          lines,
          total: input.total,
          service: input.service,
          slot: input.slot,
          name: input.name.trim(),
          phone: input.phone.trim(),
          address: input.address.trim(),
          table: input.table,
          comment: input.comment.trim(),
          collected: false,
          freeRedeemed: input.freeRedeemed,
        };
        set({
          orders: [order, ...get().orders].slice(0, 20),
          lines: [],
          stamps,
          name: order.name,
          phone: order.phone || get().phone,
          address: order.address || get().address,
        });
        return order;
      },
      collectOrder: (id) =>
        set({
          orders: get().orders.map((order) =>
            order.id === id ? { ...order, collected: true } : order,
          ),
        }),
      toggleFavorite: (id) => {
        const favorites = get().favorites;
        set({
          favorites: favorites.includes(id)
            ? favorites.filter((item) => item !== id)
            : [...favorites, id],
        });
      },
      setProfile: (patch) => set(patch),
      addReservation: (input) => {
        const reservation: Reservation = {
          ...input,
          name: input.name.trim(),
          phone: input.phone.trim(),
          note: input.note.trim(),
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        };
        set({
          reservations: [...get().reservations, reservation].slice(-20),
          name: reservation.name,
          phone: reservation.phone || get().phone,
        });
        return reservation;
      },
      cancelReservation: (id) =>
        set({ reservations: get().reservations.filter((item) => item.id !== id) }),
      openProduct: (id) => set({ productId: id }),
      closeProduct: () => set({ productId: null }),
      flash: (message) => {
        set({ notice: message });
        if (noticeTimer) clearTimeout(noticeTimer);
        noticeTimer = setTimeout(() => {
          if (get().notice === message) set({ notice: null });
        }, 1800);
      },
    }),
    {
      name: "atlas-cafe-v1",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? memoryStorage : localStorage,
      ),
      skipHydration: true,
      partialize: (state) => ({
        lines: state.lines,
        orders: state.orders,
        reservations: state.reservations,
        stamps: state.stamps,
        favorites: state.favorites,
        name: state.name,
        phone: state.phone,
        address: state.address,
      }),
    },
  ),
);
