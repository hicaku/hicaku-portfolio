import * as THREE from 'three'
import { skills } from '../data/cv'
import {
  type Tickable,
  edges,
  glowMat,
  glowSprite,
  glowTexture,
  mulberry32,
  neonBox,
  neonMesh,
  textSprite,
  wire,
} from './fx'
import type { P } from './geo'
import { DOCK_A, DOCK_E, zoneById } from './zones'

const rad = (d: number) => (d * Math.PI) / 180
const dark = () => new THREE.MeshBasicMaterial({ color: 0x080320 })

// ─────────────────────────── ITU: an ancient Greek academy ───────────────────────────
function column(h: number, color: string): THREE.Group {
  const g = new THREE.Group()
  const base = neonBox(1.9, 0.35, 1.9, color)
  base.position.y = 0.18
  g.add(base)
  const shaft = neonMesh(new THREE.CylinderGeometry(0.62, 0.74, h, 14), color, 8) // 14 flutes
  shaft.position.y = 0.35 + h / 2
  g.add(shaft)
  const echinus = neonMesh(new THREE.CylinderGeometry(0.95, 0.66, 0.4, 14), color, 8)
  echinus.position.y = 0.35 + h + 0.2
  g.add(echinus)
  const abacus = neonBox(2.0, 0.34, 2.0, color)
  abacus.position.y = 0.35 + h + 0.57
  g.add(abacus)
  return g
}

function itu(color: string): Tickable {
  const g = new THREE.Group()
  const STONE = '#dcd0ff'
  const GOLD = '#ffd27a'

  // the temple faces the camera (+z): three-step stylobate, peristyle, entablature, pediment
  const temple = new THREE.Group()
  temple.position.z = -2
  const steps = [
    [26, 13.6],
    [24.6, 12.4],
    [23.2, 11.2],
  ]
  steps.forEach(([w, d], i) => {
    const s = neonBox(w, 0.5, d, STONE)
    s.position.y = 0.25 + i * 0.5
    temple.add(s)
  })
  const Y0 = 1.5
  const H = 8.2
  // cella (the inner room) behind the columns
  const cella = neonBox(15, H + 0.4, 7, color)
  cella.position.y = Y0 + (H + 0.4) / 2
  temple.add(cella)
  // doorway glowing from within
  const door = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 5.4), glowMat(0xc9b3ff, 0.18))
  door.position.set(0, Y0 + 2.7, 3.52)
  temple.add(door)

  // columns: 8 across the front and back, 4 down each side
  const xs = Array.from({ length: 8 }, (_, i) => -10.5 + i * 3)
  const ZF = 4.8
  const cols: Array<[number, number]> = []
  xs.forEach((x) => {
    cols.push([x, ZF], [x, -ZF])
  })
  for (const z of [-1.6, 1.6]) cols.push([-10.5, z], [10.5, z])
  cols.forEach(([x, z]) => {
    const c = column(H - 0.9, STONE)
    c.position.set(x, Y0, z)
    temple.add(c)
  })

  // entablature (architrave + frieze) and a gilded cornice
  const architrave = neonBox(24.4, 1.0, 11.4, STONE)
  architrave.position.y = Y0 + H + 0.5
  temple.add(architrave)
  const frieze = neonBox(24.6, 1.1, 11.6, color)
  frieze.position.y = Y0 + H + 1.55
  temple.add(frieze)
  const cornice = neonBox(25.4, 0.4, 12.4, GOLD)
  cornice.position.y = Y0 + H + 2.3
  temple.add(cornice)

  // triangular pediments front and back, plus a low gable roof between them
  const ped = new THREE.Shape()
  ped.moveTo(-12.4, 0)
  ped.lineTo(12.4, 0)
  ped.lineTo(0, 4.2)
  ped.closePath()
  for (const sz of [-1, 1]) {
    const geo = new THREE.ExtrudeGeometry(ped, { depth: 0.8, bevelEnabled: false })
    const p = neonMesh(geo, STONE, 20)
    p.position.set(0, Y0 + H + 2.5, sz > 0 ? 5.4 : -6.2)
    temple.add(p)
    // glowing tympanum
    const t = new THREE.Mesh(new THREE.ShapeGeometry(ped), glowMat(0x8b5cff, 0.08))
    t.scale.set(0.8, 0.72, 1)
    t.position.set(0, Y0 + H + 2.7, sz > 0 ? 6.26 : -6.26)
    if (sz < 0) t.rotation.y = Math.PI
    temple.add(t)
  }
  const slope = Math.atan2(4.2, 12.4)
  for (const s of [-1, 1]) {
    const roof = neonBox(13.4, 0.35, 12.2, GOLD)
    roof.position.set(s * 6.1, Y0 + H + 2.5 + 2.1, -0.4)
    roof.rotation.z = -s * slope
    temple.add(roof)
  }
  // acroteria: a gilded finial on the apex and each corner
  for (const [x, y] of [[0, 4.4], [-12.2, 0.2], [12.2, 0.2]] as const) {
    const a = neonMesh(new THREE.ConeGeometry(0.55, 1.5, 6), GOLD, 20)
    a.position.set(x, Y0 + H + 2.5 + y + 0.75, 5.8)
    temple.add(a)
  }
  g.add(temple)

  // braziers flanking the steps
  const flames: THREE.Sprite[] = []
  for (const x of [-9, 9]) {
    const bowl = neonMesh(new THREE.CylinderGeometry(0.9, 0.5, 0.8, 8), GOLD, 20)
    bowl.position.set(x, 2.1, 8.6)
    const post = neonBox(0.35, 1.8, 0.35, GOLD)
    post.position.set(x, 0.9, 8.6)
    const flame = glowSprite(0xffb347, 2.0, 0.45)
    flame.position.set(x, 3.2, 8.6)
    flames.push(flame)
    g.add(bowl, post, flame)
  }

  // the five Platonic solids, one on each pedestal in the forecourt
  const solids: THREE.Group[] = []
  const geos = [
    new THREE.TetrahedronGeometry(1.2),
    new THREE.BoxGeometry(1.6, 1.6, 1.6),
    new THREE.OctahedronGeometry(1.2),
    new THREE.DodecahedronGeometry(1.2),
    new THREE.IcosahedronGeometry(1.2),
  ]
  geos.forEach((geo, i) => {
    const x = -8 + i * 4
    const p = neonBox(1.5, 1.1, 1.5, STONE)
    p.position.set(x, 0.55, 11.2)
    g.add(p)
    const s = new THREE.Group()
    s.add(new THREE.Mesh(geo, dark()))
    s.add(wire(geo, i % 2 ? '#00f0ff' : '#c9b3ff', 0.95))
    s.position.set(x, 3.0, 11.2)
    solids.push(s)
    g.add(s)
  })

  // the mathematician's hologram hovering above the roof
  const knotGeo = new THREE.TorusKnotGeometry(2.4, 0.55, 96, 12, 2, 3)
  const knot = new THREE.Group()
  knot.add(new THREE.Mesh(knotGeo, dark()))
  knot.add(wire(knotGeo, color, 0.8))
  knot.position.y = 21
  g.add(knot)
  const glyphs = ['Σ', '∫', 'π', '∞', '∇', 'λ']
  const orbit = new THREE.Group()
  orbit.position.y = 21
  glyphs.forEach((s, i) => {
    const sp = textSprite(s, i % 2 ? '#00f0ff' : '#c9b3ff', 3.2)
    const a = (i / glyphs.length) * Math.PI * 2
    sp.position.set(Math.cos(a) * 8, Math.sin(a * 2) * 1.6, Math.sin(a) * 8)
    orbit.add(sp)
  })
  g.add(orbit)

  return {
    obj: g,
    tick: (t) => {
      knot.rotation.set(t * 0.4, t * 0.6, 0)
      knot.position.y = 21 + Math.sin(t * 1.2) * 0.5
      orbit.rotation.y = -t * 0.3
      solids.forEach((s, i) => {
        s.rotation.set(t * 0.5 + i, t * 0.7 + i * 0.5, 0)
        s.position.y = 3.0 + Math.sin(t * 1.5 + i) * 0.3
      })
      flames.forEach((f, i) => f.scale.setScalar(3.2 + Math.sin(t * 9 + i * 2) * 0.5))
    },
  }
}

