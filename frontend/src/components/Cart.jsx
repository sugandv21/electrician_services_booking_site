import React from "react";
import { useNavigate } from "react-router-dom";

export default function Cart({ cartItems, onClose, onUpdateQty, onBookNow }) {
  const navigate = useNavigate();

  if (!cartItems || cartItems.length === 0) return null;

  // Helper: convert price string "₹2000" to number
  const getPrice = (item) => {
    if (item.price !== undefined) return item.price; // already stored as number
    if (item.service?.price) {
      return Number(item.service.price.replace(/[^0-9.]/g, "")) || 0;
    }
    return 0;
  };

  const total = cartItems.reduce((sum, item) => sum + getPrice(item) * item.quantity, 0);
  const remaining = total < 200 ? 200 - total : 0;

  const handleBookNow = () => {
    navigate("/checkout", { state: { cartItems } });
    onClose();
    if (onBookNow) onBookNow();
  };

  return (
    <div className="fixed top-0 right-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-96 p-5 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-xl"
        >
          ✖
        </button>

        <h2 className="text-lg font-bold mb-4">Cart</h2>

        {/* Cart Items */}
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {cartItems.map((item) => {
            const price = getPrice(item);
            const subtotal = price * item.quantity;
            return (
              <div key={item.id} className="border-b pb-3">
                <p className="font-semibold">{item.service?.title || item.title}</p>
                <p className="text-sm text-gray-600">
                  ₹{price} x {item.quantity} = ₹{subtotal}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    className="border px-2"
                    onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="font-semibold">{item.quantity}</span>
                  <button
                    className="border px-2"
                    onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total & remaining */}
        <p className="mt-4 font-semibold">Amount: ₹{total}</p>
        {remaining > 0 && (
          <p className="text-sm text-gray-500">
            Add ₹{remaining} more to save on visitation fees
          </p>
        )}

        {/* Book Now button */}
        <button
          onClick={handleBookNow}
          className="bg-[#CD3A00] text-white w-full py-2 mt-4 rounded-full hover:bg-[#b83600]"
        >
          Book now
        </button>

        {/* Offers */}
        <div className="mt-4 border rounded-lg p-3 bg-gray-50">
          <p className="font-medium text-sm">Get visitation fees offer</p>
          <p className="text-xs text-gray-600">On orders above ₹200</p>
          <button className="text-[#CD3A00] text-xs mt-1 hover:underline">
            View more offers
          </button>
        </div>

        {/* UC Promise */}
        <div className="mt-4 border rounded-lg p-3 bg-gray-50 text-sm">
          <p>✔ Verified professionals</p>
          <p>✔ Hassle free booking</p>
          <p>✔ Transparent pricing</p>
        </div>
      </div>
    </div>
  );
}
