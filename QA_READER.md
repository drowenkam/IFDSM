# IFDSM FPros-format reader — change and verification report

## Confirmed root problem

The previously supplied **IFDSM `notes.html` was only an 817-byte HTML redirect** to `book/index.html`. It was not equivalent to the user's **DipProstho `notes.html#chapters` reader**, which places its full chapter contents in the page. Some IFDSM routes also displayed intermediary notebook/keypoint landing screens. The previous claims of parity were not justified.

## Material changes in this release

| Component | Previous HTML-only package | This release |
|---|---|---|
| `notes.html` | 817-byte redirect | ~813 KB single HTML textbook containing the teaching material |
| Chapter interface | Second dashboard, then a separate HTML file | Chapter directory and full lessons on the **same page**, using the real DipProstho reader's structure |
| Lesson visibility | Depended on which entry point was used | Every one of 78 lesson articles is in the HTML, visible without opening a panel or PDF |
| Home `Volume I` link | `book/index.html` | `notes.html?v=21#chapters` |
| `Study Chapter 1` | Different HTML route | `notes.html?v=21#unit-1` |
| SBA explanation references | Separate chapter pages | Exact section in `notes.html?fromQuestion=N&v=21#section-X.Y` |
| Return to lesson | Indirect | A direct return to §X.Y from an SBA opened from that section |
| Offline cache | Previous service worker | New `ifdsm-fpros-reader-v21-20261109` and full inline page pre-cache |

The new reader uses the **owner's previously supplied `Dip_Pros_Volume_I_Reader_Fixed.html` as a layout and interaction reference**, including its persistent five-link study navigation, chapter directory, keypoint index, inline lessons, search, and SBA mapping. It uses the existing IFDSM full teaching content; it does not substitute the prosthodontic text.

## Data and static checks

- 10 chapter headings, 78 full learning sections.
- All 1,000 unique SBA question IDs are linked once across those sections.
- 105 genuine HTML tables and 38 source illustrations, with all referenced files present.
- 2,543 checked local HTML/asset links with no missing local files.
- The previous 1,000 SBA answer keys and all syllabus section mappings are preserved.
- 26 legacy/scoring JavaScript tests + chapter-add-on tests passed.

## UI rendering checks

36 checks passed with the **actual `notes.html` inserted into headless Chromium** at iPhone (390px), iPad (820px), and desktop (1365px) viewports. Checks include: chapter directory, full prose, first reference table, a loaded illustration, body text before question links, the chapter anchor, searchable notes, section-revised marking, and absence of page script errors.

**Limitation:** This environment blocks Chromium navigation to local HTTP, file URLs and public websites (`ERR_BLOCKED_BY_ADMINISTRATOR`). Therefore I did not complete a real deployed GitHub Pages end-to-end Safari test. Cross-page destinations were checked in HTML and the question-bank route/scoring logic was tested separately in JavaScript. User-side confirmation on the live site remains necessary.

## Direct verification after deployment

1. Open `notes.html?v=21#chapters` and confirm **ten cards** are visible.
2. Tap Chapter 1 **Read chapter**. It should jump to its chapter on the *same* page.
3. Scroll to §1.1; **Sleep is not passive rest...**, the functions-of-sleep table, and the original illustration should be visible **before** the Q32/Q34/etc. question links.
4. Select Q32. The SBA app should display that question, with a **Return to Volume I §1.1** link.
5. Check that the Progress view still contains your earlier saved results on the same device.

If the direct versioned URL above still shows only a keypoint panel or prompts for a PDF, the latest files have not been deployed to the path being opened, or a stale cached copy is being served.