// ─────────────────────────── ferry pier ───────────────────────────
function pier(id: string, color: string): Tickable {
  const z = zoneById(id)!
  const dock = id === 'pierE' ? DOCK_E : DOCK_A
  const dx = dock[0] - z.x
  const dz = dock[1] - z.z
  const len = Math.hypot(dx, dz)
  const g = new THREE.Group()
  const arm = new THREE.Group()
  arm.rotation.y = Math.atan2(-dz, dx)
  g.add(arm)
  const L = len - 4
  const planks = neonBox(L, 0.3, 5.2, '#ffd9a0')
  planks.position.set(L / 2, -0.14, 0)
  arm.add(planks)
  const lamps: THREE.Sprite[] = []
  const n = Math.max(2, Math.floor(L / 6))
  for (let i = 0; i < n; i++) {
    for (const s of [-1, 1]) {
      const x = 2 + (i + 0.5) * ((L - 2) / n)
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.2, 6), new THREE.MeshBasicMaterial({ color: 0x3a3f6a }))
      pole.position.set(x, 1.1, s * 2.4)
      const l = glowSprite(0xffc873, 2.2, 0.9)
      l.position.set(x, 2.3, s * 2.4)
      lamps.push(l)
      arm.add(pole, l)
    }
  }
  for (const s of [-1, 1]) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.7, 8), new THREE.MeshBasicMaterial({ color: color }))
    b.position.set(L - 0.6, 0.35, s * 2.2)
    arm.add(b)
  }
  const kiosk = neonBox(3, 2.6, 2.4, color)
  kiosk.position.set(1.5, 1.3, 4.6)
  arm.add(kiosk)
  const win = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.9), glowMat(0xffd27a, 0.9))
  win.position.set(1.5, 1.7, 3.42)
  arm.add(win)
  // bobbing "board here" marker at the end of the pier
  const marker = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.8, 4), glowMat(color, 1))
  marker.rotation.x = Math.PI
  marker.position.set(L - 2, 5, 0)
  arm.add(marker)
  return {
    obj: g,
    tick: (t) => {
      marker.position.y = 5 + Math.sin(t * 2.4) * 0.5
      marker.rotation.y = t * 1.6
      lamps.forEach((l, i) => ((l.material as THREE.SpriteMaterial).opacity = 0.8 + Math.sin(t * 3 + i) * 0.12))
    },
  }
}

// ─────────────────────────── Firmasoft & Datapare: floating browser windows ───────────────────────────
function windowTexture(color: string, seed: number): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 160
  const g = c.getContext('2d')!
  const rand = mulberry32(seed)
  g.fillStyle = '#0a0524'
  g.fillRect(0, 0, 256, 160)
  g.fillStyle = color
  g.globalAlpha = 0.85
  g.fillRect(0, 0, 256, 18)
  g.globalAlpha = 1
  ;['#ff5f6d', '#ffc371', '#7dffb2'].forEach((cc, i) => {
    g.fillStyle = cc
    g.beginPath()
    g.arc(12 + i * 14, 9, 4, 0, Math.PI * 2)
    g.fill()
  })
  g.fillStyle = color
  for (let i = 0; i < 7; i++) {
    g.globalAlpha = 0.25 + rand() * 0.5
    g.fillRect(14, 30 + i * 17, 40 + rand() * 170, 6)
  }
  g.globalAlpha = 0.35
  g.fillRect(190, 100, 52, 40)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function firmasoft(color: string): Tickable {
  const g = new THREE.Group()
  const ring = new THREE.Group()
  ring.position.y = 8
  const wins: THREE.Group[] = []
  const n = 6
  for (let i = 0; i < n; i++) {
    const w = new THREE.Group()
    w.add(
      new THREE.Mesh(
        new THREE.PlaneGeometry(6.4, 4),
        new THREE.MeshBasicMaterial({ map: windowTexture(color, i + 3), transparent: true, opacity: 0.92, side: THREE.DoubleSide }),
      ),
    )
    w.add(edges(new THREE.BoxGeometry(6.4, 4, 0.02), color, 1))
    const a = (i / n) * Math.PI * 2
    w.position.set(Math.cos(a) * 9, (i % 3) * 2.6 - 2.6, Math.sin(a) * 9)
    w.rotation.y = -a + Math.PI / 2
    w.userData.base = w.position.y
    ring.add(w)
    wins.push(w)
  }
  g.add(ring)
  const cursor = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.8, 3), glowMat(color, 0.95))
  cursor.position.y = 8
  cursor.rotation.z = rad(25)
  g.add(cursor)
  // the office block they sat in
  const office = neonBox(9, 11, 7, color)
  office.position.set(-17, 5.5, -3)
  g.add(office)
  const ped = neonBox(4, 1, 4, color)
  ped.position.y = 0.5
  g.add(ped)
  return {
    obj: g,
    tick: (t) => {
      ring.rotation.y = t * 0.18
      wins.forEach((w, i) => (w.position.y = (w.userData.base as number) + Math.sin(t * 1.2 + i) * 0.5))
      cursor.position.y = 8 + Math.sin(t * 2) * 0.6
      cursor.rotation.y = t * 1.5
    },
  }
}

