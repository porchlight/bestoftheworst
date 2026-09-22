# About Page Implementation Plan

Date: 2026-09-22

## Context

Add a static `About` page that shows **all 12 photos** from `docs/images/about/` in a manual slider that:
- **Starts on a random photo each page load** (matching the site's background randomizer behavior — random on refresh).
- Has **prev/next buttons that wrap around** in both directions.
- Shows the caption: "This is me. Want to know how much I weigh? Pick me up."
- Includes a link to the owner's GitHub: https://github.com/porchlight
- Is reachable from the site navigation (desktop menu + responsive menu).

Full design: `docs/superpowers/specs/2026-09-22-about-page-design.md`

## Approach

**Inline JSON array + client-side slider** (approved in the design):

- `docs/about.ejs` (new) → renders `docs/about.html`. Embedding the 12 filenames as a JSON `<script type="application/json" id="about-photos">` block is deliberate: tinyjam has **no directory-enumeration feature**, so the array is the single source of truth.
- `docs/script.js` (modify) — add `initAboutSlider()` that picks a random start index, sets the `<img>` src, and wires prev/next with wrap-around.
- `docs/_menu.ejs`, `docs/_header.ejs` (modify) — add "About" to both nav variants.
- `docs/index.css` (modify) — minimal `.about-*` styles.

No new dependencies, no build steps, no workflow changes. `npx tinyjam docs` and `npm test` must stay green.

## Files Created/Modified

| File | Change |
|---|---|
| `docs/about.ejs` | **create** |
| `docs/about.html` | **created by build** |
| `docs/script.js` | **modify** (add `initAboutSlider`) |
| `docs/_menu.ejs` | **modify** (add About to desktop nav) |
| `docs/_header.ejs` | **modify** (add About to responsive nav) |
| `docs/index.css` | **modify** (add `.about-*` styles) |

---
## Task 1: Create `docs/about.ejs`

**Files:**
- Create: `docs/about.ejs`

**Interfaces:**
- Consumes: `rootPath` (tinyjam site data key), `include` helpers (`_header.ejs`, `_menu.ejs`, `_footer.ejs`).
- Produces: `docs/about.html` — a slider block exposing `#about-photos` (JSON array), `#about-photo` (img), prev/next buttons, a GitHub link, and the caption.

- [ ] **Step 1: Create the template**

```ejs
<% var title = 'About' %>
<%- include('_header.ejs') -%>
<div class="row">
    <div class="column column-67 body">
        <h2>About</h2>

        <div class="about-slider">
            <img id="about-photo" alt="an old photo of me">
            <button class="about-prev" aria-label="Previous photo">&#8592;</button>
            <button class="about-next" aria-label="Next photo">&#8594;</button>
            <div class="about-count" id="about-count"></div>
        </div>

        <p class="about-caption">This is me. Want to know how much I weigh? Pick me up.</p>
        <p class="about-github"><a href="https://github.com/porchlight" target="_blank" rel="noopener">GitHub</a></p>
        <p class="about-usage">Photos shuffle on every page load. Use the arrows to look through all of them.</p>

        <script type="application/json" id="about-photos">["7a5bb24a-688f-4e02-a77f-5c1167cd3efe.JPG","IMG_0020.jpg","IMG_0490.PNG","IMG_0491.PNG","IMG_0492.PNG","IMG_0493.PNG","IMG_1373.jpg","IMG_1586.jpeg","IMG_5251.PNG","IMG_5252.JPG","IMG_5421.PNG","IMG_5422.JPG"]</script>
    </div>
    <%- include('_menu.ejs') -%>
</div>
<%- include('_footer.ejs') -%>
```

Note: the filename order in the JSON array IS the displayed order. Adding a photo = drop it in `docs/images/about/` + add its name to this array (one-line edit).

- [ ] **Step 2: Build & verify render**

Run `npx tinyjam docs`. Expected: `docs/about.html` appears; the JSON array and img/buttons/caption are present in the generated file (browser verification in Task 5).

---
## Task 2: Add `initAboutSlider()` to `docs/script.js`

**Files:**
- Modify: `docs/script.js` (append inside the existing `window.addEventListener('load', ...)` handler, alongside `newStar()` and the background randomizer — keep the file's existing style: tabs, `var`, no trailing `;` where surrounding code omits them)

**Interfaces:**
- Consumes: `rootPath` (already a local in `script.js`), `#about-photos` JSON, `#about-photo`, `.about-prev`, `.about-next`, `#about-count`.
- Produces: slider wired up on the About page; no-op anywhere else.

- [ ] **Step 1: Add the slider init**

```js
	// About page photo slider (random start, manual prev/next, wraps).
	var initAboutSlider = function (rootPath) {
		var photosEl = document.getElementById('about-photos');
		if (!photosEl) return; // Not the About page: no-op.
		var photos;
		try {
			photos = JSON.parse(photosEl.textContent);
		} catch (e) {
			return; // Malformed JSON: no-op.
		}
		if (!photos || !photos.length) return; // Empty array: no-op.

		var img = document.getElementById('about-photo');
		if (!img) return; // No image: no-op.

		var prevBtn = document.querySelector('.about-prev');
		var nextBtn = document.querySelector('.about-next');
		var countEl = document.getElementById('about-count');

		var root = rootPath === '.' ? '' : rootPath;
		var index = Math.floor(Math.random() * photos.length(temp);

		var show = function (i) {
			img.src = root + '/images/about/' + photos[i];
			if (countEl) countEl.textContent = (i + 1) + ' / ' + photos.length;
		};
		show(index);

		if (prevBtn) prevBtn.addEventListener('click', function () {
			index = (index - 1 + photos.length) % photos.length;
			show(index);
		});
		if (nextBtn) nextBtn.addEventListener('click', function () {
			index = (index + 1) % photos.length;
			show(index);
		});
	};
```

Note: `initAboutSlider` is invoked from within the existing `load` handler, passing the `rootPath` local that already exists in `script.js` (same one the NEW-star logic uses).

- [ ] **Step 2: Lint**

Run `npm run pretest` (eslint `scripts/*.js`). Note: `docs/script.js` is linted by the repo's eslint config; keep tabs + `var` style consistent with the rest of the file so no new errors are introduced.

---
## Task 3: Add "About" to the navigation

**Files:**
- Modify: `docs/_menu.ejs`
- Modify: `docs/_header.ejs`

**Interfaces:**
- Produces: an `About` link in both the desktop sidebar nav (`_menu.ejs`) and the responsive mobile/tablet nav (`_header.ejs`).

- [ ] **Step 1: `docs/_menu.ejs`**

Add an About link next to the existing Home / Archive / Make a suggestion links:

```ejs
<li><a href="<%= rootPath %>/about.html">About</a></li>
```

- [ ] **Step 2: `docs/_header.ejs`**

Add the matching About link to the responsive nav links:

```ejs
<a href="<%= rootPath %>/about.html">About</a>
```

- [ ] **Step 3: Verify in browser**

About appears in the desktop menu AND in the responsive/mobile menu; both open `about.html`.

---
## Task 4: Style the slider in `docs/index.css`

**Files:**
- Modify: `docs/index.css`

**Interfaces:**
- Produces: slider layout + prev/next button styling consistent with the site.

- [ ] **Step 1: Add `.about-*` rules**

```css
.about-slider {
    position: relative;
    text-align: center;
}
.about-slider img {
    display: block;
    max-width: 100%;
    margin: 0 auto;
}
.about-prev, .about-next {
    position: absolute;
    top: 45%;
    background: white;
    border: 1px solid black;
    border-radius: 50%;
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
    color: blue;
}
.about-usage {
    color: #666;
    font-size: 0.9rem;
}
```

- [ ] **Step 2: Verify in browser**

Photo centered and constrained to column width; arrows overlay the image; counter `N / 12` updates; caption + GitHub link render.

---
## Task 5: Build + verification

**Files:** verify only.

- [ ] **Step 1: Rebuild site**

`npx tinyjam docs` — confirm `docs/about.html` regenerates identically (deterministic), and no unrelated files change.

- [ ] **Step 2: Run lint + tests**

`npm run pretest` (eslint) and `npm test` — both must pass. (Note: the tinyjam `example` fixture test in the suite compares an input dir `example/` to committed fixtures; it is TZ-robust and currently green.)

- [ ] **Step 3: Manual browser checks**

1. `about.html` loads from the desktop nav and the responsive menu.
2. A random photo shows on every refresh (differs across loads).
3. Prev/next arrows cycle through all 12 photos, wrapping both ways.
4. Counter `N / 12` stays in sync.
5. The caption "This is me. Want to know how much I weigh? Pick me up." is visible.
6. The GitHub link opens https://github.com/porchlight in a new tab.
7. Existing features (NEW star badges, background randomizer, menu toggle) still work.

- [ ] **Step 4: Commit**

```bash
git add docs/about.ejs docs/about.html docs/script.js docs/_menu.ejs docs/_header.ejs docs/index.css
git commit -m "feat: add random-start About photo slider"
```
