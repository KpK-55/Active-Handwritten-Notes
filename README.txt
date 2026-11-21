RecallNote — Integrated Foundation Build
========================================

This is a new plain HTML/CSS/JavaScript PWA foundation based on the StarNote interface overview supplied by the user.

INSTALL / DEPLOY
1. Extract this ZIP.
2. Replace the contents of the GitHub Pages repository with ALL files from this folder.
3. Commit and push. Wait for GitHub Pages deployment.
4. Open the site in Chrome on the tablet. Reload once after deployment; if the old app persists, clear that site's cached data.
5. Use Create note to create notebooks. Data is stored locally in the browser using IndexedDB.

IMPLEMENTED IN THIS BUILD
- Library/home screen with note cards, search, folders, tags, recent and trash views.
- Create notebook with title, folder, A4 portrait/landscape, A3 portrait or infinite canvas, paper template and paper colour.
- Multi-page notebooks and page navigation/overview.
- Pen, pencil-style, highlighter, pressure-aware stylus stroke rendering when pressure is exposed by browser/device.
- Eraser, lasso selection, cloze from selected handwriting, rectangular image occlusion, recall reveal/hide.
- Lines, rectangles, ellipses, arrows, text insertion and image insertion.
- Colour presets/custom colour, adjustable thickness, undo/redo.
- Stylus-only ink: finger touch is navigation only; one finger pans, two fingers pinch zoom. Touch input does not create ink.
- Local autosave, PNG export of current page, JSON notebook backup, dark/light theme.
- PWA manifest and service worker cache.

NOT YET IMPLEMENTED / KNOWN LIMITS
- No cloud sync or multi-device sync.
- StarNote .note importing is intentionally not included in this build.
- PDF export, image crop/resize handles, movable/resizable object selection, advanced accurate lasso, audio recording, tape tool, stickers, tables with editable cell text, link previews, and full stylus button mappings are not complete yet.
- Pressure sensitivity depends on browser/device support. This build uses pointer pressure when available; no claim of hardware-level palm rejection. Software ignores touch as ink, but actual palm rejection also depends on tablet/browser digitizer behaviour.
- Infinite canvas is currently a large working surface, not an unbounded virtual canvas.
- Data is local to this browser profile. Download regular backups before clearing browser data.

TEST STATUS
- JavaScript syntax checked with Node.js.
- Not yet tested on the user's tablet or deployed GitHub Pages environment. Please test stylus writing, finger navigation, page switching, autosave and backup before relying on it for important notes.