// ─────────────────────────── Datapare: an agile start-up in Levent ───────────────────────────
function kanbanTexture(color: string): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 384
  c.height = 224
  const g = c.getContext('2d')!
  const rand = mulberry32(21)
  g.fillStyle = '#0a0524'
  g.fillRect(0, 0, 384, 224)
  const cols = [
    ['TO DO', 4, '#ff7a3c'],
    ['DOING', 3, color],
    ['DONE', 5, '#7dffb2'],
  ] as const
  cols.forEach(([title, n, col], i) => {
    const x = 10 + i * 124
    g.fillStyle = col
    g.globalAlpha = 0.9
    g.font = '700 16px "Chakra Petch", system-ui, sans-serif'
    g.fillText(title, x + 4, 24)
    g.globalAlpha = 0.25
    g.fillRect(x, 32, 112, 2)
    for (let k = 0; k < n; k++) {
      g.globalAlpha = 0.85
      g.fillStyle = col
      g.fillRect(x, 44 + k * 34, 112, 26)
      g.globalAlpha = 0.9
      g.fillStyle = '#0a0524'
      g.fillRect(x + 8, 52 + k * 34, 30 + rand() * 60, 5)
      g.fillRect(x + 8, 62 + k * 34, 20 + rand() * 40, 4)
    }
  })
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function datapare(color: string): Tickable {
  const g = new THREE.Group()
  // a cluster of Levent-style towers behind the board
  const towers: Array<[number, number, number, number, number]> = [
    [-14, -8, 5.2, 26, 5.2],
    [-7, -12, 5.6, 36, 5.6],
    [14, -9, 5, 22, 5],
    [8, -13, 4.6, 30, 4.6],
  ]
  towers.forEach(([x, z, w, h, d], i) => {
    const b = neonBox(w, h, d, i % 2 ? '#8be9ff' : color)
    b.position.set(x, h / 2, z)
    g.add(b)
    const cap = glowSprite(i % 2 ? 0x8be9ff : color, 3.2, 0.9)
    cap.position.set(x, h + 0.8, z)
    g.add(cap)
  })
  // floors of lit windows on the tallest tower
  const lit = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 30), glowMat(color, 0.1))
  lit.position.set(-7, 18, -9.1)
  g.add(lit)

  // the sprint board
  const board = new THREE.Group()
  board.position.y = 8
  board.add(
    new THREE.Mesh(new THREE.PlaneGeometry(13, 7.6), new THREE.MeshBasicMaterial({ map: kanbanTexture(color), side: THREE.DoubleSide, transparent: true, opacity: 0.95 })),
    edges(new THREE.BoxGeometry(13, 7.6, 0.05), color, 1),
  )
  g.add(board)
  const sticky: THREE.Mesh[] = []
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.08), glowMat(['#ff7a3c', '#ffd27a', '#7dffb2'][i], 0.9))
    s.position.set(-5 + i * 5, 4.8, 0.8)
    s.userData.base = s.position.y
    board.add(s)
    sticky.push(s)
  }
  const ped = neonBox(5, 1, 5, color)
  ped.position.y = 0.5
  g.add(ped)
  return {
    obj: g,
    tick: (t) => {
      board.position.y = 8 + Math.sin(t * 1.2) * 0.4
      board.rotation.y = Math.sin(t * 0.35) * 0.35
      sticky.forEach((s, i) => {
        s.position.y = (s.userData.base as number) + Math.sin(t * 2 + i * 2) * 0.35
        s.rotation.z = Math.sin(t * 1.5 + i) * 0.25
      })
    },
  }
}

// ─────────────────────────── Huawei: the portal to China ───────────────────────────
function pagoda(color: number): THREE.Group {
  const g = new THREE.Group()
  for (let i = 0; i < 5; i++) {
    const w = 6.4 - i * 1.0
    const body = neonBox(w * 0.7, 1.5, w * 0.7, color)
    body.position.y = i * 2.3 + 0.75
    g.add(body)
    const roof = neonMesh(new THREE.ConeGeometry(w * 0.82, 0.9, 4), color, 10)
    roof.rotation.y = Math.PI / 4
    roof.position.y = i * 2.3 + 1.95
    g.add(roof)
  }
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 3, 6), glowMat(0xffd27a, 1))
  spire.position.y = 14
  g.add(spire)
  return g
}

