import * as Dialog from "@radix-ui/react-dialog";
import { Heart, Minus, Plus, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  EXTRAS,
  MILKS,
  SIZES,
  defaultSelection,
  getProduct,
  unitPrice,
  type MilkId,
  type SizeId,
} from "@/data/menu";
import { rub } from "@/lib/ru";
import { cn } from "@/lib/cn";
import { useCafe } from "@/store/cafe";

export function ProductDialog() {
  const productId = useCafe((state) => state.productId);
  const close = useCafe((state) => state.closeProduct);
  const addLine = useCafe((state) => state.addLine);
  const flash = useCafe((state) => state.flash);
  const favorites = useCafe((state) => state.favorites);
  const toggleFavorite = useCafe((state) => state.toggleFavorite);
  const product = productId ? getProduct(productId) : undefined;

  const [size, setSize] = useState<SizeId | null>(null);
  const [milk, setMilk] = useState<MilkId | null>(null);
  const [extras, setExtras] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!product) return;
    const next = defaultSelection(product);
    setSize(next.size);
    setMilk(next.milk);
    setExtras(next.extras);
    setNote("");
    setQty(1);
  }, [product]);

  const unit = product ? unitPrice(product, { size, milk, extras }) : 0;
  const favorite = product ? favorites.includes(product.id) : false;

  function add() {
    if (!product) return;
    addLine({ productId: product.id, qty, size, milk, extras, note });
    flash(qty > 1 ? `${qty} × ${product.name} в заказе` : `${product.name} в заказе`);
    close();
  }

  return (
    <Dialog.Root open={Boolean(product)} onOpenChange={(open) => { if (!open) close(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="atlas-overlay fixed inset-0 z-50 bg-ink/40" />
        {product && (
          <Dialog.Content className="atlas-panel fixed inset-x-0 bottom-0 z-50 flex flex-col overflow-hidden rounded-t-panel border border-line bg-sheet outline-none md:inset-auto md:top-1/2 md:left-1/2 md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-panel">
            <Dialog.Close className="focus-ring absolute top-3 right-3 z-10 grid size-11 place-items-center rounded-control bg-sheet text-ink">
              <X className="size-5" />
              <span className="sr-only">Закрыть</span>
            </Dialog.Close>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {product.photo && (
                <img
                  src={product.photo}
                  alt=""
                  className="aspect-square w-full rounded-control object-cover"
                />
              )}
              <div className={product.photo ? "mt-4 flex items-start justify-between gap-3" : "pr-12"}>
                <div className="min-w-0">
                  <Dialog.Title className="display-sm">{product.name}</Dialog.Title>
                  <Dialog.Description className="mt-2 text-pretty text-muted">
                    {product.taste}
                  </Dialog.Description>
                </div>
                <button
                  type="button"
                  className="press focus-ring grid size-11 shrink-0 place-items-center rounded-control border border-line"
                  aria-pressed={favorite}
                  aria-label={favorite ? "Убрать из избранного" : "В избранное"}
                  onClick={() => toggleFavorite(product.id)}
                >
                  <Heart className={cn("size-5", favorite && "fill-ink")} />
                </button>
              </div>
              <p className="mt-3 text-sm text-muted">{product.blurb}</p>
              {product.recipe && (
                <p className="mt-3 rounded-control border border-line px-3 py-3 text-sm">{product.recipe}</p>
              )}
              {product.allergen && (
                <p className="mt-3 text-sm text-muted">В составе: {product.allergen}</p>
              )}
              {product.sizes && (
                <fieldset className="mt-5">
                  <legend className="text-sm text-muted">Объём</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SIZES.map((item) => (
                      <Choice key={item.id} pressed={size === item.id} onClick={() => setSize(item.id)}>
                        {item.label}
                      </Choice>
                    ))}
                  </div>
                </fieldset>
              )}
              {product.milk && (
                <fieldset className="mt-5">
                  <legend className="text-sm text-muted">Молоко</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {MILKS.map((item) => (
                      <Choice key={item.id} pressed={milk === item.id} onClick={() => setMilk(item.id)}>
                        {item.label}
                        {item.add > 0 ? ` +${item.add}` : ""}
                      </Choice>
                    ))}
                  </div>
                </fieldset>
              )}
              {product.extras.length > 0 && (
                <fieldset className="mt-5">
                  <legend className="text-sm text-muted">Добавить</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {EXTRAS.filter((item) => product.extras.includes(item.id)).map((item) => {
                      const on = extras.includes(item.id);
                      return (
                        <Choice
                          key={item.id}
                          pressed={on}
                          onClick={() =>
                            setExtras((current) =>
                              on ? current.filter((id) => id !== item.id) : [...current, item.id],
                            )
                          }
                        >
                          {item.label}
                          {item.add > 0 ? ` +${item.add}` : ""}
                        </Choice>
                      );
                    })}
                  </div>
                </fieldset>
              )}
              <label className="mt-5 block text-sm text-muted" htmlFor="drink-note">
                Пожелание
                <textarea
                  id="drink-note"
                  className="field mt-2"
                  maxLength={140}
                  value={note}
                  placeholder="Без сахара, погорячее"
                  onChange={(event) => setNote(event.target.value)}
                />
              </label>
            </div>
            <div className="flex items-center gap-3 border-t border-line p-4">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="press focus-ring grid size-11 place-items-center rounded-control border border-line"
                  aria-label="Меньше"
                  onClick={() => setQty((value) => Math.max(1, value - 1))}
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-6 text-center tabular-nums">{qty}</span>
                <button
                  type="button"
                  className="press focus-ring grid size-11 place-items-center rounded-control border border-line"
                  aria-label="Больше"
                  onClick={() => setQty((value) => Math.min(9, value + 1))}
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <Button className="min-w-0 flex-1" size="lg" onClick={add}>
                Добавить · {rub(unit * qty)}
              </Button>
            </div>
          </Dialog.Content>
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Choice({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "press focus-ring h-11 rounded-control border px-3 text-sm",
        pressed ? "border-roast bg-roast text-paper" : "border-line bg-sheet text-ink",
      )}
    >
      {children}
    </button>
  );
}
