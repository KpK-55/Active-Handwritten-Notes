HANDWRITTEN ACTIVE RECALL STUDIO — STAR NOTE STYLE BUILD 02

This build reworks the interface to closely follow the supplied StarNote screenshots:
- Dark graphite UI
- Left vertical navigation with Search, All notes, Trash, folders, subjects and tags
- Top library header, backup reminder, All/Note/PDF tabs, note gallery
- Create popover with Create note, Infinite note, Import image, Import PDF and New folder
- Editor top navigation and two-row drawing toolbar
- Tool settings popover, colour palette, stroke size and zoom controls
- Paper selection row
- Right drawer with Pages and Recall tabs
- Settings modal and local backup / restore

Implemented in this build:
- Note creation, subject filtering, search, note gallery
- Multi-page documents and page switching
- Stylus-only handwriting (finger does not draw)
- Pen, pencil, highlighter and basic whole-stroke eraser
- Ink colour and thickness
- Blank, ruled and grid paper
- Page / infinite workspace modes
- Undo / redo, zoom
- IndexedDB local persistence
- JSON export and restore
- Basic PWA service worker

Still placeholders / not implemented:
- Accurate lasso, selection transforms and partial eraser
- Real image/PDF insertion into the canvas
- Functional Cloze masking and reveal rendering
- Image / area occlusion drawing and reveal engine
- Chapter review, sync and Google Drive
- Actual stylus pressure-width curve
- Camera, audio, timer and AI features intentionally omitted

INSTALL:
1. Extract this ZIP.
2. Upload all files directly to your GitHub repository root (index.html must be at root).
3. Commit and wait for GitHub Pages deployment.
4. Open the HTTPS Pages URL on your tablet and PC.
5. Test with sample notes first.

DATA:
IndexedDB is local to each browser/device. This build does not sync devices. Export JSON backups during testing. Do not rely on it as the only copy of important notes yet.

This is a substantial UI/foundation build, not a finished production clone. The StarNote screenshots were used as a visual reference; this is an original implementation and not StarNote's proprietary code.
