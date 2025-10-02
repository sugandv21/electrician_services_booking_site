// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { IoCallOutline } from "react-icons/io5";
// import { FaStar } from "react-icons/fa";
// import axios from "../api/api";
// import techImg from "../assets/about1.jpg";
// import Cart from "../components/Cart"; // ✅ Cart modal component

// export default function Booking() {
//   const { id } = useParams();
//   const [service, setService] = useState(null);
//   const [faqs, setFaqs] = useState([]);
//   const [reviews, setReviews] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Cart state
//   const [cartItems, setCartItems] = useState([]);

//   useEffect(() => {
//     Promise.all([
//       axios.get(`api/products/servicesinfo/${id}/`),
//       axios.get(`api/products/faqs/`),
//       axios.get(`api/products/reviews/`),
//     ])
//       .then(([svcRes, faqRes, reviewRes]) => {
//         setService(svcRes.data);
//         setFaqs(faqRes.data || []);
//         setReviews(reviewRes.data || []);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Error fetching service info:", err);
//         setLoading(false);
//       });
//   }, [id]);

//   // Helper: get numeric price from service
//   const getNumericPrice = (priceStr) => {
//     if (!priceStr) return 0;
//     return Number(priceStr.replace(/[^0-9.]/g, "")) || 0;
//   };

//   // Add to cart
//   const handleAddToCart = () => {
//     if (!service) return;

//     const numericPrice = getNumericPrice(service.price);

//     setCartItems((prev) => {
//       const existing = prev.find((item) => item.id === service.id);
//       if (existing) {
//         return prev.map((item) =>
//           item.id === service.id
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         );
//       }
//       return [
//         ...prev,
//         {
//           id: service.id,
//           title: service.title,
//           service: service, // keep service info for modal
//           quantity: 1,
//           price: numericPrice, // store numeric price
//         },
//       ];
//     });

//     // Optionally, call backend API
//     axios
//       .post("/api/cart/", { service_id: service.id, quantity: 1 })
//       .catch((err) => console.error("Error adding to cart:", err));
//   };

//   // Update quantity
//   const handleUpdateQty = (id, newQty) => {
//     if (newQty < 1) return;
//     setCartItems((prev) =>
//       prev.map((item) =>
//         item.id === id ? { ...item, quantity: newQty } : item
//       )
//     );
//   };

//   // Close modal
//   const handleCloseModal = () => setCartItems([]);

//   // Book now
//   const handleBookNow = () => {
//     alert("Booking placed successfully! 🚀");
//     setCartItems([]);
//   };

//   if (loading) return <p className="text-center p-10">Loading...</p>;
//   if (!service)
//     return <p className="text-center text-red-500">Service not found</p>;

//   return (
//     <div className="bg-white min-h-screen">
//       {/* Top Header */}
//       <div className="text-black py-4 px-6 text-left font-bold text-3xl">
//         {service.title}
//       </div>

//       {/* Service Info Card */}
//       <div className="max-w-5xl mx-auto mt-3 p-6 border rounded-xl flex flex-col md:flex-row justify-between items-center">
//         <div className="flex items-center gap-6 flex-1">
//           <img
//             src={service.image}
//             alt={service.title}
//             className="w-24 h-24 object-contain"
//           />
//           <div>
//             <h2 className="text-lg font-semibold">{service.title}</h2>
//             <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
//               <FaStar className="text-blue-600" /> {service.rating} (
//               {service.reviews_count} reviews)
//             </p>
//             <p className="mt-1 font-medium">{service.price}</p>
//             <p className="text-sm text-gray-600">{service.duration}</p>
//             {service.offer && (
//               <p className="text-xs text-gray-500">{service.offer}</p>
//             )}
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex flex-col gap-3 mt-6 md:mt-0">
//           <button
//             onClick={handleAddToCart}
//             className="bg-[#CD3A00] text-white px-6 py-2 rounded-full hover:bg-[#b83600]"
//           >
//             Add to cart
//           </button>
//           <a
//             href="tel:+911234567890"
//             className="bg-orange-200 text-[#CD3A00] font-semibold px-6 py-2 rounded-full flex items-center justify-center gap-2 hover:bg-orange-300"
//           >
//             <IoCallOutline /> Call (+91)1234567890
//           </a>
//         </div>
//       </div>

