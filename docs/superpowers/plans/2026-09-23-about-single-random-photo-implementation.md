# About Page — Single Random Photo per Load (Implementation Plan)

Date: 2026-09-23
Spec: `docs/superpowers/specs/2026-09-23-about-single-random-photo-design.md` (approved)

## Goal

Replace the About page's manual photo **slider** with a single photo, chosen **at random on every page load**, with no buttons, counter, or wrap-around logic. Everything else about the page (shell, caption, GitHub profile link) stays byte-identical.

**Design decision (user-approved):** photo selection happens **client-side in JS** on each `load`. This keeps tinyjam builds deterministic (byte-identical rebuilds — required by the "NEW" star-badges regression work and CI) while still showing a different photo on every refresh.

## Approach

Keep the inline 12-photo JSON array (`#about-photos` in `about.ejs`) as the single source of truth. Keep the random-index pick. **Remove** the slider mechanics only:

- `docs/about.ejs` — delete the prev/next buttons and the counter line.
- `docs/script.js` — trim `initAboutSlider()` down to `initAboutPhoto()` (parse JSON → random index → set `img.src`), dropping buttons/counter/wrap.
- `docs/index.css` — remove `.about-prev`, `.about-next`, `.about-count` rules.

## Files Created/Modified

| File | Change |
|---|---|
| `docs/about.ejs` | **modify** (delete 2 buttons + counter line) |
| `docs/script.js` | **modify** (trim to `initAboutPhoto()`) |
| `docs/index.css` | **modify** (delete 3 style blocks) |
| `docs/about.html` | **built** (regenerate) |

No new deps, no build-step changes.

---

## Task 1: Strip the buttons + counter from `docs/about.ejs`

**Files:**
- Modify: `docs/about.ejs`

**Interfaces:**
- Consumes: `rootPath` (tinyjam), the inline `#about-photos` JSON array (unchanged).
- Produces: About shell containing only `<img id="about-photo" data-base="<%= rootPath %>/images/about/">`, caption, and GitHub profile link.

- [ ] **Step 1: Remove the slider controls**

Delete the `about-prev` button, `about-next` button, and `about-count` line from the `.about-slider` block. The block becomes just the `<img>`. Keep `data-base` on the img.

- [ ] **Step 2: Verify block shape**

After edit, `.about-slider` contains exactly one child (`<img id="about-photo" ...>`). `grep -n "about-photos"` still shows the JSON array.

## Task 2: Trim `initAboutSlider` → `initAboutPhoto` in `docs/script.js`

**Files:**
- Modify: `docs/script.js`

**Interfaces:**
- Consumes: `JSON.parse(document.getElementById('about-photos').textContent)`; `#about-photo` img with `data-base`.
- Produces: random `img.src = base + photos[i]` on load. No-op guards (no `#about-photo`, empty/!photos, malformed JSON → return).

- [ ] **Step 1: Remove the interactive parts**

Inside `initAboutSlider`, delete: `prev`/`next` button lookups, `step(delta)` wrap logic, and the `about-count` counter update. Keep: JSON parse with try/catch, the `!names || !names.length` guard, random `index`, and `show()` that only sets `img.src`.

- [ ] **Step 2: Rename + update call site**

Rename `initAboutSlider` → `initAboutPhoto` (function name + the `initAboutSlider();` call inside the load handler).

## Task 3: Remove `.about-prev` / `.about-next` / `.about-count` from `docs/index.css`

**Files:**
- Modify: `docs/index.css`

**Interfaces:**
- Produces: only `.about-slider`, `.about-caption`, `.about-github` (and `.about-photo` max-width) rules remain for the About block.

- [ ] **Step 1: Delete the 3 style blocks**

Delete the `.about-prev`, `.about-next`, `.about-count` rules (back-to-back). Leave `.about-slider` (still used — centers the photo) and `.about-caption`/`.about-github`.

## Task 4: Build + deterministic rebuild + lint + test

- [ ] **Step 1: Rebuild**

`npx tinyjam docs` — regenerates `about.html` (and re-injects nav into all pages as before).

- [ ] **Step 2: Determinism**

Rebuild again; assert the tree is byte-identical (`git write-tree` unchanged). This is the deterministic-build invariant the star-badges test work depends on.

- [ ] **Step 3: Lint + test**

`npm run pretest` (eslint) and `npm test` — both green (2/2 tape tests + timezone-robust example fixture).

- [ ] **Step 4: Sanity diff**

`git status --porcelain` shows about.html + the nav-injected HTML pages. Manual browser check: About shows one random photo; refresh → different photo; no buttons/counter render.

## Task 5: Commit

Commit as `feat: About shows one random photo per load`.

## Out of Scope (YAGNI)

- No auto-advancing/auto-cycling (not wanted).
- No localStorage persistence for the About photo (irrelevant — it's already random each load).
- No build-time directory enumeration (tinyjam can't; inline JSON array is the source of truth).
- No new deps or workflow changes.
