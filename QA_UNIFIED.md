# IFDSM unified-site quality checks

**What changed:** The Volume I notebook is now a first-class view inside the same `index.html` app as the Volume II SBA question bank. The previous external jump to `notes.html` was replaced with internal chapter and lesson routes. `notes.html` is now an old-link redirect.

## Source and link integrity

- 10 chapters and 78 unique learning sections preserved from the previously supplied HTML notes.
- Approximately 60,000 words of full teaching material embedded in `data/notebook-chapters.js`.
- 105 HTML tables and 38 figure elements retained; all referenced figure assets included.
- 1,000 unique linked SBA question numbers across the 78 sections.
- `data/questions.js` and `data/keypoints.js` preserved without altering SBA content, answer keys or progress storage key.

## Interaction tests

- **48/48 passed** in Chromium using an inline-loaded site harness at desktop, iPhone and iPad viewports: integrated home, notebook directory, Chapter 1 full content, table and figure elements, section-specific SBA links, SBA detail, back to lesson, review marker, scored session, SBA-to-notebook and back to saved session, no JavaScript exceptions.
- **27/27 passed** in direct JavaScript regression tests: coverage, answer keys, partial/exact scoring, 1,000-question scoring extreme, resume/reload logic, review, navigation, and unified notebook routes.
- Smooth scrolling was disabled to prevent delayed off-screen clicks in long chapters on small screens.

## Not tested

- The public GitHub Pages deployment (it is **not updated** by creating the ZIP).
- Physical iPhone/iPad Safari or installed home-screen app, and real-world offline update behaviour.
- Independent peer review of the underlying 1,000 clinical questions.

The browser flow checks use an inline local test harness because this environment blocks local HTTP navigation. They confirm actual DOM and JavaScript interactions, not network deployment.
