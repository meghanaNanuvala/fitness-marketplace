import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Item = {
  id: string;
  title: string;
  category: string;
  priceCents: number;
  qty: number;
  description?: string;
  createdAt: string; // ISO
};

type Ctx = {
  items: Item[];
  addItem: (i: Omit<Item, "id" | "createdAt"> & { createdAt?: string }) => void;
  removeItem: (id: string) => void;
};

const ItemsContext = createContext<Ctx | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);
const toCents = (d: number) => Math.round(d * 100);

const STARTER: Item[] = [
  {
    id: uid(),
    title: "Adjustable Dumbbell Set (5–50 lbs)",
    category: "Equipment",
    priceCents: 19900,
    qty: 2,
    description: "Space-saving adjustable dumbbells, perfect for home workouts.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: uid(),
    title: "Resistance Bands Pack",
    category: "Accessories",
    priceCents: 2500,
    qty: 10,
    description: "Set of 5 bands with varying resistance levels, includes carry bag.",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: uid(),
    title: "Yoga Mat – Non Slip 6mm",
    category: "Yoga",
    priceCents: 3500,
    qty: 5,
    description: "Eco-friendly, extra-thick mat for yoga, pilates, and stretching.",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: uid(),
    title: "Foam Roller – 24 inch",
    category: "Recovery",
    priceCents: 2200,
    qty: 3,
    description: "High-density foam roller for muscle recovery and stretching.",
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

export function ItemsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>(() => {
    try {
      const raw = localStorage.getItem("mp.items");
      return raw ? (JSON.parse(raw) as Item[]) : STARTER;
    } catch { return STARTER; }
  });

  useEffect(() => {
    try { localStorage.setItem("mp.items", JSON.stringify(items)); } catch {}
  }, [items]);

  const value = useMemo<Ctx>(() => ({
    items,
    addItem: (i) => {
      const item: Item = {
        id: uid(),
        title: i.title.trim(),
        category: i.category,
        priceCents: i.priceCents ?? toCents(0),
        qty: Math.max(1, Math.floor(i.qty)),
        description: i.description?.trim() || undefined,
        createdAt: i.createdAt ?? new Date().toISOString(),
      };
      setItems((prev) => [item, ...prev]);
    },
    removeItem: (id: string) => setItems((prev) => prev.filter((x) => x.id !== id)),
  }), [items]);

  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>;
}

export function useItems() {
  const ctx = useContext(ItemsContext);
  if (!ctx) throw new Error("useItems must be used within ItemsProvider");
  return ctx;
}
