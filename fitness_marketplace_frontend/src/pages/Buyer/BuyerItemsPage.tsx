import { useMemo, useState } from "react";
import type { Item } from "../../types/item";
import BuyerItemCard from "./BuyerItemCard.tsx"; 
import { toCents, uid } from "../../utils/format";
import { useLocalStorage } from "../../hooks/useLocalStorage.ts";

const CATEGORIES = ["Electronics", "Clothing", "Home", "Books", "Sports", "Other"] as const;

const STARTER_ITEMS: Item[] = [
  { id: uid(), title: "iPhone 13", category: "Electronics", priceCents: 39900, qty: 1, description: "128GB, good condition", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: uid(), title: "Trail Running Shoes", category: "Sports", priceCents: 6900, qty: 1, description: "Men's 9.5", createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: uid(), title: "Ergonomic Chair", category: "Home", priceCents: 12900, qty: 1, description: "Mesh back, adjustable", createdAt: new Date(Date.now() - 86400000 * 6).toISOString() },
  { id: uid(), title: "Clean Architecture", category: "Books", priceCents: 2500, qty: 1, description: "Like new paperback", createdAt: new Date(Date.now() - 86400000 * 8).toISOString() },
];

export default function BuyerItemsPage() {
  const [items, setItems] = useLocalStorage<Item[]>("buyer.items", () => STARTER_ITEMS);

  // form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Electronics");
  const [price, setPrice] = useState<string>("");
  const [qty, setQty] = useState<string>("1");
  const [description, setDescription] = useState<string>("");

  // search/filter/sort
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState<string>("All");
  const [sortKey, setSortKey] = useState<string>("newest");

  const filtered = useMemo(() => {
    let r = items.filter((it) => {
      const text = (it.title + " " + (it.description ?? "") + " " + it.category).toLowerCase();
      const matchesQ = q.trim().length === 0 || text.includes(q.toLowerCase());
      const matchesCat = catFilter === "All" || it.category === catFilter;
      return matchesQ && matchesCat;
    });
    switch (sortKey) {
      case "priceAsc": r.sort((a, b) => a.priceCents - b.priceCents); break;
      case "priceDesc": r.sort((a, b) => b.priceCents - a.priceCents); break;
      case "newest":
      default: r.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    return r;
  }, [items, q, catFilter, sortKey]);

  const resetForm = () => {
    setTitle(""); setCategory("Electronics"); setPrice(""); setQty("1"); setDescription("");
  };

  const canSubmit = title.trim().length > 1 && Number(price) > 0 && Number(qty) > 0;

  const addItem: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    const newItem: Item = {
      id: uid(),
      title: title.trim(),
      category,
      priceCents: toCents(Number(price)),
      qty: Math.max(1, Math.floor(Number(qty))),
      description: description.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    setItems((prev: Item[]) => [newItem, ...prev]);
    resetForm();
  };

  const removeItem = (id: string) =>
    setItems((prev: Item[]) => prev.filter((x: Item) => x.id !== id));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl p-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Buyer — My Items</h1>
          <p className="text-sm text-slate-600">
            Add items you want to buy, maintain a wishlist, and search/filter your list.
          </p>
        </header>

        {/* Controls */}
        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="block text-sm font-medium">Search</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search by title, notes, category..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="block text-sm font-medium">Category</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
            >
              <option>All</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="block text-sm font-medium">Sort</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="priceAsc">Price: Low → High</option>
              <option value="priceDesc">Price: High → Low</option>
            </select>
          </div>
        </section>

        {/* Add Item Form */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Add an item you want to buy</h2>
          <form onSubmit={addItem} className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="md:col-span-5">
              <label className="block text-sm font-medium">Title</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., MacBook Pro 14"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium">Category</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Price (USD)</label>
              <input
                type="number" step="0.01" min="0"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Qty</label>
              <input
                type="number" min="1"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>

            <div className="md:col-span-12">
              <label className="block text-sm font-medium">Notes (optional)</label>
              <textarea
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Condition preferences, color, budget range, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="md:col-span-12 flex items-center gap-3">
              <button
                type="submit"
                disabled={!canSubmit}
                className={`rounded-xl px-4 py-2 font-medium text-white shadow-sm transition active:scale-[0.99] ${
                  canSubmit ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-300 cursor-not-allowed"
                }`}
              >
                Add Item
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </form>
        </section>

        {/* Results */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">My items ({filtered.length})</h2>
            <p className="text-sm text-slate-600">Showing results based on your search & filters.</p>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
              No items match your filters. Try adjusting your search.
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((it) => (
                <BuyerItemCard key={it.id} item={it} onRemove={removeItem} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
