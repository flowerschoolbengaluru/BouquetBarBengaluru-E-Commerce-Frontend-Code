import { useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/hooks/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShoppingCart, Trash2, Plus, Minus, Tag, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/user-auth";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { 
    items: cartItems, 
    updateQuantity, 
    removeFromCart, 
    totalPrice, 
    totalItems,
    appliedCoupon,
    discountAmount,
    finalAmount,
    couponError,
    applyCoupon,
    removeCoupon,
    clearCouponError
  } = useCart();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }

    setIsApplyingCoupon(true);
    clearCouponError();

    try {
      const result = await applyCoupon(couponCode);
      if (result.success && result.discountAmount !== undefined) {
        toast({
          title: "Coupon Applied!",
          description: `You saved ₹${result.discountAmount} with code ${couponCode.toUpperCase()}`,
        });
        setCouponCode("");
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponCode("");
    toast({
      title: "Coupon Removed",
      description: "The discount has been removed from your cart",
    });
  };

  const handleQuantityChange = (productId: string, change: number) => {
    const currentItem = cartItems.find(item => item.id === productId);
    if (currentItem) {
      const newQuantity = currentItem.quantity + change;
      if (newQuantity > 0) {
        updateQuantity(productId, newQuantity);
      } else {
        removeFromCart(productId);
        toast({
          title: "Item removed",
          description: "Item has been removed from your cart",
        });
      }
    }
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    removeFromCart(productId);
    toast({
      title: "Item removed",
      description: `${productName} has been removed from your cart`,
    });
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setLocation("/signin");
      return;
    }
    setLocation("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16 bg-pink-25 rounded-2xl border border-pink-100">
            <ShoppingCart className="w-24 h-24 mx-auto text-pink-300 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added any beautiful flowers yet!</p>
            <Button 
              size="lg"
              onClick={() => setLocation("/shop")}
              data-testid="button-shop-now"
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              Start Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 p-6 bg-pink-25 rounded-2xl border border-pink-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="overflow-hidden bg-white border border-pink-100 hover:shadow-lg hover:border-pink-200 transition-all duration-200" data-testid={`cart-item-${item.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-md cursor-pointer border border-pink-100"
                        onClick={() => setLocation(`/product/${item.id}`)}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-semibold text-gray-900 cursor-pointer hover:text-pink-600 transition-colors"
                        onClick={() => setLocation(`/product/${item.id}`)}
                      >
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs border-pink-200 text-pink-700 bg-pink-25">
                          {item.category}
                        </Badge>
                        <span className="text-lg font-bold text-pink-600">
                          ₹{item.price}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        data-testid={`button-remove-${item.id}`}
                        className="text-pink-500 hover:text-pink-700 hover:bg-pink-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      <div className="flex items-center gap-2 bg-pink-50 rounded-lg p-1 border border-pink-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, -1)}
                          data-testid={`button-decrease-${item.id}`}
                          className="hover:bg-pink-100"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span 
                          className="w-8 text-center font-semibold"
                          data-testid={`quantity-${item.id}`}
                        >
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, 1)}
                          data-testid={`button-increase-${item.id}`}
                          className="hover:bg-pink-100"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-lg text-pink-600">
                          ₹{(Number(item?.price || 0) * (item?.quantity || 0)).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 bg-white border border-pink-100 shadow-lg">
              <CardHeader className="bg-pink-25 border-b border-pink-100">
                <CardTitle className="text-gray-900">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {/* Coupon Section */}
                <div className="space-y-2 pb-4 border-b border-pink-100">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="w-4 h-4 text-pink-600" />
                    Have a coupon code?
                  </Label>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          if (couponError) clearCouponError();
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        className="border-pink-200 focus:border-pink-400"
                        disabled={isApplyingCoupon}
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        className="bg-pink-600 hover:bg-pink-700"
                      >
                        {isApplyingCoupon ? "Applying..." : "Apply"}
                      </Button>
                    </div>
                  ) : (
                    <Alert className="bg-green-50 border-green-200">
                      <Tag className="h-4 w-4 text-green-600" />
                      <AlertDescription className="flex items-center justify-between ml-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-green-800">
                            {appliedCoupon.code}
                          </span>
                          {appliedCoupon.description && (
                            <span className="text-xs text-green-700">
                              {appliedCoupon.description}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveCoupon}
                          className="h-6 w-6 p-0 hover:bg-green-100"
                        >
                          <X className="h-4 w-4 text-green-600" />
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                  {couponError && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="ml-2">{couponError}</AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  {appliedCoupon && discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Delivery</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="border-t border-pink-100 pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span data-testid="cart-total" className="text-pink-600">
                        ₹{(totalPrice - discountAmount).toLocaleString('en-IN')}
                      </span>
                    </div>
                    {appliedCoupon && discountAmount > 0 && (
                      <div className="text-xs text-green-600 text-right mt-1">
                        You save ₹{discountAmount.toLocaleString('en-IN')}!
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium"
                  size="lg"
                  onClick={handleCheckout}
                  data-testid="button-checkout"
                >
                  Proceed to Checkout
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-pink-200 text-pink-700 hover:bg-pink-50 hover:border-pink-300"
                  onClick={() => setLocation("/shop")}
                  data-testid="button-continue-shopping"
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}