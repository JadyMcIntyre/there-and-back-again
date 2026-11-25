# There & Back Again — Interactive Reading Companion

Build a premium, immersive, spoiler-safe 3D web application that accompanies readers through J.R.R. Tolkien's The Hobbit.

## Product vision

Create an interactive miniature Middle-earth world that progressively reveals the journey as the reader advances through the book. This is a reading companion, not a combat game, conventional wiki or administrative dashboard.

The application should feel like an illustrated fantasy atlas brought to life.

## Technology

- React and TypeScript
- Vite
- Three.js
- React Three Fiber
- Drei
- Zustand
- GSAP
- Tailwind CSS
- Zod
- Vitest and Playwright
- Offline-capable PWA

## Visual direction

Use stylized, handcrafted, miniature 3D environments with cohesive materials, atmospheric lighting, subtle animations and cinematic camera movements.

Draw inspiration from the navigational experience of Google Earth, the composition of Monument Valley and the miniature architecture of Townscaper.

Use a restrained, premium interface with forest green, warm parchment, antique gold and muted natural colours.

Avoid generic dashboard layouts, excessive borders, visual clutter and movie-derived character likenesses.

## Source material

Use the supplied Enhanced Edition of The Hobbit as the primary private development reference for geography, character appearances and narrative content.

Do not use film adaptations as the narrative source. Do not import unfiltered information from external Tolkien wikis.

Never bundle the copyrighted PDF or unlicensed illustrations into the deployed application. Maintain a documented licence manifest for assets.

## Core experience

1. Render an interactive 3D terrain map with mountains, forests, rivers, settlements and landmarks.
2. Allow panning, rotation, zooming and cinematic camera transitions.
3. Display the company's journey up to the reader's current position.
4. Allow the reader to select previously discovered locations.
5. Transition into detailed, interactive miniature 3D scenes.
6. Allow characters and objects to be selected for spoiler-safe information.
7. Provide a character journal, object collection, chapter recaps and reading tracker.
8. Persist progress locally and support offline exploration of downloaded content.

## Mandatory spoiler protection

Implement a central, reusable content-filtering engine.

Every individual fact, character appearance, object, scene, route segment, relationship and map annotation must have an explicit reveal position.

Support chapter-level and finer event-level progression. Keep PDF page mappings specific to the selected edition.

Do not display, preload visually, search, suggest or expose future narrative information in the interface. Unknown geography may appear generically without revealing future events or routes.

Distinguish the reader's actual progress from the historical chapter or location they are currently exploring.

Include automated tests that verify spoiler protection at multiple reading positions, including direct navigation and search.

Do not expose future story details in development summaries shown to the user.

## Initial reading position

- Book: The Hobbit
- Edition: Enhanced Edition
- Chapter: VIII — Flies and Spiders
- PDF page: 113, as reported by the reader
- Completed chapters: I–VII

Treat Chapter VIII as just started until the reader explicitly advances.

Verify PDF pagination independently.

## Initial scenes

Build Bag End as the first fully polished vertical slice.

Prepare the architecture for the following additional scenes:

- The trolls' camp
- Rivendell
- The Misty Mountains
- Gollum's underground lake
- The burning trees
- Beorn's house
- The entrance to Mirkwood

Do not reveal events beyond the supplied reading position.

## Asset strategy

Use reusable GLB models, procedural terrain, modular buildings, instanced vegetation and shared materials.

Source compatible assets from Kenney, Quaternius, Poly Pizza and Poly Haven, subject to their individual licences.

Develop original character appearances based on the book descriptions. Reuse modular humanoid rigs with custom proportions, beards, clothing, colours and accessories.

Use procedural geometry for simple custom objects when appropriate.

Lazy-load location scenes, compress assets, use instancing, manage GPU resource disposal and provide adaptive rendering quality for mobile devices.

## Implementation phases

Phase 1: Establish the application architecture, visual system, content schema and spoiler engine.

Phase 2: Build the interactive terrain map and chapter-controlled journey progression.

Phase 3: Implement a fully polished Bag End scene with interactive characters and objects.

Phase 4: Add the character journal, object collection and reading tracker.

Phase 5: Expand the reusable scene system to additional completed chapters.

Phase 6: Implement offline support, mobile optimisation, accessibility and comprehensive automated tests.

Build a working vertical slice before expanding the content library. Prioritise visual quality, performance, maintainability and strict spoiler protection.

Design the content architecture to support additional books in the future without rebuilding the core application.