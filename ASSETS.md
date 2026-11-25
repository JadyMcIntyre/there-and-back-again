# Asset and licence manifest

The original library under `assets/` stays intact. The first table lists the raw library exports and the derived texture used at runtime. The build packages `public/`, the application modules and their compiled dependencies.

## Runtime assets

| Runtime files under `public/assets/` | Source and licence | Use |
| --- | --- | --- |
| `kenney/fence.glb`, `fence-gate.glb`, `rock-wide.glb`, and `kenney/Textures/colormap.png` | [Kenney Fantasy Town Kit 2.0](https://kenney.nl/assets/fantasy-town-kit), CC0 1.0. The supplied notice is in `kenney/LICENSE.txt`. | Garden fences, gate and rock at Bag End. The gate and rock also appear in close-up Hobbiton. The GLBs embed their binary data and share the original external colour map. |
| `quaternius/Bush_Flowers.gltf`, `Flower_1_Clump.gltf`, their two matching `.bin` files, `Bush_Leaves.png` and `Flowers.png` | [Quaternius Ultimate Stylized Nature Pack](https://quaternius.com/packs/ultimatestylizednature.html), CC0 1.0. The supplied notice is in `quaternius/LICENSE.txt`. | Small plant groupings at Bag End. Both meshes retain their original geometry, materials and texture paths. |
| `materials/garden-grain.webp` | [Poly Haven Forest Ground 01](https://polyhaven.com/a/forrest_ground_01), CC0. Derived from the local colour map under `assets/textures/` as a low-contrast greyscale WebP. | Tiled microdetail on the close Bag End terrain. The mesh’s vertex colours supply the grass and path tones. |

The app generates its terrain, route, woodland, small settlements, Bag End architecture, stepping stones, grass and figures in code. The compass icon is drawn for the project. The Bag End field-notes thumbnail (`bag-end.webp`) and the journal portraits for Bilbo, Gandalf, and Thorin under `portraits/` are captures of the app’s original 3D diorama and collectible figures. V0.3 adds original procedural geometry for Bag End’s cutaway and its household furnishings, seven collectible object models, a procedural ash-and-ivory mist shader, and a generated chimney smoke texture. The inspection studio and the house share several object models. The ring surface follows the visible description and the map uses original marks. The journal’s thumbnails under `objects/` are WebP captures of the app’s original studio models. The ring has two captures, selected through the same visible appearance fact as the live model. V0.3.1 refreshes the three local portraits from the revised in-world meshes and adds procedural detail to the Hobbiton and Beorn atlas miniatures. The remaining journal illustrations use original CSS silhouettes and Lucide symbols. Lucide provides interface icons under the package’s ISC licence.

[IM Fell English](https://fontsource.org/fonts/im-fell-english) and [Inter](https://fontsource.org/fonts/inter) are self-hosted via Fontsource under the SIL Open Font License 1.1. The production build includes both licence notices.

## Library audit

The inventory covers 2,145 files after excluding Finder metadata. The counts include source files, alternate exports, textures and pack documentation.

| Original directory | Files | Pack and licence | Intended use |
| --- | ---: | --- | --- |
| `assets/fantasy-town/` | 847 | [Kenney Fantasy Town Kit 2.0](https://kenney.nl/assets/fantasy-town-kit), CC0 via bundled notice | Selected garden props ship now. The modular timber, stone and roof pieces are available for future settlements. |
| `assets/nature/` | 369 | [Quaternius Ultimate Stylized Nature Pack](https://quaternius.com/packs/ultimatestylizednature.html), CC0 via bundled notice and publisher page. The text file carries a different pack heading. | Selected flowering plants ship now. Consider the remaining vegetation for close-up scenes after checking the full dependency size. |
| `assets/props/` | 517 | [Quaternius](https://quaternius.com/) Fantasy Props MegaKit Standard, CC0 via `License_Standard.txt` | Keep in the source library for future interiors, furniture and still-life sets. |
| `assets/characters/` | 342 | [Quaternius](https://quaternius.com/) Ultimate Animated Character Pack and RPG Characters, CC0 via their bundled notices | Potential rig and animation references for custom characters. The initial figures use original procedural models with book-based silhouettes. |
| `assets/animals/` | 63 | [Quaternius](https://quaternius.com/) Ultimate Animated Animals, CC0 via bundled notice | Available for later scene dressing where the book establishes an animal’s appearance. |
| `assets/hdri/` | 2 | Filename and metadata match Poly Haven’s [Meadow](https://polyhaven.com/a/meadow) and [Mossy Forest](https://polyhaven.com/a/mossy_forest), both CC0. | Available for future lighting studies. Current scenes use real-time lights. |
| `assets/textures/` | 5 | The filenames and map types match Poly Haven’s [Forest Ground 01](https://polyhaven.com/a/forrest_ground_01), CC0. | Potential ground material for close-up scenes. Current terrain uses procedural vertex colour. |

The audio, buildings, custom, icons and portraits folders are empty. The supplied book and all eleven visual references are private development material under `references/`. Git ignores this folder and the source library. The application uses original geometry and paraphrased notes. The book and reference art are absent from the production build.

To add a model, check the pack licence, copy the chosen export and every external buffer and image URI with its case and path intact, then run `npm run check:assets` and the browser tests.
