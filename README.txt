RecallNote – StarNote Importer Test Build

This build adds an experimental StarNote .note archive importer.

How to test:
1. Replace the files in your RecallNote repository with all files in this folder.
2. Keep jszip.min.js in the same folder as index.html and app.js.
3. Deploy to HTTPS/GitHub Pages.
4. On tablet, open RecallNote and choose Import .note.
5. Select your StarNote file: "Breathing and Exchange of gases.note".

What this test importer currently reconstructs:
- Reads the ZIP-based .note container.
- Reads note_info metadata and identifies page IDs, dimensions and layer names.
- Creates RecallNote pages for the discovered StarNote pages.
- Extracts embedded PNG/JPEG/WebP resource assets and places them as image objects on imported pages.
- Stores the original .note archive as a local IndexedDB backup record.

Important limitations:
- Original vector stroke/point binary records are NOT yet decoded into editable RecallNote strokes.
- Imported page backgrounds/template appearance and exact resource placement are not yet reconstructed.
- Extracted image assets are placed in a simple gallery layout, not their original positions.
- This is an importer feasibility test, not a lossless conversion.
- Do not delete your original StarNote file. The importer keeps a local copy, but that is not a substitute for an external backup.

Technical:
- Vanilla HTML/CSS/JS, no React/Vite.
- JSZip is bundled locally so archive import works offline after deployment/cache.
- IndexedDB schema upgraded to v2.
