

# AI Coding Instructions for Flower School E-Commerce

## Architecture Overview

- **Monorepo Structure:**
  - Frontend: React 18 + Vite + TypeScript (`client/`)
  - Backend: Express.js, Drizzle ORM, Postgres (`flowerschoolbengaluru-back-end/`)
  - Shared types: `client/src/shared/schema.ts` and `flowerschoolbengaluru-back-end/shared/schema.ts`

- **Frontend UI:**
  - Uses shadcn/ui (New York theme), Radix UI, Tailwind CSS
  - Routing: Wouter only (do NOT use React Router)
  - Payment: Razorpay loaded dynamically (`client/src/lib/razorpay.ts`)
  - Cart: Async context, localStorage for guests, backend for users (`client/src/hooks/cart-context.tsx`)
  - Product images: Always check all image fields (`imagefirst` ... `imagefive`, fallback to `image`)
  - Stock: Support both `stockQuantity` and `stockquantity`

- **Backend:**
  - API requests in dev are proxied to production backend (`flowerschoolbengaluru.com`)
  - Orders require authentication; redirect to `/signin` if not logged in
  - Delivery charges are always zero (see `checkout.tsx`)

## Key Patterns & Conventions

- **Navigation:** Use `setLocation("/route")` from Wouter for navigation
- **Component Imports:** Use `@/components/ui/[component]` for UI elements
- **TanStack Query:**
  - No retries, infinite stale time, no refetch on window focus
  - Queries return `null` on 401 (not thrown)
- **Cart Context:**
  - All cart operations are async/await
  - Cart state merges guest cart to user cart on login
- **Payment:** Razorpay loaded dynamically, see `lib/razorpay.ts`
- **Product Images:** Always check all image fields for display
- **Stock Quantity:** Support both `stockQuantity` and `stockquantity`
- **Order Placement:** Requires authentication
- **API Proxy:** All `/api/` requests in dev go to production

## Developer Workflows

- **Frontend:**
  - Start dev server: `npm run dev` (from `client/`)
  - Edit UI in `client/src/components/ui/` or page logic in `client/src/pages/`
  - Use Wouter for navigation/routing
  - Use async/await for cart and payment actions
- **Backend:**
  - Start dev server: `npm run dev` (from `flowerschoolbengaluru-back-end/`)
  - Build: `npm run build`
  - Deploy: `npm run deploy` (uses PM2)
  - Docker: `docker-compose up` for full stack
  - Logs/status: `npm run logs` / `npm run status` (PM2)

## Directory Highlights

- `client/src/pages/` — Main pages (e.g., `checkout.tsx`, `shop.tsx`, `product-detail.tsx`)
- `client/src/components/ui/` — Custom shadcn UI components
- `client/src/hooks/` — Custom hooks (e.g., `cart-context.tsx`)
- `client/src/lib/` — API, payment, and utility logic
- `client/src/shared/schema.ts` — Product/data schemas/types
- `flowerschoolbengaluru-back-end/shared/schema.ts` — Backend DB schemas/types

## Project-Specific Gotchas

- Do NOT use React Router; only Wouter is supported
- Delivery charges are always zero
- Cart logic merges guest cart to user cart on login
- API requests in dev go to production backend; avoid test data pollution
- Product images: always check all image fields for display
- Stock: support both `stockQuantity` and `stockquantity`
- Orders require authentication

## Example Workflow

1. Start dev server: `npm run dev` (from `client/` or backend folder)
2. Edit UI in `client/src/components/ui/` or page logic in `client/src/pages/`
3. Use Wouter for navigation/routing
4. Always check all product image fields and both stock quantity fields
5. Use async/await for cart and payment actions
6. For backend, use PM2 and Docker Compose for production/deployment

---
If any section is unclear or missing, please provide feedback for further refinement.

