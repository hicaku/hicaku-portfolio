// Geography. Istanbul is drawn from approximate real lon/lat (with the Bosphorus widened so it reads
// at game scale); Malta is a hand-drawn stylised island placed far to the south-west.
// World axes: +x = east, -z = north (so "up" on screen is north).

export type P = [number, number]

/** Where the Istanbul half of the map extends. The land is clipped here and the edge is drawn as a neon wall. */
export const IST_BOUNDS = { x0: -215, x1: 640, z0: -340, z1: 460 }

/** Clip a polygon to an axis-aligned rectangle (Sutherland–Hodgman). */
export function clipRect(pts: P[], b: { x0: number; x1: number; z0: number; z1: number }): P[] {
  const edges: Array<[(p: P) => boolean, (a: P, c: P) => P]> = [
    [(p) => p[0] >= b.x0, (a, c) => [b.x0, a[1] + ((c[1] - a[1]) * (b.x0 - a[0])) / (c[0] - a[0])]],
    [(p) => p[0] <= b.x1, (a, c) => [b.x1, a[1] + ((c[1] - a[1]) * (b.x1 - a[0])) / (c[0] - a[0])]],
    [(p) => p[1] >= b.z0, (a, c) => [a[0] + ((c[0] - a[0]) * (b.z0 - a[1])) / (c[1] - a[1]), b.z0]],
    [(p) => p[1] <= b.z1, (a, c) => [a[0] + ((c[0] - a[0]) * (b.z1 - a[1])) / (c[1] - a[1]), b.z1]],
  ]
  let out = pts
  for (const [inside, cross] of edges) {
    const inp = out
    out = []
    for (let i = 0; i < inp.length; i++) {
      const cur = inp[i]
      const prev = inp[(i + inp.length - 1) % inp.length]
      if (inside(cur)) {
        if (!inside(prev)) out.push(cross(prev, cur))
        out.push(cur)
      } else if (inside(prev)) out.push(cross(prev, cur))
    }
  }
  return out
}
export const K_LON = 2600 // units per degree of longitude
export const K_LAT = 3400 // units per degree of latitude
export const LON0 = 29.0
export const LAT0 = 41.03
/** The Asian shore is nudged east so the strait is wide enough to read (and to hold a bridge). */
export const ASIA_SHIFT = 0.006

export const ll = (lon: number, lat: number): P => [(lon - LON0) * K_LON, -(lat - LAT0) * K_LAT]
export const llA = (lon: number, lat: number): P => ll(lon + ASIA_SHIFT, lat)

/** Malta lives here in world space. */
export const MALTA_ORIGIN: P = [-900, 700]
export const mt = (x: number, z: number): P => [x + MALTA_ORIGIN[0], z + MALTA_ORIGIN[1]]

export type Island = 'ist' | 'mt' | 'tour'
export const islandOf = (x: number, z: number): Island => {
  for (const t of TOUR_ISLANDS) if (Math.hypot(x - t.at[0], z - t.at[1]) < t.r * 1.4) return 'tour'
  return Math.hypot(x - MALTA_ORIGIN[0], z - MALTA_ORIGIN[1]) < 520 ? 'mt' : 'ist'
}

/** Which region a world position belongs to: 'ist', 'mt' or 'tour:<id>'. Regions far from the player are switched off. */
export const regionAt = (x: number, z: number): string => {
  for (const t of TOUR_ISLANDS) if (Math.hypot(x - t.at[0], z - t.at[1]) < t.r * 1.4) return 'tour:' + t.id
  return Math.hypot(x - MALTA_ORIGIN[0], z - MALTA_ORIGIN[1]) < 520 ? 'mt' : 'ist'
}
export const regionOfLandmass = (id: string): string =>
  id.startsWith('tour-') ? 'tour:' + id.slice(5) : id === 'malta' || id === 'comino' ? 'mt' : 'ist'
/** Centre and radius of every region, for the "is it near enough to draw" test. */
export const REGION_BOUNDS = (): Array<{ id: string; x: number; z: number; r: number }> => [
  { id: 'ist', x: 212, z: 60, r: 600 },
  { id: 'mt', x: MALTA_ORIGIN[0], z: MALTA_ORIGIN[1], r: 420 },
  ...TOUR_ISLANDS.map((t) => ({ id: 'tour:' + t.id, x: t.at[0], z: t.at[1], r: t.r + 30 })),
]

