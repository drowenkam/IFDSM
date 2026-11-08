# IFDSM SBA Question Bank - Answer-Format Revised Edition

This GitHub Pages folder replaces the earlier IFDSM exam-style website. It retains the 224-page integrated revision notebook and the author-edition cover.

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
