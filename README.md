# IFDSM Dental Sleep Medicine — Volume I STATIC HTML repair

## Important: new reading route

The actual teaching chapters are now stored as full, self-contained HTML pages under `book/`.

- **Direct Volume I entry:** `book/index.html`
- **Read full Chapter 1:** `book/chapter-01.html`
- **Read Chapter 8:** `book/chapter-08.html`
- **Exact section:** `book/chapter-01.html#section-1.3`
- **SBA practice:** `index.html`

You no longer have to click a PDF, load notes data with JavaScript or expand a panel to see the full lesson. The chapter text, 105 tables and 38 illustrations are written into the static HTML. Each section lists its matching SBA links *after* the full explanation.

## Updating an existing GitHub Pages repository

1. Export your SBA progress from the old website as a precaution.
2. Extract this ZIP. Upload **all contents**, not the top-level folder, to your repository root. Replace conflicting files and commit.
3. Once GitHub Pages deploys, **open `/book/index.html` directly in Safari** rather than relying on a cached Home Screen shortcut. E.g., `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/book/index.html`.
4. Tap Chapter 1. The full §1.1 explanation appears on that HTML page **before** its Q-links. If you still see the old format, check that `book/chapter-01.html` exists in the online GitHub repository and open it directly.
5. To use offline, visit the website while online so the updated service worker caches the HTML chapters, then retry offline. Offline behavior on physical iPhones/iPads was not tested here.

## What remains unchanged

- The entire 1,000-question bank, its answer keys and the saved progress storage key.
- Reference PDFs are not bundled in this lightweight HTML-only ZIP; all ten complete teaching chapters and the full 1,000-question bank are included.
- For the original PDF attachments, use the full-size archive instead.
- Topic numbering and syllabus-section mapping.

## Verification

`python qa/check-static-volume1.py` validates all embedded teaching sections and local links (requires `beautifulsoup4`).
`node qa/check-webapp.js` validates the 1,000-question scoring and progress logic.
See `QA_REPORT.md` for limitations and checks performed.

This is an independent educational aid, not an official examination product.


## Lightweight download version
This ZIP deliberately excludes the large optional PDFs and preview screenshots so it can be downloaded and uploaded more easily. Full lesson HTML, all figures, all 1,000 SBAs, scores, and the offline HTML cache are retained. PDF fallback links lead to the HTML chapter list.
