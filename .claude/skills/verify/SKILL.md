---
name: verify
description: Run the full verification gate for this repo - lint then typecheck+build. Use before claiming work is complete, before committing, and after any non-trivial edit. This repo has no tests, so this is the only automated check.
---

# Verify

This repo has no test framework. Lint plus the project-references typecheck is the entire safety net — run both, in this order, and read the real output.

## Steps

1. Lint:

   ```bash
   bun run lint
   ```

2. Typecheck and build:

   ```bash
   bun run build
   ```

   This is `tsc -b && vite build`. The `tsc -b` half is the only typecheck in the project — it builds `tsconfig.app.json` and `tsconfig.node.json` as project references, and a type error blocks the Vite build entirely.

## Rules

- Run both even if the edit looked trivial. `strict` is off, so type errors that slip past review are common and only `tsc -b` catches them.
- Do not report success until both commands have exited 0. Quote the failing line if either does not.
- `noUnusedLocals` and `noUnusedParameters` are on: a leftover import or unused argument is a build failure, not a warning.
- The `.claude/settings.json` PostToolUse hook already runs `bunx eslint` on each `.ts`/`.tsx` file as it is written. That is per-file only — it does not replace the repo-wide `bun run lint`, and it never typechecks.
- If UI copy changed, also confirm `public/locales/es/common.json` and `public/locales/en/common.json` have identical key paths:

  ```bash
  diff <(jq -S 'paths(scalars) | join(".")' public/locales/es/common.json) \
       <(jq -S 'paths(scalars) | join(".")' public/locales/en/common.json)
  ```