// ───────────────────────────── the world tour ─────────────────────────────
// A schematic map of Europe anchored on Malta (14.4°E, 35.9°N) at its real relative positions:
// x = Malta.x + (lon − 14.4) · 70, z = Malta.z − (lat − 35.9) · 110. Italy is just north of Malta, Lucerne above it, and so on.
// Unlocked once every career stop has been visited.

export interface TourIsland {
  id: string
  name: string
  country: string
  at: P
  r: number
}

export const TOUR_ISLANDS: TourIsland[] = [
  { id: 'oslo', name: 'Oslo', country: 'Norway', at: [-1155, -1940], r: 64 },
  { id: 'zandvoort', name: 'Zandvoort', country: 'Netherlands', at: [-1690, -1120], r: 66 },
  { id: 'amsterdam', name: 'Amsterdam', country: 'Netherlands', at: [-1550, -1110], r: 60 },
  { id: 'bruges', name: 'Bruges', country: 'Belgium', at: [-1720, -960], r: 58 },
  { id: 'cologne', name: 'Cologne', country: 'Germany', at: [-1421, -946], r: 62 },
  { id: 'krakow', name: 'Kraków', country: 'Poland', at: [-515, -858], r: 64 },
  { id: 'luzern', name: 'Lucerne', country: 'Switzerland', at: [-1327, -518], r: 74 },
  { id: 'milan', name: 'Milan', country: 'Italy', at: [-1290, -350], r: 60 },
  { id: 'monza', name: 'Monza', country: 'Italy', at: [-1150, -390], r: 66 },
  { id: 'rome', name: 'Rome', country: 'Italy', at: [-1033, 40], r: 66 },
  { id: 'ohrid', name: 'Ohrid', country: 'North Macedonia', at: [-452, 128], r: 60 },
  { id: 'porto', name: 'Porto', country: 'Portugal', at: [-2510, 122], r: 62 },
]

/** A lumpy circle, so the little islands do not all look like coins. */
function blob(cx: number, cz: number, r: number, seed: number): P[] {
  const n = 30
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    const k = 1 + 0.1 * Math.sin(3 * a + seed) + 0.06 * Math.sin(5 * a + seed * 2.3) + 0.03 * Math.sin(9 * a + seed)
    return [cx + Math.cos(a) * r * k, cz + Math.sin(a) * r * k] as P
  })
}

// ───────────────────────────── polygons ─────────────────────────────

const EUROPE: P[] = [
  [28.87, 41.33], [28.9, 41.268], // the map's western edge sits here (the walkable limit), so the sea west of it is free for the world tour [29.0, 41.252], [29.06, 41.242],
  [29.1215, 41.2345], // Rumeli Feneri
  [29.118, 41.22], [29.1095, 41.209], [29.09, 41.196],
  [29.0735, 41.1795], // Rumeli Kavağı
  [29.064, 41.17],
  [29.0578, 41.162], // Sarıyer
  [29.0575, 41.148],
  [29.0555, 41.133], // Tarabya
  [29.064, 41.1235], // Yeniköy
  [29.0565, 41.113], // İstinye
  [29.052, 41.104], [29.051, 41.095],
  [29.0565, 41.0885], // Rumeli Hisarı
  [29.047, 41.08], // Bebek
  [29.043, 41.071],
  [29.042, 41.064], // Arnavutköy
  [29.038, 41.056],
  [29.0295, 41.0488], // Ortaköy
  [29.02, 41.0452],
  [29.0105, 41.0435], // Beşiktaş
  [29.003, 41.0395], // Dolmabahçe
  [28.998, 41.0335],
  [28.9915, 41.0285],
  [28.983, 41.0245], // Tophane
  // Golden Horn, north bank (mouth → head)
  [28.979, 41.0232], [28.9715, 41.0262], [28.965, 41.03], [28.956, 41.0352],
  [28.9455, 41.042], [28.937, 41.051], [28.932, 41.06], [28.93, 41.066],
  // head, then south bank back to the mouth
  [28.926, 41.063], [28.928, 41.057], [28.933, 41.048], [28.9415, 41.039],
  [28.952, 41.0322], [28.961, 41.027], [28.9675, 41.0232], [28.9745, 41.0195], [28.979, 41.0172],
  [28.9855, 41.017], // Sarayburnu
  [28.987, 41.012], [28.9855, 41.0065], [28.9815, 41.0035], // Ahırkapı
  [28.9715, 41.0], [28.95, 40.9965], [28.93, 40.993], [28.9035, 40.9895], [28.874, 40.979],
]

