



# Workspace AI Coding Agent Guide — Flower School E-Commerce & Admin

## Big Picture Architecture

- **Monorepo**: Three main apps — E-Commerce Frontend, Admin Frontend, Backend API. Shared conventions and some types.
- **Frontend (BouquetBarBengaluru-E-Commerce-Frontend-Code)**: React 18, Vite, TypeScript, shadcn/ui, Radix UI, Tailwind CSS. Routing via Wouter (`setLocation`). Async cart context merges guest/user carts. Product images: check all fields (`imagefirst`...`imagefive`, fallback to `image`). Stock: support both `stockQuantity` and `stockquantity`.
- **Admin Frontend (FlowerSchool-Admin-Frontend-Code)**: Vite + React + TypeScript SPA. UI via shadcn-ui, Tailwind. Route-level logic in `src/pages`, shared UI/features in `src/components`. API calls via `src/lib/api.ts` and React Query. Product/category/discount logic in `Admin.tsx`.
- **Backend (FlowerSchool-E-commerce-Admin-allBackend-Code)**: TypeScript Express.js monolith. All business logic, API endpoints, and integrations in one codebase. Data access via storage abstraction (`storage.ts`, `database-storage.ts`). Background jobs, notifications, message queue, and email logic in `/services`. Database schema and Zod validation in `/shared/schema.ts` (Drizzle ORM, no migration system).

## Critical Developer Workflows

- **Frontend**: `npm run dev` (from `client/` or `src/`), edit UI in `src/components/ui/`, pages in `src/pages/`. Use async/await for cart/payment actions. API calls via `src/lib/api.ts`.
- **Admin Frontend**: `npm i`, `npm run dev`, build with `npm run build`. Deploy via Lovable platform (see `README.md`). Containerization: see `Dockerfile`, `nginx.conf`.
- **Backend**: `npm run dev` (tsx watch), `npm run backend` (alias), `npm run logs` (PM2 logs), `docker-compose up -d` (Postgres + backend), `docker-compose logs -f`. Schema changes: edit `shared/schema.ts` directly, then restart backend.

## Project-Specific Patterns & Conventions

- **Frontend**: Use Wouter for navigation (`setLocation`). UI via shadcn-ui in `src/components/ui`. TanStack Query: no retries, infinite stale time, no refetch on window focus; queries return `null` on 401. Cart context ops are async/await. Product images: check all image fields. Stock: support both `stockQuantity` and `stockquantity`. API proxy: all `/api/` requests in dev go to production.
- **Admin Frontend**: Page logic in `src/pages`, not components. API calls via `src/lib/api.ts`. Use custom hooks for reusable logic. Product discount logic: handled in `Admin.tsx` with auto-calculation and preview. Style exclusively with Tailwind CSS.
- **Backend**: All data access via storage layer (`storage.ts`). Session management: in-memory sessions in `routes.ts`, manual cleanup. Order status: auto-progress via `services/background-scheduler.ts`. Notifications: use try/catch, templates in `/templates`. Category system: hardcoded master data in `routes.ts`. File uploads: `express-fileupload` and `multer` (50MB limit), local only. API structure: all endpoints in `routes.ts`.

## Integration Points

- **Payments**: Razorpay integration in frontend (`client/src/lib/razorpay.ts`) and backend (`routes.ts`).
- **Email**: SendGrid via `services/email-service.ts` (config in `config.ts`).
- **SMS/WhatsApp**: Twilio via `services/notification-service.ts` (templates in `/templates`).
- **SEO**: Managed in `src/components/SEO.tsx` (Admin Frontend).
- **Nginx/Docker**: See `nginx.conf`, `Dockerfile` for deployment config.

## Key Examples & References

- Add a page: Create in `src/pages`, add route in `main.tsx` (frontend/admin).
- Add UI: Use shadcn-ui pattern in `src/components/ui`.
- Fetch data: Use React Query via `src/lib/queryClient.ts` (admin/frontend).
- Product CRUD: See `Admin.tsx` for forms, image upload, category/discount logic.
- Backend endpoints: All in `routes.ts` (~6500+ lines).
- Database: Drizzle ORM tables/Zod schemas in `shared/schema.ts`. Access via `storage.ts` only.

## Debugging & Testing

- **No test framework**: Add Jest/Vitest if needed.
- **Logging**: Request timing middleware in `index.ts` (backend).
- **PM2**: Production process manager (`ecosystem.config.json`).
- **Docker**: Multi-stage build, Postgres service.

---
If any section is unclear, incomplete, or missing, please provide feedback or review referenced files for clarification. These instructions are living documentation—improvements are welcome.
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

