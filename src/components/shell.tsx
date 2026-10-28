import { Link, useMatchRoute } from "@tanstack/react-router";
import { CalendarDays, Coffee, House, ShoppingBag, Stamp } from "lucide-react";
import type { ReactNode } from "react";
import { ProductDialog } from "@/components/product-dialog";
import { cn } from "@/lib/cn";
import { useCafeReady } from "@/lib/use-cafe-ready";
import { useCafe } from "@/store/cafe";

const NAV = [
  { to: "/", label: "Главная", icon: House, exact: true },
  { to: "/menu", label: "Меню", icon: Coffee, exact: false },
  { to: "/cart", label: "Заказ", icon: ShoppingBag, exact: false },
  { to: "/reserve", label: "Бронь", icon: CalendarDays, exact: false },
  { to: "/me", label: "Карта", icon: Stamp, exact: false },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  useCafeReady();
  const matchRoute = useMatchRoute();
  const count = useCafe((state) => state.lines.reduce((sum, line) => sum + line.qty, 0));
  const notice = useCafe((state) => state.notice);

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <div className="shell-grid mx-auto max-w-6xl">
        <aside className="hidden border-r border-line md:block">
          <div className="sticky top-0 flex h-dvh flex-col px-5 py-8">
            <Link to="/" className="focus-ring rounded-control">
              <Wordmark />
            </Link>
            <nav className="mt-10 grid gap-1">
              {NAV.map((item) => {
                const active = Boolean(matchRoute({ to: item.to, fuzzy: !item.exact }));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "focus-ring flex h-11 items-center gap-3 rounded-control px-3 text-sm",
                      active ? "bg-sheet text-ink" : "text-muted",
                    )}
                  >
                    <Icon className="size-5" />
                    <span className="flex-1">{item.label}</span>
                    {item.to === "/cart" && count > 0 && (
                      <span className="tabular-nums text-ink">{count}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
            <p className="mt-auto text-sm text-pretty text-muted">
              Малая Бронная, 24
              <br />
              Пн–пт 8:00–22:00
            </p>
          </div>
        </aside>
        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-30 border-b border-line bg-paper px-4 py-3 md:hidden">
            <Wordmark />
          </header>
          <main className="min-w-0 flex-1 px-4 pt-5 pb-28 md:px-10 md:pt-10 md:pb-16">{children}</main>
        </div>
      </div>
      <nav className="dock fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {NAV.map((item) => {
            const active = Boolean(matchRoute({ to: item.to, fuzzy: !item.exact }));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "focus-ring relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 text-xs",
                  active ? "text-ink" : "text-muted",
                )}
              >
                <span className="relative">
                  <Icon className="size-5" />
                  {item.to === "/cart" && count > 0 && (
                    <span className="absolute -top-1.5 -right-2 grid min-w-5 place-items-center rounded-full bg-roast px-1 text-xs tabular-nums text-paper">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      {notice && (
        <div className="toast-dock" role="status">
          <p className="rounded-full bg-ink px-4 py-2 text-sm text-paper">{notice}</p>
        </div>
      )}
      <ProductDialog />
    </div>
  );
}

function Wordmark() {
  return (
    <span className="block">
      <span className="block font-display text-2xl leading-none tracking-tight">Атлас</span>
      <span className="text-sm text-muted">кофейня</span>
    </span>
  );
}
