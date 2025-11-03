import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product, Address, DeliveryOption } from "@shared/schema";

export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'cod' | 'qrcode';

export interface PaymentData {
  selectedMethod: PaymentMethod | null;
  cardData?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
  };
  upiData?: {
    upiId: string;
  };
  netbankingData?: {
    bankName: string;
    accountType: string;
  };
  codData?: {
    confirmed: boolean;
  };
  qrcodeData?: {
    confirmed: boolean;
    amount: number;
  };
}

interface CartItem extends Product {
  quantity: number;
}

interface AppliedCoupon {
  id: string;
  code: string;
  type: string;
  value: number;
  description?: string;
  maxDiscount?: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  appliedCoupon: AppliedCoupon | null;
  discountAmount: number;
  shippingAddress: Address | null;
  deliveryOption: DeliveryOption | null;
  deliveryCharge: number;
  paymentData: PaymentData;
  paymentCharge: number;
  finalAmount: number;
  isLoading: boolean;
  error: string | null;
  couponError: string | null;
}

interface CartContextType extends CartState {
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemQuantity: (productId: string) => number;
  isInCart: (productId: string) => boolean;
  clearError: () => void;
  loadCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; discountAmount?: number }>;
  removeCoupon: () => void;
  clearCouponError: () => void;
  
  // Shipping address methods
  setShippingAddress: (address: Address | null) => void;
  clearShippingAddress: () => void;
  
  // Delivery option methods
  setDeliveryOption: (option: DeliveryOption | null) => void;
  loadDeliveryOptions: () => Promise<DeliveryOption[]>;
  
  // Payment methods
  setPaymentMethod: (method: PaymentMethod | null) => void;
  updatePaymentData: (data: Partial<PaymentData>) => void;
  clearPaymentData: () => void;
  validatePaymentData: (isRazorpayCompleted?: boolean) => boolean;
  
  // Order placement
  placeOrder: (userId?: string, isRazorpayCompleted?: boolean) => Promise<{ success: boolean; order?: any; error?: string; message?: string; calculatedPricing?: any }>;
  validateOrderData: (isRazorpayCompleted?: boolean) => { isValid: boolean; errors: string[] };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
  userId?: string;
}

