import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchListingById, fetchProductReviews, photoUrl, addToCart } from "../../lib/api";

export default function ItemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const currentUser = JSON.parse(localStorage.getItem("currentUser")!);

  const handleAddToCart = async () => {
    await addToCart(currentUser.userId, item.productId);
    alert("Item added to cart!");
  };

  const handlePurchase = async () => {
    await addToCart(currentUser.userId, item.productId);
    navigate("/checkout");
  };

  useEffect(() => {
    async function loadPage() {
      try {
        const itemData = await fetchListingById(id!);
        setItem(itemData);

        const reviewsData = await fetchProductReviews(id!);
        setReviews(reviewsData);
      } catch (e: any) {
        setErr(e.toString());
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;

  // ⭐ Render Stars
  const renderStars = (rating: number) => (
    <div className="flex gap-0.5 text-yellow-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? "" : "text-gray-300"}>★</span>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <button onClick={() => navigate(-1)} className="text-blue-600 text-sm">
        ← Back
      </button>

      <img
        src={photoUrl(item.photos?.[0])}
        className="w-full h-96 object-cover rounded-xl"
      />

      <h1 className="text-3xl font-bold">{item.productName}</h1>

      <div className="text-xl font-semibold">
        ${(item.priceCents / 100).toFixed(2)}
      </div>

      <div className="flex gap-4 mt-6">
        <button onClick={handleAddToCart} className="bg-blue-600 px-4 py-2 text-white rounded-lg hover:bg-blue-700">
          Add to Cart
        </button>

        <button onClick={handlePurchase} className="bg-green-600 px-4 py-2 text-white rounded-lg hover:bg-green-700">
          Buy Now
        </button>
      </div>

      <p className="text-gray-600">{item.description}</p>

      <div className="border-t pt-4 text-sm text-gray-600">
        Seller ID: {item.ownerUserId}
      </div>

      {/* ⭐ REVIEWS SECTION */}
      <div className="border-t pt-6">
        <h2 className="text-xl font-bold mb-3">Customer Reviews</h2>

        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          reviews.map((r, idx) => (
            <div key={idx} className="border-b py-3">
              {renderStars(r.rating)}
              <p className="text-sm mt-1">{r.comment}</p>
              <p className="text-xs text-gray-400">
                Reviewed on {new Date(r.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
