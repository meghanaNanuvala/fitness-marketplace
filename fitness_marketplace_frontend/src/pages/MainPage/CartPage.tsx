import { useEffect, useState } from "react";
import { fetchCart, removeCartItem, clearCart, photoUrl } from "../../lib/api";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser")!);
  const navigate = useNavigate();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCart = () => {
    fetchCart(currentUser.userId)
      .then(setItems)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCart();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  const total = items.reduce((sum, it) => sum + it.priceCents * it.quantity, 0);

  const handleRemove = async (productId: string) => {
    await removeCartItem(currentUser.userId, productId);
    loadCart();
  };

  const handleClear = async () => {
    await clearCart(currentUser.userId);
    loadCart();
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Your Cart</h1>

      {items.length === 0 && <div>No items in cart.</div>}

      {items.map((it) => (
        <div key={it.productId} className="flex gap-4 items-center border-b pb-4">
          <img src={photoUrl(it.photo)} className="w-20 h-20 object-cover rounded" />

          <div className="flex-1">
            <div className="font-medium">{it.productName}</div>
            <div>${(it.priceCents / 100).toFixed(2)}</div>
            <div className="text-sm text-gray-600">Qty: {it.quantity}</div>
          </div>

          <button
            className="text-red-600"
            onClick={() => handleRemove(it.productId)}
          >
            Remove
          </button>
        </div>
      ))}

      {items.length > 0 && (
        <>
          <div className="text-xl font-semibold">
            Total: ${(total / 100).toFixed(2)}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleCheckout}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Checkout
            </button>

            <button
              onClick={handleClear}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Clear Cart
            </button>
          </div>
        </>
      )}
    </div>
  );
}
