RecallNote – Phase 2 MVP (tablet-first)

Run
1. Extract this folder.
2. Serve over localhost or HTTPS:
   python -m http.server 8000
3. Open http://localhost:8000
4. For Android tablet installation, deploy to GitHub Pages and install from Chrome.

Included
- Canvas handwriting: pen, pencil preset, highlighter, whole-stroke eraser
- Stylus/finger Pointer Events and pressure capture
- Lasso selection
- Create Cloze from selected handwriting (bounding-region mask)
- Recall mode: tap a hidden region to reveal it
- Reveal all / Hide all controls
- Import an image into the page
- Rectangular image occlusion masks using the Mask tool
- Fixed paper and large work-surface modes
- Multiple pages
- IndexedDB persistence
- PNG export and JSON notebook backup
- PWA manifest and offline service worker

Important MVP limitations
- Cloze currently masks the bounding rectangle around selected strokes; it does not yet provide precise stroke-shaped masking.
- Image occlusion masks are rectangular only; freeform and ellipse masks are planned.
- Images are positioned centrally on import; move/resize/select image tools are not yet implemented.
- Eraser removes whole strokes.
- Infinite canvas is a large work surface, not truly unbounded.
- Undo/redo currently covers handwriting add/remove, not every object/mask operation.
- No cloud sync yet. Data is stored locally in the browser's IndexedDB.
- Test stylus pressure and pointer behavior on the target tablet; browser and stylus support vary.

Data model
Each page stores strokes, cloze regions, imported images and occlusion masks separately.
Original handwriting strokes remain stored when a cloze is created.
