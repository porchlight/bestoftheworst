# About Page — Single Random Photo (Implementation Plan)

Date: 2026-09-23
Spec: `docs/superpowers/specs/2026-09-23-about-about-single-random-photo-design.md` (approved)

**Context:** The About slider (prev/next + counter + wrap JS) is being removed. New behavior: on every About page load, ONE photo is chosen at random from `docs/images/about/` and displayed. No buttons, no counter. Everything else on the page (shell, caption, GitHub profile link, inline 12-photo JSON array) stays byte-identical.

**Constraint:** Must stay deterministic on rebuild and keep eslint + `npm test` green.

## Changes

| File | Change |
|---|---|
| `docs/about.ejs` | remove buttons + counter lines |
| `docs/script.js` | `initAboutSlider()` → `initAboutPhoto()` (drop step/wrap/counter) |
| `docs/index.css` | remove `.about-prev/.about-next/.about-count` rules |
| `docs/about.html` | rebuilt output |

## Task 1: Edit `docs/about.ejs`

Remove the two buttons and the counter line, leaving the slider shell as just the `<img>`:

- [ ] **Step 1:** Delete the `.about-prev` + `.about-next` button lines and the `about-count` div inside `.about-slider`.

## Task 2: Edit `docs/script.js`

- [ ] **Step 1:** Rename `initAboutSlider` → `initAboutPhoto`; delete the `prev`/`next` button wiring, the `step(delta)` wrap logic, and the counter update. Keep: parse JSON, random index, set `img.src`.

## Task 3: Edit `docs/index.css`

- [ ] **Step 1:** Remove `.about-prev`, `.about-next`, `.about-count` style blocks.

## Task 4: Build + verify

- [ ] **Step 1:** `npx tinyjam docs` rebuild.
- [ ] **Step 2:** Determinism check (rebuild → byte-identical).
- [ ] **Step 3:** `npm run pretest` + `npm test` green.
- [ ] **Step 4:** Commit staged changes.
