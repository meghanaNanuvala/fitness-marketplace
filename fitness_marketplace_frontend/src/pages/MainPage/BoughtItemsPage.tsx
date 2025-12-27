import { useEffect, useState } from "react";
import { fetchPurchasedItems, photoUrl, submitReview } from "../../lib/api";

export default function BoughtItemsPage() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser")!);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchPurchasedItems(currentUser.userId)
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const openReviewModal = (purchase: any) => {
    setSelectedPurchase(purchase);
    setRating(5);
    setComment("");
    setReviewOpen(true);
  };

  const submitReviewHandler = async () => {
    if (!selectedPurchase) return;

    try {
      await submitReview(selectedPurchase.purchaseId, rating, comment);
      alert("Review submitted successfully!");
      setReviewOpen(false);
    } catch (err) {
      alert("Failed to submit review");
      console.error(err);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Purchased Items</h1>

      {items.length === 0 && <div>You haven’t purchased anything yet.</div>}

      {items.map((it) => (
        <div key={it.purchaseId} className="border-b pb-4 flex items-center gap-4">
          <img src={photoUrl(it.photo ?? "")} className="w-20 h-20 object-cover rounded" />
          
          <div className="flex-1">
            <div className="font-semibold">{it.productName}</div>
            <div>Qty: {it.quantity}</div>
            <div>Total: ${(it.totalPriceCents / 100).toFixed(2)}</div>
            <div className="text-xs text-gray-500">
              Purchased: {new Date(it.purchaseDate).toLocaleString()}
            </div>
          </div>

          <button
            onClick={() => openReviewModal(it)}
            className="bg-yellow-500 text-white px-3 py-1 rounded"
          >
            ⭐ Review
          </button>
        </div>
      ))}

      {reviewOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96 space-y-4">
            <h3 className="text-lg font-bold">
              Review for: {selectedPurchase?.productName}
            </h3>

            <label className="block">
              Rating:
              <select 
                className="border p-1 w-full"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ⭐</option>)}
              </select>
            </label>

            <textarea
              className="border p-2 w-full"
              rows={4}
              placeholder="Write your comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className="flex justify-between">
              <button
                className="bg-gray-400 px-3 py-1 rounded"
                onClick={() => setReviewOpen(false)}
              >
                Cancel
              </button>

              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={submitReviewHandler}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
