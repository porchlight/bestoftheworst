# NEW Star Badges Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a day-persistent yellow "NEW" star badge on homepage teasers for posts published since the visitor's last visit.

**Architecture:** Pure client-side. `docs/index.ejs` stamps each homepage teaser with its post timestamp as a `data-date` attribute; `docs/script.js` compares against a `localStorage` baseline on page load and injects a `<span class="new-star">NEW</span>` into qualifying teasers; `docs/index.css` styles the badge as a yellow star.

**Tech Stack:** EJS templates (tinyjam), vanilla JS, CSS `clip-path`. No new dependencies.

**Testing note:** This repo's test suite (`npm test`) only verifies the tinyjam generator against fixture dirs and deliberately has no client-JS/DOM harness. So client behavior is verified by lint + a build determinism check + explicit manual browser scenarios (below), while `npm test` and the build must remain green.

## Global Constraints

- No new dependencies (matching the "zero-configuration static site generator that deliberately has no features" ethos).
- Match existing file conventions: `script.js` and `index.css` formatting (2-space indent, `var`, no trailing semicolons in `script.js`; 4-space indent in CSS).
- Behavior must match the spec `docs/superpowers/specs/2026-09-22-new-star-badges-design.md` exactly: stars only on homepage teasers; day-persistent via `localStorage` keys `botwLastVisit` / `botwDay`; no stars on first ever visit; rebase on calendar-day change.
- Do not touch fixture dirs under `test/`. Existing `npm test` must keep passing.
- To run local builds first: `npm install` (dependencies are not guaranteed to be present).

---
### Task 1: Stamp homepage teasers with `data-date`

**Files:**
- Modify: `docs/index.ejs:16`

**Interfaces:**
- Consumes: nothing (loop variable `date` already exists in this template — the millisecond sort key).
- Produces: `.post-teaser` elements carrying a `data-date` attribute with the post's millisecond timestamp, which Task 2 reads.

- [ ] **Step 1: Modify the teaser div**

In `docs/index.ejs`, change line 16:

```html
<div class="post-teaser">
```

to:

```html
<div class="post-teaser" data-date="<%= date %>">
```

- [ ] **Step 2: Rebuild the site and verify the attribute**

Run (from repo root):

```bash
npm install
npx tinyjam docs
```

Expected: `docs/index.html` regenerates; grep for `data-date=` and confirm each homepage teaser has a numeric value, e.g. `<div class="post-teaser" data-date="1588536000000">`. No other files change (this template only affects `index.html`).

Verify with: `git status --porcelain` (should list only `docs/index.ejs` and `docs/index.html`).

- [ ] **Step 3: Commit**

```bash
git add docs/index.ejs docs/index.html
git commit -m "feat: stamp homepage teasers with data-date"
```

### Task 2: Inject NEW badges in `script.js`

**Files:**
- Modify: `docs/script.js` (append logic inside the existing `window.addEventListener('load', ...)` handler, after the menu-toggle block)

**Interfaces:**
- Consumes: `.post-teaser[data-date]` markup from Task 1.
- Produces: an injected `<span class="new-star">NEW</span>` appended inside the teaser's `.title` span for qualifying posts. Task 3 styles `.new-star`.

- [ ] **Step 1: Add the badge logic**

Append the following inside the existing load handler (before its closing `});`), matching the file's existing `var`/2-space style:

