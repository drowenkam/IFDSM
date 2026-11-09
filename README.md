# IFDSM Volume I Full HTML Reader — Visible Teaching Edition

**Revision 12 (9 November 2026):** The primary study page is `volume1.html`. ALL 78 detailed lessons are displayed directly inside their 10 chapters; users do **not** need to click a PDF or expand hidden accordions. Each section presents a clinical keypoint, the complete teaching explanation with figures/tables, then linked SBA questions. Original PDF remains optional.

To update GitHub Pages, upload the contents of this folder, keeping `index.html`, `volume1.html`, `notes.html`, `assets/`, `data/`, and `sw.js` at the repository root. Open the site online and reload twice if an old Home Screen installation is cached; use the new **Volume I Full Chapters** link. Existing SBA question data and progress storage keys are unchanged.

## Important revision behaviour

- Open `volume1.html#contents`, choose any chapter, then scroll to read the complete lesson.
- Use section navigation to jump to §1.1 through §10.6. No hidden accordions.
- Under each lesson, use the exact SBA IDs to practise. Return to the lesson using the SBA explanation link or browser Back.
- The site includes the source 38 figures and 105 recreated tables. Some source PDF line-break artifacts may remain and should be checked against the original before clinical use.
- The HTML and JS are cached for offline use after an initial online visit. The large reference PDFs may not be available offline until separately opened.

---

# IFDSM — Dental Sleep Medicine | Full HTML Volume I + 1,000 SBA Questions

GitHub Pages-ready website, prepared for **Dr. Kam O Man, Owen**. Independent revision material, not an official IFDSM publication.

## What changed in this edition

**Volume I now reads like a real online textbook.** Select **Volume I** from the site header or **Notebook → Read full chapters online**. No PDF viewer is required for normal study.

- Ten complete web-readable teaching chapters with **78 learning outcome sections**.
- Approximately **61,000 words** of source-derived teaching text converted from the original *IFDSM Examination Revision Companion*, alongside the existing concise clinical keypoints, 30 case discussions, traps, and SBA links.
- **38 original illustrations** and **105 reconstructed reference tables** presented directly in the website; wide tables scroll horizontally on small devices.
- Expand/collapse full text for each learning outcome, jump to any chapter or section, move between chapters, and mark individual sections as revised.
- Each section links to its exact SBA questions, and SBA explanations link back to their section.
- The master numerical tables, original 60-question mock, abbreviations, and reference list are also available as HTML in the Volume I contents.
- **1,000 SBA questions, correct answers and scoring code have not changed.** Question progress remains under the same browser storage key; Volume I reading checks are stored separately.
- The original consolidated PDF and question-bank PDF are available as optional archival copies, not as the primary reading interface.

## Uploading to GitHub Pages

1. In your current website, go to Progress and **export your progress JSON** as a precaution.
2. Extract the provided ZIP. Upload the **contents**, not the enclosing folder, to the root of your existing GitHub repository, replacing earlier files. Keep `index.html`, `notes.html`, `sw.js`, `data`, `assets` and `resources` in their exact relative locations.
3. Under repository **Settings → Pages**, publish from `main` branch / `(root)` if not already enabled.
4. Open your GitHub Pages URL online and refresh. Close/reopen the Home Screen app if it still displays an old cached version; occasionally the service worker requires another online reload.
5. Select **Volume I → Chapter 1 → Full teaching notes**. If you see the paragraph beginning “Sleep is not passive rest,” you are on the updated HTML reader.

## iPhone / iPad

- Open the published site in Safari → Share → Add to Home Screen.
- Chapter content is selectable, resizable HTML text. Tables scroll sideways. Figures load inline.
- A persistent bottom navigation bar on smaller screens includes Back, Contents, Chapters, Question Bank and Progress.
- All core HTML, question data and 38 figure images are cached by the offline service worker after a successful online visit. The source PDFs are optional and may need to be downloaded separately for offline viewing.

## User progress and privacy

- SBA storage key: `ifdsm-sba-examstyle-v2` (unchanged).
- New chapter revision checkboxes storage key: `ifdsm-volume1-read-v1`.
- Data is held in the current browser. It does not automatically synchronise between iPhone, iPad and desktop. Use the question bank's Export/Import Progress controls to move saved SBA answers.
- Do not publish identifiable patient data in GitHub Pages.

## Structure

- `index.html` — SBA bank and website home.
- `notes.html` — full Volume I HTML textbook reader.
- `data/full_notes.js` — full teaching text organised into 78 sections plus appendices.
- `data/chapters.js` — keypoints, chapter metadata and exact SBA mappings.
- `data/questions.js` — 1,000 unchanged SBA questions.
- `assets/figures` — 38 original illustrations from the source revision companion.
- `assets/notes.js` / `assets/notes.css` — responsive chapter reader.
- `sw.js` — versioned offline precache for all core HTML and figures.
- `reader.html` and `resources/*.pdf` — optional archival PDF reader and copies.
- `qa/check-webapp.js`, `qa/check-full-html.js` — reproducible scoring/content tests.

## Tests and limitations

Run in Node.js:

```sh
node qa/check-webapp.js
node qa/check-full-html.js
```

Both suites pass. HTML layout/interaction smoke checks passed in headless Chromium using in-memory page content at iPhone-, iPad- and desktop-sized viewports. Actual local-file and localhost navigation was blocked by this environment's browser policy; **the fully deployed GitHub Pages service-worker and physical iOS Safari behaviour have not been tested**.

The detailed text comes from the user's original IFDSM companion. The website conversion did not independently revalidate clinical guidelines or correct historical claims; the latest keypoint overlays remain a separate interpretive guide. Some complex multipage tables are reconstructed from the PDF and may not have exactly the original visual formatting, although their text is exposed as HTML. The original PDF remains available when exact source layout is needed.
