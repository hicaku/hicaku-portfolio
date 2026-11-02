import * as THREE from 'three'
import { type Tickable, glowMat, glowSprite, neonBox, neonMesh, wire } from './fx'
import { type Bridge, GROUND_Y } from './geo'

const dark = () => new THREE.MeshBasicMaterial({ color: 0x080320 })
const rad = (d: number) => (d * Math.PI) / 180

function solid(geo: THREE.BufferGeometry, color: THREE.ColorRepresentation, angle = 25): THREE.Group {
  return neonMesh(geo, color, angle)
}

// ───────────────────────────── suspension bridge ─────────────────────────────

/**
 * Bosphorus-style suspension bridge: walkable deck, two towers, swept cables and
 * hangers whose LED colours ripple along the span (like the real light show).
 */
export function suspensionBridge(b: Bridge, towerH = 30): Tickable {
  const dx = b.b[0] - b.a[0]
  const dz = b.b[1] - b.a[1]
  const L = Math.hypot(dx, dz)
  const root = new THREE.Group()
  root.position.set((b.a[0] + b.b[0]) / 2, 0, (b.a[1] + b.b[1]) / 2)
  root.rotation.y = Math.atan2(-dz, dx)

  const W = b.halfW
  const deckTop = GROUND_Y + 0.05
  const deck = neonBox(L, 0.5, W * 2, 0xdff6ff)
  deck.position.y = deckTop - 0.25
  root.add(deck)

  // pontoon-ish piers under the water-crossing part
  for (const f of [-0.3, 0.3]) {
    const pier = neonBox(5, deckTop, W * 2 + 1, 0x4a5aa8)
    pier.position.set(f * L, deckTop / 2 - 0.5, 0)
    root.add(pier)
  }

  // centre lane marking
  const lane = new THREE.Mesh(new THREE.PlaneGeometry(L, 0.14).rotateX(-Math.PI / 2), glowMat(0xffffff, 0.35))
  lane.position.y = deckTop + 0.01
  root.add(lane)

  // towers
  const tx = L * 0.27
  const top = GROUND_Y + towerH
  const legZ = W + 1.1
  const towerGlow: THREE.Sprite[] = []
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const leg = neonBox(1.3, towerH, 1.3, 0xe8f2ff)
      leg.position.set(sx * tx, GROUND_Y + towerH / 2, sz * legZ)
      root.add(leg)
    }
    for (const f of [0.52, 0.78, 1.0]) {
      const beam = neonBox(1.0, 0.9, legZ * 2 + 1.3, 0xe8f2ff)
      beam.position.set(sx * tx, GROUND_Y + towerH * f - 0.4, 0)
      root.add(beam)
    }
    const aviation = glowSprite(0xff2040, 3, 0.9)
    aviation.position.set(sx * tx, top + 1.4, 0)
    towerGlow.push(aviation)
    root.add(aviation)
  }

  // cables (per side)
  const cableMat = new THREE.LineBasicMaterial({ color: 0xcfe6ff, transparent: true, opacity: 0.85 })
  const ledPos: number[] = []
  const ledCol: number[] = []
  const ledT: number[] = []
  const midY = GROUND_Y + 5.2
  for (const sz of [-1, 1]) {
    const z = sz * legZ
    const main = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-tx, top, z),
      new THREE.Vector3(0, 2 * midY - top, z),
      new THREE.Vector3(tx, top, z),
    )
    const sideA = new THREE.LineCurve3(new THREE.Vector3(-L / 2, deckTop + 1.5, z), new THREE.Vector3(-tx, top, z))
    const sideB = new THREE.LineCurve3(new THREE.Vector3(tx, top, z), new THREE.Vector3(L / 2, deckTop + 1.5, z))
    for (const c of [main, sideA, sideB]) {
      root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(c.getPoints(48)), cableMat))
    }
    // hangers drop from the cable to the deck
    const hang = (c: THREE.Curve<THREE.Vector3>, n: number) => {
      for (let i = 1; i < n; i++) {
        const p = c.getPoint(i / n)
        ledPos.push(p.x, p.y, p.z, p.x, deckTop, p.z)
        ledT.push(p.x / L + 0.5, p.x / L + 0.5)
        ledCol.push(1, 1, 1, 1, 1, 1)
      }
    }
    hang(main, Math.round(L * 0.5 * 0.55))
    hang(sideA, 8)
    hang(sideB, 8)
  }
  const hg = new THREE.BufferGeometry()
  hg.setAttribute('position', new THREE.Float32BufferAttribute(ledPos, 3))
  hg.setAttribute('color', new THREE.Float32BufferAttribute(ledCol, 3))
  root.add(new THREE.LineSegments(hg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.95 })))

  // deck-edge LEDs (instanced)
  const n = Math.round(L / 2.2)
  const leds = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, 0.22, 0.22), new THREE.MeshBasicMaterial({ color: 0xffffff }), n * 2)
  const mm = new THREE.Matrix4()
  for (let i = 0; i < n; i++) {
    for (const sz of [-1, 1]) {
      mm.makeTranslation(-L / 2 + (i + 0.5) * (L / n), deckTop + 0.15, sz * (W - 0.05))
      leds.setMatrixAt(i * 2 + (sz > 0 ? 1 : 0), mm)
    }
  }
  root.add(leds)

  const col = new THREE.Color()
  const attr = hg.getAttribute('color') as THREE.BufferAttribute
  return {
    obj: root,
    tick: (t) => {
      for (let i = 0; i < ledT.length; i++) {
        col.setHSL((ledT[i] * 1.2 + t * 0.12) % 1, 1, 0.58)
        attr.setXYZ(i, col.r, col.g, col.b)
      }
      attr.needsUpdate = true
      for (let i = 0; i < n; i++) {
        col.setHSL(((i / n) * 1.2 + t * 0.12) % 1, 1, 0.58)
        leds.setColorAt(i * 2, col)
        leds.setColorAt(i * 2 + 1, col)
      }
      if (leds.instanceColor) leds.instanceColor.needsUpdate = true
      towerGlow.forEach((s, i) => ((s.material as THREE.SpriteMaterial).opacity = 0.35 + 0.6 * (Math.sin(t * 2.6 + i * 3) > 0 ? 1 : 0.25)))
    },
  }
}

