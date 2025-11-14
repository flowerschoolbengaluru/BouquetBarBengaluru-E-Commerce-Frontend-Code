import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { ChevronDown, ChevronUp, Grid3X3, List, Search, SortAsc } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Category structure - same as FlowerCategory.tsx
interface SubCategoryGroup {
  title: string;
  items: string[];
}

interface Category {
  id: string;
  name: string;
  groups: SubCategoryGroup[];
}

const allCategories: Category[] = [
  {
    id: "occasion",
    name: "Occasion",
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

const MainCategoryAllProducts: React.FC = () => {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/category/:categoryId');
  
  // Get category ID from URL params
  const categoryId = params?.categoryId || '';
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'name' | 'featured'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Find current category data
  const currentCategory = allCategories.find(cat => cat.id === categoryId);
  
  // Get all subcategories for this main category
  const allSubcategories = currentCategory?.groups.flatMap(group => group.items) || [];
  

  
  // Fetch products query
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['main-category-products', categoryId, searchTerm],
    queryFn: async () => {
      // Use the new API endpoint
      const payload = {
        category: categoryId,
        subcategory: null,
        search: searchTerm.trim() || undefined
      };
      
      console.log('Fetching products with payload:', payload);
      const response = await apiRequest('/api/products/subcategorymaincategory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      return data || [];
    },
    enabled: !!categoryId && !!currentCategory
  });



  // Sort products
  const sortedProducts = React.useMemo(() => {
    if (!products) return [];
    
    const sorted = [...products].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'featured':
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });
    
    return sorted;
  }, [products, sortBy]);

  // Product card component
  const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const hasDiscount = product.discounts_offers && product.discountPrice && parseFloat(product.discountPrice) < parseFloat(product.price);
    const discountPercentage = hasDiscount 
      ? Math.round(((parseFloat(product.price) - parseFloat(product.discountPrice!)) / parseFloat(product.price)) * 100)
      : 0;

    const handleProductClick = () => {
      setLocation(`/product/${product.id}`);
    };

    return (
      <Card 
        className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
        onClick={handleProductClick}
      >
        <div className="relative">
          <img
            src={product.image || (product.images && product.images[0]) || '/placeholder-flower.jpg'}
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

  if (!currentCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h2>
          <button
            onClick={() => setLocation('/')}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{currentCategory.name}</h1>
              <p className="text-gray-600 mt-1">
                {products?.length || 0} products available
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 w-64"
                />
              </div>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="featured">Featured</option>
                <option value="name">Name A-Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              
              {/* View Mode */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">Failed to load products</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No products found in this category</p>
                <button
                  onClick={() => setLocation('/')}
                  className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Go Back Home
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
};

export default MainCategoryAllProducts;