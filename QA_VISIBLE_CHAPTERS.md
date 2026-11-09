# IFDSM Volume I: Visible HTML Teaching Release (v12)

## Reported issue and cause

The prior Volume I page loaded all chapter details but hid the substantive material inside `<details>` accordions; only the first section was expanded automatically. From the user's perspective, chapters were lists of keypoints and SBA links, and the full lesson appeared accessible only through a PDF viewer.

## Changes

- New `volume1.html` chapter reader, with cache-busting versions of its CSS, script, and full-text data.
- Both `volume1.html` and the old `notes.html` now show **every section's full detailed teaching content inline**, without any collapsed lesson panels.
- The chapter index jumps directly to visible sections; each section reads as: **Keypoint → Complete teaching explanation (tables/figures) → linked SBA questions**.
- Existing SBA question links and two-way section references now point to `volume1.html`.
- Fixed return navigation from the optional archival PDF reader.
- Included a mobile horizontal-swipe cue for wide tables.
- Updated the service worker's cache version and offline precache to contain the new HTML, CSS, JS and full-text data.
- Kept the same `data/questions.js`, scoring logic and browser progress key.

## Verification performed

1. `qa/check-full-html.js`: **19 checks passed**. Covers 10 chapters/78 sections/1,000 mapped questions, source figures/tables, and inline order (lesson content before SBA links) in every section.
2. `qa/check-webapp.js`: **28 checks passed** (26 main checks and 2 chapter add-on checks), including score calculation and single-SBA links.
3. Chromium rendering: iPhone (390px), iPad (820px), desktop (1400px) via direct script injection and DOM rendering; verified Chapter 1 has twelve **visible** teaching sections and no collapsed notes. Screenshots in `qa/`.
4. Verified all original source images named in the reader exist in the `assets/figures/` folder.
5. Kept the original questions file and answer-key positions unchanged; not a new clinical editorial review.

## Testing limits

The environment blocks browser navigation to locally hosted URLs. Therefore the visual/DOM tests use scripts injected into a browser page, rather than a fully deployed GitHub Pages URL. Real-world GitHub Pages installation and physical iOS Safari testing remain outstanding. Browser images were not loaded in the injected test because relative URLs on `about:blank` cannot resolve; the referenced files were independently confirmed present.

## Installation

Upload the **contents** of the ZIP to the repository root. Once GitHub Pages deploys, reopen your site while online, then visit `volume1.html#contents`. If your old Home Screen app is cached, close it, open the website in Safari, and refresh (sometimes twice) so the updated service worker installs. Back up existing SBA progress before updating.
