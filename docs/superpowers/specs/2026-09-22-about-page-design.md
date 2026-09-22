# About Page — Design

Date: 2026-09-22

## Goal

Add a static `About` page (`docs/about.html`) to the site that:

- Shows **all 12 photos** from `docs/images/about/` as a manual prev/next slider, **starting on a random photo** each page load (random-on-refresh, matching the site's background randomizer behavior).
- Shows the caption: "This is me. Want to know how much I weigh? Pick me up."
- Shows a link to the owner's GitHub: https://github.com/porchlight
- Is reachable from the site's navigation (desktop menu and responsive mobile menu).

## Constraints

- tinyjam deliberately has **no feature for enumerating directory contents** in templates, so the photo filenames are provided **explicitly** as an inline JSON array in the template (`about.ejs`).
- No new build steps, no new dependencies, no workflow changes. `npx tinyjam docs` must keep working and `npm test` / lint must stay green.
- Match existing site patterns: EJS templates (`_header.ejs`, `_footer.ejs`, `_menu.ejs`), the existing `script.js` load-hook pattern, and `index.css` conventions.
- The photo `<img>` starts with **no `src`**; the random start photo is chosen and injected by JS on page load (matching how the background randomizer works).

## Approach

**Recommended — client-side slider driven by an inline JSON array (Approach 1).** tinyjam has no dir-listing feature; instead of enumerating filenames at build time, a JSON array of the 12 filenames is embedded as a `<script type="application/json" id="about-photos">` block inside `about.ejs`. `docs/script.js` (already loaded on every page and already hosting the background randomizer) picks a random start index on `load`, sets the `<img>` `src`, and wires prev/next buttons that wrap around the array. Styling is delivered via `docs/index.css`.

This is the only approach that keeps the site's "no features" ethos and the unchanged `npx tinyjam docs` build. Alternatives considered and rejected:
- **Auto-enumerating the directory at build time** — impossible in tinyjam's data model (only explicit data keys reach templates; no `fs`/dir-listing available to templates).
- **Build-time `<img>` list baked into a static `<picture>`** — would require running a script before every `tinyjam` build plus a workflow change; rejected as YAGNI since only 12 files exist and the user will add photos rarely.

Per user decision, the GitHub link points to the account root (`https://github.com/porchlight`) and both it and the photo list are maintained **inline**.

## Architecture

All state lives on the client, mirroring the existing NEW-star-badge and background-randomizer patterns (both live in `docs/script.js`).

### Data flow

1. `about.ejs` renders to `docs/about.html` at build time. It contains:
   - A `<script type="application/json" id="about-photos">` block holding the JSON array of the 12 filenames.
   - An `<img id="about-photo">` (no `src` initially).
   - Prev/next buttons and a photo counter label.
   - The caption paragraph and the GitHub link.
2. On browser `load`, `docs/script.js` runs `initAboutSlider()`:
   - Reads + `JSON.parse`s the `#about-photos` array.
   - Picks `startIndex = Math.floor(Math.random() * photos.length)`.
   - Sets `img.src = rootPath + '/images/about/' + photos[startIndex]` (about.html lives at site root, so `rootPath` is `'.'` — the existing `data-root` value already available in script.js).
   - Updates the counter (e.g. `3 / 12`).
   - Wires prev/next: `index = (index - 1 + photos.length) % photos.length` and `index = (index + 1) % photos.length`, updating `src` and counter with wrap-around in both directions.
3. `_header.ejs` already includes `<script src="<%= rootPath %>/script.js">`, and script.js's existing `window.addEventListener('load', ...)` runs `initAboutSlider()` alongside `newStar()`.

### Photo list (source of truth: 12 files in `docs/images/about/`)

```
7a5bb24a-688f-4e02-a77f-5c1167cd3efe.JPG
IMG_0020.jpg
IMG_0490.PNG
IMG_0491.PNG
IMG_0492.PNG
IMG_0493.PNG
IMG_1373.jpg
IMG_1586.jpeg
IMG_5251.PNG
IMG_5252.JPG
IMG_5421.PNG
IMG_5422.JPG
```

Adding a photo = drop it in `docs/images/about/` + add its filename to the `#about-photos` array in `about.ejs` (a one-line edit). This is the explicit, documented maintenance step.

## Components

### `docs/about.ejs` (new)

- Page shell matching `docs/suggest.ejs`: include `_header.ejs`, a `.row`/body-column layout, include `_menu.ejs`, include `_footer.ejs`.
- Title `<h2>About</h2>`.
- Slider block:
  - `<div class="about-slider">`
    - `<img id="about-photo" alt="an old photo of me">`
    - `<button class="about-prev" aria-label="Previous photo">&#8592;</button>` (←)
    - `<button class="about-next" aria-label="Next photo">&#8594;</button>` (→)
    - `<div class="about-count" id="about-count"></div>`
  - `<script type="application/json" id="about-photos">[ ...12 filenames as string literals... ]</script>`
- Caption: `<p class="about-caption">This is me. Want to know how much I weigh? Pick me up.</p>`
- GitHub link: `<p class="about-github"><a href="https://github.com/porchlight" target="_blank" rel="noopener">Find me on GitHub</a></p>`

### `docs/script.js` (modify)

Add `initAboutSlider()` in the existing file style (`var`, tab indentation, no trailing `;` where the surrounding code omits them):

```js
var initAboutSlider = function () {
    var photosEl = document.getElementById('about-photos');
    if (!photosEl) return; // Not the About page: no-op.

    var photos;
    try {
        photos = JSON.parse(photosEl.textContent);
    } catch (e) {
        return; // Malformed JSON: no-op.
    }
    if (!photos || !photos.length) return;

    var img = document.getElementById('about-photo');
    if (!img) return;

    var prev = document.querySelector('.about-prev');
    var next = document.querySelector('.about-next');
    var count = document.getElementById('about-count');

    var index = Math.floor(Math.random() * photos.lengthonge<%= title %> | <%= root.data.title %>);
    // trailing issue list: reuse `<div class="taglist">` from other pages.
    var show = function (i) {
        var idx = (i + photos.length) % photos.length; // normalize within range
        img.src = rootPath + '/images/about/' + photos[Math.max(0, Math.min(idx, photos.length - 1))];
        if (count) count.textContent = (idx + 1) + ' / ' + photos.length;
        return idx;
    };
    var current = show(index);

    if (prev) prev.addEventListener('click', function () {
        current = show(current - 1);
    });
    if (next) next.addEventListener('click', function () {
        current = show(current + 1);
    });
};
```

Called from the existing `load` handler (right after `newStar()`).

### `docs/_menu.ejs` (modify)

Add **About** to the desktop nav list, matching the existing `Home` / `Archive` / `Make a suggestion` link markup.

### `docs/_header.ejs` (modify)

Add **About** to the responsive mobile menu, matching the existing links.

### `docs/index.css` (modify)

Add a slider block consistent with the existing reset (2-space indentation where the file uses it):

```css
/* ABOUT SLIDER */
.about-slider {
    position: relative;
    text-align: center;
}
.about-slider img {
    display: block;
    max-width: 100%;
    margin: 0 auto;
}
.about-prev,
.about-next {
    position: absolute;
    top: 45%;
    border: 1px solid #000;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
}
.about-prev { left: 0.25rem; }
.about-next { right: 0.25rem; }
.about-count {
    margin-top: 0.5rem;
    color: #666;
}
.about-caption {
    font-style: italic;
}
.about-github a {
    color: blueFantastic;
}
```

(Exact colors/spacing finalized during implementation to match existing `index.css`.)

## Error Handling

- `initAboutSlider` no-ops (returns silently) if any of: `#about-photos` missing, JSON unparseable, array empty, or `<img>` absent — so the About page still renders its shell/photo frame on any partial failure. No errors are thrown; other pages are unaffected.
- Buttons use modular wrap-around (`(i + photos.length) % photos.length`), so the counter and index can never go out of bounds.
- `localStorage` is **not** involved in the slider (unlike the NEW badge) — the slider index is purely in-memory, so no storage/private-mode edge cases.

## Testing

- **Build determinism:** `npx tinyjam docs` regenerates `docs/about.html`; re-running yields no diff. Existing `example`/`test` fixtures unaffected (they build from `example/`, not `docs/`).
- **Lint/validate:** `npm run pretest` (eslint) passes; `docs/script.js` additions follow the repo's existing style rules that are enforced for root JS files in the package.
- **Manual browser checks:**
  1. "About" appears in the desktop nav and in the responsive mobile menu; both links open `about.html`.
  2. A photo displays on `about.html`; refreshing picks a different random starting photo.
  3. Prev/next step through all 12 photos, wrapping in both directions; the counter (e.g. `3 / 12`) stays in sync.
  4. Caption "This is me. Want to know how much I weigh? Pick me up." is visible.
  5. The GitHub link points to https://github.com/porchlight and opens in a new tab.
  6. Existing features (NEW badges, background randomizer, menu toggle) still work.

## Out of Scope (YAGNI)

- No auto-enumeration / manifest / build step for photos (inline array is the deliberate source of truth; documented one-line maintenance).
- No auto-advancing carousel (random start + manual arrows chosen).
- No per-photo captions (single site-wide caption chosen).
- No thumbnails, EXIF parsing, or lazy-loading.