function huawei(color: string): Tickable {
  const g = new THREE.Group()
  const RED = 0xff3b3b
  const GOLD = 0xffcf5a
  // paifang-style gate
  const gate = new THREE.Group()
  for (const x of [-6.2, 6.2]) {
    const p = neonMesh(new THREE.CylinderGeometry(0.7, 0.8, 15, 12), RED, 30)
    p.position.set(x, 7.5, 0)
    gate.add(p)
    const base = neonBox(2, 1, 2, GOLD)
    base.position.set(x, 0.5, 0)
    gate.add(base)
  }
  for (const [y, w, c] of [[14.6, 18.4, GOLD], [12.2, 15, RED], [10.6, 13, GOLD]] as const) {
    const b = neonBox(w, 0.9, 1.6, c)
    b.position.y = y
    gate.add(b)
  }
  // a paifang's stacked, upturned-eave roofs (a different silhouette from the torii used for the secret)
  const eave = (w: number, y: number, c: number) => {
    const slab = neonBox(w, 0.6, 4.4 - (w < 14 ? 0.9 : 0), c)
    slab.position.y = y
    gate.add(slab)
    for (const s of [-1, 1]) {
      const tip = neonBox(2.6, 0.4, 4.2 - (w < 14 ? 0.9 : 0), c)
      tip.position.set(s * (w / 2 + 1.0), y + 0.55, 0)
      tip.rotation.z = s * rad(20)
      gate.add(tip)
    }
  }
  eave(20, 15.4, RED)
  eave(13, 16.9, GOLD)
  eave(7, 18.4, RED)
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), glowMat(GOLD, 1))
  finial.position.set(0, 19.7, 0)
  gate.add(finial)
  const plaqueGate = neonBox(5.4, 1.5, 0.5, RED)
  plaqueGate.position.set(0, 12.4, 0.2)
  gate.add(plaqueGate)
  // the portal itself
  const swirl = new THREE.Mesh(
    new THREE.CircleGeometry(5.6, 56),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv; uniform float uTime;
        void main(){
          vec2 p = vUv - 0.5; float r = length(p) * 2.0; float a = atan(p.y, p.x);
          float s = sin(a * 4.0 - r * 12.0 + uTime * 3.2) * 0.5 + 0.5;
          float alpha = smoothstep(1.0, 0.78, r) * (0.22 + 0.6 * s * (1.0 - r * 0.6));
          vec3 c = mix(vec3(1.0, 0.18, 0.2), vec3(1.0, 0.82, 0.3), s);
          gl_FragColor = vec4(c * 1.3, alpha);
        }
      `,
    }),
  )
  swirl.position.y = 6.2
  gate.add(swirl)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(5.7, 0.3, 10, 60), glowMat(GOLD, 0.95))
  ring.position.y = 6.2
  gate.add(ring)
  g.add(gate)

  // lanterns
  const lanterns: THREE.Sprite[] = []
  for (let i = 0; i < 6; i++) {
    const s = glowSprite(0xff3b3b, 2.2, 0.95)
    const x = -7.6 + i * 3.04
    s.position.set(x, 9.4 + (i % 2) * 0.6, 0.6)
    lanterns.push(s)
    gate.add(s)
  }

  // a pagoda from the other side of the portal
  const pg = pagoda(GOLD)
  pg.position.set(0, 0, -14)
  pg.scale.setScalar(1.2)
  g.add(pg)

  const halo = glowSprite(0xff3b3b, 40, 0.12)
  halo.position.y = 8
  g.add(halo)
  void color
  return {
    obj: g,
    tick: (t) => {
      ;(swirl.material as THREE.ShaderMaterial).uniforms.uTime.value = t
      ring.rotation.z = t * 0.3
      lanterns.forEach((l, i) => l.scale.setScalar(2.1 + Math.sin(t * 2 + i) * 0.25))
    },
  }
}

// ─────────────────────────── GoArt: virtual reality ───────────────────────────
function goart(color: string): Tickable {
  const g = new THREE.Group()
  const headset = new THREE.Group()
  headset.position.y = 9.5
  // visor
  const visor = neonBox(10, 5.2, 4.4, color)
  headset.add(visor)
  // lenses facing +z
  const lensMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv; uniform float uTime;
      void main(){
        vec2 p = vUv - 0.5; float r = length(p) * 2.0;
        float grid = step(0.92, fract(p.x * 9.0 + uTime * 0.3)) + step(0.92, fract(p.y * 9.0 - uTime * 0.2));
        float a = smoothstep(1.0, 0.85, r) * (0.22 + 0.4 * grid);
        vec3 c = mix(vec3(0.0, 0.94, 1.0), vec3(1.0, 0.17, 0.84), vUv.y);
        gl_FragColor = vec4(c * 0.8, a);
      }
    `,
  })
  for (const x of [-2.4, 2.4]) {
    const lens = new THREE.Mesh(new THREE.CircleGeometry(1.7, 32), lensMat)
    lens.position.set(x, 0.1, 2.24)
    headset.add(lens)
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.12, 8, 36), glowMat(0xffffff, 0.9))
    rim.position.copy(lens.position)
    headset.add(rim)
  }
  // strap
  const strap = new THREE.Mesh(new THREE.TorusGeometry(4.9, 0.32, 8, 40), new THREE.MeshBasicMaterial({ color: 0x1a1450 }))
  strap.scale.set(1, 0.62, 1)
  strap.rotation.y = Math.PI / 2
  strap.position.z = -3.1
  headset.add(strap)
  headset.add(edges(new THREE.TorusGeometry(4.9, 0.32, 8, 40), color, 0.9).translateZ(-3.1))
  g.add(headset)

  // data dome
  const domeGeo = new THREE.IcosahedronGeometry(15, 2)
  const dome = wire(domeGeo, color, 0.18)
  dome.scale.y = 0.85
  g.add(dome)

  // glitchy floating cubes + falling code
  const cubes: THREE.Group[] = []
  const rand = mulberry32(8)
  for (let i = 0; i < 12; i++) {
    const c = neonBox(1.2, 1.2, 1.2, i % 2 ? '#00f0ff' : color)
    c.position.set((rand() - 0.5) * 24, 2 + rand() * 14, (rand() - 0.5) * 24)
    cubes.push(c)
    g.add(c)
  }
  const n = 220
  const pos = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2
    const r = 6 + rand() * 9
    pos[i * 3] = Math.cos(a) * r
    pos[i * 3 + 1] = rand() * 20
    pos[i * 3 + 2] = Math.sin(a) * r
  }
  const pg = new THREE.BufferGeometry()
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.add(
    new THREE.Points(
      pg,
      new THREE.PointsMaterial({ color: 0x7dffd1, map: glowTexture(), size: 0.9, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }),
    ),
  )
  const ped = neonBox(6, 1, 6, color)
  ped.position.y = 0.5
  g.add(ped)

  return {
    obj: g,
    tick: (t, dt) => {
      lensMat.uniforms.uTime.value = t
      headset.rotation.y = Math.sin(t * 0.5) * 0.55
      headset.rotation.x = Math.sin(t * 0.8) * 0.06
      headset.position.y = 9.5 + Math.sin(t * 1.3) * 0.5
      dome.rotation.y = t * 0.08
      cubes.forEach((c, i) => {
        c.rotation.x = t * 0.7 + i
        c.rotation.y = t * 0.9 + i
        // an occasional glitch-jump
        if (Math.sin(t * 3 + i * 5.1) > 0.985) c.position.x += (rand() - 0.5) * 3
        c.position.y += Math.sin(t + i) * 0.004
      })
      const a = pg.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < n; i++) {
        let y = a.getY(i) - dt * (4 + (i % 5))
        if (y < 0) y = 20
        a.setY(i, y)
      }
      a.needsUpdate = true
    },
  }
}

// ─────────────────────────── Fast Track: the CRM tower ───────────────────────────
function fasttrack(color: string): Tickable {
  const g = new THREE.Group()
  const tower = neonBox(6.5, 15, 6.5, color)
  tower.position.y = 7.5
  g.add(tower)
  const cap = neonBox(8, 1.2, 8, color)
  cap.position.y = 15.6
  g.add(cap)

  const leds: THREE.Mesh[] = []
  for (let f = 0; f < 4; f++) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 3; c++) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.28), glowMat(c === 0 ? '#b6ff3c' : color, 0.9))
        const a = (f * Math.PI) / 2
        const off = 3.28
        const lx = (c - 1) * 1.4
        m.position.set(Math.sin(a) * off + Math.cos(a) * lx, 2 + r * 1.5, Math.cos(a) * off - Math.sin(a) * lx)
        m.rotation.y = a
        leds.push(m)
        g.add(m)
      }
    }
  }

  const net = new THREE.Group()
  net.position.y = 10
  const nodes: THREE.Vector3[] = []
  const rand = mulberry32(5)
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2
    const p = new THREE.Vector3(Math.cos(a) * 11, (rand() - 0.5) * 9, Math.sin(a) * 11)
    nodes.push(p)
    const s = glowSprite(i % 3 === 0 ? '#00f0ff' : color, 1.9, 0.95)
    s.position.copy(p)
    net.add(s)
  }
  const segs: number[] = []
  nodes.forEach((p, i) => {
    const q = nodes[(i + 1) % nodes.length]
    const r2 = nodes[(i + 3) % nodes.length]
    segs.push(p.x, p.y, p.z, q.x, q.y, q.z, p.x, p.y, p.z, r2.x, r2.y, r2.z)
  })
  const lg = new THREE.BufferGeometry()
  lg.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3))
  net.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 })))
  g.add(net)

  const arrow = new THREE.Group()
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 3.4, 4), glowMat(color, 1))
  cone.rotation.x = Math.PI
  arrow.add(cone)
  arrow.add(glowSprite(color, 5.5, 0.28))
  arrow.position.y = 22
  g.add(arrow)

  return {
    obj: g,
    tick: (t) => {
      net.rotation.y = t * 0.3
      arrow.position.y = 22 + Math.sin(t * 2.2) * 0.9
      arrow.rotation.y = t * 1.4
      leds.forEach((m, i) => {
        const v = Math.sin(t * (2 + (i % 5)) + i * 7.3)
        ;(m.material as THREE.MeshBasicMaterial).opacity = v > 0.2 ? 0.95 : 0.12
      })
    },
  }
}

