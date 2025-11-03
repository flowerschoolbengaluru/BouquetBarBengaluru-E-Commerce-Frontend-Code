import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  MapPin,
  ShoppingCart,
  UserIcon,
  Heart,
  Gift,
  Calendar,
  Star,
  Filter,
  ChevronDown,
  Phone,
  LogOut,
  X,
  Plus,
  Minus,
  Trash2
} from "lucide-react";
import { Link, useLocation } from "wouter";
import Footer from "@/components/footer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import bouquetBarLogo from "@assets/E_Commerce_Bouquet_Bar_Logo_1757433847861.png";
import { type Product, type User } from "@shared/schema";
import { useCart } from "@/hooks/cart-context";
import FlowerCategory from "./FlowerCategory";
import PostFile from "./PostFileProps";

import PostThree from "./PostThree";
// import PostFileFour from "./PostFileFour";
import VideoFile from "./VideoFile";
import PostFileFive from "./PostFileFive";
import PostFileSix from "./PostFileSix";

export default function Shop() {
  const [animatedText, setAnimatedText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  // Add search suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<Array<{ item: string, category: string, categoryId: string }>>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(true);
  const [showCartModal, setShowCartModal] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);
  const animationRef = useRef<NodeJS.Timeout | null>(null);


  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle URL parameters for category and search
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const subcategoryParam = urlParams.get('subcategory');
    const searchParam = urlParams.get('search');

    // Set category from URL (URL decode the parameters)
    if (categoryParam) {
      setSelectedCategory(decodeURIComponent(categoryParam));
    }
    
    // Set subcategory as category if it exists (from FlowerCategory navigation)
    if (subcategoryParam) {
      setSelectedCategory(decodeURIComponent(subcategoryParam));
    }

    // Set search query from URL
    if (searchParam) {
      setSearchQuery(decodeURIComponent(searchParam));
    }
  }, [location]); // Re-run when location changes


  // Handle hash navigation when component loads
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 500);
    }
  }, []);

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // Get all items for search suggestions
  const getAllItems = () => {
    const allItems: Array<{ item: string, category: string, categoryId: string }> = [];

    // Define category mappings
    const occasionCategories = [
      "Birthday Flowers", "Anniversary Flowers", "Wedding Flowers", "Valentine's Day Flowers", 
      "Mother's Day Flowers", "Get Well Soon Flowers", "Congratulations Flowers", 
      "Sympathy & Funeral Flowers", "New Baby Flowers", "Graduation Flowers", 
      "Housewarming Flowers", "Retirement Flowers", "Christmas Flowers", "New Year Flowers"
    ];

    const arrangementTypes = [
      "Bouquets (hand-tied, wrapped)", "Flower Baskets", "Flower Boxes", "Vase Arrangements", 
      "Floral Centerpieces", "Flower Garlands", "Lobby Arrangements", "Exotic Arrangements",
      "Floral Cross Arrangement", "Baby's Breath Arrangement", "Gladiolus Arrangement", 
      "Wine Bottle Arrangements", "Floral Wreaths", "Custom Arrangements"
    ];

    const flowerTypes = [
      "Tulips", "Lilies", "Carnations", "Orchids", "Sunflowers", "Mixed Flowers", "Roses", 
      "Baby's Breath", "Chrysanthemum", "Hydrangea", "Anthurium", "Calla Lilies", 
      "Gerberas", "Peonies"
    ];

    const giftCombos = [
      "Flowers with Greeting Cards", "Flower with Fruits", "Floral Gift Hampers", 
      "Flower with Chocolates", "Flower with Cakes", "Flowers with Cheese", 
      "Flowers with Nuts", "Flowers with Customized Gifts", "Flowers with Wine", 
      "Flowers with Perfume", "Flowers with Jewelry", "Flowers with Teddy Bears", 
      "Flowers with Scented Candles", "Flowers with Personalized Items"
    ];

    const eventServices = [
      "Wedding Floral Decor", "Corporate Event Flowers", "Party Flower Decorations", 
      "Stage & Backdrop Flowers", "Car Decoration Flowers", "Temple / Pooja Flowers", 
      "Birthday Decorations", "Entrance Arrangements", "Table Centerpieces", 
      "Aisle Decorations", "Archway Flowers", "Ceiling Installations", 
      "Wall Decorations", "Outdoor Event Flowers"
    ];

    const deliveryServices = [
      "Same-Day Flower Delivery", "Next Day Delivery", "Customized Message Cards", 
      "Floral Subscriptions Weekly/monthly", "International Delivery", 
      "Express Delivery", "Scheduled Delivery"
    ];

    categories.forEach((category, index) => {
      let categoryType = "Other Services";
      
      if (occasionCategories.includes(category)) {
        categoryType = "Occasions";
      } else if (arrangementTypes.includes(category)) {
        categoryType = "Arrangement Types";
      } else if (flowerTypes.includes(category)) {
        categoryType = "Flower Types";
      } else if (giftCombos.includes(category)) {
        categoryType = "Gift Combinations";
      } else if (eventServices.includes(category)) {
        categoryType = "Event Services";
      } else if (deliveryServices.includes(category)) {
        categoryType = "Delivery Services";
      }

      allItems.push({
        item: category,
        category: categoryType,
        categoryId: category.toLowerCase().replace(/\s+/g, '-')
      });
    });

    return allItems;
  };

  // Filter suggestions based on search query
  const filterSuggestions = (query: string) => {
    if (!query.trim()) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const allItems = getAllItems();
    const filtered = allItems
      .filter(({ item }) =>
        item.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 8);

    setSearchSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterSuggestions(query);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: { item: string, category: string, categoryId: string }) => {
    setShowSuggestions(false);
    
    // Navigate to products page with search
    const searchParams = new URLSearchParams();
    searchParams.set('search', suggestion.item);
    setLocation(`/products?${searchParams.toString()}`);
  };

  // Handle search key down
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setShowSuggestions(false);
      
      // Navigate to products page with search
      const searchParams = new URLSearchParams();
      searchParams.set('search', searchQuery.trim());
      setLocation(`/products?${searchParams.toString()}`);
    }
  };

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get current user data first
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });
  const {
    addToCart,
    totalItems,
    totalPrice,
    items,
    isLoading,
    isInCart,
    getItemQuantity,
    updateQuantity,
    removeFromCart
  } = useCart();

  // Get products data
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Debug: Log product data to verify stock properties
  useEffect(() => {
    if (products && products.length > 0) {
      console.log('Product data sample:', products[0]);
      console.log('Stock properties check:', {
        stockquantity: (products[0] as any).stockquantity,
        stockQuantity: (products[0] as any).stockQuantity,
        quantity: products[0].quantity,
        inStock: products[0].inStock
      });
    }
  }, [products]);

  // Helper to normalize category field from API (array, JSON string, or comma string)
  const getCategoryString = (categoryField: any): string => {
    if (!categoryField) return 'Uncategorized';
    if (Array.isArray(categoryField)) return categoryField.join(', ');
    if (typeof categoryField === 'string') {
      const str = categoryField.trim();
      if (!str) return 'Uncategorized';
      // Try JSON parse
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) return parsed.join(', ');
        if (typeof parsed === 'string') return parsed;
      } catch {}
      // If it looks like an array string with brackets, strip them
      if (str.startsWith('[') && str.endsWith(']')) {
        try {
          const inner = str.slice(1, -1).split(',').map(s => s.replace(/['"\[\]]/g, '').trim()).filter(Boolean);
          if (inner.length) return inner.join(', ');
        } catch {}
      }
      // Comma separated
      if (str.includes(',')) return str.split(',').map(s => s.trim()).filter(Boolean).join(', ');
      return str;
    }
    return String(categoryField);
  };

  // Helper function to check if product is actually in stock
  const isProductInStock = (product: Product): boolean => {
    // Check for stock quantity in all possible property names
    const stockQty = product.stockquantity ?? product.stockQuantity ?? product.quantity;
    
    // If any stock quantity is explicitly set and is 0 or less, product is out of stock
    if (typeof stockQty === 'number' && stockQty <= 0) {
      return false;
    }
    
    // If inStock is explicitly set to false, product is out of stock
    if (typeof product.inStock === 'boolean' && product.inStock === false) {
      return false;
    }
    
    // If we have a stock quantity > 0, product is in stock
    if (typeof stockQty === 'number' && stockQty > 0) {
      return true;
    }
    
    // Default to checking inStock boolean, defaulting to true if not specified
    return product.inStock ?? true;
  };

  // Filter and sort products based on search, category, price, and stock
  const filteredProducts = (products as Product[])
    .filter((product: Product) => {
      // For "Best Seller" section (selectedCategory === "all"), only show products marked as best sellers
      // and show all such products regardless of search query
      if (selectedCategory === "all") {
        const rawBestSeller = (product as any).isBestSeller ?? (product as any).isbestseller;
        const isBestSeller = typeof rawBestSeller === 'string'
          ? ['true', '1', 'yes', 'enable'].includes(rawBestSeller.toLowerCase())
          : !!rawBestSeller;
        if (!isBestSeller) return false;
        // In Best Seller section, ignore search query completely so best sellers stay visible while typing
        const matchesSearch = true;
        
        const productPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
        const matchesPrice = !isNaN(productPrice) &&
          productPrice >= priceRange[0] &&
          productPrice <= priceRange[1];
        const matchesStock = !showInStockOnly || isProductInStock(product);
        
        return matchesSearch && matchesPrice && matchesStock;
      }
      
      // For other categories, apply normal filtering
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        getCategoryString(product.category).toLowerCase().includes(searchQuery.toLowerCase());
      
      // Enhanced category matching to handle comma-separated categories
      const matchesCategory = (() => {
        if (!product.category) return false;
        
        // Get the category string and normalize it
        const categoryString = getCategoryString(product.category).toLowerCase();
        const selectedCategoryLower = selectedCategory.toLowerCase();
        
        // Check if the selected category matches any of the product's categories
        // Handle both exact matches and partial matches for comma-separated values
        return categoryString === selectedCategoryLower || 
               categoryString.includes(selectedCategoryLower) ||
               categoryString.split(',').some(cat => cat.trim() === selectedCategoryLower);
      })();
      
      const productPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
      const matchesPrice = !isNaN(productPrice) &&
        productPrice >= priceRange[0] &&
        productPrice <= priceRange[1];
      const matchesStock = !showInStockOnly || isProductInStock(product);
      
      return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    })
    .sort((a, b) => {
      const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
      const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;

      switch (sortBy) {
        case "price-low":
          return priceA - priceB;
        case "price-high":
          return priceB - priceA;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Handle add to cart with toast notification
  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    toast({
      title: "Added to Cart! 🛒",
      description: `${product.name} has been added to your cart.`,
      duration: 2000,
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("name");
    setPriceRange([0, 10000]);
    setShowInStockOnly(false);
  };

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/auth/signout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      toast({
        title: "Logged out successfully",
        description: "You have been signed out.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log out",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Favorites mutations
  const addToFavoritesMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest("/api/favorites", {
        method: "POST",
        body: JSON.stringify({ productId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Added to Favorites",
        description: "Product saved to your favorites list.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add to favorites",
        variant: "destructive",
      });
    },
  });

  // Typing animation effect
  useEffect(() => {
    if (searchQuery) return;

    const currentCategory = categories[categoryIndex];

    const handleTyping = () => {
      if (isDeleting) {
        setAnimatedText(currentCategory.substring(0, animatedText.length - 1));
        setTypingSpeed(50);
      } else {
        setAnimatedText(currentCategory.substring(0, animatedText.length + 1));
        setTypingSpeed(100);
      }

      if (!isDeleting && animatedText === currentCategory) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && animatedText === "") {
        setIsDeleting(false);
        setCategoryIndex((prev) => (prev + 1) % categories.length);
      }
    };

    animationRef.current = setTimeout(handleTyping, typingSpeed);

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [animatedText, isDeleting, categoryIndex, searchQuery]);

  const handleInputFocus = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  };

  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest(`/api/favorites/${productId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Removed from Favorites",
        description: "Product removed from your favorites list.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove from favorites",
        variant: "destructive",
      });
    },
  });

  // Get user favorites to check status
  const { data: userFavorites = [] } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: !!user,
  });

  // Check if product is favorited
  const isProductFavorited = (productId: string) => {
    return Array.isArray(userFavorites) && userFavorites.some((fav: any) => fav.productId === productId);
  };

  // Handle toggle favorites
  const handleToggleFavorite = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save favorites.",
        variant: "destructive",
      });
      return;
    }

    if (isProductFavorited(productId)) {
      removeFromFavoritesMutation.mutate(productId);
    } else {
      addToFavoritesMutation.mutate(productId);
    }
  };

  const categories = [
    "Birthday Flowers",
    "Anniversary Flowers",
    "Wedding Flowers",
    "Valentine's Day Flowers",
    "Mother's Day Flowers",
    "Get Well Soon Flowers",
    "Congratulations Flowers",
    "Sympathy & Funeral Flowers",
    "New Baby Flowers",
    "Graduation Flowers",
    "Housewarming Flowers",
    "Retirement Flowers",
    "Christmas Flowers",
    "New Year Flowers",
    "Bouquets (hand-tied, wrapped)",
    "Flower Baskets",
    "Flower Boxes",
    "Vase Arrangements",
    "Floral Centerpieces",
    "Flower Garlands",
    "Lobby Arrangements", "Exotic Arrangements",
    "Floral Cross Arrangement",
    "Baby's Breath Arrangement",
    "Gladiolus Arrangement",
    "Wine Bottle Arrangements",
    "Floral Wreaths",
    "Custom Arrangements",
    "Tulips",
    "Lilies",
    "Carnations",
    "Orchids",
    "Sunflowers",
    "Mixed Flowers",
    "Roses",
    "Baby's Breath",
    "Chrysanthemum",
    "Hydrangea",
    "Anthurium",
    "Calla Lilies",
    "Gerberas",
    "Peonies",
    "Flowers with Greeting Cards",
    "Flower with Fruits",
    "Floral Gift Hampers",
    "Flower with Chocolates",
    "Flower with Cakes",
    "Flowers with Cheese",
    "Flowers with Nuts",
    "Flowers with Customized Gifts",
    "Flowers with Wine",
    "Flowers with Perfume",
    "Flowers with Jewelry",
    "Flowers with Teddy Bears",
    "Flowers with Scented Candles",
    "Flowers with Personalized Items",
    "Wedding Floral Decor",
    "Corporate Event Flowers",
    "Party Flower Decorations",
    "Stage & Backdrop Flowers",
    "Car Decoration Flowers",
    "Temple / Pooja Flowers",
    "Birthday Decorations",
    "Entrance Arrangements",
    "Table Centerpieces",
    "Aisle Decorations",
    "Archway Flowers",
    "Ceiling Installations",
    "Wall Decorations",
    "Outdoor Event Flowers",
    "Same-Day Flower Delivery",
    "Next Day Delivery",
    "Customized Message Cards",
    "Floral Subscriptions Weekly/monthly",
    "International Delivery",
    "Express Delivery",
    "Scheduled Delivery",
    "Flower Arrangement Workshops",
    "Custom Bouquet Design",
    "Event Florist Services",
    "Floral Consultation",
    "Wedding Florist Services",
    "Corporate Account Services",
    "Subscription Services",
    "Pet Memorial Flowers",
    "Funeral Wreaths",
    "Condolence Bouquets",
    "Remembrance Flowers",
    "Memorial Sprays",
    "Casket Arrangements",
    "Sympathy Hearts",
    "Funeral Home Delivery",
    "Church Arrangements",
    "Graveside Flowers",
    "Memorial Service Flowers",
    "Sympathy Gift Baskets",
    "Living Tributes",
    "Memorial Donations",
    "Office Desk Flowers",
    "Reception Area Flowers",
    "Corporate Gifting Flowers",
    "Brand-Themed Floral Arrangements",
    "Conference Room Flowers",
    "Executive Office Arrangements",
    "Lobby Displays",
    "Corporate Accounts",
    "Volume Discounts",
    "Regular Maintenance",
    "Custom Corporate Designs",
    "Event Floristry Services",
    "Branded Arrangements",
    "Long-term Contracts",
    "Birthday Flowers",
    "Anniversary Flowers",
    "Wedding Flowers",
    "Valentine's Day Flowers",
    "Roses",
    "Tulips",
    "Lilies",
    "Orchids",
    "Sympathy Flowers",
    "Get Well Soon Flowers",
    "Congratulations Flowers",
    "Flower Bouquets",
    "Flower Baskets",
    "Vase Arrangements",
    "Floral Centerpieces",
    "Dried Flower Arrangements",
    "Floral Gift Hampers",
    "Flower with Chocolates",
    "Wedding Floral Decor",
    "Corporate Event Flowers",
    "Garlands",
    "Luxury Rose Boxes",
    "Same-Day Flower Delivery",
    "Customized Message Cards"
  ];

  // Helper to safely get description
  const getDescription = (desc: any): string => {
    if (!desc && desc !== 0) return 'No description available';
    return String(desc);
  };

  // Deterministic pseudo-random rating based on product id (stable per product)
  const getRatingForProduct = (id: string): number => {
    // Simple hash to number
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash |= 0; // Convert to 32bit int
    }
    const normalized = Math.abs(hash) % 50; // 0..49
    // Map to 3.5..5.0 range roughly
    return +(3.5 + (normalized / 100) * 1.5).toFixed(1);
  };

return (
  <div className="min-h-screen">
    {/* Top Bar */}
    <div className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* Main Navigation */}
        <div className="flex items-center justify-between py-3 md:py-4">
          <img
            src={bouquetBarLogo}
            alt="Bouquet Bar Logo"
            className="w-16 md:w-20 h-auto"
          />
          <div className="text-lg md:text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Bouquet Bar
          </div>

          {/* Search Bar with Suggestions - Responsive */}
          <div className="flex-1 max-w-md md:max-w-xl mx-2 md:mx-4 lg:mx-6" ref={searchRef}>
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => {
                  if (animationRef.current) {
                    clearTimeout(animationRef.current);
                  }
                  if (searchQuery && searchSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                className="pl-3 md:pl-4 pr-8 md:pr-10 py-2 md:py-2.5 w-full rounded-lg md:rounded-xl border border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-200 shadow-sm transition-all duration-200 font-sans text-xs md:text-sm lg:text-base h-9 md:h-10 lg:h-11"
              />
              <div className="absolute inset-y-0 left-3 md:left-4 flex items-center pointer-events-none w-2/3 md:w-3/4">
                <span className="text-gray-500 font-medium text-xs md:text-sm truncate">
                  {!searchQuery ? `Searching for ${animatedText}` : ""}
                  {!searchQuery && <span className="animate-pulse font-bold">|</span>}
                </span>
              </div>

              <Search className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-gray-500" />

              {/* Mobile-Optimized Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 
                  max-h-[50vh] sm:max-h-80 overflow-y-auto 
                  min-w-[280px] sm:min-w-0
                  -mx-2 sm:mx-0">
                  <div className="p-2">
                    {/* Header */}
                    <div className="text-xs text-gray-500 ">
                   
                      <button
                        onClick={() => setShowSuggestions(false)}
                        className="sm:hidden p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Suggestions List */}
                    <div className="space-y-1">
                      {searchSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between px-3 py-3 hover:bg-pink-50 cursor-pointer rounded-md transition-colors border-b border-gray-50 last:border-b-0"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <div className="flex flex-col flex-1 min-w-0 space-y-1">
                            <span className="text-sm font-medium text-gray-900 leading-tight">
                              {suggestion.item}
                            </span>
                            <span className="text-xs text-gray-500 leading-tight">
                              in {suggestion.category}
                            </span>
                          </div>
                          <div className="flex-shrink-0 ml-3">
                            <Search className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer for mobile */}
                    <div className="sm:hidden border-t border-gray-100 pt-2 mt-2 text-center">
                      <button
                        onClick={() => setShowSuggestions(false)}
                        className="text-xs text-gray-500 px-4 py-2 hover:bg-gray-50 rounded-md"
                      >
                        Close suggestions
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-3 relative">
            {/* Cart Button with Hover Text */}
            <div className="relative group">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 md:h-12 md:w-12 rounded-full"
                onClick={() => setShowCartModal(true)}
                data-testid="button-cart"
              >
                <ShoppingCart className="w-5 h-5 md:w-7 md:h-7" />
                {totalItems > 0 && (
                  <span className="absolute -right-1 flex items-center justify-center h-4 min-w-[1rem] px-1 text-[10px] font-semibold rounded-full bg-pink-600 text-white">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>

            {/* Contact Button with Hover Text */}
            <div className="relative group">
              <a href="tel:9972803847">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 md:h-12 md:w-12 rounded-full"
                  data-testid="button-contact"
                >
                  <Phone className="w-4 h-4 md:w-6 md:h-6" />
                </Button>
              </a>
            </div>

            {user ? (
              <>
                {/* Account Button */}
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 md:h-12 md:w-12 rounded-full"
                    onClick={() => setLocation("/my-account")}
                    data-testid="button-account"
                  >
                    <UserIcon className="w-4 h-4 md:w-6 md:h-6" />
                  </Button>
                </div>

                {/* User greeting and Logout Button */}
                <div className="flex items-center gap-2 md:gap-4">
                  <span className="text-xs md:text-sm text-gray-700 font-medium hidden lg:block">
                    Hello, {user.firstname || 'User'}!
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    data-testid="button-logout"
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-pink-700 text-white border-0 transition-all duration-300 text-xs md:text-sm px-2 md:px-4 py-1 md:py-2"
                  >
                    {logoutMutation.isPending ? 'Logging out...' : 'Log Out'}
                  </Button>
                </div>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => setLocation("/signin")}
                data-testid="button-login"
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all duration-300 text-xs md:text-sm px-2 md:px-4 py-1 md:py-2"
              >
                <UserIcon className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
      <FlowerCategory />
    </div>

    <div>
      <PostFile />
    </div>

    {/* Products Section */}
    <section id="products-section" className="py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-0">
        <div className="flex items-center justify-between mb-6 md:mb-8 px-0">
          {/* <h2 className="text-xl md:text-3xl font-bold">
            {selectedCategory === "all"
              // ? (searchQuery ? `Search Results for "${searchQuery}"` : "Best Seller")
              : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products`}
          </h2> */}
          <h2 className="text-xl md:text-3xl font-bold">{selectedCategory === "all" ? "Best Seller" : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products`}</h2>
        </div>        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 px-0">
            {/* Show 8 loading cards */}
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="w-full h-48 md:h-64 bg-gray-200 animate-pulse"></div>
                <CardContent className="p-3 md:p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-6 sm:py-8 px-4 sm:px-6">
            <Gift className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || selectedCategory !== "all" ? "No products match your search" : "No products available"}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              {searchQuery || selectedCategory !== "all" ? "Try adjusting your search or filters" : "Check back later for new products"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 px-0">
            {/* Show filtered products */}
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover-elevate" data-testid={`card-product-${product.id}`}>
                <div className="relative">
                  <img
                    src={`data:image/jpeg;base64,${product.image}`}
                    alt={product.name}
                    className="w-full h-[30vh] md:h-[35vh] lg:h-[40vh] object-cover cursor-pointer" 
                    onClick={() => setLocation(`/product/${product.id}`)}
                  />
                  <button
                    className="absolute top-3 md:top-4 right-3 md:right-4 w-7 h-7 md:w-8 md:h-8 bg-white/90 rounded-full flex items-center justify-center hover-elevate"
                    onClick={(e) => handleToggleFavorite(product.id, e)}
                    disabled={addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
                    data-testid={`button-favorite-${product.id}`}
                  >
                    <Heart
                      className={`w-3 h-3 md:w-4 md:h-4 ${isProductFavorited(product.id)
                        ? 'fill-pink-500 text-pink-500'
                        : 'text-gray-600'
                        }`}
                    />
                  </button>
                  {!isProductInStock(product) && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="secondary" className="bg-white text-black text-xs">
                        {(() => {
                          const stockQty = product.stockquantity ?? product.stockQuantity ?? product.quantity;
                          return (typeof stockQty === 'number' && stockQty <= 0) 
                            ? 'Out of Stock' 
                            : 'Currently Unavailable';
                        })()}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-3 md:p-4">
                  <h3
                    className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-pink-600 transition-colors text-sm md:text-base"
                    onClick={() => setLocation(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>
                  {/* Description intentionally hidden in featured section */}
                  {/* Rating row (categories hidden in featured section) */}
                  <div className="flex items-center mb-3 md:mb-4">
                    {(() => {
                      const rating = getRatingForProduct(product.id);
                      const fullStars = Math.floor(rating);
                      const stars = [] as JSX.Element[];
                      for (let i = 0; i < 5; i++) {
                        stars.push(
                          <Star key={i} className={`w-3 h-3 ${i < fullStars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        );
                      }
                      return (
                        <div className="flex items-center gap-1">
                          <div className="flex">{stars}</div>
                          <span className="text-xs text-gray-600 ml-1">{rating}/5</span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <span className="text-lg md:text-xl font-bold text-primary">₹{product.price}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs md:text-sm"
                        onClick={() => setLocation(`/product/${product.id}`)}
                        data-testid={`button-view-details-${product.id}`}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
                        disabled={!isProductInStock(product)}
                        className="flex-1 text-xs md:text-sm"
                        data-testid={`button-add-cart-${product.id}`}
                      >
                        {isInCart(product.id) ?
                          `+${getItemQuantity(product.id)}` :
                          (isProductInStock(product) ? 'Add to Cart' : 
                            (() => {
                              const stockQty = product.stockquantity ?? product.stockQuantity ?? product.quantity;
                              return (typeof stockQty === 'number' && stockQty <= 0) 
                                ? 'Out of Stock' 
                                : 'Unavailable';
                            })())
                        }
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>

    {/* Cart Modal - Mobile Optimized */}
    <Dialog open={showCartModal} onOpenChange={setShowCartModal}>
      <DialogContent className="max-w-sm sm:max-w-2xl max-h-[80vh] overflow-y-auto bg-white border border-pink-100 mx-4">
        <DialogHeader className="bg-pink-25 -m-4 sm:-m-6 mb-4 p-4 sm:p-6 border-b border-pink-100">
          <DialogTitle className="flex items-center gap-2 text-gray-900 text-base sm:text-lg">
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
            Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm">
            Review your items and proceed to checkout
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-pink-300 mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4">Start shopping to add items to your cart</p>
              <Button
                onClick={() => setShowCartModal(false)}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-2 sm:space-y-3">
                {items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-pink-100 rounded-lg bg-white hover:bg-pink-25 transition-colors">
                    <img
                      src={item.image ? `data:image/jpeg;base64,${item.image}` : "/placeholder-image.jpg"}
                      alt={item.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded border border-pink-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">{item.description}</p>
                      <p className="text-base sm:text-lg font-bold text-pink-600">₹{parseFloat(item.price).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={isLoading}
                        className="border-pink-200 hover:bg-pink-50 h-7 w-7 sm:h-8 sm:w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 sm:w-8 text-center font-medium bg-pink-50 py-1 rounded text-xs sm:text-sm">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={isLoading}
                        className="border-pink-200 hover:bg-pink-50 h-7 w-7 sm:h-8 sm:w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFromCart(item.id)}
                        disabled={isLoading}
                        className="ml-1 sm:ml-2 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 h-7 w-7 sm:h-8 sm:w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="border-pink-100" />

              {/* Cart Summary */}
              <div className="space-y-2 bg-pink-25 p-3 sm:p-4 rounded-lg border border-pink-100">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
                <Separator className="border-pink-100" />
                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span>Total</span>
                  <span className="text-pink-600">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <DialogFooter className="flex-col gap-2">
                <Button
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  onClick={() => {
                    setShowCartModal(false);
                    if (user) {
                      setLocation('/checkout');
                    } else {
                      setLocation('/signin');
                    }
                  }}
                  data-testid="button-checkout"
                >
                  Checkout
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCartModal(false)}
                  className="w-full border-pink-200 text-pink-700 hover:bg-pink-50"
                >
                  Continue Shopping
                </Button>
              </DialogFooter>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {/* Footer */}
    <Footer />
  </div>
);
}
