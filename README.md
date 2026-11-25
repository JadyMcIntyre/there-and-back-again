# There & Back Again

A private, interactive reader’s atlas for *The Hobbit*. V0.2 includes a full-screen miniature world, a chapter-controlled route, Bag End, and a source-referenced journal.

## Run locally

Requires Node.js 22.12 or later.

```sh
npm ci
npm run dev
```

Drag to orbit, right-drag to pan, and scroll to zoom. Touch supports one-finger orbit and two-finger zoom and pan. The camera buttons provide discrete controls. Collapse the field notes or use immersive mode for an unobstructed view. On phones, field notes open in a bottom sheet.

Select a chapter to explore it without moving the reading bookmark. The URL preserves the selected location and historical chapter. **Return to bookmark** restores the current reading view. Search accepts arrow keys, Enter, and Escape. Journal page references use one-based PDF page numbers in the supplied Enhanced Edition.

## Verify

```sh
npm test
npm run check:assets
npm run build
npx playwright install chromium
npm run test:e2e
```

Set `ATLAS_CHROME_CHANNEL=chrome` to use installed Chrome. Playwright serves the production build on loopback and captures desktop and mobile screenshots in `test-results/`. The service worker caches the build and local assets after a successful online visit.

## Architecture

| Area | Responsibility |
| --- | --- |
| `src/content/` | Validates book and edition records and provides one filtered projection to the map, scenes, journal, recaps, search, and URLs. Facts, routes, portraits, cross-references, and checkpoints carry reveal positions. A related entry must also be visible before its link can appear. Places mentioned in the book can have journal entries independently of their presence on the model. |
| `src/content/progress.ts` | Validates and persists the edition-specific reading bookmark with Zustand. Explicit chapter and event choices determine visibility. Chapter history is URL state with a cutoff at the bookmark. |
| `src/world/` | Renders procedural terrain, waterways, instanced woodlands, miniature landmarks, and the journey. The camera projects marker coordinates as it moves and prioritises labels when they overlap. Hobbiton adds detail at closer zoom levels. Atlas and location scenes use orthographic compositions and render on demand. |
| `src/world/WorldStage.tsx` | Coordinates the approach shot, lazy-loaded scene, first rendered frame, and dissolve. A transition owns its camera and animation work until it completes or the request is cancelled. The map pose is saved before the approach and restored when returning. Both renderers coexist only during a transition. Reduced motion skips the animated camera moves and dissolve. |
| `src/scenes/` | Registers scene renderers, asset preloads, camera compositions, and interactive exhibits. Bag End opens onto a small panelled threshold built with the reusable interior shell. Furnished rooms remain a later addition. |
| `src/ui/` | Provides floating world controls, mobile field notes, chapter navigation, searchable discoveries, and the editorial journal. |
| `scripts/` | Checks glTF dependencies and generates a content-versioned service worker from the production build. |

### Source boundary

The atlas is a schematic reconstruction. The private Wilderland map on PDF page 7 and Hobbiton illustration on page 24 informed the geography and local layout. Chapter VII’s description on pages 96–112 places the Carrock in the Great River, Beorn’s house east of the river, and the forest gate to the north. The app uses its own geometry and paraphrased notes.

Chapters I–VIII begin on PDF pages 25, 42, 54, 61, 70, 84, 96, and 113. The default bookmark is at the opening of Chapter VIII. The journal and complete recaps cover Chapters I–VII. [ASSETS.md](ASSETS.md) records the runtime assets and licences.
