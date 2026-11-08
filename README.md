# IFDSM SBA Question Bank - Answer-Format Revised Edition

This GitHub Pages folder replaces the earlier IFDSM exam-style website. It includes the updated 243-page integrated revision notebook (retaining the original 224-page source content and author cover).

## This correction

- All **1,000 questions** remain present in the same numbered order with the same A-E correct-answer positions.
- **471 question items** (applied clinical and focused-knowledge items) had their option wording edited. The reused source-note fragments were consolidated into short, self-contained statements.
- The example concerning non-anatomical OSA traits is now a proper single-sentence option; its PALM endotype statistics are explained in the rationale.
- One mislabelled section reference (question 71) was corrected to section 1.3.
- Explanations, 160 authored clinical decision cases, 369 concept-interpretation questions and all topic grouping are retained.
- The website and printable PDF now read from the same revised data.

## Publish on GitHub Pages

1. Unzip and upload **all contents** of this folder to the repository root (replace the old files). Keep `index.html`, `assets/`, `data/`, `resources/`, `sw.js` and `manifest.webmanifest` intact.
2. Commit to the branch serving GitHub Pages. Reload once in Safari **while online** to update the offline cache.
3. Continue in Practice, Exam, Browse or Notebook. Saving and restoring answers use existing local browser storage.

## Progress and scoring

Since question numbers and correct option indices are unchanged, the existing same-edition progress record (`ifdsm-sba-examstyle-v2`) remains compatible. Export a backup from Progress before updating, as a precaution. Older pre-exam-style progress remains separate.

## QA and editorial caveat

Run `node qa/check-webapp.js` for deterministic scoring, navigation and persistence checks. `qa/answer_format_edits.csv` records each changed option.

This update improves **the format of answer options**, not the independently established clinical validity or true exam equivalence of every question. Some earlier recall/interpretation items still have comparatively simple or distant distractors, and the original learning-outcome assignments beyond the specifically corrected example have not all been independently medically peer-reviewed. No endorsement by IFDSM is claimed.


## November 2026 clinical keypoint update (Volume I)

The site now includes **78 revised learning-outcome keypoints**, **30 short integrated clinical scenarios** and examination traps. Open **Notebook → Study keypoints in HTML** to read these offline after the initial visit. Correct and incorrect SBA answers now link back to the relevant topic.

The full 243-page PDF is at `resources/IFDSM_Integrated_Revision_Notebook.pdf` and includes the existing 224-page notebook unchanged except for the updated front matter, inserted keypoint pages and refreshed pagination/footer. Table of contents: page 3. The 1,000 question texts, original correct-answer keys, local-storage identifier, exam and practice scoring code have not been changed. **Do not clear your browser data** when replacing the repository files.

The source-derived 224-page text has not been revised line-by-line for all guideline changes. The added keypoints highlight selected guideline-sensitive issues; consult original references and a licensed medical provider for clinical decisions. See `QA_KEYPOINTS.md`.
