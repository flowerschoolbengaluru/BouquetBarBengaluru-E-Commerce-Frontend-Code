import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import CongratulationsFlowers from "@/CategoryImages/CongratulationsFlowers.jpg";
import PinkCarnations from "@/CategoryImages/PinkCarnations.jpg";
import PopularFlowers from "@/CategoryImages/PopularFlowers.jpg";
import Garden from "@/CategoryImages/Garden.jpg";
import SoftStem from "@/CategoryImages/SoftStem.jpg";
import SecondLine4 from "@/CategoryImages/SecondLine4.jpg";

const PostFileOne: React.FC = () => {
  const [, setLocation] = useLocation();
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  
  const cardData = [
    { 
      id: 1, 
      src: Garden, 
      alt: "Garden Collection", 
      text: "Garden Collection",
      category: "Garden Flowers",
      subcategory: "Collection"
    },
    { 
      id: 2, 
      src: PopularFlowers, 
      alt: "Popular Flowers", 
      text: "Popular Flowers",
      category: "Popular Flowers",
      subcategory: "Best Sellers"
    },
    { 
      id: 3, 
      src: SoftStem, 
      alt: "Corporate Services", 
      text: "Corporate Services",
      category: "Services",
      subcategory: "Corporate"
    },
    { 
      id: 4, 
      src: PinkCarnations, 
      alt: "Pink Carnations", 
      text: "Pink Carnations",
      category: "Carnations",
      subcategory: "Pink Flowers"
    },
    { 
      id: 5, 
      src: SecondLine4, 
      alt: "Exotic Coloured", 
      text: "Exotic Coloured",
      category: "Exotic Flowers",
      subcategory: "Colored Arrangements"
    },
    { 
      id: 6, 
      src: CongratulationsFlowers, 
      alt: "Gifts Mood", 
      text: "Gifts Mood",
      category: "Gift Flowers",
      subcategory: "Celebration"
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

  const handleCardClick = (card: typeof cardData[0]) => {
    console.log('Card clicked:', card); 
    // Navigate to ProductsListing with category and subcategory parameters
    setLocation(`/products?main_category=${encodeURIComponent(card.category)}&subcategory=${encodeURIComponent(card.subcategory)}`);
  };

  // Test navigation function
  const testNavigation = () => {
    console.log('Testing navigation...');
    setLocation('/products?main_category=Test&subcategory=Test');
  };

  return (
    <div ref={componentRef} className="w-full px-10 py-16">
      
      <div className="mb-12">
        <h2 
          className="text-5xl font-bold text-gray-900 mb-4 text-left"
        >
          Flowers for every occasion and need
        </h2>
      
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full">
        {/* Left Side - Garden Collection (Large Image) */}
        <div className="lg:w-1/2">
          <div 
            className="group relative overflow-hidden rounded-2xl transition-all duration-500 transform hover:-translate-y-3 hover:shadow-3xl cursor-pointer h-full"
            onMouseEnter={() => setActiveCard(1)}
            onMouseLeave={() => setActiveCard(null)}
            onClick={() => handleCardClick(cardData[0])}
          >
            <img
              src={Garden}
              alt="Garden Collection"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              style={{ minHeight: '450px' }}
            />
            
            {/* Enhanced Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end">
              <div className="p-8 text-white">
                <h3 className="font-bold text-3xl mb-2">Garden Collection</h3>
                <p className="text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                  Explore our beautiful garden-inspired arrangements
                </p>
              
              </div>
            </div>
            
           
          </div>
        </div>

        {/* Right Side - Two Rows */}
        <div className="lg:w-1/2 flex flex-col gap-8">
          
          {/* First Row - 4 Images in a line */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cardData.slice(1, 5).map((item, index) => (
              <div 
                key={item.id}
                className="group relative overflow-hidden rounded-xl transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
                onMouseEnter={() => setActiveCard(item.id)}
                onMouseLeave={() => setActiveCard(null)}
                onClick={() => handleCardClick(item)}
                style={{ height: '200px' }}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-115"
                />
                
               
                
                {/* Default Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-white">
                  <h3 className="font-semibold text-xs lg:text-sm">{item.text}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Second Row - Single Large Image */}
          <div className="flex-1">
            <div 
              className="group relative overflow-hidden rounded-2xl h-full transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
              onMouseEnter={() => setActiveCard(6)}
              onMouseLeave={() => setActiveCard(null)}
              onClick={() => handleCardClick(cardData[5])}
              style={{ minHeight: '220px' }}
            >
              <img
                src={CongratulationsFlowers}
                alt="Gifts Mood"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Enhanced Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end">
                <div className="p-6 text-white">
                  <h3 className="font-semibold text-2xl mb-2">Gifts Mood</h3>
                  <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                    Perfect arrangements for gift-giving occasions
                  </p>
                </div>
              </div>
              
            
            </div>
          </div>
        </div>
      </div>

      {/* CSS for basic animations */}
      <style jsx>{`
        .group:hover {
          transform: translateY(-2px);
          transition: transform 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default PostFileOne;