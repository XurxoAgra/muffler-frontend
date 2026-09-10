# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **bun** (`bun.lock`). Do not use npm/yarn/pnpm.

- `bun run dev` — Vite dev server
- `bun run lint` — `eslint .`
- `bun run build` — `tsc -b && vite build`. There is no `typecheck` script; `tsc -b` (project-references build over `tsconfig.app.json` + `tsconfig.node.json`) is the only typecheck, and it blocks the build.

There is no test framework, no formatter, and no CI. `bun run lint && bun run build` is the full verification gate.

## Code style

Enforced by nothing — no Prettier/Biome/.editorconfig — so match the existing code:

- No semicolons, single quotes, 2-space indent.
- `verbatimModuleSyntax` is on: type-only imports must be `import type { X }` or inline (`import { useState, type ReactNode }`).
- `interface` for object shapes (see `src/lib/types.ts`); `type` only for unions.
- No path aliases. All imports are relative (`../../lib/apiClient`).
- `strict` is off in tsconfig; `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `erasableSyntaxOnly` are on.
- API payload fields stay snake_case (`access_token`, `first_name`) because they mirror the backend; local identifiers are camelCase.

## Styling

Tailwind CSS v4 via `@tailwindcss/vite`. There is **no `tailwind.config.*`** — design tokens are `@theme` CSS custom properties at the top of `src/index.css` (`--color-lime`, `--color-shell`, `--font-display`, …), used as `bg-page`, `text-text-secondary`, etc. Adding a color or font means editing `src/index.css`.

`design-reference/` holds Claude Design HTML/CSS prototypes — visual source of truth, not code to copy.

## API layer

- Every request goes through `apiFetch<T>(path, { method, body, authenticated })` in `src/lib/apiClient.ts`, which throws `ApiError` from `{ error: { code, message, details } }`. Don't call `fetch` directly.
- Base URL comes from `VITE_API_BASE_URL`, read once at module load. **No Vite dev proxy** — the frontend calls an absolute cross-origin URL, so the backend must be running with CORS enabled.
- Auth: JWT held in memory, optionally persisted to `localStorage` under `muffler.auth` (`src/auth/AuthContext.tsx`). `refresh_token` is stored but **no refresh flow exists** — a 401 clears the session and logs out.

## State

React Context only — no Redux/Zustand/TanStack Query. `ThemeContext` and `AuthContext` wrap the router in `src/App.tsx`; `ProfileProvider` and `FleetDataProvider` are mounted in `src/components/layout/Shell.tsx`, so they exist only on authenticated routes. `src/maintenance/maintenanceRecordTypes.ts` is a hand-rolled module-level cache (1-hour stale time, in-flight dedup).

Routing is react-router-dom v7 declarative (`<BrowserRouter>`/`<Routes>`), not the data-router API.

## i18n

Two locales, `es` (fallback, author copy here first) and `en`, single `common` namespace. Translations are **fetched at runtime over HTTP** from `public/locales/{es,en}/common.json` — they are not bundled imports. Keys are camelCase dot-paths nested by feature (`auth.signin.title`). Use the `add-i18n-string` skill: both files must change in the same edit.

Exception: `maintenanceRecordType.*` keys are snake_case, mirroring backend catalog keys (`oil_change`, `itv`, …), and are looked up dynamically via `` t(`maintenanceRecordType.${type.key}`) `` — grep will not find them from the calling code.

## Repo etiquette

`feature/*` branches merged to `main` via GitHub PRs. Commit messages are short imperative English, no Conventional Commits prefixes. `gh` is not installed locally.