// ───────────────────────────── Galata Bridge ─────────────────────────────

export function plainBridge(b: Bridge): Tickable {
  const dx = b.b[0] - b.a[0]
  const dz = b.b[1] - b.a[1]
  const L = Math.hypot(dx, dz)
  const root = new THREE.Group()
  root.position.set((b.a[0] + b.b[0]) / 2, 0, (b.a[1] + b.b[1]) / 2)
  root.rotation.y = Math.atan2(-dz, dx)
  const deckTop = GROUND_Y + 0.05
  const deck = neonBox(L, 0.5, b.halfW * 2, 0xffd9a0)
  deck.position.y = deckTop - 0.25
  root.add(deck)
  const lamps: THREE.Sprite[] = []
  const n = Math.max(3, Math.round(L / 5))
  for (let i = 0; i < n; i++) {
    for (const sz of [-1, 1]) {
      const x = -L / 2 + (i + 0.5) * (L / n)
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), new THREE.MeshBasicMaterial({ color: 0x3a3f6a }))
      pole.position.set(x, deckTop + 1.2, sz * (b.halfW - 0.3))
      const s = glowSprite(0xffc873, 2.4, 0.9)
      s.position.set(x, deckTop + 2.5, sz * (b.halfW - 0.3))
      lamps.push(s)
      root.add(pole, s)
    }
  }
  return { obj: root, tick: (t) => lamps.forEach((s, i) => ((s.material as THREE.SpriteMaterial).opacity = 0.8 + Math.sin(t * 3 + i) * 0.1)) }
}

// ───────────────────────────── Galata Tower ─────────────────────────────

