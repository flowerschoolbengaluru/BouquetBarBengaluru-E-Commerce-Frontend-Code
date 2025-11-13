import React, { useRef, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import all the required images
import CelebrationFlower from "../CategoryImages/CelebrationFlower.jpg";
import FlowerTeddyCombos from "../CategoryImages/Flower&TeddyCombos.jpg";
import OfficeDesk from "../CategoryImages/OfficeDesk.jpg";
import Orchids from "../CategoryImages/Orchids.jpg";
import FlowerGarlands from "../CategoryImages/FlowerGarlands.jpg";
import WeddingFloralDecor from "../CategoryImages/WeddingFloralDecor.jpg";
import FlowersWithCheese from "../CategoryImages/flowerswithcheese.jpg";
import AnniversaryFlowers from "../CategoryImages/AnniversaryFlowers.jpg";
import Lilies from "../CategoryImages/Lilies.jpg";
import MixedFlower from "../CategoryImages/MixedFlower.jpg";

interface ImageItem {
  id: number;
  image: string;
  alt: string;
  text: string;
  category: string;
  subcategory: string;
}

interface SmallImagesProps {
  // You can add props here if needed in the future
}

const SmallImages: React.FC<SmallImagesProps> = () => {
  const [, setLocation] = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  
  const imageItems: ImageItem[] = [
    { id: 1, image: CelebrationFlower, alt: "Celebration Flowers", text: "Celebration", category: "Celebration", subcategory: "Party Flowers" },
    { id: 2, image: FlowerTeddyCombos, alt: "Flower & Teddy Combos", text: "Combo", category: "Gift Combos", subcategory: "Teddy Combos" },
    { id: 3, image: OfficeDesk, alt: "Office Desk Flowers", text: "OfficeDesk", category: "Office Flowers", subcategory: "Desk Arrangements" },
    { id: 4, image: Orchids, alt: "Orchids", text: "Orchids", category: "Orchids", subcategory: "Exotic Flowers" },
    { id: 5, image: FlowerGarlands, alt: "Flower Garlands", text: "Flower Garlands", category: "Garlands", subcategory: "Traditional" },
    { id: 6, image: WeddingFloralDecor, alt: "Wedding Floral Decor", text: "Wedding Floral Decor", category: "Wedding", subcategory: "Decorations" },
    { id: 7, image: FlowersWithCheese, alt: "Flowers with Cheese", text: "Flowers with Cheese", category: "Gift Combos", subcategory: "Food Pairings" },
    { id: 8, image: AnniversaryFlowers, alt: "Anniversary Flowers", text: "Anniversary Flowers", category: "Anniversary", subcategory: "Special Occasions" },
    { id: 9, image: Lilies, alt: "Lilies", text: "Lilies", category: "Lilies", subcategory: "Premium Flowers" },
    { id: 10, image: MixedFlower, alt: "Mixed Flowers", text: "Mixed Flower", category: "Mixed Flowers", subcategory: "Assorted" }
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

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const handleImageClick = (item: ImageItem) => {
    // Navigate to ProductsListing with category and subcategory parameters
    setLocation(`/products?main_category=${encodeURIComponent(item.category)}&subcategory=${encodeURIComponent(item.subcategory)}`);
  };

  return (
    <div 
      ref={componentRef}
      className="py-12"
    >
      <div className="px-4 ">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 
            className={`text-3xl font-bold text-gray-900 mb-3 transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Explore Flower Categories
          </h2>
         
        </div>

        {/* Scroll container with navigation buttons */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg z-10 hover:bg-white transition-all duration-300 hover:scale-110 ml-2"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg z-10 hover:bg-white transition-all duration-300 hover:scale-110 mr-2"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>

          {/* Scroll container */}
          <div 
            ref={scrollContainerRef}
            className="flex scrollbar-hide space-x-8 py-4 px-2 overflow-x-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {imageItems.map((item, index) => (
              <div 
                key={item.id} 
                className="flex-shrink-0 group flex flex-col items-center cursor-pointer transition-all duration-500"
                onClick={() => handleImageClick(item)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  animationDelay: isVisible ? `${index * 0.08}s` : '0s',
                  animation: isVisible ? 'bounceIn 0.8s ease-out forwards' : 'none'
                }}
              >
                {/* Image Container */}
                <div className="relative">
                  <div className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden shadow-2xl border-4 border-white group-hover:border-pink-300 transition-all duration-500 transform group-hover:scale-110 relative">
                    <img 
                      src={item.image} 
                      alt={item.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
                    />
                    
                   
                    
                    {/* Pulse Animation on Hover */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-pink-400 rounded-full animate-pulse" />
                  </div>
                  
                  {/* Floating Icon on Hover */}
                  <div className={`absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-2 transition-all duration-300 transform ${
                    hoveredItem === item.id ? 'scale-100 rotate-0' : 'scale-0 rotate-45'
                  }`}>
                  
                  </div>
                </div>
                
                {/* Text */}
                <div className="mt-4 text-center">
                  <p className="text-sm md:text-base font-semibold text-gray-800 group-hover:text-pink-600 transition-colors duration-300 transform group-hover:translate-y-1">
                    {item.text}
                  </p>
                
                </div>

                {/* Connecting Line (for visual flow) */}
                {index < imageItems.length - 1 && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 w-8 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </div>
            ))}
          </div>
        </div>

       

        {/* View All Button */}
        <div className={`text-center mt-8 transition-all duration-700 delay-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}>
          <button 
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => setLocation('/products')}
          >
            View All Categories
          </button>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.8) rotateY(10deg);
          }
          60% {
            opacity: 1;
            transform: translateY(-10px) scale(1.1) rotateY(-2deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotateY(0deg);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        .group:hover {
          animation: float 3s ease-in-out infinite;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Smooth scrolling */
        .scrollbar-hide {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default SmallImages;