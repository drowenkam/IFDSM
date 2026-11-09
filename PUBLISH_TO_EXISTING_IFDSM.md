# Update your EXISTING IFDSM GitHub Pages website

**Destination:** https://drowenkam.github.io/IFDSM/index.html

This is the previously tested **unified website build**, not a separate site.
It contains both the **Volume I full HTML revision notebook** and the **Volume II 1,000 SBA question bank**, within the same `index.html` app.

## Exact steps

1. On the current IFDSM website, use **Progress → Export** to back up your SBA history.
2. Open your existing `IFDSM` repository on GitHub and check the branch and folder configured in **Settings → Pages**. The steps below assume the site is published from the repository root on its Pages branch.
3. Extract this ZIP on your computer. **Upload its CONTENTS, not the ZIP itself** to the repository root, keeping `index.html`, `assets/`, `data/`, `book/` and `sw.js` in their original locations.
4. Replace files with the same names and commit the changes to the branch configured for Pages. Do **not** rename `index.html` or nest it inside a new folder.
5. Open https://drowenkam.github.io/IFDSM/index.html in a browser. Navigate to **Study notebook → Chapter 1 → §1.1** and confirm the full teaching text appears; choose an associated SBA, submit an answer and return to the lesson.
6. Open the website online from Safari once after publishing so the offline service worker can update. If the older page still appears, refresh the direct `index.html?v=23` URL in Safari. Reopen the home-screen shortcut afterward.

## Expected paths after deployment

- `https://drowenkam.github.io/IFDSM/index.html` — **one unified entry point**
- `https://drowenkam.github.io/IFDSM/index.html#notebook` — chapter index
- `https://drowenkam.github.io/IFDSM/index.html#chapter?chapter=1` — full Chapter 1 teaching text
- `https://drowenkam.github.io/IFDSM/index.html#practice` — SBA practice
- `https://drowenkam.github.io/IFDSM/index.html#progress` — scores and progress
- `https://drowenkam.github.io/IFDSM/notes.html?v=21` — legacy redirect to unified notebook

**Important:** These URLs describe how the published update SHOULD behave. Creating this archive does **not** change the live GitHub Pages website. I have not authenticated to or deployed to your GitHub account.

## Data preservation

The original 1,000 question records, answer key positions and progress-storage key are unchanged in this unified build. Progress is browser-specific. Back it up before changing the deployment.

## Package validation

Contains relative-path site assets with `index.html` at root; checks performed on the archive contents. Tests from the previous unified build verified local browser interactions, but this build has NOT been tested after publication to your repository or on a physical iPhone/iPad.
