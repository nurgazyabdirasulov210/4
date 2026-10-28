export type CategoryId = "coffee" | "signature" | "counter";
export type SizeId = "S" | "M" | "L";
export type MilkId = "cow" | "lactose" | "oat" | "almond";

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  price: number;
  blurb: string;
  taste: string;
  photo: string | null;
  sizes: boolean;
  milk: boolean;
  extras: string[];
  stamps: boolean;
  recipe?: string;
  allergen?: string;
};

export const CATEGORIES: { id: "all" | "fav" | CategoryId; label: string }[] = [
  { id: "all", label: "Всё" },
  { id: "coffee", label: "Кофе" },
  { id: "signature", label: "Авторские" },
  { id: "counter", label: "Витрина" },
  { id: "fav", label: "Избранное" },
];

export const SIZES: { id: SizeId; label: string; add: number }[] = [
  { id: "S", label: "200 мл", add: -40 },
  { id: "M", label: "300 мл", add: 0 },
  { id: "L", label: "400 мл", add: 60 },
];

export const MILKS: { id: MilkId; label: string; add: number }[] = [
  { id: "cow", label: "Коровье", add: 0 },
  { id: "lactose", label: "Без лактозы", add: 30 },
  { id: "oat", label: "Овсяное", add: 50 },
  { id: "almond", label: "Миндальное", add: 50 },
];

export const EXTRAS: { id: string; label: string; add: number }[] = [
  { id: "shot", label: "Доп. шот", add: 80 },
  { id: "vanilla", label: "Ваниль", add: 40 },
  { id: "caramel", label: "Карамель", add: 40 },
];

export const products: Product[] = [
  {
    id: "espresso",
    name: "Эспрессо",
    category: "coffee",
    price: 190,
    blurb: "Двойной шот, 18 г",
    taste: "Какао, красное яблоко, короткий хвост.",
    photo: "/photos/espresso.jpg",
    sizes: false,
    milk: false,
    extras: ["shot"],
    stamps: true,
    recipe: "18 г · 36 мл · 93° · 27 секунд",
  },
  {
    id: "americano",
    name: "Американо",
    category: "coffee",
    price: 230,
    blurb: "Эспрессо и горячая вода",
    taste: "Чище чёрного чая. Молоко не мешаем, если не попросите.",
    photo: "/photos/americano.jpg",
    sizes: true,
    milk: false,
    extras: ["shot"],
    stamps: true,
  },
  {
    id: "cappuccino",
    name: "Капучино",
    category: "coffee",
    price: 320,
    blurb: "Плотная пена, два шота",
    taste: "Молоко сладкое, эспрессо всё ещё читается.",
    photo: "/photos/cappuccino.jpg",
    sizes: true,
    milk: true,
    extras: ["shot", "vanilla", "caramel"],
    stamps: true,
    allergen: "молоко",
  },
  {
    id: "flat",
    name: "Флэт уайт",
    category: "coffee",
    price: 340,
    blurb: "Тонкий слой молока",
    taste: "Слаще капучино и почти без пены.",
    photo: "/photos/flat.jpg",
    sizes: true,
    milk: true,
    extras: ["shot", "vanilla", "caramel"],
    stamps: true,
    allergen: "молоко",
  },
  {
    id: "latte",
    name: "Латте",
    category: "coffee",
    price: 330,
    blurb: "Больше молока, мягче",
    taste: "Спокойная чашка, если не хочется горечи.",
    photo: "/photos/latte.jpg",
    sizes: true,
    milk: true,
    extras: ["shot", "vanilla", "caramel"],
    stamps: true,
    allergen: "молоко",
  },
  {
    id: "filter",
    name: "Фильтр Гуджи",
    category: "coffee",
    price: 290,
    blurb: "Эфиопия, мытая, светлая",
    taste: "Жасмин, бергамот, белый персик.",
    photo: "/photos/filter.jpg",
    sizes: true,
    milk: false,
    extras: [],
    stamps: true,
    recipe: "18 г · 300 мл · 93° · 2:30",
  },
  {
    id: "raf",
    name: "Раф",
    category: "signature",
    price: 390,
    blurb: "Сливки и ваниль",
    taste: "Плотный и сладкий. Это не латте.",
    photo: "/photos/raf.jpg",
    sizes: true,
    milk: false,
    extras: [],
    stamps: true,
    allergen: "сливки",
  },
  {
    id: "tonic",
    name: "Эспрессо-тоник",
    category: "signature",
    price: 370,
    blurb: "Тоник, лёд, цедра",
    taste: "Горький и холодный. Хорош после полудня.",
    photo: "/photos/tonic.jpg",
    sizes: false,
    milk: false,
    extras: [],
    stamps: true,
  },
  {
    id: "bumble",
    name: "Бамбл",
    category: "signature",
    price: 380,
    blurb: "Эспрессо и апельсин",
    taste: "Два слоя. Перемешайте, когда захотите.",
    photo: "/photos/bumble.jpg",
    sizes: false,
    milk: false,
    extras: [],
    stamps: true,
  },
  {
    id: "cocoa",
    name: "Какао",
    category: "counter",
    price: 280,
    blurb: "Какао 70% на молоке, без сиропа",
    taste: "Горько-сладкий, не детский.",
    photo: null,
    sizes: true,
    milk: true,
    extras: [],
    stamps: false,
    allergen: "молоко",
  },
  {
    id: "matcha",
    name: "Матча",
    category: "counter",
    price: 420,
    blurb: "Церемониальная, на молоке",
    taste: "Травяная сладость и умами.",
    photo: null,
    sizes: true,
    milk: true,
    extras: [],
    stamps: false,
    allergen: "молоко",
  },
  {
    id: "croissant",
    name: "Круассан с миндалём",
    category: "counter",
    price: 280,
    blurb: "Слойка и франжипан",
    taste: "Печём к утру, к вечеру может закончиться.",
    photo: null,
    sizes: false,
    milk: false,
    extras: [],
    stamps: false,
    allergen: "глютен, орехи, молоко",
  },
  {
    id: "bun",
    name: "Булка с кардамоном",
    category: "counter",
    price: 240,
    blurb: "Дрожжевая, сахарная корочка",
    taste: "Тёплая, если прийти до полудня.",
    photo: null,
    sizes: false,
    milk: false,
    extras: [],
    stamps: false,
    allergen: "глютен, молоко",
  },
  {
    id: "cheesecake",
    name: "Чизкейк",
    category: "counter",
    price: 390,
    blurb: "Нью-йорк, без ягод сверху",
    taste: "Плотный и не приторный.",
    photo: null,
    sizes: false,
    milk: false,
    extras: [],
    stamps: false,
    allergen: "глютен, молоко, яйцо",
  },
  {
    id: "sandwich",
    name: "Сэндвич с индейкой",
    category: "counter",
    price: 460,
    blurb: "Фокачча, горчица, огурец",
    taste: "Сытный, без майонеза.",
    photo: null,
    sizes: false,
    milk: false,
    extras: [],
    stamps: false,
    allergen: "глютен",
  },
];

