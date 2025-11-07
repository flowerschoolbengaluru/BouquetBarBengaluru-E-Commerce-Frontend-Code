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
  Trash2,
  Menu
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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

    if (categoryParam) {
      setSelectedCategory(decodeURIComponent(categoryParam));
    }
    
    if (subcategoryParam) {
      setSelectedCategory(decodeURIComponent(subcategoryParam));
    }

    if (searchParam) {
      setSearchQuery(decodeURIComponent(searchParam));
    }
  }, [location]);

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

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Mobile filters toggle
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Get all items for search suggestions
  const getAllItems = () => {
    const allItems: Array<{ item: string, category: string, categoryId: string }> = [];

    // Define category mappings (your existing categories)
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
    setShowMobileMenu(false);
    
    // Navigate to products page with search
    const searchParams = new URLSearchParams();
    searchParams.set('search', suggestion.item);
    setLocation(`/products?${searchParams.toString()}`);
  };

  // Handle search key down
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setShowSuggestions(false);
      setShowMobileMenu(false);
      
      // Navigate to products page with search
      const searchParams = new URLSearchParams();
      searchParams.set('search', searchQuery.trim());
      setLocation(`/products?${searchParams.toString()}`);
    }
  };

  // Handle clicking outside to close suggestions
  useEffect(() => {
    // Use 'click' instead of 'mousedown' so clicks on suggestion items
    // register before the outside-close handler hides the list. If we
    // close on mousedown the element may be removed before its onClick
    // fires, preventing navigation.
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
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
      if (selectedCategory === "all") {
        const rawBestSeller = (product as any).isBestSeller ?? (product as any).isbestseller;
        const isBestSeller = typeof rawBestSeller === 'string'
          ? ['true', '1', 'yes', 'enable'].includes(rawBestSeller.toLowerCase())
          : !!rawBestSeller;
        if (!isBestSeller) return false;
        
        const productPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
        const matchesPrice = !isNaN(productPrice) &&
          productPrice >= priceRange[0] &&
          productPrice <= priceRange[1];
        const matchesStock = !showInStockOnly || isProductInStock(product);
        
        return matchesPrice && matchesStock;
      }
      
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        getCategoryString(product.category).toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = (() => {
        if (!product.category) return false;
        
        const categoryString = getCategoryString(product.category).toLowerCase();
        const selectedCategoryLower = selectedCategory.toLowerCase();
        
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
    setShowFilters(false);
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
      setShowMobileMenu(false);
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
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash |= 0;
    }
    const normalized = Math.abs(hash) % 50;
    return +(3.5 + (normalized / 100) * 1.5).toFixed(1);
  };

  return (
    <div className="min-h-screen">
      {/* Top Bar - Mobile Optimized */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Main Navigation */}
          <div className="flex items-center justify-between py-3 md:py-4">
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="h-10 w-10"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>

            {/* Logo */}
            <div className="flex items-center gap-2 lg:gap-3">
              <img
                src={bouquetBarLogo}
                alt="Bouquet Bar Logo"
                className="w-12 md:w-16 lg:w-20 h-auto"
              />
              <div className="text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Bouquet Bar
              </div>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden lg:block flex-1 max-w-xl mx-4" ref={searchRef}>
              <div className="relative">
                <Input
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-4 pr-10 py-2.5 w-full rounded-xl border border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-200 shadow-sm transition-all duration-200 text-base h-11"
                />
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none w-3/4">
                  <span className="text-gray-500 font-medium text-sm truncate">
                    {!searchQuery ? `Searching for ${animatedText}` : ""}
                    {!searchQuery && <span className="animate-pulse font-bold">|</span>}
                  </span>
                </div>
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />

                {/* Search Suggestions */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                    <div className="p-2">
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
                            <Search className="w-4 h-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Cart Button */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 md:h-12 md:w-12 rounded-full"
                  onClick={() => setShowCartModal(true)}
                >
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 text-xs font-semibold rounded-full bg-pink-600 text-white">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </div>

              {/* Contact Button */}
              <div className="hidden sm:block">
                <a href="tel:9972803847">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 md:h-12 md:w-12 rounded-full"
                  >
                    <Phone className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </a>
              </div>

              {user ? (
                <>
                  {/* Account Button */}
                  <div className="hidden sm:block">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 md:h-12 md:w-12 rounded-full"
                      onClick={() => setLocation("/my-account")}
                    >
                      <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                  </div>

                  {/* User greeting and Logout Button */}
                  <div className="hidden lg:flex items-center gap-4">
                    <span className="text-sm text-gray-700 font-medium">
                      Hello, {user.firstname || 'User'}!
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-pink-700 text-white border-0 transition-all duration-300 text-sm px-4 py-2"
                    >
                      {logoutMutation.isPending ? 'Logging out...' : 'Log Out'}
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setLocation("/signin")}
                  className="hidden sm:flex bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all duration-300 text-sm px-3 md:px-4 py-2"
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="lg:hidden pb-3" ref={searchRef}>
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                className="pl-4 pr-10 py-3 w-full rounded-lg border border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-200 shadow-sm transition-all duration-200 text-sm h-12"
                placeholder="Search for flowers, occasions..."
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />

              {/* Mobile Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <div className="space-y-1">
                      {searchSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between px-3 py-3 hover:bg-pink-50 cursor-pointer rounded-md transition-colors border-b border-gray-50 last:border-b-0"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {suggestion.item}
                            </span>
                            <span className="text-xs text-gray-500 truncate">
                              in {suggestion.category}
                            </span>
                          </div>
                          <Search className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={bouquetBarLogo}
                      alt="Bouquet Bar Logo"
                      className="w-12 h-12"
                    />
                    <div className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                      Bouquet Bar
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMobileMenu}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {user ? (
                  <>
                    <div className="text-sm text-gray-600">
                      Welcome, {user.firstname || 'User'}!
                    </div>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setLocation("/my-account");
                        setShowMobileMenu(false);
                      }}
                    >
                      <UserIcon className="w-4 h-4 mr-2" />
                      My Account
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {logoutMutation.isPending ? 'Logging out...' : 'Log Out'}
                    </Button>
                  </>
                ) : (
                  <Button
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
                    onClick={() => {
                      setLocation("/signin");
                      setShowMobileMenu(false);
                    }}
                  >
                    <UserIcon className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <a href="tel:9972803847">
                    <Button variant="ghost" className="w-full justify-start">
                      <Phone className="w-4 h-4 mr-2" />
                      Contact: 9972803847
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <FlowerCategory />
      </div>

     
      <div>
        <PostFile />
      </div>

      {/* Products Section - Mobile Optimized */}
      <section id="products-section" className="py-6 md:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-xl md:text-3xl font-bold">
              {selectedCategory === "all" ? "Best Seller" : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products`}
            </h2>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {[...Array(8)].map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="w-full h-40 md:h-64 bg-gray-200 animate-pulse"></div>
                  <CardContent className="p-3 md:p-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 md:py-12 px-4">
              <Gift className="w-16 h-16 md:w-20 md:h-20 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                {searchQuery || selectedCategory !== "all" ? "No products found" : "No products available"}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery || selectedCategory !== "all" 
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Check back later for new arrivals."
                }
              </p>
              {(searchQuery || selectedCategory !== "all") && (
                <Button onClick={clearFilters} className="bg-gradient-to-r from-pink-500 to-purple-500">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative">
                    <img
                      src={`data:image/jpeg;base64,${product.image}`}
                      alt={product.name}
                      className="w-full h-40 md:h-48 lg:h-56 object-cover cursor-pointer"
                      onClick={() => setLocation(`/product/${product.id}`)}
                    />
                   
                    {!isProductInStock(product) && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="secondary" className="bg-white text-black text-xs">
                          Out of Stock
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3 md:p-4">
                    
                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      {product.originalprice && (
                        <span className="text-gray-500 line-through text-sm">₹{product.originalprice}</span>
                      )}
                      <span className="font-semibold text-gray-900 text-lg">₹{product.price || 0}</span>
                      {product.discount_percentage && (
                        <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs font-semibold">
                          {product.discount_percentage}% OFF
                        </span>
                      )}
                    </div>
                    <h3
                      className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-pink-600 transition-colors text-sm md:text-base line-clamp-2"
                      onClick={() => setLocation(`/product/${product.id}`)}
                    >
                      {product.name}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center mb-2">
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
                            <span className="text-xs text-gray-600 ml-1">{rating}</span>
                          </div>
                        );
                      })()}
                    </div>


                    {/* Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => setLocation(`/product/${product.id}`)}
                      >
                        Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
                        disabled={!isProductInStock(product)}
                        className="flex-1 text-xs bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                      >
                        {isInCart(product.id) ?
                          `+${getItemQuantity(product.id)}` :
                          (isProductInStock(product) ? 'Add to Cart' : 'Out of Stock')
                        }
                      </Button>
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white mx-4 p-0">
          <DialogHeader className="bg-pink-50 p-4 sm:p-6 border-b border-pink-100 sticky top-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-gray-900 text-lg">
                <ShoppingCart className="h-5 w-5 text-pink-600" />
                Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
              </DialogTitle>
             
            </div>
            <DialogDescription className="text-gray-600 text-sm">
              Review your items and proceed to checkout
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-16 w-16 mx-auto text-pink-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Start shopping to add items to your cart</p>
                <Button
                  onClick={() => setShowCartModal(false)}
                  className="bg-gradient-to-r from-pink-500 to-purple-500"
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border border-pink-100 rounded-lg bg-white">
                      <img
                        src={item.image ? `data:image/jpeg;base64,${item.image}` : "/placeholder-image.jpg"}
                        alt={item.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded border border-pink-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{item.description}</p>
                        <p className="text-base font-bold text-pink-600">₹{parseFloat(item.price).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={isLoading}
                          className="h-7 w-7 p-0 border-pink-200 hover:bg-pink-50"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center font-medium bg-pink-50 py-1 rounded text-xs">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isLoading}
                          className="h-7 w-7 p-0 border-pink-200 hover:bg-pink-50"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item.id)}
                          disabled={isLoading}
                          className="h-7 w-7 p-0 text-red-600 border-red-200 hover:bg-red-50 ml-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Cart Summary */}
                <div className="space-y-2 bg-pink-25 p-4 rounded-lg border border-pink-100">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery</span>
                    <span className="text-green-600">Extra Delivery Charges</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-pink-600">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={() => setShowCartModal(false)}
                    className="w-full sm:w-auto border-pink-200 text-pink-700 hover:bg-pink-50"
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    onClick={() => {
                      setShowCartModal(false);
                      if (user) {
                        setLocation('/checkout');
                      } else {
                        setLocation('/signin');
                      }
                    }}
                  >
                    Proceed to Checkout
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