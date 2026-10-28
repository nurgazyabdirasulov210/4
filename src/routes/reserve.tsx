import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { reserveTimes, ZONES, zoneLabel, type ZoneId } from "@/data/place";
import { digits, isoDay, parseIsoDay, plural } from "@/lib/ru";
import { cn } from "@/lib/cn";
import { useCafeReady } from "@/lib/use-cafe-ready";
import { useCafe } from "@/store/cafe";

export const Route = createFileRoute("/reserve")({ component: ReservePage });

function ReservePage() {
  const ready = useCafeReady();
  const reservations = useCafe((state) => state.reservations);
  const addReservation = useCafe((state) => state.addReservation);
  const cancelReservation = useCafe((state) => state.cancelReservation);
  const storedName = useCafe((state) => state.name);
  const storedPhone = useCafe((state) => state.phone);

  const [days, setDays] = useState<Date[] | null>(null);
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [zone, setZone] = useState<ZoneId>("window");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [seeded, setSeeded] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const current = new Date();
    const list = Array.from({ length: 7 }, (_, index) => {
      const next = new Date(current);
      next.setDate(current.getDate() + index);
      next.setHours(12, 0, 0, 0);
      return next;
    });
    setNow(current);
    setDays(list);
    setDay(isoDay(list[0] ?? current));
  }, []);

  useEffect(() => {
    if (!ready || seeded) return;
    setName(storedName);
    setPhone(storedPhone);
    setSeeded(true);
  }, [ready, seeded, storedName, storedPhone]);

  const selected = day ? parseIsoDay(day) : null;
  const times = selected && now ? reserveTimes(selected, now) : [];

  useEffect(() => {
    if (times.length === 0) return;
    if (!times.includes(time)) setTime(times[0] ?? "");
  }, [day, times, time]);

  function submit(event: FormEvent) {
    event.preventDefault();
    setDone("");
    if (!day || !time) {
      setError("Выберите день и время.");
      return;
    }
    if (name.trim().length < 2) {
      setError("Как к вам обращаться?");
      return;
    }
    if (digits(phone).length < 10) {
      setError("Нужен телефон — на случай, если стол освободится раньше.");
      return;
    }
    if (reservations.some((item) => item.day === day && item.time === time)) {
      setError("На это время у вас уже есть бронь.");
      return;
    }
    addReservation({ day, time, guests, zone, name, phone, note });
    setError("");
    setNote("");
    setDone(`${zoneLabel(zone).toLowerCase()}, ${format(parseIsoDay(day), "d MMMM", { locale: ru })} в ${time}. Держим стол 15 минут.`);
  }

  const upcoming = [...reservations].sort((a, b) => `${a.day}${a.time}`.localeCompare(`${b.day}${b.time}`));

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <form className="grid max-w-xl gap-6" onSubmit={submit}>
        <div>
          <h1 className="display">Стол</h1>
          <p className="mt-3 text-pretty text-muted">
            Бронь на Бронной. Большая компания — от восьми человек — лучше позвонить в кофейню.
          </p>
        </div>

        <fieldset>
          <legend className="text-sm text-muted">День</legend>
          <div className="scroll-none mt-2 flex min-w-0 gap-2 overflow-x-auto">
            {(days ?? []).map((item) => {
              const id = isoDay(item);
              const selectedDay = id === day;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={selectedDay}
                  onClick={() => setDay(id)}
                  className={cn(
                    "press focus-ring h-16 w-16 shrink-0 rounded-control border text-sm",
                    selectedDay ? "border-roast bg-roast text-paper" : "border-line bg-sheet text-ink",
                  )}
                >
                  <span className="block">{format(item, "EEEEEE", { locale: ru })}</span>
                  <span className="block tabular-nums">{format(item, "d")}</span>
                </button>
              );
            })}
            {!days && <div className="h-16" />}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm text-muted">Время</legend>
          {days && times.length === 0 ? (
            <p className="mt-2 text-sm text-muted">На этот день свободных слотов нет.</p>
          ) : (
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {times.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={time === item}
                  onClick={() => setTime(item)}
                  className={cn(
                    "press focus-ring h-11 rounded-control border text-sm tabular-nums",
                    time === item ? "border-roast bg-roast text-paper" : "border-line bg-sheet text-ink",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </fieldset>

        <div>
          <p className="text-sm text-muted">Гости</p>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              className="press focus-ring grid size-11 place-items-center rounded-control border border-line"
              aria-label="Меньше гостей"
              onClick={() => setGuests((value) => Math.max(1, value - 1))}
            >
              −
            </button>
            <span className="w-24 text-center tabular-nums">
              {guests} {plural(guests, "гость", "гостя", "гостей")}
            </span>
            <button
              type="button"
              className="press focus-ring grid size-11 place-items-center rounded-control border border-line"
              aria-label="Больше гостей"
              onClick={() => setGuests((value) => Math.min(8, value + 1))}
            >
              +
            </button>
          </div>
        </div>

        <fieldset>
          <legend className="text-sm text-muted">Где сесть</legend>
          <div className="mt-2 grid grid-cols-3 gap-1 rounded-chip border border-line bg-sheet p-1">
            {ZONES.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={zone === item.id}
                onClick={() => setZone(item.id)}
                className={cn(
                  "press focus-ring h-11 rounded-control text-sm",
                  zone === item.id ? "bg-roast text-paper" : "text-ink",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block text-sm text-muted" htmlFor="reserve-name">
          Имя
          <input
            id="reserve-name"
            className="field mt-2"
            autoComplete="name"
            value={name}
            disabled={!ready}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="block text-sm text-muted" htmlFor="reserve-phone">
          Телефон
          <input
            id="reserve-phone"
            className="field mt-2"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={phone}
            disabled={!ready}
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>
        <label className="block text-sm text-muted" htmlFor="reserve-note">
          Повод, если есть
          <textarea
            id="reserve-note"
            className="field mt-2"
            maxLength={160}
            value={note}
            placeholder="День рождения, тихо поработать"
            onChange={(event) => setNote(event.target.value)}
          />
        </label>

        {error && (
          <p className="text-sm text-clay" role="alert">
            {error}
          </p>
        )}
        {done && <p className="text-sm text-moss">{done}</p>}

        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={!ready || times.length === 0}>
          Забронировать
        </Button>
      </form>

      <section>
        <h2 className="display-sm">Ваши брони</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-pretty text-muted">Пока пусто. Стол у окна лучше брать заранее на вечер пятницы.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {upcoming.map((item) => (
              <li key={item.id} className="rounded-card border border-line bg-sheet p-4">
                <p className="font-medium">
                  {format(parseIsoDay(item.day), "d MMMM", { locale: ru })}, {item.time}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {zoneLabel(item.zone)} · {item.guests} {plural(item.guests, "гость", "гостя", "гостей")} · {item.name}
                </p>
                {item.note && <p className="mt-2 text-sm text-pretty">{item.note}</p>}
                <button
                  type="button"
                  className="focus-ring mt-3 text-sm text-ink underline decoration-line underline-offset-4"
                  onClick={() => cancelReservation(item.id)}
                >
                  Отменить
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
