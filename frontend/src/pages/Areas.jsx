import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function AreasGrid() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get("areas/")
      .then((res) => {
        if (mounted) setAreas(res.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const columns = [[], [], []];
  areas.forEach((a, i) => columns[i % 3].push(a));

  return (
    <section className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Heading */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#b84f18]">
          Areas we services
        </h2>
        <p className="mt-2 text-sm sm:text-base text-gray-700 max-w-3xl mx-auto">
          Below are some areas we provide electrical services to. But, don't
          worry if your area is not listed, we likely service your area too!
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center text-gray-500 py-6">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 mb-12">
          {columns.map((col, ci) => (
            <div key={ci} className="space-y-4">
              {col.map((area) => (
                <div key={area.id} className="flex justify-center">
                  <div className="w-full max-w-lg">
                    <div className="bg-gray-100 h-10 sm:h-11 flex items-center justify-center rounded-sm">
                      <span className="text-center text-sm text-gray-800">
                        {area.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* CTA section */}
      <div className="bg-[#e25d2f] text-white rounded-xl px-6 py-8 flex flex-col md:flex-row items-center justify-between">
        <h3 className="text-xl sm:text-2xl font-bold text-center md:text-left mb-4 md:mb-0">
          Get in Touch with Electric Dreams <br />
          Electrical Today
        </h3>
        <a
          href="tel:+9112345676890"
          className="bg-white text-black font-bold px-6 py-2 rounded-full shadow-md hover:scale-105 transition-transform"
        >
          Call (+91)12345676890
        </a>
      </div>
    </section>
  );
}
