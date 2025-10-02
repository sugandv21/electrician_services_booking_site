// src/pages/CartPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Example: read cart items from localStorage
    const stored = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(stored);
  }, []);

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-semibold mb-4">Your Cart is Empty 🛒</h2>
        <p className="mb-6 text-gray-600">Looks like you haven’t added anything yet.</p>
        <Link
          to="/services/commercial" // redirect user back to shop/services
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Browse Services
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Your Cart</h2>
      <ul className="space-y-4">
        {cartItems.map((item, idx) => (
          <li key={idx} className="flex justify-between border-b pb-2">
            <span>{item.name}</span>
            <span>{item.quantity} × ${item.price}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex justify-end">
        <Link
          to="/checkout"
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