//       <hr className="my-6 border-t border-gray-300" />

//       {/* Process + Technicians */}
//       <div className="max-w-6xl mx-auto mt-10 grid md:grid-cols-2 gap-6 px-6">
//         {/* Process */}
//         <div className="bg-[#0056B3CC] text-white rounded-xl p-6">
//           <h3 className="text-lg font-bold mb-4">Our Process</h3>
//           <ul className="space-y-3 text-sm">
//             <li>1. Inspection – We will check the space before installation</li>
//             <li>2. Installation – We install with care and precision</li>
//             <li>3. Cleanup – We clean the area once work is complete</li>
//             <li>4. Warranty – Covered by a 30-day warranty</li>
//           </ul>
//         </div>

//         {/* Top Technicians */}
//         <div className="bg-[#0056B3CC] text-white rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
//           <div>
//             <h3 className="text-lg font-bold mb-4">Top technicians</h3>
//             <ul className="space-y-2 text-sm">
//               <li>✅ Background verified</li>
//               <li>✅ Trained across all major brands</li>
//               <li>✅ Certified under skill India programme</li>
//             </ul>
//           </div>
//           <img
//             src={techImg}
//             alt="Technician"
//             className="w-42 h-42 object-contain rounded-lg"
//           />
//         </div>
//       </div>

//       {/* FAQs */}
//       <div className="max-w-5xl mx-auto mt-12 px-6">
//         <h3 className="text-center text-xl font-bold mb-6">
//           Frequently Asked Questions
//         </h3>
//         <div className="space-y-4">
//           {faqs.map((faq) => (
//             <div key={faq.id} className="bg-gray-100 rounded-lg p-4">
//               <p className="font-semibold">{faq.question}</p>
//               <p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Reviews */}
//       <div className="max-w-6xl mx-auto mt-12 px-6 mb-12">
//         <h3 className="text-center text-xl font-bold mb-6">
//           What Our Happy Customers Are Saying
//         </h3>
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
//           {reviews.map((r) => (
//             <div
//               key={r.id}
//               className="border rounded-xl p-4 shadow-sm bg-white flex flex-col justify-between h-52 w-full"
//             >
//               <div className="flex justify-start gap-1 mb-2">
//                 {[...Array(r.stars)].map((_, i) => (
//                   <FaStar key={i} className="text-yellow-500" />
//                 ))}
//               </div>
//               <p className="text-md text-black flex-grow overflow-hidden line-clamp-5">
//                 {r.text}
//               </p>
//               <div className="flex items-center gap-3 mt-3">
//                 {r.image && (
//                   <img
//                     src={r.image}
//                     alt={r.author}
//                     className="w-8 h-8 rounded-full object-cover border"
//                   />
//                 )}
//                 <div className="flex-1 text-left">
//                   <p className="font-semibold text-sm">{r.author}</p>
//                   <p className="text-xs text-gray-500">{r.service_name}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Cart Modal */}
//       {cartItems.length > 0 && (
//         <Cart
//           cartItems={cartItems}
//           onClose={handleCloseModal}
//           onUpdateQty={handleUpdateQty}
//           onBookNow={handleBookNow}
//         />
//       )}
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IoCallOutline } from "react-icons/io5";
import { FaStar } from "react-icons/fa";
import axios from "../api/api";
import techImg from "../assets/about1.jpg";
import Cart from "../components/Cart"; // ✅ Cart modal component
import FAQSection from "../components/FAQSection";
import ReviewsSection from "../components/ReviewsSection";

