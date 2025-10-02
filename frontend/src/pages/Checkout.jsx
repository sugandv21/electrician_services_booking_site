// src/pages/CheckoutPage.jsx
import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";
import Payment from "../components/Payment";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const cartItemsFromState =
    state.cartItems ||
    (state.cartItem ? [state.cartItem] : null) ||
    (typeof window !== "undefined" &&
      (() => {
        try {
          const raw = localStorage.getItem("cart");
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      })());

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    service_date: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!cartItemsFromState || cartItemsFromState.length === 0) {
    return (
      <p className="p-10 text-center">
        No items in checkout. Please add to cart first.
      </p>
    );
  }

  const cartItems = cartItemsFromState;
  const primaryItem = cartItems[0];

  const parsePrice = (priceStr) => {
    if (typeof priceStr === "number") return priceStr;
    if (!priceStr) return 0;
    const digits = String(priceStr).replace(/[^0-9.]/g, "");
    return parseInt(digits, 10) || 0;
  };

  const visitationFee = 60;
  const taxes = 19;

  const { itemsTotal, total } = useMemo(() => {
    const itemsTotal = cartItems.reduce((sum, it) => {
      const p = parsePrice(it.service?.price || it.price);
      const qty = Number(it.quantity || 1);
      return sum + p * qty;
    }, 0);
    const total = itemsTotal + visitationFee + taxes;
    return { itemsTotal, total };
  }, [cartItems]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setValidationErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setServerError(null);
  };

  const validateForm = () => {
    const errs = {};
    if (!form.first_name?.trim()) errs.first_name = "First name is required";
    if (!form.last_name?.trim()) errs.last_name = "Last name is required";
    if (!form.email?.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Invalid email";
    if (!form.phone?.trim()) errs.phone = "Phone is required";
    if (!form.address?.trim()) errs.address = "Address is required";
    if (!form.service_date) errs.service_date = "Service date is required";
    return errs;
  };

  // Helper to build payloads
  const buildPayloadForCartItem = (cartItem) => ({
    first_name: form.first_name,
    last_name: form.last_name,
    email: form.email,
    phone: form.phone,
    address: form.address,
    service_date: form.service_date,
    cart_item: Number(cartItem.id),
  });

  const buildPayloadForService = (cartItem) => {
    const svcId =
      (cartItem.service && (cartItem.service.id || cartItem.service.pk)) ||
      cartItem.service_id ||
      null;
    return {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      service_date: form.service_date,
      service_id: Number(svcId),
      quantity: Number(cartItem.quantity || 1),
    };
  };

  // Decide whether item "looks" server-backed
  const hasNumericId = (it) => {
    return it && it.id && Number.isFinite(Number(it.id)) && Number(it.id) > 0;
  };

  // Retry once using service_id if server rejects cart_item PK
  const handlePayNow = async () => {
    setServerError(null);
    setValidationErrors({});
    const errs = validateForm();
    if (Object.keys(errs).length) {
      setValidationErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Prepare candidate payloads
    const tryCartItemFirst = hasNumericId(primaryItem);
    const payloadCart = tryCartItemFirst
      ? buildPayloadForCartItem(primaryItem)
      : null;
    const payloadService = buildPayloadForService(primaryItem);

    setIsSubmitting(true);

    const doPost = async (payload) => {
      return api.post("/api/orders/", payload, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
    };

    try {
      // If we think primaryItem is server-backed, try cart_item first
      if (payloadCart) {
        try {
          const resp = await doPost(payloadCart);
          // success
          try {
            localStorage.removeItem("cart");
          } catch {}
          setShowModal(true);
          setIsSubmitting(false);
          return;
        } catch (err) {
          // If server returned invalid pk for cart_item => fallback to service_id
          if (
            err.response &&
            err.response.data &&
            (err.response.data.cart_item ||
              (err.response.data &&
                typeof err.response.data === "object" &&
                Object.values(err.response.data).some((v) =>
                  String(v).includes("Invalid pk")
                )))
          ) {
            console.warn("cart_item invalid on server; retrying with service_id");
            // fall through to service retry
          } else {
            // Other error — show it
            throw err;
          }
        }
      }

      // Attempt with service_id payload (fallback / guest flow)
      if (payloadService && payloadService.service_id) {
        try {
          const resp2 = await doPost(payloadService);
          try {
            localStorage.removeItem("cart");
          } catch {}
          setShowModal(true);
          setIsSubmitting(false);
          return;
        } catch (err2) {
          // Surface validation errors from server
          throw err2;
        }
      } else {
        setIsSubmitting(false);
        setServerError(
          "Unable to determine service id for the selected item. Please re-add the item to cart from the product page."
        );
        return;
      }
    } catch (err) {
      setIsSubmitting(false);
      if (err.response) {
        console.error("Order error — response status:", err.response.status);
        console.error("Order error — response data:", err.response.data);
        const data = err.response.data;
        if (data && typeof data === "object" && !Array.isArray(data)) {
          const fieldErrs = {};
          Object.entries(data).forEach(([key, val]) => {
            fieldErrs[key] = Array.isArray(val) ? val.join(" ") : String(val);
          });
          setValidationErrors(fieldErrs);
          if (data.detail) setServerError(String(data.detail));
        } else {
          setServerError(
            typeof data === "string"
              ? data
              : "Failed to place order (server error)"
          );
        }
      } else if (err.request) {
        console.error("Order error — no response received. Request:", err.request);
        setServerError(
          "No response from server. This may be a network, proxy, or CORS issue."
        );
      } else {
        console.error("Order error — setup:", err.message);
        setServerError(err.message || "Unexpected error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row gap-10 p-6">
      {/* LEFT SIDE: Primary Item + Payment Summary */}
      <div className="md:w-1/2 md:h-110 md:mx-20 rounded-lg p-6 bg-[#CD3A00cc] text-white flex flex-col justify-between">
        <div>
          <div className="flex gap-3 items-center">
            <img
              src={primaryItem.service?.image}
              alt={primaryItem.service?.title}
              className="w-16 h-16 object-cover rounded-2xl"
            />
            <div>
              <h2 className="font-bold">
                {primaryItem.service?.title || primaryItem.title}
              </h2>
              <p>Quantity: {primaryItem.quantity}</p>
              <p>Amount: ₹{parsePrice(primaryItem.service?.price)}</p>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="mt-6 border-t border-white pt-4 text-sm space-y-1">
            <h2 className="font-bold mb-2">Payment Summary</h2>
            <p className="flex justify-between">
              <span>Item total</span> <span>₹{itemsTotal}</span>
            </p>
            <p className="flex justify-between">
              <span>Visitation fees</span> <span>₹{visitationFee}</span>
            </p>
            <p className="flex justify-between">
              <span>Taxes and fees</span> <span>₹{taxes}</span>
            </p>
            <hr className="my-2 border-white" />
            <p className="flex justify-between font-bold">
              <span>Total Amount</span> <span>₹{total}</span>
            </p>
            <hr className="my-2 border-white" />
            <p className="flex justify-between">
              <span>Amount to pay</span> <span>₹{total}</span>
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-1 text-white">Select Service date</p>
          <input
            type="date"
            name="service_date"
            value={form.service_date}
            onChange={handleChange}
            className="border px-3 py-2 rounded w-full text-black"
          />
          {validationErrors.service_date && (
            <div className="text-yellow-200 text-sm mt-1">
              {validationErrors.service_date}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Form + Items list */}
      <div className="md:w-2/3 border md:me-10 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Checkout</h2>

        {serverError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {serverError}
          </div>
        )}

        {/* Form */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="First Name"
              className="border px-3 py-2 rounded w-full"
            />
            {validationErrors.first_name && (
              <div className="text-red-600 text-sm mt-1">
                {validationErrors.first_name}
              </div>
            )}
          </div>

          <div>
            <input
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Last Name"
              className="border px-3 py-2 rounded w-full"
            />
            {validationErrors.last_name && (
              <div className="text-red-600 text-sm mt-1">
                {validationErrors.last_name}
              </div>
            )}
          </div>

          <div>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email id"
              className="border px-3 py-2 rounded w-full"
            />
            {validationErrors.email && (
              <div className="text-red-600 text-sm mt-1">
                {validationErrors.email}
              </div>
            )}
          </div>

          <div>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone number"
              className="border px-3 py-2 rounded w-full"
            />
            {validationErrors.phone && (
              <div className="text-red-600 text-sm mt-1">
                {validationErrors.phone}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            className="border px-3 py-2 rounded w-full mt-1"
            rows={4}
          ></textarea>
          {validationErrors.address && (
            <div className="text-red-600 text-sm mt-1">
              {validationErrors.address}
            </div>
          )}
        </div>

        {/* Items list (if more than one) */}
        {cartItems.length > 1 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Items in order</h3>
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {cartItems.map((it) => (
                <li
                  key={it.id || `${it.service?.id}-${it.quantity}`}
                  className="flex items-center justify-between border p-2 rounded"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={it.service?.image}
                      alt={it.service?.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <div className="text-sm font-semibold">
                        {it.service?.title}
                      </div>
                      <div className="text-xs text-gray-600">
                        Qty: {it.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm">
                    ₹{parsePrice(it.service?.price) * it.quantity}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Payment Options */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Payment Details</h3>
          <button className="w-full border py-2 rounded mb-2">Pay with UPI</button>
          <button className="w-full border py-2 rounded mb-2">
            Pay with Net Banking
          </button>
          <button className="w-full border py-2 rounded mb-2">Pay with Card 💳</button>
        </div>

        {/* Pay Now */}
        <button
          onClick={handlePayNow}
          disabled={isSubmitting}
          className={`${
            isSubmitting ? "opacity-60 cursor-not-allowed" : ""
          } bg-[#CD3A00cc] cursor-pointer text-white w-full py-3 mt-6 rounded-full hover:bg-[#b83600]`}
        >
          {isSubmitting ? "Processing..." : `Pay Now • ₹${total}`}
        </button>
      </div>

      {/* Payment Confirmation Modal */}
      <Payment show={showModal} onClose={() => navigate("/")} />
    </div>
  );
}
