# IFDSM — The Question Bank (GitHub Pages website)

Mobile-friendly, static HTML edition of **The Question Bank — Notes in Dental Sleep Medicine**, with **1,000 actual questions, answer explanations and all 78 learning-outcome sections**. No hosting backend, account, special build step, or third-party dependencies.

## Publish on GitHub Pages (browser method)

1. Extract `IFDSM_GitHub_Pages_Website_Updated.zip` on your computer.
2. On GitHub, select **New repository**. For example name it `ifdsm-question-bank`, select **Public**, and create the repository. (On GitHub Free, Pages requires a public repository.)
3. In the repository, select **Add file → Upload files**. Upload **the contents of the extracted `IFDSM_GitHub_Pages_Website` folder**, including `index.html`, `assets`, `data`, `resources`, `.nojekyll`, `manifest.webmanifest`, and `sw.js`. The `index.html` must be in the repository root, not inside an extra folder.
4. Commit the files.
5. Go to **Settings → Pages → Build and deployment**. Choose **Deploy from a branch**, then select **main** and **/(root)** and save.
6. Your site address will resemble `https://YOUR-USERNAME.github.io/ifdsm-question-bank/`.
7. Open the URL in **Safari** on your iPhone/iPad. Use **Share → Add to Home Screen** to install the shortcut.

No domain, API key, database, Node/npm, or GitHub Actions configuration is required.

## How to use

- **Home**: Topic overview and quick launch. The white book-style cover matches the author edition.
- **Practice**: Choose a topic, question type, order, and question count. Select A–E to see immediate justification and learning-code reference.
- **Mock exam**: Hide answers until completion. Track your elapsed time, go back to previous questions, and see a scored review.
- **Browse all**: Search by topic, syllabus section, or keywords; bookmark questions.
- **Progress**: Unique questions attempted, accuracy by competency, session history, bookmarks, and JSON export/import.
- **Notebook**: Open the original 224-page final integrated revision PDF, navigate ten topics by page number, or save the full file to your device.
- **About**: Download the PDF author edition and the final integrated revision notebook in the `resources/` folder.

**New — Final Integrated Revision Notebook:** The 224-page `Dental_Sleep_Medicine_IFDSM (Final) .pdf` you supplied is already byte-for-byte identical to the PDF included at `resources/IFDSM_Integrated_Revision_Notebook.pdf`. This update exposes that same document on a new **Notebook** tab, with all ten competency page references, high-yield versus full study page ranges, master-number tables, mock paper, and source bibliography. It retains the exact original illustrations, formatting, and PDF bookmarks; no duplicate file is stored. PDF topic page-jump links depend on the device viewer, so the page numbers are displayed beside each link.

The website remembers progress in the device's `localStorage`. Results do not automatically synchronize between devices. Use **Export progress JSON** from your first device and **Import progress JSON** on another device to transfer your results. Import overwrites the second device's local progress.

## Offline use

Once loaded from GitHub Pages over HTTPS, the website installs a service worker to cache `index.html`, CSS, JavaScript, question data, and app icons. You should open the site online once before expecting offline availability. After future updates, revisit online to load new content. The PDFs are available in `resources/` and can be saved separately; they are not automatically preloaded for offline use.

## File layout

```
index.html                   Single-page website
.nojekyll                    Disable Jekyll processing on GitHub Pages
assets/styles.css            Responsive iPhone, iPad, and desktop styling
assets/app.js                Practice, exam, answer review, bookmarks, local progress
assets/icon.svg              Website icon
assets/icon-192.png          iOS home-screen icon
assets/icon-512.png          Home-screen / PWA icon
data/questions.js            All 1,000 questions, original options and explanations
manifest.webmanifest         Add-to-home-screen metadata
sw.js                        Offline caching for core site
resources/IFDSM_Integrated_Revision_Notebook.pdf   Exact uploaded final 224-page notebook
resources/IFDSM_Question_Bank_Author_Edition.pdf   Question bank PDF
assets/notebook-cover.webp  Preview of the actual notebook front cover
```

## Important notes

- Single-best-answer is always **one selection from A–E**. Some questions have "all of the above" or "none of the above" as individual options, not multiple-selection answers.
- The site is an **independent revision aid**, **not** an official IFDSM examination or clinical care guideline.
- GitHub Pages sites are publicly accessible even if the repository is private under some paid plans; do not upload confidential, patient-identifying or restricted materials.
- If you need to correct/edit a question, make changes in `data/questions.js` and update the service-worker cache version in `sw.js` so returning visitors receive the updated data. For larger editing workflows, maintain a separate original source data file and regenerate the JS.
