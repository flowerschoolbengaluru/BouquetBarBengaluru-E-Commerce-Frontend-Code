import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";

// Import images
import Anthurium from "@/CategoryImages/Anthurium.jpg";
import ExoticArrangments from "@/CategoryImages/ExoticArrangments.jpg";
import SympathyFuneralFlowers from "@/CategoryImages/SympathyFuneralFlowers.jpg";

const PostFileFive = () => {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const images = [
    { 
      id: 1, 
      title: "Anthurium", 
      image: Anthurium,
      category: "Exotic Flowers",
      subcategory: "Tropical Arrangements"
    },
    { 
      id: 2, 
      title: "Exotic Arrangements", 
      image: ExoticArrangments,
      category: "Exotic Flowers", 
      subcategory: "Premium Arrangements"
    },
    { 
      id: 3, 
      title: "Sympathy Funeral Flowers", 
      image: SympathyFuneralFlowers,
      category: "Sympathy Flowers",
      subcategory: "Funeral Arrangements"
    }
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

  const handleImageClick = (item: typeof images[0]) => {
    // Navigate to ProductsListing with category and subcategory parameters
    setLocation(`/products?main_category=${encodeURIComponent(item.category)}&subcategory=${encodeURIComponent(item.subcategory)}`);
  };

  return (
    <div ref={componentRef} className="w-full py-16 ">
      {/* Animated Heading */}
      <div className="px-6">
        <h2 
          className={`text-4xl font-bold text-gray-900 mb-12 text-left transition-all duration-800 ease-out ${
            isVisible 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 -translate-x-10'
          }`}
        >
          Floral Collections
        </h2>
      </div>

      {/* Images grid with enhanced animations */}
      <div className="px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {images.map((item, index) => (
            <div 
              key={item.id} 
              className={`w-full transform transition-all duration-900 ease-out cursor-pointer ${
                isVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-16 scale-95'
              }`}
              style={{
                animationDelay: isVisible ? `${index * 0.3}s` : '0s',
                animation: isVisible ? 'collectionSlideIn 1s ease-out forwards' : 'none'
              }}
              onClick={() => handleImageClick(item)}
            >
              <div className="group relative bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-600 hover:shadow-3xl hover:-translate-y-4">
                {/* Image Container */}
                <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Hover Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-8 text-white transform translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold drop-shadow-lg">{item.title}</h3>
                      <p className="text-lg font-medium text-gray-200 drop-shadow-md">
                        Explore our curated collection
                      </p>
                      <button className="bg-white/20 backdrop-blur-sm border-2 border-white/30 px-6 py-2 rounded-full font-semibold hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
                        View Collection →
                      </button>
                    </div>
                  </div>
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200" />
                </div>
                
                {/* Default Title (Visible when not hovering) */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent text-white group-hover:opacity-0 transition-opacity duration-300">
                  <h3 className="text-xl font-bold text-center">{item.title}</h3>
                </div>
                
              
                
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info Section */}
      <div 
        className={`px-6 mt-12 transition-all duration-1000 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
       
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes collectionSlideIn {
          0% {
            opacity: 0;
            transform: translateY(80px) scale(0.9) rotateY(10deg);
          }
          60% {
            opacity: 1;
            transform: translateY(-15px) scale(1.05) rotateY(-2deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotateY(0deg);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .group:hover {
          animation: float 6s ease-in-out infinite;
        }
        
        /* Individual card hover effects */
        .group:nth-child(1):hover {
          animation-duration: 4s;
        }
        
        .group:nth-child(2):hover {
          animation-duration: 5s;
        }
        
        .group:nth-child(3):hover {
          animation-duration: 6s;
        }
      `}</style>
    </div>
  );
};

export default PostFileFive;