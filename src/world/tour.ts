import * as THREE from 'three'
import { createCar } from './car'
import { createCharacter } from './character'
import { type Tickable, edges, glowMat, glowSprite, mulberry32, neonBox, neonMesh, wire } from './fx'
import { type P } from './geo'
import { asphaltTexture, ribbonGeometry } from './road'

// The world tour: one small diorama per place, each built around the thing it is famous for.
// Everything is centred on (0,0) at ground level and should stay within about 40 units of the centre.

const rad = (d: number) => (d * Math.PI) / 180

// ───────────────────────────── helpers ─────────────────────────────

const texCache = new Map<string, THREE.CanvasTexture>()

/** A dark wall with a grid of lit windows. Cached per colour. */
function windowTexture(color: string): THREE.CanvasTexture {
  const hit = texCache.get('win' + color)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const rand = mulberry32(color.length * 31 + color.charCodeAt(1))
  g.fillStyle = '#0d0a24'
  g.fillRect(0, 0, 64, 64)
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      if (rand() < 0.58) {
        g.fillStyle = color
        g.globalAlpha = 0.55 + rand() * 0.4
        g.fillRect(x * 16 + 4, y * 16 + 3, 8, 10)
      }
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.magFilter = THREE.NearestFilter
  t.colorSpace = THREE.SRGBColorSpace
  texCache.set('win' + color, t)
  return t
}

/** A box with lit windows on its four walls and a neon outline. Sits on y = 0. */
function litBox(w: number, h: number, d: number, edge: string, win = edge, cell = 2.6): THREE.Group {
  const g = new THREE.Group()
  const side = (across: number) => {
    const t = windowTexture(win).clone()
    t.needsUpdate = true
    t.repeat.set(Math.max(1, Math.round(across / cell / 4)), Math.max(1, Math.round(h / cell / 4)))
    return new THREE.MeshBasicMaterial({ map: t })
  }
  const top = new THREE.MeshBasicMaterial({ color: 0x0d0a24 })
  const mats = [side(d), side(d), top, top, side(w), side(w)]
  const geo = new THREE.BoxGeometry(w, h, d)
  const m = new THREE.Mesh(geo, mats)
  m.position.y = h / 2
  g.add(m)
  const e = edges(geo, edge, 1)
  e.position.y = h / 2
  g.add(e)
  return g
}

function box(w: number, h: number, d: number, color: string, x = 0, y = 0, z = 0): THREE.Group {
  const b = neonBox(w, h, d, color)
  b.position.set(x, y + h / 2, z)
  return b
}

function cone(r: number, h: number, color: string, seg = 8, x = 0, y = 0, z = 0): THREE.Group {
  const c = neonMesh(new THREE.ConeGeometry(r, h, seg), color, 10)
  c.position.set(x, y + h / 2, z)
  return c
}

function cyl(rt: number, rb: number, h: number, color: string, seg = 12, x = 0, y = 0, z = 0): THREE.Group {
  const c = neonMesh(new THREE.CylinderGeometry(rt, rb, h, seg), color, 10)
  c.position.set(x, y + h / 2, z)
  return c
}

/** Triangular roof prism: ridge along z. */
function prism(w: number, h: number, d: number, color: string, x = 0, y = 0, z = 0): THREE.Group {
  const shape = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, h)])
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false }).translate(0, 0, -d / 2)
  const p = neonMesh(geo, color, 10)
  p.position.set(x, y, z)
  return p
}

/** A narrow gabled townhouse (Amsterdam, Bruges). */
function townhouse(w: number, h: number, d: number, wall: string, edge: string, stepped = false): THREE.Group {
  const g = new THREE.Group()
  g.add(litBox(w, h, d, edge, wall, 2.2))
  if (stepped) {
    const steps = 4
    for (let i = 0; i < steps; i++) {
      const sw = w * (1 - i / steps) * 0.96
      g.add(box(sw, 0.7, d * 0.9, edge, 0, h + i * 0.7))
    }
  } else {
    g.add(prism(w, w * 0.55, d, edge, 0, h))
  }
  return g
}

