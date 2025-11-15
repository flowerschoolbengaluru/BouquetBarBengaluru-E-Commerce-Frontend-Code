# AI Coding Instructions for Flower School E-Commerce Frontend

## Multi-Project Workspace Context

⚠️ **WORKSPACE LOCATION**: This is the **e-commerce frontend** (`flowerschoolbengaluru-e-commese/`) within a tri-application workspace:
- **This project** - E-commerce frontend (React + Vite + TypeScript)
- **`../flowerschoolbengaluru-code/`** - Course enrollment frontend 
- **`../flowerschoolbengaluru-back-end/`** - Shared Express.js backend

**Always verify you're in the correct project directory before making changes.**

## Architecture Overview

- **Frontend Stack**: React 18 + Vite + TypeScript (in `client/` subdirectory)
- **UI Framework**: shadcn/ui (new-york style) + Radix UI + Tailwind CSS
- **Router**: Wouter (NOT React Router - different API patterns)
- **State**: React Context (complex CartProvider + AuthProvider) + TanStack Query
- **Backend**: Shared Express.js API at production URL or development proxy

### Critical Import Patterns (`vite.config.ts`)

```typescript
"@" → "client/src"           // Main source alias
"@shared" → "client/src/shared"  // Schema & types
"@assets" → "attached_assets"    // External assets directory

// Usage examples:
import { Button } from "@/components/ui/button";
import type { Product } from "@shared/schema";
import logo from "@assets/images/logo.png";
```

## Development Workflows & API Configuration

### Essential Commands
```bash
npm run dev          # Vite dev server (port 5173) - runs in client/ dir
npm run build        # TypeScript + Vite production build 
npm run preview      # Test production build locally
```

### API Environment Detection (`lib/queryClient.ts`)
```typescript
// Development: Vite proxy forwards /api to production (NOT localhost)
<!-- // vite.config.ts proxy target: 'https://flowerschoolbengaluru.com' -->
const baseUrl = import.meta.env.VITE_API_URL || 'https:/flowerschoolbengaluru.com';

// All API calls use credentials: "include" for session cookies
const res = await fetch(fullUrl, { credentials: "include" });
```

⚠️ **API PROXY CRITICAL**: Development mode proxies to production backend, NOT localhost:5000

## State Management Architecture

### Provider Nesting Pattern (`App.tsx`)
```typescript
// EXACT order required - user data fetched inside CartProvider scope
QueryClientProvider → AuthProvider → AppWithCart → CartProvider → TooltipProvider → Router

// CartProvider requires userId from auth context:
const { data: user } = useQuery<User>({ queryKey: ["/api/auth/user"] });
<CartProvider userId={user?.id}>
```

### Cart Context - Core Business Logic (`hooks/cart-context.tsx` - 1,234 lines)
**The central state management hub** - most components interact with this:

```typescript
const {
  items, totalPrice, finalAmount,          // Cart state
  addToCart, updateQuantity, clearCart,    // Cart operations
  applyCoupon, removeCoupon,               // Coupon system
  setShippingAddress, deliveryOption,      // Shipping logic
  paymentData, setPaymentMethod           // Payment integration
} = useCart();

// Critical: All cart operations are async and call backend APIs
await addToCart(product, quantity);
await applyCoupon(couponCode);
```

### TanStack Query Standards (`lib/queryClient.ts`)
```typescript
// Global configuration: no retries, infinite staleTime, credentials included
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: Infinity },
    mutations: { retry: false }
  }
});

// Error handling pattern: prefers JSON.message/error, falls back to raw text
const userMessage = (parsed?.message || parsed?.error) || raw || `HTTP ${res.status}`;
```

## Router & Navigation (Wouter, NOT React Router)

### Wouter API Differences
```typescript
import { Switch, Route, useLocation } from "wouter";

// Navigation: setLocation (NOT useNavigate)
import { setLocation } from "wouter/use-location";
setLocation("/product/123");

// Current route: useLocation hook
const [location] = useLocation();
```

### Route Patterns (`App.tsx`)
```typescript
<Route path="/category/:categoryId" component={MainCategoryAllProducts} />
<Route path="/product/:id" component={ProductDetail} />
<Route path="/order-confirmation/:orderId" component={OrderConfirmation} />
```

## UI Component Architecture

### File Naming Convention (Mixed Pattern)
```
pages/                  # PascalCase pages
├── ProductDetail.tsx   
├── MainCategoryAllProducts.tsx
└── ProductsListing.tsx

components/             # kebab-case features
├── fresh-flowers-section.tsx
├── checkout-steps.tsx
└── ui/                # shadcn/ui components
    ├── button.tsx
    └── dialog.tsx
```

