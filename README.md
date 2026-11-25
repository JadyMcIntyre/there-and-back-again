# There & Back Again

A private, interactive reader’s atlas for *The Hobbit*. The vertical slice includes a miniature 3D map, chapter-controlled route and discoveries, the Bag End garden diorama, a searchable journal and a locally saved reading bookmark.

## Run locally

Requires Node.js 22.12 or later.

```sh
npm ci
npm run dev
```

Drag on the map to orbit, right-drag to pan and scroll to zoom. Touch supports a one-finger orbit and two-finger zoom and pan. The compass and camera buttons provide discrete controls. Discoveries can also be opened from the field notes list, journal or search. Select a chapter in the trail to explore at that point in the story. Use the bookmark button to change actual reading progress.

## Verify

```sh
npm test
npm run check:assets
npm run build
npx playwright install chromium
npm run test:e2e
```

Set `ATLAS_CHROME_CHANNEL=chrome` to use installed Chrome for the browser tests. Playwright serves the production build on loopback and captures desktop and mobile screenshots in `test-results/`. The production service worker caches the built slice after a successful online visit, including the assets for a subsequent offline visit to Bag End.

## Architecture

| Area | Responsibility |
| --- | --- |
| `src/content/schema.ts` and `hobbit.ts` | Validate the book and edition records. Locations, facts, route legs, appearances, scenes, milestones and recaps have explicit chapter/event reveal positions. The selected edition’s PDF page mapping lives separately from story positions. |
| `src/content/spoilers.ts` | Produce one filtered projection for the map, scene, chapter history, search, journal and direct links. The cutoff is the earlier of the bookmark and the chapter being explored. A landmark must be revealed before its nested content can appear. |
| `src/content/progress.ts` | Validate and persist the reading bookmark per edition with Zustand. The PDF page is a place to resume. Explicit chapter and event choices determine what is safe to show. Historical exploration is session state and leaves the saved bookmark intact. |
| `src/world/` | Render procedural terrain, carved waterways, instanced vegetation, settlements, journey geometry and an orthographic camera. The terrain is a schematic west-to-east reconstruction from the book. The map uses smaller meshes and lower pixel density on mobile, and renders on demand. |
| `src/scenes/` | Supply lazy-loaded dioramas. Bag End receives only the filtered exhibits for its location. To add a scene, give it a reveal position and register its component in the viewport. |
| `src/ui/` | Compose the accessible HTML navigation, marker buttons, panels, journal and forms around the 3D world. Camera and door animations respect reduced-motion preferences. |
| `scripts/` | Verify glTF dependencies and generate a content-versioned service worker from the production build. |

The private Enhanced Edition was checked using one-based PDF page numbers. Chapters I–VIII start on pages 25, 42, 54, 61, 70, 84, 96 and 113. A new bookmark begins on page 113 at the opening of Chapter VIII. Seven chapters are complete. The catalog ends at that boundary. A new book or edition can use the same content filter and schema by supplying its own records and page mapping.

See [ASSETS.md](ASSETS.md) for provenance and runtime dependencies.
