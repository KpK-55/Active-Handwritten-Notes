RecallNote – Phase 1 tablet-first MVP

Files
- index.html: application shell
- style.css: StarNote-inspired dark UI
- app.js: Canvas handwriting engine and IndexedDB persistence
- manifest.webmanifest + sw.js + icon.svg: installable PWA support

Run locally
1. Extract this folder.
2. Serve it over localhost (service workers/PWA require localhost or HTTPS).
   Easiest on a PC with Python installed, open a terminal in this folder and run:
       python -m http.server 8000
3. Open http://localhost:8000 in Chrome or Edge.
4. For tablet installation, host the folder on an HTTPS static host (e.g. GitHub Pages), open the URL in Chrome, then use Install app / Add to Home screen.

Current Phase 1 scope
- Pen, pencil-style pen, highlighter, stroke eraser
- Pointer Events and pressure capture
- Lasso selection of strokes
- Undo/redo for completed stroke/erase actions
- Fixed-page and large-canvas modes
- Zoom controls and page list
- IndexedDB local persistence
- PNG page export and JSON notebook backup
- PWA manifest and offline cache

Known MVP limitations
- Infinite canvas is currently a large pannable/zoomable work surface, not an unbounded world-coordinate canvas.
- Lasso currently selects strokes that have at least one point inside the polygon; it is a first-pass selector.
- Eraser removes whole strokes when touched, not partial stroke segments.
- Pencil is currently a pen-style stroke preset; pressure-sensitive width interpolation and pencil texture need refinement.
- Multi-page navigation and local storage are implemented, but notebook/folder management, cloud sync, PDF import, cloze, and image occlusion are not yet included.
- PWA offline caching works only when served from localhost or HTTPS.
