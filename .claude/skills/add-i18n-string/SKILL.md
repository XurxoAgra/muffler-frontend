---
name: add-i18n-string
description: Use when adding or changing any user-facing text in this app (new UI copy, labels, error/validation messages). Ensures translation keys stay in sync across both locale files instead of drifting.
---

This project uses `react-i18next` with a single namespace (`common`) loaded from `public/locales/{lng}/common.json`. Supported languages are `es` (fallback) and `en`.

## Steps

1. Pick a key path that follows the existing nesting convention (dot-path by feature/section, e.g. `auth.signin.title`, `vehicle.validation.plateRequired`). Look at `public/locales/es/common.json` for the closest existing section and match its structure.
2. Add the key to **both** `public/locales/en/common.json` and `public/locales/es/common.json` in the same change — keep the JSON key order and nesting identical between the two files, only the string values differ.
3. Use the key in code via the existing `useTranslation`/`t(...)` pattern already used in nearby components (e.g. `LanguageSwitcher.tsx`, page components) — don't hardcode literal strings for anything user-facing.
4. Before finishing, diff the two locale files' key structure (e.g. `jq -S 'paths(scalars)' public/locales/en/common.json` vs the `es` equivalent) to confirm no key exists in one file but not the other.

Never leave a key in only one locale file — the app's `fallbackLng` is `es`, but missing `en` keys will silently fall back and go unnoticed in review.