const ASIA: P[] = [
  [29.45, 41.15], [29.4, 41.17], [29.3, 41.185], [29.2, 41.208],
  [29.1445, 41.2263], // Anadolu Feneri
  [29.138, 41.215], [29.12, 41.2], [29.095, 41.186],
  [29.0807, 41.176], // Anadolu Kavağı
  [29.085, 41.16],
  [29.095, 41.14], // Beykoz
  [29.082, 41.118],
  [29.068, 41.105], // Kanlıca
  [29.069, 41.09], // Anadolu Hisarı
  [29.066, 41.075],
  [29.064, 41.066], // Kandilli
  [29.056, 41.056], // Çengelköy
  [29.042, 41.0455], // Beylerbeyi
  [29.03, 41.035],
  [29.0185, 41.027], // Üsküdar
  [29.013, 41.021],
  [29.0105, 41.01],
  [29.014, 41.001], // Haydarpaşa
  [29.029, 40.993], // Kadıköy
  [29.026, 40.98], // Moda
  [29.038, 40.97], // Fenerbahçe
  [29.065, 40.963], [29.09, 40.953], [29.12, 40.93], [29.2, 40.9], [29.3, 40.87], [29.45, 40.84],
]

const MALTA_LOCAL: P[] = [
  [-310, -45], [-270, -78], [-200, -88], [-130, -78], [-80, -92], [-30, -105], [15, -98], // north coast
  [30, -75], [42, -48], [58, -24], // Marsamxett harbour, west shore
  [78, -22], [92, -45], [112, -72], [140, -100], [160, -112], // Valletta, NW shore → St Elmo
  [176, -100], [166, -70], [146, -40], [128, -18], // Valletta, SE shore
  [138, 2], [160, 14], [176, 36], // Grand Harbour
  [205, 52], [235, 80], [262, 120], [270, 160], [240, 190], // east coast
  [180, 205], [110, 198], [40, 190], [-30, 198], [-110, 190], [-180, 160], [-240, 120], // south coast
  [-285, 70], [-305, 20],
]

const circlePoly = (cx: number, cz: number, r: number, n = 16): P[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    return [cx + Math.cos(a) * r, cz + Math.sin(a) * r] as P
  })

export interface Landmass {
  id: string
  pts: P[]
  walkable: boolean
}

export const MALTA: P[] = MALTA_LOCAL.map(([x, z]) => mt(x, z))
const MAIDEN_C: P = ll(29.0071, 41.0211)
const COMINO_C = mt(-372, -118)

export const landmasses: Landmass[] = [
  { id: 'europe', pts: clipRect(EUROPE.map(([lo, la]) => ll(lo, la)), IST_BOUNDS), walkable: true },
  { id: 'asia', pts: clipRect(ASIA.map(([lo, la]) => llA(lo, la)), IST_BOUNDS), walkable: true },
  { id: 'malta', pts: MALTA, walkable: true },
  { id: 'maiden', pts: circlePoly(MAIDEN_C[0], MAIDEN_C[1], 4.2, 14), walkable: false },
  { id: 'comino', pts: circlePoly(COMINO_C[0], COMINO_C[1], 26, 18), walkable: false },
  ...TOUR_ISLANDS.map((t, i) => ({ id: `tour-${t.id}`, pts: blob(t.at[0], t.at[1], t.r, i * 1.7 + 0.4), walkable: true })),
]

// ───────────────────────────── bridges ─────────────────────────────

export interface Bridge {
  id: string
  a: P
  b: P
  halfW: number
  name: string
  kind: 'suspension' | 'plain'
}

