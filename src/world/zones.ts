import { LORE } from '../data/lore'
import { TOUR_ISLANDS, type Island, type P, bridges, ll, llA, mt, sideAt } from './geo'

export type ZoneKind = 'edu' | 'role' | 'gate' | 'pier' | 'arcade' | 'skills' | 'contact' | 'gem' | 'secret' | 'landmark' | 'tour'
export type Side = 'eu' | 'as' | 'mt' | 'tr'

export interface ZoneDef {
  id: string
  name: string
  tag: string
  kind: ZoneKind
  color: string
  x: number
  z: number
  island: Island
  /** European shore, Asian shore, or Malta — used to decide when you need a ferry or a plane */
  side: Side
  order: number
  roleId?: string
  /** counts toward the "explored" progress bar */
  counts: boolean
  /** hidden gems keep their label hidden until discovered */
  hidden?: boolean
  /** radius of the interaction trigger */
  radius: number
}

type Seed = Omit<ZoneDef, 'x' | 'z' | 'order' | 'counts' | 'radius' | 'island'> & {
  at: P
  island?: Island
  counts?: boolean
  radius?: number
}

// Where real-world places are uncertain they are marked ASSUMED — move them freely, nothing else depends on it.
const seeds: Seed[] = [
  { id: 'itu', name: 'Origin Academy', tag: 'ITU · 2016 – 2021', kind: 'edu', color: '#8b5cff', side: 'eu', at: ll(29.026, 41.106) }, // Ayazağa campus, Maslak
  // first stop after university: the Levent business belt (the exact office is not on the CV, so this is the district centre)
  { id: 'datapare', name: 'First Commits', tag: 'Datapare · Levent', kind: 'role', color: '#ff7a3c', roleId: 'datapare', side: 'eu', at: ll(29.0108, 41.0815) }, // ASSUMED: Levent
  { id: 'pierE', name: 'Beşiktaş Pier', tag: 'Ferry → Kadıköy', kind: 'pier', color: '#00f0ff', side: 'eu', at: ll(29.0068, 41.0428), counts: false, radius: 11 },
  { id: 'pierA', name: 'Kadıköy Pier', tag: 'Ferry → Beşiktaş', kind: 'pier', color: '#00f0ff', side: 'as', at: llA(29.0325, 40.9925), counts: false, radius: 11 },
  { id: 'firmasoft', name: 'Client Work', tag: 'Firmasoft · Suadiye', kind: 'role', color: '#b6ff3c', roleId: 'firmasoft', side: 'as', at: llA(29.0775, 40.9645) }, // a little north of the Suadiye shore so the platform fits
  { id: 'huawei', name: 'Portal to China', tag: 'Huawei · Ümraniye · Petal Maps', kind: 'role', color: '#ff3b5c', roleId: 'huawei', side: 'as', at: llA(29.1244, 41.0165) },
  { id: 'goart', name: 'Metaverse Gate', tag: 'GoArt · virtual reality', kind: 'role', color: '#ff2bd6', roleId: 'goart', side: 'as', at: llA(29.139, 40.9335) }, // ASSUMED: Maltepe, on the road to the airport
  { id: 'ist', name: 'Departures', tag: 'SAW → MLA', kind: 'gate', color: '#00f0ff', side: 'as', at: llA(29.2, 40.92), counts: false }, // Sabiha Gökçen (pulled in toward the city to keep the map compact)
  { id: 'fasttrack', name: 'Fast Track', tag: 'Malta · you are here', kind: 'role', color: '#ffb800', roleId: 'fasttrack', side: 'mt', island: 'mt', at: mt(-10, -55) }, // ASSUMED: Gżira
  { id: 'arcade', name: 'Side Quest Arcade', tag: "St Julian's · personal projects", kind: 'arcade', color: '#00f0ff', side: 'mt', island: 'mt', at: mt(-105, -45) },
  { id: 'skills', name: 'Skill Core', tag: 'Mdina · skill tree', kind: 'skills', color: '#b6ff3c', side: 'mt', island: 'mt', at: mt(-130, 50) },
  { id: 'contact', name: 'Signal Tower', tag: 'Valletta · say hello', kind: 'contact', color: '#ff2bd6', side: 'mt', island: 'mt', at: mt(140, -70) },
  { id: 'mla', name: 'Departures', tag: 'MLA → SAW', kind: 'gate', color: '#00f0ff', side: 'mt', island: 'mt', at: mt(60, 120), counts: false },
]

