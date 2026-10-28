import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { OrderTicket } from "@/components/order-ticket";
import { describeLine, getProduct } from "@/data/menu";
import { canRedeem, SERVICE_LABEL, summarize, FREE_DELIVERY_FROM, DELIVERY_FEE } from "@/data/order";
import { orderSlots } from "@/data/place";
import { digits, rub } from "@/lib/ru";
import { cn } from "@/lib/cn";
import { useCafeReady, useNow } from "@/lib/use-cafe-ready";
import { useCafe, type Order, type Service } from "@/store/cafe";

export const Route = createFileRoute("/cart")({ component: CartPage });

const SERVICES: Service[] = ["here", "away", "delivery"];

function CartPage() {
  const ready = useCafeReady();
  const lines = useCafe((state) => state.lines);
  const stamps = useCafe((state) => state.stamps);
  const setQty = useCafe((state) => state.setQty);
  const placeOrder = useCafe((state) => state.placeOrder);
  const storedName = useCafe((state) => state.name);
  const storedPhone = useCafe((state) => state.phone);
  const storedAddress = useCafe((state) => state.address);

  const [service, setService] = useState<Service>("here");
  const [slot, setSlot] = useState("now");
  const [slots, setSlots] = useState<{ id: string; label: string }[] | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [table, setTable] = useState("");
  const [comment, setComment] = useState("");
  const [redeem, setRedeem] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState<Order | null>(null);
  const [seeded, setSeeded] = useState(false);
  const now = useNow(Boolean(placed));

  useEffect(() => {
    const list = orderSlots(new Date());
    setSlots(list);
    setSlot(list[0]?.id ?? "now");
  }, []);

  useEffect(() => {
    if (!ready || seeded) return;
    setName(storedName);
    setPhone(storedPhone);
    setAddress(storedAddress);
    setSeeded(true);
  }, [ready, seeded, storedName, storedPhone, storedAddress]);

  if (placed) {
    return (
      <div className="mx-auto grid max-w-lg gap-6">
        <div>
          <p className="text-sm text-muted">Заказ принят</p>
          <h1 className="display mt-2">Готовим</h1>
          <p className="mt-3 text-pretty text-muted">
            Оплата на месте или курьеру. Номер назовите бариста.
          </p>
        </div>
        <OrderTicket order={placed} now={now} />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="w-full sm:w-auto">
            <Link to="/">На главную</Link>
          </Button>
          <Button asChild variant="quiet" className="w-full sm:w-auto">
            <Link to="/menu">Ещё в меню</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="max-w-md">
        <h1 className="display">Заказ пуст</h1>
        <p className="mt-3 text-pretty text-muted">В меню десять напитков и витрина. Фильтр дня — Гуджи.</p>
        <Button asChild className="mt-6">
          <Link to="/menu">Перейти в меню</Link>
        </Button>
      </div>
    );
  }

  const redeemOn = redeem && canRedeem(lines, ready ? stamps : 0);
  const bill = summarize(lines, { redeem: redeemOn, service });
  const slotLabel = slots?.find((item) => item.id === slot)?.label ?? "Сейчас";

  function submit(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError("Как к вам обращаться?");
      return;
    }
    if (service === "delivery") {
      if (digits(phone).length < 10) {
        setError("Для доставки нужен телефон.");
        return;
      }
      if (address.trim().length < 6) {
        setError("Напишите адрес: улица и дом.");
        return;
      }
    }
    const order = placeOrder({
      total: bill.total,
      service,
      slot: slotLabel,
      name,
      phone,
      address: service === "delivery" ? address : "",
      table: service === "here" ? table : "",
      comment,
      freeRedeemed: redeemOn,
    });
    if (order) setPlaced(order);
  }

  return (
    <form className="mx-auto grid max-w-xl gap-8" onSubmit={submit}>
      <div>
        <h1 className="display">Заказ</h1>
        <p className="mt-3 text-pretty text-muted">Соберём к стойке, отдадим с собой или привезём. Карту в приложении не просим.</p>
      </div>

      <ul className="grid gap-4">
        {lines.map((line) => {
          const product = getProduct(line.productId);
          if (!product) return null;
          const detail = describeLine(product, line);
          return (
            <li key={line.key} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-line pb-4">
              <div className="min-w-0">
                <p className="font-medium">{product.name}</p>
                {detail && <p className="mt-1 text-sm text-pretty text-muted">{detail}</p>}
                <div className="mt-3 flex items-center gap-1">
                  <button type="button" className="press focus-ring grid size-11 place-items-center rounded-control border border-line" aria-label="Меньше" onClick={() => setQty(line.key, line.qty - 1)}>
                    <Minus className="size-4" />
                  </button>
                  <span className="w-6 text-center tabular-nums">{line.qty}</span>
                  <button type="button" className="press focus-ring grid size-11 place-items-center rounded-control border border-line" aria-label="Больше" onClick={() => setQty(line.key, line.qty + 1)}>
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <p className="tabular-nums">{rub(bill.rows.find((row) => row.line.key === line.key)?.sum ?? 0)}</p>
                <button type="button" className="press focus-ring grid size-11 place-items-center rounded-control text-muted" aria-label={`Убрать ${product.name}`} onClick={() => setQty(line.key, 0)}>
                  <Trash2 className="size-5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <fieldset>
        <legend className="text-sm text-muted">Как получить</legend>
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-chip border border-line bg-sheet p-1">
          {SERVICES.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={service === item}
              onClick={() => setService(item)}
              className={cn(
                "press focus-ring h-11 rounded-control text-sm",
                service === item ? "bg-roast text-paper" : "text-ink",
              )}
            >
              {SERVICE_LABEL[item]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm text-muted">Когда</legend>
        <div className="scroll-none mt-2 flex min-w-0 gap-2 overflow-x-auto md:flex-wrap">
          {(slots ?? [{ id: "now", label: "Сейчас" }]).map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={slot === item.id}
              onClick={() => setSlot(item.id)}
              className={cn(
                "press focus-ring h-11 shrink-0 rounded-control border px-3 text-sm tabular-nums",
                slot === item.id ? "border-roast bg-roast text-paper" : "border-line bg-sheet text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>

      {service === "here" && (
        <label className="block text-sm text-muted" htmlFor="table">
          Стол, если уже сели
          <select id="table" className="field mt-2" value={table} onChange={(event) => setTable(event.target.value)}>
            <option value="">У бариста</option>
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={String(index + 1)}>
                Стол {index + 1}
              </option>
            ))}
          </select>
        </label>
      )}

      {service === "delivery" && (
        <label className="block text-sm text-muted" htmlFor="address">
          Адрес
          <input
            id="address"
            className="field mt-2"
            autoComplete="street-address"
            value={address}
            placeholder="Улица, дом, квартира"
            onChange={(event) => setAddress(event.target.value)}
          />
          <span className="mt-2 block">
            {rub(DELIVERY_FEE)} или бесплатно от {rub(FREE_DELIVERY_FROM)}.
          </span>
        </label>
      )}

      <div className="grid gap-4">
        <label className="block text-sm text-muted" htmlFor="order-name">
          Имя
          <input
            id="order-name"
            className="field mt-2"
            autoComplete="name"
            value={name}
            disabled={!ready}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="block text-sm text-muted" htmlFor="order-phone">
          Телефон{service === "delivery" ? "" : " — если удобно"}
          <input
            id="order-phone"
            className="field mt-2"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={phone}
            disabled={!ready}
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>
        <label className="block text-sm text-muted" htmlFor="order-comment">
          Комментарий
          <textarea
            id="order-comment"
            className="field mt-2"
            maxLength={180}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </label>
      </div>

      {ready && canRedeem(lines, stamps) && (
        <button
          type="button"
          aria-pressed={redeem}
          onClick={() => setRedeem((value) => !value)}
          className={cn(
            "press focus-ring rounded-card border p-4 text-left",
            redeem ? "border-roast bg-roast text-paper" : "border-line bg-sheet text-ink",
          )}
        >
          <span className="block font-medium">Списать карту</span>
          <span className={cn("mt-1 block text-sm", redeem ? "text-paper" : "text-muted")}>
            Самый дорогой напиток в этом заказе — за наш счёт. На карте {stamps}.
          </span>
        </button>
      )}

      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Сумма</dt>
          <dd className="tabular-nums">{rub(bill.subtotal)}</dd>
        </div>
        {bill.discount > 0 && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Карта чашек</dt>
            <dd className="tabular-nums">−{rub(bill.discount)}</dd>
          </div>
        )}
        {service === "delivery" && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Доставка</dt>
            <dd className="tabular-nums">{bill.delivery === 0 ? "0 ₽" : rub(bill.delivery)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3 text-base">
          <dt className="font-medium">Итого</dt>
          <dd className="font-medium tabular-nums">{rub(bill.total)}</dd>
        </div>
      </dl>

      {error && (
        <p className="text-sm text-clay" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full">
        Подтвердить заказ · {rub(bill.total)}
      </Button>
    </form>
  );
}
