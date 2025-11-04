import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Checkbox } from '@/components/ui/checkbox';
import ShopNav from './ShopNav';
import Footer from '@/components/footer';
import { ChevronDown, ChevronUp, Filter, X, Search } from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";

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
}
 
interface FilterState {
  priceRange: [number, number];
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
 
  // Get URL parameters and create a reactive system
  const [urlParams, setUrlParams] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return {
      category: searchParams.get('category') ? decodeURIComponent(searchParams.get('category')!) : null,
      subcategory: searchParams.get('subcategory') ? decodeURIComponent(searchParams.get('subcategory')!) : null,
      search: searchParams.get('search') ? decodeURIComponent(searchParams.get('search')!) : null,
    };
  });
 
  // Mobile filter drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
 
  // Search state
  const [searchQuery, setSearchQuery] = useState(urlParams.search || '');
 
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 10000],
    flowerTypes: [],
    arrangements: [],
    occasions: [],
    colors: [],
    inStock: false,
    featured: false,
    bestSeller: false
  });
 
  const [forceRefetch, setForceRefetch] = useState(0);
 
  // React to route/query changes so search works from anywhere (ShopNav, categories, etc.)
  useEffect(() => {
    const handleUrlChange = () => {
      const currentSearchParams = new URLSearchParams(window.location.search);
      const newParams = {
        category: currentSearchParams.get('category') ? decodeURIComponent(currentSearchParams.get('category')!) : null,
        subcategory: currentSearchParams.get('subcategory') ? decodeURIComponent(currentSearchParams.get('subcategory')!) : null,
        search: currentSearchParams.get('search') ? decodeURIComponent(currentSearchParams.get('search')!) : null,
      };

      // Check if params actually changed to avoid unnecessary updates
      const paramsChanged = 
        newParams.category !== urlParams.category ||
        newParams.subcategory !== urlParams.subcategory ||
        newParams.search !== urlParams.search;

      if (!paramsChanged) return;

      // Reset filters only if category context actually changed
      const categoryChanged = newParams.category !== urlParams.category || newParams.subcategory !== urlParams.subcategory;

      setUrlParams(newParams);
      setSearchQuery(newParams.search || '');

      if (categoryChanged) {
        // Clear all filters when category/subcategory changes
        setFilters({
          priceRange: [0, 10000],
          flowerTypes: [],
          arrangements: [],
          occasions: [],
          colors: [],
          inStock: false,
          featured: false,
          bestSeller: false
        });
      }

      // Also clear category-based filters when using search or switching to non-category filtering
      if (newParams.search && !urlParams.search) {
        // When starting a search, clear category filters but keep other filters
        setFilters(prev => ({
          ...prev,
          flowerTypes: [],
          arrangements: []
        }));
      }

      // Force a refetch when params change
      setForceRefetch(prev => prev + 1);
    };

    // Run on mount and when location changes
    handleUrlChange();

    // Also listen for popstate events (browser back/forward)
    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [location]); // Dependency on location ensures this runs when route changes

  const { data: products, isLoading, refetch } = useQuery<Product[]>({
  queryKey: [
    '/api/products',
    urlParams.category,
    urlParams.subcategory,
    urlParams.search,
    filters.inStock,
    filters.featured,
    filters.bestSeller,
    filters.colors,
    filters.priceRange,
    forceRefetch
  ],
  queryFn: async () => {
    const params = new URLSearchParams();
 
    // ✅ If "in stock only" OR "best seller" checked → ignore category/subcategory
    if (filters.inStock || filters.bestSeller) {
      if (filters.inStock) params.append('inStock', 'true');
      if (filters.bestSeller) params.append('bestSeller', 'true');
 
      if (urlParams.search) params.append('search', urlParams.search);
      if (filters.priceRange[0] > 0) params.append('minPrice', filters.priceRange[0] + '');
      if (filters.priceRange[1] < 10000) params.append('maxPrice', filters.priceRange[1] + '');
      if (filters.colors.length) params.append('colors', filters.colors.join(','));
      if (filters.featured) params.append('featured', 'true');
    } else {
      // ✅ Normal mode: if a search term exists, treat it as global (ignore category/subcategory)
      if (urlParams.search) {
        params.append('search', urlParams.search);
      } else {
        if (urlParams.category) params.append('category', urlParams.category);
        if (urlParams.subcategory) params.append('subcategory', urlParams.subcategory);
      }
 
      if (filters.priceRange[0] > 0) params.append('minPrice', filters.priceRange[0] + '');
      if (filters.priceRange[1] < 10000) params.append('maxPrice', filters.priceRange[1] + '');
      if (filters.flowerTypes.length) params.append('flowerTypes', filters.flowerTypes.join(','));
      if (filters.arrangements.length) params.append('arrangements', filters.arrangements.join(','));
      if (filters.colors.length) params.append('colors', filters.colors.join(','));
      if (filters.featured) params.append('featured', 'true');
      if (filters.bestSeller) params.append('bestSeller', 'true');
    }
 
    const res = await apiRequest(`/api/products?${params.toString()}`);
 
    if (!res.ok) throw new Error("Failed to fetch");
 
    const data = await res.json();
 
    // ✅ CLIENT-SIDE filtering
    return data.filter((p: Product) => {
      const price = parseFloat(p.price);
 
      const matchesSearch =
        !urlParams.search ||
        p.name.toLowerCase().includes(urlParams.search.toLowerCase()) ||
        p.description.toLowerCase().includes(urlParams.search.toLowerCase()) ||
        p.category.toLowerCase().includes(urlParams.search.toLowerCase()) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(urlParams.search.toLowerCase()));
 
      const matchesPrice = price >= filters.priceRange[0] && price <= filters.priceRange[1];
 
      const matchesColor =
        filters.colors.length === 0 ||
        filters.colors.includes(p.colour || "");
 
      const matchesFeatured = !filters.featured || p.featured === true;
 
      // ✅ use DB field
      const matchesInStock = !filters.inStock || p.inStock === true;

      // ✅ Best Seller flag (supports both casings)
      const matchesBestSeller = !filters.bestSeller || (p as any).isBestSeller === true || (p as any).isbestseller === true;
 
      return matchesSearch && matchesPrice && matchesColor && matchesFeatured && matchesInStock && matchesBestSeller;
    });
  },
 
  refetchOnWindowFocus: false,
  staleTime: 5 * 60 * 1000,
});

 
  // Handle search functionality
 const handleSearch = (e: React.FormEvent) => {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);

  if (searchQuery.trim()) {
    params.set("search", searchQuery.trim());
  } else {
    params.delete("search");
  }

  // ✅ Push URL so wouter detects change
  window.history.pushState({}, "", `${window.location.pathname}?${params.toString()}`);

  setUrlParams({
    category: params.get("category"),
    subcategory: params.get("subcategory"),
    search: searchQuery.trim() || null,
  });

  // force refresh
  setForceRefetch(prev => prev + 1);
};

 
 const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSearchQuery(e.target.value);

  const params = new URLSearchParams(window.location.search);

  if (e.target.value.trim()) {
    params.set("search", e.target.value.trim());
  } else {
    params.delete("search");
  }

  window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);

  setUrlParams({
    category: params.get("category"),
    subcategory: params.get("subcategory"),
    search: e.target.value.trim() || null,
  });
};

 
  const clearSearch = () => {
    setSearchQuery('');
    const newUrl = window.location.pathname;
    window.history.pushState({}, '', newUrl);
   
    // Update urlParams state to trigger refetch
    setUrlParams({
      category: null,
      subcategory: null,
      search: null
    });
  };
 
  // Handle navigation to specific category/subcategory
  const navigateToCategory = (category: string, subcategory?: string) => {
    const newParams = new URLSearchParams();
    newParams.set('category', category);
    if (subcategory) {
      newParams.set('subcategory', subcategory);
    }
   
    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    window.history.pushState({}, '', newUrl);
   
    // Update urlParams state to trigger refetch
    setUrlParams({
      category,
      subcategory: subcategory || null,
      search: null
    });
   
    // Reset search query
    setSearchQuery('');
   
    // Clear all filters when switching to a different category
    setFilters({
      priceRange: [0, 10000],
      flowerTypes: [],
      arrangements: [],
      occasions: [],
      colors: [],
      inStock: false,
      featured: false,
      bestSeller: false
    });
   
    // Close mobile filter drawer
    setIsFilterOpen(false);
  };
 
  interface PriceRange {
    label: string;
    value: [number, number];
  }
 
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
      { label: 'Box Arrangements', count: 0 },
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
 
  useEffect(() => {
    if (products) {
      const newFilterConfigs = { ...filterConfigs };
 
      // Reset all counts first
      newFilterConfigs.flowerTypes.forEach(type => type.count = 0);
      newFilterConfigs.arrangements.forEach(arr => arr.count = 0);
      newFilterConfigs.colors.forEach(color => color.count = 0);
 
      // Count products
      products.forEach(product => {
        newFilterConfigs.flowerTypes.forEach(type => {
          if (product.category === type.label) {
            type.count++;
          }
        });
 
        newFilterConfigs.arrangements.forEach(arr => {
          if (product.subcategory === arr.label) {
            arr.count++;
          }
        });
 
        newFilterConfigs.colors.forEach(color => {
          if (product.colour === color.label) {
            color.count++;
          }
        });
      });
 
      setFilterConfigs(newFilterConfigs);
    }
  }, [products]);
 
  const resetFilters = () => {
    setFilters({
      priceRange: [0, 10000],
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
      category: null,
      subcategory: null,
      search: null
    });
   
    setSearchQuery('');
  };
 
  const [openSections, setOpenSections] = useState({
    price: true,
    flowerTypes: true,
    occasions: true,
    arrangements: true,
    colors: true,
    additional: true
  });
 
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
 
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
            {filterConfigs.priceRanges.map((range) => (
              <label key={range.label} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded">
                <Checkbox
                  checked={filters.priceRange[0] === range.value[0]}
                  onCheckedChange={() => {
                    // Clear category/subcategory selections when using price filter
                    setUrlParams(prev => ({
                      ...prev,
                      category: null,
                      subcategory: null
                    }));
                    
                    setFilters(prev => ({
                      ...prev,
                      priceRange: range.value as [number, number]
                    }));
                  }}
                />
                <span className="text-xs text-gray-600">₹{range.label}</span>
              </label>
            ))}
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
              { label: 'Roses', category: 'Flowers', subcategory: 'Roses' },
              { label: 'Lilies', category: 'Flowers', subcategory: 'Lilies' },
              { label: 'Tulips', category: 'Flowers', subcategory: 'Tulips' },
              { label: 'Orchids', category: 'Flowers', subcategory: 'Orchids' },
              { label: 'Carnations', category: 'Flowers', subcategory: 'Carnations' },
              { label: 'Mixed Flowers', category: 'Flowers', subcategory: 'Mixed Flowers' }
            ].map((type) => (
              <div
                key={type.label}
                className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded cursor-pointer"
                onClick={() => navigateToCategory(type.category, type.subcategory)}
              >
                <Checkbox
                  checked={urlParams.category === type.category && urlParams.subcategory === type.subcategory}
                />
                <span className="text-xs text-gray-600">
                  {type.label}
                </span>
              </div>
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
              { label: 'Vase Arrangements', category: 'arrangements', subcategory: 'Vase Arrangements' },
              { label: 'Bouquets', category: 'arrangements', subcategory: 'Bouquets (hand-tied, wrapped)' },
              { label: 'Box Arrangements', category: 'arrangements', subcategory: 'Flower Boxes' },
              { label: 'Basket Arrangements', category: 'arrangements', subcategory: 'Flower Baskets' }
            ].map((arr) => (
              <div
                key={arr.label}
                className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded cursor-pointer"
                onClick={() => navigateToCategory(arr.category, arr.subcategory)}
              >
                <Checkbox
                  checked={urlParams.category === arr.category && urlParams.subcategory === arr.subcategory}
                />
                <span className="text-xs text-gray-600">
                  {arr.label}
                </span>
              </div>
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
            {filterConfigs.colors.map((color) => (
              <label key={color.label} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded">
                <Checkbox
                  checked={filters.colors.includes(color.label)}
                  onCheckedChange={(checked) => {
                    // Clear category/subcategory selections when using color filter
                    if (checked) {
                      setUrlParams(prev => ({
                        ...prev,
                        category: null,
                        subcategory: null
                      }));
                    }
                    
                    setFilters(prev => ({
                      ...prev,
                      colors: checked
                        ? [...prev.colors, color.label]
                        : prev.colors.filter(c => c !== color.label)
                    }));
                  }}
                />
                <span className="text-xs text-gray-600">
                  {color.label} ({color.count})
                </span>
              </label>
            ))}
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
                  // Clear category/subcategory selections when using In Stock filter
                  if (checked) {
                    setUrlParams(prev => ({
                      ...prev,
                      category: null,
                      subcategory: null
                    }));
                  }
                  setFilters(prev => ({ ...prev, inStock: checked as boolean }));
                }}
              />
              <span className="text-xs text-gray-600">In Stock Only</span>
            </label>
            <label className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded">
              <Checkbox
                checked={filters.bestSeller}
                onCheckedChange={(checked) => {
                  // Clear category/subcategory selections when using Best Seller filter
                  if (checked) {
                    setUrlParams(prev => ({
                      ...prev,
                      category: null,
                      subcategory: null
                    }));
                  }
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
  const shouldHideFilters = urlParams.category === 'Event' || urlParams.category === 'Venue';

  // Friendly heading formatter
  const toTitleCase = (str: string) =>
    (str || '')
      .replace(/[\[\]"]+/g, '') // drop JSON-y brackets/quotes if any sneak in
      .replace(/[-_]+/g, ' ') // dashes/underscores to spaces
      .replace(/\s+/g, ' ') // collapse spaces
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const headingTitle = urlParams.search
    ? `Results for ${toTitleCase(urlParams.search)}`
    : urlParams.subcategory
      ? toTitleCase(urlParams.subcategory)
      : urlParams.category
        ? toTitleCase(urlParams.category)
        : 'All Products';
 
  return (
    <>
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
            {(urlParams.category || urlParams.subcategory) && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Link href="/products" className="hover:text-pink-600">
                  All Products
                </Link>
                {urlParams.category && (
                  <>
                    <span>/</span>
                    <span className={urlParams.subcategory ? 'hover:text-pink-600 cursor-pointer' : 'text-pink-600 font-medium'}>
                      {urlParams.category}
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
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">
                {headingTitle}
              </h1>
 
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600">
                  {products?.length || 0} products found
                </p>
 
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
 
            {/* Responsive Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
              {products?.slice(0, 240).map((product) => (
                <div
                  key={product.id}
                  className="cursor-pointer bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  onClick={() => setLocation(`/product/${product.id}`)}
                >
                  {/* Product Image */}
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={`data:image/jpeg;base64,${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
 
                  {/* Product Info */}
                  <div className="p-2">
                    {/* Product Name */}
                    <h3 className="font-medium text-xs sm:text-sm text-gray-900 line-clamp-2 min-h-[2rem]">
                      {product.name}
                    </h3>
 
                    {/* Price and Stock Status */}
                    <div className="flex justify-between items-center mt-1">
                      <div>
                        {/* Robust pricing block: support multiple field name variants and show fallbacks */}
                        <div>
                          {((product as any).originalPrice ?? (product as any).originalprice) && ((product as any).discountPercentage ?? (product as any).discount_percentage) ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm sm:text-base font-bold text-red-600">
                                  ₹{Number(product.price).toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-500 line-through">
                                  ₹{parseFloat(String((product as any).originalPrice ?? (product as any).originalprice)).toLocaleString()}
                                </span>
                                <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded text-xs font-bold">
                                  {(product as any).discountPercentage ?? (product as any).discount_percentage}% OFF
                                </span>
                              </div>
                            </div>
                          ) : (
                            // Normal display with richer info: try to show originalprice/discount_percentage/discounts_offers variants
                            <div className="flex items-center gap-2">
                              {/* Original price (small, struck-through) */}
                              {(product as any).originalPrice ?? (product as any).originalprice ? (
                                <span className="text-gray-500 line-through text-sm">₹{parseFloat(String((product as any).originalPrice ?? (product as any).originalprice)).toLocaleString()}</span>
                              ) : (
                                <span className="text-gray-400 text-sm">No orig</span>
                              )}

                              {/* Current / selling price (prominent) */}
                              <span className="font-sans font-semibold text-base text-gray-900">₹{Number(product.price || 0).toLocaleString()}</span>

                              {/* Discount badge (green) or fallback */}
                              {((product as any).discountPercentage ?? (product as any).discount_percentage) ? (
                                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-semibold">{(product as any).discountPercentage ?? (product as any).discount_percentage}% OFF</span>
                              ) : (
                                <span className="text-gray-400 text-xs">No %</span>
                              )}

                              {/* Offers flag fallback */}
                              {!((product as any).discounts_offers ?? (product as any).discountsOffers) && (
                                <span className="text-gray-400 text-xs">✗Offers</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {!product.inStock && (
                        <span className="text-[10px] bg-red-50 text-red-500 px-1 rounded">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
 
            {/* No products found message */}
            {products && products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms</p>
              </div>
            )}
 
            {/* Show total count */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Showing {Math.min(products?.length || 0, 240)} products
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
 
 
