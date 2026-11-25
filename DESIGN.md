# Visual Direction — There & Back Again

## Design philosophy

A living, interactive illustrated fantasy atlas.

The application should feel handcrafted, immersive, atmospheric and premium. Avoid the appearance of a generic low-poly game demo or a conventional dashboard.

The 3D world is the interface.

## Design references

See `references/design/` for visual inspiration.

- 01 — World map and terrain
- 02 — Bag End exterior
- 03 — Interactive interior dioramas
- 04 — Atmospheric environments and lighting
- 05 — Character art direction
- 06 — Interface design

Use these references for composition, visual quality, lighting, colour and atmosphere, rather than copying them literally.

## Colour palette

| Token | Colour |
|---|---|
| Parchment | #E9DFC5 |
| Forest | #344B36 |
| Moss | #77865B |
| Antique gold | #C2A36B |
| Ink | #242820 |
| Mountain | #78858C |

## Typography

- Display: IM Fell English
- Interface: Inter

## 3D rendering principles

- Handcrafted miniature environments.
- Natural, cohesive terrain.
- Orthographic or controlled perspective cameras.
- Soft shadows and atmospheric depth.
- Subtle environmental animations.
- Cinematic transitions between the world map and detailed locations.
- Consistent character proportions and materials.
- Avoid excessive bloom, saturation and distracting effects.

## Interface principles

- Full-screen interactive world.
- Minimal floating navigation.
- Contextual information panels.
- Chapter-based timeline.
- Clear distinction between reading progress and exploration.
- Responsive desktop and mobile layouts.
- Accessible interactions and reduced-motion support.

## Asset principles

The original asset packs are stored in `assets/`.

Inspect the existing models before creating replacements. Prefer GLB and glTF formats. Preserve associated textures, binary buffers and licence information.

Copy only required, licensed runtime assets into `public/assets/`.

Do not bundle the original reference PDF, private screenshots or entire downloaded asset libraries into the deployed application.

Prioritise cohesive art direction over using every available asset.

## Reference image interpretation

The six original references are available in `references/design/`. Five additional references under `references/design/immersive/` inform eye-level composition, lighting, architecture and material detail.

The desired artistic direction is stylised realism with handcrafted miniature environments, rather than simplistic low-poly graphics.

- `01-world-map.png`: Primary visual target for the world map. Prioritise the large left-hand reference for terrain composition, geographical scale, mountains, forests and waterways.
- `02-bag-end-exterior.png`: Reference for organic architecture, vegetation, materials and natural lighting.
- `03-interior-diorama.png`: Reference for explorable cutaway environments, cosy interiors and interactive objects.
- `04-environment-lighting.png`: Reference for atmospheric depth, environmental lighting, fog and regional atmosphere.
- `05-character-design.png`: Reference for expressive miniature characters, proportions, distinctive silhouettes and material quality. Character appearances must follow the book's descriptions.
- `06-interface-design.png`: Functional inspiration for map navigation and contextual information panels only. The final interface should be considerably more minimal, refined and modern.

The references represent the desired visual quality and atmosphere, not exact assets to reproduce.

Use the existing asset packs as building blocks. Enhance them with custom materials, procedural geometry, lighting, environmental effects and careful composition.

Do not use narrative information visible in the reference screenshots as source material. The supplied book remains the source of truth, and strict spoiler protection applies.

Avoid generic low-poly demo scenes, flat terrain, excessive visual clutter and inconsistent art styles.

## Immersive locations

The miniature atlas is the discovery view. Entering a location changes to a perspective environment with natural surroundings or enclosed architecture. Bag End composes the view around a curved footpath, framed garden, layered woodland and open sky. Inside, the timber-lined entrance, lamps and rug lead to warm furnished areas and the animated hearth. Camera limits keep the reader above the ground and within the finished space.

Walk uses a restrained reticle and a context prompt that appears for visible, nearby discoveries. Entering and peeking at the door are distinct actions. The garden preview uses a fitted timber passage, with a matching entrance composition in the separately loaded interior. Interior Dollhouse uses the same furnishings with the enclosing walls and roof opened for inspection. Historical settings use the visible chapter facts for exhibits, table settings and light.

The private immersive references inform broad composition and atmosphere. The runtime scene uses original geometry and the licensed local resources listed in ASSETS.md. The written source governs descriptive facts.
