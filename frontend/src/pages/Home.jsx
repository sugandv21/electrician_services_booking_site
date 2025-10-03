import React, { useEffect, useState } from "react";
import HeroBanner from "../components/HeroBanner";
import HomeStatsSection from "../components/HomeStatsSection";
import ThreeStepProcess from "../components/ThreeStepProcess";
import ReviewsSection from "../components/ReviewsSection";
import BrandsSection from "../components/BrandsSection";
import FAQSection from "../components/FAQSection";
import ServicesCarousel from "../components/ServicesCarousal";
import api from "../api/api";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Example: await api.get("/api/home/");
        await new Promise((resolve) => setTimeout(resolve, 1500)); // simulate delay
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full p-6 space-y-10 animate-pulse">
        {/* Hero Banner Skeleton */}
        <div className="w-full h-60 bg-gray-200 rounded-xl flex items-center justify-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-400">
            Loading Hero Section...
          </h2>
        </div>

        {/* Services carousel skeleton */}
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-400 mb-3">
            Popular Services
          </h3>
          <div className="flex space-x-4 overflow-hidden">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="w-40 h-28 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400"
                >
                  Service {i + 1}
                </div>
              ))}
          </div>
        </div>

        {/* Stats skeleton */}
        <div>
          <h3 className="text-lg font-semibold text-gray-400 mb-3">
            Loading Stats...
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Customers", "Projects", "Ratings", "Partners"].map((label, i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400"
              >
                <span className="text-2xl font-bold">--</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Placeholder sections */}
        <div className="h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
          Loading Reviews...
        </div>
        <div className="h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
          Loading Brands...
        </div>
        <div className="h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
          Loading FAQs...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-10">
      <HeroBanner />
      <ServicesCarousel />
      <HomeStatsSection />
      <ThreeStepProcess />
      <ReviewsSection />
      <BrandsSection />
      <FAQSection />
    </div>
  );
}
