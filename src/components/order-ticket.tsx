import { Button } from "@/components/ui/button";
import { phaseOf, SERVICE_LABEL, orderTitle, type Phase } from "@/data/order";
import type { Order } from "@/store/cafe";

const STEPS: Phase[] = ["принят", "готовится", "готов"];

export function OrderTicket({
  order,
  now,
  onCollect,
}: {
  order: Order;
  now: number;
  onCollect?: () => void;
}) {
  const phase = phaseOf(order, now || order.createdAt);
  const current = STEPS.indexOf(phase === "выдан" ? "готов" : phase);

  return (
    <article className="rounded-panel border border-line bg-sheet p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="display-sm">{order.number}</h2>
        <p className="text-sm text-muted">
          {SERVICE_LABEL[order.service]} · {order.slot}
        </p>
      </div>
      <ol className="mt-4 grid grid-cols-3 gap-2">
        {STEPS.map((step, index) => {
          const reached = phase === "выдан" || index <= current;
          return (
            <li key={step} className="min-w-0">
              <p className={reached ? "text-sm text-ink" : "text-sm text-faint"}>{step}</p>
              <span className={reached ? "mt-2 block h-0.5 bg-roast" : "mt-2 block h-0.5 bg-line"} />
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm text-pretty text-muted">{orderTitle(order)}</p>
      {phase === "готов" && onCollect && (
        <Button className="mt-4 w-full sm:w-auto" onClick={onCollect}>
          Забрал
        </Button>
      )}
      {phase === "выдан" && <p className="mt-3 text-sm text-moss">Выдан</p>}
    </article>
  );
}
