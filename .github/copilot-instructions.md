# AI Coding Instructions for Flower School E-Commerce Frontend

## Workspace & Architecture

- **Location:** This is the e-commerce frontend (`flowerschoolbengaluru-e-commese/`) in a multi-app workspace. Always confirm you are in this directory before making changes.
- **Frontend:** React 18 + Vite + TypeScript (main code in `client/`)
- **UI:** shadcn/ui (New York theme), Radix UI, Tailwind CSS
- **Routing:** Uses Wouter (not React Router)
- **Backend:** API requests proxy to production Express.js backend (`flowerschoolbengaluru.com`) even in dev mode

## Key Patterns & Conventions

- **Wouter Navigation:**
  - Use `setLocation("/route")` for navigation, not `useNavigate`.
  - Example: `import { setLocation } from "wouter"; setLocation("/product/123");`
- **Component Imports:** Use `@/components/ui/[component]` for UI elements.
- **Product Images:** Products may have up to 5 image fields (`imagefirst` ... `imagefive`). Always check all fields for display.
  - Example: `product.imagefirst || product.imagesecond || ... || product.image`
- **Stock Quantity:** Support both `stockQuantity` and `stockquantity` fields.
- **Cart Context:** All cart operations are async and must be awaited. Errors are handled in context.
  - Example: `await addToCart(product, quantity);`
- **TanStack Query:**
  - No retries, infinite stale time, no refetch on window focus
  - Queries return `null` on 401 (not thrown)
- **Payment Integration:** Razorpay is loaded dynamically (`lib/razorpay.ts`). Use provided async loader and handler patterns.
- **API Proxy:** All `/api/` requests in dev go to production, not localhost. Avoid test data pollution.

## Directory Structure Highlights

- `client/src/pages/` — Main pages (e.g., `checkout.tsx`, `shop.tsx`, `product-detail.tsx`)
- `client/src/components/` — Shared and UI components
- `client/src/hooks/` — Custom hooks (e.g., `cart-context.tsx`)
- `client/src/shared/schema.ts` — Product and data schemas
- `client/src/lib/` — API, payment, and utility logic

## Common Gotchas

- **Do not use React Router patterns.** Only Wouter is supported.
- **Dev server (`npm run dev`) runs from `client/` automatically.**
- **Delivery charges and payment logic:** See `checkout.tsx` for dynamic messaging and calculation patterns.
- **Order placement requires authentication.** Redirect to `/signin` if not logged in.

## Example Workflow

1. Start dev server: `npm run dev` (from project root)
2. Edit UI in `client/src/components/ui/` or page logic in `client/src/pages/`
3. Use Wouter for navigation and routing
4. Always check all product image fields and both stock quantity fields
5. Use async/await for cart and payment actions

---
If any section is unclear or missing, please provide feedback for further refinement.

