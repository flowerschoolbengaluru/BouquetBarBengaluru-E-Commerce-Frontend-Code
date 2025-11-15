# AI Coding Instructions for Flower School E-Commerce

## Multi-Project Workspace Architecture

This workspace contains **three interconnected applications** for Flower School Bengaluru:
- **`flowerschoolbengaluru-e-commese/`** - Main e-commerce frontend (React + Vite)
- **`flowerschoolbengaluru-code/`** - Course enrollment frontend (React + Vite) 
- **`flowerschoolbengaluru-back-end/`** - Unified Express.js backend serving both frontends

⚠️ **CRITICAL**: When working in this workspace, identify which project you're in and use the correct patterns for that specific codebase.

## Current Project: E-Commerce Frontend (`flowerschoolbengaluru-e-commese/`)

### Architecture Overview
- **Frontend**: React 18 + Vite + TypeScript in `client/` directory
- **Backend**: Shared Express.js server at `../flowerschoolbengaluru-back-end/`
- **UI Framework**: shadcn/ui components with Radix UI and Tailwind CSS
- **Router**: Wouter (lightweight alternative to React Router)
- **State Management**: React Context (CartProvider, AuthProvider) + TanStack Query
- **Database**: PostgreSQL with Drizzle ORM (external deployment)

### Key File Locations & Import Patterns

```typescript
// Import aliases (vite.config.ts)
"@" → "client/src"
"@shared" → "client/src/shared" 
"@assets" → "attached_assets"

// Directory structure
client/src/
├── components/         # React components (kebab-case naming)
├── hooks/             # Custom hooks and context providers
├── pages/             # Page components (PascalCase naming)
├── shared/schema.ts   # Core shared TypeScript interfaces
├── types/             # Additional type definitions
└── lib/               # Utilities, API client, auth logic
```

## Critical Development Workflows

### Development Commands
```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # TypeScript compilation + Vite build
npm run preview      # Preview production build locally
npm run lint         # ESLint validation
cd ../flowerschoolbengaluru-back-end && npm run dev  # Start backend server
```

### Environment Configuration
- **Development**: Vite dev proxy forwards `/api` requests to `localhost:5000`
- **Production**: `VITE_API_URL=https://flowerschoolbengaluru.com` (defaults to production if unset)
- **API Client**: Environment detection in `lib/queryClient.ts` with smart URL resolution
- **Database**: Drizzle config in `drizzle.config.ts` requires `DATABASE_URL` (migrations only)

## Core State Management Patterns

### Nested Provider Architecture (App.tsx)
```typescript
QueryClientProvider → TooltipProvider → CartProvider → AuthProvider → Router
```

### Cart Context (`hooks/cart-context.tsx`) - 1,230+ lines
The **central business logic hub** managing:
- Cart state, payment methods, delivery options, coupons
- API integration for products and order processing  
- Key methods: `addToCart()`, `removeFromCart()`, `applyCoupon()`
- Usage: `const { items, addToCart, totalPrice } = useCart();`

### Authentication (`hooks/user-auth.tsx`)
- Session storage with cross-tab synchronization
- Custom events for auth state changes
- Usage: `const { user, login, logout, isAuthenticated } = useAuth();`

### API Integration Pattern (`lib/queryClient.ts`)
```typescript
// Standardized error handling with JSON/text parsing
const response = await apiRequest('/api/products', { method: 'GET' });

// TanStack Query patterns across pages
const { data: products } = useQuery({
  queryKey: ['products', categoryId],
  queryFn: () => apiRequest(`/api/products?category=${categoryId}`)
});
```

## UI Component Conventions

### shadcn/ui Configuration
- **Style**: "new-york" style from `components.json`
- **Base Color**: Neutral with CSS variables
- **Path**: `@/components/ui/`

### Component Naming Patterns
```typescript
// Page components: PascalCase
ProductDetail.tsx, MainCategoryAllProducts.tsx, FlowerCategory.tsx

// Feature components: kebab-case  
fresh-flowers-section.tsx, checkout-steps.tsx

// UI components: kebab-case (shadcn convention)
button.tsx, card.tsx, dialog.tsx
```

### Styling System
- **Primary**: Tailwind CSS with extensive custom CSS variables
- **Theme**: HSL format with alpha channels (`hsl(var(--primary) / <alpha-value>)`)
- **Responsive**: Mobile-first with standard Tailwind breakpoints

## Key Integration Points & Business Logic

