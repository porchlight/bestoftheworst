# NEW Star Badges on Homepage Teasers

Date: 2026-09-22

## Goal

Add a yellow star badge labeled "NEW" to homepage post teasers, marking posts published since the visitor's last recorded visit. Tags are day-persistent: they stay visible across reloads on the same calendar day and clear once the visitor returns on a later day.

## Behavior

All state is client-side via `localStorage`. No backend changes.

### Stored state

- `botwLastVisit` — a millisecond timestamp marking the current "catch-up" baseline.
- `botwDay` — the local calendar day (`YYYY-MM-DD`) on which that baseline was set.

### On every homepage load

1. Compute `today` (local calendar day).
2. If `botwDay` is stored and differs from `today`, this is a new day: rebase `botwLastVisit = Date.now()` and `botwDay = today`. This clears the previous day's tags.
3. If `botwLastVisit` was never stored (first visit ever): record the baseline and show no stars.
4. Otherwise (no rebase happened): show a star on each homepage teaser whose post timestamp is greater than `botwLastVisit`.
5. Write `botwDay = today` when it isn't already.

### Trace-check

| Scenario | Result |
|---|---|
| First visit ever | No stars; baseline recorded. |
| Load same day multiple times | Stars persist; no rebase. |
| Return on a later day | Day-tags cleared; only posts published after the rebase get tagged. |

### Known side effect

On the first visit of a given day, posts published earlier that same day are not starred (the visitor is treated as caught up for the day). Posting mid-day still surfaces new stars on the same day if the visitor revisits.

## Implementation

Three files:

1. `docs/index.ejs` — add `data-date="<%= date %>"` to each `.post-teaser` div (the millisecond sort key already computed in the loop).
2. `docs/script.js` — on `window.load`, implement the load-time logic above: read/compare `botwDay`, optionally rebase `botwLastVisit`, iterate `.post-teaser` elements comparing `data-date` to `botwLastVisit`, and inject `<span class="new-star">NEW</span>` into matching teasers. Guard against missing/malformed `localStorage` (try/catch).
3. `docs/index.css` — add `.new-star` as a yellow star shape (CSS `clip-path` star) with black "NEW" text, sized to sit inline before the teaser title.

`script.js` already runs on `window.load` and applies only on the homepage list; the data-date loop code is shared with `archive.ejs` (`_list_view.ejs`) but stars render only where the badge markup/JS runs (homepage only).

## Testing

- The existing `tape` test suite (`npm test`) only diffs tinyjam build fixtures from separate fixture dirs; none touch `docs/`, so it is unaffected. `lint` (`npm run pretest` runs eslint on `*.js` and `test/test.js`) must still pass.
- Verification is manual in a browser:
  1. Fresh profile / cleared storage → no stars on first load.
  2. Add a post with a date after `botwLastVisit` (or backdate `botwLastVisit` in DevTools) → star appears.
  3. Reload same day → star persists.
  4. Backdate `botwDay` in DevTools and reload → stars clear.
- Build check: run `npx tinyjam docs` and confirm `docs/index.html` regenerates cleanly.