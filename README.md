# IFDSM Dental Sleep Medicine — FPros-style HTML reader (revision 21)

This edition replaces the previous `notes.html` redirect with **one complete, searchable chapter-reader page** modeled on the owner's DipProstho Volume I reader.

## Open the lessons

- **Main reader / chapter directory:** `notes.html?v=21#chapters`
- **Full Chapter 1:** `notes.html?v=21#unit-1`
- **A particular learning section:** `notes.html?v=21#section-1.1`
- **Keypoints for Chapter 1:** `notes.html?v=21#keypoints-1`
- **SBA home and saved progress:** `index.html#home`

The full teaching material is **inline in `notes.html`**, not behind `reader.html`, expandable panels, scripts that fetch content, or PDF page viewers. Each section has: keypoint → entire teaching lesson with tables/figures → links to its mapped SBAs. The reader has permanent Chapters, Keypoints, Search, and Top navigation.

## Publishing to GitHub Pages

1. **Back up your SBA progress** from the existing website's Progress page.
2. Unzip this archive. Upload **all the files and folders from inside it** to the root of the existing IFDSM GitHub repository. In particular, replace `notes.html`, `index.html`, `assets/app.js`, and `sw.js`; keep the `assets/figures` and `data` folders.
3. Commit the changes to the branch and directory GitHub Pages already publishes.
4. Open your published site online and visit `https://YOUR-USER.github.io/YOUR-IFDSM-REPOSITORY/notes.html?v=21#chapters` directly. It should display the chapter directory; selecting **Read chapter** should jump to the complete lessons in that same HTML page.
5. For an installed iPhone/iPad home-screen app, open the published URL in Safari online at least once after deploying to update cached files. This release uses a new service-worker cache name and versioned reading links.

**Important:** This ZIP is a replacement package, not a deployment. Your live GitHub Pages website will remain unchanged until these contents are committed to the actual repository. The ZIP is HTML-first and excludes large optional PDFs to simplify GitHub uploading.

## Files

- `notes.html` — one complete, standalone HTML reading page, 10 chapters, 78 sections, 105 tables, 38 illustrations, 1,000 SBA references.
- `index.html`, `assets/app.js`, `data/questions.js`, `data/keypoints.js` — the existing scored SBA application with the corrected reader navigation.
- `assets/figures` — image files referenced by the HTML lessons.
- `sw.js`, `manifest.webmanifest` — installable offline support, revision 21.
- `book/chapter-XX.html` — older direct chapter URLs retained so existing links still display teaching material.
- `QA_READER.md`, `qa/*.json`, `qa/check-webapp.js`, `qa/validate_links.py` — verification evidence and reproducible tests.

The bank answer keys, question IDs and locally saved progress storage key have not been changed.
