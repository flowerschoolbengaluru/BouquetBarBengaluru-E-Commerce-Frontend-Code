import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import ShopNav from './ShopNav';
import Footer from '@/components/footer';
import { ChevronDown, ChevronUp, Filter, X, Search, ShoppingCart } from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";
import { useCart } from '@/hooks/cart-context';
import { useToast } from '@/hooks/use-toast';
 
interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  discountPercentage?: number;
  discountAmount?: number;
  category: string;
  subcategory: string;
  image: string;
  imagefirst?: string;
  imagesecond?: string;
  imagethirder?: string;
  imagefoure?: string;
  imagefive?: string;
  inStock: boolean;
  featured: boolean;
  stockquantity: number;
  colour?: string;
  discounts_offers?: boolean;
  isActive: boolean;
  isbestseller?: boolean;
  isBestSeller?: boolean;
}
 
interface FilterState {
priceRanges: [number, number][];
  flowerTypes: string[];
  arrangements: string[];
  occasions: string[];
  colors: string[];
  inStock: boolean;
  featured: boolean;
  bestSeller: boolean;
}

export default function ProductsListing() {
  const [location, setLocation] = useLocation();
  
  // Use React state to track URL parameters and force re-renders
  const [urlParams, setUrlParams] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return {
      main_category: searchParams.get('main_category'),
      subcategory: searchParams.get('subcategory'),
      search: searchParams.get('search'),
    };
  });

  // Listen for URL changes and custom navigation events to update state
  useEffect(() => {
    const handleUrlChange = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const newParams = {
        main_category: searchParams.get('main_category'),
        subcategory: searchParams.get('subcategory'),
        search: searchParams.get('search'),
      };
      console.log('🔄 URL changed, updating params:', newParams);
      setUrlParams(newParams);
    };

    // Listen for browser navigation
    window.addEventListener('popstate', handleUrlChange);
    // Listen for custom navigation event from ShopNav
    window.addEventListener('locationchange', handleUrlChange);

    // Also check URL on mount and when location changes
    handleUrlChange();

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('locationchange', handleUrlChange);
    };
  }, [location]);

  // Mobile filter drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Local search state
  const [localSearchTerm, setLocalSearchTerm] = useState(urlParams.search || '');
 
 const [filters, setFilters] = useState<FilterState>({
  priceRanges: [],
    flowerTypes: [],
    arrangements: [],
    occasions: [],
    colors: [],
    inStock: false,
    featured: false,
    bestSeller: false
  });
 
  const cart = useCart();
  const { toast } = useToast();

  const [filterConfigs, setFilterConfigs] = useState({
    priceRanges: [
      { label: '500 to 999', value: [500, 999] as [number, number] },
      { label: '1000 to 1499', value: [1000, 1499] as [number, number] },
      { label: '1500 to 2999', value: [1500, 2999] as [number, number] },
      { label: '3000 and Above', value: [3000, 10000] as [number, number] }
    ] as PriceRange[],
    flowerTypes: [
      { label: 'Roses', count: 0 },
      { label: 'Lilies', count: 0 },
      { label: 'Tulips', count: 0 },
      { label: 'Orchids', count: 0 },
      { label: 'Carnations', count: 0 },
      { label: 'Mixed Flowers', count: 0 }
    ],
    arrangements: [
      { label: 'Bouquets', count: 0 },
      { label: 'Vase Arrangements', count: 0 },
      { label: 'Flower Box', count: 0 },
      { label: 'Basket Arrangements', count: 0 }
    ],
    colors: [
      { label: 'Red', count: 0 },
      { label: 'Pink', count: 0 },
      { label: 'White', count: 0 },
      { label: 'Yellow', count: 0 },
      { label: 'Purple', count: 0 },
      { label: 'Mixed', count: 0 }
    ]
  });

  const [openSections, setOpenSections] = useState({
    price: true,
    flowerTypes: true,
    occasions: true,
    arrangements: true,
    colors: true,
    additional: true
  });

  // Reset filters when category changes
  useEffect(() => {
    setFilters({
     priceRanges: [],
      flowerTypes: [],
      arrangements: [],
      occasions: [],
      colors: [],
      inStock: false,
      featured: false,
      bestSeller: false
    });
  }, [urlParams.main_category, urlParams.subcategory]);

  // FIXED: Query with proper URL parameter tracking
  const { data: products, isLoading, refetch, error } = useQuery<Product[]>({
    queryKey: [
      'products',
      urlParams.main_category, 
      urlParams.subcategory,
      urlParams.search,
      // Stringify filters to ensure proper dependency tracking
      JSON.stringify(filters)
    ],
    queryFn: async () => {
      console.log('🔍 Fetching products with URL params:', urlParams);
      console.log('🔍 Active filters:', filters);

      // Build API URL based on URL parameters
      const apiParams = new URLSearchParams();
      
      // Add category/search parameters - these are the main drivers
      if (urlParams.main_category) apiParams.append('main_category', urlParams.main_category);
      if (urlParams.subcategory) apiParams.append('subcategory', urlParams.subcategory);
      if (urlParams.search) apiParams.append('search', urlParams.search);
      
      // Add filter parameters
      if (filters.inStock) apiParams.append('inStock', 'true');
      if (filters.featured) apiParams.append('featured', 'true');
      if (filters.bestSeller) apiParams.append('bestSeller', 'true');
     if (filters.priceRanges.length > 0) {
  filters.priceRanges.forEach(([min, max]) => {
    apiParams.append('minPrice', min.toString());
    apiParams.append('maxPrice', max.toString());
  });
}
      if (filters.colors.length) apiParams.append('colors', filters.colors.join(','));
      if (filters.flowerTypes.length) apiParams.append('flowerTypes', filters.flowerTypes.join(','));
      if (filters.arrangements.length) apiParams.append('arrangements', filters.arrangements.join(','));

      const queryString = apiParams.toString();
      const apiUrl = `/api/products${queryString ? `?${queryString}` : ''}`;
      
      console.log('📡 Making API call to:', apiUrl);

      try {
        const res = await apiRequest(apiUrl);
        
        if (!res.ok) {
          throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log('✅ Products received:', data.length);
        
        // Normalize product data for client-side filtering
        const normalizedProducts = Array.isArray(data) ? data : [];
        
        normalizedProducts.forEach((p: any) => {
          let cats: string[] = [];
          try {
            if (typeof p.category === 'string') {
              const s = p.category.trim();
              if (s.startsWith('[') && s.endsWith(']')) {
                const parsed = JSON.parse(s);
                if (Array.isArray(parsed)) cats = parsed.map((c: any) => String(c).toLowerCase().trim());
              } else if (s.includes(',')) {
                cats = s.split(',').map((c: string) => c.replace(/["\[\]]/g, '').toLowerCase().trim());
              } else {
                cats = [s.replace(/["\[\]]/g, '').toLowerCase().trim()];
              }
            } else if (Array.isArray(p.category)) {
              cats = p.category.map((c: any) => String(c).toLowerCase().trim());
            }
          } catch (e) {
            cats = String(p.category || '').replace(/["\[\]]/g, '').split(',').map((c: string) => c.toLowerCase().trim()).filter(Boolean);
          }

          (p as any)._normalizedCategories = cats;
          (p as any)._nc = cats.join(' ');
          (p as any)._normalizedSubcategory = p.subcategory ? String(p.subcategory).toLowerCase().trim() : '';
          (p as any)._normalizedName = p.name ? String(p.name).toLowerCase() : '';
          (p as any)._normalizedDescription = p.description ? String(p.description).toLowerCase() : '';
        });

        return normalizedProducts;
      } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: true, // Ensure query is always enabled
  });

  // Debug query changes
  useEffect(() => {
    console.log('🔄 Query key changed, should refetch. Current params:', urlParams);
  }, [urlParams.main_category, urlParams.subcategory, urlParams.search]);

  // Debug when products load
  useEffect(() => {
    if (products) {
      console.log('📦 Products loaded:', products.length);
    }
  }, [products]);

  // Debug errors
  useEffect(() => {
    if (error) {
      console.error('❌ Query error:', error);
    }
  }, [error]);
 
  // Handle navigation to specific category/subcategory
  const navigateToCategory = (main_category: string, subcategory?: string) => {
    const newParams = new URLSearchParams();
    newParams.set('main_category', main_category);
    if (subcategory) {
      newParams.set('subcategory', subcategory);
    }
   
    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    window.history.pushState({}, '', newUrl);
   
    // Update URL params to trigger refetch
    setUrlParams({
      main_category,
      subcategory: subcategory || null,
      search: null
    });
   
    // Close mobile filter drawer
    setIsFilterOpen(false);
  };
 
  interface PriceRange {
    label: string;
    value: [number, number];
  }
 
  useEffect(() => {
    if (products) {
      const newFilterConfigs = { ...filterConfigs };
 
      // Reset all counts first
      newFilterConfigs.flowerTypes.forEach(type => type.count = 0);
      newFilterConfigs.arrangements.forEach(arr => arr.count = 0);
      newFilterConfigs.colors.forEach(color => color.count = 0);
 
      // Count products (use normalized helpers when available)
      products.forEach(product => {
        newFilterConfigs.flowerTypes.forEach(type => {
          const t = type.label.toLowerCase();
          if (((product as any)._nc && (product as any)._nc.includes(t)) || ((product as any)._normalizedName && (product as any)._normalizedName.includes(t))) {
            type.count++;
          }
        });

        newFilterConfigs.arrangements.forEach(arr => {
          const a = arr.label.toLowerCase();
          if (((product as any)._normalizedSubcategory && (product as any)._normalizedSubcategory.includes(a)) || ((product as any)._nc && (product as any)._nc.includes(a))) {
            arr.count++;
          }
        });

        newFilterConfigs.colors.forEach(color => {
          if ((product.colour && product.colour.toLowerCase() === color.label.toLowerCase())) {
            color.count++;
          }
        });
      });
 
      setFilterConfigs(newFilterConfigs);
    }
  }, [products]);
 
  const resetFilters = () => {
    setFilters({
   priceRanges: [],
      flowerTypes: [],
      arrangements: [],
      occasions: [],
      colors: [],
      inStock: false,
      featured: false,
      bestSeller: false
    });
   
    // Also clear URL parameters and navigate to all products
    const newUrl = window.location.pathname;
    window.history.pushState({}, '', newUrl);
    setUrlParams({
      main_category: null,
      subcategory: null,
      search: null
    });
  };
 
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Force refetch when URL parameters change (additional safety)
  useEffect(() => {
    if (urlParams.main_category || urlParams.subcategory || urlParams.search) {
      console.log('🔄 URL params changed, triggering refetch');
      refetch();
    }
  }, [urlParams.main_category, urlParams.subcategory, urlParams.search, refetch]);
 
  // Filter component (reusable for both desktop and mobile)
  const FilterComponent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`bg-white rounded-lg shadow-sm p-4 space-y-4 ${isMobile ? 'h-full overflow-y-auto' : 'sticky top-4'}`}>
      {/* Mobile header */}
      {isMobile && (
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={() => setIsFilterOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
 
      {/* Reset Filters */}
      <button
        onClick={resetFilters}
        className="w-full text-xs bg-pink-50 text-pink-600 hover:bg-pink-100 py-2 rounded-md transition-colors"
      >
        Reset Filters
      </button>
 
      {/* Price Filter */}
   <div>
  <button
    onClick={() => toggleSection('price')}
    className="w-full flex justify-between items-center text-sm font-semibold text-gray-900 mb-2 hover:text-pink-600"
  >
    Price Range
    {openSections.price ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )}
  </button>
  {openSections.price && (
    <div className="space-y-2 pt-2">
      {filterConfigs.priceRanges.map((range) => {
        const isChecked = filters.priceRanges.some(([min, max]) => min === range.value[0] && max === range.value[1]);
        return (
          <label key={range.label} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded">
            <Checkbox
              checked={isChecked}
              onCheckedChange={(checked) => {
                setFilters(prev => {
                  let newRanges = prev.priceRanges.slice();
                  if (checked) {
                    if (!newRanges.some(([min, max]) => min === range.value[0] && max === range.value[1])) {
                      newRanges.push(range.value as [number, number]);
                    }
                  } else {
                    newRanges = newRanges.filter(([min, max]) => !(min === range.value[0] && max === range.value[1]));
                  }
                  return { ...prev, priceRanges: newRanges };
                });
              }}
            />
            <span className="text-xs text-gray-600">₹{range.label}</span>
          </label>
        );
      })}
    </div>
  )}
</div>
 
      {/* Flower Types */}
      <div>
        <button
          onClick={() => toggleSection('flowerTypes')}
          className="w-full flex justify-between items-center text-sm font-semibold text-gray-900 mb-2 hover:text-pink-600"
        >
          Flower Types
          {openSections.flowerTypes ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {openSections.flowerTypes && (
          <div className="space-y-2 pt-2">
            {[
              { label: 'Roses', value: 'roses' },
              { label: 'Lilies', value: 'lilies' },
              { label: 'Tulips', value: 'tulips' },
              { label: 'Orchids', value: 'orchids' },
              { label: 'Carnations', value: 'carnations' },
            ].map((type) => (
              <label key={type.label} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded">
                <Checkbox
                  checked={filters.flowerTypes.includes(type.value)}
                  onCheckedChange={(checked) => {
                    setFilters(prev => ({
                      ...prev,
                      flowerTypes: checked
                        ? [...prev.flowerTypes, type.value]
                        : prev.flowerTypes.filter(t => t !== type.value)
                    }));
                  }}
                />
                <span className="text-xs text-gray-600">
                  {type.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
 
      {/* Arrangements */}
      <div>
        <button
          onClick={() => toggleSection('arrangements')}
          className="w-full flex justify-between items-center text-sm font-semibold text-gray-900 mb-2 hover:text-pink-600"
        >
          Arrangements
          {openSections.arrangements ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {openSections.arrangements && (
          <div className="space-y-2 pt-2">
            {[
              { label: 'Vase Arrangements', value: 'vase' },
              { label: 'Bouquets', value: 'bouquet' },
              { label: 'Flower Box', value: 'box' },
              { label: 'Flower Basket ', value: 'basket' }
            ].map((arr) => (
              <label key={arr.label} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded">
                <Checkbox
                  checked={filters.arrangements.includes(arr.value)}
                  onCheckedChange={(checked) => {
                    const isChecked = !!checked;
                    const newArr = isChecked
                      ? [...filters.arrangements, arr.value]
                      : filters.arrangements.filter(a => a !== arr.value);

                    // Update local filter state
                    setFilters(prev => ({ ...prev, arrangements: newArr }));
                  }}
                />
                <span className="text-xs text-gray-600">
                  {arr.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
 
      {/* Colors */}
      <div>
        <button
          onClick={() => toggleSection('colors')}
          className="w-full flex justify-between items-center text-sm font-semibold text-gray-900 mb-2 hover:text-pink-600"
        >
          Colors
          {openSections.colors ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {openSections.colors && (
          <div className="space-y-2 pt-2">
            {/* Show loading spinner or placeholder until products are loaded and counts are calculated */}
            {!products ? (
              <div className="text-xs text-gray-400">Loading color counts...</div>
            ) : (
              filterConfigs.colors.map((color) => (
                <label key={color.label} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded">
                  <Checkbox
                    checked={filters.colors.includes(color.label)}
                    onCheckedChange={(checked) => {
                      setFilters(prev => ({
                        ...prev,
                        colors: checked
                          ? [...prev.colors, color.label]
                          : prev.colors.filter(c => c !== color.label)
                      }));
                    }}
                  />
                  <span className="text-xs text-gray-600">
                    {color.label} 
                    {/* ({color.count}) */}
                  </span>
                </label>
              ))
            )}
          </div>
        )}
      </div>
 
      {/* Additional Filters */}
      <div>
        <button
          onClick={() => toggleSection('additional')}
          className="w-full flex justify-between items-center text-sm font-semibold text-gray-900 mb-2 hover:text-pink-600"
        >
          Additional Filters
          {openSections.additional ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {openSections.additional && (
          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded">
              <Checkbox
                checked={filters.inStock}
                onCheckedChange={(checked) => {
                  setFilters(prev => ({ ...prev, inStock: checked as boolean }));
                }}
              />
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-gray-600">In Stock Only</span>
                {products && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    {products.filter(p => p.inStock).length}
                  </span>
                )}
              </div>
            </label>
            <label className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded">
              <Checkbox
                checked={filters.bestSeller}
                onCheckedChange={(checked) => {
                  setFilters(prev => ({ ...prev, bestSeller: checked as boolean }));
                }}
              />
              <span className="text-xs text-gray-600">Best Seller</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );

  // Handle loading state
  if (isLoading) {
    return (
      <>
        <ShopNav />
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Check if current category should hide filters
  const shouldHideFilters = urlParams.main_category === 'Event' || urlParams.main_category === 'Venue';

  // Friendly heading formatter
  const toTitleCase = (str: string) =>
    (str || '')
      .replace(/[\[\]"]+/g, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const headingTitle = urlParams.search
    ? `Results for ${toTitleCase(urlParams.search)}`
    : urlParams.subcategory
      ? toTitleCase(urlParams.subcategory)
      : urlParams.main_category
        ? toTitleCase(urlParams.main_category)
        : 'All Products';


 
  return (
    <div>
      <ShopNav />
     
      <div className="container mx-auto px-2 py-4">
        <div className="flex gap-4 relative">
          {/* Desktop Filter Sidebar */}
          {!shouldHideFilters && (
            <div className="hidden lg:block w-56 flex-shrink-0">
              <FilterComponent />
            </div>
          )}
 
          {/* Mobile Filter Drawer */}
          {!shouldHideFilters && isFilterOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
              <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg">
                <FilterComponent isMobile={true} />
              </div>
            </div>
          )}
 
          {/* Products Grid */}
          <div className="flex-1">
            {/* Breadcrumb Navigation */}
            {(urlParams.main_category || urlParams.subcategory) && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Link href="/products" className="hover:text-pink-600">
                  All Products
                </Link>
                {urlParams.main_category && (
                  <>
                    <span>/</span>
                    <span className={urlParams.subcategory ? 'hover:text-pink-600 cursor-pointer' : 'text-pink-600 font-medium'}>
                      {urlParams.main_category}
                    </span>
                  </>
                )}
                {urlParams.subcategory && (
                  <>
                    <span>/</span>
                    <span className="text-pink-600 font-medium">{urlParams.subcategory}</span>
                  </>
                )}
              </div>
            )}
 
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">{headingTitle}</h2>
                {/* Mobile Filter Button */}
                {!shouldHideFilters && (
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-3 py-2 bg-pink-50 text-pink-600 rounded-md hover:bg-pink-100 transition-colors"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </button>
                )}
              </div>
            </div>
 
            {/* Active Filters Indicator */}
            {(filters.priceRanges.length > 0 ||   
              filters.colors.length > 0 || filters.flowerTypes.length > 0 || 
              filters.arrangements.length > 0 || filters.inStock || 
              filters.featured || filters.bestSeller) && (
              <div className="mb-4 p-3 bg-pink-50 rounded-lg border border-pink-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap gap-2">
                     {filters.priceRanges.length > 0 && filters.priceRanges.map(([min, max], idx) => (
  <span key={idx} className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
    ₹{min} - ₹{max}
  </span>
))}
                      {filters.colors.map(color => (
                        <span key={color} className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                          {color}
                        </span>
                      ))}
                      {filters.flowerTypes.map(type => {
                        const typeLabels = {
                          'roses': 'Roses',
                          'lilies': 'Lilies', 
                          'tulips': 'Tulips',
                          'orchids': 'Orchids',
                          'carnations': 'Carnations',
                          'mixed': 'Mixed Flowers'
                        };
                        return (
                          <span key={type} className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                            {typeLabels[type as keyof typeof typeLabels] || type}
                          </span>
                        );
                      })}
                      {filters.arrangements.map(arr => {
                        const arrLabels = {
                          'vase': 'Vase Arrangements',
                          'bouquet': 'Bouquets',
                          'box': 'Box Arrangements', 
                          'basket': 'Basket Arrangements'
                        };
                        return (
                          <span key={arr} className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                            {arrLabels[arr as keyof typeof arrLabels] || arr}
                          </span>
                        );
                      })}
                      {filters.inStock && (
                        <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">In Stock</span>
                      )}
                      {filters.featured && (
                        <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">Featured</span>
                      )}
                      {filters.bestSeller && (
                        <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">Best Seller</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={resetFilters}
                    className="text-xs text-pink-600 hover:text-pink-800 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}

            {/* Responsive Products Grid */}
            {!products || products.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="text-gray-500 text-lg mb-2">No products found</div>
                <div className="text-gray-400 text-sm">
                  {isLoading ? 'Loading...' : 'Try adjusting your search or filters'}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                {products.slice(0, 240).map((product) => (
                <div
                  key={product.id}
                  className={`cursor-pointer bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 ${
                    !product.inStock ? 'opacity-75 grayscale-50' : ''
                  }`}
                  onClick={() => setLocation(`/product/${product.id}`)}
                >
                  {/* Product Image */}
                  <div className="aspect-square overflow-hidden relative">
                    {product.image ? (
                      <>
                        <img
                          src={`data:image/jpeg;base64,${product.image}`}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {/* Best Seller badge */}
                        {((product as any).isbestseller === true || (product as any).isBestSeller === true) && (
                          <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded">
                            Best Seller
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                        No image
                      </div>
                    )}
                    {/* Out of Stock Overlay */}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-gray-900 bg-opacity-40 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-semibold shadow-lg">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
 
                  {/* Product Info */}
                  <div className="p-2">
                    {/* Product Name */}
                    <h3 className="font-medium text-xs sm:text-sm text-gray-900 line-clamp-2 min-h-[2rem]">
                      {product.name}
                    </h3>
 
                    {/* Price and Stock Status */}
                    <div className="space-y-2 mt-1">
                      <div className="flex items-center gap-2">
                        {/* Show original price + discounted price + percent OFF when discounts are enabled */}
                        {(() => {
                          const discountsField = (product as any).discounts_offers ?? (product as any).discountsOffers ?? (product as any).discounts_offers;
                          const hasDiscounts = typeof discountsField === 'boolean' ? discountsField : typeof discountsField === 'string' ? ['true','1','yes','enable'].includes(String(discountsField).toLowerCase()) : Boolean(discountsField);

                          const originalRaw = (product as any).originalPrice ?? (product as any).originalprice ?? null;
                          const originalVal = originalRaw != null && originalRaw !== '' ? parseFloat(String(originalRaw)) : NaN;
                          const priceVal = !isNaN(parseFloat(String(product.price ?? 0))) ? parseFloat(String(product.price ?? 0)) : 0;

                          if (hasDiscounts && !isNaN(originalVal) && originalVal > priceVal) {
                            // Prefer explicit discountPercentage if present, otherwise compute it
                            const explicitPct = (product as any).discountPercentage ?? (product as any).discount_percentage;
                            const pct = explicitPct && Number(explicitPct) > 0 ? Number(explicitPct) : Math.round(((originalVal - priceVal) / originalVal) * 100);

                            return (
                              <>
                                <span className="text-gray-500 line-through text-sm">₹{originalVal.toLocaleString()}</span>
                                <span className="font-semibold text-gray-900 text-lg">₹{priceVal.toLocaleString()}</span>
                                {pct > 0 && (
                                  <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs font-semibold">
                                    {pct}% OFF
                                  </span>
                                )}
                              </>
                            );
                          }

                          // If discounts flag is truthy but no original price, still show price and badge if discountPercentage present
                          if (hasDiscounts && ((product as any).discountPercentage ?? (product as any).discount_percentage)) {
                            const pct = Number((product as any).discountPercentage ?? (product as any).discount_percentage) || 0;
                            return (
                              <>
                                <span className="font-semibold text-gray-900 text-lg">₹{priceVal.toLocaleString()}</span>
                                {pct > 0 && (
                                  <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs font-semibold">
                                    {pct}% OFF
                                  </span>
                                )}
                              </>
                            );
                          }

                          // Default: just show selling price
                          return <span className="font-semibold text-gray-900 text-lg">₹{priceVal.toLocaleString()}</span>;
                        })()}
                      </div>
                      
                      {/* Stock Status */}
                      <div className="flex justify-between items-center">
                        {product.inStock ? (
                          null
                        ) : (
                          <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded font-medium">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      {/* Add to Cart placeholder */}
                      <div className="mt-2 flex items-center justify-end">
                        <span className="text-xs text-gray-500">&nbsp;</span>
                      </div>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}