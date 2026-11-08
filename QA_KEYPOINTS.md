# IFDSM Clinical Keypoint Update — QA and sources

## Editorial scope

- Base reference: user-provided **Dental Sleep Medicine IFDSM (Final)** integrated notebook (224 pages).
- Added 78 self-contained clinical learning points and 30 mini-cases across the exact ten competencies and 78 syllabus sections.
- Original 224 source pages were retained; this edition adds 19 topic insert pages, resulting in a 243-page PDF.
- Only a targeted set of published guideline-sensitive statements was crosschecked. This is not a comprehensive guideline/clinical peer review of the entire source notebook or the 1,000 SBAs.
- No changes to correct-answer positions, question text, question numbering, progress key, save/resume rules, scoring logic or answer-record format.
- 2025 AADSM standards state that a qualified dentist may order/administer HSAT where permitted; diagnosis is made by an authorised medical provider.
- Certain high-yield percentages (Pcrit distribution, endotypes, OAT response, oral-appliance protrusion) are context-specific and should not be treated as absolute eligibility rules.
- Clinical expansion for paediatric OSA: 2024 ATS guideline gives conditional recommendations with very-low-certainty evidence for selected children with persistent OSA and relevant craniofacial features.

## Selected external references (checked November 2026)

- **R1** — [Levine M, Cantwell M, Postol K, Schwartz D. Dental Sleep Medicine Standards for Screening, Treatment, and Management... J Dent Sleep Med. 2025;12(2).](https://www.aadsm.org/journal/special_article_1_issue_122.php)
- **R2** — [Ramar K, Dort LC, Katz SG, et al. AASM/AADSM Clinical Practice Guideline for Oral Appliance Therapy. J Clin Sleep Med. 2015;11:773-827.](https://pmc.ncbi.nlm.nih.gov/articles/PMC4481062/)
- **R3** — [Kapur VK, Auckley DH, Chowdhuri S, et al. Diagnostic Testing for Adult OSA. J Clin Sleep Med. 2017;13:479-504.](https://pmc.ncbi.nlm.nih.gov/articles/PMC5337595/)
- **R4** — [Ehsan Z, et al. ATS Guideline for Persistent Post-Adenotonsillectomy OSA in Children. AJRCCM. 2024;209:248-261.](https://pmc.ncbi.nlm.nih.gov/articles/PMC10840779/)
- **R5** — [AASM. Polysomnography for OSA Should Include Arousal-Based Scoring. J Clin Sleep Med. 2018;14:1245-1247.](https://pmc.ncbi.nlm.nih.gov/articles/PMC6040795/)
- **R6** — [Postol K. AADSM Standards for Practice: 2025 update letter. J Dent Sleep Med. 2025;12(2).](https://aadsm.org/journal/letter_1_issue_122.php)

## Functional test expectations

- All 10 topics and 78 learning-outcome codes are present in `data/keypoints.js`.
- The updated page map should direct every topic to new keypoints, original condensed notes and detailed notes.
- The core progress key remains `ifdsm-sba-examstyle-v2`.
- Original 1,000-question bank and printable SBA PDF remain byte-for-byte unchanged relative to `IFDSM_GitHub_Update.zip`.
- The offline cache version has been advanced and explicitly includes `data/keypoints.js`.
- Check on a published GitHub Pages site in Safari, especially PDF page anchors, offline startup and persistent progress.
## Verification of this release

- 26/26 direct JavaScript tests pass, including session scoring, unanswered and revealed-only classifications, progress persistence, keypoint/learning-outcome coverage, all ten keypoint routes, and question-to-note links.
- The revised PDF has 243 pages (224 original pages, with pages 2-3 refreshed and 19 new clinical keypoint pages inserted). The original illustrated chapters and end-of-book material are retained.
- A local Chromium browser navigation test was attempted but `localhost` was blocked by the execution environment (`ERR_BLOCKED_BY_ADMINISTRATOR`). Consequently, **iOS Safari and end-to-end offline service-worker behaviour have not been verified on physical devices**. Structural links and source files were checked.
- GitHub Pages deploy: upload all folder contents, retain `index.html` at repository root, and refresh online before using offline. Existing browser question progress should persist because the original storage key and question bank were unchanged; export a progress backup first.