export function CartProvider({ children, userId }: CartProviderProps) {
  const { toast } = useToast();
  const [cart, setCart] = useState<CartState>({
    items: [],
    totalItems: 0,
    totalPrice: 0,
    appliedCoupon: null,
    discountAmount: 0,
    shippingAddress: null,
    deliveryOption: null,
    deliveryCharge: 0,
    paymentData: {
      selectedMethod: null,
    },
    paymentCharge: 0,
    finalAmount: 0,
    isLoading: false,
    error: null,
    couponError: null,
  });

  const calculateTotals = useCallback((
    items: CartItem[], 
    coupon?: AppliedCoupon | null, 
    discountAmount: number = 0, 
    deliveryCharge: number = 0,
    paymentCharge: number = 0
  ) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Robust price calculation with proper validation and fallbacks
    const totalPrice = items.reduce((sum, item) => {
      // Handle different price formats and ensure we get a valid number
      let itemPrice = 0;
      if (typeof item.price === 'number') {
        itemPrice = item.price;
      } else if (typeof item.price === 'string') {
        // Remove any currency symbols and parse
        const cleanPrice = item.price.replace(/[₹$,\s]/g, '');
        itemPrice = parseFloat(cleanPrice);
      }
      
      // Ensure we have a valid number, fallback to 0 if invalid
      if (isNaN(itemPrice) || !isFinite(itemPrice)) {
        console.warn(`Invalid price for item ${item.id}: ${item.price}, using 0`);
        itemPrice = 0;
      }
      
      return sum + (itemPrice * item.quantity);
    }, 0);
    
    let recalculatedDiscount = discountAmount;
    
    if (coupon) {
      if (coupon.type === 'percentage') {
        // Recalculate percentage discount based on cart subtotal only (not including delivery)
        recalculatedDiscount = (totalPrice * coupon.value) / 100;
        
        // Apply maximum discount cap if specified
        if (coupon.maxDiscount && recalculatedDiscount > coupon.maxDiscount) {
          recalculatedDiscount = coupon.maxDiscount;
        }
      } else if (coupon.type === 'fixed') {
        // For fixed discounts, clamp to prevent negative amounts on subtotal
        recalculatedDiscount = Math.min(coupon.value, totalPrice);
      }
    }
    
    // Calculate final amount: subtotal - discount + payment charges (no delivery charge)
    // Ensure the discounted subtotal is never negative
    const discountedSubtotal = Math.max(0, totalPrice - recalculatedDiscount);
    const finalAmount = discountedSubtotal + paymentCharge; // Remove deliveryCharge
    
    return { 
      totalItems, 
      totalPrice, 
      finalAmount, 
      recalculatedDiscount 
    };
  }, []);

  // Save/load coupon state for guest users (defined before loadCart to fix initialization order)
  const saveGuestCoupon = useCallback((coupon: AppliedCoupon | null, discountAmount: number = 0) => {
    if (!userId) {
      try {
        if (coupon) {
          localStorage.setItem('guest-coupon', JSON.stringify({ coupon, discountAmount }));
        } else {
          localStorage.removeItem('guest-coupon');
        }
      } catch (error) {
        console.error('Error saving guest coupon:', error);
      }
    }
  }, [userId]);

  const loadGuestCoupon = useCallback(() => {
    if (!userId) {
      try {
        const savedCoupon = localStorage.getItem('guest-coupon');
        if (savedCoupon) {
          return JSON.parse(savedCoupon);
        }
      } catch (error) {
        console.error('Error loading guest coupon:', error);
      }
    }
    return { coupon: null, discountAmount: 0 };
  }, [userId]);

  // Save/load shipping state for guest users
  const saveGuestShipping = useCallback((shippingAddress: Address | null, deliveryOption: DeliveryOption | null) => {
    if (!userId) {
      try {
        if (shippingAddress || deliveryOption) {
          localStorage.setItem('guest-shipping', JSON.stringify({ shippingAddress, deliveryOption }));
        } else {
          localStorage.removeItem('guest-shipping');
        }
      } catch (error) {
        console.error('Error saving guest shipping:', error);
      }
    }
  }, [userId]);

  const loadGuestShipping = useCallback(() => {
    if (!userId) {
      try {
        const savedShipping = localStorage.getItem('guest-shipping');
        if (savedShipping) {
          return JSON.parse(savedShipping);
        }
      } catch (error) {
        console.error('Error loading guest shipping:', error);
      }
    }
    return { shippingAddress: null, deliveryOption: null };
  }, [userId]);

  // Load cart from backend or localStorage
  const loadCart = useCallback(async () => {
    if (userId) {
      // Authenticated user - load from backend and merge guest cart if exists
      setCart(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        // Check for guest cart items to merge
        const guestCartItems = localStorage.getItem('guest-cart');
        let guestItems: CartItem[] = [];
        if (guestCartItems) {
          try {
            guestItems = JSON.parse(guestCartItems);
          } catch (error) {
            console.error('Error parsing guest cart:', error);
          }
        }

        // Add guest cart items to server cart with robust error handling
        const mergeResults = await Promise.allSettled(
          guestItems.map(guestItem => 
            apiRequest(`/api/cart/${userId}/add`, {
              method: 'POST',
              body: JSON.stringify({ 
                productId: guestItem.id,
                quantity: guestItem.quantity 
              }),
              headers: { 'Content-Type': 'application/json' }
            })
          )
        );

        // Count successful merges
        const successfulMerges = mergeResults.filter(result => result.status === 'fulfilled').length;
        const failedMerges = mergeResults.filter(result => result.status === 'rejected').length;

        // Only clear guest cart if all items were successfully merged
        if (guestItems.length > 0) {
          if (failedMerges === 0) {
            localStorage.removeItem('guest-cart');
            localStorage.removeItem('guest-coupon');
            localStorage.removeItem('guest-shipping');
          } else {
            console.warn(`Failed to merge ${failedMerges} out of ${guestItems.length} guest cart items`);
            // Keep guest cart intact for failed items - user can retry later
          }
        }

        // Now load the updated server cart
        const response = await apiRequest(`/api/cart/${userId}`);
        const serverItems = await response.json();
        
        // Normalize server cart items: handle both nested and flat structures
        const items = serverItems.map((cartItem: any) => {
          // Handle nested structure: { product: {...}, quantity }
          if (cartItem.product) {
            return {
              ...cartItem.product,
              quantity: cartItem.quantity
            };
          }
          // Handle flat structure (fallback): { id, name, price, quantity, ... }
          return cartItem;
        });
        
        // Preserve existing coupon state and recalculate with new items
        setCart(prev => {
          const { totalItems, totalPrice, finalAmount, recalculatedDiscount } = calculateTotals(
            items, 
            prev.appliedCoupon, 
            prev.discountAmount,
            prev.deliveryCharge,
            prev.paymentCharge
          );
          
          return {
            ...prev,
            items,
            totalItems,
            totalPrice,
            appliedCoupon: prev.appliedCoupon,
            discountAmount: recalculatedDiscount,
            finalAmount,
            isLoading: false,
            error: null,
          };
        });
      } catch (error) {
        console.error('Error loading cart:', error);
        setCart(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Failed to load cart' 
        }));
      }
    } else {
      // Guest user - load from localStorage
      try {
        const savedCart = localStorage.getItem('guest-cart');
        const { coupon, discountAmount } = loadGuestCoupon();
        
        if (savedCart) {
          const items = JSON.parse(savedCart);
          const { totalItems, totalPrice, finalAmount } = calculateTotals(items, coupon, discountAmount);
          setCart(prev => ({
            ...prev,
            items,
            totalItems,
            totalPrice,
            appliedCoupon: coupon,
            discountAmount,
            finalAmount,
            isLoading: false,
            error: null,
            couponError: null,
          }));
          
          // Note: Coupon will be revalidated if user applies it again
          // We don't auto-revalidate to avoid infinite loops
        } else {
          setCart(prev => ({
            ...prev,
            appliedCoupon: null,
            discountAmount: 0,
            finalAmount: 0
          }));
        }
      } catch (error) {
        console.error('Error loading guest cart:', error);
      }
    }
  }, [userId, calculateTotals, loadGuestCoupon]);

  // Revalidate applied coupon when cart changes (Critical Issue 2)
  const revalidateAppliedCoupon = useCallback(async (newTotalPrice: number) => {
    if (!cart.appliedCoupon) return true;
    
    try {
      const response = await apiRequest('/api/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({
          code: cart.appliedCoupon.code,
          cartSubtotal: newTotalPrice,
          userId: userId || undefined
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (!result.valid) {
        // Remove invalid coupon and show toast notification
        setCart(prev => ({
          ...prev,
          appliedCoupon: null,
          discountAmount: 0,
          finalAmount: newTotalPrice,
          couponError: null
        }));
        
        // Clear coupon from localStorage for guests
        saveGuestCoupon(null);
        
        toast({
          title: "Coupon Removed",
          description: `Your coupon "${cart.appliedCoupon.code}" is no longer valid: ${result.error}`,
          variant: "destructive"
        });
        
        console.log(`[COUPON] Revalidation failed for ${cart.appliedCoupon.code}: ${result.error}`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error revalidating coupon:', error);
      // On network error, keep coupon but log the issue
      return true;
    }
  }, [cart.appliedCoupon, userId, saveGuestCoupon]);

  // Save guest cart to localStorage
  const saveGuestCart = useCallback((items: CartItem[]) => {
    if (!userId) {
      try {
        localStorage.setItem('guest-cart', JSON.stringify(items));
      } catch (error) {
        console.error('Error saving guest cart:', error);
      }
    }
  }, [userId]);


  const addToCart = useCallback(async (product: Product, quantity: number = 1) => {
    // Prevent double-add by checking if already loading
    if (cart.isLoading) {
      console.log('[ADD TO CART] Already processing, ignoring duplicate request');
      return;
    }
    
    console.log(`[ADD TO CART] Starting - Product: ${product.name}, Quantity: ${quantity}, User: ${userId || 'guest'}`);
    console.log('[ADD TO CART] Current cart items:', cart.items.map(item => `${item.name}: ${item.quantity}`));
    
    if (userId) {
      // Backend persistence for authenticated users
      console.log(`[ADD TO CART] Using backend persistence for user: ${userId}`);
      setCart(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        console.log(`[ADD TO CART] Making API request to: /api/cart/${userId}/add`);
        const response = await apiRequest(`/api/cart/${userId}/add`, {
          method: 'POST',
          body: JSON.stringify({ productId: product.id, quantity }),
          headers: { 'Content-Type': 'application/json' }
        });
        console.log(`[ADD TO CART] API response status: ${response.status}`);
        await response.json();
        
        // Reload cart after adding
        await loadCart();
        
        // Revalidate coupon after cart reload (Critical Issue 2)
        if (cart.appliedCoupon) {
          // Use a small delay to ensure cart has been reloaded
          setTimeout(async () => {
            const currentCart = await new Promise<CartState>(resolve => {
              setCart(current => {
                resolve(current);
                return current;
              });
            });
            await revalidateAppliedCoupon(currentCart.totalPrice);
          }, 100);
        }
      } catch (error: any) {
        console.error('[ADD TO CART] Backend error:', error);
        console.error('[ADD TO CART] Error details:', {
          message: error.message,
          status: error.status,
          response: error.response,
          stack: error.stack
        });
        setCart(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: `Failed to add ${product.name} to cart: ${error.message}` 
        }));
        
        toast({
          title: "Error", 
          description: `Error adding to cart: ${error.message}`,
          variant: "destructive",
        });
      }
    } else {
      // Local state for guest users
      setCart(prevCart => {
        const existingItemIndex = prevCart.items.findIndex(item => item.id === product.id);
        
        let newItems: CartItem[];
        if (existingItemIndex > -1) {
          newItems = prevCart.items.map((item, index) => 
            index === existingItemIndex 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [...prevCart.items, { ...product, quantity }];
        }

        const { totalItems, totalPrice, finalAmount, recalculatedDiscount } = calculateTotals(
          newItems, 
          prevCart.appliedCoupon, 
          prevCart.discountAmount
        );
        
        // Save to localStorage
        saveGuestCart(newItems);
        
        // Revalidate coupon with new cart total (Critical Issue 2)
        const couponValidationPromise = prevCart.appliedCoupon 
          ? revalidateAppliedCoupon(totalPrice)
          : Promise.resolve(true);
        
        couponValidationPromise.then(isValid => {
          if (isValid) {
            // Save updated coupon if discount was recalculated and coupon is still valid
            if (prevCart.appliedCoupon && recalculatedDiscount !== prevCart.discountAmount) {
              saveGuestCoupon(prevCart.appliedCoupon, recalculatedDiscount);
            }
          }
        });
        
        return {
          ...prevCart,
          items: newItems,
          totalItems,
          totalPrice,
          discountAmount: recalculatedDiscount,
          finalAmount,
        };
      });
    }
  }, [userId, calculateTotals, loadCart, saveGuestCart, revalidateAppliedCoupon]);

  const removeFromCart = useCallback(async (productId: string) => {
    if (userId) {
      // Backend persistence for authenticated users
      setCart(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const response = await apiRequest(`/api/cart/${userId}/remove/${productId}`, {
          method: 'DELETE'
        });
        await response.json();
        
        // Reload cart after removing
        await loadCart();
        
        // Revalidate coupon after cart reload (Critical Issue 2)
        if (cart.appliedCoupon) {
          // Use a small delay to ensure cart has been reloaded
          setTimeout(async () => {
            const currentCart = await new Promise<CartState>(resolve => {
              setCart(current => {
                resolve(current);
                return current;
              });
            });
            await revalidateAppliedCoupon(currentCart.totalPrice);
          }, 100);
        }
      } catch (error) {
        console.error('Error removing from cart:', error);
        setCart(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Failed to remove item from cart' 
        }));
      }
    } else {
      // Local state for guest users
      setCart(prevCart => {
        const newItems = prevCart.items.filter(item => item.id !== productId);
        const { totalItems, totalPrice, finalAmount, recalculatedDiscount } = calculateTotals(
          newItems, 
          prevCart.appliedCoupon, 
          prevCart.discountAmount
        );
        
        // Save to localStorage
        saveGuestCart(newItems);
        
        // Revalidate coupon with new cart total (Critical Issue 2)
        const couponValidationPromise = prevCart.appliedCoupon 
          ? revalidateAppliedCoupon(totalPrice)
          : Promise.resolve(true);
        
        couponValidationPromise.then(isValid => {
          if (isValid) {
            // Save updated coupon if discount was recalculated and coupon is still valid
            if (prevCart.appliedCoupon && recalculatedDiscount !== prevCart.discountAmount) {
              saveGuestCoupon(prevCart.appliedCoupon, recalculatedDiscount);
            }
          }
        });
        
        return {
          ...prevCart,
          items: newItems,
          totalItems,
          totalPrice,
          discountAmount: recalculatedDiscount,
          finalAmount,
        };
      });
    }
  }, [userId, calculateTotals, loadCart, saveGuestCart, revalidateAppliedCoupon]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (userId) {
      // Backend persistence for authenticated users
      setCart(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const response = await apiRequest(`/api/cart/${userId}/update`, {
          method: 'PUT',
          body: JSON.stringify({ productId, quantity }),
          headers: { 'Content-Type': 'application/json' }
        });
        await response.json();
        
        // Reload cart after updating
        await loadCart();
        
        // Revalidate coupon after cart reload (Critical Issue 2)
        if (cart.appliedCoupon) {
          // Use a small delay to ensure cart has been reloaded
          setTimeout(async () => {
            const currentCart = await new Promise<CartState>(resolve => {
              setCart(current => {
                resolve(current);
                return current;
              });
            });
            await revalidateAppliedCoupon(currentCart.totalPrice);
          }, 100);
        }
      } catch (error) {
        console.error('Error updating cart quantity:', error);
        setCart(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Failed to update cart item' 
        }));
      }
    } else {
      // Local state for guest users
      setCart(prevCart => {
        const newItems = prevCart.items.map(item =>
          item.id === productId ? { ...item, quantity } : item
        );
        const { totalItems, totalPrice, finalAmount, recalculatedDiscount } = calculateTotals(
          newItems, 
          prevCart.appliedCoupon, 
          prevCart.discountAmount
        );
        
        // Save to localStorage
        saveGuestCart(newItems);
        
        // Revalidate coupon with new cart total (Critical Issue 2)
        const couponValidationPromise = prevCart.appliedCoupon 
          ? revalidateAppliedCoupon(totalPrice)
          : Promise.resolve(true);
        
        couponValidationPromise.then(isValid => {
          if (isValid) {
            // Save updated coupon if discount was recalculated and coupon is still valid
            if (prevCart.appliedCoupon && recalculatedDiscount !== prevCart.discountAmount) {
              saveGuestCoupon(prevCart.appliedCoupon, recalculatedDiscount);
            }
          }
        });
        
        return {
          ...prevCart,
          items: newItems,
          totalItems,
          totalPrice,
          discountAmount: recalculatedDiscount,
          finalAmount,
        };
      });
    }
  }, [userId, calculateTotals, removeFromCart, loadCart, saveGuestCart]);

  const clearCart = useCallback(async () => {
    if (userId) {
      // Backend persistence for authenticated users
      setCart(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const response = await apiRequest(`/api/cart/${userId}/clear`, {
          method: 'DELETE'
        });
        await response.json();
        
        setCart(prev => ({
          ...prev,
          items: [],
          totalItems: 0,
          totalPrice: 0,
          appliedCoupon: null,
          discountAmount: 0,
          finalAmount: 0,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        console.error('Error clearing cart:', error);
        setCart(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Failed to clear cart' 
        }));
      }
    } else {
      // Local state for guest users
      setCart(prev => ({
        ...prev,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        appliedCoupon: null,
        discountAmount: 0,
        finalAmount: 0,
      }));
      
      // Clear localStorage
      try {
        localStorage.removeItem('guest-cart');
      } catch (error) {
        console.error('Error clearing guest cart:', error);
      }
    }
  }, [userId]);

  const getItemQuantity = useCallback((productId: string): number => {
    const item = cart.items.find(item => item.id === productId);
    return item?.quantity || 0;
  }, [cart.items]);

  const isInCart = useCallback((productId: string): boolean => {
    return cart.items.some(item => item.id === productId);
  }, [cart.items]);

  const clearError = useCallback(() => {
    setCart(prev => ({ ...prev, error: null }));
  }, []);

  const clearCouponError = useCallback(() => {
    setCart(prev => ({ ...prev, couponError: null }));
  }, []);

  // Apply coupon with backend validation
  const applyCoupon = useCallback(async (code: string): Promise<{ success: boolean; discountAmount?: number }> => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) return { success: false };

    setCart(prev => ({ ...prev, isLoading: true, couponError: null }));

    try {
      const response = await apiRequest('/api/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({
          code: trimmedCode,
          cartSubtotal: cart.totalPrice,
          userId: userId || undefined
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.valid) {
        const { coupon, discountAmount, finalAmount } = result;
        
        setCart(prev => {
          const newCart = {
            ...prev,
            appliedCoupon: coupon,
            discountAmount,
            finalAmount,
            isLoading: false,
            couponError: null
          };
          
          // Save coupon for guest users
          saveGuestCoupon(coupon, discountAmount);
          return newCart;
        });
        
        console.log(`[COUPON] Successfully applied coupon ${trimmedCode}, discount: ₹${discountAmount}`);
        return { success: true, discountAmount };
      } else {
        setCart(prev => ({
          ...prev,
          isLoading: false,
          couponError: result.error || 'Invalid coupon code'
        }));
        return { success: false };
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCart(prev => ({
        ...prev,
        isLoading: false,
        couponError: 'Failed to validate coupon. Please try again.'
      }));
      return { success: false };
    }
  }, [cart.totalPrice, userId, saveGuestCoupon]);

  // Remove applied coupon
  const removeCoupon = useCallback(() => {
    setCart(prev => {
      const { totalItems, totalPrice, finalAmount } = calculateTotals(prev.items, null, 0, prev.deliveryCharge, prev.paymentCharge);
      return {
        ...prev,
        appliedCoupon: null,
        discountAmount: 0,
        finalAmount,
        couponError: null
      };
    });
    
    // Clear coupon from localStorage for guests
    saveGuestCoupon(null);
    console.log('[COUPON] Coupon removed');
  }, [calculateTotals, saveGuestCoupon]);

  // Shipping address methods
  const setShippingAddress = useCallback((address: Address | null) => {
    setCart(prev => {
      const { totalItems, totalPrice, finalAmount } = calculateTotals(
        prev.items, 
        prev.appliedCoupon, 
        prev.discountAmount,
        prev.deliveryCharge,
        prev.paymentCharge
      );
      
      const newCart = {
        ...prev,
        shippingAddress: address,
        totalItems,
        totalPrice,
        finalAmount
      };
      
      // Save shipping to localStorage for guests
      saveGuestShipping(address, prev.deliveryOption);
      return newCart;
    });
  }, [calculateTotals, saveGuestShipping]);

  const clearShippingAddress = useCallback(() => {
    setShippingAddress(null);
  }, [setShippingAddress]);

  // Delivery option methods
  const setDeliveryOption = useCallback((option: DeliveryOption | null) => {
    setCart(prev => {
      const deliveryCharge = 0; // Always 0 - no delivery charges
      const { totalItems, totalPrice, finalAmount } = calculateTotals(
        prev.items, 
        prev.appliedCoupon, 
        prev.discountAmount,
        deliveryCharge,
        prev.paymentCharge
      );
      
      const newCart = {
        ...prev,
        deliveryOption: option,
        deliveryCharge,
        totalItems,
        totalPrice,
        finalAmount
      };
      
      // Save shipping to localStorage for guests
      saveGuestShipping(prev.shippingAddress, option);
      return newCart;
    });
  }, [calculateTotals, saveGuestShipping]);

  const loadDeliveryOptions = useCallback(async (): Promise<DeliveryOption[]> => {
    try {
      const response = await apiRequest('/api/delivery-options');
      const deliveryOptions = await response.json();
      return deliveryOptions;
    } catch (error) {
      console.error('Error loading delivery options:', error);
      toast({
        title: "Error",
        description: "Failed to load delivery options",
        variant: "destructive",
      });
      return [];
    }
  }, []);

  // Payment methods
  const setPaymentMethod = useCallback((method: PaymentMethod | null) => {
    setCart(prev => {
      // Calculate payment charges to match backend logic
      let paymentCharge = 0;
      if (method === 'card' || method === 'upi' || method === 'netbanking') {
        // Card/Online payments: 2% of (subtotal - discount) or minimum ₹5 (no delivery charge)
        const subtotal = prev.totalPrice;
        const baseAmount = subtotal - prev.discountAmount;
        paymentCharge = Math.max(baseAmount * 0.02, 5);
      }
      // COD and QR code are free (paymentCharge = 0)

      const { totalItems, totalPrice, finalAmount } = calculateTotals(
        prev.items,
        prev.appliedCoupon,
        prev.discountAmount,
        prev.deliveryCharge,
        paymentCharge
      );

      return {
        ...prev,
        paymentData: {
          ...prev.paymentData,
          selectedMethod: method,
        },
        paymentCharge,
        totalItems,
        totalPrice,
        finalAmount,
      };
    });
  }, [calculateTotals]);

  const updatePaymentData = useCallback((data: Partial<PaymentData>) => {
    setCart(prev => ({
      ...prev,
      paymentData: {
        ...prev.paymentData,
        ...data,
      },
    }));
  }, []);

  const clearPaymentData = useCallback(() => {
    setCart(prev => ({
      ...prev,
      paymentData: {
        selectedMethod: null,
      },
      paymentCharge: 0,
    }));
  }, []);

  const validatePaymentData = useCallback((isRazorpayCompleted: boolean = false): boolean => {
    // If Razorpay payment is completed, consider payment as valid
    if (isRazorpayCompleted) {
      return true;
    }
    
    const { paymentData } = cart;
    
    if (!paymentData.selectedMethod) return false;

    switch (paymentData.selectedMethod) {
      case 'card':
        return !!(paymentData.cardData?.holderName &&
                 paymentData.cardData?.number &&
                 paymentData.cardData?.expiryMonth &&
                 paymentData.cardData?.expiryYear &&
                 paymentData.cardData?.cvv);
      case 'upi':
        return !!(paymentData.upiData?.upiId);
      case 'netbanking':
        return !!(paymentData.netbankingData?.bankName);
      case 'cod':
        return !!(paymentData.codData?.confirmed);
      case 'qrcode':
        return !!(paymentData.qrcodeData?.confirmed);
      default:
        return false;
    }
  }, [cart]);

  const validateOrderData = useCallback((isRazorpayCompleted: boolean = false) => {
    const errors: string[] = [];
    
    if (cart.items.length === 0) {
      errors.push('Cart is empty');
    }
    
    if (!cart.shippingAddress) {
      errors.push('Shipping address is required');
    }
    
    if (!cart.deliveryOption) {
      errors.push('Delivery option must be selected');
    }
    
    if (!validatePaymentData(isRazorpayCompleted)) {
      errors.push('Payment information is incomplete');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [cart, validatePaymentData]);

  const placeOrder = useCallback(async (userId?: string, isRazorpayCompleted: boolean = false) => {
    const validation = validateOrderData(isRazorpayCompleted);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    try {
      setCart(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Helper function to map frontend payment methods to server enum
      const mapPaymentMethod = (method: PaymentMethod | null): string => {
        switch (method) {
          case 'card':
            return 'Card';
          case 'upi':
            return 'UPI';
          case 'netbanking':
            return 'Online';
          case 'cod':
            return 'COD';
          case 'qrcode':
            return 'Online';
          default:
            return 'COD'; // fallback
        }
      };
      
      // Helper function to parse price safely
      const parsePrice = (price: number | string): number => {
        if (typeof price === 'number') return price;
        const cleanPrice = String(price).replace(/[₹$,\s]/g, '');
        const parsed = parseFloat(cleanPrice);
        return isNaN(parsed) ? 0 : parsed;
      };
      
      // Construct order payload according to server schema
      const orderData = {
        // Customer information (required for both guest and authenticated users)
        customerName: cart.shippingAddress?.fullName || '',
        email: cart.shippingAddress?.email || '',
        phone: cart.shippingAddress?.phone || '',
        
        // Order details (optional)
        occasion: '',
        requirements: '',
        
        // Cart items with proper structure
        items: cart.items.map(item => {
          const unitPrice = parsePrice(item.price);
          const totalPrice = unitPrice * item.quantity;
          return {
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            unitPrice: unitPrice,
            totalPrice: totalPrice
          };
        }),
        
        // Pricing breakdown (top-level fields)
        subtotal: cart.totalPrice,
        
        // Delivery information
        deliveryOptionId: cart.deliveryOption?.id || '',
        deliveryCharge: 0, // Always 0 - no delivery charges
        deliveryDate: undefined, // optional
        
        // Payment information
        paymentMethod: mapPaymentMethod(cart.paymentData.selectedMethod),
        paymentCharges: cart.paymentCharge,
        
        // Address information
        ...(userId ? {
          // For authenticated users, send address ID if available
          shippingAddressId: cart.shippingAddress?.id,
          // Also send delivery address as fallback for guests-turned-users
          deliveryAddress: cart.shippingAddress ? 
            `${cart.shippingAddress.fullName}, ${cart.shippingAddress.addressLine1}${cart.shippingAddress.addressLine2 ? ', ' + cart.shippingAddress.addressLine2 : ''}, ${cart.shippingAddress.landmark ? cart.shippingAddress.landmark + ', ' : ''}${cart.shippingAddress.city}, ${cart.shippingAddress.state} ${cart.shippingAddress.postalCode}, ${cart.shippingAddress.country}` :
            undefined
        } : {
          // For guest users, send delivery address as string
          deliveryAddress: cart.shippingAddress ? 
            `${cart.shippingAddress.fullName}, ${cart.shippingAddress.addressLine1}${cart.shippingAddress.addressLine2 ? ', ' + cart.shippingAddress.addressLine2 : ''}, ${cart.shippingAddress.landmark ? cart.shippingAddress.landmark + ', ' : ''}${cart.shippingAddress.city}, ${cart.shippingAddress.state} ${cart.shippingAddress.postalCode}, ${cart.shippingAddress.country}` :
            ''
        }),
        
        // Coupon information
        couponCode: cart.appliedCoupon?.code,
        discountAmount: cart.discountAmount,
        
        // Final total
        total: cart.finalAmount,
        
        // User information (optional for guest checkout)
        userId: userId || undefined
      };
      
      console.log('[ORDER PLACEMENT] Sending order data:', JSON.stringify(orderData, null, 2));

      const response = await apiRequest('/api/orders/place', {
        method: 'POST',
        body: JSON.stringify(orderData),
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      
      if (result.success) {
        // Clear cart after successful order
        await clearCart();
        setCart(prev => ({ 
          ...prev, 
          isLoading: false,
          appliedCoupon: null,
          discountAmount: 0,
          shippingAddress: null,
          deliveryOption: null,
          paymentData: { selectedMethod: null },
          deliveryCharge: 0,
          paymentCharge: 0,
          finalAmount: 0
        }));
        
        // Clear guest storage
        if (!userId) {
          try {
            localStorage.removeItem('guest-cart');
            localStorage.removeItem('guest-coupon');
            localStorage.removeItem('guest-shipping');
          } catch (error) {
            console.error('Error clearing guest storage:', error);
          }
        }
      } else {
        setCart(prev => ({ ...prev, isLoading: false, error: result.error }));
      }
      
      return result;
    } catch (error) {
      console.error('Error placing order:', error);
      setCart(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to place order. Please try again.' 
      }));
      
      return {
        success: false,
        error: 'Failed to place order. Please try again.'
      };
    }
  }, [cart, validateOrderData, validatePaymentData, clearCart]);

  // Load cart when component mounts or userId changes
  useEffect(() => {
    loadCart();
  }, [loadCart, userId]); // Added userId dependency to reload cart on auth changes

  const value: CartContextType = {
    ...cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isInCart,
    clearError,
    loadCart,
    applyCoupon,
    removeCoupon,
    clearCouponError,
    setShippingAddress,
    clearShippingAddress,
    setDeliveryOption,
    loadDeliveryOptions,
    setPaymentMethod,
    updatePaymentData,
    clearPaymentData,
    validatePaymentData,
    placeOrder,
    validateOrderData,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};