### Payment System
- **Gateway**: Razorpay integration in `lib/razorpay.ts`
- **Methods**: Card, UPI, Net Banking, COD, QR Code
- **Flow**: Managed through CartContext with transaction tracking

### Product & Category Management
```typescript
// Product interface has 5 image fields
interface Product {
  imagefirst?: string;    // Primary product image
  imagesecond?: string;   // Secondary view
  imagethirder?: string;  // Third angle
  imagefoure?: string;    // Fourth view
  imagefive?: string;     // Additional image
  stockquantity?: number; // Backend compatibility
  stockQuantity?: number; // Frontend usage
}

// Dynamic category routing
<Route path="/category/:categoryId" component={MainCategoryAllProducts} />
```

### Location & Delivery Services
- **Detection**: `location-detector.tsx` for automatic address detection
- **Options**: Distance-based delivery calculations
- **Management**: Full CRUD address operations in checkout flow

## Docker & Deployment

### Multi-stage Dockerfile
```dockerfile
# Stage 1: Build (Node.js + TypeScript compilation)
# Stage 2: Serve (Nginx with optimized SPA configuration)
```

### Nginx Configuration Highlights
- **SPA Support**: `try_files $uri /index.html` for client-side routing
- **Security**: CSP headers, XSS protection, frame options
- **Performance**: Gzip compression, static asset caching

## Critical Development Patterns

### TanStack Query Usage
```typescript
// Standard query pattern across pages
const { data: products, isLoading, error } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => apiRequest(`/api/products${buildQueryString(filters)}`)
});

// Mutation pattern for cart operations
const addItemMutation = useMutation({
  mutationFn: (item: CartItem) => apiRequest('/api/cart/add', { 
    method: 'POST', 
    body: JSON.stringify(item) 
  }),
  onSuccess: () => queryClient.invalidateQueries(['cart'])
});
```

### Context Provider Patterns
```typescript
// Cart context usage - central to most components
const { 
  items, 
  addToCart, 
  removeFromCart, 
  totalPrice, 
  appliedCoupons,
  deliveryOptions 
} = useCart();

// Authentication context
const { user, isAuthenticated, login, logout } = useAuth();
```

### URL State Management Pattern (`ProductsListing.tsx`)
```typescript
// Reactive URL parameter system for filters and search
const [urlParams, setUrlParams] = useState(() => {
  const searchParams = new URLSearchParams(window.location.search);
  return {
    main_category: searchParams.get('main_category') ? decodeURIComponent(searchParams.get('main_category')!) : null,
    subcategory: searchParams.get('subcategory') ? decodeURIComponent(searchParams.get('subcategory')!) : null,
    search: searchParams.get('search') ? decodeURIComponent(searchParams.get('search')!) : null,
  };
});

// Listen for URL changes (from navigation, ShopNav, etc.)
useEffect(() => {
  const handleUrlChange = () => {
    // Parse new URL parameters and update local state
  };
  window.addEventListener('popstate', handleUrlChange);
  return () => window.removeEventListener('popstate', handleUrlChange);
}, []);
```

## Common Development Gotchas & Patterns

1. **Multi-Project Workspace**: Ensure you're in correct directory (`flowerschoolbengaluru-e-commese/`)
2. **API Proxy**: Development uses Vite proxy (see `vite.config.ts`) - `/api` routes auto-forward
3. **Router Differences**: Wouter uses `useLocation()` and `setLocation()`, not React Router's `useNavigate()`
4. **Image Fields**: Products have 5 image properties (`imagefirst` through `imagefive`) - check which contains data
5. **Stock Fields**: Both `stockquantity` (backend) and `stockQuantity` (frontend) exist for compatibility
6. **Auth Storage**: Uses sessionStorage - auth doesn't persist across browser restarts by design
7. **File Naming**: Pages are PascalCase, components are kebab-case (mixed convention)
8. **Large Components**: `ProductsListing.tsx` (1,200+ lines) manages complex filtering with URL state sync
9. **URL State Management**: Search/filter params are synced with browser URL for shareable links
10. **Best Seller Field**: Products use both `isbestseller` and `isBestSeller` for backend compatibility

## Quick Start Checklist

1. Verify `DATABASE_URL` environment variable (for migrations only)
2. Confirm external backend availability at configured `VITE_API_URL`
3. Install dependencies: `npm install`
4. Start development: `npm run dev`
5. Test API connectivity by checking network tab for `/api/` requests
6. Verify shadcn/ui components work: Import from `@/components/ui/`
7. Test cart functionality: CartContext is the central business logic hub