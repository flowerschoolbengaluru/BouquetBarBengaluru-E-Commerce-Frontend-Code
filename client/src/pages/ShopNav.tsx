import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Search, Phone, ShoppingCart, User, LogOut, Menu, X, Plus, Minus, Trash2 } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useCart } from "@/hooks/cart-context";
import logoPath from "@assets/E_Commerce_Bouquet_Bar_Logo_1757433847861.png";
import type { User as UserType } from "@shared/schema";
import FlowerCategory from "./FlowerCategory";

// Category detection mappings
const mainCategoryMapping = {
  'occasion': ['occasion', 'occasions', 'celebration', 'special event', 'birthday', 'anniversary', 'wedding', 'valentine', 'valentines', 'mothers day', 'fathers day', 'graduation', 'congratulations', 'get well soon'],
  'arrangements': ['arrangement', 'arrangements', 'bouquet', 'bouquets', 'basket', 'baskets', 'box', 'boxes', 'vase', 'vases', 'centerpiece', 'centerpieces', 'garland', 'garlands', 'wreath', 'wreaths'],
  'flower-types': ['flowers', 'flower', 'rose', 'roses', 'lily', 'lilies', 'tulip', 'tulips', 'orchid', 'orchids', 'carnation', 'carnations', 'sunflower', 'sunflowers', 'mixed flowers', 'baby breath', 'chrysanthemum', 'hydrangea', 'anthurium', 'calla lilies', 'gerbera', 'gerberas', 'peony', 'peonies'],
  'gift-combo': ['gift', 'gifts', 'combo', 'combos', 'hamper', 'hampers', 'chocolate', 'chocolates', 'cake', 'cakes', 'teddy', 'teddies', 'wine', 'fruits', 'cheese', 'nuts', 'greeting cards', 'customized gifts', 'perfume', 'jewelry', 'scented candles', 'personalized items'],
  'event-decoration': ['event', 'events', 'venue', 'venues', 'decoration', 'decorations', 'wedding decor', 'party', 'parties', 'corporate event', 'stage', 'backdrop', 'car decoration', 'temple', 'pooja', 'entrance', 'table centerpieces', 'aisle', 'archway', 'ceiling', 'wall decorations', 'outdoor event'],
  'services': ['service', 'services', 'delivery', 'same day', 'next day', 'subscription', 'subscriptions', 'message cards', 'international delivery', 'express delivery', 'scheduled delivery', 'workshop', 'workshops', 'consultation', 'florist services'],
  'memorial': ['memorial', 'sympathy', 'funeral', 'condolence', 'remembrance', 'pet memorial', 'funeral wreaths', 'condolence bouquets', 'memorial sprays', 'casket arrangements', 'funeral home', 'church arrangements', 'graveside flowers', 'memorial service', 'living tributes'],
  'corporate': ['corporate', 'office', 'business', 'reception', 'lobby', 'desk flowers', 'reception area', 'corporate gifting', 'brand themed', 'conference room', 'executive office', 'lobby displays', 'corporate accounts', 'volume discounts', 'branded arrangements']
};

