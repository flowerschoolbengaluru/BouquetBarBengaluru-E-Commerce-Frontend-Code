import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Checkbox } from '@/components/ui/checkbox';
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
  // backend may use `isbestseller` (lowercase) or `isBestSeller` (camelCase)
  isbestseller?: boolean;
  isBestSeller?: boolean;
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
  const cart = useCart();
  const { toast } = useToast();
 
  // React to route/query changes so search works from anywhere (ShopNav, categories, etc.)
  useEffect(() => {
    const handleUrlChange = () => {
      const currentSearchParams = new URLSearchParams(window.location.search);
      const newParams = {
        category: currentSearchParams.get('category') ? decodeURIComponent(currentSearchParams.get('category')!) : null,
        subcategory: currentSearchParams.get('subcategory') ? decodeURIComponent(currentSearchParams.get('subcategory')!) : null,
        search: currentSearchParams.get('search') ? decodeURIComponent(currentSearchParams.get('search')!) : null,
      };

      // Extract common filter params from URL so we can keep filter state in sync
      const parsedFlowerTypes = currentSearchParams.get('flowerTypes')
        ? currentSearchParams.get('flowerTypes')!.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const parsedArrangements = currentSearchParams.get('arrangements')
        ? currentSearchParams.get('arrangements')!.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const parsedColors = currentSearchParams.get('colors')
        ? currentSearchParams.get('colors')!.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      // Check if params actually changed to avoid unnecessary updates
      const paramsChanged = 
        newParams.category !== urlParams.category ||
        newParams.subcategory !== urlParams.subcategory ||
        newParams.search !== urlParams.search;

      if (!paramsChanged && parsedFlowerTypes.length === 0 && parsedArrangements.length === 0 && parsedColors.length === 0) return;

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
      } else {
        // If category didn't change, keep existing filters but sync ones present in URL
        setFilters(prev => ({
          ...prev,
          flowerTypes: parsedFlowerTypes.length ? parsedFlowerTypes.map(s => s.toLowerCase()) : prev.flowerTypes,
          arrangements: parsedArrangements.length ? parsedArrangements.map(s => s.toLowerCase()) : prev.arrangements,
          colors: parsedColors.length ? parsedColors : prev.colors
        }));
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
    filters.flowerTypes,
    filters.arrangements,
    forceRefetch
  ],
  queryFn: async () => {
    const params = new URLSearchParams();
 
    // Debug logging
    if (urlParams.category || urlParams.subcategory) {
      console.log('ProductsListing: Searching for category:', urlParams.category, 'subcategory:', urlParams.subcategory);
    }
 
    // Always include search if it exists
    if (urlParams.search) {
      params.append('search', urlParams.search);
    }
    
    // Always include category/subcategory if they exist (unless overridden by special filters)
    if (urlParams.category && !filters.inStock && !filters.bestSeller) {
      params.append('category', urlParams.category);
    }
    if (urlParams.subcategory && !filters.inStock && !filters.bestSeller) {
      params.append('subcategory', urlParams.subcategory);
    }

    // Include all filter parameters
    if (filters.inStock) params.append('inStock', 'true');
    if (filters.featured) params.append('featured', 'true');
    if (filters.bestSeller) params.append('bestSeller', 'true');
    if (filters.priceRange[0] > 0) params.append('minPrice', filters.priceRange[0] + '');
    if (filters.priceRange[1] < 10000) params.append('maxPrice', filters.priceRange[1] + '');
    if (filters.colors.length) params.append('colors', filters.colors.join(','));
    if (filters.flowerTypes.length) params.append('flowerTypes', filters.flowerTypes.join(','));
    if (filters.arrangements.length) params.append('arrangements', filters.arrangements.join(','));
 
    const res = await apiRequest(`/api/products?${params.toString()}`);
 
    if (!res.ok) throw new Error("Failed to fetch");
 
    const data = await res.json();

    // Normalize `category`/`subcategory`/`name`/`description` to make client-side
    // matching resilient to backend stringified-array formats like '[]' or
    // comma-separated strings. We add lightweight _normalized* helpers on each
    // product object (used only for filtering; we keep original fields for UI).
    data.forEach((p: any) => {
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

    console.log('ProductsListing: API returned', data.length, 'products');

    // If the user has explicitly activated any filters (flowerTypes/arrangements/colors/etc.),
    // trust the backend response and skip heavy client-side filtering. This prevents the
    // client from accidentally removing products the API correctly returned for the
    // selected multi-filter combination.
    const hasActiveFilter = (
      filters.flowerTypes.length > 0 ||
      filters.arrangements.length > 0 ||
      filters.colors.length > 0 ||
      filters.inStock ||
      filters.featured ||
      filters.bestSeller ||
      filters.priceRange[0] > 0 ||
      filters.priceRange[1] < 10000
    );

    if (hasActiveFilter) {
      console.log('ProductsListing: Active filters detected — returning API results without further client-side filtering (count=' + data.length + ')');
      return data;
    }

    // Enhanced CLIENT-SIDE filtering to support multiple filters (used when no explicit filters are set)
    const filteredData = data.filter((p: Product) => {
      // Debug logging for Roses subcategory
      if (urlParams.subcategory && urlParams.subcategory.toLowerCase() === 'roses') {
        console.log('DEBUG: Checking product for Roses:', {
          name: p.name,
          category: p.category,
          subcategory: p.subcategory,
          nameMatch: p.name.toLowerCase().includes('roses'),
          categoryMatch: p.category.toLowerCase().includes('roses')
        });
      }
      
      const price = parseFloat(p.price);
 
      // Search filter (use normalized helpers)
      const q = urlParams.search ? urlParams.search.toLowerCase() : '';
      const matchesSearch =
        !q ||
        ((p as any)._normalizedName && (p as any)._normalizedName.includes(q)) ||
        ((p as any)._normalizedDescription && (p as any)._normalizedDescription.includes(q)) ||
        ((p as any)._nc && (p as any)._nc.includes(q)) ||
        ((p as any)._normalizedSubcategory && (p as any)._normalizedSubcategory.includes(q));
 
      // Price filter - always apply regardless of category
      const matchesPrice = price >= filters.priceRange[0] && price <= filters.priceRange[1];
 
      // Category/Subcategory filter - more flexible matching
      // (moved/expanded below to allow grouping ids like "flower-types" to work correctly)

        // Support comma-separated subcategory URL param (e.g. "Roses,Tulips,...")
        const subcategoryList = urlParams.subcategory
          ? urlParams.subcategory.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
          : [];

        // Determine if product matches any provided subcategory terms (use normalization)
        let matchesSubcategory: boolean;
        if (subcategoryList.length === 0) {
          const sub = urlParams.subcategory ? urlParams.subcategory.toLowerCase() : '';
          matchesSubcategory = !urlParams.subcategory ||
            filters.inStock || filters.bestSeller ||
            ((p as any)._normalizedSubcategory && (p as any)._normalizedSubcategory.includes(sub)) ||
            ((p as any)._nc && (p as any)._nc.includes(sub)) ||
            ((p as any)._normalizedName && (p as any)._normalizedName.includes(sub)) ||
            ((p as any)._normalizedDescription && (p as any)._normalizedDescription.includes(sub));
        } else {
          // If multiple subcategories were provided, match when ANY of them match the product
          matchesSubcategory = subcategoryList.some(sc =>
            ((p as any)._normalizedSubcategory && (p as any)._normalizedSubcategory.includes(sc)) ||
            ((p as any)._nc && (p as any)._nc.includes(sc)) ||
            ((p as any)._normalizedName && (p as any)._normalizedName.includes(sc)) ||
            ((p as any)._normalizedDescription && (p as any)._normalizedDescription.includes(sc))
          );
          // When navigating by URL and no special toggles are set, allow navigation to show results
          if (!filters.inStock && !filters.bestSeller && (urlParams.category || urlParams.subcategory)) {
            matchesSubcategory = true;
          }
        }

        // When navigating by URL category/subcategory, don't apply additional filter restrictions
        const isUrlNavigation = !!(urlParams.category || urlParams.subcategory);

        // Category matching: allow top-level category ids like "flower-types" to pass when subcategory matches
        const catQ = urlParams.category ? urlParams.category.toLowerCase() : '';
        const matchesCategory = !urlParams.category ||
          filters.inStock || filters.bestSeller ||
          ((p as any)._nc && catQ && (p as any)._nc.includes(catQ)) ||
          ((p as any)._normalizedName && catQ && (p as any)._normalizedName.includes(catQ)) ||
          ((p as any)._normalizedSubcategory && catQ && (p as any)._normalizedSubcategory.includes(catQ)) ||
          // If a subcategory was provided in the URL and it matches this product, allow the category navigation
          (urlParams.subcategory && matchesSubcategory);

        // Flower types filter
        // If the user explicitly set flowerTypes, trust the backend results to avoid double-filtering
        let matchesFlowerTypes: boolean;
        if (filters.flowerTypes.length === 0) {
          matchesFlowerTypes = true;
        } else {
          // Trust API when flowerTypes were requested
          matchesFlowerTypes = true;
        }

      // Arrangements filter
      // If the user explicitly set arrangements, we rely on the API results (skip strict client-side double-filtering)
      // This prevents cases where the API returns matches but the client-side text-matching misses them.
      let matchesArrangements: boolean;
      if (filters.arrangements.length === 0) {
        matchesArrangements = true;
      } else {
        // Trust the backend when arrangements were requested; ensure UI still honors arrangements toggle
        matchesArrangements = true;
      }
 
      // Color filter
      const matchesColor =
        filters.colors.length === 0 ||
        filters.colors.includes(p.colour || "");
 
      // Featured filter
      const matchesFeatured = !filters.featured || p.featured === true;
 
      // Stock filter
      const matchesInStock = !filters.inStock || p.inStock === true;

      // Best Seller filter
      const matchesBestSeller = !filters.bestSeller || (p as any).isBestSeller === true || (p as any).isbestseller === true;
 
      // Determine if user has any active explicit filters (so filters take precedence over URL-only navigation)
      const hasActiveFilter = (
        filters.flowerTypes.length > 0 ||
        filters.arrangements.length > 0 ||
        filters.colors.length > 0 ||
        filters.inStock ||
        filters.featured ||
        filters.bestSeller ||
        filters.priceRange[0] > 0 ||
        filters.priceRange[1] < 10000
      );

      // Debug logging for Roses filtering results
      if (urlParams.subcategory && urlParams.subcategory.toLowerCase() === 'roses' && p.name.toLowerCase().includes('roses')) {
        console.log('DEBUG: Filter results for', p.name, {
          urlParams,
          isUrlNavigation,
          matchesSearch,
          matchesPrice,
          matchesCategory,
          matchesSubcategory,
          matchesFlowerTypes,
          matchesArrangements,
          matchesColor,
          matchesFeatured,
          matchesInStock,
          matchesBestSeller,
          finalResult: matchesSearch && matchesPrice && matchesCategory && matchesSubcategory && 
                     matchesFlowerTypes && matchesArrangements && matchesColor && 
                     matchesFeatured && matchesInStock && matchesBestSeller
        });
      }
 
  // If explicit filters are active, allow products that match the filters even if the top-level
  // URL category doesn't textually match the product.category string. This helps when product
  // category is stored as a JSON-like array string (e.g. '["Tulips","Lilies"]') and the
  // URL category is a grouping id (like 'services' or 'flower-types').
  //
  // Also: when the user navigates by URL (clicking a top-level category), the server is
  // authoritative about which products belong to that category. In that case we should
  // not perform additional strict text-matching on the client that would filter out the
  // server-returned results (e.g. grouping ids like 'flower-types' won't appear inside
  // product.category strings). Treat URL navigation as permissive and accept the API results.
  const passesCategoryNavigation = hasActiveFilter ? true : (isUrlNavigation ? true : (matchesCategory && matchesSubcategory));

      return matchesSearch && matchesPrice && passesCategoryNavigation &&
        matchesFlowerTypes && matchesArrangements && matchesColor &&
        matchesFeatured && matchesInStock && matchesBestSeller;
    });
    
    console.log('ProductsListing: After filtering,', filteredData.length, 'products remain');
    return filteredData;
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
              { label: 'Roses', value: 'roses' },
              { label: 'Lilies', value: 'lilies' },
              { label: 'Tulips', value: 'tulips' },
              { label: 'Orchids', value: 'orchids' },
              { label: 'Carnations', value: 'carnations' },
              { label: 'Mixed Flowers', value: 'mixed' }
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

                    // Update URL params so the API call reflects selected arrangements (multi-filter behavior)
                    const params = new URLSearchParams(window.location.search);
                    if (newArr.length) {
                      params.set('arrangements', newArr.join(','));
                    } else {
                      params.delete('arrangements');
                    }
                    // Preserve other params (category/subcategory/search)
                    const newQuery = params.toString();
                    window.history.pushState({}, '', `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}`);

                    // Keep urlParams in sync and trigger refetch
                    setUrlParams({
                      category: params.get('category'),
                      subcategory: params.get('subcategory'),
                      search: params.get('search')
                    });
                    setForceRefetch(prev => prev + 1);
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
            {filterConfigs.colors.map((color) => (
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
              <div className="flex items-center gap-3">
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
            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 10000 || 
              filters.colors.length > 0 || filters.flowerTypes.length > 0 || 
              filters.arrangements.length > 0 || filters.inStock || 
              filters.featured || filters.bestSeller) && (
              <div className="mb-4 p-3 bg-pink-50 rounded-lg border border-pink-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap gap-2">
                      {filters.priceRange[0] > 0 || filters.priceRange[1] < 10000 ? (
                        <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                          ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                        </span>
                      ) : null}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
              {products?.slice(0, 240).map((product) => (
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
                        {product.originalPrice && product.originalPrice !== product.price && (
                          <span className="text-gray-500 line-through text-sm">₹{product.originalPrice}</span>
                        )}
                        <span className="font-semibold text-gray-900 text-lg">₹{product.price || 0}</span>
                        {product.discountPercentage && product.discountPercentage > 0 && (
                          <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs font-semibold">
                            {product.discountPercentage}% OFF
                          </span>
                        )}
                      </div>
                      
                      {/* Stock Status */}
                      <div className="flex justify-between items-center">
                        {product.inStock ? (
                          <div className="flex items-center gap-1">
                            {product.stockquantity && product.stockquantity <= 5 && product.stockquantity > 0 ? (
                              <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                                Only {product.stockquantity} left
                              </span>
                            ) : product.stockquantity && product.stockquantity > 5 ? (
                              <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                                In Stock
                              </span>
                            ) : (
                              <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                                Available
                              </span>
                            )}
                          </div>
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
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}