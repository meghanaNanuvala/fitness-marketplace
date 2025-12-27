import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchAllListings, photoUrl } from "../lib/api";
import type { Listing } from "../lib/api";

export default function SearchItems() {
  // 1. Read the search query from the URL using the 'q' parameter
  const [searchParams] = useSearchParams();
  const rawSearchQuery = searchParams.get('q') || ''; // Get 'q' parameter, default to empty string
  const searchQuery = rawSearchQuery.toLowerCase().trim(); // Normalize the query for filtering
  console.log("SearchItems component rendering. Search query:", searchQuery);

  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const navigate = useNavigate();

  // This single useEffect handles fetching data whenever the searchQuery changes.
  useEffect(() => {
    // Initial fetch of all items (this only runs once on component mount)
    fetchAllListings()
      .then(setItems)
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false));
  }, []);

  // 2. Use useMemo to filter items based on the normalized search query
  const filteredItems = useMemo(() => {
    // If the query is empty, return all items immediately
    if (!searchQuery) {
      return items;
    }

    // Filter items where the query is found in the name, description, or category
    return items.filter(item => {
      const query = searchQuery;
      const nameMatch = item.productName.toLowerCase().includes(query);
      const descriptionMatch = item.description?.toLowerCase().includes(query); 
      const categoryMatch = item.category.toLowerCase().includes(query);

      return nameMatch || descriptionMatch || categoryMatch;
    });
  }, [items, searchQuery]); // Dependency array: Recalculate only when fetched items or searchQuery changes

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;

  return (
    <main className="max-w-6xl mx-auto p-6">
      {/* Display the current search term for context, if one exists */}
      {searchQuery && (
        <h2 className="text-xl font-bold mb-4">
          Results for "{searchQuery}"
        </h2>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((it) => (
          <article
            key={`${it.ownerUserId}-${it.productId}`}
            // Keep the navigation handler
            onClick={() => navigate(`/item/${it.productId}`)}
            className="border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition"
          >
            {/* Image display logic */}
            {it.photos?.[0] ? (
              <img
                src={photoUrl(it.photos[0])}
                className="h-44 w-full object-cover"
                alt={it.productName}
              />
            ) : (
              <div className="h-44 bg-slate-100" />
            )}

            <div className="p-4">
              <div className="text-xs text-slate-500">{it.category}</div>
              <h3 className="font-semibold">{it.productName}</h3>

              <div className="text-sm">
                {/* Format price to two decimal places */}
                ${(it.priceCents / 100).toFixed(2)} · qty {it.qty}
              </div>

              {/* Display star ratings */}
              <div className="flex items-center gap-1 mt-1 text-yellow-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>

              {it.description && (
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                  {it.description}
                </p>
              )}
            </div>
          </article>
        ))}

        {filteredItems.length === 0 && !loading && searchQuery && (
          <p className="sm:col-span-2 lg:col-span-3 text-center text-xl text-slate-500 py-12">
            No items found matching "{searchQuery}".
          </p>
        )}
      </div>
    </main>
  );
}