const gemSeeds: Seed[] = [
  { id: 'padel', name: 'Padel Court', tag: 'Hidden gem', kind: 'gem', color: '#b6ff3c', side: 'mt', island: 'mt', at: mt(30, 62), hidden: true, radius: 12 },
  { id: 'gaming', name: 'Gaming Den', tag: 'Hidden gem', kind: 'gem', color: '#ff2bd6', side: 'as', at: llA(29.0385, 40.982), hidden: true, radius: 12 }, // Moda
  { id: 'travel', name: 'Departure Quay', tag: 'Hidden gem', kind: 'gem', color: '#ffb800', side: 'eu', at: ll(28.989, 41.031), hidden: true, radius: 12 }, // Kabataş, just south-west of the palace
]

const build = (s: Seed, order: number): ZoneDef => ({
  id: s.id,
  name: s.name,
  tag: s.tag,
  kind: s.kind,
  color: s.color,
  roleId: s.roleId,
  hidden: s.hidden,
  side: s.side,
  x: s.at[0],
  z: s.at[1],
  island: s.island ?? 'ist',
  order,
  counts: s.counts ?? true,
  radius: s.radius ?? 17,
})

export const zones: ZoneDef[] = seeds.map((s, i) => build(s, i))
export const gems: ZoneDef[] = gemSeeds.map((s) => build(s, -1))

// ───────────────────────────── the world tour ─────────────────────────────

const TOUR_STYLE: Record<string, { color: string; tag: string }> = {
  rome: { color: '#ffb36b', tag: 'Italy · Colosseum' },
  milan: { color: '#ff9ad5', tag: 'Italy · Duomo' },
  monza: { color: '#ff3b3b', tag: 'Italy · F1 · Temple of Speed' },
  amsterdam: { color: '#ff8a3c', tag: 'Netherlands · canals' },
  zandvoort: { color: '#ff7a1a', tag: 'Netherlands · F1 · Dutch GP' },
  krakow: { color: '#ff5f6d', tag: 'Poland · Market Square' },
  porto: { color: '#5aa8ff', tag: 'Portugal · Dom Luís I' },
  oslo: { color: '#e8f4ff', tag: 'Norway · Opera House' },
  bruges: { color: '#ffd27a', tag: 'Belgium · Belfry' },
  cologne: { color: '#8fa8ff', tag: 'Germany · Cathedral' },
  ohrid: { color: '#4de3d1', tag: 'North Macedonia · St John at Kaneo' },
  luzern: { color: '#ff4d4d', tag: 'Switzerland · Chapel Bridge & Rigi' },
}

/** The places I have been to, unlocked once the career route is complete. Ordered west → east along the flight. */
export const tourZones: ZoneDef[] = TOUR_ISLANDS.map((t) => ({
  id: t.id,
  name: t.name,
  tag: TOUR_STYLE[t.id].tag,
  kind: 'tour' as const,
  color: TOUR_STYLE[t.id].color,
  x: t.at[0],
  z: t.at[1],
  island: 'tour' as const,
  side: 'tr' as const,
  order: -1,
  counts: false,
  radius: Math.min(26, t.r * 0.42),
}))
/** The suggested order of the tour (a loop that never doubles back over the sea for long). */
export const TOUR_ORDER = ['rome', 'milan', 'monza', 'luzern', 'cologne', 'amsterdam', 'zandvoort', 'bruges', 'oslo', 'krakow', 'ohrid', 'porto']
tourZones.sort((a, b) => TOUR_ORDER.indexOf(a.id) - TOUR_ORDER.indexOf(b.id))

// The secret: a floating gate in the Sea of Marmara, reached by a path of light from Moda.
const GATE = ll(28.995, 40.9506)
export const SECRET_ZONE: ZoneDef = {
  id: 'japan',
  name: '日本',
  tag: 'Secret level',
  kind: 'secret',
  color: '#ff3b5c',
  x: GATE[0],
  z: GATE[1],
  island: 'ist',
  side: 'as',
  order: -1,
  counts: false,
  radius: 17,
}
export const SECRET_PATH_START: P = llA(29.03, 40.9795) // just inland of Moda point

