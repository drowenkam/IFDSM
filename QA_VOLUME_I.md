# Volume I Chaptered Edition — Release Verification

Release: November 2026. Source: previously supplied IFDSM final integrated notebook and revised 1,000-SBA website.

## Document and mapping integrity

- Volume I PDF: 253 pages (previous keypoint edition: 243), new front matter plus 10 individual chapter concordance pages.
- 10 chapters; 78 distinct learning-outcome headings retained.
- The 1,000 SBA records each map to exactly one of the 78 outcome codes. No missing, duplicated or orphan question IDs.
- Each chapter concordance reproduces the corresponding actual question numbers and printed Volume II PDF page positions.
- The PDF contains 10 chapter contents links, bookmarks for 78 subheadings, and 1,000 question-link annotations. External relative PDF-to-HTML links depend on the PDF reader.
- Existing original clinical keypoint, condensed, detailed source material, illustrations, mock paper and references preserved after the new chapter maps.

## Website verification

- All original 26 scorer, navigation, session recovery, progress, offline and answer-key tests: **pass**.
- Two further integration checks cover section filtering and single-question scored practice: **pass**.
- Twelve independent Volume I reader tests: **pass**. These include actual 1,000 specific question links, section deep linking, ten chapter pages, saved attempted/correct/wrong/unseen counts, search fallback and offline asset references.
- Score record storage key unchanged: `ifdsm-sba-examstyle-v2`. No answer key changes in this release.
- All CSS, JS and data paths within the ZIP were resolved against actual files.

## Limits

- No new clinical evidence update or independent specialist peer review was performed in this release: the source wording is retained and merely reorganised.
- JavaScript tests run through a controlled simulated DOM, not a full iOS Safari session. The physical device web view and full PDF annotation behavior should be checked on the user's device.
- GitHub Pages does not synchronize local progress automatically between devices.
