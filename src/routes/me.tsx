import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { StampRow } from "@/components/stamp-row";
import { OrderTicket } from "@/components/order-ticket";
import { PLACES, zoneLabel } from "@/data/place";
import { orderTitle } from "@/data/order";
import { parseIsoDay, plural, rub } from "@/lib/ru";
import { useCafeReady, useNow } from "@/lib/use-cafe-ready";
import { useCafe } from "@/store/cafe";

export const Route = createFileRoute("/me")({ component: MePage });

function MePage() {
  const ready = useCafeReady();
  const name = useCafe((state) => state.name);
  const phone = useCafe((state) => state.phone);
  const address = useCafe((state) => state.address);
  const setProfile = useCafe((state) => state.setProfile);
  const stamps = useCafe((state) => state.stamps);
  const orders = useCafe((state) => state.orders);
  const reservations = useCafe((state) => state.reservations);
  const favorites = useCafe((state) => state.favorites);
  const collectOrder = useCafe((state) => state.collectOrder);
  const active = orders.some((order) => !order.collected);
  const now = useNow(ready && active);

  return (
    <div className="grid max-w-2xl gap-10">
      <header>
        <h1 className="display">Карта</h1>
        <p className="mt-3 text-pretty text-muted">
          Имя, заказы и отметки остаются на этом телефоне. Это не аккаунт — просто ваша стойка.
        </p>
      </header>

      <section className="rounded-panel border border-line bg-sheet p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="display-sm">Чашки</h2>
          <p className="tabular-nums text-muted">{ready ? Math.min(stamps, 8) : 0}/8</p>
        </div>
        <div className="mt-4">
          <StampRow stamps={ready ? stamps : 0} />
        </div>
        <p className="mt-4 text-sm text-pretty text-muted">
          {ready && stamps >= 8
            ? "Подарок уже можно списать в заказе."
            : "Каждая чашка кофе — отметка. Восьмая открывает напиток."}
        </p>
        <p className="mt-2 text-sm text-muted">
          В избранном {ready ? favorites.length : 0}. Смотреть в меню, фильтр «Избранное».
        </p>
      </section>

      <section className="grid gap-4">
        <h2 className="display-sm">Как к вам обращаться</h2>
        <label className="block text-sm text-muted" htmlFor="me-name">
          Имя
          <input
            id="me-name"
            className="field mt-2"
            autoComplete="name"
            value={ready ? name : ""}
            disabled={!ready}
            onChange={(event) => setProfile({ name: event.target.value })}
          />
        </label>
        <label className="block text-sm text-muted" htmlFor="me-phone">
          Телефон
          <input
            id="me-phone"
            className="field mt-2"
            type="tel"
            autoComplete="tel"
            value={ready ? phone : ""}
            disabled={!ready}
            onChange={(event) => setProfile({ phone: event.target.value })}
          />
        </label>
        <label className="block text-sm text-muted" htmlFor="me-address">
          Адрес для доставки
          <input
            id="me-address"
            className="field mt-2"
            autoComplete="street-address"
            value={ready ? address : ""}
            disabled={!ready}
            onChange={(event) => setProfile({ address: event.target.value })}
          />
        </label>
      </section>

      <section>
        <h2 className="display-sm">Заказы</h2>
        {!ready || orders.length === 0 ? (
          <p className="mt-3 text-sm text-pretty text-muted">
            Когда подтвердите заказ, он появится здесь и на главной, пока его не заберёте.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {orders.map((order) =>
              order.collected ? (
                <li key={order.id} className="rounded-card border border-line px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-medium">{order.number}</p>
                    <p className="text-sm tabular-nums text-muted">{rub(order.total)}</p>
                  </div>
                  <p className="mt-1 text-sm text-pretty text-muted">{orderTitle(order)}</p>
                </li>
              ) : (
                <li key={order.id}>
                  <OrderTicket order={order} now={now} onCollect={() => collectOrder(order.id)} />
                </li>
              ),
            )}
          </ul>
        )}
        <ButtonLink />
      </section>

      <section>
        <h2 className="display-sm">Брони</h2>
        {!ready || reservations.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Нет броней. <Link to="/reserve" className="focus-ring rounded-control text-ink underline decoration-line underline-offset-4">Выбрать стол</Link>
          </p>
        ) : (
          <ul className="mt-4 grid gap-2">
            {reservations.map((item) => (
              <li key={item.id} className="text-sm">
                {format(parseIsoDay(item.day), "d MMMM", { locale: ru })}, {item.time} · {zoneLabel(item.zone)} ·{" "}
                {item.guests} {plural(item.guests, "гость", "гостя", "гостей")}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="display-sm">Адреса</h2>
        {PLACES.map((place) => (
          <article key={place.id}>
            <h3 className="font-medium">{place.name}</h3>
            <p className="text-sm text-muted">
              {place.address} · {place.hours}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}

function ButtonLink() {
  return (
    <p className="mt-4">
      <Link to="/menu" className="focus-ring rounded-control text-sm text-ink underline decoration-line underline-offset-4">
        Собрать новый заказ
      </Link>
    </p>
  );
}
