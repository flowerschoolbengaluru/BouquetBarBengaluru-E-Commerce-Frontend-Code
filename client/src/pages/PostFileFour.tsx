import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";

// Import images
import YellowChrysanthemumsGerberainWineGlass3 from "@/CategoryImages/YellowChrysanthemumsGerberainWineGlass3.jpg";
import DiwaliFlowerbox from "@/CategoryImages/DiwaliFlowerbox.jpg";
import Flowerbox from "@/CategoryImages/Flowerbox.jpg";
import DelivaryService2 from "@/CategoryImages/DelivaryService2.jpg";

const PostFileFour = () => {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const bestSellers = [
    { 
      id: 1, 
      title: "Yellow Chrysanthemums & Gerbera in Wine Glass", 
      image: YellowChrysanthemumsGerberainWineGlass3, 
      price: 800,
      width: "md:w-2/5", // 40% width
      category: "Chrysanthemums",
      subcategory: "Glass Arrangements"
    },
    { 
      id: 2, 
      title: "Diwali Flowerbox", 
      image: DiwaliFlowerbox, 
      price: 1900,
      width: "md:w-3/10", // 30% width
      category: "Festive Flowers",
      subcategory: "Box Arrangements"
    },
    { 
      id: 3, 
      title: "Flowerbox", 
      image: Flowerbox, 
      price: 2200,
      width: "md:w-3/10", // 30% width
      category: "Mixed Flowers",
      subcategory: "Box Arrangements"
    },
    { 
      id: 4, 
      title: "Delivery Services", 
      image: DelivaryService2, 
      price: 700,
      width: "md:w-2/5", // 40% width
      category: "Services",
      subcategory: "Delivery"
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

  const handleProductClick = (product: typeof bestSellers[0]) => {
  
    setLocation(`/products?main_category=${encodeURIComponent(product.category)}&subcategory=${encodeURIComponent(product.subcategory)}`);
  };

  return (
    <div ref={componentRef} className="w-full py-16 bg-white">
      {/* Animated Heading */}
      <div className="px-6">
        <h2 
          className={`text-3xl font-bold text-gray-900 mb-8 text-left transition-all duration-700 ease-out ${
            isVisible 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 -translate-x-8'
          }`}
        >
          Best Seller
        </h2>
      </div>

      {/* Flexbox layout with custom widths and animations */}
      <div className="px-6">
        <div className="flex flex-col md:flex-row gap-8">
          {bestSellers.map((product, index) => (
            <div 
              key={product.id} 
              className={`w-full ${product.width} transform transition-all duration-800 ease-out ${
                isVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-12 scale-95'
              }`}
              style={{
                animationDelay: isVisible ? `${index * 0.2}s` : '0s',
                animation: isVisible ? 'cardSlideIn 0.8s ease-out forwards' : 'none'
              }}
            >
              <div 
                className="group relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                {/* Image Container */}
                <div className="relative overflow-hidden h-80 bg-gradient-to-br from-gray-50 to-gray-100">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                
                  
                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    <span className="font-bold text-green-600 text-lg">₹{product.price}</span>
                  </div>
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
                
                {/* Content */}
                <div className="p-6 bg-gradient-to-b from-white to-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors duration-300">
                    {product.title}
                  </h3>
                  
                  {/* Rating and Actions */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-1">
                      {/* Star Rating */}
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-4 h-4 text-yellow-400 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-sm text-gray-500 ml-1">(4.8)</span>
                    </div>
                    
                    
                  </div>
                </div>
                
                
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes cardSlideIn {
          0% {
            opacity: 0;
            transform: translateY(60px) scale(0.9) rotateX(15deg);
          }
          60% {
            opacity: 1;
            transform: translateY(-10px) scale(1.02) rotateX(0deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotateX(0deg);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .group:hover {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PostFileFour;