export const bridges: Bridge[] = [
  // 15 July Martyrs (Bosphorus) Bridge — Ortaköy ↔ Beylerbeyi
  { id: 'bosphorus', a: ll(29.0232, 41.0495), b: llA(29.0455, 41.0415), halfW: 7.5, name: 'Bosphorus Bridge', kind: 'suspension' },
  // Fatih Sultan Mehmet Bridge — Rumeli Hisarı ↔ Anadolu Hisarı
  { id: 'fsm', a: ll(29.0415, 41.0915), b: llA(29.0745, 41.0915), halfW: 7.5, name: 'Fatih Sultan Mehmet Bridge', kind: 'suspension' },
  // Galata Bridge — Karaköy ↔ Eminönü
  { id: 'galata', a: ll(28.9768, 41.0262), b: ll(28.9722, 41.0165), halfW: 7, name: 'Galata Bridge', kind: 'plain' },
]

const rect = (a: P, b: P, hw: number): P[] => {
  const dx = b[0] - a[0]
  const dz = b[1] - a[1]
  const len = Math.hypot(dx, dz) || 1
  const nx = (-dz / len) * hw
  const nz = (dx / len) * hw
  return [
    [a[0] + nx, a[1] + nz],
    [b[0] + nx, b[1] + nz],
    [b[0] - nx, b[1] - nz],
    [a[0] - nx, a[1] - nz],
  ]
}

// ───────────────────────────── walkability ─────────────────────────────

interface Poly {
  pts: P[]
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export const makePoly = (pts: P[]): Poly => {
  let minX = Infinity
  let maxX = -Infinity
  let minZ = Infinity
  let maxZ = -Infinity
  for (const [x, z] of pts) {
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (z < minZ) minZ = z
    if (z > maxZ) maxZ = z
  }
  return { pts, minX, maxX, minZ, maxZ }
}

export function inPoly(x: number, z: number, poly: Poly): boolean {
  if (x < poly.minX || x > poly.maxX || z < poly.minZ || z > poly.maxZ) return false
  const p = poly.pts
  let inside = false
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, zi] = p[i]
    const [xj, zj] = p[j]
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside
  }
  return inside
}

const walkPolys: Poly[] = [
  ...landmasses.filter((l) => l.walkable).map((l) => makePoly(l.pts)),
  ...bridges.map((b) => makePoly(rect(b.a, b.b, b.halfW))),
]
const bridgePolys = bridges.map((b) => ({ b, poly: makePoly(rect(b.a, b.b, b.halfW)) }))
const extraWalk: Poly[] = []

export function addWalkable(pts: P[]) {
  extraWalk.push(makePoly(pts))
}

export function isWalkable(x: number, z: number): boolean {
  for (const p of walkPolys) if (inPoly(x, z, p)) return true
  for (const p of extraWalk) if (inPoly(x, z, p)) return true
  return false
}

export function bridgeAt(x: number, z: number): Bridge | null {
  for (const { b, poly } of bridgePolys) if (inPoly(x, z, poly)) return b
  return null
}

const landPolys = landmasses.map((l) => makePoly(l.pts))
export function isLand(x: number, z: number): boolean {
  for (const p of landPolys) if (inPoly(x, z, p)) return true
  return false
}

/** Which shore a point is on (null over water / on a bridge). */
export function sideAt(x: number, z: number): 'eu' | 'as' | 'mt' | 'tr' | null {
  for (let i = 0; i < landmasses.length; i++) {
    if (!inPoly(x, z, landPolys[i])) continue
    const id = landmasses[i].id
    if (id === 'europe') return 'eu'
    if (id === 'asia') return 'as'
    if (id === 'malta') return 'mt'
    if (id.startsWith('tour-')) return 'tr'
  }
  return null
}

/** Height of the land surface (and bridge decks) above the water. */
export const GROUND_Y = 1.0


/** Shortest distance from (x,z) to any edge of the polygon. */
export function distToEdge(x: number, z: number, pts: P[]): number {
  let best = Infinity
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [ax, az] = pts[j]
    const [bx, bz] = pts[i]
    const dx = bx - ax
    const dz = bz - az
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)))
    const d = Math.hypot(x - (ax + t * dx), z - (az + t * dz))
    if (d < best) best = d
  }
  return best
}

export { rect as rectPoly, circlePoly }
