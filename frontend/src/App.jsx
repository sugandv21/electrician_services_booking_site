import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import About from "./pages/About";
import ServiceAreas from "./pages/ServiceAreas";
import ContactForm from "./pages/ContactForm";
import Home from "./pages/Home";
import Emergency from "./pages/Emergency";
import ServicesPage from "./pages/ServicesPage";
import Installation from "./pages/Installation";
import Booking from "./pages/Booking";
import Checkout from "./pages/Checkout";
import CartPage from "./pages/CartPage";

const Account = () => <div className="p-8">Account Page</div>;

export default function App() {

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {/* Only <Route> (or fragments) inside <Routes> */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactForm />} />
            <Route path="/areas" element={<ServiceAreas />} />
            <Route path="/account" element={<Account />} />
            <Route path="/services/:type" element={<ServicesPage />} />
            <Route path="/services/:type/:id" element={<Installation />} />
            <Route path="/services/lighting/:id" element={<Booking />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>

          {/* ToastContainer must be outside <Routes> */}
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </main>

        <Footer />
      </div>

    </Router>
  );
}