// ─────────────────────────── Arcade: side-quest cabinets ───────────────────────────
function screenTexture(letter: string, color: string): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 104
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 0, 104)
  grad.addColorStop(0, '#120a3a')
  grad.addColorStop(1, '#05010f')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 104)
  g.strokeStyle = color
  g.globalAlpha = 0.35
  for (let y = 0; y < 104; y += 4) {
    g.beginPath()
    g.moveTo(0, y)
    g.lineTo(128, y)
    g.stroke()
  }
  g.globalAlpha = 1
  g.font = '700 70px "Chakra Petch", system-ui, sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillStyle = color
  g.shadowColor = color
  g.shadowBlur = 16
  g.fillText(letter, 64, 56)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function arcade(): Tickable {
  const g = new THREE.Group()
  const defs = [
    { letter: 'K', color: '#00f0ff', a: -42 },
    { letter: 'E', color: '#ffb800', a: 0 },
    { letter: 'H', color: '#ff2bd6', a: 42 },
  ]
  const screens: THREE.Mesh[] = []
  defs.forEach((d) => {
    const cab = new THREE.Group()
    const body = neonBox(4.2, 7.4, 3.4, d.color)
    body.position.y = 3.7
    cab.add(body)
    const top = neonBox(4.6, 1.3, 3.8, d.color)
    top.position.y = 8.2
    cab.add(top)
    const marquee = textSprite(d.letter, d.color, 2.2)
    marquee.position.set(0, 8.2, 2.05)
    cab.add(marquee)
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 2.6),
      new THREE.MeshBasicMaterial({ map: screenTexture(d.letter, d.color), transparent: true }),
    )
    screen.position.set(0, 5.4, 1.72)
    screen.rotation.x = rad(-12)
    cab.add(screen)
    screens.push(screen)
    const panel = neonBox(4.2, 0.35, 1.4, d.color)
    panel.position.set(0, 3.5, 1.9)
    cab.add(panel)
    const a = rad(d.a)
    cab.position.set(Math.sin(a) * 8.5, 0, -Math.cos(a) * 8.5 + 3)
    cab.lookAt(0, 0, 3)
    g.add(cab)
  })
  g.scale.setScalar(1.3)
  const coin = new THREE.Group()
  coin.add(new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.3, 24).rotateX(Math.PI / 2), glowMat('#ffb800', 0.95)))
  coin.add(edges(new THREE.CylinderGeometry(1.7, 1.7, 0.4, 24).rotateX(Math.PI / 2), '#fff3c4', 0.9))
  coin.position.set(0, 4.2, 3)
  g.add(coin)
  const spot = glowSprite('#ffb800', 7, 0.35)
  spot.position.copy(coin.position)
  g.add(spot)
  return {
    obj: g,
    tick: (t) => {
      coin.rotation.y = t * 2
      coin.position.y = 4.2 + Math.sin(t * 2.4) * 0.5
      spot.position.y = coin.position.y
      screens.forEach((s, i) => ((s.material as THREE.MeshBasicMaterial).opacity = 0.82 + Math.sin(t * 9 + i * 2) * 0.12))
    },
  }
}

// ─────────────────────────── Skill Core: the skill tree ───────────────────────────
function skillCore(): Tickable {
  const g = new THREE.Group()
  const tree = new THREE.Group()
  tree.position.y = 7
  const coreGeo = new THREE.IcosahedronGeometry(2.6, 0)
  const core = new THREE.Group()
  core.add(new THREE.Mesh(coreGeo, dark()))
  core.add(edges(coreGeo, '#ffffff', 1))
  tree.add(core)
  tree.add(glowSprite('#b6ff3c', 14, 0.5))

  const nodes: THREE.Mesh[] = []
  skills.forEach((b, bi) => {
    const baseA = (bi / skills.length) * Math.PI * 2 + 0.4
    const pts: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)]
    b.items.forEach((_, i) => {
      const a = baseA + i * 0.28
      const r = 5 + i * 1.45
      const p = new THREE.Vector3(Math.cos(a) * r, -1 + i * 0.85, Math.sin(a) * r)
      pts.push(p)
      const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.85), glowMat(b.color, 0.95))
      m.position.copy(p)
      nodes.push(m)
      tree.add(m)
    })
    const segs: number[] = []
    for (let i = 0; i < pts.length - 1; i++) segs.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z)
    const lg = new THREE.BufferGeometry()
    lg.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3))
    tree.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: b.color, transparent: true, opacity: 0.75 })))
  })
  g.add(tree)
  const ped = neonMesh(new THREE.CylinderGeometry(2, 3, 1.2, 6), '#b6ff3c', 10)
  ped.position.y = 0.6
  g.add(ped)
  return {
    obj: g,
    tick: (t) => {
      tree.rotation.y = t * 0.22
      core.rotation.set(t * 0.5, t * 0.7, 0)
      nodes.forEach((n, i) => {
        n.rotation.y = t * 2 + i
        n.scale.setScalar(1 + Math.sin(t * 2 + i * 0.7) * 0.18)
      })
    },
  }
}

// ─────────────────────────── Valletta lighthouse: the signal tower ───────────────────────────
function lighthouse(color: string): Tickable {
  const g = new THREE.Group()
  const fort = neonBox(16, 3, 12, 0xffc77a)
  fort.position.y = 1.5
  g.add(fort)
  const bands = [0xffffff, 0xff2bd6, 0xffffff, 0xff2bd6]
  bands.forEach((c, i) => {
    const seg = neonMesh(new THREE.CylinderGeometry(1.5 - i * 0.12, 1.6 - i * 0.12, 4.2, 14), c, 10)
    seg.position.y = 5 + i * 4.2
    g.add(seg)
  })
  const gallery = neonMesh(new THREE.CylinderGeometry(2.2, 2.2, 0.5, 14), 0xffe9bf, 10)
  gallery.position.y = 22
  g.add(gallery)
  const lantern = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 2, 12), glowMat(0xfff2c8, 0.9))
  lantern.position.y = 23.3
  g.add(lantern)
  const roof = neonMesh(new THREE.ConeGeometry(1.7, 1.8, 12), color, 10)
  roof.position.y = 25.2
  g.add(roof)

  // the sweeping beam
  const beam = new THREE.Mesh(
    new THREE.ConeGeometry(7, 60, 20, 1, true).rotateZ(-Math.PI / 2).translate(30, 0, 0),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `varying vec2 vUv; void main(){ float a = pow(1.0 - vUv.y, 1.5) * 0.4; gl_FragColor = vec4(vec3(1.0, 0.95, 0.7) * a * 1.4, a); }`,
    }),
  )
  beam.position.y = 23.3
  g.add(beam)
  const halo = glowSprite(color, 16, 0.5)
  halo.position.y = 23.3
  g.add(halo)

  // signal pulses
  const pulses: THREE.Mesh[] = []
  for (let i = 0; i < 4; i++) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 6, 64).rotateX(Math.PI / 2), glowMat(color, 0.8))
    m.position.y = 23.3
    pulses.push(m)
    g.add(m)
  }
  return {
    obj: g,
    tick: (t) => {
      beam.rotation.y = t * 0.9
      pulses.forEach((m, i) => {
        const k = (t * 0.4 + i / pulses.length) % 1
        m.scale.setScalar(1 + k * 18)
        ;(m.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.8
      })
      halo.scale.setScalar(16 + Math.sin(t * 5) * 1.5)
    },
  }
}

