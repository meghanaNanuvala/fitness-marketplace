// src/pages/MainPage/AllItemsPage.tsx

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchAllListings, photoUrl } from "../../lib/api";
import type { Listing } from "../../lib/api";

type ListingWithRating = Listing & { avgRating?: number | null };

export default function AllItemsPage() {
  const [items, setItems] = useState<ListingWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Re-fetch whenever page becomes visible again
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErr(null);

    fetchAllListings()
      .then((data) => {
        if (isMounted) setItems(data);
      })
      .catch((e) => {
        if (isMounted) setErr(String(e));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;

  const renderStars = (rating?: number | null) => {
    if (!rating || rating <= 0) {
      return (
        <div className="flex items-center gap-0.5 mt-1">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-lg text-gray-300">★</span>
          ))}
          <span className="text-xs text-gray-400 ml-1">(No reviews)</span>
        </div>
      );
    }

    const rounded = Math.round(rating);
    return (
      <div className="flex items-center gap-0.5 mt-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-lg ${i < rounded ? "text-yellow-500" : "text-gray-300"}`}
          >
            ★
          </span>
        ))}
        <span className="text-xs text-gray-500 ml-1">
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

  return (
    <main className="max-w-6xl mx-auto p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <article
          key={`${it.ownerUserId}-${it.productId}`}
          onClick={() => navigate(`/item/${it.productId}`)}
          className="border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition"
        >
          {it.photos?.[0] ? (
            <img
              src={photoUrl(it.photos[0])}
              className="h-44 w-full object-cover"
              alt={it.productName}
            />
          ) : (
            <div className="h-44 bg-slate-200" />
          )}

          <div className="p-4">
            <div className="text-xs text-slate-500">{it.category}</div>
            <h3 className="font-semibold">{it.productName}</h3>
            <div className="text-sm">
              ${(it.priceCents / 100).toFixed(2)} · qty {it.qty}
            </div>

            {renderStars(it.avgRating)}

            {it.description && (
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                {it.description}
              </p>
            )}
          </div>
        </article>
      ))}
    </main>
  );
}
