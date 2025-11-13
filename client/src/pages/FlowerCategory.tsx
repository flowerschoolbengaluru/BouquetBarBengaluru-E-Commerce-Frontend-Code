import React, { useState, useRef, useEffect, createContext, useContext } from "react";
import PopupForm from "../components/PopupForm";
import { ChevronDown, ChevronUp, Menu, X } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Category Context
const CategoryContext = createContext<{
  showProductsFor: string | null;
  setShowProductsFor: (categoryId: string | null) => void;
  allCategories: Category[];
}>({ showProductsFor: null, setShowProductsFor: () => {}, allCategories: [] });

export const useCategoryContext = () => useContext(CategoryContext);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showProductsFor, setShowProductsFor] = useState<string | null>(null);
  
  return (
    <CategoryContext.Provider value={{ showProductsFor, setShowProductsFor, allCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};
import BirthdayImg from "../CategoryImages/BoxArrangements.jpg";
import BouquetImg from "../CategoryImages/DoorFlower.jpg";
import TulipsImg from "../CategoryImages/Teddy.jpg";
import GiftComboImg from "../CategoryImages/Vase&Bowl Arrangements.jpg";
import WeddingDecorImg from "../CategoryImages/Special&CreativePieces.jpg";
import SameDayDeliveryImg from "../CategoryImages/LilyArrangements.jpg";
import MemorialImg from "../CategoryImages/MixedFlower.jpg";
import CorporateImg from "../CategoryImages/Roses.jpg";
import PostFile from "./PostFileProps";
import { useLocation } from "wouter";

interface Product {
  id: string;
  name: string;
  price: string;
  discountPrice?: string;
  discounts_offers?: boolean;
  image?: string;
  images?: string[];
  inStock: boolean;
  featured?: boolean;
  main_category?: string[];
  subcategory?: string[];
  description?: string;
}

interface SubCategoryGroup {
  title: string;
  items: string[];
}

interface Category {
  id: string;
  name: string;
  groups: SubCategoryGroup[];
  image: string;
  imageAlt: string;
}

const allCategories: Category[] = [
  {
    id: "occasion",
    name: "Occasion",
    image: BirthdayImg,
    imageAlt: "Birthday Flowers",
    groups: [
      {
        title: "Celebration Flowers",
        items: [
          "Father's Day",
          "Mother's Day",
          "Valentine's Day",
          "Self-Flowers (self-love / pampering)",
          "Sister Love",
          "Brother Love",
          "Friendship Day",
          "Anniversary",
          "Birthday",
          "Get Well Soon / Recovery Flowers",
          "I'm Sorry Flowers",
          "I Love You Flowers",
          "Congratulations Flowers",
          "Graduation Day Flowers",
          "Promotion / Success Party Flowers",
        ]
      },
      {
        title: "Special Occasions",
        items: [
          "Proposal / Date Night Flowers",
          "Baby Showers Flowers",
          "New Baby Arrival Flowers",
          "Housewarming Flowers",
          "Teacher's Day Flowers",
          "Children's Day Flowers",
          "Farewell Flowers",
          "Retirement Flowers",
          "Women's Day Flowers",
          "Men's Day Flowers",
          "Good Luck Flowers (before exams, interviews, journeys)",
          "Grandparent's Day Flowers",
          "Pride Month Flowers"
        ]
      }
    ]
  },
  {
    id: "arrangements",
    name: "Arrangement",
    image: BouquetImg,
    imageAlt: "Bouquets",
    groups: [
      {
        title: "Popular Arrangements",
        items: [
          "Bouquets (hand-tied, wrapped)",
          "Flower Baskets",
          "Flower Boxes",
          "Vase Arrangements",
          "Floral Centerpieces",
          "Flower Garlands",
          "Lobby Arrangements",
          "Exotic Arrangements"
        ]
      },
      {
        title: "Specialty Arrangements",
        items: [
          "Exotic Arrangements",
          "Floral Cross Arrangement",
          "Baby's Breath Arrangement",
          "Gladiolus Arrangement",
          "Wine Bottle Arrangements",
          "Floral Wreaths",
          "Custom Arrangements",
        ]
      }
    ]
  },
  {
    id: "flower-types",
    name: "Flowers",
    image: TulipsImg,
    imageAlt: "Tulips",
    groups: [
      {
        title: "Popular Flowers",
        items: [
          "Tulips",
          "Lilies",
          "Carnations",
          "Orchids",
          "Sunflowers",
          "Mixed Flowers",
          "Roses",
          "Get Well Soon / Recovery Flowers",
        ]
      },
      {
        title: "Specialty Flowers",
        items: [
          "Baby's Breath",
          "Chrysanthemum",
          "Hydrangea",
          "Anthurium",
          "Calla Lilies",
          "Gerberas",
          "Peonies",
          "Retirement Flowers",
        ]
      }
    ]
  },
  {
    id: "gift-combo",
    name: "Gifts",
    image: GiftComboImg,
    imageAlt: "Gift Combos",
    groups: [
      {
        title: "Flower Combos",
        items: [
          "Flowers with Greeting Cards",
          "Flower with Fruits",
          "Floral Gift Hampers",
          "Flower with Chocolates",
          "Flower with Cakes",
          "Flowers with Cheese",
          "Flowers with Nuts",
          "Good Luck Flowers (before exams, interviews, journeys)",
          "Grandparent's Day Flowers",
          "Pride Month Flowers",
          "Thank You"
        ]
      },
      {
        title: "Special Gift Sets",
        items: [
          "Best Wishes",
          "Flowers with Customized Gifts",
          "Flowers with Wine",
          "Flowers with Perfume",
          "Flowers with Jewelry",
          "Flowers with Teddy Bears",
          "Flowers with Scented Candles",
          "Flowers with Personalized Items",
          "Farewell Flowers",
          "Teacher's Day Flowers",
          "Children's Day Flowers",
          "Farewell Flowers",
        ]
      }
    ]
  },
  {
    id: "event-decoration",
    name: "Event/Venue",
    image: WeddingDecorImg,
    imageAlt: "Wedding Decor",
    groups: [
      {
        title: "Event Decorations",
        items: [
          "Wedding Floral Decor",
          "Corporate Event Flowers",
          "Party Flower Decorations",
          "Stage & Backdrop Flowers",
          "Car Decoration Flowers",
          "Temple / Pooja Flowers",
          "Birthday Decorations",
        ]
      },
      {
        title: "Venue Arrangements",
        items: [
          "Entrance Arrangements",
          "Table Centerpieces",
          "Aisle Decorations",
          "Archway Flowers",
          "Ceiling Installations",
          "Wall Decorations",
          "Outdoor Event Flowers",
        ]
      }
    ]
  },
  {
    id: "services",
    name: "Services",
    image: SameDayDeliveryImg,
    imageAlt: "Same Day Delivery",
    groups: [
      {
        title: "Delivery Services",
        items: [
          "Same-Day Flower Delivery",
          "Next Day Delivery",
          "Customized Message Cards",
          "Floral Subscriptions Weekly/monthly",
          
        ]
      },
    ]
  },
  {
    id: "memorial",
    name: "Memorial/Sympathy",
    image: MemorialImg,
    imageAlt: "Memorial Flowers",
    groups: [
      {
        title: "Sympathy",
        items: [
          "Pet Memorial Flowers",
          "Funeral Wreaths",
          "Condolence Bouquets",
          "Remembrance Flowers",
          "Memorial Sprays",
          "Casket Arrangements",
          "Sympathy",
        ]
      },
      {
        title: "Memorial Services",
        items: [
          "Funeral Home Delivery",
          "Church Arrangements",
          "Graveside Flowers",
          "Memorial Service Flowers",
          "Sympathy Gift Baskets",
          "Living Tributes",
          "Memorial Donations",
        ]
      }
    ]
  },
  {
    id: "corporate",
    name: "Corporate",
    image: CorporateImg,
    imageAlt: "Corporate Flowers",
    groups: [
      {
        title: "Office Arrangements",
        items: [
          "Office Desk Flowers",
          "Reception Area Flowers",
          "Corporate Gifting Flowers",
          "Brand-Themed Floral Arrangements",
          "Conference Room Flowers",
          "Executive Office Arrangements",
          "Lobby Displays",
        ]
      },
      {
        title: "Corporate Services",
        items: [
          "Corporate Accounts",
          "Volume Discounts",
          "Regular Maintenance",
          "Custom Corporate Designs",
          "Event Floristry Services",
          "Branded Arrangements",
          "Long-term Contracts",
        ]
      }
    ]
  }
];

// Product Card Component
const ProductCard: React.FC<{ product: Product; onProductClick: (productId: string) => void }> = ({ product, onProductClick }) => {
  const hasDiscount = product.discounts_offers && product.discountPrice && parseFloat(product.discountPrice) < parseFloat(product.price);
  const discountPercentage = hasDiscount 
    ? Math.round(((parseFloat(product.price) - parseFloat(product.discountPrice!)) / parseFloat(product.price)) * 100)
    : 0;

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
      onClick={() => onProductClick(product.id)}
    >
      <div className="relative">
        <img
          src={product.image ? `data:image/jpeg;base64,${product.image}` : (product.images && product.images[0]) ? `data:image/jpeg;base64,${product.images[0]}` : '/placeholder-flower.jpg'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-flower.jpg';
          }}
        />
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {discountPercentage}% OFF
          </div>
        )}
        {product.featured && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            Featured
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-bold">Out of Stock</span>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2 mb-2">
          {hasDiscount ? (
            <>
              <span className="text-lg font-bold text-pink-600">₹{product.discountPrice}</span>
              <span className="text-sm text-gray-500 line-through">₹{product.price}</span>
            </>
          ) : (
            <span className="text-lg font-bold text-pink-600">₹{product.price}</span>
          )}
        </div>
        
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Desktop Category Card Component
const CategoryCard: React.FC<{ 
  category: Category | null; 
  isVisible: boolean;
  position: { left: number; width: number; } | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onItemClick: (item: string, categoryId: string) => void;
  selectedSubcategories: Set<string>;
}> = ({ category, isVisible, position, onMouseEnter, onMouseLeave, onItemClick, selectedSubcategories }) => {
  if (!category) return null;

  const isFlowerTypes = category.id === "flower-types";

  return (
    <div
      className={`
        absolute left-1/2 -translate-x-1/2 mt-2
        w-[95vw] max-w-7xl bg-white border border-gray-200 rounded-lg shadow-2xl z-50 p-4 md:p-6
        transition-all duration-300 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex flex-col lg:flex-row justify-center items-start gap-4 lg:gap-6">
        {/* Subcategory lists with better scrolling */}
        <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 flex-1 w-full">
          {category.groups.map((group, i) => (
            <div
              key={i}
              className={`space-y-3 p-3 md:p-4 rounded-lg min-w-0 flex-1 ${
                i === 0 ? "bg-pink-50 border border-pink-200" : "bg-gray-50 border border-gray-200"
              }`}
            >
              <h4 className="text-xs sm:text-sm font-semibold text-gray-800 border-b border-gray-300 pb-2">
                {group.title}
              </h4>
              <div className="relative">
                <ul 
                  className="space-y-1.5 sm:space-y-2 max-h-80 overflow-y-auto pr-3 beautiful-scrollbar"
                >
                  {group.items.map((item, index) => {
                    const isSelected = isFlowerTypes && selectedSubcategories.has(item);
                    return (
                      <li key={index}>
                        <button
                          className="block text-xs sm:text-sm transition-all duration-200 p-2 sm:p-3 rounded w-full text-left leading-tight border text-gray-700 hover:text-pink-600 hover:bg-pink-100 border-transparent hover:border-pink-200"
                          onClick={() => onItemClick(item, category.id)}
                        >
                          {item}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {/* Better scroll indicator */}
                {group.items.length > 10 && (
                  <div className="absolute bottom-0 left-0 right-3 h-6 bg-gradient-to-t from-white via-white to-transparent pointer-events-none rounded-b-lg"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Image on the right */}
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
          <div className="relative rounded-lg overflow-hidden group/image h-48 sm:h-56 lg:h-64 xl:h-80 cursor-pointer border border-gray-200 shadow-md">
            <img
              src={category.image}
              alt={category.imageAlt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center p-3 sm:p-4">
              <span className="text-white text-sm sm:text-lg font-bold text-center">
                {category.imageAlt}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile Category Accordion Component
const MobileCategoryAccordion: React.FC<{
  category: Category;
  isExpanded: boolean;
  onToggle: () => void;
  onItemClick: (item: string, categoryId: string) => void;
  onCategoryClick: (categoryId: string) => void;
}> = ({ category, isExpanded, onToggle, onItemClick, onCategoryClick }) => {
  return (
    <div className="border-b border-gray-200">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onCategoryClick(category.id)}
          className="flex-1 text-left py-3 sm:py-4 px-3 sm:px-4 text-sm font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50 transition-all duration-200"
        >
          {category.name}
        </button>
        <button
          onClick={onToggle}
          className="p-3 sm:p-4 text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition-all duration-200 rounded-md"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>
      
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4 bg-gray-50">
          {/* Category Image */}
          <div className="w-full h-40 sm:h-48 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            <img
              src={category.image}
              alt={category.imageAlt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          
          {/* Subcategory Groups with Scrolling */}
          {category.groups.map((group, i) => (
            <div key={i} className="space-y-2 sm:space-y-3 bg-white p-2 sm:p-3 rounded-lg border border-gray-200">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-800 border-b border-gray-200 pb-1 sm:pb-2">
                {group.title}
              </h4>
              <div className="relative">
                <ul className="space-y-1 sm:space-y-2 max-h-48 overflow-y-auto pr-2 beautiful-scrollbar">
                  {group.items.map((item, index) => (
                    <li key={index}>
                      <button
                        className="block text-xs text-gray-700 hover:text-pink-600 hover:bg-pink-50 transition-all duration-200 text-left w-full py-1.5 sm:py-2 px-1.5 sm:px-2 rounded leading-tight"
                        onClick={() => onItemClick(item, category.id)}
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
                {/* Scroll indicator for mobile */}
                {group.items.length > 6 && (
                  <div className="absolute bottom-0 left-0 right-2 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Mobile Menu Overlay Component
const MobileMenu: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onItemClick: (item: string, categoryId: string) => void;
  onCategoryClick: (categoryId: string) => void;
}> = ({ isOpen, onClose, onItemClick, onCategoryClick }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleToggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleItemClick = (item: string, categoryId: string) => {
    onItemClick(item, categoryId);
    onClose();
  };

  const handleCategoryClick = (categoryId: string) => {
    onCategoryClick(categoryId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Menu Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm bg-white shadow-xl transform transition-transform">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-pink-50">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Categories</h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-white transition-all duration-200 rounded-full"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        
        <div className="h-full overflow-y-auto pb-16 sm:pb-20 beautiful-scrollbar">
          {allCategories.map((category) => (
            <MobileCategoryAccordion
              key={category.id}
              category={category}
              isExpanded={expandedCategory === category.id}
              onToggle={() => handleToggleCategory(category.id)}
              onItemClick={handleItemClick}
              onCategoryClick={handleCategoryClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Simple Tablet View - Just category buttons
const SimpleTabletView: React.FC<{
  onCategoryClick: (categoryId: string) => void;
  showProductsFor: string | null;
}> = ({ onCategoryClick, showProductsFor }) => {
  return (
    <div className="px-4 mx-auto max-w-4xl">
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {allCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryClick(category.id)}
            className={`px-4 md:px-6 py-3 md:py-4 border rounded-lg text-sm md:text-base font-medium transition-all duration-200 shadow-sm whitespace-nowrap ${
              showProductsFor === category.id
                ? 'bg-pink-50 text-pink-600 border-pink-300'
                : 'bg-white text-gray-700 border-gray-200 hover:text-pink-600 hover:bg-pink-50 hover:border-pink-300'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

const FlowerCategory: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [position, setPosition] = useState<{ left: number; width: number } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupSubcategory, setPopupSubcategory] = useState<string>("");
  const [thankYouMessage, setThankYouMessage] = useState<string>("");
  const [selectedSubcategories, setSelectedSubcategories] = useState<Set<string>>(new Set()); // Track multiple selections
  const { showProductsFor, setShowProductsFor } = useCategoryContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [, setLocation] = useLocation();

  // Parse URL on mount to initialize selected subcategories
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const subcategoryParam = params.get('subcategory');
    if (subcategoryParam) {
      const subcategories = subcategoryParam.split(',').map(s => decodeURIComponent(s.trim()));
      setSelectedSubcategories(new Set(subcategories));
    }
  }, []);



  // Find the active category data
  const activeCategoryData = allCategories.find(cat => cat.id === activeCategory) || null;

  // Handle popup form submission
  const handlePopupSubmit = async (data: { fullname: string; emailaddress: string; phoneno: string; question: string; enquiry: string }) => {
    try {
      // Add subcategory to the data sent to backend
      const payload = {
        ...data,
        enquiry: data.enquiry || popupSubcategory
      };
      const res = await apiRequest('/api/categoryuserdata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setPopupOpen(false);
        setThankYouMessage("Thank you! We will call you back soon.");
      } else {
        setPopupOpen(false);
        setThankYouMessage("Failed to submit. Please try again.");
      }
    } catch (err) {
      setPopupOpen(false);
      setThankYouMessage("An error occurred. Please try again.");
    }
  };

  // Screen size detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1280) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show popup for Event/Venue and Corporate subcategories
  const handleItemClick = (item: string, categoryId: string) => {
    if (categoryId === "event-decoration" || categoryId === "corporate") {
      setPopupSubcategory(item);
      setPopupOpen(true);
      return;
    }
    
    if (categoryId === "occasion") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Single selection for flower-types category (replace previous selection)
    if (categoryId === "flower-types") {
      // Clear previous selections and set only the new one
      const newSelected = new Set([item]);
      setSelectedSubcategories(newSelected);
      
      // Navigate to the selected subcategory
      const url = `/products?main_category=${encodeURIComponent(categoryId)}&subcategory=${encodeURIComponent(item)}`;
      window.location.href = url;
      return;
    }
    
    // Single selection for other categories
    window.location.href = `/products?main_category=${encodeURIComponent(categoryId)}&subcategory=${encodeURIComponent(item)}`;
  };

  const handleCategoryClick = (categoryId: string) => {
    // Toggle products display for the clicked category
    if (showProductsFor === categoryId) {
      setShowProductsFor(null); // Hide if already showing
    } else {
      setShowProductsFor(categoryId); // Show products
    }
  };

  const handleMouseEnter = (categoryId: string, event: React.MouseEvent) => {
    if (screenSize !== 'desktop') return;
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveCategory(categoryId);
    setShowCard(true);
    // Calculate position for the card to be centered
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setPosition({
        left: containerRect.left,
        width: containerRect.width
      });
    }
  };

  const handleMouseLeave = () => {
    if (screenSize !== 'desktop') return;
    // Set a timeout to hide the card after a short delay
    timeoutRef.current = setTimeout(() => {
      setShowCard(false);
      setActiveCategory(null);
      setPosition(null);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCardMouseEnter = () => {
    // Clear the timeout when mouse enters the card
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleCardMouseLeave = () => {
    // Set a timeout to hide the card when mouse leaves the card
    timeoutRef.current = setTimeout(() => {
      setShowCard(false);
      setActiveCategory(null);
      setPosition(null);
    }, 300);
  };

  return (
    <>
      {/* Add custom scrollbar styles */}
      <style jsx>{`
        .beautiful-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .beautiful-scrollbar::-webkit-scrollbar-track {
          background: #fdf2f8;
          border-radius: 10px;
        }
        .beautiful-scrollbar::-webkit-scrollbar-thumb {
          background: #fbcfe8;
          border-radius: 10px;
          border: 1px solid #f9a8d4;
        }
        .beautiful-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f472b6;
        }
        .beautiful-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #fbcfe8 #fdf2f8;
        }
      `}</style>

      <div className="bg-white border-b border-gray-200 relative" ref={containerRef}>
        {/* Desktop Navigation - Only visible on xl screens and above */}
        <div className="hidden xl:block py-3 lg:py-4">
          <div className="flex justify-center space-x-4 lg:space-x-6 px-4 mx-auto max-w-7xl relative">
            {allCategories.map((category) => (
              <div
                key={category.id}
                className="relative group"
                onMouseEnter={(e) => handleMouseEnter(category.id, e)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleCategoryClick(category.id)}
              >
                {/* Main tab */}
                <button className={`flex items-center gap-1 px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm font-medium transition-all duration-200 rounded-lg whitespace-nowrap ${
                  showProductsFor === category.id 
                    ? 'text-pink-600 bg-pink-50' 
                    : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
                }`}>
                  {category.name}
                  {showProductsFor === category.id ? (
                    <ChevronUp className="w-3 h-3 lg:w-4 lg:h-4 transition-transform duration-200" />
                  ) : (
                    <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4 transition-transform duration-200" />
                  )}
                </button>
              </div>
            ))}
          </div>
          {/* Desktop Card that appears for all categories */}
          <div className="absolute left-0 w-full" style={{ top: '100%' }}>
            {showCard && activeCategory && (
              <CategoryCard 
                category={activeCategoryData} 
                isVisible={showCard} 
                position={position} 
                onMouseEnter={handleCardMouseEnter}
                onMouseLeave={handleCardMouseLeave}
                onItemClick={handleItemClick}
                selectedSubcategories={selectedSubcategories}
              />
            )}
          </div>
        </div>

        {/* Mobile Navigation - Visible on small screens */}
        <div className="block md:hidden px-3 py-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-2 sm:gap-3 w-full p-3 sm:p-4 bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:text-pink-600 hover:from-pink-100 hover:to-pink-200 transition-all duration-200 shadow-sm"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            Browse Categories
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-auto" />
          </button>
        </div>

        {/* Simple Tablet View - Just category buttons */}
        <div className="hidden md:block xl:hidden py-4">
          <SimpleTabletView onCategoryClick={handleCategoryClick} showProductsFor={showProductsFor} />
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onItemClick={handleItemClick}
        onCategoryClick={handleCategoryClick}
      />

      {/* Popup Form for Event/Venue and Corporate subcategories */}
      <PopupForm
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        subcategory={popupSubcategory}
        onSubmit={handlePopupSubmit}
      />
      {/* Thank you message after submission */}
      {thankYouMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-sm mx-auto">
            <h2 className="text-xl font-bold mb-4 text-pink-600">{thankYouMessage}</h2>
            <button
              className="mt-4 px-6 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition"
              onClick={() => setThankYouMessage("")}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FlowerCategory;
