import React, { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import loginImg from "../assets/login.png";

export default function Account() {
  const [registerData, setRegisterData] = useState({
    phone: "",
    email: "",
    password: "",
  });
  const [loginPhone, setLoginPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const flash = (type, text) => setMessage({ type, text });

  // Register
  const handleRegister = async () => {
    if (!registerData.phone || !registerData.email || !registerData.password) {
      return flash("error", "Fill all fields");
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/register/", registerData);
      flash("success", res.data.message);
      setRegisterData({ phone: "", email: "", password: "" });
    } catch (err) {
      flash("error", err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Login (send OTP)
  const handleLogin = async () => {
    if (!loginPhone) return flash("error", "Enter phone number");
    setLoading(true);
    try {
      const res = await api.post("/auth/login-request/", { phone: loginPhone });
      flash("success", res.data.message);
      setShowOtpModal(true);
    } catch (err) {
      flash("error", err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) return flash("error", "Enter OTP");
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp/", {
        phone: loginPhone,
        otp,
      });

      flash("success", res.data.message);

      // ✅ Save tokens + email for Navbar
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      if (res.data.email) {
        localStorage.setItem("user_email", res.data.email);
      }

      setShowOtpModal(false);
      setOtp("");
      navigate("/"); // redirect to homepage
    } catch (err) {
      flash("error", err.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <h1 className="text-2xl md:text-3xl font-semibold mb-8">
        Account Log in or Sign in
      </h1>

   {/* LOGIN */}
<div className="w-full max-w-3xl bg-white rounded-2xl border p-6 shadow mb-8">
 <div className="flex items-center space-x-3 mb-3">
  <img src={loginImg} alt="Login" className="w-6 h-6" />
  <h2 className="text-lg font-medium">Log in with Phone</h2>
</div>
  
  <div className="flex items-center space-x-3">
    <div className="flex-1">
  <label className="block mb-1 text-sm font-medium text-gray-700">
    Enter Phone Number
  </label>
  <input
    value={loginPhone}
    onChange={(e) => setLoginPhone(e.target.value)}
    placeholder="Phone number"
    className="w-full border rounded-full px-4 py-3"
  />
</div>

    <button
      onClick={handleLogin}
      className="bg-orange-600 text-white px-6 py-3 rounded-full whitespace-nowrap"
    >
      {loading ? "..." : "Send OTP"}
    </button>
  </div>

  <p className="text-xs text-gray-500 mt-2">
    We will send an OTP to your registered email.
  </p>
</div>


      {/* REGISTER */}
      <div className="w-full max-w-3xl bg-white rounded-2xl border p-6 shadow">
        <h2 className="text-xl font-medium text-center mb-6">Sign Up</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1">Phone Number</label>
            <input
              value={registerData.phone}
              onChange={(e) =>
                setRegisterData({ ...registerData, phone: e.target.value })
              }
              placeholder="Phone number"
              className="w-full border rounded px-4 py-3 mb-4"
            />
          </div>
          <div>
            <label className="block mb-1">Email address</label>
            <input
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
              placeholder="Email id"
              className="w-full border rounded px-4 py-3 mb-3"
            />
            <label className="block mb-1">Password</label>
            <input
              type="password"
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({ ...registerData, password: e.target.value })
              }
              placeholder="Password"
              className="w-full border rounded px-4 py-3 mb-4"
            />
            <button
              onClick={handleRegister}
              className="bg-orange-600 text-white px-6 py-2 rounded-full"
            >
              {loading ? "..." : "Register"}
            </button>
          </div>
        </div>
      </div>

      {/* Flash messages */}
      {message && (
        <div
          className={`mt-6 px-4 py-2 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-40">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg text-center">
            <h3 className="font-medium mb-2">Enter OTP</h3>
            <input
              type="text"
              maxLength={4}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border text-center text-xl tracking-widest px-3 py-2 w-full mb-4"
            />
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp("");
                }}
                className="bg-gray-300 px-4 py-2 rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                className="bg-orange-600 text-white px-4 py-2 rounded-full"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
