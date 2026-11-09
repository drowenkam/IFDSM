# IFDSM — Online Volume I Reader QA

## Delivered functionality

- Primary Volume I reading surface is HTML, **not PDF**.
- All 10 competencies and all 78 syllabus subsections are addressed.
- 61,338 extracted teaching-text words, with 38 source illustrations and 105 HTML tables.
- Master numerical tables, original 60-item mock and answers, abbreviations, references available as HTML appendices.
- Expand all / Collapse all; deep links to section §x.y; chapter-to-chapter pagination; Home, Contents and SBA Bank navigation.
- Per-section read/unread tracking kept separate from the unchanged SBA progress and scoring store.
- Direct section-to-SBA and SBA-to-section links retained.

## Automated results

- `node qa/check-webapp.js` — **26 passed / 0 failed**, covering question and score logic, progress, keypoint source mapping, and the site data.
- `node qa/check-full-html.js` — **10 passed / 0 failed**, covering all 78 full sections, 38 figures, 105 tables, appendices, offline cache, note links and preserved answer keys.
- Browser DOM smoke test via Chromium **using in-memory HTML**, at 390×844 (iPhone), 810×1080 (iPad), and 1440×900 (desktop). Verified 10 contents cards; chapter 1 displays 12 in-page subsections and full text; §1.3 direct link opens full source notes and Q71; chapter 8 displays 10 sections; expand-all and collapse-all work; master numbers accessible. **No JavaScript page errors in these smoke runs.**
- 1,000 question records, `data/chapters.js`, keypoint source, and 177-page source PDF were SHA256-compared with the immediately previous GitHub release and confirmed unchanged.
- All source image paths tested for local existence.

## Explicit limitations

- Direct browser navigation to localhost/file URL was blocked by a browser security policy, so live GitHub deployment, the service-worker installation process and physical iOS devices were not end-to-end tested. These should be checked after deployment.
- Converted tables are selectable HTML text, but extremely complex PDF table layouts may not perfectly match the source page. The source PDF is retained for reference.
- Source content is reproduced for revision; clinical guidelines have not been freshly checked as part of this website-only update.
