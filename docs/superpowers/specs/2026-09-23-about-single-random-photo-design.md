# About Page — Single Random Photo (remove slider)

Date: 2026-09-23

## Goal

Change the About page so it no longer shows an interactive slider. On **every About page load**, the page displays **one random photo** chosen from the 12 photos in `docs/images/about/`.

Scope is deliberately tied to the existing About feature: the page shell, the caption ("This is me. Want to know how much I weigh? Pick me up."), and the GitHub profile link all stay **exactly as-is**.

## Decisions

- **Remove** the two slider buttons (prev/next), the wrap-around logic, and the `n / 12` counter.
- **Keep** the inline JSON photo array (`#about-photos`) as the runtime source of truth — it is the smallest thing that lets the site choose *one* photo from the folder without help from tinyjam (which has no directory-listing feature).
- **Keep** the random-selection behavior already implemented — just remove the manual-stepping parts.

## Changes

### `docs/about.ejs`
- Delete the `.about-prev` / `.about-next` buttons and the `#about-count` counter line inside `.about-slider`.
- Keep `<img id="about-photo" data-base=...>` and the JSON array.

### `docs/script.js`
- Rename `initAboutSlider()` → `initAboutPhoto()`.
- Remove the `step()` / `.about-prev` / `.about-next` wiring and the counter update.
- Keep: read JSON → fail-soft no-op guards → pick `Math.floor(Math.random() * photos.length)` → set `img.src` once.
- Update the call site so `initAboutPhoto()` still runs on page load within the existing load handler.

### `docs/index.css`
- Remove `.about-prev`, `.about-next`, and `.about-count` rule blocks.

## Build / Verification

- `npx tinyjam docs` regenerates deterministically (byte-identical on re-run).
- `npm run pretest` (eslint) and `npm test` stay green.
- About page shows one random photo per load; refreshing changes it; no buttons/counter render.
