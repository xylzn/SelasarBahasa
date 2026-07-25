# SELASAR BAHASA — AGENT RULES

## PROJECT CONTEXT
Cohort-based BIPA LMS. External payments (no payment gateway in-app).
Stack: Next.js 16 App Router · TypeScript · Prisma 5 (Postgres/Supabase) · NextAuth v5 · Supabase Storage · Tailwind · Upstash Redis · Resend email · custom i18n (`src/messages/`).

## ⚡ INSTALL / MIGRATE / BUILD — RULES
**NEVER run these commands autonomously. Always present as manual steps for the developer:**
- `npm install` / `npm ci`
- `npx prisma migrate dev` / `npx prisma migrate deploy` / `npx prisma generate`
- `npm run build` / `next build`
- `npx prisma db push` / `npx prisma db seed`

**You CAN run these freely (read-only / safe):**
- `cat`, `find`, `grep`, `ls`, `head`, `tail` (inspect files)
- `npx tsc --noEmit` (type check only, no writes)
- `npx prisma validate` (validate schema, no writes)

**When a schema change is needed, output:**
1. The exact schema diff (what to add/change)
2. The migration command to run: `npx prisma migrate dev --name <nama-migration>`
3. Any data migration SQL if needed
Then STOP. Do not auto-run.

## 🗄️ DATABASE SCHEMA — SISTEM ENROLLMENT BARU
## 🛑 GUARDRAILS
1. **STORAGE/UPLOAD:** NEVER modify `src/lib/supabase-storage.ts` or `src/app/api/upload/`
2. **PDF READER:** NEVER modify `PdfViewer.tsx`
3. **CORE CRUD:** DO NOT rewrite existing working CRUD (Artikel/Tugas/Materi/Quiz admin forms). ONLY change what is specified.
4. **i18n:** ALL new UI strings MUST use existing i18n dictionaries in `src/messages/`. NO hardcoded UI strings.
5. **VIDEO EMBED:** MUST include `?controls=0&modestbranding=1&rel=0&disablekb=1` AND `onContextMenu={(e) => e.preventDefault()}` wrapper.
6. **SECURITY — QUIZ:** endpoint GET soal TIDAK BOLEH include field `isCorrect` di response. Gunakan explicit `select` yang exclude `isCorrect`.

## 🤖 OUTPUT FORMAT
1. NO fluff/greetings. Start immediately with action.
2. For existing files: output ONLY changed sections with `// ... existing code ...`
3. End with bullet list: files changed + what logic was added (concise).
4. No essays. Assume Senior Developer audience.