```js
	// NEW star badges (day-persistent, localStorage based)
	var newStar = function () {
		try {
			var now = new Date();
			var day = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
			var visitKey = 'botwLastVisit';
			var dayKey = 'botwDay';

			var lastVisit = localStorage.getItem(visitKey);
			var lastDay = localStorage.getItem(dayKey);

			if (lastVisit === null) {
				// First visit ever: record the baseline, show no stars.
				localStorage.setItem(visitKey, String(now.getTime()));
				localStorage.setItem(dayKey, day);
				return;
			}

			if (lastDay !== day) {
				// New day: rebase so yesterday's tags clear.
				lastVisit = String(now.getTime());
				localStorage.setItem(visitKey, lastVisit);
				localStorage.setItem(dayKey, day);
			}

			var teasers = document.querySelectorAll('.post-teaser');
			for (var i = 0; i < teasers.length; i++) {
				var date = parseInt(teasers[i].getAttribute('data-date'), 10);
				if (!isNaN(date) && date > parseInt(lastVisit, 10)) {
					var star = document.createElement('span');
					star.className = 'new-star';
					star.textContent = 'NEW';
					teasers[i].querySelector('.title').appendChild(star);
				}
			}
		} catch (e) {
			// localStorage unavailable (private mode etc.): no badges.
		}
	};

	newStar();
```

- [ ] **Step 2: Lint**

Run (from repo root):

```bash
npm run pretest
```

Expected: eslint passes with no errors (this runs `eslint *.js test/test.js`, which includes `docs/script.js`).

- [ ] **Step 3: Verify behavior in the browser (manual scenarios)**

Open `docs/index.html` in a browser with DevTools. Use the `localStorage` panel on `about:blank` / the served origin to clear and set values.

| Scenario | Steps | Expected |
|---|---|---|
| First visit ever | Clear site localStorage, reload | No stars appear; `localStorage` now has `botwLastVisit` and `botwDay`. |
| Star on new post | Set `botwLastVisit` to a timestamp older than the newest post's `data-date` (e.g. `1000`), set `botwDay` to today, reload | Newest (and any newer) teaser shows a yellow `NEW` badge. |
| Same-day persistence | Reload again without changing anything | Badges remain. |
| Cleared next day | Set `botwDay` to `2000-01-01`, reload | Starbadges are gone; `botwLastVisit` updated to now. |

- [ ] **Step 4: Commit**

```bash
git add docs/script.js
git commit -m "feat: inject day-persistent NEW badges on homepage teasers"
```

### Task 3: Style the NEW badge as a yellow star in `index.css`

**Files:**
- Modify: `docs/index.css` (append after the `.taglist` rules, before `/* MENU */`)

**Interfaces:**
- Consumes: `.new-star` span injected by Task 2.
- Produces: the star badge styling. No other selectors reference this class.

- [ ] **Step 1: Add the `.new-star` rules**

Append to `docs/index.css` (uses a star-shaped `::before` background behind the text so "NEW" is never clipped by the shape):

```css
/* NEW STAR BADGE */
.new-star {
    position: relative;
    display: inline-block;
    margin-left: 0.7rem;
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
    font-weight: bold;
    line-height: 1;
    text-align: center;
    color: black;
    text-transform: uppercase;
    z-index: 0;
    vertical-align: middle;
}
.new-star::before {
    position: absolute;
    content: "";
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff700;
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    z-index: -1;
}
```

- [ ] **Step 2: Verify styling in the browser**

Re-run Task 2's "Star on new post" scenario. Expected: a yellow star badge with black "NEW" text sits inline next to the teaser title, and the text remains fully inside the star at mobile and desktop widths.

- [ ] **Step 3: Commit**

```bash
git add docs/index.css
git commit -m "feat: add yellow star NEW badge styles"
```

### Task 4: Final build + test verification

**Files:**
- Verify-only (no code changes).

- [ ] **Step 1: Rebuild site and confirm clean diff**

```bash
npx tinyjam docs
git status --porcelain
```

Expected: `docs/index.html` is the only template output present in the working tree diff (already committed in Task 1, so nothing new should appear). If unexpected files changed, investigate before proceeding.

- [ ] **Step 2: Run full test suite**

```bash
npm test
```

Expected: lint passes and both tape tests pass (`ok` lines, no failures).

- [ ] **Step 3: Confirm spec coverage in a browser**

Re-run all four scenarios from Task 2 once more against the final build. Expected: all match the table, particularly: first visit → no stars; starred posts persist same day; next day (backdated `botwDay`) → cleared; posts published after rebase still star on the same day.