export function galataTower(): Tickable {
  const g = new THREE.Group()
  const STONE = 0xffd48a
  const body = solid(new THREE.CylinderGeometry(3.3, 3.9, 21, 22), STONE, 10)
  body.position.y = 10.5
  g.add(body)
  const gallery = solid(new THREE.CylinderGeometry(4.5, 4.5, 1.2, 22), 0xffe9bf, 10)
  gallery.position.y = 21.6
  g.add(gallery)
  const upper = solid(new THREE.CylinderGeometry(3.1, 3.1, 5.8, 22), STONE, 10)
  upper.position.y = 25.1
  g.add(upper)
  const roof = solid(new THREE.ConeGeometry(3.9, 8.5, 22), 0x59f0ff, 10)
  roof.position.y = 32.3
  g.add(roof)
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 3, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }))
  spire.position.y = 38
  g.add(spire)

  const windows: THREE.Mesh[] = []
  for (const [y, n, r] of [[7, 6, 3.6], [14, 6, 3.4], [25, 8, 3.12]] as const) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (y === 14 ? 0.5 : 0)
      const w = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 1.15), glowMat(0xffc86b, 0.9))
      w.position.set(Math.cos(a) * r, y, Math.sin(a) * r)
      w.rotation.y = -a + Math.PI / 2
      windows.push(w)
      g.add(w)
    }
  }
  const halo = glowSprite(0xffc873, 26, 0.22)
  halo.position.y = 22
  g.add(halo)
  return { obj: g, tick: (t) => windows.forEach((w, i) => ((w.material as THREE.MeshBasicMaterial).opacity = 0.65 + Math.sin(t * 2 + i * 1.7) * 0.25)) }
}

// ───────────────────────────── Hagia Sophia + Blue Mosque ─────────────────────────────

function minaret(h: number, color: number): THREE.Group {
  const g = new THREE.Group()
  const shaft = solid(new THREE.CylinderGeometry(0.42, 0.55, h, 10), color, 10)
  shaft.position.y = h / 2
  g.add(shaft)
  const ring = solid(new THREE.CylinderGeometry(0.85, 0.85, 0.35, 10), color, 10)
  ring.position.y = h * 0.72
  g.add(ring)
  const cap = solid(new THREE.ConeGeometry(0.55, 2.6, 10), color, 10)
  cap.position.y = h + 1.3
  g.add(cap)
  return g
}

function dome(r: number, color: number, y: number): THREE.Group {
  const geo = new THREE.SphereGeometry(r, 18, 9, 0, Math.PI * 2, 0, Math.PI / 2)
  const d = new THREE.Group()
  d.add(new THREE.Mesh(geo, dark()))
  d.add(wire(geo, color, 0.8))
  d.position.y = y
  return d
}

export function sultanahmet(): Tickable {
  const g = new THREE.Group()
  // Hagia Sophia
  const HS = 0xffa469
  const base = neonBox(17, 7, 14, HS)
  base.position.y = 3.5
  g.add(base)
  const drum = solid(new THREE.CylinderGeometry(5.6, 5.8, 2.6, 20), HS, 10)
  drum.position.y = 8.3
  g.add(drum)
  g.add(dome(6.0, 0x8ff2ff, 9.6))
  for (const s of [-1, 1]) {
    const half = dome(4.3, 0x8ff2ff, 6.9)
    half.position.x = s * 8
    g.add(half)
  }
  for (const [sx, sz] of [[-10.5, -8], [10.5, -8], [-10.5, 8], [10.5, 8]]) {
    const m = minaret(18, 0xffd2b0)
    m.position.set(sx, 0, sz)
    g.add(m)
  }
  // Blue Mosque
  const BM = 0x6fe0ff
  const bmRoot = new THREE.Group()
  bmRoot.position.set(-6, 0, 22)
  bmRoot.rotation.y = rad(-14)
  const bmBase = neonBox(15, 5.6, 15, BM)
  bmBase.position.y = 2.8
  bmRoot.add(bmBase)
  bmRoot.add(dome(6.0, 0xc59bff, 5.6))
  for (const [x, z] of [[-6.2, 0], [6.2, 0], [0, -6.2], [0, 6.2]]) {
    const c = dome(3.1, 0xc59bff, 5.0)
    c.position.set(x, 5.0, z)
    bmRoot.add(c)
  }
  for (const [x, z, h] of [[-8.5, -8.5, 20], [8.5, -8.5, 20], [-8.5, 8.5, 20], [8.5, 8.5, 20], [-12, 3, 16], [12, 3, 16]] as const) {
    const m = minaret(h, 0xbfeaff)
    m.position.set(x, 0, z)
    bmRoot.add(m)
  }
  g.add(bmRoot)
  const halo = glowSprite(0xffa469, 40, 0.14)
  halo.position.y = 12
  g.add(halo)
  return { obj: g }
}