/** Hidden fragments, scattered where an explorer is likely to wander. All walkable. */
export const SHARD_POSITIONS: ReadonlyArray<{ x: number; z: number }> = [
  { x: ll(28.965, 41.108)[0], z: ll(28.965, 41.108)[1] }, // the woods west of Maslak
  { x: llA(29.1, 41.115)[0], z: llA(29.1, 41.115)[1] }, // Asian hills above Beykoz
  { x: mt(-185, 100)[0], z: mt(-185, 100)[1] }, // south-west Malta
]

export const SPAWN = { x: ll(29.026, 41.106)[0] + 1, z: ll(29.026, 41.106)[1] + 26 }

// ───────────────────────────── the ferry ─────────────────────────────

/** Where the ferry ties up on each shore, and the water route between them. */
export const DOCK_E: P = ll(29.0165, 41.0425)
export const DOCK_A: P = llA(29.0235, 40.993)
export const FERRY_PATH: P[] = [DOCK_E, [50, -5], [35, 40], [35, 85], [58, 112], DOCK_A]

// ───────────────────────────── scenery (landmarks that aren't zones) ─────────────────────────────

export interface Scenic {
  id: string
  name: string
  x: number
  z: number
  /** keep houses away from it */
  clear: number
  island: Island
  /** show a small name tag */
  tag: boolean
}

const mid = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
const bosphorus = bridges.find((b) => b.id === 'bosphorus')!
const fsm = bridges.find((b) => b.id === 'fsm')!
const galataBridge = bridges.find((b) => b.id === 'galata')!

const sc = (id: string, name: string, at: P, clear: number, island: Island = 'ist', tag = true): Scenic => ({
  id,
  name,
  x: at[0],
  z: at[1],
  clear,
  island,
  tag,
})

export const scenics: Scenic[] = [
  sc('galata', 'Galata Tower', ll(28.9745, 41.0275), 12),
  sc('bosphorus', 'Bosphorus Bridge', mid(bosphorus.a, bosphorus.b), 8),
  sc('fsm', 'FSM Bridge', mid(fsm.a, fsm.b), 8),
  sc('galataBridge', 'Galata Bridge', mid(galataBridge.a, galataBridge.b), 4, 'ist', false),
  sc('maiden', "Maiden's Tower", ll(29.0071, 41.0211), 6),
  sc('sultanahmet', 'Hagia Sophia', ll(28.9775, 41.0085), 22),
  sc('camlica', 'Çamlıca Tower', llA(29.0725, 41.0275), 12),
  sc('rumeli', 'Rumeli Hisarı', ll(29.0505, 41.0865), 12),
  sc('stadium', 'Beşiktaş Stadium', ll(28.986, 41.0465), 16), // Tüpraş Stadyumu, up the hill behind the palace
  sc('dolmabahce', 'Dolmabahçe Palace', ll(28.9948, 41.0385), 19), // on the shore, facade toward the Bosphorus
  sc('istpark', 'Istanbul Park', llA(29.18, 41.092), 52), // the F1 circuit, brought in from Tuzla so the Asian side stays compact
  sc('valletta', 'Valletta', mt(108, -48), 24, 'mt'),
  sc('mdina', 'Mdina', mt(-130, 50), 36, 'mt', false),
  sc('comino', 'Blue Lagoon', mt(-372, -118), 2, 'mt'),
]

/** Landmarks you can stop at and read about. (Mdina is the Skill Core's zone, so it is not repeated here.) */
const LANDMARK_RADIUS: Record<string, number> = { maiden: 56, comino: 100, galataBridge: 9, bosphorus: 12, fsm: 12, dolmabahce: 20 }
export const landmarkZones: ZoneDef[] = scenics
  .filter((s) => LORE[s.id] && s.id !== 'mdina')
  .map((s) => ({
    id: s.id,
    name: s.name,
    tag: 'Landmark · history',
    kind: 'landmark' as const,
    color: '#9fd6ff',
    x: s.x,
    z: s.z,
    island: s.island,
    side: (s.island === 'mt' ? 'mt' : (sideAt(s.x, s.z) ?? 'eu')) as Side,
    order: -1,
    counts: false,
    radius: LANDMARK_RADIUS[s.id] ?? Math.max(14, s.clear + 3),
  }))

