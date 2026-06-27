# SelasarBahasa - Agent Instructions

## Project Overview
Next.js 16 (App Router) + TypeScript + Prisma + NextAuth v5 beta + Upstash Redis. Indonesian language learning platform with public marketing, auth-gated learning content, and admin panel.

## Key Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Run production server
npm run lint         # ESLint (Next.js config)
npm run prisma:seed  # Seed database (tsx prisma/seed.ts)
```

## Database & Prisma
- Provider: PostgreSQL (Supabase recommended)
- Schema: `prisma/schema.prisma`
- Migrations: `prisma/migrate dev` (uses `DIRECT_URL`)
- Run migrations before seeding

## Environment Variables (see `.env.example`)
- `DATABASE_URL` - Pooled connection (PgBouncer)
- `DIRECT_URL` - Direct connection for migrations
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` - Caching
- `NEXTAUTH_SECRET` / `NEXTAUTH_URL` - Auth

## Route Groups (App Router)
| Group | Path | Purpose |
|-------|------|---------|
| `(public)` | `/`, `/login`, `/register`, `/artikel/*` | Marketing, auth, blog |
| `(dashboard)` | `/dashboard/*`, `/materi/*`, `/quiz/*` | User learning area |
| `(admin)` | `/admin/*` | Admin panel (ADMIN role only) |

## Auth & Middleware
- NextAuth v5 beta (`src/app/api/auth/[...nextauth]/route.ts`)
- Middleware: `src/middleware.ts` protects dashboard/admin routes
- Roles: `USER`, `PREMIUM`, `ADMIN` (in Prisma enum)
- Premium gating via `isPremium` on Materi/Quiz + `PremiumLockModal`

## Key Lib Modules
- `src/lib/prisma.ts` - Prisma singleton
- `src/lib/redis.ts` / `cache.ts` / `cache-keys.ts` - Upstash Redis caching
- `src/lib/rate-limit.ts` - API rate limiting
- `src/lib/api-auth.ts` - Server-side auth helpers
- `src/lib/validations/auth.ts` - Zod schemas

## Component Structure
```
src/components/
├── public/       # Landing page components
├── dashboard/    # User dashboard (Sidebar, etc.)
├── materi/       # Learning content (VideoEmbed, MateriCard)
├── quiz/         # Quiz UI (QuizRunner, QuizCard, QuizResult)
├── admin/        # Admin forms (MateriForm, QuizForm)
└── shared/       # Cross-cutting (PremiumLockModal)
```

## Testing & Quality
- No test framework configured yet
- Lint: `npm run lint` (ESLint + Next.js config)
- TypeCheck: `tsc --noEmit` (via Next.js build)

## Gotchas
- Next.js 16 uses Turbopack by default in dev
- Prisma client generated to `node_modules/@prisma/client` (not committed)
- `.env` is gitignored; copy `.env.example` to `.env` locally
- Admin routes require `role: ADMIN` in session
- Premium content checks `user.role === 'PREMIUM'` server-side