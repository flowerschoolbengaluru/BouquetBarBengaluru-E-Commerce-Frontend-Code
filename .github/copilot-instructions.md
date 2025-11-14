# AI Coding Instructions for Flower School E-Commerce

## Project Architecture

This is a **full-stack TypeScript e-commerce application** for Flower School Bengaluru featuring:
- **Frontend**: React 18 + Vite + TypeScript in `client/` directory
- **Backend**: Express.js with Drizzle ORM and PostgreSQL (NeonDB)
- **UI Framework**: shadcn/ui components with Radix UI and Tailwind CSS
- **Router**: Wouter (lightweight alternative to React Router)
- **State Management**: React Context (CartProvider, AuthProvider) + TanStack Query

## Key File Locations & Conventions

### Directory Structure
- `client/src/` - All frontend code
- `client/src/components/` - React components (kebab-case naming)
- `client/src/hooks/` - Custom hooks and context providers
- `client/src/pages/` - Page components (PascalCase naming)
- `client/src/shared/schema.ts` - Shared TypeScript interfaces
- `client/src/lib/` - Utilities, API client, authentication logic

### Import Aliases (configured in `vite.config.ts`)
```typescript
"@" → "client/src"
"@shared" → "client/src/shared" 
"@assets" → "attached_assets"
```

## Critical Development Workflows

### Development Commands
```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # TypeScript compilation + Vite build
npm run backend      # Start backend (cd server && npm run backend)
```

### Database & Schema
- **ORM**: Drizzle with config in `drizzle.config.ts`
- **Schema**: Shared types in `client/src/shared/schema.ts`
- **Migrations**: Generated in `./migrations/` directory
- **Database URL**: Must be set in `DATABASE_URL` environment variable

## Component & State Patterns

### Context Providers Architecture
The app uses a **nested provider pattern** in `App.tsx`:
```typescript
QueryClientProvider → TooltipProvider → CartProvider → AuthProvider → Router
```

### Cart Context (`hooks/cart-context.tsx`)
- **1,234 lines** - Central business logic hub
- Manages cart state, payment methods, delivery options, coupons
- API integration for product fetching and order processing
- Key types: `CartItem`, `PaymentData`, `AppliedCoupon`

### Authentication (`hooks/user-auth.tsx`)
- Session storage with cross-tab synchronization
- Custom events for auth state updates
- Integration with `lib/auth.ts` for storage management

### API Integration Pattern
- **Base client**: `lib/api.ts` with environment-aware URL handling
- **TanStack Query**: Used in `lib/queryClient.ts` for server state
- **API Base URL**: Uses `VITE_API_URL` or defaults to `https://flowerschoolbengaluru.com`

## UI Component Conventions

### shadcn/ui Setup
- **Config**: `components.json` with "new-york" style
- **Base Color**: Neutral with CSS variables enabled
- **Components Path**: `@/components/ui/`

### Component Naming
- **Page components**: PascalCase (`ProductDetail`, `MainCategoryAllProducts`)
- **Feature components**: kebab-case (`fresh-flowers-section.tsx`, `checkout-steps.tsx`)
- **UI components**: kebab-case following shadcn conventions

### Styling System
- **Primary**: Tailwind CSS with extensive custom color variables
- **Theme**: CSS variables in HSL format with alpha value support
- **Responsive**: Mobile-first approach with standard Tailwind breakpoints

## Key Integration Points

### Payment System
- **Razorpay Integration**: Configured in `lib/razorpay.ts`
- **Payment Methods**: Card, UPI, Net Banking, COD, QR Code
- **Payment Flow**: Handled through CartContext with transaction ID tracking

### Location Services
- **Component**: `location-detector.tsx` for address detection
- **Delivery**: Distance-based delivery options in `delivery-options.tsx`
- **Address Management**: Full CRUD in `address-manager.tsx`

### Product Architecture
- **Types**: Complex Product interface with multiple image fields (`imagefirst`, `imagesecond`, etc.)
- **Categories**: Dynamic category routing via `/category/:categoryId`
- **Inventory**: Dual stock quantity fields for backend compatibility

## Docker & Deployment

### Multi-stage Build
```dockerfile
# Builder stage: Node.js build
# Production stage: Nginx with optimized config
```

### Nginx Configuration
- **SPA Routing**: `try_files` handles client-side routing
- **Security Headers**: CSP, XSS protection, frame options
- **Compression**: Gzip enabled for static assets

## Development Best Practices

### TypeScript Patterns
- **Shared Types**: Centralized in `shared/schema.ts`
- **Interface Naming**: Clear, descriptive names (`CartItem extends Product`)
- **Optional Fields**: Extensive use of optional properties for flexibility

### Error Handling
- **API Errors**: HTTP status-based error throwing in `apiRequest`
- **Form Validation**: Zod schemas for type-safe validation
- **Toast Notifications**: Custom hook `use-toast.ts` for user feedback

### Performance Considerations
- **Lazy Loading**: Components split by route
- **Query Caching**: TanStack Query for server state management
- **Bundle Optimization**: Vite with TypeScript compilation

## Common Gotchas

1. **Backend Script**: References `server/` directory that may not exist in current workspace
2. **Image Handling**: Products have 5 separate image fields - use appropriate field for context
3. **Router**: Wouter uses different API than React Router (location, navigate patterns)
4. **Auth Storage**: Uses sessionStorage, not localStorage - consider for persistence needs
5. **API URLs**: Production uses same domain assumption - verify backend availability

## Quick Start Checklist

1. Verify `DATABASE_URL` environment variable
2. Check if `server/` directory exists or backend is external
3. Install dependencies: `npm install`
4. Start development: `npm run dev`
5. Verify shadcn/ui components work: Test a UI component import
6. Test cart functionality: Core business logic validation