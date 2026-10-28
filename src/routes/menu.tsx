import { createFileRoute } from "@tanstack/react-router";
import { Heart, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { CATEGORIES, defaultSelection, products, type CategoryId } from "@/data/menu";
import { rub } from "@/lib/ru";
import { cn } from "@/lib/cn";
import { useCafe } from "@/store/cafe";

export const Route = createFileRoute("/menu")({ component: MenuPage });

type FilterId = "all" | "fav" | CategoryId;

function MenuPage() {
  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");
  const favorites = useCafe((state) => state.favorites);
  const openProduct = useCafe((state) => state.openProduct);
  const addLine = useCafe((state) => state.addLine);
  const flash = useCafe((state) => state.flash);
  const toggleFavorite = useCafe((state) => state.toggleFavorite);
  const lines = useCafe((state) => state.lines);

  const qtyByProduct = useMemo(() => {
    const map = new Map<string, number>();
    for (const line of lines) map.set(line.productId, (map.get(line.productId) ?? 0) + line.qty);
    return map;
  }, [lines]);

  const filtered = products.filter((product) => {
    if (filter === "fav" && !favorites.includes(product.id)) return false;
    if (filter !== "all" && filter !== "fav" && product.category !== filter) return false;
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [product.name, product.blurb, product.taste].some((value) => value.toLowerCase().includes(needle));
  });
  const withPhoto = filtered.filter((product) => product.photo);
  const withoutPhoto = filtered.filter((product) => !product.photo);

  return (
    <div className="min-w-0">
      <h1 className="display">Меню</h1>
      <p className="mt-3 max-w-xl text-pretty text-muted">
        Цена на карточке — за обычную чашку. Объём, молоко и сироп меняются в карточке.
      </p>
      <div className="relative mt-6">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted" />
        <input
          className="field field-icon"
          value={query}
          placeholder="Найти: гуджи, раф, круассан"
          aria-label="Поиск по меню"
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="scroll-none mt-4 flex min-w-0 gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={cn(
              "press focus-ring h-11 shrink-0 rounded-full px-4 text-sm",
              filter === item.id ? "bg-roast text-paper" : "border border-line bg-sheet text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 max-w-md text-pretty text-muted">
          Ничего не нашли. Попробуйте «гуджи», «раф» или снимите фильтр.
        </p>
      )}

      {withPhoto.length > 0 && (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {withPhoto.map((product) => {
            const inCart = qtyByProduct.get(product.id) ?? 0;
            const favorite = favorites.includes(product.id);
            return (
              <li key={product.id} className="relative rounded-card border border-line bg-sheet p-3">
                <button type="button" className="focus-ring block w-full rounded-control text-left" onClick={() => openProduct(product.id)}>
                  <img src={product.photo ?? ""} alt="" className="aspect-square w-full rounded-control object-cover" />
                  <span className="mt-3 block font-medium">{product.name}</span>
                  <span className="mt-1 block text-sm text-pretty text-muted">{product.blurb}</span>
                </button>
                <button
                  type="button"
                  className="press focus-ring absolute top-5 right-5 grid size-11 place-items-center rounded-control bg-sheet text-ink"
                  aria-pressed={favorite}
                  aria-label={favorite ? `Убрать ${product.name} из избранного` : `${product.name} в избранное`}
                  onClick={() => toggleFavorite(product.id)}
                >
                  <Heart className={cn("size-5", favorite && "fill-ink")} />
                </button>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="tabular-nums">
                    {rub(product.price)}
                    {inCart > 0 && <span className="ml-2 text-sm text-muted">в заказе {inCart}</span>}
                  </p>
                  <button
                    type="button"
                    className="press focus-ring grid size-11 place-items-center rounded-control bg-roast text-paper"
                    aria-label={`Добавить ${product.name}`}
                    onClick={() => {
                      addLine(defaultSelection(product));
                      flash(`${product.name} в заказе`);
                    }}
                  >
                    <Plus className="size-5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {withoutPhoto.length > 0 && (
        <section className="mt-10">
          <h2 className="display-sm">Витрина</h2>
          <p className="mt-2 text-sm text-muted">Выпечка, еда и напитки без кофе — списком, как на доске у кассы.</p>
          <ul className="mt-2">
            {withoutPhoto.map((product) => (
              <li key={product.id} className="flex items-center gap-3 border-b border-line py-4">
                <button type="button" className="focus-ring min-h-11 min-w-0 flex-1 rounded-control text-left" onClick={() => openProduct(product.id)}>
                  <span className="block font-medium">{product.name}</span>
                  <span className="mt-1 block text-sm text-pretty text-muted">{product.blurb}</span>
                </button>
                <span className="shrink-0 tabular-nums">{rub(product.price)}</span>
                <button
                  type="button"
                  className="press focus-ring grid size-11 shrink-0 place-items-center rounded-control bg-roast text-paper"
                  aria-label={`Добавить ${product.name}`}
                  onClick={() => {
                    addLine(defaultSelection(product));
                    flash(`${product.name} в заказе`);
                  }}
                >
                  <Plus className="size-5" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
