# IFDSM v24 — Working Volume I link repair

This release restores the actual **813 KB `notes.html` full textbook** that was accidentally replaced by a 924-byte redirect in the prior integrated package. The earlier package's `index.html#notebook` route went to an internal chapter preview rather than the user-requested notebook.

## Exact links
- **Open Volume I** and **Explore Notebook**: https://drowenkam.github.io/IFDSM/notes.html?v=21
- **Study Chapter 1 in HTML**: https://drowenkam.github.io/IFDSM/notes.html?v=21#unit-1
- **Full §1.1 teaching lesson**: https://drowenkam.github.io/IFDSM/notes.html?v=21#section-1.1
- **SBA bank**: https://drowenkam.github.io/IFDSM/index.html#practice

The desktop **Study notebook** and mobile **Notes** navigation are now ordinary HTML links. The original complete `notes.html` is included in this ZIP. From the notes, an SBA link returns to the same question-bank site. SBA explanations link back to the relevant HTML section. All question data and saved-progress keys are unchanged.

## Install to existing GitHub Pages
1. Back up progress from the live Progress page.
2. Extract this ZIP and upload **its contents, not the ZIP itself**, to the root of the `drowenkam/IFDSM` repository, replacing the old files. In particular, replace `index.html`, `assets/app.js`, `assets/styles.css`, `notes.html`, and `sw.js`.
3. Check GitHub's repository view that `notes.html` is approximately **813 KB**, not the old 924-byte redirect. If it is still tiny, the old file remains published.
4. After deployment, open `https://drowenkam.github.io/IFDSM/index.html?v=24` in a fresh browser tab while online. Click **Open Volume I** and **Study Chapter 1 in HTML**.
5. If Safari still shows the old buttons, the updated files are not yet deployed or an old service worker is controlling the tab. Refresh online, then reopen in a new Safari tab; do not rely on the home-screen icon until Safari has the new version.

## Verification scope
Static ZIP checks and local real-browser click navigation are included in `QA_LINKS.md`. We cannot publish files to your GitHub account from this chat, and have not verified the live deployment or physical Safari.
