# IFDSM Volume I navigation — verified file-level repair (v24)

## Confirmed defect in previous ZIP

The previous `IFDSM_Existing_Website_Update.zip` contained a `notes.html` file of **924 bytes** whose only purpose was to redirect `notes.html?v=21` into `index.html#notebook`. This replaced the real Volume I textbook (813,168 bytes). Therefore the user-requested notebook link did not lead to the FPros-style reader.

## Changes made

- Restored `notes.html` to the genuine, full **813,168-byte** Volume I HTML notebook from the previously authored `IFDSM_FPros_Style_Full_Notes_GitHub_v21.zip`.
- Homepage **Open Volume I** and **Explore Notebook** explicitly navigate to `https://drowenkam.github.io/IFDSM/notes.html?v=21` (the latter can use `#chapters`).
- **Study Chapter 1 in HTML** navigates to `https://drowenkam.github.io/IFDSM/notes.html?v=21#unit-1`.
- Desktop **Study notebook** and mobile **Notes** controls are ordinary `<a href>` links, not JavaScript-only view buttons.
- Old bookmarks to `index.html#notebook`, `#chapter?chapter=1`, and `#lesson?section=1.1` redirect to the corresponding addresses in the actual HTML reader.
- SBA explanations and section-specific return links point to `notes.html?v=21&fromQuestion=N#section-X.Y` for a precise round trip.
- `reader.html` and `volume1.html` now direct to the actual reader rather than a notebook placeholder.
- Service-worker version is bumped to `v24` and its offline cache fallback ignores query strings, so `notes.html?v=21` can resolve from a preloaded `notes.html` entry offline.

## Checks

- Node `--check` passed for `assets/app.js` and `sw.js`.
- JavaScript evaluated with actual `questions.js`, `keypoints.js`, `notebook-chapters.js`, `app.js`: 1,000 questions load, the HTML for both required homepage links contains their exact URLs, and an old `#notebook` bookmark redirects to the actual textbook.
- Full `notes.html` has 78 section anchors, 105 `<table>` elements, 38 `<figure>` elements and 1,000 distinct `#browse-detail?question=N` links covering Q1–Q1000.
- The target anchors `#chapters`, `#unit-1` and `#section-1.1` exist, and §1.1 visibly contains the original teaching text beginning “Sleep is not passive rest.”
- `data/questions.js` has the same SHA256 as the prior integrated ZIP — question wording, answer keys and saved score schema are unchanged.
- ZIP integrity and included file paths validated after packaging.

## Not verified

The isolated browser navigator is blocked (`net::ERR_BLOCKED_BY_ADMINISTRATOR`) even for localhost and local files, and the public GitHub Pages URL could not be fetched from this environment. Therefore end-to-end live click behaviour and publication on the user's account are **not claimed as verified**. The scripts were directly evaluated for their rendered HTML link targets, and the target HTML contents were inspected and checked. No files were pushed to the live repository.

## Publish to fix the live website

For a repository already running the unified edition, use the small `IFDSM_Links_Patch_v24.zip`, uploading its seven contents to the existing `drowenkam/IFDSM` repository and replacing these paths: `index.html`, `notes.html`, `reader.html`, `volume1.html`, `assets/app.js`, `assets/styles.css`, `sw.js`.

Once GitHub Pages has deployed, open `https://drowenkam.github.io/IFDSM/index.html?v=24` in Safari in a fresh tab while online. **Do not test the old cached home-screen shortcut first.** Tap **Open Volume I**; it should resolve to `notes.html?v=21`. Return and tap **Study Chapter 1 in HTML**; it should resolve to `notes.html?v=21#unit-1`. In GitHub's repository view, confirm `notes.html` is around 813 KB, not 924 bytes.
