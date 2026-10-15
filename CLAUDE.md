# CLAUDE.md

Competition registration website. Next.js 16 (App Router, Cache Components) + Supabase (self-hosted: Postgres, Auth, Realtime) + shadcn/ui + GSAP + Zod.

## AI Assistant Guidelines
- Claude is **not a contributor or co-author** on this project. Do not add Claude to git commits, PR descriptions, or GitHub contributor lists. The user is the sole author.
- Claude provides coding assistance, debugging, and implementation guidance only.

## Package manager
- Use `pnpm` only. Never run `npm`, `npx` or `yarn`. Use `pnpm add`, `pnpm dlx`, `pnpm exec`.

## Project structure
```
src/
  app/                          routes only (page.tsx, layout.tsx, loading.tsx, error.tsx)
  features/<feature>/components/  feature-based components, e.g. features/registration/components/
  components/ui/                shadcn/ui primitives only
  components/shared/            components reused by 2+ features
  hooks/                        every React hook, one per file: use-<name>.ts
  types/                        every interface and type alias: <domain>.ts
  lib/
    supabase/                   server.ts, client.ts (Supabase clients)
    data/<domain>.ts            server-side reads (queries)
    actions/<domain>.ts         Server Actions ("use server") for create/update/delete
    validations/<domain>.ts     Zod schemas
    utils.ts                    cn() and small helpers
```
- Pages are thin: they fetch data through `src/lib/data` and compose feature components.
- A component used by only one feature stays in that feature's folder. Move it to `components/shared/` once a second feature needs it.
- Hooks always go in `src/hooks/`, even when only one feature uses them. Never define a hook inside a component file.
- Interfaces and types always go in `src/types/`, including component props, hook return types and Supabase row types. Do not declare `interface` or `type` anywhere else.

## Rendering
- Pages and layouts are Server Components. Never add `"use client"` to `page.tsx` or `layout.tsx`.
- Push `"use client"` down to the smallest leaf that needs state, effects, event handlers, browser APIs, GSAP or Realtime. Pass server-fetched data into it as props.
- Every `page.tsx` must export `metadata` (static) or `generateMetadata` (dynamic, e.g. a competition detail page). The root layout also defines the default `metadata` with a `title.template`.
- `cacheComponents` is on: any data read that uses request data (Supabase server client reads cookies) must render inside a `<Suspense>` boundary, or the build fails. Wrap the data-fetching component, not the whole page.
- Session refresh and route protection go in `src/proxy.ts` (Next 16 renamed `middleware.ts` to `proxy.ts`).

## Data access (Supabase)
- Reads: functions in `src/lib/data/` using `createSupabaseServerClient()`, called directly from Server Components.
- Writes: Server Actions in `src/lib/actions/` (`"use server"` at the top of the file), called from forms or client components. Validate input with Zod first, then call Supabase, then `revalidatePath`/`revalidateTag` or `updateTag` as needed.
- Do not create `src/app/api/` route handlers for anything a Server Component or Server Action can do. Use a route handler only for external webhooks (e.g. payment callbacks) or third-party redirects.
- Files that must never reach the browser start with `import "server-only";`.
- Realtime runs in the browser: subscribe in a hook in `src/hooks/` (e.g. `use-registrations-realtime.ts`) with `createSupabaseBrowserClient()`, and remove the channel in the effect cleanup. Tables must be added to the `supabase_realtime` publication.
- Every table has Row Level Security enabled with explicit policies. The anon key is public; RLS is the actual access control.
- The service role key is server-only: name it `SUPABASE_SERVICE_ROLE_KEY` (never `NEXT_PUBLIC_`) and use it only in `server-only` files for admin tasks.
- Generate DB types with the Supabase CLI into `src/types/database.ts` and pass them to the clients.

## Validation
- Always `import { z } from "zod"`. Use it for forms, Server Action inputs, search params and env vars.
- Schemas live in `src/lib/validations/<domain>.ts`. Their inferred types live in `src/types/<domain>.ts` via `z.infer<typeof schema>` (use `import type` to import the schema).
- Validate on the server in every Server Action even if the form already validated on the client.

## Styling and animation
- Tailwind CSS v4 + shadcn/ui (`components.json`, style `base-nova`, lucide icons). Add primitives with `pnpm dlx shadcn@latest add <name>`. Do not edit generated files in `components/ui/` unless needed; wrap them instead.
- GSAP runs only in client components. Use `useGSAP` from `@gsap/react` (auto cleanup) with a `scope` ref; register plugins once with `gsap.registerPlugin(useGSAP, ...)`. Reusable animation logic goes in a hook in `src/hooks/`.
- Respect `prefers-reduced-motion` for non-essential animations.

## Environment
- Copy `.env.local.example` to `.env.local` and fill in the self-hosted Supabase URL and anon key.
- Validate env vars with a Zod schema instead of reading `process.env.X!` throughout the code.

## Conventions
- TypeScript strict mode. No `any`. Path alias `@/*` maps to `src/*`.
- File names in kebab-case. Components in PascalCase.
- Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code; this version has breaking changes (see AGENTS.md).
- Check with `pnpm exec tsc --noEmit` and `pnpm lint` before finishing a task.
