import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Package, Truck, Clock, Download, Home, ShoppingBag, MapPin, Phone, Mail, Calendar, CreditCard, Tag } from 'lucide-react';
import { Link } from 'wouter';
import type { Order } from '@shared/schema';

export default function OrderConfirmation() {
  const [, params] = useRoute('/order-confirmation/:orderId');
  const orderId = params?.orderId;

  // Fetch order details
  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ['/api/orders', orderId],
    enabled: !!orderId,
  });

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(numPrice);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading order details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-4">
              We couldn't find the order details. Please check your order ID or contact support.
            </p>
            <Link href="/my-account">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Go to My Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-800 mb-2" data-testid="text-order-success">
              Order Placed Successfully!
            </h1>
            <p className="text-green-700 text-lg mb-4">
              Thank you for your order. We've received your request and will process it shortly.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-green-600">
              <span>Order Number: <strong>{order.ordernumber}</strong></span>
              <span>•</span>
              <span>Order ID: <strong>{order.id}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items && Array.isArray(order.items) ? (
                order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.productName || 'Product'}</h4>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(item.totalPrice)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No items found</p>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Charges</span>
                <span>{formatPrice(order.paymentCharges || 0)}</span>
              </div>
              {order.couponCode && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    Discount ({order.couponCode})
                  </span>
                  <span>-{formatPrice(order.discountAmount || 0)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delivery & Contact Information */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Delivery charges note */}
              <div>
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Delivery charges will vary depending on the porter or third-party delivery services.
                </p>
              </div>
              
              {order.deliveryDate && (
                <div>
                  <h4 className="font-medium mb-2">Requested Delivery Date</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(order.deliveryDate)}
                  </p>
                </div>
              )}
              
              {order.estimatedDeliveryDate && (
                <div>
                  <h4 className="font-medium mb-2">Estimated Delivery</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatDate(order.estimatedDeliveryDate)}
                  </p>
                </div>
              )}

              {(order.occasion || order.requirements) && (
                <div>
                  <h4 className="font-medium mb-2">Special Instructions</h4>
                  {order.occasion && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Occasion:</strong> {order.occasion}
                    </p>
                  )}
                  {order.requirements && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Requirements:</strong> {order.requirements}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Your Contact Details</h4>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {order.phone}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {order.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SMS/WhatsApp Confirmation Notice */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Confirmation Sent</h4>
                <p className="text-blue-700 text-sm">
                  We've sent order confirmation details to your mobile number <strong>{order.phone}</strong> via SMS and WhatsApp. 
                  You'll also receive updates about your order status.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Note */}
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Need help? Contact us at <strong>info@flowerschoolbengaluru.com</strong> or call <strong>+91 99728 03847</strong>
            </p>
          </CardContent>
        </Card>
               {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Link href="/shop">
            <Button variant="outline" data-testid="button-continue-shopping">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
          <Link href="/my-account">
            <Button data-testid="button-track-order">
              <Package className="w-4 h-4 mr-2" />
               Your Orders History
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}