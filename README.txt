HANDWRITTEN ACTIVE RECALL STUDIO — PHASE 1 PROTOTYPE

Included:
- Stylus-first freehand drawing using Pointer Events (pen input only).
- Finger input reserved for pan and pinch zoom.
- Pen, highlighter, eraser, colour and stroke width.
- Fixed page and infinite-canvas modes.
- Blank, ruled and grid paper.
- Multiple pages, undo/redo, local autosave in IndexedDB.
- Export/import complete JSON backup.
- Basic PWA manifest and service worker.

Important:
- This is a Phase 1 prototype, not a finished production app.
- Google Drive sync is intentionally not connected yet. Local IndexedDB is the primary store; Phase 6 will add Google Drive backup/sync after persistence and recovery are tested.
- Cloze, lasso selection, image occlusion, text and image insertion are planned for later phases.
- Stylus support depends on the browser/device exposing PointerEvent.pointerType === "pen".
- Test on the target tablet browser and desktop before relying on it for important notes.

Deploy:
1. Extract folder contents into a GitHub repository.
2. Enable GitHub Pages.
3. Open the published site on tablet and PC.
4. Create a test page, write with stylus, reload, and verify strokes remain.
5. Export a backup and import it on the second device for a manual transfer test.

Data:
- Stored locally in browser IndexedDB database "HARStudioDB".
- Export backup creates Handwritten-Active-Recall-Backup.json.
