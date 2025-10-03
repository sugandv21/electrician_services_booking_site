import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import logo from "../assets/logo.png";

const servicesColumns = [
  {
    title: "Commercial services",
    path: "/services/commercial",
    items: [
      "Commercial Lighting Installation",
      "Commercial Electrician",
      "Commercial Lighting",
      "Commercial Switchboard",
      "Electrical Testing & Tagging",
      "Electrical Maintenance",
      "Electrical Safety Inspection",
      "Emergency & Outdoor Security Lighting",
    ],
  },
  {
    title: "Residential services",
    path: "/services/residential",
    items: [
      "Air Conditioner Installation",
      "Appliance Installation",
      "CCTV & Alarm Installation",
      "Digital Antenna & TV Installation",
      "Electrical Safety Inspection",
      "Energy Assessment & Management",
      "Smart Home Installation",
      "Lighting, Fans and PowerPoints",
      "Smoke Alarm Installation",
      "Switchboard Health Check",
    ],
  },
  {
    title: "Why Choose Us?",
    path: "/services/why-choose-us",
    items: [
      "Trusted since 2015, we provide high-quality workmanship, competitive pricing, and outstanding customer service.",
    ],
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpenDesktop, setServicesOpenDesktop] = useState(false);
  const [servicesOpenMobile, setServicesOpenMobile] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [userName, setUserName] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Get user from localStorage
  const refreshUser = () => {
    const email = localStorage.getItem("user_email");
    if (email) {
      const namePart = email.split("@")[0];
      const formatted = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      setUserName(formatted);
    } else {
      setUserName(null);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_email");
    setAccountOpen(false);
    refreshUser();
    navigate("/auth");
  };

  return (
    <header className="w-full shadow">
      {/* Top Row */}
      <div className="flex justify-between items-center px-4 md:px-12 py-3">
        <img src={logo} alt="Logo" className="w-28 h-14" />

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-2 sm:space-y-0">
          <button className="bg-[#f65616] text-white px-6 py-2 rounded-full font-semibold w-full sm:w-auto text-center">
            Call(+91)1234567890
          </button>
          <button className="border border-[#f65616] text-[#f65616] px-6 py-2 rounded-full font-semibold w-full sm:w-auto text-center">
            Book Now
          </button>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bg-[#E25C26] text-white">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center px-4 md:px-12 py-3 gap-3 md:gap-0">
          {/* Search bar */}
          <div className="flex items-center bg-white rounded-full px-4 py-2 w-full md:w-1/3">
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-black mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search electricians"
              className="w-full text-black outline-none text-sm md:text-base"
            />
          </div>

          {/* Desktop Links */}
          <nav className="hidden lg:flex flex-1 justify-center space-x-8 font-semibold relative">
            <Link to="/">Home</Link>

            {/* Services toggle */}
            <div
              onClick={() => setServicesOpenDesktop(!servicesOpenDesktop)}
              className="flex items-center space-x-1 cursor-pointer hover:text-white"
            >
              <span>Services</span>
              <ChevronDown
                className={`w-4 h-4 transform transition ${
                  servicesOpenDesktop ? "rotate-180" : ""
                }`}
              />
            </div>

            <Link to="/emergency">Emergency electrician</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/areas">Areas we services</Link>
            <Link to="/cart">Cart</Link>

            {/* ✅ Account dropdown */}
            {userName ? (
              <div className="relative">
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center space-x-1"
                >
                  <span>Hello {userName}</span>
                  <ChevronDown
                    className={`w-4 h-4 transform transition ${
                      accountOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg py-2 z-50">
                    <Link
                      to="/account"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setAccountOpen(false)}
                    >
                      My Account
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth">Account</Link>
            )}
          </nav>

          {/* Hamburger (mobile only) */}
          <div className="flex lg:hidden justify-end w-full mt-2 md:mt-0">
            <button
              className="text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Desktop Services Dropdown */}
        {servicesOpenDesktop && (
          <div className="bg-[#CD3A00] text-white px-12 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {servicesColumns.map((col, idx) => (
              <div key={idx}>
                <h4 className="font-bold mb-5">
                  <Link to={col.path} className="hover:text-orange-600">
                    {col.title}
                  </Link>
                </h4>
                <ul className="space-y-1 font-bold">
  {col.items.map((item, i) => (
    <li key={i}>
      <Link
        to={col.path}
        className="hover:text-orange-600 cursor-pointer"
        onClick={() => setServicesOpenDesktop(false)} // ✅ close dropdown
      >
        {item}
      </Link>
    </li>
  ))}
</ul>

              </div>
            ))}
          </div>
        )}

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden flex flex-col bg-[#E25C26] text-white px-4 py-4 space-y-2 overflow-y-auto max-h-screen">
            <Link to="/" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <button
              onClick={() => setServicesOpenMobile(!servicesOpenMobile)}
              className="flex items-center justify-between w-full"
            >
              <span>Services</span>
              <ChevronDown
                className={`w-4 h-4 transform transition ${
                  servicesOpenMobile ? "rotate-180" : ""
                }`}
              />
            </button>
            {servicesOpenMobile && (
              <div className="bg-[#CD3A00] text-white p-4 rounded">
                {servicesColumns.map((col, idx) => (
                  <div key={idx} className="mb-4">
                    <h4 className="font-bold mb-3">
                      <Link to={col.path} className="hover:text-orange-600">
                        {col.title}
                      </Link>
                    </h4>
                   <ul className="space-y-1 text-sm">
  {col.items.map((item, i) => (
    <li key={i}>
      <Link
        to={col.path}
        className="hover:text-orange-600 cursor-pointer"
        onClick={() => setServicesOpenMobile(false)} // ✅ close mobile dropdown
      >
        {item}
      </Link>
    </li>
  ))}
</ul>

                  </div>
                ))}
              </div>
            )}
            <Link to="/emergency" onClick={() => setMobileOpen(false)}>
              Emergency electrician
            </Link>
            <Link to="/about" onClick={() => setMobileOpen(false)}>
              About
            </Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)}>
              Contact
            </Link>
            <Link to="/areas" onClick={() => setMobileOpen(false)}>
              Areas we services
            </Link>
            <Link to="/cart" onClick={() => setMobileOpen(false)}>
              Cart
            </Link>

            {/* ✅ Mobile account */}
            {userName ? (
              <button
                onClick={handleLogout}
                className="text-left px-2 py-1 mt-2 bg-black/30 rounded"
              >
                Logout
              </button>
            ) : (
              <Link to="/auth" onClick={() => setMobileOpen(false)}>
                Account
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
