import { useRoute, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useCart } from "@/hooks/cart-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Heart, Share2, ShoppingCart, Star, Truck, Shield, RotateCcw, X, Upload, MessageSquare, ZoomIn, ZoomOut } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Product as BaseProduct } from "@shared/schema";

type ProductWithCustom = BaseProduct & {
  iscustom?: boolean;
  isCustom?: boolean;
  originalPrice?: string | number;
  discountPercentage?: number;
  discountAmount?: string | number;
};
import ShopNav from './ShopNav';
import Footer from '@/components/footer';
import { useState, useEffect, useRef } from "react";

// Custom Option Popup Component
function CustomOptionPopup({ isOpen, onClose, productName, productId, user }: { 
  isOpen: boolean; 
  onClose: () => void;
  productName: string;
  productId: string;
  user?: any;
}) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [customText, setCustomText] = useState("");
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      setSelectedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!customText.trim()) {
      toast({
        title: "Text required",
        description: "Please provide your custom text or instructions.",
        variant: "destructive",
      });
      return;
    }

    // Convert images to base64 array
    const imagePromises = selectedImages.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    let imagesBase64: string[] = [];
    try {
      imagesBase64 = await Promise.all(imagePromises);
    } catch (err) {
      toast({ title: "Image Error", description: "Failed to process images.", variant: "destructive" });
      return;
    }

    // Send to backend
    try {
      console.log('Sending custom request...');
      const response = await apiRequest('/api/admin/custom-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          images: JSON.stringify(imagesBase64), 
          comment: customText, 
          product_id: productId,
          user_name: user ? `${user.firstname || ''} ${user.lastname || ''}`.trim() : '',
          user_email: user?.email || '',
          user_phone: user?.phone || ''
        })
      });
      
      console.log('Request successful, showing toast...');
      
      // Show toast notification on right side
      toast({
        title: "🌸 Request Submitted Successfully!",
        description: "Thank you! Your customization request has been received. Our team will review your requirements and call you back within 24 hours with a personalized quote.",
      });
      console.log('Toast shown, clearing form...');
      setSelectedImages([]);
      setCustomText("");
      onClose();
    } catch (err) {
      console.error('Request failed:', err);
      toast({ title: "Error", description: "Failed to submit custom request.", variant: "destructive" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end z-50 p-2 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg max-w-sm w-full max-h-[70vh] overflow-y-auto mt-16 shadow-xl p-4 animate-in slide-in-from-right-8 duration-500 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 animate-in fade-in delay-100 duration-500">
            Customize {productName}
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="hover:bg-pink-100 transition-all duration-200 hover:scale-110"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image Upload Section */}
          <div className="animate-in fade-in delay-150 duration-500">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Upload Reference Images
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-white transition-all duration-300 hover:border-pink-400 hover:bg-pink-50">
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2 transition-transform duration-300 group-hover:scale-110" />
              <p className="text-sm text-gray-600 mb-3">
                Drag & drop images or click to browse
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="custom-image-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('custom-image-upload')?.click()}
                className="border-pink-300 text-pink-700 hover:bg-pink-50 transition-all duration-200 hover:scale-105"
              >
                Choose Files
              </Button>
            </div>

            {/* Preview Images */}
            {selectedImages.length > 0 && (
              <div className="mt-4 animate-in fade-in duration-500">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Selected Images ({selectedImages.length})
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {selectedImages.map((file, index) => (
                    <div 
                      key={index} 
                      className="relative group animate-in fade-in duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded border transition-transform duration-300 group-hover:scale-105"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Custom Text Section */}
          <div className="animate-in fade-in delay-200 duration-500">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Your Custom Requirements
            </label>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Describe exactly what you want...&#10;• Specific flowers&#10;• Color preferences&#10;• Arrangement style&#10;• Special occasions&#10;• Any other requirements"
              className="w-full h-32 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white transition-all duration-300 hover:border-pink-300 focus:scale-[1.02]"
              rows={4}
            />
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-in fade-in delay-250 duration-500 transition-all duration-300 hover:shadow-md">
            <p className="text-sm text-blue-700">
              💡 <strong>Pro tip:</strong> Be as detailed as possible! Include colors, flower types, 
              arrangement size, occasion, and any specific requirements. Our florists will review 
              your request and get back to you with a custom quote within 24 hours.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-white rounded-b-lg animate-in fade-in delay-300 duration-500">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 border-gray-300 transition-all duration-200 hover:scale-105 hover:border-pink-300"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Submit Request
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const productId = params?.id;
  const [location, setLocation] = useLocation();
  
  const { data: product, isLoading, error } = useQuery<ProductWithCustom>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });
  
  const { data: allProducts } = useQuery<ProductWithCustom[]>({
    queryKey: ["/api/products"],
  });
  
  const cart = useCart();
  const { toast } = useToast();

  // Fix the selectedImage initialization
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCustomPopupOpen, setIsCustomPopupOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if user is authenticated
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Check if product is favorited
  const { data: favoriteStatus } = useQuery<{ isFavorited: boolean }>({
    queryKey: ["/api/favorites", productId, "status"],
    queryFn: async () => {
      const response = await apiRequest(`/api/favorites/${productId}/status`);
      return response.json();
    },
    enabled: !!user && !!productId,
  });

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/favorites", {
        method: "POST",
        body: JSON.stringify({ productId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", productId, "status"] });
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

  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/favorites/${productId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", productId, "status"] });
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

  // Initialize selectedImage when product loads
  useEffect(() => {
    if (product?.image) {
      setSelectedImage(product.image);
      setImageLoaded(false); // Reset image loaded state for new product
    }
  }, [product?.id, product?.image]); // Add product.id as dependency to reset when product changes

  // Zoom functionality handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const openZoomModal = () => {
    setIsZoomModalOpen(true);
  };

  const closeZoomModal = () => {
    setIsZoomModalOpen(false);
  };

  if (!match || !productId) {
    return <div>Product not found</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-in fade-in duration-500">
          <div className="animate-spin rounded-full h-12 w-12 mx-auto mb-4"></div>
          <p className="text-gray-600 animate-pulse">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center animate-in fade-in duration-500">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link href="/shop">
            <Button className="transition-all duration-300 hover:scale-105">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Enhanced related products algorithm
  const getRelatedProducts = () => {
    if (!allProducts || allProducts.length === 0) return [];
    
    const currentPrice = Number(product.price);
    const priceRange = currentPrice * 0.3; // 30% price tolerance
    
    // Score products based on multiple factors
    const scoredProducts = allProducts
      .filter(p => p.id !== product.id && p.inStock) // Exclude current product and out-of-stock items
      .map(p => {
        let score = 0;
        const productPrice = Number(p.price);
        
        // Factor 1: Same category (highest priority) - 100 points
        if (p.category === product.category) {
          score += 100;
        }
        
        // Factor 2: Similar price range - up to 50 points
        const priceDiff = Math.abs(productPrice - currentPrice);
        if (priceDiff <= priceRange) {
          score += 50 - (priceDiff / priceRange) * 25; // Closer price = higher score
        }
        
        // Factor 3: Featured products get bonus - 25 points
        if (p.featured) {
          score += 25;
        }
        
        // Factor 4: Price tier similarity - 20 points
        const currentTier = Number(currentPrice) < 1000 ? 'budget' : Number(currentPrice) < 3000 ? 'mid' : 'premium';
        const productTier = Number(productPrice) < 1000 ? 'budget' : Number(productPrice) < 3000 ? 'mid' : 'premium';
        if (currentTier === productTier) {
          score += 20;
        }
        
        // Factor 5: Alphabetical tiebreaker - small score based on name similarity
        const nameSimilarity = product.name.toLowerCase().split(' ').some(word => 
          p.name.toLowerCase().includes(word) || (p.description?.toLowerCase() || '').includes(word)
        );
        if (nameSimilarity) {
          score += 10;
        }
        
        return { product: p, score };
      })
      .sort((a, b) => {
        // Primary sort by score (descending)
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        // Secondary sort by price (ascending) for tiebreaker
        return Number(a.product.price) - Number(b.product.price);
      })
      .slice(0, 8) // Get top 8 candidates
      .map(item => item.product);

    // If we don't have enough same-category products, fill with other categories
    if (scoredProducts.length < 4) {
      const additionalProducts = allProducts
        .filter(p => 
          p.id !== product.id && 
          p.inStock && 
          !scoredProducts.find(sp => sp.id === p.id) // Not already included
        )
        .sort((a, b) => {
          // Prefer featured products
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          // Then sort by price similarity
          const aPriceDiff = Math.abs(Number(a.price) - Number(currentPrice));
          const bPriceDiff = Math.abs(Number(b.price) - Number(currentPrice));
          return aPriceDiff - bPriceDiff;
        })
        .slice(0, 4 - scoredProducts.length);
      
      scoredProducts.push(...additionalProducts);
    }
    
    return scoredProducts.slice(0, 4); // Return max 4 products
  };

  const relatedProducts = getRelatedProducts();

  const isInCart = cart.isInCart(product.id);
  const quantity = cart.getItemQuantity(product.id);

  const handleAddToCart = () => {
    cart.addToCart(product, 1);
  };

  const handleSaveForLater = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save products to your favorites.",
        variant: "destructive",
      });
      return;
    }

    const isFavorited = favoriteStatus?.isFavorited;
    
    if (isFavorited) {
      removeFromFavoritesMutation.mutate();
    } else {
      addToFavoritesMutation.mutate();
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = product.name;
    const text = `Check out this beautiful ${product.name} - ${product.description?.slice(0, 100) || ''}...`;

    // Try Web Share API first (mobile/modern browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        toast({
          title: "Shared successfully",
          description: "Product shared via device sharing options.",
        });
      } catch (error) {
        // User cancelled sharing, don't show error
        console.log("Share cancelled");
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied",
          description: "Product link copied to clipboard.",
        });
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast({
          title: "Link copied",
          description: "Product link copied to clipboard.",
        });
      }
    }
  };

  const features = [
    "Fresh, hand-picked flowers",
    "Premium quality guarantee", 
    "Expert floral arrangement",
    "Same-day delivery available",
    "Care instructions included",
    "Satisfaction guaranteed"
  ];

  return (
    <>
      <ShopNav />
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 animate-in fade-in slide-in-from-top-8 duration-500">
            <Link href="/shop" className="hover:text-pink-600 transition-colors duration-200">Shop</Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>

          <Button variant="ghost" asChild className="mb-6 transition-all duration-300 hover:scale-105">
            <Link href="/shop">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
            </Link>
          </Button>
        </div>

        {/* Product Details */}
        <div className="container mx-auto px-4 pb-12">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Images Section */}
            <div className="space-y-4 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="flex gap-4">
                {/* Thumbnail Gallery - Left Side (limit to 4 thumbnails) */}
                <div className="w-24 space-y-2">
                  {([
                    product.image,
                    product.imagefirst,
                    product.imagesecond,
                    product.imagethirder,
                    product.imagefoure,
                    product.imagefive
                  ].filter(Boolean) as string[]).slice(0, 4).map((image, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(image || null)}
                      onDoubleClick={() => { setSelectedImage(image || null); openZoomModal(); }}
                      title="Click to select; double-click to open zoom"
                      className={`w-full aspect-square rounded-lg overflow-hidden transition-all duration-300 ${
                        selectedImage === image ? 'ring-2 ring-pink-500 scale-105' : 'ring-1 ring-gray-200 hover:ring-pink-300'
                      } hover:scale-110`}
                    >
                      <img
                        src={`data:image/jpeg;base64,${image}`}
                        alt={`${product.name} view ${idx + 1}`}
                        className="w-full h-full object-cover transition-opacity duration-300 hover:opacity-80"
                        onLoad={() => setImageLoaded(true)}
                      />
                    </button>
                  ))}
                </div>

                {/* Main Image - Right Side - WITH ZOOM */}
                <div className="flex-1 relative">
                  <div 
                    ref={containerRef}
                    className="aspect-square rounded-lg overflow-hidden bg-white shadow-lg transition-all duration-500 hover:shadow-xl cursor-zoom-in relative"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={openZoomModal}
                  >
                    <img
                      ref={imageRef}
                      src={`data:image/jpeg;base64,${selectedImage || product.image}`}
                      alt={product.name}
                      className={`w-full h-full object-cover transition-all duration-700 ${
                        imageLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
                      } ${isZoomed ? 'scale-150' : 'scale-100'}`}
                      style={isZoomed ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      } : {}}
                      data-testid="img-product-main"
                      onLoad={() => setImageLoaded(true)}
                    />
                    
                    {/* Zoom indicator */}
                    <div className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <ZoomIn className="w-4 h-4" />
                    </div>

                    {/* Magnifying glass effect */}
                    {isZoomed && (
                      <div 
                        className="absolute w-32 h-32 border-2 border-white shadow-lg rounded-full pointer-events-none bg-white/20 backdrop-blur-sm"
                        style={{
                          left: `${zoomPosition.x}%`,
                          top: `${zoomPosition.y}%`,
                          transform: 'translate(-50%, -50%)',
                          background: `url(data:image/jpeg;base64,${selectedImage || product.image})`,
                          backgroundSize: '300%',
                          backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Click to zoom text */}
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Hover to zoom • Click for full view
                  </p>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="animate-in fade-in duration-500 delay-100">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs transition-all duration-300 hover:scale-105">
                    {/* {(product.category || '').charAt(0).toUpperCase() + (product.category || '').slice(1)} */}
                  </Badge>
                  {product.featured && (
                    <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs transition-all duration-300 hover:scale-105 hover:shadow-lg">
                      Featured
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 transition-all duration-300 hover:text-pink-700" data-testid="text-product-name">
                    {product.name}
                  </h1>
                  {((product as any).isBestSeller || (product as any).isbestseller) && (
                    <Badge className="bg-pink-100 text-pink-800 border border-pink-200 text-xs">
                      Best Seller
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400 transition-transform duration-300 hover:scale-125" />
                    ))}
                    <span className="text-sm text-gray-600 ml-2 transition-colors duration-300 hover:text-gray-900">(127 reviews)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                      {/* Show original price only if it exists and is different from current price */}
                      {(product.originalprice || product.originalPrice) && 
                       parseFloat(String(product.originalprice || product.originalPrice)) !== parseFloat(String(product.price)) && (
                        <span className="text-gray-500 line-through text-sm">₹{product.originalprice || product.originalPrice}</span>
                      )}
                      <span className="font-semibold text-gray-900 text-lg">₹{product.price || 0}</span>
                      {/* Show discount badge only if discount percentage exists and is greater than 0 */}
                      {(product.discount_percentage || product.discountPercentage) && 
                       Number(product.discount_percentage || product.discountPercentage) > 0 && (
                        <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs font-semibold">
                          {product.discount_percentage || product.discountPercentage}% OFF
                        </span>
                      )}
                    </div>
              </div>

              <Separator className="transition-all duration-500 animate-in fade-in" />

              {/* Minimal Custom Option UI */}
              {((product as ProductWithCustom).iscustom || (product as ProductWithCustom).isCustom) && (
                <div className="mb-6 animate-in fade-in duration-500 delay-200">
                  <button
                    onClick={() => {
                      if (user) {
                        setIsCustomPopupOpen(true);
                      } else {
                        const currentPath = window.location.pathname + window.location.search;
                        setLocation(`/signin?redirect=${encodeURIComponent(currentPath)}`);
                      }
                    }}
                    className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:border-pink-400 hover:bg-pink-50 transition-all duration-300 group hover:scale-[1.02] hover:shadow-md"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-pink-600 transition-transform duration-300 group-hover:scale-110" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-pink-700 transition-colors duration-300">
                        Customize this product
                      </span>
                    </div>
                    <span className="text-xs text-pink-600 bg-pink-100 px-2 py-1 rounded transition-all duration-300 group-hover:scale-110 group-hover:bg-pink-200">
                      Click here
                    </span>
                  </button>
                </div>
              )}

              <div className="animate-in fade-in duration-500 delay-300">
                <h3 className="font-semibold text-gray-900 mb-3 transition-colors duration-300 hover:text-pink-700">Description</h3>
                <p className="text-gray-700 leading-relaxed transition-all duration-300 hover:text-gray-900" data-testid="text-product-description">
                  {product.description}
                </p>
              </div>

              <Separator className="transition-all duration-500 animate-in fade-in delay-400" />

              {/* Features */}
              <div className="animate-in fade-in duration-500 delay-500">
                <h3 className="font-semibold text-gray-900 mb-3 transition-colors duration-300 hover:text-pink-700">What's Included</h3>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li 
                      key={index} 
                      className="flex items-center gap-2 text-sm text-gray-700 transition-all duration-300 hover:translate-x-2 hover:text-gray-900"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-1.5 h-1.5 bg-pink-500 rounded-full transition-transform duration-300 hover:scale-150"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator className="transition-all duration-500 animate-in fade-in delay-600" />

              {/* Actions */}
              <div className="space-y-4 animate-in fade-in duration-500 delay-700">
                {isInCart && quantity > 0 ? (
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cart.updateQuantity(product.id, quantity - 1)}
                      className="transition-all duration-200 hover:scale-110 hover:bg-red-50 hover:border-red-300"
                      data-testid="button-decrease-quantity"
                    >
                      -
                    </Button>
                    <span className="font-medium transition-all duration-300 hover:scale-110" data-testid="text-quantity">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cart.updateQuantity(product.id, quantity + 1)}
                      className="transition-all duration-200 hover:scale-110 hover:bg-green-50 hover:border-green-300"
                      data-testid="button-increase-quantity"
                    >
                      +
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => cart.removeFromCart(product.id)}
                      className="transition-all duration-200 hover:scale-105 hover:shadow-lg"
                      data-testid="button-remove-from-cart"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all duration-500 hover:scale-105 hover:shadow-xl transform-gpu"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    data-testid="button-add-to-cart"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                    {product.inStock ? "Add to Cart" : "Out of Stock"}
                  </Button>
                )}

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 transition-all duration-300 hover:scale-105 hover:bg-pink-50 hover:border-pink-300 hover:shadow-md" 
                    onClick={handleSaveForLater}
                    disabled={addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
                    data-testid="button-save-for-later"
                  >
                    <Heart 
                      className={`w-4 h-4 mr-2 transition-all duration-300 ${
                        favoriteStatus?.isFavorited ? 'fill-pink-500 text-pink-500 scale-110' : 'hover:scale-110'
                      }`} 
                    />
                    {favoriteStatus?.isFavorited ? 'Saved' : 'Save for Later'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 transition-all duration-300 hover:scale-105 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md" 
                    onClick={handleShare}
                    data-testid="button-share"
                  >
                    <Share2 className="w-4 h-4 mr-2 transition-transform duration-300 hover:scale-110" />
                    Share
                  </Button>
                </div>
              </div>

              <Separator className="transition-all duration-500 animate-in fade-in delay-800" />

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 text-center animate-in fade-in duration-500 delay-900">
                {[
                  { icon: Truck, color: "text-green-600", text: "Free Delivery" },
                  { icon: Shield, color: "text-blue-600", text: "Quality Assured" },
                  { icon: RotateCcw, color: "text-purple-600", text: "Easy Returns" }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-500 hover:scale-110 hover:bg-white hover:shadow-lg"
                  >
                    <item.icon className={`w-6 h-6 ${item.color} transition-transform duration-300 hover:scale-125`} />
                    <span className="text-xs text-gray-600 transition-colors duration-300 hover:text-gray-900">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="container mx-auto px-4 pb-16">
              <div className="mt-16 animate-in fade-in duration-1000">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 transition-all duration-500 hover:scale-105 hover:text-pink-700">
                  You Might Also Like
                </h2>
                <div className="grid grid-cols-5 gap-4">
                  {relatedProducts.slice(0, 5).map((relatedProduct, index) => (
                    <Card 
                      key={relatedProduct.id} 
                      className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 animate-in fade-in"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <Link href={`/product/${relatedProduct.id}`}>
                        <CardContent className="p-0">
                          <div className="aspect-square overflow-hidden rounded-t-lg">
                            <img
                              src={`data:image/jpeg;base64,${relatedProduct.image}`}
                              alt={relatedProduct.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              loading="lazy"
                            />
                          </div>
                          <div className="p-3 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-pink-50 group-hover:to-purple-50">
                            <h3 className="font-medium text-sm text-gray-900 line-clamp-2 min-h-[2.5rem] transition-colors duration-300 group-hover:text-pink-700">
                              {relatedProduct.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {/* Original price (muted, struck-through) - only show if exists and different from current price */}
                              {(relatedProduct as any).originalPrice ?? (relatedProduct as any).originalprice ? (
                                <span className="text-gray-500 line-through text-sm">₹{parseFloat(String((relatedProduct as any).originalPrice ?? (relatedProduct as any).originalprice)).toLocaleString()}</span>
                              ) : null}

                              {/* Current / selling price (prominent) */}
                              <span className="text-sm font-bold text-pink-600">₹{Number(relatedProduct.price).toLocaleString()}</span>

                              {/* Discount badge (green) - only show if discount exists */}
                              {((relatedProduct as any).discountPercentage ?? (relatedProduct as any).discount_percentage) > 0 && (
                                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-semibold">{(relatedProduct as any).discountPercentage ?? (relatedProduct as any).discount_percentage}% OFF</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Zoom Modal */}
      {isZoomModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={closeZoomModal}
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </Button>
            
            {/* Zoomed image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={`data:image/jpeg;base64,${selectedImage || product.image}`}
                alt={product.name}
                className="max-w-full max-h-full object-contain cursor-zoom-out"
                onClick={closeZoomModal}
              />
            </div>
            
            {/* Image navigation - show up to 4 thumbnails in modal as well */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg backdrop-blur-sm">
              {([
                product.image,
                product.imagefirst,
                product.imagesecond,
                product.imagethirder,
                product.imagefoure,
                product.imagefive
              ].filter(Boolean) as string[]).slice(0, 4).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image || null)}
                  className={`w-12 h-12 rounded overflow-hidden transition-all duration-300 ${
                    selectedImage === image ? 'ring-2 ring-white scale-110' : 'ring-1 ring-gray-400 hover:ring-white'
                  }`}
                >
                  <img
                    src={`data:image/jpeg;base64,${image}`}
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            
            {/* Instructions */}
            <div className="absolute top-4 left-4 bg-black/50 text-white p-3 rounded-lg backdrop-blur-sm">
              <p className="text-sm">Click image or X to close</p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Option Popup */}
      <CustomOptionPopup
        isOpen={isCustomPopupOpen}
        onClose={() => setIsCustomPopupOpen(false)}
        productName={product.name}
        productId={product.id}
        user={user}
      />
    </>
  );
}
