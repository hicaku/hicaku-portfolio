# hicaku — portfolio

**Live: [hicaku.dev](https://hicaku.dev)**

A gamified, neon-cyber 3D portfolio. You play a low-poly version of me running through a night-time Istanbul and then a
stylised Malta. Every stop on my career is a real place on the map, every landmark tells its own history, and my CV is
always one click away.

Available in English, Türkçe, Español, Deutsch, 日本語 and 中文.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
```

## The journey

ITU (Greek-style academy, Maslak) → Datapare (Levent) → Beşiktaş pier → **ferry** across the Bosphorus → Kadıköy →
Firmasoft (Suadiye) → Huawei (Ümraniye, a portal to China) → GoArt (virtual reality) →
Sabiha Gökçen airport → **plane** → Malta (Fast Track, side-quest arcade, skill tree, Valletta signal tower).

Also on the map: the walkable Bosphorus and Galata bridges, Galata Tower, Hagia Sophia & the Blue Mosque, the Maiden's
Tower, Çamlıca Tower, Rumeli Fortress, Dolmabahçe Palace, the Beşiktaş stadium, the Istanbul Park F1 circuit, ferries,
seagulls, a neon wall at the edge of the map, a paved route you can drive a Red Bull-style **F1 car** along (press `F`),
a story for every landmark ("Did you know?" facts and history) — and some things that aren't on the CV.

Finish the career route and a **world tour** unlocks: small islands for the places I've been to (Rome, Milan, Monza,
Amsterdam, Zandvoort, Cologne, Kraków, Porto, Oslo, Bruges, Ohrid, Lucerne), placed where they really are relative to
Malta and reached from the Map or the airports.

## Technologies

| Area | What |
| --- | --- |
| UI | Vue 3 (Composition API), TypeScript, hand-written CSS |
| Build | Vite, with the 3D engine code-split so the CV path never downloads it |
| 3D | three.js (WebGL): instanced meshes, custom GLSL shaders, bloom post-processing, CSS2D labels |
| Content | Plain TypeScript data files, rendered by both the 3D panels and the plain CV page |
| i18n | A small custom translation layer; each language loads on demand |
| Hosting | Vercel, with DNS on Cloudflare |

Everything in the world is **procedural**: the characters, landmarks, F1 car, race circuits, city blocks and even most
textures (crest, kanban board, window arches, clocks) are generated in code, so there are no 3D model files to download.

## How it works

1. **The map is data.** `zones.ts` lists every place (position, colour, order, radius) and `geo.ts` holds the coastline
   polygons. Real longitude/latitude points are projected into world units, and the world is generated from that data.
2. **Walking is polygon maths.** A point is walkable if it is inside a land polygon or a bridge strip. Hitting a wall
   slides you along it instead of stopping.
3. **Each frame** the engine reads input (keys, joystick, taps), moves the player (on foot or in the F1 car, faster on the
   paved route), finds the nearest zone, updates the camera, and renders.
4. **Only nearby regions are drawn.** Istanbul, Malta and every tour island are separate groups; anything far from the
   player is switched off, and the city is one instanced mesh per region.
5. **Quality tiers.** *Lite* is the default (no anti-aliasing or bloom, standard pixel density). `?hd` turns on the full
   look. The engine samples its own canvas shortly after start and falls back to lite, then to the plain CV, if nothing
   is being drawn.
6. **Vue and the engine talk through events**: the world reports "near Galata Tower", the UI asks it to "board the ferry".
   Progress (stops visited, hidden gems, language) is kept in `localStorage`. There is no server, database or login.
7. **The lights don't shimmer** because the building shader keeps its random seeds exact (a hashed per-building seed was
   jittering by one float bit between pixels) and has no sub-pixel detail to alias.

## Where things live

| Path | What |
| --- | --- |
| `src/data/cv.ts` | **All career content** (roles, skills, projects, hobbies, profile). |
| `src/data/lore.ts` | History and facts for landmarks, route stops and world-tour places. |
| `src/i18n/` | The translation layer (`en.ts` is the source of truth) and `lore/` for translated history. |
| `src/world/zones.ts` | Zone names, colours and real-world positions (look for `ASSUMED`), ferry route, districts. |
| `src/world/geo.ts` | Coastline polygons, bridges, walkability, regions and the world-tour layout. |
| `src/world/landmarks.ts`, `scenery.ts`, `palace.ts`, `stadium.ts` | The 3D set pieces for Istanbul and Malta. |
| `src/world/tour.ts` | The world-tour dioramas and the Istanbul Park circuit. |
| `src/world/car.ts`, `road.ts`, `borders.ts` | The F1 car, the paved route, the edge-of-map wall. |
| `src/world/character.ts` | The player (and a friend) model with run / idle / wave animation. |
| `src/world/terrain.ts` | Water + shore glow, land, instanced city blocks, glowing paths. |
| `src/world/World.ts` | Engine: renderer, input, camera, ferry ride, flights, regions, quality. |
| `src/components/` | HUD, zone panel, fast-travel menu, achievements, splash, joystick, language switch. |
| `src/store.ts` | Progress, achievements, toasts. |
| `public/Hikmet-Kufteoglu-CV.pdf` | The CV that the Full CV button opens. |

## Notes

- **CV:** the `Full CV` button opens a PDF. A public copy is used, without a phone number or reference details
  ("references available on request").
- **Controls:** WASD / arrows + Shift on desktop, click the ground to travel, `E` to inspect, `F` for the F1 car,
  mouse wheel or `+` / `−` to zoom. Touch: joystick, boost button, pinch to zoom.
- **URL flags:** `?hd` high quality, `?lang=tr|es|de|ja|zh`, `?nogov` keeps full quality while developing,
  `?top=ist` / `?top=mt` shows the map from above.
- Something is hidden in the world. 🌸