// ─────────────────────────── jets & airports ───────────────────────────
/** A low-poly airliner. Nose points along +x. */
export function jet(color = 0x00f0ff): THREE.Group {
  const g = new THREE.Group()
  const part = (geo: THREE.BufferGeometry, c: number, x = 0, y = 0, z = 0, angle = 20) => {
    const o = neonMesh(geo, c, angle)
    o.position.set(x, y, z)
    g.add(o)
    return o
  }
  part(new THREE.CylinderGeometry(0.95, 0.95, 9, 14).rotateZ(Math.PI / 2), 0xe8f4ff)
  part(new THREE.ConeGeometry(0.95, 2.6, 14).rotateZ(-Math.PI / 2), color, 5.8)
  part(new THREE.ConeGeometry(0.95, 3.2, 14).rotateZ(Math.PI / 2), 0xe8f4ff, -6.1)
  for (const s of [-1, 1]) {
    const w = part(new THREE.BoxGeometry(3.2, 0.14, 5.6), color, 0.2, -0.2, s * 3.4)
    w.rotation.y = s * -0.5
    part(new THREE.CylinderGeometry(0.42, 0.42, 1.8, 10).rotateZ(Math.PI / 2), 0xe8f4ff, 1.0, -0.85, s * 2.7)
    const st = part(new THREE.BoxGeometry(1.5, 0.1, 2.8), color, -6, 0.2, s * 1.5)
    st.rotation.y = s * -0.35
  }
  part(new THREE.BoxGeometry(2.0, 2.6, 0.14), color, -5.7, 1.5, 0)
  for (let i = 0; i < 12; i++) {
    for (const s of [-1, 1]) {
      const wd = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.26), glowMat(0xffd27a, 0.9))
      wd.position.set(-2.8 + i * 0.62, 0.3, s * 0.96)
      if (s < 0) wd.rotation.y = Math.PI
      g.add(wd)
    }
  }
  return g
}

function airport(color: string): Tickable {
  const g = new THREE.Group()
  const strip = neonBox(66, 0.12, 8, 0x4a5aa8)
  strip.position.y = 0.06
  g.add(strip)
  const dashes = new THREE.InstancedMesh(new THREE.BoxGeometry(2.4, 0.05, 0.3), glowMat(0xffffff, 0.9), 14)
  const m = new THREE.Matrix4()
  for (let i = 0; i < 14; i++) {
    m.makeTranslation(-29 + i * 4.5, 0.16, 0)
    dashes.setMatrixAt(i, m)
  }
  g.add(dashes)
  const edgeLights: THREE.Sprite[] = []
  for (let i = 0; i < 12; i++) {
    for (const s of [-1, 1]) {
      const sp = glowSprite(i % 2 ? 0xffd27a : 0x66ffb0, 1.6, 0.9)
      sp.position.set(-30 + i * 5.5, 0.5, s * 4.3)
      edgeLights.push(sp)
      g.add(sp)
    }
  }
  const terminal = neonBox(18, 5.5, 6.5, color)
  terminal.position.set(2, 2.75, -13)
  g.add(terminal)
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(16, 3), glowMat(0x7ff6ff, 0.28))
  glass.position.set(2, 2.9, -9.7)
  g.add(glass)
  const tower = neonBox(2.2, 14, 2.2, color)
  tower.position.set(-14, 7, -13)
  g.add(tower)
  const cab = neonBox(4.2, 2.2, 4.2, color)
  cab.position.set(-14, 15, -13)
  g.add(cab)
  const jetModel = jet(0x00f0ff)
  jetModel.position.set(-6, 1.85, 0)
  g.add(jetModel)
  const beacon = glowSprite(0xff2040, 4, 0.9)
  beacon.position.set(-14, 16.8, -13)
  g.add(beacon)
  return {
    obj: g,
    tick: (t) => {
      edgeLights.forEach((s, i) => ((s.material as THREE.SpriteMaterial).opacity = 0.5 + 0.5 * Math.sin(t * 3 - i * 0.5)))
      ;(beacon.material as THREE.SpriteMaterial).opacity = 0.2 + 0.8 * (Math.sin(t * 2) > 0 ? 1 : 0.1)
    },
  }
}

// ─────────────────────────── hidden gems: hobbies ───────────────────────────
function sparkle(color: string): { sprite: THREE.Sprite; ring: THREE.Mesh } {
  const sprite = glowSprite(color, 6, 0.9)
  sprite.position.y = 9
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.05, 6, 40), glowMat(color, 0.85))
  ring.position.y = 9
  return { sprite, ring }
}

function padel(color: string): Tickable {
  const g = new THREE.Group()
  const W = 8
  const D = 15
  const floor = neonBox(W, 0.14, D, color)
  floor.position.y = 0.07
  g.add(floor)
  const fill = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.4, D - 0.4).rotateX(-Math.PI / 2), glowMat(0x1b6bff, 0.35))
  fill.position.y = 0.17
  g.add(fill)
  // court lines
  const lines = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(W - 0.8, 0.01, D - 0.8)),
    new THREE.LineBasicMaterial({ color: 0xffffff }),
  )
  lines.position.y = 0.19
  g.add(lines)
  for (const z of [-D / 2 + 3.2, D / 2 - 3.2]) {
    const l = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.8, 0.07).rotateX(-Math.PI / 2), glowMat(0xffffff, 0.9))
    l.position.set(0, 0.19, z)
    g.add(l)
  }
  const cl = new THREE.Mesh(new THREE.PlaneGeometry(0.07, D / 2 - 3.2 + 3.2).rotateX(-Math.PI / 2), glowMat(0xffffff, 0.9))
  cl.position.set(0, 0.19, 0)
  g.add(cl)
  // glass walls
  for (const s of [-1, 1]) {
    const back = new THREE.Mesh(new THREE.BoxGeometry(W, 3, 0.1), glowMat(0x9ffcff, 0.1))
    back.position.set(0, 1.6, s * (D / 2))
    g.add(back, edges(back.geometry, 0x9ffcff, 0.8).translateY(1.6).translateZ(s * (D / 2)))
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.6, D * 0.55), glowMat(0x9ffcff, 0.1))
    side.position.set(s * (W / 2), 1.4, 0)
    g.add(side, edges(side.geometry, 0x9ffcff, 0.8).translateY(1.4).translateX(s * (W / 2)))
  }
  // net
  const net = new THREE.Mesh(new THREE.PlaneGeometry(W, 1.0), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.55 }))
  net.position.set(0, 0.75, 0)
  g.add(net)
  for (const s of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.3, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }))
    post.position.set(s * (W / 2), 0.65, 0)
    g.add(post)
  }
  // the ball
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 10), glowMat(0xd7ff3a, 1))
  g.add(ball)
  const bglow = glowSprite(0xd7ff3a, 2.4, 0.7)
  g.add(bglow)
  // a racket
  const racket = new THREE.Group()
  const rmesh = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.09, 8, 28), glowMat(0xff2bd6, 0.95))
  rmesh.scale.set(1, 1.15, 1)
  racket.add(rmesh)
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.2, 8), new THREE.MeshBasicMaterial({ color: 0xfff1b0 }))
  handle.position.y = -1.6
  racket.add(handle)
  racket.position.set(0, 4.6, D / 2 + 3.2)
  g.add(racket)
  const sp = sparkle(color)
  g.add(sp.sprite, sp.ring)
  return {
    obj: g,
    tick: (t) => {
      // rally: back and forth with a bounce each time it crosses a service box
      const k = (t * 0.55) % 2
      const u = k < 1 ? k : 2 - k
      const z = (u - 0.5) * (D - 2)
      const y = 0.4 + Math.abs(Math.sin(u * Math.PI * 3)) * 1.7 * (1 - Math.abs(u - 0.5) * 0.4) + 0.6
      ball.position.set(Math.sin(t * 1.3) * 1.6, y, z)
      bglow.position.copy(ball.position)
      racket.rotation.y = t * 1.2
      racket.rotation.z = Math.sin(t * 2) * 0.3
      racket.position.y = 4.6 + Math.sin(t * 1.5) * 0.4
      sp.sprite.scale.setScalar(5 + Math.sin(t * 3) * 1.2)
      sp.ring.rotation.set(t, t * 0.7, 0)
    },
  }
}

function monitorTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 192
  const g = c.getContext('2d')!
  g.fillStyle = '#05010f'
  g.fillRect(0, 0, 256, 192)
  g.strokeStyle = '#ff2bd6'
  g.globalAlpha = 0.3
  for (let y = 0; y < 192; y += 4) {
    g.beginPath()
    g.moveTo(0, y)
    g.lineTo(256, y)
    g.stroke()
  }
  g.globalAlpha = 1
  g.fillStyle = '#00f0ff'
  g.shadowColor = '#00f0ff'
  g.shadowBlur = 14
  g.font = '700 38px "Chakra Petch", system-ui, sans-serif'
  g.textAlign = 'center'
  g.fillText('PLAYER 1', 128, 84)
  g.fillStyle = '#ff2bd6'
  g.shadowColor = '#ff2bd6'
  g.font = '700 26px "Chakra Petch", system-ui, sans-serif'
  g.fillText('PRESS START', 128, 130)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function gamingDen(color: string): Tickable {
  const g = new THREE.Group()
  const ped = neonMesh(new THREE.CylinderGeometry(7, 7.5, 0.6, 6), color, 10)
  ped.position.y = 0.3
  g.add(ped)
  // arcade monitor
  const mon = neonBox(6, 5, 3.4, color)
  mon.position.set(0, 3.1, -3.5)
  g.add(mon)
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.5), new THREE.MeshBasicMaterial({ map: monitorTexture(), transparent: true }))
  screen.position.set(0, 3.4, -1.78)
  g.add(screen)
  // controller
  const pad = new THREE.Group()
  const bodyGeo = new THREE.CapsuleGeometry(0.9, 2.4, 6, 14).rotateZ(Math.PI / 2)
  const body = neonMesh(bodyGeo, color, 30)
  body.scale.set(1, 0.72, 1)
  pad.add(body)
  for (const s of [-1, 1]) {
    const grip = neonMesh(new THREE.CapsuleGeometry(0.65, 1.2, 4, 10), color, 30)
    grip.position.set(s * 2.0, -0.85, 0)
    grip.rotation.z = s * 0.35
    pad.add(grip)
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.32, 14), glowMat(0xffffff, 0.9))
    stick.position.set(s * 1.05, 0.62, 0.35)
    stick.rotation.x = Math.PI / 2
    pad.add(stick)
  }
  const dp1 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.28, 0.32), glowMat(0xffffff, 0.9))
  const dp2 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.9, 0.32), glowMat(0xffffff, 0.9))
  for (const o of [dp1, dp2]) {
    o.position.set(-2.1, 0.12, 0.6)
    pad.add(o)
  }
  ;[[0, 0.55, 0xffd23a], [0.5, 0.1, 0xff3b5c], [0, -0.35, 0x3aff8a], [-0.5, 0.1, 0x3ab0ff]].forEach(([x, y, c]) => {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), glowMat(c, 1))
    b.position.set(2.1 + x, y, 0.62)
    pad.add(b)
  })
  pad.scale.setScalar(1.15)
  pad.position.y = 8
  g.add(pad)
  const sp = sparkle(color)
  sp.sprite.position.y = 12.5
  sp.ring.position.y = 12.5
  g.add(sp.sprite, sp.ring)
  return {
    obj: g,
    tick: (t) => {
      pad.rotation.y = t * 0.7
      pad.rotation.x = Math.sin(t * 1.1) * 0.25
      pad.position.y = 8 + Math.sin(t * 1.6) * 0.5
      ;(screen.material as THREE.MeshBasicMaterial).opacity = 0.75 + 0.2 * (Math.sin(t * 6) > 0 ? 1 : 0.3)
      sp.sprite.scale.setScalar(5 + Math.sin(t * 3) * 1.2)
      sp.ring.rotation.set(t, t * 0.7, 0)
    },
  }
}

function travelQuay(color: string): Tickable {
  const g = new THREE.Group()
  // a pier pointing out to sea (+x)
  const pier = neonBox(20, 0.3, 5.5, color)
  pier.position.set(2, 0.15, 0)
  g.add(pier)
  for (let i = 0; i < 6; i++) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.4, 6), new THREE.MeshBasicMaterial({ color: 0x3a3f6a }))
    post.position.set(-6 + i * 3.6, 0.7, 2.9)
    g.add(post, glowSprite(0xffc873, 1.8, 0.9).translateX(-6 + i * 3.6).translateY(1.7).translateZ(2.9))
  }
  // luggage
  const suitcases: Array<[number, number, number, number, number]> = [
    [-3, 0, 1, 0xff2bd6, 0.2],
    [-1.4, 0, -0.9, 0x00f0ff, -0.35],
  ]
  suitcases.forEach(([x, , z, c, r]) => {
    const s = neonBox(2.4, 1.8, 1.0, c)
    s.position.set(x, 1.2, z)
    s.rotation.y = r
    g.add(s)
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 6, 14, Math.PI), new THREE.MeshBasicMaterial({ color: 0xffffff }))
    handle.position.set(x, 2.2, z)
    handle.rotation.y = r
    g.add(handle)
    const sticker = new THREE.Mesh(new THREE.CircleGeometry(0.28, 12), glowMat(0xffd23a, 0.95))
    sticker.position.set(x + 0.4, 1.2, z + 0.52)
    sticker.rotation.y = r
    g.add(sticker)
  })
  // globe on a post with a paper plane circling it
  const globeRoot = new THREE.Group()
  globeRoot.position.set(7, 0, 0)
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 4, 8), new THREE.MeshBasicMaterial({ color: 0x3a3f6a }))
  post.position.y = 2
  globeRoot.add(post)
  const globe = new THREE.Group()
  globe.position.y = 6.2
  const globeGeo = new THREE.SphereGeometry(2.3, 20, 14)
  globe.add(new THREE.Mesh(globeGeo, dark()))
  globe.add(wire(globeGeo, color, 0.85))
  globeRoot.add(globe)
  const plane = new THREE.Mesh(new THREE.ConeGeometry(0.34, 1.1, 3).rotateZ(-Math.PI / 2), glowMat(0xffffff, 1))
  const orbit = new THREE.Group()
  orbit.position.y = 6.2
  orbit.add(plane)
  plane.position.x = 3.6
  orbit.rotation.z = 0.5
  globeRoot.add(orbit)
  g.add(globeRoot)
  const sp = sparkle(color)
  sp.sprite.position.set(7, 11.5, 0)
  sp.ring.position.set(7, 11.5, 0)
  g.add(sp.sprite, sp.ring)
  return {
    obj: g,
    tick: (t) => {
      globe.rotation.y = t * 0.6
      orbit.rotation.y = t * 1.1
      sp.sprite.scale.setScalar(5 + Math.sin(t * 3) * 1.2)
      sp.ring.rotation.set(t, t * 0.7, 0)
    },
  }
}

