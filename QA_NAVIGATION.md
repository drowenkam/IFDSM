# IFDSM GitHub Pages — Navigation Repair QA

## Problem verified

- Direct `.pdf` links opened the standalone PDF viewer, which lacks the website's own Back/Home controls. On installed iPhone/iPad home-screen apps this could appear as a dead end.
- Chapter-reading links included a footer chapter pager, but navigation was not persistent at the top and the mobile chapter menu was hidden.
- The old Notebook overview included page jumps `245` and `250`, beyond the final consolidated PDF's 177 pages.
- The previous offline route fallback could serve the website HTML instead of a missing PDF in some navigation conditions.

## Repairs

1. `reader.html` provides visible Back, All Chapters, Home, SBA Bank, page navigation and a separate-PDF fallback. Return destinations are whitelisted.
2. `notes.html` includes sticky top and fixed mobile Back/Contents controls. Return from a linked SBA can go back to the precise SBA or ongoing session.
3. The Notebook and Keypoints pages have always-visible Home / Notebook / All Chapters controls; every PDF entry uses the in-site reader.
4. PDF jumps now stay within 177 pages, including mock pages 168–173 and abbreviations/references pages 174–177.
5. Service worker cache version advanced; PDF failures offline display an explicit message rather than sending users to the homepage. `reader.html` is included in the offline website shell.

## Test evidence

- Original website regression suite: **26/26 passed**.
- Original chapter and SBA integration tests: **12/12 passed**.
- Additional return-navigation and PDF reader unit tests: **13/13 passed**.
- Chromium DOM-layout check (using locally injected scripts because network navigation was blocked): sticky Back/Contents control visible at 390-pixel phone size and 820-pixel tablet size; PDF reader rendered four return links and page controls.
- All 1,000 question records, keypoints, chapter metadata, progress-storage key and the two PDF books are byte-for-byte unchanged.

## Limitations

A live end-to-end test of GitHub Pages HTTP routes and physical Safari on iPhone/iPad could not be performed: the environment blocks browser navigation to localhost with `ERR_BLOCKED_BY_ADMINISTRATOR`. The browser DOM checks and isolated JavaScript tests do not prove the iOS embedded PDF renderer will work, so `reader.html` also offers *Open PDF separately* and instructions to save to Files for offline PDF reading.

## Publishing checklist

- Export progress before updating.
- Unzip and upload the **contents** into the same GitHub repository root. `reader.html` must be at the root next to `index.html` and `notes.html`.
- Keep the same GitHub Pages URL so local progress remains associated with the same origin.
- Open the website online and refresh; then close and reopen the installed home-screen app to obtain the new service worker.
- Test: Home → Notebook → Volume I Chapter → Full explanation → Back to Chapter → SBA → Return to Notes.

