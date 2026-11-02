import * as THREE from 'three'
import { type Tickable, edges, glowMat, glowSprite, mulberry32 } from './fx'
import { type P, GROUND_Y, isLand, ll, llA, mt } from './geo'

// ───────────────────────────── seagulls ─────────────────────────────

interface Flock {
  cx: number
  cz: number
  r: number
  count: number
  h: number
  /** when set, the flock orbits the player instead */
  follow?: boolean
}

function gullGeometry(): THREE.BufferGeometry {
  // local +x is forward. attribute "wing": 0 at the body, 1 at the wing tips (drives the flap)
  const pos: number[] = []
  const wing: number[] = []
  const tri = (a: number[], b: number[], c: number[], wa: number, wb: number, wc: number) => {
    pos.push(...a, ...b, ...c)
    wing.push(wa, wb, wc)
  }
  // body
  tri([0.9, 0, 0], [0, 0, 0.17], [-0.9, 0, 0], 0, 0, 0)
  tri([0.9, 0, 0], [-0.9, 0, 0], [0, 0, -0.17], 0, 0, 0)
  for (const s of [-1, 1]) {
    const A = [0.35, 0, s * 0.12]
    const B = [-0.45, 0, s * 0.12]
    const C = [0.12, 0, s * 0.95]
    const D = [-0.34, 0, s * 0.95]
    const E = [-0.1, 0, s * 1.85]
    tri(A, B, C, 0, 0, 0.5)
    tri(B, D, C, 0, 0.5, 0.5)
    tri(C, D, E, 0.5, 0.5, 1)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('wing', new THREE.Float32BufferAttribute(wing, 1))
  return g
}

export function createGulls(): Tickable & { setFollow(x: number, z: number): void } {
  const flocks: Flock[] = [
    { cx: -57, cz: 22, r: 55, count: 9, h: 17 }, // Galata / Golden Horn mouth
    { cx: 110, cz: -45, r: 70, count: 8, h: 24 }, // Bosphorus Bridge
    { cx: 34, cz: 44, r: 45, count: 6, h: 15 }, // Maiden's Tower
    { cx: -44, cz: 74, r: 40, count: 5, h: 16 }, // Sarayburnu
    { cx: 92, cz: 165, r: 50, count: 5, h: 15 }, // Moda
    { cx: 120, cz: -150, r: 70, count: 5, h: 22 }, // upper strait
    { cx: mt(130, -30)[0], cz: mt(130, -30)[1], r: 60, count: 8, h: 17 }, // Valletta harbour
    { cx: mt(0, -80)[0], cz: mt(0, -80)[1], r: 50, count: 4, h: 15 }, // Sliema
    { cx: 0, cz: 0, r: 30, count: 3, h: 24, follow: true }, // a few that tag along with you
  ]
  const total = flocks.reduce((n, f) => n + f.count, 0)
  const rand = mulberry32(11)

  const mat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    fog: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute float wing; varying float vWing; varying float vLight; uniform float uTime;
      float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main(){
        vec3 p = position;
        float ph = 0.0;
        mat4 im = mat4(1.0);
        #ifdef USE_INSTANCING
          im = instanceMatrix;
          ph = h21(instanceMatrix[3].xz) * 6.28;
        #endif
        p.y += wing * sin(uTime * 8.5 + ph) * 0.62 + wing * 0.18;
        vWing = wing;
        vec4 w = modelMatrix * im * vec4(p, 1.0);
        vLight = 0.82 + 0.18 * sin(uTime * 8.5 + ph);
        gl_Position = projectionMatrix * viewMatrix * w;
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vWing; varying float vLight;
      void main(){
        vec3 c = mix(vec3(0.85, 0.93, 1.0), vec3(1.0), vWing * 0.4) * vLight;
        c = mix(c, vec3(0.12, 0.14, 0.2), smoothstep(0.82, 1.0, vWing) * 0.9);
        gl_FragColor = vec4(c * 0.78, 1.0);
      }
    `,
  })
  const mesh = new THREE.InstancedMesh(gullGeometry(), mat, total)
  mesh.frustumCulled = false

  interface Gull {
    f: Flock
    th: number
    w: number
    r: number
    h: number
    bob: number
    squash: number
  }
  const gulls: Gull[] = []
  for (const f of flocks) {
    for (let i = 0; i < f.count; i++) {
      gulls.push({
        f,
        th: rand() * Math.PI * 2,
        w: (0.16 + rand() * 0.16) * (rand() < 0.5 ? -1 : 1) * (f.follow ? 2.2 : 1),
        r: f.r * (0.55 + rand() * 0.6),
        h: f.h + (rand() - 0.5) * 6,
        bob: rand() * 6,
        squash: 0.65 + rand() * 0.3,
      })
    }
  }

  const m = new THREE.Matrix4()
  const qy = new THREE.Quaternion()
  const qr = new THREE.Quaternion()
  const up = new THREE.Vector3(0, 1, 0)
  const fwd = new THREE.Vector3(1, 0, 0)
  const sc = new THREE.Vector3(1.1, 1.1, 1.1)
  const p = new THREE.Vector3()
  let fx = 0
  let fz = 0
  let ready = false

  return {
    obj: mesh,
    setFollow(x, z) {
      if (!ready) {
        fx = x
        fz = z
        ready = true
      }
      fx += (x - fx) * 0.04
      fz += (z - fz) * 0.04
    },
    tick: (t, dt) => {
      mat.uniforms.uTime.value = t
      gulls.forEach((g, i) => {
        g.th += g.w * dt
        const cx = g.f.follow ? fx : g.f.cx
        const cz = g.f.follow ? fz : g.f.cz
        const x = cx + Math.cos(g.th) * g.r
        const z = cz + Math.sin(g.th) * g.r * g.squash
        const dx = -Math.sin(g.th) * g.r * Math.sign(g.w)
        const dz = Math.cos(g.th) * g.r * g.squash * Math.sign(g.w)
        const yaw = Math.atan2(-dz, dx)
        qy.setFromAxisAngle(up, yaw)
        qr.setFromAxisAngle(fwd, -Math.sign(g.w) * 0.42 + Math.sin(t * 1.3 + g.bob) * 0.08)
        qy.multiply(qr)
        p.set(x, GROUND_Y + g.h + Math.sin(t * 0.9 + g.bob) * 1.4, z)
        m.compose(p, qy, sc)
        mesh.setMatrixAt(i, m)
      })
      mesh.instanceMatrix.needsUpdate = true
    },
  }
}

// ───────────────────────────── ferries ─────────────────────────────

interface Lane {
  /** waypoints through open water (checked against the coastline in dev) */
  pts: P[]
  speed: number
  offset: number
  size: number
}

/** Every ambient ferry route. Each waypoint must be water: boats on land look broken. */
export const FERRY_LANES: Lane[] = [
  { pts: [ll(28.9985, 41.0312), llA(29.0135, 41.0268)], speed: 14, offset: 0, size: 1.0 }, // Kabataş ⇄ Üsküdar
  { pts: [ll(28.9865, 41.0195), llA(29.022, 40.9955)], speed: 17, offset: 0.4, size: 1.1 }, // Eminönü ⇄ Kadıköy
  { pts: [ll(29.0135, 41.0408), llA(29.0215, 41.0315)], speed: 13, offset: 0.7, size: 0.95 }, // Beşiktaş ⇄ Üsküdar
  { pts: [ll(29.0405, 41.0535), llA(29.0515, 41.0545)], speed: 12, offset: 0.2, size: 0.9 }, // Ortaköy ⇄ Çengelköy
  // the Bosphorus cruise follows the middle of the strait (a straight line would run up the European shore)
  { pts: [ll(28.9915, 41.0215), ll(29.0125, 41.0345), ll(29.0395, 41.0465), ll(29.0575, 41.0735)], speed: 16, offset: 0.55, size: 1.15 },
  { pts: [mt(75, -36), mt(55, -90), mt(40, -130)], speed: 12, offset: 0.3, size: 0.9 }, // Malta: Marsamxett harbour out to sea
]

function lanePoint(pts: P[], cum: number[], s: number): { x: number; z: number; tx: number; tz: number } {
  let i = 1
  while (i < cum.length - 1 && cum[i] < s) i++
  const seg = cum[i] - cum[i - 1] || 1
  const k = Math.max(0, Math.min(1, (s - cum[i - 1]) / seg))
  const [ax, az] = pts[i - 1]
  const [bx, bz] = pts[i]
  return { x: ax + (bx - ax) * k, z: az + (bz - az) * k, tx: bx - ax, tz: bz - az }
}

export function ferryModel(size: number): THREE.Group {
  const g = new THREE.Group()
  const hull = new THREE.Mesh(new THREE.BoxGeometry(7.4, 1.1, 2.2), new THREE.MeshBasicMaterial({ color: 0x0a1030 }))
  hull.position.y = 0.55
  g.add(hull, edges(hull.geometry, 0x00f0ff, 1))
  edgesFix(g, hull)
  const deck = new THREE.Mesh(new THREE.BoxGeometry(5.0, 1.0, 1.8), new THREE.MeshBasicMaterial({ color: 0x151a45 }))
  deck.position.set(-0.3, 1.6, 0)
  g.add(deck, edges(deck.geometry, 0xe8f4ff, 0.9))
  edgesFix(g, deck)
  // lit windows
  const win = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.38), glowMat(0xffd27a, 0.95))
  win.position.set(-0.3, 1.7, 0.91)
  const win2 = win.clone()
  win2.position.z = -0.91
  win2.rotation.y = Math.PI
  g.add(win, win2)
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 1.4), new THREE.MeshBasicMaterial({ color: 0x151a45 }))
  bridge.position.set(1.4, 2.5, 0)
  g.add(bridge, edges(bridge.geometry, 0xe8f4ff, 0.9))
  edgesFix(g, bridge)
  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 1.5, 10), new THREE.MeshBasicMaterial({ color: 0xff2bd6 }))
  funnel.position.set(-1.6, 2.6, 0)
  g.add(funnel)
  const red = glowSprite(0xff2040, 1.5, 0.9)
  red.position.set(2.2, 1.4, 1.1)
  const green = glowSprite(0x20ff60, 1.5, 0.9)
  green.position.set(2.2, 1.4, -1.1)
  const mast = glowSprite(0xffffff, 2.2, 0.9)
  mast.position.set(1.4, 3.3, 0)
  g.add(red, green, mast)
  g.scale.setScalar(size)
  return g
}
// the hull/deck helpers above add edges at the origin; move them to match the mesh they outline
function edgesFix(g: THREE.Group, m: THREE.Mesh) {
  const e = g.children[g.children.length - 1]
  e.position.copy(m.position)
}

export function createFerries(): Tickable {
  const lanes = FERRY_LANES
  const cums = lanes.map((l) => {
    const c = [0]
    for (let i = 1; i < l.pts.length; i++) c.push(c[i - 1] + Math.hypot(l.pts[i][0] - l.pts[i - 1][0], l.pts[i][1] - l.pts[i - 1][1]))
    return c
  })
  if (import.meta.env.DEV) {
    lanes.forEach((l, i) => {
      const len = cums[i][cums[i].length - 1]
      for (let s = 0; s <= len; s += 4) {
        const p = lanePoint(l.pts, cums[i], s)
        if (isLand(p.x, p.z)) return void console.warn(`[map] ferry lane ${i} runs over land at`, p.x.toFixed(0), p.z.toFixed(0))
      }
    })
  }
  const g = new THREE.Group()
  const boats = lanes.map((l) => {
    const m = ferryModel(l.size)
    g.add(m)
    const wake = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 3.4).rotateX(-Math.PI / 2).translate(-9.5, 0, 0),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        fog: false,
        vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: /* glsl */ `varying vec2 vUv; void main(){ float x = vUv.x; float edge = 1.0 - abs(vUv.y - 0.5) * 2.0; float a = pow(x, 1.4) * edge * 0.5; gl_FragColor = vec4(vec3(0.55, 0.9, 1.0) * a, a); }`,
      }),
    )
    wake.position.y = 0.06
    m.add(wake)
    return m
  })

  return {
    obj: g,
    tick: (t) => {
      lanes.forEach((l, i) => {
        const cum = cums[i]
        const len = cum[cum.length - 1]
        const period = (len / l.speed) * 2 + 4
        const s = (((t + l.offset * period) % period) + period) % period
        const travel = len / l.speed
        // ease at the ends, hold at the piers for a couple of seconds
        let u: number
        let dir = 1
        if (s < travel) u = s / travel
        else if (s < travel + 2) u = 1
        else if (s < travel * 2 + 2) {
          u = 1 - (s - travel - 2) / travel
          dir = -1
        } else u = 0
        const e = u * u * (3 - 2 * u)
        const pt = lanePoint(l.pts, cum, e * len)
        const m = boats[i]
        m.position.set(pt.x, 0.1 + Math.sin(t * 1.4 + i) * 0.06, pt.z)
        // boat's local +x is its bow
        const hx = pt.tx * dir
        const hz = pt.tz * dir
        m.rotation.y = Math.atan2(-hz, hx)
        m.rotation.z = Math.sin(t * 1.1 + i * 2) * 0.03
        const moving = (dir === 1 ? s < travel : s > travel + 2 && s < travel * 2 + 2) ? 1 : 0
        m.children[m.children.length - 1].visible = !!moving
      })
    },
  }
}
