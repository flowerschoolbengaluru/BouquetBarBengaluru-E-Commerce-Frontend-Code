


# AI Coding Agent Instructions — Flower School E-Commerce

## Architecture Overview

- **Monorepo:**
  - Frontend: React 18 + Vite + TypeScript (`client/`)
  - Backend: Express.js, Drizzle ORM, PostgreSQL (`flowerschoolbengaluru-back-end/`)
  - Shared types: `client/src/shared/schema.ts` and `flowerschoolbengaluru-back-end/shared/schema.ts`

- **Frontend:**
  - UI: shadcn/ui (New York theme), Radix UI, Tailwind CSS
  - Routing: **Wouter only** (`setLocation` for navigation)
  - Payment: Razorpay loaded dynamically (`client/src/lib/razorpay.ts`)
  - Cart: Async context, merges guest cart to user cart on login (`client/src/hooks/cart-context.tsx`)
  - Product images: Always check all image fields (`imagefirst` ... `imagefive`, fallback to `image`)
  - Stock: Support both `stockQuantity` and `stockquantity`

- **Backend:**
  - API requests in dev are proxied to production backend (`flowerschoolbengaluru.com`)
  - Orders require authentication; redirect to `/signin` if not logged in
  - Delivery charges are always zero (see `checkout.tsx`)
  - All data access via storage layer (`storage.ts`), never direct DB calls

## Key Patterns & Conventions

- **Navigation:** Use `setLocation("/route")` from Wouter (never React Router)
- **Component Imports:** Use `@/components/ui/[component]` for UI
- **TanStack Query:** No retries, infinite stale time, no refetch on window focus; queries return `null` on 401
- **Cart Context:** All cart ops are async/await; merges guest cart to user cart on login
- **Product Images:** Always check all image fields for display
- **Stock Quantity:** Support both `stockQuantity` and `stockquantity`
- **Order Placement:** Requires authentication
- **API Proxy:** All `/api/` requests in dev go to production
- **Backend Storage:** Use `storage.ts` for all DB access (e.g., `storage.getUser(id)`)

## Developer Workflows

- **Frontend:**
  - Start: `npm run dev` (from `client/`)
  - UI: Edit in `client/src/components/ui/`, pages in `client/src/pages/`
  - Use async/await for cart/payment actions
- **Backend:**
  - Start: `npm run dev` (from `flowerschoolbengaluru-back-end/`)
  - Build: `npm run build`
  - Deploy: `npm run deploy` (PM2)
  - Docker: `docker-compose up` for full stack
  - Logs: `npm run logs` / `npm run status` (PM2)
  - Schema: Edit `shared/schema.ts` directly, then restart backend

## Directory Highlights

- `client/src/pages/` — Main pages (e.g., `checkout.tsx`, `shop.tsx`)
- `client/src/components/ui/` — Custom shadcn UI components
- `client/src/hooks/` — Custom hooks (e.g., `cart-context.tsx`)
- `client/src/lib/` — API, payment, and utility logic
- `client/src/shared/schema.ts` — Product/data schemas/types
- `flowerschoolbengaluru-back-end/shared/schema.ts` — Backend DB schemas/types
- `flowerschoolbengaluru-back-end/services/` — Background jobs, notifications, email, queue
- `flowerschoolbengaluru-back-end/routes.ts` — All API endpoints

## Project-Specific Gotchas

- **Never use React Router**; only Wouter is supported
- **Delivery charges are always zero**
- **Cart merges guest to user cart on login**
- **API requests in dev go to production backend**; avoid test data pollution
- **Product images:** always check all image fields for display
- **Stock:** support both `stockQuantity` and `stockquantity`
- **Orders require authentication**
- **Backend:** Never bypass storage layer; always use `storage.ts`

## Example Patterns

**Wouter Navigation:**
```ts
import { setLocation } from "wouter";
setLocation("/shop");
```

**Cart Context Usage:**
```ts
const { addToCart } = useCart();
await addToCart(product, quantity);
```

**Backend Storage Access:**
```ts
const user = await storage.getUser(id);
```

---
If any section is unclear or missing, please provide feedback for further refinement.