export default function Booking() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cart state
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    axios
      .get(`api/products/servicesinfo/${id}/`)
      .then((res) => {
        setService(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching service info:", err);
        setLoading(false);
      });
  }, [id]);

  // Helper: get numeric price
  const getNumericPrice = (priceStr) => {
    if (!priceStr) return 0;
    return Number(priceStr.replace(/[^0-9.]/g, "")) || 0;
  };

  // Add to cart
  const handleAddToCart = () => {
    if (!service) return;

    const numericPrice = getNumericPrice(service.price);

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === service.id);
      if (existing) {
        return prev.map((item) =>
          item.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: service.id,
          title: service.title,
          service,
          quantity: 1,
          price: numericPrice,
        },
      ];
    });

    // Backend API
    axios
      .post("/api/cart/", { service_id: service.id, quantity: 1 })
      .catch((err) => console.error("Error adding to cart:", err));
  };

  // Update qty
  const handleUpdateQty = (id, newQty) => {
    if (newQty < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQty } : item
      )
    );
  };

  // Close modal
  const handleCloseModal = () => setCartItems([]);

  // Book now
  const handleBookNow = () => {
    // alert("Booking placed successfully! ");
    setCartItems([]);
  };

  if (loading) return <p className="text-center p-10">Loading...</p>;
  if (!service)
    return <p className="text-center text-red-500">Service not found</p>;

  return (
    <div className="bg-white min-h-screen">
      {/* Top Header */}
      <div className="text-black py-4 px-6 text-left font-bold text-3xl">
        {service.title}
      </div>

      {/* Service Info Card */}
      <div className="max-w-7xl mx-auto mt-3 p-6 border rounded-xl flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-6 flex-1">
          <img
            src={service.image}
            alt={service.title}
            className="w-24 h-24 object-contain"
          />
          <div>
            <h2 className="text-lg font-semibold">{service.title}</h2>
            <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
              <FaStar className="text-blue-600" /> {service.rating} (
              {service.reviews_count} reviews)
            </p>
            <p className="mt-1 font-medium">{service.price}</p>
            <p className="text-sm text-gray-600">{service.duration}</p>
            {service.offer && (
              <p className="text-xs text-gray-500">{service.offer}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-6 md:mt-0">
          <button
            onClick={handleAddToCart}
            className="bg-[#CD3A00] text-white px-6 py-2 rounded-full hover:bg-[#b83600]"
          >
            Add to cart
          </button>
          <a
            href="tel:+911234567890"
            className="bg-orange-200 text-[#CD3A00] font-semibold px-6 py-2 rounded-full flex items-center justify-center gap-2 hover:bg-orange-300"
          >
            <IoCallOutline /> Call (+91)1234567890
          </a>
        </div>
      </div>

      <hr className="my-6 border-t border-gray-300" />

      {/* Process + Technicians */}
      <div className="max-w-7xl mx-auto mt-10 grid md:grid-cols-2 gap-6 px-2">
        {/* Process */}
        <div className="bg-[#0056B3CC] text-white rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Our Process</h3>
          <ul className="space-y-3 text-sm">
            <li>1. Inspection – We will check the space before installation</li>
            <li>2. Installation – We install with care and precision</li>
            <li>3. Cleanup – We clean the area once work is complete</li>
            <li>4. Warranty – Covered by a 30-day warranty</li>
          </ul>
        </div>

        {/* Top Technicians */}
        <div className="bg-[#0056B3CC] text-white rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div>
            <h3 className="text-lg font-bold mb-4">Top technicians</h3>
            <ul className="space-y-2 text-sm">
              <li>✅ Background verified</li>
              <li>✅ Trained across all major brands</li>
              <li>✅ Certified under skill India programme</li>
            </ul>
          </div>
          <img
            src={techImg}
            alt="Technician"
            className="w-36 h-36 object-contain rounded-lg"
          />
        </div>
      </div>

      {/* Cart Modal */}
      {cartItems.length > 0 && (
        <Cart
          cartItems={cartItems}
          onClose={handleCloseModal}
          onUpdateQty={handleUpdateQty}
          onBookNow={handleBookNow}
        />
      )}
      <FAQSection />
      <ReviewsSection />
    </div>
  );
}
