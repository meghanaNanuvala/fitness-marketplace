import { useEffect, useState } from "react";
import { createListing, fetchSellerListings } from "../.././lib/api"; // <-- adjust this path

export default function SellerItemsPage() {
  const getOwnerUserId = () => {
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.userId ?? null;
    } catch {
      return null;
    }
  };

  const ownerUserId = getOwnerUserId();

  const [showForm, setShowForm] = useState(false);

  // --- new: form state
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [priceCents, setPriceCents] = useState<number | "">("");
  const [qty, setQty] = useState<number | "">(1);
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  // --- new: seller items state + loader
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    setLoading(true);
    try {
      const data = await fetchSellerListings(ownerUserId);
      console.log("loaded seller listings", data);
      setItems(data);
    } catch (err) {
      console.error("failed to load listings", err);
    } finally {
      setLoading(false);
    }
  }

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFiles(e.target.files ? Array.from(e.target.files) : []);
  }

  // --- new: submit handler that creates + RELOADS the listings
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      productId,
      productName,
      category,
      priceCents: Number(priceCents),
      qty: Number(qty),
      ownerUserId: getOwnerUserId(),
      isSeller: true,
      description,
      files,
    };
    console.log("creating", payload);
    try {
      const created = await createListing(payload);
      console.log("created", created);
      // IMPORTANT: re-fetch the listings so UI shows the new item
      await loadListings();
      setShowForm(false);
      // optional: reset form
      setProductId("");
      setProductName("");
      setCategory("");
      setPriceCents("");
      setQty(1);
      setDescription("");
      setFiles([]);
    } catch (err) {
      console.error("create failed", err);
      // show user error if needed
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Add Item Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700"
        >
          <span className="text-lg">＋</span>
          Add an item
        </button>
      )}

      {/* Collapsible Form */}
      {showForm && (
        <div className="mb-6 rounded-xl border p-4 shadow-sm">
          {/* NOTE: add onSubmit to the form */}
          <form className="space-y-3" onSubmit={handleSubmit}>
            <input
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              type="text"
              placeholder="Product ID"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              type="text"
              placeholder="Product Name"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              type="text"
              placeholder="Category"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />

            <div className="flex gap-2">
              <input
                value={priceCents === "" ? "" : String(priceCents)}
                onChange={(e) => setPriceCents(e.target.value === "" ? "" : Number(e.target.value))}
                type="number"
                placeholder="Price (cents)"
                className="w-1/2 rounded-md border px-3 py-2 text-sm"
              />
              <input
                value={qty === "" ? "" : String(qty)}
                onChange={(e) => setQty(e.target.value === "" ? "" : Number(e.target.value))}
                type="number"
                placeholder="Quantity"
                className="w-1/2 rounded-md border px-3 py-2 text-sm"
              />
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full rounded-md border px-3 py-2 text-sm"
              rows={3}
            />

            {/* make sure to capture files */}
            <input type="file" multiple onChange={onFilesChange} className="block w-full text-sm text-slate-500" />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              {/* keep the button as submit so onSubmit runs */}
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
              >
                Add listing
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Seller's items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && <div>Loading...</div>}
        {!loading && items.length === 0 && <div>No items yet</div>}
        {!loading &&
          items.map((it) => (
            <div key={it.productId} className="rounded-lg border p-4">
              <h3 className="font-medium">{it.productName}</h3>
              <p className="text-sm text-slate-600">${(it.priceCents / 100).toFixed(2)} · qty {it.qty}</p>
              <p className="text-sm text-slate-500 mt-2">{it.description}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