// ─────────────────────────── the secret ───────────────────────────

/** A path of light across the water, revealed from the shore toward the gate. */
export function lightPath(a: P, b: P, halfW: number): { obj: THREE.Group; setReveal(f: number): void; tick(t: number): void } {
  const dx = b[0] - a[0]
  const dz = b[1] - a[1]
  const L = Math.hypot(dx, dz)
  const root = new THREE.Group()
  root.position.set((a[0] + b[0]) / 2, 0.4, (a[1] + b[1]) / 2)
  root.rotation.y = Math.atan2(-dz, dx)
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uReveal: { value: 0 }, uLen: { value: L }, uHalf: { value: halfW } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv; uniform float uTime; uniform float uReveal; uniform float uLen; uniform float uHalf;
      void main(){
        if (vUv.x > uReveal) discard;
        vec2 p = vec2(vUv.x * uLen, (vUv.y - 0.5) * uHalf * 2.0);
        vec2 q = fract(p / 2.0 + vec2(-uTime * 0.4, 0.0)) - 0.5;
        float tile = 1.0 - smoothstep(0.38, 0.5, max(abs(q.x), abs(q.y)));
        float edge = smoothstep(0.82, 1.0, abs(vUv.y - 0.5) * 2.0);
        float head = smoothstep(0.05, 0.0, uReveal - vUv.x) * 1.6;
        vec3 c = mix(vec3(1.0, 0.2, 0.45), vec3(1.0, 0.75, 0.85), tile);
        gl_FragColor = vec4(c * (0.35 + tile * 0.7 + edge * 0.9 + head), 0.35 + tile * 0.45 + edge * 0.5);
      }
    `,
  })
  const deck = new THREE.Mesh(new THREE.PlaneGeometry(L, halfW * 2).rotateX(-Math.PI / 2), mat)
  root.add(deck)
  root.visible = false
  return {
    obj: root,
    setReveal: (f) => {
      mat.uniforms.uReveal.value = f
      root.visible = f > 0.001
    },
    tick: (t) => (mat.uniforms.uTime.value = t),
  }
}

export function toriiGate(color: string): Tickable {
  const g = new THREE.Group()
  const red = color
  const pillarGeo = new THREE.CylinderGeometry(0.75, 0.95, 13, 12)
  ;[-5.2, 5.2].forEach((x) => {
    const p = neonMesh(pillarGeo.clone(), red, 30)
    p.position.set(x, 6.5, 0)
    g.add(p)
  })
  const kasagi = neonBox(17, 1.1, 1.8, red)
  kasagi.position.y = 13.3
  g.add(kasagi)
  ;[-1, 1].forEach((s) => {
    const tip = neonBox(3.4, 0.9, 1.7, red)
    tip.position.set(s * 8.4, 13.9, 0)
    tip.rotation.z = s * rad(14)
    g.add(tip)
  })
  const shimaki = neonBox(14, 0.8, 1.2, red)
  shimaki.position.y = 12.2
  g.add(shimaki)
  const nuki = neonBox(11.6, 0.7, 0.8, red)
  nuki.position.y = 9.6
  g.add(nuki)
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2), glowMat('#ffd1dc', 0.9))
  plaque.position.set(0, 11, 0.5)
  g.add(plaque)

  const swirl = new THREE.Mesh(
    new THREE.PlaneGeometry(9.6, 12),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv; uniform float uTime;
        void main(){
          float w = sin(vUv.y * 22.0 - uTime * 2.6 + sin(vUv.x * 9.0 + uTime) * 1.4) * 0.5 + 0.5;
          float edge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
          vec3 c = mix(vec3(1.0, 0.18, 0.36), vec3(1.0, 0.72, 0.83), w);
          gl_FragColor = vec4(c * 1.2, (0.12 + 0.3 * w) * edge);
        }
      `,
    }),
  )
  swirl.position.y = 6.2
  g.add(swirl)

  const n = 260
  const rand = mulberry32(99)
  const pos = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (rand() - 0.5) * 46
    pos[i * 3 + 1] = rand() * 26
    pos[i * 3 + 2] = (rand() - 0.5) * 46
  }
  const pg = new THREE.BufferGeometry()
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.add(
    new THREE.Points(
      pg,
      new THREE.PointsMaterial({ color: 0xffb7d5, map: glowTexture(), size: 0.9, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }),
    ),
  )
  const glow = glowSprite(red, 30, 0.35)
  glow.position.y = 7
  g.add(glow)

  return {
    obj: g,
    tick: (t, dt) => {
      ;(swirl.material as THREE.ShaderMaterial).uniforms.uTime.value = t
      const a = pg.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < n; i++) {
        let y = a.getY(i) - dt * (1.2 + (i % 5) * 0.25)
        let x = a.getX(i) + Math.sin(t * 0.8 + i) * dt * 0.9
        if (y < 0) {
          y = 26
          x = (rand() - 0.5) * 46
        }
        a.setY(i, y)
        a.setX(i, x)
      }
      a.needsUpdate = true
      glow.scale.setScalar(30 + Math.sin(t * 2) * 3)
    },
  }
}

export function buildLandmark(id: string, color: string): Tickable | null {
  switch (id) {
    case 'itu':
      return itu(color)
    case 'datapare':
      return datapare(color)
    case 'firmasoft':
      return firmasoft(color)
    case 'huawei':
      return huawei(color)
    case 'goart':
      return goart(color)
    case 'fasttrack':
      return fasttrack(color)
    case 'arcade':
      return arcade()
    case 'skills':
      return skillCore()
    case 'contact':
      return lighthouse(color)
    case 'ist':
    case 'mla':
      return airport(color)
    case 'pierE':
    case 'pierA':
      return pier(id, color)
    case 'padel':
      return padel(color)
    case 'gaming':
      return gamingDen(color)
    case 'travel':
      return travelQuay(color)
    default:
      return null
  }
}
