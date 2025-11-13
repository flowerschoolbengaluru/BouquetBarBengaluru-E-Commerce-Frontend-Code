import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
// Import images (adjust paths as needed)
import Lily4 from "@/CategoryImages/Lily4.jpg";
import RedRoseBox from "@/CategoryImages/RedRoseBox.jpg";
import ColoredRoseBox from "@/CategoryImages/ColoredRoseBox.jpg";
import Lily2 from "@/CategoryImages/Lily2.jpg";
import PinkParadise from "@/CategoryImages/PinkParadise.jpg";

const PostFileTwo: React.FC = () => {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const flowerData = [
    { id: 1, title: "Lily Blooms", image: Lily4, category: "Lilies", subcategory: "Bouquets" },
    { id: 2, title: "Red Rose Box", image: RedRoseBox, category: "Roses", subcategory: "Box Arrangements" },
    { id: 3, title: "Colored Rose Box", image: ColoredRoseBox, category: "Roses", subcategory: "Box Arrangements" },
    { id: 4, title: "Exotic Long Arrangement", image: Lily2, category: "Lilies", subcategory: "Vase Arrangements" },
    { id: 5, title: "PinkParadise", image: PinkParadise, category: "Mixed Flowers", subcategory: "Bouquets" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );

    if (componentRef.current) {
      observer.observe(componentRef.current);
    }

    return () => {
      if (componentRef.current) {
        observer.unobserve(componentRef.current);
      }
    };
  }, []);

  const handleImageClick = (flower: typeof flowerData[0]) => {
    // Navigate to ProductsListing with category and subcategory parameters
    setLocation(`/products?main_category=${encodeURIComponent(flower.category)}&subcategory=${encodeURIComponent(flower.subcategory)}`);
  };

  return (
    <div ref={componentRef} className="w-full py-16 bg-white">
      {/* Heading with animation */}
      <div className="px-6">
        <h2 
          className={`text-3xl font-bold text-gray-900 mb-8 text-left transition-all duration-700 ease-out ${
            isVisible 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 -translate-x-8'
          }`}
        >
          Popular In Gifting
        </h2>
      </div>

      {/* Images container with staggered animation */}
      <div className="flex overflow-x-auto scrollbar-hide px-4">
        <div className="flex gap-6 min-w-max px-2">
          {flowerData.map((flower, index) => (
            <div 
              key={flower.id}
              className={`flex-shrink-0 transition-all duration-500 transform hover:scale-105 cursor-pointer ${
                isVisible ? 'animate-card-slide' : 'opacity-0 translate-y-8'
              }`}
              style={{
                animationDelay: isVisible ? `${index * 0.15}s` : '0s',
                animationFillMode: 'forwards'
              }}
              onClick={() => handleImageClick(flower)}
            >
              <div className="bg-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 mx-1 overflow-hidden group">
                {/* Image Container */}
                <div className="relative overflow-hidden">
                  <img
                    src={flower.image}
                    alt={flower.title}
                    className="w-64 h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                 
                </div>
                
                {/* Title */}
                <div className="p-4">
                  <p className="text-base font-semibold text-gray-800 text-center group-hover:text-pink-600 transition-colors duration-300">
                    {flower.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicators */}
      <div className="flex justify-center mt-6 space-x-2">
        {flowerData.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isVisible ? 'bg-pink-400 animate-pulse' : 'bg-gray-300'
            }`}
            style={{
              animationDelay: isVisible ? `${index * 0.1}s` : '0s'
            }}
          />
        ))}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes card-slide {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-card-slide {
          animation: card-slide 0.8s ease-out forwards;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Custom scrollbar for webkit browsers */
        .scrollbar-hide::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-hide::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 10px;
        }
        
        .scrollbar-hide:hover::-webkit-scrollbar-thumb {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
};

export default PostFileTwo;