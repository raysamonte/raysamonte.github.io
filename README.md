# Static multimedia portfolio

Cream and burgundy portfolio with responsive layouts, device-aware light/dark themes, a YouTube showreel, photo filters and a keyboard-accessible image viewer. Plain HTML, CSS and JavaScript: no framework, build, dependencies, database or application server.

## Preview

Open `index.html` in a browser. For embedded YouTube playback, serve over HTTP instead of opening a file URL. From this folder, if Node is installed:

```
node preview.mjs
```

Open http://localhost:4173. Press Ctrl+C to stop the preview. This server is a development convenience only and is not deployed.

## Add your content

Edit `portfolio.js`:

- `name`: your professional display name.
- `youtubeUrl`: your YouTube watch/share/embed URL. The player loads only when Play is clicked. Allow embedding on YouTube. Until configured, the page clearly says the showreel is coming soon.
- `resumeUrl`: add your PDF inside `assets/` and enter its relative path.
- `email`, `linkedinUrl`: your public contact details. Empty values show a coming-soon message rather than a broken link.
- `photos`: replace the sample files with your own images. Set titles, categories and meaningful alt text; set `sample: false`. Category buttons are automatic. Optional `fullSrc` can point to a larger copy for the lightbox.

Replace `assets/hero.jpg` with a still from your work, and `assets/showreel.jpg` with your own video cover. To use another filename, edit the hero background in `styles.css` or the cover in `index.html`. The introduction is in `index.html`.

Sample photographs are layout placeholders, not the portfolio owner's artwork. See `assets/CREDITS.md`. The gallery sample notice disappears after all entries have `sample: false`. Remove placeholder artwork only after adding your own photographs.

## Themes and controls

The first visit follows device preference. The navigation theme button switches light/dark and remembers the selection locally. Right-click the button to return to device preference. The gallery supports category filters, click-to-enlarge, Escape to close and left/right arrows to navigate.

## Publish on GitHub Pages

1. Create a GitHub account and a public repository, such as `portfolio`.
2. Upload `index.html`, `styles.css`, `script.js`, `portfolio.js`, `.nojekyll` and the `assets` folder to the repository root. Keep folder structure intact. `preview.mjs` is not required for hosting.
3. Open repository **Settings → Pages**. Choose **Deploy from a branch**, your main branch and **/(root)**, then save.
4. GitHub will provide the portfolio URL after deployment. Relative asset links work for both project sites and a `username.github.io` repository.

No deployment has been performed automatically. YouTube is the only runtime third-party service and loads after a user clicks Play; gallery photographs are local files. System fonts avoid external font requests.
