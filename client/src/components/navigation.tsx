import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Menu, X, User, UserPlus, LogOut, ShoppingCart, Plus, Minus, Trash2, Phone } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useCart } from "@/hooks/cart-context";
import logoPath from "@assets/E_Commerce_Bouquet_Bar_Logo_1757433847861.png";
import type { User as UserType } from "@shared/schema";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [showCartModal, setShowCartModal] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get current user data
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Cart functionality
  const { 
    totalItems, 
    totalPrice,
    items,
    isLoading,
    updateQuantity,
    removeFromCart 
  } = useCart();

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/auth/signout", {
        method: "POST",
      });
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

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (currentScrollTop <= 50) {
        setIsScrollingUp(false);
      }
      else if (currentScrollTop < lastScrollTop && currentScrollTop > 50) {
        setIsScrollingUp(true);
      }
      else if (currentScrollTop > lastScrollTop) {
        setIsScrollingUp(false);
      }
      
      setLastScrollTop(currentScrollTop <= 0 ? 0 : currentScrollTop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollTop]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className={`fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 transition-transform duration-300 border-b border-gray-200 ${isScrollingUp ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <img src={logoPath} alt="Bouquet Bar Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Bouquet Bar
            </span>
          </div>
          
          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex space-x-6">
            <button 
              onClick={() => scrollToSection('home')}
              className="text-gray-600 hover:text-pink-600 transition-colors text-sm font-medium"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('shop')}
              className="text-gray-600 hover:text-pink-600 transition-colors text-sm font-medium"
            >
              Shop
            </button>
            <button 
              onClick={() => scrollToSection('school')}
              className="text-gray-600 hover:text-pink-600 transition-colors text-sm font-medium"
            >
              School
            </button>
            <button 
              onClick={() => scrollToSection('gallery')}
              className="text-gray-600 hover:text-pink-600 transition-colors text-sm font-medium"
            >
              Gallery
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-gray-600 hover:text-pink-600 transition-colors text-sm font-medium"
            >
              Contact
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Cart Button - Always Visible */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10"
              onClick={() => setShowCartModal(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 text-xs font-semibold rounded-full bg-pink-600 text-white">
                  {totalItems}
                </span>
              )}
            </Button>

            {/* Contact Button - Hidden on mobile */}
            <div className="hidden sm:block">
              <a href="tel:9972803847">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </a>
            </div>

            {/* User Actions - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setLocation('/shop')}
                    className="text-pink-600 border border-pink-300 rounded-full px-3 py-1 text-xs hover:bg-pink-50"
                  >
                    Account
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full px-3 py-1 text-xs hover:from-pink-600 hover:to-purple-700"
                  >
                    {logoutMutation.isPending ? '...' : 'Logout'}
                  </Button>
                </div>
              ) : (
                <Button 
                  size="sm"
                  onClick={() => setLocation('/signin')}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full px-3 py-1 text-xs hover:from-pink-600 hover:to-purple-700"
                >
                  Login
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-left text-gray-600 hover:text-pink-600 transition-colors py-2 font-medium"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('shop')}
                className="text-left text-gray-600 hover:text-pink-600 transition-colors py-2 font-medium"
              >
                Shop
              </button>
              <button 
                onClick={() => scrollToSection('school')}
                className="text-left text-gray-600 hover:text-pink-600 transition-colors py-2 font-medium"
              >
                School
              </button>
              <button 
                onClick={() => scrollToSection('gallery')}
                className="text-left text-gray-600 hover:text-pink-600 transition-colors py-2 font-medium"
              >
                Gallery
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-left text-gray-600 hover:text-pink-600 transition-colors py-2 font-medium"
              >
                Contact
              </button>
              
              {/* Mobile Contact */}
              <div className="border-t border-gray-200 pt-4">
                <a href="tel:9972803847" className="block">
                  <Button variant="ghost" className="w-full justify-start text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    Call: 9972803847
                  </Button>
                </a>
              </div>

              {/* Mobile Auth Section */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                {user ? (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 px-2">
                      Welcome, <span className="font-semibold text-pink-600">{user?.firstname || 'User'}!</span>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start" 
                        onClick={() => {
                          setLocation('/shop');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <User className="w-4 h-4 mr-2" />
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
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                      onClick={() => {
                        setLocation('/signin');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-pink-300 text-pink-600 hover:bg-pink-50"
                      onClick={() => {
                        setLocation('/signup');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile-Optimized Cart Modal */}
      <Dialog open={showCartModal} onOpenChange={setShowCartModal}>
        <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto bg-white mx-4 p-0">
          <DialogHeader className="bg-pink-50 p-4 border-b border-pink-100 sticky top-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-gray-900 text-lg">
                <ShoppingCart className="h-5 w-5 text-pink-600" />
                Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCartModal(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-gray-600 text-sm">
              Review your items and proceed to checkout
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-16 w-16 mx-auto text-pink-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Start shopping to add items to your cart</p>
                <Button
                  onClick={() => setShowCartModal(false)}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 w-full"
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
                        className="w-12 h-12 object-cover rounded border border-pink-100 flex-shrink-0"
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
                    <span className="text-green-600">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
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
                  >
                    Proceed to Checkout
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
    </nav>
  );
}