const subcategoryMapping = {
  "Father's Day": ["father's day", "fathers day", "dad day", "papa day"],
  "Mother's Day": ["mother's day", "mothers day", "mom day", "mama day"],
  "Valentine's Day": ["valentine's day", "valentines day", "valentine", "valentines"],
  "Self-Flowers (self-love / pampering)": ["self flowers", "self love", "pampering", "self care"],
  "Sister Love": ["sister love", "sister", "sisters"],
  "Brother Love": ["brother love", "brother", "brothers"],
  "Friendship Day": ["friendship day", "friendship", "friends"],
  "Anniversary": ["anniversary", "anniversaries"],
  "Birthday": ["birthday", "birthdays", "bday"],
  "Get Well Soon / Recovery Flowers": ["get well soon", "recovery flowers", "get well", "recovery", "hospital flowers"],
  "I'm Sorry Flowers": ["i'm sorry", "sorry flowers", "apology", "forgiveness"],
  "I Love You Flowers": ["i love you", "love flowers", "romantic"],
  "Congratulations Flowers": ["congratulations", "congrats", "celebration"],
  "Graduation Day Flowers": ["graduation", "graduation day", "grad day"],
  "Promotion / Success Party Flowers": ["promotion", "success party", "achievement"],
  "Bouquets (hand-tied, wrapped)": ["bouquet", "bouquets", "hand tied", "wrapped"],
  "Flower Baskets": ["flower basket", "flower baskets", "basket", "baskets"],
  "Flower Boxes": ["flower box", "flower boxes", "box", "boxes"],
  "Vase Arrangements": ["vase arrangement", "vase arrangements", "vase", "vases"],
  "Floral Centerpieces": ["centerpiece", "centerpieces", "table arrangement"],
  "Flower Garlands": ["garland", "garlands", "flower garland"],
  "Lobby Arrangements": ["lobby arrangement", "lobby flowers", "reception flowers"],
  "Exotic Arrangements": ["exotic", "exotic flowers", "unique arrangements"],
  "Floral Wreaths": ["wreath", "wreaths", "floral wreath"],
  "Custom Arrangements": ["custom", "custom arrangement", "personalized"],
  "Roses": ["rose", "roses", "red roses", "white roses", "pink roses"],
  "Tulips": ["tulip", "tulips"],
  "Lilies": ["lily", "lilies"],
  "Carnations": ["carnation", "carnations"],
  "Orchids": ["orchid", "orchids"],
  "Sunflowers": ["sunflower", "sunflowers"],
  "Mixed Flowers": ["mixed flowers", "mixed", "assorted flowers", "variety flowers", "combination flowers"],
  "Baby's Breath": ["baby's breath", "babys breath", "baby breath"],
  "Chrysanthemum": ["chrysanthemum", "mums", "chrysanthemums"],
  "Hydrangea": ["hydrangea", "hydrangeas"],
  "Anthurium": ["anthurium", "anthuriums"],
  "Calla Lilies": ["calla lily", "calla lilies", "calla"],
  "Gerberas": ["gerbera", "gerberas", "gerbera daisy"],
  "Peonies": ["peony", "peonies"]
};

// Detection functions
const detectMainCategory = (searchQuery: string): string | null => {
  const query = searchQuery.toLowerCase().trim();
  for (const [categoryId, keywords] of Object.entries(mainCategoryMapping)) {
    if (keywords.some(keyword => query.includes(keyword))) {
      return categoryId;
    }
  }
  return null;
};

const detectSubcategory = (searchQuery: string): string | null => {
  const query = searchQuery.toLowerCase().trim();
  for (const [subcategoryName, variations] of Object.entries(subcategoryMapping)) {
    if (subcategoryName.toLowerCase() === query) {
      return subcategoryName;
    }
    for (const variation of variations) {
      if (variation === query || query.includes(variation) || variation.includes(query)) {
        return subcategoryName;
      }
    }
  }
  return null;
};