const byId = new Map(products.map((product) => [product.id, product]));

export function getProduct(id: string) {
  return byId.get(id);
}

export const FEATURED = ["filter", "cappuccino", "tonic", "raf", "flat"] as const;

export type Selection = {
  productId: string;
  qty: number;
  size: SizeId | null;
  milk: MilkId | null;
  extras: string[];
  note: string;
};

export function defaultSelection(product: Product): Selection {
  return {
    productId: product.id,
    qty: 1,
    size: product.sizes ? "M" : null,
    milk: product.milk ? "cow" : null,
    extras: [],
    note: "",
  };
}

export function unitPrice(product: Product, sel: Pick<Selection, "size" | "milk" | "extras">) {
  let price = product.price;
  if (product.sizes && sel.size) price += SIZES.find((item) => item.id === sel.size)?.add ?? 0;
  if (product.milk && sel.milk) price += MILKS.find((item) => item.id === sel.milk)?.add ?? 0;
  for (const id of sel.extras) {
    if (!product.extras.includes(id)) continue;
    price += EXTRAS.find((item) => item.id === id)?.add ?? 0;
  }
  return price;
}

export function describeLine(product: Product, sel: Pick<Selection, "size" | "milk" | "extras" | "note">) {
  const parts: string[] = [];
  if (product.sizes && sel.size) {
    const size = SIZES.find((item) => item.id === sel.size);
    if (size) parts.push(size.label);
  }
  if (product.milk && sel.milk && sel.milk !== "cow") {
    const milk = MILKS.find((item) => item.id === sel.milk);
    if (milk) parts.push(milk.label);
  }
  for (const id of sel.extras) {
    const extra = EXTRAS.find((item) => item.id === id);
    if (extra) parts.push(extra.label);
  }
  if (sel.note.trim()) parts.push(sel.note.trim());
  return parts.join(" · ");
}

export function lineKey(sel: Selection) {
  return [sel.productId, sel.size ?? "-", sel.milk ?? "-", [...sel.extras].sort().join("."), sel.note.trim()].join(
    "|",
  );
}