// ───────────────────────────── Maiden's Tower ─────────────────────────────

export function maidenTower(): Tickable {
  const g = new THREE.Group()
  const base = solid(new THREE.CylinderGeometry(2.0, 2.4, 2.2, 14), 0xdff6ff, 10)
  base.position.y = 1.1
  g.add(base)
  const shaft = solid(new THREE.CylinderGeometry(1.15, 1.45, 5.2, 14), 0xffffff, 10)
  shaft.position.y = 4.7
  g.add(shaft)
  const gal = solid(new THREE.CylinderGeometry(1.7, 1.7, 0.5, 14), 0xdff6ff, 10)
  gal.position.y = 7.4
  g.add(gal)
  const lantern = solid(new THREE.CylinderGeometry(1.0, 1.0, 1.2, 12), 0xfff2c8, 10)
  lantern.position.y = 8.3
  g.add(lantern)
  const cap = solid(new THREE.ConeGeometry(1.25, 1.8, 12), 0x59f0ff, 10)
  cap.position.y = 9.8
  g.add(cap)
  const beacon = glowSprite(0xfff2c8, 12, 0.7)
  beacon.position.y = 8.4
  g.add(beacon)
  return { obj: g, tick: (t) => beacon.scale.setScalar(10 + Math.sin(t * 2.4) * 2) }
}

// ───────────────────────────── Çamlıca TV tower ─────────────────────────────

export function camlicaTower(): Tickable {
  const g = new THREE.Group()
  const shaft = solid(new THREE.CylinderGeometry(0.7, 1.5, 50, 12), 0xffffff, 10)
  shaft.position.y = 25
  g.add(shaft)
  for (const [y, r, h] of [[50, 3.2, 2.2], [53.5, 2.5, 3.4], [58, 2.2, 1.4]] as const) {
    const pod = solid(new THREE.CylinderGeometry(r, r * 0.8, h, 14), 0xff6b7d, 10)
    pod.position.y = y
    g.add(pod)
  }
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.2, 20, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }))
  ant.position.y = 70
  g.add(ant)
  const beacon = glowSprite(0xff2040, 7, 0.9)
  beacon.position.y = 80.5
  g.add(beacon)
  const halo = glowSprite(0xff6b7d, 22, 0.18)
  halo.position.y = 54
  g.add(halo)
  return { obj: g, tick: (t) => ((beacon.material as THREE.SpriteMaterial).opacity = 0.25 + 0.7 * (Math.sin(t * 2.2) > 0 ? 1 : 0.2)) }
}

// ───────────────────────────── Rumeli Fortress ─────────────────────────────

export function rumeliHisari(): Tickable {
  const g = new THREE.Group()
  const STONE = 0xffd0a0
  const towers: Array<[number, number, number, number]> = [
    [-9, -6, 3.4, 12], // Halil Pasha
    [9, 4, 2.4, 9], // Saruca Pasha
    [-4, 12, 4.0, 10], // Zaganos Pasha
  ]
  for (const [x, z, r, h] of towers) {
    const t = solid(new THREE.CylinderGeometry(r, r * 1.1, h, 14), STONE, 10)
    t.position.set(x, h / 2, z)
    g.add(t)
    const c = solid(new THREE.ConeGeometry(r * 1.1, h * 0.35, 14), 0x6fe0ff, 10)
    c.position.set(x, h + h * 0.175, z)
    g.add(c)
  }
  const wall = (a: [number, number], b: [number, number]) => {
    const dx = b[0] - a[0]
    const dz = b[1] - a[1]
    const len = Math.hypot(dx, dz)
    const w = neonBox(len, 4.2, 1.1, STONE)
    w.position.set((a[0] + b[0]) / 2, 2.1, (a[1] + b[1]) / 2)
    w.rotation.y = Math.atan2(-dz, dx)
    g.add(w)
  }
  wall([-9, -6], [9, 4])
  wall([9, 4], [-4, 12])
  wall([-4, 12], [-9, -6])
  return { obj: g }
}

