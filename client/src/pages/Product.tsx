import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { type Product } from "@shared/schema";
import { getImageUrl } from "../lib/imageUtils";

interface ProductProps {
  product: Product;
  isProductFavorited: (productId: string) => boolean;
  handleToggleFavorite: (productId: string, e: React.MouseEvent) => void;
  handleAddToCart: (product: Product) => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  addToFavoritesMutation: any;
  removeFromFavoritesMutation: any;
}

export default function ProductComponent({
  product,
  isProductFavorited,
  handleToggleFavorite,
  handleAddToCart,
  isInCart,
  getItemQuantity,
  addToFavoritesMutation,
  removeFromFavoritesMutation
}: ProductProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  return (
    <Card key={product.id} className="overflow-hidden hover-elevate" data-testid={`card-product-${product.id}`}>
      <div className="relative">
        <img 
          src={getImageUrl(product.image || product.imagePath)}
          alt={product.name}
          className="w-full h-64 object-cover cursor-pointer"
          onClick={() => setLocation(`/product/${product.id}`)}
          loading="lazy"
        />
        <button 
          className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover-elevate"
          onClick={(e) => handleToggleFavorite(product.id, e)}
          disabled={addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
          data-testid={`button-favorite-${product.id}`}
        >
          <Heart 
            className={`w-4 h-4 ${isProductFavorited(product.id) 
              ? 'fill-pink-500 text-pink-500' 
              : 'text-gray-600'
            }`} 
          />
        </button>
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary" className="bg-white text-black">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 
          className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-pink-600 transition-colors"
          onClick={() => setLocation(`/product/${product.id}`)}
        >
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-primary">₹{product.price}</span>
          <Badge variant="outline" className="text-xs">
            {product.category}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 flex-1">
            <Button 
              size="sm"
              variant="outline"
              className="flex-1"
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
              disabled={!product.inStock}
              className="flex-1"
              data-testid={`button-add-cart-${product.id}`}
            >
              {isInCart(product.id) ? 
                `+${getItemQuantity(product.id)}` : 
                (product.inStock ? 'Add to Cart' : 'Out of Stock')
              }
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}