### shadcn/ui Integration
- **Style**: "new-york" variant with neutral base colors
- **Import Path**: `@/components/ui/[component]`
- **Theme**: HSL CSS variables with alpha channel support

## Critical Business Logic Patterns

### Product Data Structure (`shared/schema.ts`)
```typescript
interface Product {
  // Multiple image support - check all 5 fields
  imagefirst?: string; imagesecond?: string; imagethirder?: string; 
  imagefoure?: string; imagefive?: string;
  
  // Dual stock field compatibility
  stockquantity?: number;   // Backend snake_case
  stockQuantity?: number;   // Frontend camelCase
  
  // Category hierarchy
  main_category?: string;   // Top level (flowers, gifts, etc.)
  category?: string;        // Mid level
  subcategory?: string;     // Specific type
}
```

### Payment Integration (`lib/razorpay.ts`)
```typescript
// Dynamic script loading pattern
export const loadRazorpay = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    // Handles async Razorpay SDK loading
  });
};

// Payment methods: 'card', 'upi', 'netbanking', 'cod', 'qrcode'
```

### Complex URL State Sync (`ProductsListing.tsx` - 1,200+ lines)
```typescript
// Syncs filter state with URL parameters for shareable links
const [urlParams, setUrlParams] = useState(() => {
  const searchParams = new URLSearchParams(window.location.search);
  return {
    main_category: searchParams.get('main_category'),
    subcategory: searchParams.get('subcategory'),
    search: searchParams.get('search')
  };
});

// Listens to popstate for browser navigation
useEffect(() => {
  const handleUrlChange = () => { /* sync URL to state */ };
  window.addEventListener('popstate', handleUrlChange);
}, []);
```

## Common Gotchas & Project-Specific Patterns

### 1. **Multi-Project Workspace Confusion**
```bash
# ALWAYS verify you're in the e-commerce project directory
pwd  # Should show: .../flowerschoolbengaluru-e-commese
npm run dev  # Runs in client/ subdirectory automatically
```

### 2. **Router API Differences (Wouter vs React Router)**
```typescript
// ❌ React Router patterns DON'T work
import { useNavigate } from "react-router-dom";  // NOT available
const navigate = useNavigate();  // NOT available

// ✅ Use Wouter patterns instead
import { setLocation, useLocation } from "wouter";
setLocation("/product/123");  // For programmatic navigation
const [location] = useLocation();  // For current route
```

### 3. **Product Image Field Complexity**
```typescript
// Products have 5 potential image fields - check them all
const getProductImage = (product: Product) => {
  return product.imagefirst || product.imagesecond || 
         product.imagethirder || product.imagefoure || 
         product.imagefive || product.image;
};

// Dual stock compatibility patterns
const stockLevel = product.stockQuantity ?? product.stockquantity ?? 0;
```

### 4. **Cart Context Integration Pattern**
```typescript
// Cart operations are async - always await
const handleAddToCart = async () => {
  try {
    await addToCart(product, quantity);
    // Success handling
  } catch (error) {
    // Error is automatically set in cart context
    console.error("Cart error:", error);
  }
};
```

### 5. **API Environment Detection**
```typescript
// Development proxy targets PRODUCTION, not localhost
// vite.config.ts: proxy: { '/api': { target: 'https://flowerschoolbengaluru.com' }}
// This means dev mode hits real backend - be careful with test data
```

### 6. **TanStack Query Configuration Specifics**
```typescript
// Global settings: no retries, infinite stale time, no window refocus
// All queries return null on 401 (unauthorized) instead of throwing
const { data } = useQuery({
  queryKey: ["/api/products"],
  // Uses global queryFn with credential inclusion
});
```

## Quick Development Checklist

1. ✅ Verify project directory: `flowerschoolbengaluru-e-commese/`
2. ✅ Check API connectivity: Network tab should show `/api/` requests to production
3. ✅ Import paths use `@/` alias for `client/src/`
4. ✅ Use Wouter navigation: `setLocation()`, not `useNavigate()`
5. ✅ Cart operations: Always `await` cart context methods
6. ✅ Product images: Check all 5 image fields (`imagefirst` through `imagefive`)
7. ✅ Stock compatibility: Handle both `stockQuantity` and `stockquantity`
8. ✅ shadcn/ui components: Import from `@/components/ui/`

