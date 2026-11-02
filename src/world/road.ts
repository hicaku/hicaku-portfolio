import * as THREE from 'three'
import { GROUND_Y, type P } from './geo'

/** Flat strip along a polyline. u runs across the strip (0..1), v runs along it in `vUnit`-sized steps. */
export function ribbonGeometry(pts: THREE.Vector3[], width: number, vUnit = 12, closed = false, bank?: number[]): THREE.BufferGeometry {
  const n = pts.length
  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  let dist = 0
  for (let i = 0; i < n; i++) {
    const prev = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)]
    const next = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)]
    const tx = next.x - prev.x
    const tz = next.z - prev.z
    const len = Math.hypot(tx, tz) || 1
    const nx = -tz / len
    const nz = tx / len
    if (i > 0) dist += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z)
    const p = pts[i]
    const lift = bank ? Math.sin(bank[i] ?? 0) * (width / 2) : 0 // banked corners: one edge up, the other down
    pos.push(p.x + nx * (width / 2), p.y + lift, p.z + nz * (width / 2), p.x - nx * (width / 2), p.y - lift, p.z - nz * (width / 2))
    uv.push(0, dist / vUnit, 1, dist / vUnit)
    if (i < n - 1) {
      const a = i * 2
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3) // counter-clockwise seen from above, so the strip faces up
    }
  }
  if (closed) {
    const a = (n - 1) * 2
    idx.push(a, 0, a + 1, a + 1, 0, 1)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  return g
}

let _asphalt: THREE.CanvasTexture | null = null
/** Dark tarmac with neon edge lines and a dashed centre line. One tile = one dash period along the road. */
export function asphaltTexture(): THREE.CanvasTexture {
  if (_asphalt) return _asphalt
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 128
  const g = c.getContext('2d')!
  g.fillStyle = '#0d0b1e'
  g.fillRect(0, 0, 64, 128)
  g.fillStyle = 'rgba(255,255,255,0.03)'
  for (let i = 0; i < 80; i++) g.fillRect(Math.random() * 64, Math.random() * 128, 2, 2)
  g.fillStyle = '#19e6ff' // neon edge lines
  g.fillRect(2, 0, 3, 128)
  g.fillRect(59, 0, 3, 128)
  g.fillStyle = '#ffd27a' // dashed centre
  g.fillRect(30, 8, 4, 48)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = THREE.ClampToEdgeWrapping
  t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 4
  t.colorSpace = THREE.SRGBColorSpace
  _asphalt = t
  return t
}

export interface RoadNet {
  obj: THREE.Group
  /** is this ground position on the paved road? */
  on(x: number, z: number): boolean
}

/** Smooth a rough list of waypoints into a dense, evenly spaced polyline. */
export function smoothPath(pts: P[], step = 3): THREE.Vector3[] {
  const v = pts.map(([x, z]) => new THREE.Vector3(x, 0, z))
  if (v.length < 3) return densify(v, step)
  const curve = new THREE.CatmullRomCurve3(v, false, 'centripetal', 0.35)
  const len = curve.getLength()
  return curve.getSpacedPoints(Math.max(8, Math.ceil(len / step)))
}

function densify(v: THREE.Vector3[], step: number): THREE.Vector3[] {
  const out: THREE.Vector3[] = []
  for (let i = 0; i < v.length - 1; i++) {
    const d = v[i].distanceTo(v[i + 1])
    const n = Math.max(1, Math.ceil(d / step))
    for (let k = 0; k < n; k++) out.push(v[i].clone().lerp(v[i + 1], k / n))
  }
  out.push(v[v.length - 1].clone())
  return out
}

/** Paved roads along the given routes. */
export function buildRoads(routes: P[][], width = 6.2): RoadNet {
  const group = new THREE.Group()
  const segs: Array<[number, number, number, number]> = []
  const mat = new THREE.MeshBasicMaterial({
    map: asphaltTexture(),
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  })
  const kerbMat = new THREE.MeshBasicMaterial({ color: 0x19e6ff, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending })
  for (const r of routes) {
    const line = smoothPath(r, 3)
    line.forEach((p) => (p.y = GROUND_Y + 0.05))
    const road = new THREE.Mesh(ribbonGeometry(line, width, 16), mat)
    road.renderOrder = 1
    group.add(road)
    const glow = new THREE.Mesh(ribbonGeometry(line.map((p) => p.clone().setY(GROUND_Y + 0.04)), width + 3.2, 16), kerbMat)
    group.add(glow)
    for (let i = 0; i < line.length - 1; i++) segs.push([line[i].x, line[i].z, line[i + 1].x, line[i + 1].z])
  }
  const half = width / 2 + 0.6
  return {
    obj: group,
    on(x, z) {
      for (const [ax, az, bx, bz] of segs) {
        const dx = bx - ax
        const dz = bz - az
        const l2 = dx * dx + dz * dz || 1
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2))
        const ex = x - (ax + dx * t)
        const ez = z - (az + dz * t)
        if (ex * ex + ez * ez < half * half) return true
      }
      return false
    },
  }
}
