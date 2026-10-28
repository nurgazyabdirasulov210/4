import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { OrderTicket } from "@/components/order-ticket";
import { StampRow } from "@/components/stamp-row";
import { FEATURED, defaultSelection, getProduct } from "@/data/menu";
import { greeting, isOpen, openLabel, pace, PLACES } from "@/data/place";
import { plural, rub } from "@/lib/ru";
import { useCafeReady, useMounted, useNow } from "@/lib/use-cafe-ready";
import { useCafe } from "@/store/cafe";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const ready = useCafeReady();
  const mounted = useMounted();
  const openProduct = useCafe((state) => state.openProduct);
  const addLine = useCafe((state) => state.addLine);
  const flash = useCafe((state) => state.flash);
  const stamps = useCafe((state) => state.stamps);
  const orders = useCafe((state) => state.orders);
  const collectOrder = useCafe((state) => state.collectOrder);
  const active = ready ? orders.find((order) => !order.collected) : undefined;
  const now = useNow(Boolean(active));
  const clock = mounted ? new Date() : null;
  const livePace = clock ? pace(clock) : null;

  return (
    <div className="grid min-w-0 gap-10">
      {active && <OrderTicket order={active} now={now} onCollect={() => collectOrder(active.id)} />}

      <header className="max-w-2xl">
        <p className="text-sm text-muted">
          {clock ? `${greeting(clock)} · ` : ""}
          Малая Бронная, 24
          {clock ? ` · ${openLabel(clock)}` : ""}
        </p>
        <h1 className="display mt-3">Фильтр дня — Эфиопия Гуджи</h1>
        <p className="mt-4 max-w-xl text-pretty text-muted">
          Жасмин, бергамот и белый персик. Светлая обжарка, вода 93°.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button asChild className="w-full sm:w-auto">
            <Link to="/menu">Открыть меню</Link>
          </Button>
          <Button asChild variant="quiet" className="w-full sm:w-auto">
            <Link to="/reserve">Забронировать стол</Link>
          </Button>
        </div>
      </header>

      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.75fr)]">
        <figure>
          <img
            src="/photos/hero.jpg"
            alt="Зал кофейни: ореховая стойка, эспрессо-машина и утренний свет"
            className="frame-wide w-full rounded-card object-cover"
          />
          <figcaption className="mt-2 text-sm text-muted">Зал на Бронной</figcaption>
        </figure>
        <div className="grid gap-3">
          <article className="rounded-panel border border-line bg-sheet p-4">
            <p className="text-sm text-muted">Сейчас на фильтре</p>
            <h2 className="mt-1 font-medium">Гуджи, 290 ₽</h2>
            <p className="mt-2 text-sm text-pretty text-muted">Чашка 300 мл. Можно забрать с собой или сесть у окна.</p>
            <Button
              className="mt-4 w-full"
              onClick={() => {
                const product = getProduct("filter");
                if (!product) return;
                addLine(defaultSelection(product));
                flash("Фильтр Гуджи в заказе");
              }}
            >
              Добавить фильтр
            </Button>
          </article>
          <article className="rounded-card border border-line bg-sheet p-4">
            <p className="text-sm text-muted">{livePace ? "Ожидание" : "Бар"}</p>
            <p className="mt-1 font-display text-2xl tabular-nums tracking-tight">
              {livePace ? `${livePace.minutes} мин` : clock && !isOpen(clock) ? "Закрыто" : "—"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {livePace
                ? `В очереди ${livePace.queue} ${plural(livePace.queue, "чашка", "чашки", "чашек")}`
                : clock && !isOpen(clock)
                  ? "Заказ можно оставить к открытию"
                  : "Смотрим очередь"}
            </p>
          </article>
          <article className="rounded-card border border-line bg-sheet p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-medium">Карта чашек</h2>
              <p className="text-sm tabular-nums text-muted">{Math.min(stamps, 8)}/8</p>
            </div>
            <div className="mt-3">
              <StampRow stamps={ready ? stamps : 0} />
            </div>
            <p className="mt-3 text-sm text-muted">{stampCopy(ready ? stamps : 0)}</p>
          </article>
        </div>
      </div>

      <section className="min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="display-sm">С чего начать</h2>
          <Link to="/menu" className="focus-ring rounded-control text-sm text-ink">
            Всё меню
          </Link>
        </div>
        <div className="scroll-none mt-4 flex min-w-0 gap-3 overflow-x-auto">
          {FEATURED.map((id) => {
            const product = getProduct(id);
            if (!product) return null;
            return (
              <button
                key={id}
                type="button"
                onClick={() => openProduct(id)}
                className="press focus-ring w-44 shrink-0 rounded-card border border-line bg-sheet p-3 text-left"
              >
                <img src={product.photo ?? ""} alt="" className="aspect-square w-full rounded-control object-cover" />
                <span className="mt-3 block font-medium">{product.name}</span>
                <span className="mt-1 block text-sm tabular-nums text-muted">{rub(product.price)}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div>
          <h2 className="text-sm text-muted">Эспрессо</h2>
          <p className="mt-2 text-pretty">18 г, 27 секунд, два шота в капучино и флэт.</p>
        </div>
        <div>
          <h2 className="text-sm text-muted">Фильтр</h2>
          <p className="mt-2 text-pretty">Один лот в день. Сегодня Гуджи, соотношение 1:16.</p>
        </div>
        <div>
          <h2 className="text-sm text-muted">Молоко</h2>
          <p className="mt-2 text-pretty">Греем до 62°. Овсяное и миндальное — в карточке напитка.</p>
        </div>
      </section>

      <section>
        <h2 className="display-sm">Где мы</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {PLACES.map((place) => (
            <article key={place.id} className="rounded-card border border-line bg-sheet p-4">
              <p className="text-sm text-muted">{place.area}</p>
              <h3 className="mt-1 font-medium">{place.name}</h3>
              <p className="mt-2">{place.address}</p>
              <p className="mt-1 text-sm text-muted">{place.hours}</p>
              <p className="mt-3 text-sm text-pretty text-muted">{place.note}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function stampCopy(stamps: number) {
  if (stamps >= 8) return "Можно списать в заказе — один напиток за наш счёт.";
  if (stamps === 0) return "Восемь чашек — и одна за наш счёт.";
  const left = 8 - (stamps % 8);
  return `Ещё ${left} ${plural(left, "чашка", "чашки", "чашек")} до подарка.`;
}