// ───────────────────────────── Malta ─────────────────────────────

export function valletta(): Tickable {
  const g = new THREE.Group()
  const SAND = 0xffc77a
  // Our Lady of Mount Carmel dome
  const base = neonBox(9, 7, 13, SAND)
  base.position.y = 3.5
  g.add(base)
  const drum = solid(new THREE.CylinderGeometry(3.1, 3.2, 2.4, 18), SAND, 10)
  drum.position.y = 8.2
  g.add(drum)
  g.add(dome(4.0, 0x4fffe0, 9.4))
  const lantern = solid(new THREE.CylinderGeometry(0.8, 0.8, 2.2, 10), 0xfff2c8, 10)
  lantern.position.y = 15
  g.add(lantern)
  const tip = glowSprite(0x4fffe0, 4, 0.9)
  tip.position.y = 16.4
  g.add(tip)
  // St Paul's Anglican Pro-Cathedral spire
  const tower = neonBox(3.2, 17, 3.2, SAND)
  tower.position.set(-12, 8.5, 6)
  g.add(tower)
  const spire = solid(new THREE.ConeGeometry(1.6, 9, 4), 0x4fffe0, 10)
  spire.position.set(-12, 21.5, 6)
  spire.rotation.y = Math.PI / 4
  g.add(spire)
  const halo = glowSprite(0xffc77a, 34, 0.12)
  halo.position.y = 10
  g.add(halo)
  return { obj: g }
}

export function mdinaWalls(): Tickable {
  const g = new THREE.Group()
  const R = 31
  const n = 18
  for (let i = 0; i < n; i++) {
    if (i === 0) continue // the gate
    const a = (i / n) * Math.PI * 2
    const w = neonBox(2 * R * Math.sin(Math.PI / n) + 0.4, 5, 1.3, 0xffc77a)
    w.position.set(Math.cos(a) * R, 2.5, Math.sin(a) * R)
    w.rotation.y = -a + Math.PI / 2
    g.add(w)
    if (i % 3 === 0) {
      const t = solid(new THREE.CylinderGeometry(1.5, 1.7, 7.5, 8), 0xffd9a0, 10)
      t.position.set(Math.cos(a) * R, 3.75, Math.sin(a) * R)
      g.add(t)
    }
  }
  // cathedral
  const cath = new THREE.Group()
  cath.position.set(21, 0, -12)
  const cb = neonBox(7, 6, 9, 0xffc77a)
  cb.position.y = 3
  cath.add(cb)
  cath.add(dome(3.0, 0x4fffe0, 6))
  for (const s of [-1, 1]) {
    const bt = neonBox(1.6, 11, 1.6, 0xffc77a)
    bt.position.set(s * 3.2, 5.5, 5)
    cath.add(bt)
  }
  g.add(cath)
  return { obj: g }
}

export function comino(): Tickable {
  const g = new THREE.Group()
  const lagoon = new THREE.Mesh(
    new THREE.CircleGeometry(40, 28).rotateX(-Math.PI / 2),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        varying vec2 vUv; uniform float uTime;
        void main(){
          vec2 p = vUv - 0.5; float r = length(p) * 2.0;
          float ripple = 0.5 + 0.5 * sin(r * 22.0 - uTime * 1.8 + sin(p.x * 9.0) * 1.5);
          float a = smoothstep(1.0, 0.25, r) * (0.2 + 0.18 * ripple);
          gl_FragColor = vec4(vec3(0.0, 0.95, 0.85) * a, a);
        }
      `,
    }),
  )
  lagoon.position.y = 0.2
  g.add(lagoon)
  const tower = solid(new THREE.CylinderGeometry(1.8, 2.0, 5, 8), 0xffc77a, 10)
  tower.position.set(6, GROUND_Y + 2.5, -2)
  g.add(tower)
  return { obj: g, tick: (t) => ((lagoon.material as THREE.ShaderMaterial).uniforms.uTime.value = t) }
}
