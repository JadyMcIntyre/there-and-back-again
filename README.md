# There & Back Again

A private reader’s atlas for *The Hobbit*. V0.3.1 refines the atlas and Bag End with smaller 3D hotspots, keyboard-first navigation and updated miniature artwork.

## Run locally

Requires Node.js 22.12 or later.

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Open http://127.0.0.1:5173/. To try the production build, including offline caching:

```sh
npm run build
npm run preview -- --host 127.0.0.1
```

Open http://127.0.0.1:4173/. Visit once while online and wait for **Ready offline on this device** in the bookmark editor. The production service worker prepares the entire available catalogue, including both Bag End scenes, portrait images, fonts and the inspection studio. The development server does not prepare an offline cache.

## Explore and read

- Drag to orbit. Shift-drag, Cmd/Ctrl-drag, middle-drag or right-drag to pan. Scroll to zoom. Focus the view to use arrow keys, plus and minus, or Home. The camera guide offers north-facing and overhead atlas views.
- Hover or focus a dot to see its name. Click, press Enter or Space, or tap to read its field notes. Double-click a landmark to visit its scene or focus it. Double-click a character or object to open its journal entry. Double-click open atlas terrain to centre the camera there.
- On a phone, drag with one finger to orbit. Use two fingers to pan or pinch to zoom. Tap a dot to select it and open the field-notes sheet.
- Press **Cmd/Ctrl + K** to open the command palette. Search discoveries, completed recaps and available actions. Use the arrow keys to choose, Enter to execute, and Escape to dismiss. Press **?** to see all shortcuts.
- Choose any available chapter in the trail to explore that moment. The reading bookmark still governs global search, the journal and discovery statistics. **Return to bookmark** restores the current reading view.
- Open the round door from its field notes, then choose **Enter Bag End**. The moment selector switches between the quiet morning and the gathering once both are known. **Return outside** restores the garden camera. **Back to the atlas** restores the map camera.
- Use **Inspect in 3D** on supported journal objects. Search supports arrow keys, Enter and Escape.

## Checks

```sh
npm test
npm run check:assets
npm run build
npx playwright install chromium
npm run test:e2e
```

Set `ATLAS_CHROME_CHANNEL=chrome` to use installed Chrome. The Playwright suite serves the production build on loopback and saves screenshots under `test-results/`. Browser bookmark changes run in isolated contexts.

## Architecture

| Area | Responsibility |
| --- | --- |
| `src/content/` | The spoiler filter produces separate projections for reading knowledge and the historical world. Entries, facts, aliases, relationships, encounters, recaps, and room links carry reveal positions. Mentioned places can appear in the journal before their atlas coordinates become available. |
| `reading.ts` and `progress.ts` | The edition defines all 19 page ranges. Explicit confirmation gates advancement. Zustand uses the existing storage key and preserves older bookmarks. New discovery badges track entries added by a confirmed change and prune when a rewind conceals them. |
| `src/world/` | World-space discovery mist follows encountered regions. The atlas and scenes share projected hotspots with opaque-geometry visibility checks, constant-size hit areas and collision-aware overview labels. The map and scenes share bounded pan, orbit and zoom controls. |
| `src/ui/shortcuts.ts` | The keyboard registry supplies app-level commands and key hints. Palette results use reading knowledge for entries and recaps, and the historical world projection for direct visits. |
| `WorldStage.tsx` and `src/scenes/registry.ts` | The registry supplies a lazy renderer, camera composition, preloads and exhibit IDs for each scene. The old renderer stays visible until the new scene has drawn a frame. A transition can be cancelled, and each visited world retains its previous camera pose when retracing the route. |
| `src/scenes/interiors/` | Reusable rounded walls, windows, mouldings and timber parts compose the furnished house. The quiet and gathering presentations use the same room with reveal-gated objects, a changed table setting, and a character placement. |
| `src/scenes/objects/` | Original models serve the studio and the interior. The journal provides the filtered entry. The studio changes the band’s finish only after the corresponding appearance fact is available. The field map uses original linework. |
| `ambient.ts` and `scripts/prepare-offline.mjs` | Demand rendering stays in place. Desktop fireplace and chimney effects request frames only for the active, visible scene when motion is enabled. Build output is versioned and cached locally, with readiness exposed in the bookmark editor. |

## Sources and scope

PDF references use one-based page numbers in the supplied Enhanced Edition. All 19 chapter starts were verified. The existing bookmark opens Chapter VIII at page 113 with Chapters I–VII completed. Later chapters support bookmark tracking and number-only trail slots. Narrative entries and recaps are authored through Chapter VII, with the current chapter heading available at its opening.

The Wilderland map and Hobbiton illustration informed the schematic atlas. Bag End’s rounded, panelled space and selected objects draw on Chapter I. Room layout, furniture placement, surfaces and lighting are artistic interpretations. See [ASSETS.md](ASSETS.md) for provenance.

Additional full location scenes, later chapter content, dedicated figures for the rest of the cast, and a separate flat map document viewer are future work. V0.3.1 adds close-range detail in Hobbiton and at Beorn’s house. Broader landscape and landmark detailing remains future work.