export default function ShopNav() {
  const [showCartModal, setShowCartModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const cartModalRef = useRef<boolean>(false);

  // User query following project patterns
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Cart context integration following project patterns
  const {
    addToCart,
    totalItems,
    totalPrice,
    items,
    isLoading: cartLoading,
    isInCart,
    getItemQuantity,
    updateQuantity,
    removeFromCart
  } = useCart();



  // Logout mutation following project patterns
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/auth/signout", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth"] });
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

  const handleLogout = useCallback(() => {
    logoutMutation.mutate();
    setShowMobileMenu(false);
  }, [logoutMutation]);

  // Optimized cart handlers with throttling
  const handleCartOpen = useCallback(() => {
    if (cartModalRef.current) return;
    cartModalRef.current = true;
    setShowCartModal(true);
    
    // Reset flag after modal animation
    setTimeout(() => {
      cartModalRef.current = false;
    }, 200);
  }, []);

  const handleCartClose = useCallback(() => {
    if (cartModalRef.current) return;
    cartModalRef.current = true;
    setShowCartModal(false);
    
    // Reset flag after modal animation
    setTimeout(() => {
      cartModalRef.current = false;
    }, 200);
  }, []);





  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location]);

  // Optimized cart handlers with error handling
  const handleQuantityUpdate = useCallback(async (itemId: string, newQuantity: number) => {
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      });
    }
  }, [updateQuantity, toast]);

  const handleRemoveItem = useCallback(async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    }
  }, [removeFromCart, toast]);

  // Memoized Cart Modal to prevent unnecessary re-renders
  const CartModal = useMemo(() => () => (
    <Dialog 
      open={showCartModal} 
      onOpenChange={(open) => {
        if (open) {
          handleCartOpen();
        } else {
          handleCartClose();
        }
      }}
    >
      <DialogContent className="max-w-sm sm:max-w-2xl max-h-[80vh] overflow-hidden bg-white border border-pink-100 mx-4">
        <DialogHeader className="bg-pink-25 -m-4 sm:-m-6 mb-4 p-4 sm:p-6 border-b border-pink-100">
          <DialogTitle className="flex items-center gap-2 text-gray-900 text-base sm:text-lg">
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
            Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm">
            Review your items and proceed to checkout
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 overflow-y-auto max-h-[60vh]">
          {items.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-pink-300 mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4">Start shopping to add items to your cart</p>
              <Button
                onClick={() => {
                  handleCartClose();
                  setLocation('/products');
                }}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transform-gpu"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items with virtualization for large lists */}
              <div className="space-y-2 sm:space-y-3">
                {items.map((item: any) => (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-pink-100 rounded-lg bg-white hover:bg-pink-25 transition-colors transform-gpu"
                  >
                    <img
                      src={item.image ? `data:image/jpeg;base64,${item.image}` : "/placeholder-image.jpg"}
                      alt={item.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded border border-pink-100"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.name}</h4>
                      <p className="text-base sm:text-lg font-bold text-pink-600">₹{parseFloat(item.price).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                        disabled={cartLoading || item.quantity <= 1}
                        className="border-pink-200 hover:bg-pink-50 h-7 w-7 sm:h-8 sm:w-8 p-0 disabled:opacity-50 transform-gpu"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 sm:w-8 text-center font-medium bg-pink-50 py-1 rounded text-xs sm:text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                        disabled={cartLoading}
                        className="border-pink-200 hover:bg-pink-50 h-7 w-7 sm:h-8 sm:w-8 p-0 disabled:opacity-50 transform-gpu"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={cartLoading}
                        className="ml-1 sm:ml-2 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 h-7 w-7 sm:h-8 sm:w-8 p-0 disabled:opacity-50 transform-gpu"
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
                  <span className="text-green-600">Delivery charges will vary depending on the porter or third-party delivery services</span>
                </div>
                <Separator className="border-pink-100" />
                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span>Total</span>
                  <span className="text-pink-600">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <DialogFooter className="flex-col gap-2">
                <Button
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 transform-gpu"
                  onClick={() => {
                    handleCartClose();
                    setLocation('/checkout');
                  }}
                  disabled={cartLoading || items.length === 0}
                >
                  {cartLoading ? 'Processing...' : 'Proceed to Checkout'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCartClose}
                  className="w-full border-pink-200 text-pink-700 hover:bg-pink-50 transform-gpu"
                  disabled={cartLoading}
                >
                  Continue Shopping
                </Button>
              </DialogFooter>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  ), [showCartModal, totalItems, items, cartLoading, totalPrice, handleCartOpen, handleCartClose, handleQuantityUpdate, handleRemoveItem, setLocation]);

  return (
    <>
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {/* Mobile Header */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between py-3">
              {/* Mobile Logo */}
              <Link href="/shop" className="flex items-center gap-2">
                <img
                  src={logoPath}
                  alt="Bouquet Bar Logo"
                  className="w-12 h-auto sm:w-16"
                  loading="eager"
                />
                <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Bouquet Bar
                </div>
              </Link>

              {/* Mobile Action Buttons */}
              <div className="flex items-center gap-2">


                {/* Cart Button - Performance optimized */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 rounded-full disabled:opacity-50 transform-gpu"
                  onClick={handleCartOpen}
                  disabled={cartModalRef.current}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 min-w-[1rem] px-1 text-[9px] font-semibold rounded-full bg-pink-600 text-white">
                      {totalItems}
                    </span>
                  )}
                </Button>

                {/* Mobile Menu Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full transform-gpu"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                  {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>



            {/* Mobile Search Bar */}
            <div className="px-4 pb-3">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const searchTerm = formData.get('search') as string;
                if (searchTerm.trim()) {
                  window.location.href = `/products?search=${encodeURIComponent(searchTerm.trim())}`;
                }
              }}>
                <div className="relative">
                  <input
                    name="search"
                    type="text"
                    placeholder="Search flowers, occasions..."
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:border-pink-400 focus:ring-1 focus:ring-pink-200 focus:outline-none transition-all duration-200 text-sm"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Search className="w-4 h-4 text-gray-500 hover:text-pink-500 transition-colors" />
                  </button>
                </div>
              </form>
            </div>

            {/* Mobile Menu Dropdown */}
            {showMobileMenu && (
              <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 transform-gpu">
                <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Hello, {user.firstname || 'User'}!
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left transform-gpu"
                          onClick={() => {
                            setLocation("/my-account");
                            setShowMobileMenu(false);
                          }}
                        >
                          <User className="w-4 h-4 mr-3" />
                          My Account
                        </Button>
                        
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left transform-gpu"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          <a href="tel:9972803847" className="flex items-center w-full">
                            <Phone className="w-4 h-4 mr-3" />
                            Contact Us
                          </a>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left text-red-600 hover:text-red-700 hover:bg-red-50 transform-gpu"
                          onClick={handleLogout}
                          disabled={logoutMutation.isPending}
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          {logoutMutation.isPending ? 'Logging out...' : 'Log Out'}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transform-gpu"
                        onClick={() => {
                          setLocation("/signin");
                          setShowMobileMenu(false);
                        }}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Sign In
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left transform-gpu"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <a href="tel:9972803847" className="flex items-center w-full">
                          <Phone className="w-4 h-4 mr-3" />
                          Contact Us
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between py-4">
            <Link href="/shop" className="flex items-center gap-3">
              <img
                src={logoPath}
                alt="Bouquet Bar Logo"
                className="w-20 h-auto"
                loading="eager"
              />
              <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Bouquet Bar
              </div>
            </Link>

            {/* Desktop Search Bar */}
            <div className="flex-1 max-w-xl mx-4 md:mx-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const searchTerm = formData.get('search') as string;
                if (searchTerm.trim()) {
                  window.location.href = `/products?search=${encodeURIComponent(searchTerm.trim())}`;
                }
              }}>
                <div className="relative">
                  <input
                    name="search"
                    type="text"
                    placeholder="Search for flowers, occasions, arrangements..."
                    className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl focus:border-pink-400 focus:ring-1 focus:ring-pink-200 focus:outline-none transition-all duration-200 text-sm md:text-base"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Search className="w-4 h-4 text-gray-500 hover:text-pink-500 transition-colors" />
                  </button>
                </div>
              </form>
            </div>

            {/* Desktop Action Buttons */}
            <div className="flex items-center gap-3 md:gap-1 relative">
              <div className="relative group">
                {/* Search Button */}

              </div>

              <div className="relative group">
                {/* Cart Button - Performance optimized */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-12 w-12 rounded-full disabled:opacity-50 transform-gpu"
                  onClick={handleCartOpen}
                  disabled={cartModalRef.current}
                  data-testid="button-cart"
                >
                  <ShoppingCart className="w-7 h-7" />
                  {totalItems > 0 && (
                    <span className="absolute -right-1 flex items-center justify-center h-4 min-w-[1rem] px-1 text-[10px] font-semibold rounded-full bg-pink-600 text-white">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </div>

              <div className="relative group">
                <a href="tel:9972803847">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-full transform-gpu"
                    data-testid="button-contact"
                  >
                    <Phone className="w-6 h-6" />
                  </Button>
                </a>
              </div>

              {user ? (
                <>
                  <div className="relative group">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-full transform-gpu"
                      onClick={() => setLocation("/my-account")}
                      data-testid="button-account"
                    >
                      <User className="w-6 h-6" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-700 font-medium hidden md:block">
                      Hello, {user.firstname || 'User'}!
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      data-testid="button-logout"
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-pink-700 text-white border-0 transition-all duration-300 transform-gpu"
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
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all duration-300 transform-gpu"
                >
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* FlowerCategory Component */}
        <FlowerCategory />
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-full"></div>
      </div>

      {/* Mobile Menu Backdrop */}
      {showMobileMenu && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-30 transform-gpu"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Cart Modal with performance optimizations */}
      <CartModal />
    </>
  );
}
