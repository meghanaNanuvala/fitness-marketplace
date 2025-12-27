import { useEffect, useState } from "react";
import { fetchCart, photoUrl, purchaseAll, clearCart } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser")!);

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart(currentUser.userId)
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  const total = items.reduce(
    (sum, it) => sum + it.priceCents * it.quantity,
    0
  );

  const handleConfirm = async () => {
    await purchaseAll(currentUser.userId, items);
    await clearCart(currentUser.userId);
    alert("Purchase successful!");
    navigate("/AllItemsPage");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">

      <h1 className="text-3xl font-bold">Checkout</h1>
      <p className="text-gray-600">Review your order and proceed to payment.</p>

      {/* Cart Items */}
      <div className="space-y-4">
        {items.map((it) => (
          <div
            key={it.productId}
            className="flex gap-4 items-center border-b pb-4"
          >
            <img
              src={photoUrl(it.photo)}
              className="w-20 h-20 object-cover rounded"
            />

            <div className="flex-1">
              <div className="font-semibold">{it.productName}</div>
              <div className="text-gray-600">
                ${(it.priceCents / 100).toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">
                Qty: {it.quantity}
              </div>
            </div>

            <div className="font-semibold">
              ${((it.priceCents * it.quantity) / 100).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="text-2xl font-bold">
        Total: ${(total / 100).toFixed(2)}
      </div>

      {/* BUTTONS */}
      <div className="flex gap-4">
        <button
          onClick={handleConfirm}
          className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
        >
          Confirm Purchase
        </button>

        <button
          onClick={() => navigate("/cart")}
          className="bg-gray-500 px-4 py-2 rounded text-white"
        >
          Back to Cart
        </button>
      </div>
    </div>
  );
}
