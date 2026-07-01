# SelasarBahasa - Agent Instructions

## Project Overview
Next.js 16 (App Router) + TypeScript + Prisma + NextAuth v5 beta + Upstash Redis. Indonesian language learning platform with public marketing, auth-gated learning content, and admin panel.

## Execution Policy (READ FIRST)
- The agent has full permission to use the terminal for **read-only / inspection** purposes: browsing folders, `cat`/`grep`/`find`, reading logs, `git status`, `git diff`, `git log`, checking installed versions, running the TypeScript compiler in check-only mode, etc. Use this freely to investigate before making changes.
- The agent must **NOT** run any command that installs, builds, migrates, or otherwise changes the environment or persisted state. This explicitly includes (not exhaustive): `npm install`, `npm ci`, `npm run build`, `npm run dev`, `npm run start`, `npx prisma migrate`, `npx prisma generate`, `npx prisma db push`, `npm run prisma:seed`, any package manager add/remove, and any deploy/publish command.
- Instead, whenever a task requires one of those commands, the agent must **stop and hand it back** as a numbered list of exact commands (with a short explanation of what each does and why it's needed) for the user to run themselves in their own terminal. The user will report back the output/result before the agent continues.
- Same rule applies to git: the agent can inspect (`status`, `diff`, `log`), but should not `commit`, `push`, or `pull` on its own — hand those steps back too, unless the user explicitly says otherwise for that session.
- Goal: keep the agent efficient by not repeatedly failing/retrying installs or long builds — let the user run the heavy/stateful steps once, correctly, while the agent focuses on code changes and diagnosis.

## Efficiency / Usage-Limit Guidelines
The agent has a usage limit (messages/tokens/tool-calls), so work economically **without cutting corners on correctness**:
- **Plan before executing.** For any task touching more than 1 file, first list out (briefly) which files you'll touch and why, then execute in one focused pass — avoid trial-and-error loops where you edit, run something, guess, re-edit.
- **Read a file once, reuse it.** Don't re-`view`/`cat` the same file repeatedly in one session unless it changed. Keep track of what you already know from earlier in the conversation/session instead of re-fetching it.
- **Search narrow, not wide.** Prefer targeted `grep`/`find` for the specific symbol/pattern you need over dumping whole directories or whole files when only a small part is relevant.
- **Batch related changes.** If a fix requires the same pattern applied to N files (e.g. an auth-check pattern across routes), do all N in one pass and report once — don't do one file, stop, ask, do the next file, stop, ask.
- **Batch the hand-back, too.** Don't interrupt the user after every single file change to ask them to run `npm run build`/`prisma migrate`/etc. Finish the full logical task first, then hand back one consolidated list of commands to run (see Execution Policy above).
- **Keep responses concise.** Explanations should be short and focused on: what changed, why, and what the user needs to do next (if anything) — skip restating context the user already knows or narrating routine steps.
- **Don't guess when inspection is cheap.** If unsure about existing behavior (e.g. "does this route already have X"), a quick `grep` is cheaper than writing speculative code and fixing it after the user reports it's wrong.


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