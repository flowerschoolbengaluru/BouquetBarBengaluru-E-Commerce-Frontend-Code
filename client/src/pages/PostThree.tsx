import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";

// Import images
import FishBowlExotic from "@/CategoryImages/FishBowlExotic.jpg";
import OrchidAnthurium from "@/CategoryImages/OrchidAnthurium.jpg";
import VibrantPurpleFlowerArrangement from "@/CategoryImages/VibrantPurpleFlowerArrangement.jpg";
import CompoteVasewithExoticFlowers from "@/CategoryImages/CompoteVasewithExoticFlowers.jpg";
import BabysBreathCrossArrangement from "@/CategoryImages/BabysBreathCrossArrangement.jpg";
import WinebottleFlowerbox23 from "@/CategoryImages/WinebottleFlowerbox23.jpg";
import ColouredRosesHandTiedBouquet from "@/CategoryImages/ColouredRosesHandTiedBouquet.jpg";
import RebloomedBottles1 from "@/CategoryImages/RebloomedBottles1.jpg";

const PostThree = () => {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const flowerData = [
    { 
      id: 1, 
      title: "Fish Bowl Exotic", 
      image: FishBowlExotic, 
      category: "Exotic Flowers", 
      subcategory: "Vase Arrangements" 
    },
    { 
      id: 4, 
      title: "Orchid Anthurium", 
      image: OrchidAnthurium, 
      category: "Orchids", 
      subcategory: "Exotic Arrangements" 
    },
    { 
      id: 5, 
      title: "Purple", 
      image: VibrantPurpleFlowerArrangement, 
      category: "Mixed Flowers", 
      subcategory: "Premium Arrangements" 
    },
    { 
      id: 6, 
      title: "Compote Vase", 
      image: CompoteVasewithExoticFlowers, 
      category: "Exotic Flowers", 
      subcategory: "Vase Arrangements" 
    },
    { 
      id: 7, 
      title: "Babys Breath", 
      image: BabysBreathCrossArrangement, 
      category: "Special Arrangements", 
      subcategory: "Unique Designs" 
    },
    { 
      id: 8, 
      title: "Wine bottle", 
      image: WinebottleFlowerbox23, 
      category: "Creative Designs", 
      subcategory: "Bottle Arrangements" 
    },
    { 
      id: 10, 
      title: "Coloured Roses", 
      image: ColouredRosesHandTiedBouquet, 
      category: "Roses", 
      subcategory: "Hand-Tied Bouquets" 
    },
    { 
      id: 11, 
      title: "Rebloomed Bottles", 
      image: RebloomedBottles1, 
      category: "Creative Designs", 
      subcategory: "Bottle Arrangements" 
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
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
    <div ref={componentRef} className="w-full py-16">
      {/* Animated Heading */}
      <div className="px-6">
        <h2 
          className={`text-3xl font-bold text-gray-900 mb-8 text-left transition-all duration-700 ease-out ${
            isVisible 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 -translate-x-8'
          }`}
        >
          Exotic Floral Arrangements & Creations
        </h2>
      </div>

      {/* Grid layout with animations */}
      <div className="px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-6">
          {flowerData.map((flower, index) => (
            <div 
              key={flower.id}
              className={`w-full transform transition-all duration-700 ease-out cursor-pointer ${
                isVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-8 scale-95'
              }`}
              style={{
                animationDelay: isVisible ? `${index * 0.1}s` : '0s',
                animation: isVisible ? 'cardPopIn 0.6s ease-out forwards' : 'none'
              }}
              onClick={() => handleImageClick(flower)}
            >
              <div className="group relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                {/* Image Container */}
                <div className="relative overflow-hidden h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={flower.image}
                    alt={flower.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                 
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
                
                {/* Title */}
                <div className="p-3 bg-white">
                  <p className="text-sm font-semibold text-gray-800 text-center group-hover:text-pink-600 transition-colors duration-300 whitespace-nowrap overflow-hidden text-ellipsis">
                    {flower.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes cardPopIn {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.9) rotateX(10deg);
          }
          60% {
            opacity: 1;
            transform: translateY(-5px) scale(1.02) rotateX(0deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotateX(0deg);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .grid > div {
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
};

export default PostThree;