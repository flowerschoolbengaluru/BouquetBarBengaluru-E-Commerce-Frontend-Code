import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";

// Import images
import FlowersWithNuts from "@/CategoryImages/flowerswithnuts.jpg";
import FlowerWithCakes from "@/CategoryImages/FlowerwithCakes.jpg";
import CustomizedMessageCards from "@/CategoryImages/CustomizedMessageCards.jpg";
import BrandThemedFloralArrangements from "@/CategoryImages/BrandThemedFloralArrangements.jpg";
import PetMemorialFlowers from "@/CategoryImages/Petmemorialflowers.jpg";

const PostFileSix = () => {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const products = [
    { 
      id: 1, 
      title: "Flowers with Nuts", 
      image: FlowersWithNuts,
      price: "1500",
      category: "Gift Combos",
      subcategory: "Flowers with Food"
    },
    { 
      id: 2, 
      title: "Flower with Cakes", 
      image: FlowerWithCakes,
      price: "1800",
      category: "Gift Combos",
      subcategory: "Flowers with Desserts"
    },
    { 
      id: 3, 
      title: "Customized Message Cards", 
      image: CustomizedMessageCards,
      price: "700",
      category: "Accessories",
      subcategory: "Personalized Items"
    },
    { 
      id: 4, 
      title: "Brand Themed Floral", 
      image: BrandThemedFloralArrangements,
      price: "850",
      category: "Special Arrangements",
      subcategory: "Corporate Gifts"
    },
    { 
      id: 5, 
      title: "Pet Memorial Flowers", 
      image: PetMemorialFlowers,
      price: "650",
      category: "Sympathy Flowers",
      subcategory: "Pet Memorials"
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

  const handleProductClick = (product: typeof products[0]) => {
    // Navigate to ProductsListing with category and subcategory parameters
    setLocation(`/products?main_category=${encodeURIComponent(product.category)}&subcategory=${encodeURIComponent(product.subcategory)}`);
  };

  return (
    <div ref={componentRef} className="w-full py-16">
      {/* Animated Heading */}
      <div className="px-6">
        <h2 
          className={`text-4xl font-bold text-gray-900 mb-12 text-left transition-all duration-800 ease-out ${
            isVisible 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 -translate-x-8'
          }`}
        >
          Unique Gift Combinations
        </h2>
   
      </div>

      {/* Products grid with enhanced animations */}
      <div className="px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className={`w-full transform transition-all duration-700 ease-out cursor-pointer ${
                isVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-12 scale-95'
              }`}
              style={{
                animationDelay: isVisible ? `${index * 0.15}s` : '0s',
                animation: isVisible ? 'giftComboSlideIn 0.8s ease-out forwards' : 'none'
              }}
              onClick={() => handleProductClick(product)}
            >
              <div className="group relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 h-full flex flex-col">
              
                {/* Image Container */}
                <div className="flex-1 p-4 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-56 object-cover rounded-lg transition-transform duration-700 group-hover:scale-110 z-10 relative"
                  />
                  
                </div>
                  <h3 className="text-md font-semibold text-center z-10 relative">
                    {product.title}
                  </h3>
                 
 <p className="text-xl font-bold text-center mt-1 z-10 relative">
                    ₹{product.price}
                  </p>
                {/* Footer with CTA */}
                <div className="p-3 bg-gray-50 border-t border-gray-100">
                  <button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2 rounded-lg font-semibold transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-lg">
                    Shop Now
                  </button>
                </div>

               
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Call-to-Action */}
      <div 
        className={`px-6 mt-12 text-center transition-all duration-1000 delay-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
      
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes giftComboSlideIn {
          0% {
            opacity: 0;
            transform: translateY(60px) scale(0.9) rotateY(5deg);
          }
          60% {
            opacity: 1;
            transform: translateY(-8px) scale(1.02) rotateY(-1deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotateY(0deg);
          }
        }
        
        @keyframes floatGently {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        .group:hover {
          animation: floatGently 3s ease-in-out infinite;
        }
        
        /* Individual card hover variations */
        .group:nth-child(1):hover {
          animation-duration: 2.5s;
        }
        
        .group:nth-child(2):hover {
          animation-duration: 3s;
        }
        
        .group:nth-child(3):hover {
          animation-duration: 3.5s;
        }
        
        .group:nth-child(4):hover {
          animation-duration: 4s;
        }
        
        .group:nth-child(5):hover {
          animation-duration: 4.5s;
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .group:hover .sparkle {
          animation: sparkle 1s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default PostFileSix;