/** An animated strip of canal / river / lake water. */
function water(w: number, d: number, color: [number, number, number], y = 0.05): { mesh: THREE.Mesh; tick: (t: number) => void } {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
    uniforms: { uTime: { value: 0 }, uC: { value: new THREE.Vector3(...color) } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv; uniform float uTime; uniform vec3 uC;
      void main(){
        float r = 0.5 + 0.5 * sin(vUv.x * 60.0 + uTime * 1.6 + sin(vUv.y * 24.0) * 1.5);
        float edge = smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.82, vUv.y);
        float a = (0.18 + 0.16 * r) * edge;
        gl_FragColor = vec4(uC * a, a);
      }
    `,
  })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), mat)
  mesh.position.y = y
  return { mesh, tick: (t) => (mat.uniforms.uTime.value = t) }
}

function kerbTexture(): THREE.CanvasTexture {
  const hit = texCache.get('kerb')
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = 16
  c.height = 32
  const g = c.getContext('2d')!
  g.fillStyle = '#ff2d3a'
  g.fillRect(0, 0, 16, 16)
  g.fillStyle = '#f4f4f8'
  g.fillRect(0, 16, 16, 16)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = THREE.SRGBColorSpace
  texCache.set('kerb', t)
  return t
}

/** A closed race circuit through the given control points, with red-and-white kerbs. */
function circuit(ctrl: P[], width: number, bankAt?: (u: number) => number): { group: THREE.Group; curve: THREE.CatmullRomCurve3 } {
  const group = new THREE.Group()
  const curve = new THREE.CatmullRomCurve3(
    ctrl.map(([x, z]) => new THREE.Vector3(x, 0.1, z)),
    true,
    'centripetal',
  )
  const N = 220
  const pts = curve.getSpacedPoints(N).slice(0, N)
  const bank = bankAt ? pts.map((_, i) => bankAt(i / N)) : undefined
  const kerb = new THREE.Mesh(
    ribbonGeometry(pts.map((p) => p.clone().setY(0.06)), width + 1.8, 2, true, bank),
    new THREE.MeshBasicMaterial({ map: kerbTexture(), side: THREE.DoubleSide }),
  )
  const road = new THREE.Mesh(
    ribbonGeometry(pts.map((p) => p.clone().setY(0.1)), width, 10, true, bank),
    new THREE.MeshBasicMaterial({ map: asphaltTexture(), side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
  )
  group.add(kerb, road)
  return { group, curve }
}

/** A start/finish gantry spanning the track at the origin of local space. */
function gantry(color: string, span = 7): THREE.Group {
  const g = new THREE.Group()
  g.add(box(0.5, 6, 0.5, color, -span / 2, 0, 0), box(0.5, 6, 0.5, color, span / 2, 0, 0), box(span + 1, 0.9, 0.7, color, 0, 5.4, 0))
  for (let i = 0; i < 5; i++) {
    const l = glowSprite(0xff2d3a, 1.1, 0.95)
    l.position.set(-2 + i, 5.85, 0.5)
    g.add(l)
  }
  return g
}

function grandstand(w: number, color: string): THREE.Group {
  const g = new THREE.Group()
  for (let i = 0; i < 3; i++) g.add(litBox(w, 1.4 + i * 1.3, 2.4 - i * 0.55, color, color, 1.8).translateZ(-i * 1.0))
  return g
}

function tree(color = '#2bff8a'): THREE.Group {
  const g = new THREE.Group()
  g.add(cone(1.5, 3.6, color, 6, 0, 0.6))
  g.add(cyl(0.18, 0.22, 0.7, '#6b4a2a', 5))
  return g
}

/** Little glowing racing car (Monza) */
function racer(color: number): THREE.Group {
  const g = new THREE.Group()
  g.add(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 2.2), new THREE.MeshBasicMaterial({ color })))
  const w = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.07, 0.3), new THREE.MeshBasicMaterial({ color }))
  w.position.set(0, 0.15, 1.2)
  const w2 = w.clone()
  w2.position.set(0, 0.5, -1.1)
  g.add(w, w2, glowSprite(color, 1.8, 0.7))
  g.position.y = 0.25
  return g
}

/** Run something along a closed curve. */
function lap(curve: THREE.CatmullRomCurve3, obj: THREE.Object3D, speed: number, offset: number, t: number, lift = 0.1) {
  const u = (((t * speed + offset) % 1) + 1) % 1
  const p = curve.getPointAt(u)
  const tan = curve.getTangentAt(u)
  obj.position.set(p.x, p.y + lift, p.z)
  obj.rotation.y = Math.atan2(tan.x, tan.z)
}

// ───────────────────────────── Istanbul Park: the Turkish Grand Prix circuit (brought in from Tuzla) ─────────────────────────────

const ISTPARK: P[] = [
  [-34, 18], [-34, -6], [-26, -20], [-8, -26], [10, -22], [16, -10], [28, -12], [36, -2], [30, 10], [16, 12], [10, 24], [-6, 28], [-22, 26],
]

export function istanbulPark(): Tickable {
  const g = new THREE.Group()
  const { group, curve } = circuit(ISTPARK, 4.2)
  g.add(group)
  const start = curve.getPointAt(0.0)
  const tan = curve.getTangentAt(0.0)
  const gan = gantry('#e30a17')
  gan.position.copy(start)
  gan.rotation.y = Math.atan2(tan.x, tan.z) + Math.PI / 2
  g.add(gan)
  const stand = grandstand(16, '#e30a17')
  stand.position.set(start.x - 8, 0, start.z - 4)
  stand.rotation.y = Math.PI / 2
  g.add(stand)
  // Turn 8: a long, tightening left-hander. Mark it with a ring of lights.
  const t8 = curve.getPointAt(0.55)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(5, 0.12, 6, 36).rotateX(Math.PI / 2), glowMat(0xffd23a, 0.7))
  ring.position.set(t8.x, 0.5, t8.z)
  g.add(ring)
  const rb = createCar()
  rb.group.scale.setScalar(0.7)
  g.add(rb.group)
  const racers = [0xe8f4ff, 0xff2d3a].map((c) => racer(c))
  racers.forEach((r) => g.add(r))
  const halo = glowSprite(0xe30a17, 70, 0.08)
  halo.position.y = 4
  g.add(halo)
  return {
    obj: g,
    tick: (t, dt) => {
      lap(curve, rb.group, 0.075, 0, t, 0.1)
      rb.update(dt, t, 55, 0)
      racers.forEach((r, i) => lap(curve, r, 0.07, 0.94 - i * 0.05, t))
    },
  }
}
// ───────────────────────────── Rome: the Colosseum ─────────────────────────────

function archTexture(): THREE.CanvasTexture {
  const hit = texCache.get('arch')
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 192
  const g = c.getContext('2d')!
  g.fillStyle = '#3a2418'
  g.fillRect(0, 0, 64, 192)
  for (let tier = 0; tier < 3; tier++) {
    const y0 = tier * 62 + 4
    g.fillStyle = '#6b4630'
    g.fillRect(0, y0 + 58, 64, 4) // cornice
    const grad = g.createLinearGradient(0, y0, 0, y0 + 58)
    grad.addColorStop(0, '#ffcf8a')
    grad.addColorStop(1, '#ff8a3c')
    g.fillStyle = grad
    g.beginPath()
    g.moveTo(14, y0 + 56)
    g.lineTo(14, y0 + 22)
    g.arc(32, y0 + 22, 18, Math.PI, 0)
    g.lineTo(50, y0 + 56)
    g.closePath()
    g.fill()
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = THREE.SRGBColorSpace
  texCache.set('arch', t)
  return t
}

function rome(color: string): Tickable {
  const g = new THREE.Group()
  const A = 21
  const B = 16.5
  const H = 12
  const tex = archTexture().clone()
  tex.needsUpdate = true
  tex.repeat.set(60, 1)
  // outer ring, with a missing section on the south-east where the real wall collapsed in earthquakes
  const outer = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, H, 120, 1, true, rad(60), rad(290)).scale(A, 1, B).translate(0, H / 2, 0),
    new THREE.MeshBasicMaterial({ map: tex, color: 0x8a8a8a, side: THREE.DoubleSide }), // dimmed so bloom does not whiten it
  )
  g.add(outer)
  // the lower inner ring is visible through the gap
  const inner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.78, 0.78, H * 0.62, 96, 1, true).scale(A, 1, B).translate(0, H * 0.31, 0),
    new THREE.MeshBasicMaterial({ map: tex, color: 0x8a8a8a, side: THREE.DoubleSide }),
  )
  g.add(inner)
  // rim glow
  const rimPts = (k: number, h: number, a0 = 0, a1 = Math.PI * 2) =>
    Array.from({ length: 97 }, (_, i) => {
      const a = a0 + ((a1 - a0) * i) / 96
      return new THREE.Vector3(Math.cos(a) * A * k, h, Math.sin(a) * B * k)
    })
  g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(rimPts(1, H, rad(60), rad(350))), new THREE.LineBasicMaterial({ color })))
  g.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(rimPts(0.78, H * 0.62)), new THREE.LineBasicMaterial({ color })))
  // the arena floor, with the hypogeum glowing beneath
  const arena = new THREE.Mesh(new THREE.CircleGeometry(1, 48).scale(A * 0.62, B * 0.62, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x4a2f1a }))
  arena.position.y = 0.2
  g.add(arena)
  const hyp = new THREE.Mesh(new THREE.PlaneGeometry(A * 0.7, B * 0.3).rotateX(-Math.PI / 2), glowMat(0xff8a3c, 0.5))
  hyp.position.y = 0.25
  g.add(hyp)
  // a few columns of the Forum, standing and broken
  for (let i = 0; i < 6; i++) {
    const h = [6.5, 4.2, 6.5, 3, 6.5, 5][i]
    const col = cyl(0.55, 0.65, h, '#ffd9a8', 10, -26 + i * 2.6, 0, 10)
    g.add(col)
  }
  g.add(box(16, 0.7, 3.2, '#ffd9a8', -18, 6.5, 10))
  const flames: THREE.Sprite[] = []
  for (const [x, z] of [[-24, 4], [24, 8], [0, 22], [0, -22]] as const) {
    const f = glowSprite(0xffb36b, 4, 0.9)
    f.position.set(x, 3.2, z)
    g.add(cyl(0.2, 0.25, 3, '#6b4630', 6, x, 0, z), f)
    flames.push(f)
  }
  const halo = glowSprite(0xff8a3c, 64, 0.07)
  halo.position.y = 6
  g.add(halo)
  return {
    obj: g,
    tick: (t) => flames.forEach((f, i) => f.scale.setScalar(3.6 + Math.sin(t * 9 + i * 2) * 0.5)),
  }
}

// ───────────────────────────── Milan: the Duomo ─────────────────────────────

function milan(color: string): Tickable {
  const g = new THREE.Group()
  const MARBLE = '#ffe3f1'
  // nave
  g.add(litBox(13, 11, 26, MARBLE, color, 3).translateZ(-4))
  g.add(prism(13.4, 6, 26, MARBLE, 0, 11, -4))
  // facade with its five-door front and the pinnacled gable
  g.add(litBox(19, 15, 3.2, MARBLE, color, 3).translateZ(10.5))
  g.add(prism(19.4, 8, 3.4, MARBLE, 0, 15, 10.5))
  for (let i = 0; i < 6; i++) g.add(cone(0.55, 6.5, MARBLE, 4, -8.5 + i * 3.4, 0, 12.3))
  // the crossing tower and its golden Madonnina
  g.add(box(6, 7, 6, MARBLE, 0, 11, -5))
  g.add(cyl(1.8, 2.4, 6, MARBLE, 8, 0, 18, -5))
  g.add(cone(1.1, 13, MARBLE, 8, 0, 24, -5))
  const gold = glowSprite(0xffd27a, 3.2, 1)
  gold.position.set(0, 38.4, -5)
  g.add(gold)
  // the forest of spires along the roofline
  for (let i = 0; i < 8; i++) {
    for (const s of [-1, 1]) {
      g.add(cone(0.4, 4.4, MARBLE, 4, s * 6.6, 11, -14 + i * 3.2))
    }
  }
  // piazza
  g.add(new THREE.Mesh(new THREE.PlaneGeometry(26, 14).rotateX(-Math.PI / 2).translate(0, 0.08, 20), glowMat(0xff9ad5, 0.1)))
  const halo = glowSprite(0xff9ad5, 46, 0.2)
  halo.position.y = 12
  g.add(halo)
  return { obj: g, tick: (t) => gold.scale.setScalar(3 + Math.sin(t * 2.4) * 0.5) }
}

// ───────────────────────────── Monza and Zandvoort: F1 circuits ─────────────────────────────

const MONZA: P[] = [
  [-27, 2], [-27, -10], [-20, -19], [-6, -22], [8, -19], [12, -12], [20, -10], [26, -4], [28, 8], [24, 17], [14, 20],
  [3, 14], [-6, 17], [-14, 24], [-24, 21],
]

function monza(color: string): Tickable {
  const g = new THREE.Group()
  const { group, curve } = circuit(MONZA, 4.2)
  g.add(group)
  // start/finish straight: the first point, looking along the track
  const start = curve.getPointAt(0)
  const tan = curve.getTangentAt(0)
  const gan = gantry(color)
  gan.position.copy(start)
  gan.rotation.y = Math.atan2(tan.x, tan.z) + Math.PI / 2
  g.add(gan)
  const stand = grandstand(18, '#ff3b3b')
  stand.position.set(start.x - 8, 0, start.z + 4)
  stand.rotation.y = Math.PI / 2
  g.add(stand)
  // the royal park
  const rand = mulberry32(5)
  for (let i = 0; i < 26; i++) {
    const a = rand() * Math.PI * 2
    const r = 30 + rand() * 12
    g.add(tree().translateX(Math.cos(a) * r).translateZ(Math.sin(a) * r * 0.82))
  }
  const cars = [0xff2d3a, 0xffd23a, 0xf4f4f8].map((c) => racer(c))
  cars.forEach((c) => g.add(c))
  const tifosi = glowSprite(0xff2d3a, 70, 0.14)
  tifosi.position.y = 4
  g.add(tifosi)
  return { obj: g, tick: (t) => cars.forEach((c, i) => lap(curve, c, 0.07 + i * 0.004, i * 0.04, t)) }
}

const ZANDVOORT: P[] = [
  [-26, 8], [-26, -4], [-18, -14], [-6, -17], [2, -10], [12, -18], [24, -14], [28, -2], [22, 8], [12, 6], [4, 14], [-6, 22], [-18, 22],
]

function zandvoort(color: string): Tickable {
  const g = new THREE.Group()
  // the final banked corner (Arie Luyendyk bend) lies around the first control points
  const { group, curve } = circuit(ZANDVOORT, 4.2, (u) => (u > 0.93 || u < 0.07 ? rad(18) * Math.sin(((u + 0.07) % 1) * (Math.PI / 0.14)) : 0))
  g.add(group)
  const start = curve.getPointAt(0.02)
  const tan = curve.getTangentAt(0.02)
  const gan = gantry(color)
  gan.position.copy(start)
  gan.rotation.y = Math.atan2(tan.x, tan.z) + Math.PI / 2
  g.add(gan)
  // an orange grandstand, and dunes all around
  const stand = grandstand(18, '#ff7a1a')
  stand.position.set(start.x + 9, 0, start.z + 6)
  stand.rotation.y = -Math.PI / 2
  g.add(stand)
  const rand = mulberry32(12)
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2
    const r = 36 + rand() * 12
    const geo = new THREE.SphereGeometry(4 + rand() * 4, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.4, 0.7, 1)
    const dune = new THREE.Group()
    dune.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x6a5632, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })))
    dune.add(edges(geo, 0xffc27a, 0.7, 40))
    dune.position.set(Math.cos(a) * r, 0, Math.sin(a) * r * 0.8)
    g.add(dune)
  }
  // flags of the Orange Army
  for (let i = 0; i < 7; i++) {
    const p = curve.getPointAt(i / 7 + 0.05)
    const f = glowSprite(0xff7a1a, 3.4, 0.95)
    f.position.set(p.x * 1.18, 3, p.z * 1.18)
    g.add(cyl(0.08, 0.08, 3, '#e8f4ff', 4, p.x * 1.18, 0, p.z * 1.18), f)
  }
  // a Red Bull-style car laps the circuit, plus a rival
  const rb = createCar()
  rb.group.scale.setScalar(0.7)
  g.add(rb.group)
  const rival = racer(0xe8f4ff)
  g.add(rival)
  return {
    obj: g,
    tick: (t, dt) => {
      lap(curve, rb.group, 0.085, 0, t, 0.1)
      rb.update(dt, t, 55, 0)
      lap(curve, rival, 0.08, 0.93, t)
    },
  }
}

// ───────────────────────────── Amsterdam: canal houses and a windmill ─────────────────────────────

function amsterdam(color: string): Tickable {
  const g = new THREE.Group()
  const palette = ['#c0502d', '#f0a23a', '#3f78c9', '#d8d2c0', '#a8342f', '#4aa391', '#e8c468']
  const rand = mulberry32(8)
  const row = (z: number, face: number) => {
    let x = -22
    for (let i = 0; i < 8; i++) {
      const w = 2.6 + rand() * 1.4
      const h = 6 + rand() * 4
      const hs = townhouse(w, h, 4.2, palette[i % palette.length], palette[(i + 2) % palette.length], rand() < 0.5)
      hs.position.set(x + w / 2, 0, z)
      hs.rotation.y = face > 0 ? 0 : Math.PI
      // the famous lean: a couple of the houses tilt
      hs.rotation.z = (rand() - 0.5) * 0.05
      g.add(hs)
      x += w + 0.25
    }
  }
  row(-8, 1)
  row(8, -1)
  const canal = water(54, 9.5, [0.0, 0.85, 1.0])
  g.add(canal.mesh)
  // an arched bridge with a bicycle on it
  const bridge = new THREE.Mesh(new THREE.TorusGeometry(5, 0.3, 6, 20, Math.PI).rotateY(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xe8f4ff }))
  bridge.position.set(2, 0, 0)
  bridge.scale.set(1, 0.4, 1)
  g.add(bridge)
  const bike = new THREE.Group()
  for (const x of [-0.7, 0.7]) {
    const w = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 5, 14), new THREE.MeshBasicMaterial({ color: color }))
    w.position.set(x, 0.55, 0)
    bike.add(w)
  }
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.08), new THREE.MeshBasicMaterial({ color: 0xffffff }))
  frame.position.y = 0.95
  bike.add(frame)
  bike.position.set(2, 2.2, 0)
  g.add(bike)
  // the windmill
  const mill = new THREE.Group()
  mill.position.set(-4, 0, -28)
  mill.add(cyl(2.6, 4.2, 14, '#e8d8c0', 8), cone(3.1, 3.4, '#a8342f', 8, 0, 14))
  const blades = new THREE.Group()
  blades.position.set(0, 12, 3.2)
  for (let i = 0; i < 4; i++) {
    const b = box(0.5, 9.5, 0.12, '#f4f4f8', 0, 0, 0)
    b.position.y = 4.9
    const arm = new THREE.Group()
    arm.rotation.z = (i * Math.PI) / 2
    arm.add(b)
    blades.add(arm)
  }
  mill.add(blades)
  g.add(mill)
  // tulips
  for (let i = 0; i < 24; i++) {
    const x = 16 + (i % 6) * 1.4
    const z = -22 + Math.floor(i / 6) * 1.6
    const tl = cone(0.3, 0.8, ['#ff4d6d', '#ffb347', '#ff8ad8'][i % 3], 6, x, 0.4, z)
    g.add(tl)
  }
  return {
    obj: g,
    tick: (t) => {
      canal.tick(t)
      blades.rotation.z = t * 0.5
      bike.position.x = 2 + Math.sin(t * 0.5) * 7
      bike.position.y = 2.2 * (1 - Math.min(1, Math.abs(bike.position.x - 2) / 7) ** 2) + 0.2
    },
  }
}

// ───────────────────────────── Kraków: St Mary's, the Cloth Hall and the dragon ─────────────────────────────

function krakow(color: string): Tickable {
  const g = new THREE.Group()
  const BRICK = '#ff7a6a'
  // St Mary's: a long nave and two towers of unequal height
  g.add(litBox(9, 10, 20, BRICK, '#ffb0a0', 3).translateZ(-6))
  g.add(prism(9.4, 6, 20, BRICK, 0, 10, -6))
  g.add(litBox(4.6, 26, 4.6, BRICK, '#ffb0a0', 3).translateX(-3).translateZ(6))
  g.add(cone(2.9, 9, '#ffd27a', 8, -3, 26, 6))
  g.add(litBox(4.6, 18, 4.6, BRICK, '#ffb0a0', 3).translateX(3.6).translateZ(6))
  g.add(cyl(2.0, 2.8, 3, BRICK, 8, 3.6, 18, 6))
  g.add(cone(1.4, 4.2, '#ffd27a', 8, 3.6, 21, 6))
  // the Cloth Hall, a long arcaded market
  const hall = new THREE.Group()
  hall.add(litBox(28, 5.5, 7, '#ffd27a', '#ffe9a8', 2.6))
  hall.add(prism(28.4, 3.2, 7.2, '#ffd27a', 0, 5.5))
  for (let i = 0; i < 12; i++) hall.add(box(0.7, 3.6, 0.7, '#ffe9a8', -12.5 + i * 2.3, 0, 3.9))
  hall.position.set(0, 0, 22)
  g.add(hall)
  // the Wawel dragon on its mound, breathing fire
  const mound = cone(7, 5, '#5aff9d', 8, -26, 0, -8)
  g.add(mound)
  const dragon = new THREE.Group()
  dragon.position.set(-26, 5.2, -8)
  const segs: THREE.Mesh[] = []
  for (let i = 0; i < 6; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(1.4 - i * 0.14, 8, 6), new THREE.MeshBasicMaterial({ color: 0x1fd16a }))
    s.position.set(i * 1.5 - 2, 1.2 - i * 0.1, 0)
    dragon.add(s)
    segs.push(s)
  }
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.6, 6).rotateZ(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x2bff8a }))
  head.position.set(-4.4, 2, 0)
  dragon.add(head)
  for (const s of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.ConeGeometry(2.4, 5, 3).rotateX(s * 1.2), new THREE.MeshBasicMaterial({ color: 0x14a050, side: THREE.DoubleSide }))
    wing.position.set(-1, 2.6, s * 1.6)
    dragon.add(wing)
  }
  const fire = glowSprite(0xff7a1a, 6, 0.95)
  fire.position.set(-7, 2.2, 0)
  dragon.add(fire)
  g.add(dragon)
  // the trumpeter's tower, glowing on the hour
  const bell = glowSprite(0xffd27a, 12, 0.5)
  bell.position.set(-3, 32, 6)
  g.add(bell)
  return {
    obj: g,
    tick: (t) => {
      fire.scale.setScalar(4.2 + Math.abs(Math.sin(t * 1.3)) * 4)
      ;(fire.material as THREE.SpriteMaterial).opacity = 0.25 + 0.7 * Math.max(0, Math.sin(t * 1.3))
      dragon.rotation.y = Math.sin(t * 0.4) * 0.3
      bell.scale.setScalar(10 + Math.sin(t * 3) * 3 * Math.max(0, Math.sin(t * 0.6)))
      void color
    },
  }
}

// ───────────────────────────── Cologne: the Cathedral and the Hohenzollern Bridge ─────────────────────────────

function cologne(color: string): Tickable {
  const g = new THREE.Group()
  const STONE = '#9bb0ff'
  const GLOW = '#ffcf8a'
  // nave and transept (the cathedral is a cross, with the two towers at the front)
  g.add(litBox(10, 16, 30, STONE, GLOW, 3).translateZ(-6))
  g.add(prism(10.4, 7, 30, STONE, 0, 16, -6))
  g.add(litBox(28, 14, 8, STONE, GLOW, 3).translateZ(-8))
  g.add(prism(28.4, 5.5, 8.4, STONE, 0, 14, -8))
  g.add(cone(0.6, 13, STONE, 6, 0, 22, -8)) // the slender spirelet over the crossing
  // the chevet: a ring of tall chapels with flying buttresses
  for (let i = 0; i < 5; i++) {
    const a = ((i - 2) / 2) * 1.05
    const x = Math.sin(a) * 7.2
    const z = -23 - Math.cos(a) * 3.8
    g.add(cyl(2.2, 2.4, 13, STONE, 8, x, 0, z))
    g.add(cone(2.4, 7, STONE, 8, x, 13, z))
  }
  // the twin west towers with their openwork spires
  const spireWire: THREE.LineSegments[] = []
  for (const s of [-1, 1]) {
    const x = s * 5.4
    g.add(litBox(6.6, 30, 6.6, STONE, GLOW, 3).translateX(x).translateZ(11))
    g.add(box(7.4, 1, 7.4, STONE, x, 30, 11))
    g.add(cyl(3.0, 3.3, 7, STONE, 8, x, 31, 11))
    const sp = cone(3.1, 24, STONE, 8, x, 38, 11)
    g.add(sp)
    const w = wire(new THREE.ConeGeometry(3.1, 24, 16, 6), STONE, 0.5)
    w.position.set(x, 38 + 12, 11)
    g.add(w)
    spireWire.push(w)
    for (const [dx, dz] of [[-3, -3], [3, -3], [-3, 3], [3, 3]] as const) g.add(cone(0.4, 3.4, STONE, 4, x + dx, 30, 11 + dz))
    const gold = glowSprite(0xffd27a, 2.4, 0.9)
    gold.position.set(x, 63, 11)
    g.add(gold)
  }
  // my friend, waving from the top of the south tower
  const friend = createCharacter('friend')
  friend.group.scale.setScalar(0.72)
  friend.group.position.set(5.4, 31.1, 16.6)
  g.add(friend.group)
  g.add(box(4.4, 0.5, 3.6, STONE, 5.4, 30.5, 15.6)) // a little viewing balcony on the front of the tower
  const marker = glowSprite(0xffd27a, 5, 0.5)
  marker.position.set(5.4, 34, 16.6)
  g.add(marker)
  // the gabled west portal between the towers, with its rose window
  g.add(litBox(4.2, 18, 3.2, STONE, GLOW, 3).translateZ(13))
  g.add(prism(4.6, 5, 3.4, STONE, 0, 18, 13))
  const rose = glowSprite(0xffcf8a, 3.6, 0.9)
  rose.position.set(0, 13, 14.9)
  g.add(rose)
  // the Rhine and the Hohenzollern Bridge, hung with love locks
  const rhine = water(90, 12, [0.0, 0.8, 1.0])
  rhine.mesh.position.set(0, 0.06, -44) // behind the cathedral so the towers stay in clear view
  g.add(rhine.mesh)
  const bridge = new THREE.Group()
  bridge.position.set(0, 0, -44)
  for (let i = -1; i <= 1; i++) {
    const arc = new THREE.Mesh(new THREE.TorusGeometry(8.5, 0.35, 5, 18, Math.PI), new THREE.MeshBasicMaterial({ color: 0x5a6490 }))
    arc.position.set(i * 17, 0.8, 0)
    arc.rotation.y = 0
    bridge.add(arc)
  }
  bridge.add(box(54, 0.5, 3.4, '#5a6490', 0, 0.8, 0))
  const locks: THREE.Sprite[] = []
  const lockColors = [0xff4d6d, 0xffd23a, 0x4de3d1, 0xff8ad8, 0x8bdcff]
  for (let i = 0; i < 30; i++) {
    const l = glowSprite(lockColors[i % 5], 0.9, 0.85)
    l.position.set(-26 + i * 1.8, 1.9, i % 2 ? 1.7 : -1.7)
    bridge.add(l)
    locks.push(l)
  }
  g.add(bridge)
  const halo = glowSprite(0x8fa8ff, 60, 0.07)
  halo.position.y = 14
  g.add(halo)
  return {
    obj: g,
    tick: (t, dt) => {
      rhine.tick(t)
      friend.update(dt, t, 0, true)
      rose.scale.setScalar(3.4 + Math.sin(t * 2.2) * 0.4)
      locks.forEach((l, i) => ((l.material as THREE.SpriteMaterial).opacity = 0.45 + 0.4 * Math.max(0, Math.sin(t * 1.7 + i * 0.9))))
      void color
      void spireWire
    },
  }
}

// ───────────────────────────── Porto: the Dom Luís I bridge ─────────────────────────────

function porto(color: string): Tickable {
  const g = new THREE.Group()
  const river = water(70, 16, [0.0, 0.7, 1.0])
  river.mesh.position.set(0, 0.06, 6)
  g.add(river.mesh)
  // the great arch carries a high deck over its crown and a low deck at the foot, like the real bridge
  const R = 19
  const arch = new THREE.Mesh(new THREE.TorusGeometry(R, 0.65, 6, 40, Math.PI), new THREE.MeshBasicMaterial({ color }))
  arch.scale.set(1, 0.62, 1)
  arch.position.set(0, 1.5, 6)
  g.add(arch)
  const arch2 = arch.clone()
  arch2.position.z = 9
  g.add(arch2)
  const upper = box(R * 2 + 12, 0.8, 3.4, color, 0, 17, 7.5)
  g.add(upper)
  const lower = box(R * 2 - 6, 0.7, 3.4, color, 0, 5, 7.5)
  g.add(lower)
  // verticals between arch and upper deck
  for (let i = -6; i <= 6; i++) {
    const x = (i * R) / 6.4
    const y = Math.sqrt(Math.max(0, 1 - (x / R) ** 2)) * R * 0.62 + 1.5
    if (y < 16.6) g.add(box(0.18, 16.6 - y, 0.18, color, x, y, 6))
  }
  // the hillside of Ribeira: stacked, colourful houses
  const rand = mulberry32(31)
  const cols = ['#ff8a5c', '#ffd27a', '#5aa8ff', '#ff6f91', '#7de3c8']
  for (let r = 0; r < 4; r++) {
    for (let i = 0; i < 9; i++) {
      const h = 3 + rand() * 2
      const b = litBox(2.5, h, 2.5, cols[(i + r) % cols.length], cols[(i + r) % cols.length], 1.6)
      b.position.set(-22 + i * 2.8 + rand(), 2.5 + r * 2.2, -16 - r * 2.6)
      g.add(b)
    }
  }
  // port barrels and a rabelo boat
  for (let i = 0; i < 4; i++) g.add(cyl(0.9, 0.9, 1.6, '#b0703a', 10, 24 + (i % 2) * 1.8, 0, 14 + Math.floor(i / 2) * 1.8))
  const boat = new THREE.Group()
  boat.add(box(5, 0.7, 1.4, '#c98a4a'), cone(0.1, 6, '#e8f4ff', 4, 0.5, 0.7).translateY(2.9))
  const sail = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.8), new THREE.MeshBasicMaterial({ color: 0x8e96b4, side: THREE.DoubleSide, transparent: true, opacity: 0.7 }))
  sail.position.set(0.5, 3.1, 0)
  boat.add(sail)
  boat.position.y = 0.2
  g.add(boat)
  return {
    obj: g,
    tick: (t) => {
      river.tick(t)
      boat.position.x = Math.sin(t * 0.25) * 24
      boat.position.z = 8 + Math.cos(t * 0.25) * 2
      boat.rotation.y = Math.cos(t * 0.25) > 0 ? 0 : Math.PI
    },
  }
}

// ───────────────────────────── Oslo: the Opera House ─────────────────────────────

function oslo(color: string): Tickable {
  const g = new THREE.Group()
  const WHITE = '#e8f4ff'
  // fjord to the south
  const fjord = water(70, 24, [0.0, 0.8, 1.0])
  fjord.mesh.position.set(0, 0.06, 22)
  g.add(fjord.mesh)
  // the glass foyer and the stage tower
  g.add(litBox(30, 7, 14, '#9fe8ff', '#9fe8ff', 3).translateZ(0))
  g.add(litBox(10, 20, 10, WHITE, '#bfe4ff', 3.2).translateZ(-12))
  // the roof: white marble slabs that slope from the water up to the fly-tower
  const slab = (w: number, d: number, y0: number, y1: number, z: number) => {
    const len = Math.hypot(d, y1 - y0)
    const m = neonMesh(new THREE.BoxGeometry(w, 0.7, len), WHITE, 20)
    m.position.set(0, (y0 + y1) / 2, z)
    m.rotation.x = Math.atan2(y1 - y0, d) * -1 // rises toward −z
    return m
  }
  g.add(slab(30, 10, 0.4, 7, 8)) // from the quay up to the roof edge
  g.add(slab(30, 14, 7.2, 12, -1))
  g.add(slab(18, 8, 9, 14, -4))
  // the ice-floe sculpture in the water
  const floe = neonMesh(new THREE.IcosahedronGeometry(3, 0), color, 20)
  floe.position.set(-14, 1.4, 20)
  g.add(floe)
  // people strolling up the roof
  const walkers: THREE.Sprite[] = []
  for (let i = 0; i < 7; i++) {
    const w = glowSprite(0xffd27a, 1.3, 0.9)
    g.add(w)
    walkers.push(w)
  }
  return {
    obj: g,
    tick: (t) => {
      fjord.tick(t)
      floe.rotation.y = t * 0.2
      floe.position.y = 1.4 + Math.sin(t * 0.8) * 0.3
      walkers.forEach((w, i) => {
        const u = (t * 0.05 + i / walkers.length) % 1
        w.position.set(-12 + ((i * 7) % 24), 0.9 + u * 11.6, 9 - u * 22)
      })
    },
  }
}

// ───────────────────────────── Bruges: the Belfry ─────────────────────────────

function bruges(color: string): Tickable {
  const g = new THREE.Group()
  const BRICK = '#ffd27a'
  // the Halle and the Belfry rising from its centre
  g.add(litBox(24, 8, 8, BRICK, '#ffe9a8', 2.4).translateZ(-6))
  g.add(prism(24.4, 4, 8.4, BRICK, 0, 8, -6))
  g.add(litBox(7, 22, 7, BRICK, '#ffe9a8', 2.6).translateZ(-6))
  g.add(box(5.2, 3, 5.2, BRICK, 0, 22, -6))
  g.add(cyl(2.3, 2.5, 5, BRICK, 8, 0, 25, -6))
  g.add(cone(2.5, 5, '#ffe9a8', 8, 0, 30, -6))
  for (const [x, z] of [[-2.8, -8.8], [2.8, -8.8], [-2.8, -3.2], [2.8, -3.2]] as const) g.add(cone(0.55, 3, BRICK, 6, x, 22, z))
  const bells = glowSprite(0xffd27a, 8, 0.7)
  bells.position.set(0, 27.5, -6)
  g.add(bells)
  // the Markt: stepped-gable guild houses on both flanks
  const pal = ['#c0502d', '#e8c468', '#4aa391', '#d8d2c0', '#a8342f', '#ffb7c5']
  for (let i = 0; i < 5; i++) {
    const h = townhouse(3.4, 6 + (i % 3) * 1.5, 4, pal[i % pal.length], pal[(i + 3) % pal.length], true)
    h.position.set(-28 + i * 3.7, 0, 8)
    g.add(h)
    const h2 = townhouse(3.4, 6 + ((i + 1) % 3) * 1.5, 4, pal[(i + 2) % pal.length], pal[(i + 4) % pal.length], true)
    h2.position.set(10 + i * 3.7, 0, 8)
    g.add(h2)
  }
  // a ring canal with a swan
  const canal = water(60, 6, [0.0, 0.85, 1.0])
  canal.mesh.position.set(0, 0.06, 20)
  g.add(canal.mesh)
  const swan = new THREE.Group()
  swan.add(new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 6).scale(1.4, 0.8, 0.9), new THREE.MeshBasicMaterial({ color: 0x9aa2c0 })))
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 1.6, 6), new THREE.MeshBasicMaterial({ color: 0x9aa2c0 }))
  neck.position.set(1, 1.1, 0)
  neck.rotation.z = -0.3
  swan.add(neck)
  const swanHead = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 5).rotateZ(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff8a3c }))
  swanHead.position.set(1.5, 1.9, 0)
  swan.add(swanHead)
  swan.position.y = 0.6
  g.add(swan)
  return {
    obj: g,
    tick: (t) => {
      canal.tick(t)
      swan.position.x = Math.sin(t * 0.3) * 22
      swan.position.z = 20
      swan.rotation.y = Math.cos(t * 0.3) > 0 ? 0 : Math.PI
      bells.scale.setScalar(7 + Math.sin(t * 2.2) * 1.6)
      void color
    },
  }
}

// ───────────────────────────── Ohrid: St John at Kaneo above the lake ─────────────────────────────

function ohrid(color: string): Tickable {
  const g = new THREE.Group()
  // the lake, one of the oldest in Europe
  const lake = water(80, 40, [0.0, 0.95, 0.85])
  lake.mesh.position.set(0, 0.06, 22)
  g.add(lake.mesh)
  // the cliff
  const cliff = neonMesh(new THREE.DodecahedronGeometry(10, 0).scale(1.4, 0.9, 1.1), '#b89a7a', 30)
  cliff.position.set(0, 4, 0)
  g.add(cliff)
  // the church: cross-in-square body, drum and dome, terracotta roof
  const ch = new THREE.Group()
  ch.position.y = 8.6
  ch.add(litBox(5.4, 3.6, 5.4, '#ffe9d0', '#ffd27a', 1.8))
  ch.add(cyl(1.7, 1.9, 2.4, '#ffe9d0', 12, 0, 3.6))
  const dome = neonMesh(new THREE.SphereGeometry(1.7, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), '#ff8a5c', 30)
  dome.position.y = 6
  ch.add(dome)
  ch.add(box(2.4, 2.4, 3.2, '#ffe9d0', 0, 0, -3.6)) // the apse
  ch.add(box(0.12, 1.3, 0.12, '#ffd27a', 0, 7.7, 0))
  g.add(ch)
  // Samuel's fortress on the hill behind
  const wall = new THREE.Group()
  for (let i = 0; i < 9; i++) {
    const w = box(4.2, 5 + (i % 2) * 0.8, 1.6, '#b89a7a', -17 + i * 4.2, 0, 0)
    wall.add(w)
    wall.add(box(0.9, 1, 1.8, '#b89a7a', -17 + i * 4.2, 5.2 + (i % 2) * 0.8, 0))
  }
  wall.position.set(0, 0, -22)
  g.add(wall)
  g.add(cyl(2.4, 2.8, 11, '#b89a7a', 8, -22, 0, -22), cyl(2.4, 2.8, 11, '#b89a7a', 8, 22, 0, -22))
  // mountains across the water (Galičica)
  for (let i = 0; i < 5; i++) g.add(cone(7, 12 + (i % 3) * 5, '#4de3d1', 6, -32 + i * 16, 0, -42))
  // the Ohrid pearl: glints on the water
  const pearls: THREE.Sprite[] = []
  for (let i = 0; i < 10; i++) {
    const p = glowSprite(0xffffff, 1.4, 0.8)
    p.position.set(-26 + i * 5.8, 0.5, 14 + (i % 3) * 6)
    g.add(p)
    pearls.push(p)
  }
  return {
    obj: g,
    tick: (t) => {
      lake.tick(t)
      pearls.forEach((p, i) => ((p.material as THREE.SpriteMaterial).opacity = 0.2 + 0.7 * Math.max(0, Math.sin(t * 1.4 + i * 1.9))))
      void color
    },
  }
}

// ───────────────────────────── Lucerne: the Chapel Bridge and Mount Rigi ─────────────────────────────

function luzern(color: string): Tickable {
  const g = new THREE.Group()
  const WOOD = '#c47a4a'
  // lake
  const lake = water(70, 32, [0.0, 0.8, 1.0])
  lake.mesh.position.set(0, 0.06, 4)
  g.add(lake.mesh)
  // the covered Chapel Bridge, with its octagonal Water Tower
  const bridge = new THREE.Group()
  bridge.add(box(34, 0.7, 3, WOOD, 0, 0.6, 0))
  bridge.add(prism(3.8, 2.6, 34, WOOD, 0, 2.4, 0).rotateY(Math.PI / 2))
  for (let i = 0; i < 9; i++) bridge.add(box(0.3, 2, 0.3, WOOD, -16 + i * 4, 1, 1.4), box(0.3, 2, 0.3, WOOD, -16 + i * 4, 1, -1.4))
  for (let i = -2; i <= 2; i++) bridge.add(box(0.7, 1.2, 0.7, '#6b4a2a', i * 7, -0.5, 0))
  bridge.position.set(0, 0, 4)
  g.add(bridge)
  g.add(cyl(3.2, 3.5, 12, '#d8d2c0', 8, 6, 0, 4))
  g.add(cone(3.8, 5, '#a8342f', 8, 6, 12, 4))
  // Mount Rigi, the Queen of the Mountains, with its snow cap and the old cog railway
  const rigi = neonMesh(new THREE.ConeGeometry(24, 40, 9), '#7fb8ff', 20)
  rigi.position.set(0, 20, -34)
  g.add(rigi)
  g.add(cone(7.6, 13, '#ffffff', 9, 0, 27, -34))
  const lineA = new THREE.Vector3(10, 0.6, -14)
  const lineB = new THREE.Vector3(0.6, 38.8, -33)
  const rail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(lineA, lineB), 20, 0.16, 4), new THREE.MeshBasicMaterial({ color: 0xffd27a }))
  g.add(rail)
  const train = new THREE.Group()
  train.add(box(2.2, 1.2, 1.4, '#ff2d3a'))
  g.add(train)
  const flag = glowSprite(0xff2d3a, 3, 1)
  flag.position.set(0, 41.5, -34)
  g.add(flag, box(0.12, 3, 0.12, '#e8f4ff', 0, 38.6, -34))
  // chalets along the shore
  for (let i = 0; i < 5; i++) {
    const h = litBox(3.2, 3, 3, '#ffb36b', '#ffb36b', 1.6)
    h.position.set(-26 + i * 4.2, 0, 22)
    g.add(h, prism(3.6, 2, 3.2, '#ff4d4d', -26 + i * 4.2, 3, 22))
  }
  return {
    obj: g,
    tick: (t) => {
      lake.tick(t)
      const u = (Math.sin(t * 0.25) + 1) / 2
      train.position.lerpVectors(lineA, lineB, u)
      train.position.y += 0.7
      train.rotation.x = -Math.atan2(lineB.y - lineA.y, Math.hypot(lineB.x - lineA.x, lineB.z - lineA.z)) * 0.9
      train.rotation.y = Math.atan2(lineB.x - lineA.x, lineB.z - lineA.z)
      flag.scale.setScalar(2.6 + Math.sin(t * 2.2) * 0.5)
      void color
    },
  }
}

export function buildTourLandmark(id: string, color: string): Tickable | null {
  switch (id) {
    case 'rome':
      return rome(color)
    case 'milan':
      return milan(color)
    case 'monza':
      return monza(color)
    case 'amsterdam':
      return amsterdam(color)
    case 'zandvoort':
      return zandvoort(color)
    case 'krakow':
      return krakow(color)
    case 'porto':
      return porto(color)
    case 'oslo':
      return oslo(color)
    case 'bruges':
      return bruges(color)
    case 'cologne':
      return cologne(color)
    case 'ohrid':
      return ohrid(color)
    case 'luzern':
      return luzern(color)
    default:
      return null
  }
}