/** Landmarks you cannot stand next to (an islet, a lagoon off the coast): readable on site from the shore only. */
export const NO_WARP = new Set(['maiden', 'comino'])

export const allZones = (): ZoneDef[] =>[...zones, ...gems, ...landmarkZones, ...tourZones, SECRET_ZONE]
export const zoneById = (id: string): ZoneDef | undefined => allZones().find((z) => z.id === id)

// ───────────────────────────── districts (for the location chip) ─────────────────────────────

export interface District {
  name: string
  x: number
  z: number
  island: Island
}
const d = (name: string, at: P, island: Island = 'ist'): District => ({ name, x: at[0], z: at[1], island })
export const districts: District[] = [
  d('Maslak', ll(29.02, 41.108)),
  d('Levent', ll(29.0108, 41.0815)),
  d('Sarıyer', ll(29.045, 41.16)),
  d('Şişli', ll(28.99, 41.06)),
  d('Beşiktaş', ll(29.0, 41.043)),
  d('Ortaköy', ll(29.02, 41.052)),
  d('Bebek', ll(29.035, 41.077)),
  d('Beyoğlu', ll(28.98, 41.034)),
  d('Galata', ll(28.9745, 41.0275)),
  d('Eminönü', ll(28.9722, 41.0165)),
  d('Sultanahmet', ll(28.9775, 41.0085)),
  d('Fatih', ll(28.945, 41.015)),
  d('Eyüp', ll(28.935, 41.055)),
  d('Üsküdar', llA(29.02, 41.025)),
  d('Çamlıca', llA(29.07, 41.027)),
  d('Acıbadem', llA(29.05, 41.012)),
  d('Kadıköy', llA(29.035, 40.99)),
  d('Moda', llA(29.025, 40.98)),
  d('Göztepe', llA(29.06, 40.97)),
  d('Suadiye', llA(29.0794, 40.96)),
  d('Ümraniye', llA(29.1244, 41.0165)),
  d('Ataşehir', llA(29.12, 40.99)),
  d('Maltepe', llA(29.139, 40.9335)),
  d('Kartal', llA(29.19, 40.905)),
  d('Sabiha Gökçen', llA(29.3, 40.9)),
  d('Beykoz', llA(29.1, 41.13)),
  d('Belgrad Forest', ll(28.965, 41.108)),
  d('Gżira', mt(-10, -55), 'mt'),
  d("St Julian's", mt(-105, -45), 'mt'),
  d('Valletta', mt(110, -55), 'mt'),
  d('Mdina', mt(-130, 50), 'mt'),
  d('Marsa', mt(30, 62), 'mt'),
  d('Luqa', mt(60, 120), 'mt'),
]

// ───────────────────────────── the neon route ─────────────────────────────

const zp = (id: string): P => {
  const z = zones.find((q) => q.id === id)!
  return [z.x, z.z]
}

/** European leg: ITU → Datapare in Levent → the Beşiktaş pier. */
export const ROUTE_EU: P[] = [[SPAWN.x, SPAWN.z], zp('itu'), zp('datapare'), zp('pierE')]
/** Asian leg: the Kadıköy pier → Suadiye → Ümraniye → Maltepe → Sabiha Gökçen. */
export const ROUTE_AS: P[] = [zp('pierA'), zp('firmasoft'), zp('huawei'), zp('goart'), zp('ist')]
/** …and Malta, where the story ends. */
export const ROUTE_MT: P[] = [zp('mla'), zp('fasttrack'), zp('arcade'), zp('skills'), mt(40, 10), mt(100, -20), zp('contact')]

// keep the bridge crossing points reachable for other modules
/** Roads that lead off the bridge, so nobody is left in the dark after crossing: Asian end → Client Work, European end → First Commits. */
export const ROUTE_LINKS: P[][] = [] // no road to the bridge: the ferry is the way (the bridge is an on-foot shortcut)

/** Where the neon road passes the Bosphorus Bridge: the "ferry or bridge?" signpost stands here. */
export const FORK: P = (() => {
  const [ax, az] = zp('datapare')
  const [bx, bz] = zp('pierE')
  const [px, pz] = bosphorus.a
  const dx = bx - ax
  const dz = bz - az
  const k = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)))
  return [ax + dx * k, az + dz * k]
})()

export const BOSPHORUS_BRIDGE = { a: bosphorus.a, b: bosphorus.b }
