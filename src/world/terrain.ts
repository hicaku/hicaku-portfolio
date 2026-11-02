import * as THREE from 'three'
import { BG, glowMat, mulberry32 } from './fx'
import { LITE } from './quality'
import {
  GROUND_Y,
  type P,
  bridges,
  distToEdge,
  inPoly,
  landmasses,
  IST_BOUNDS,
  makePoly,
  regionOfLandmass,
} from './geo'
import { GLSL_GRID, GLSL_HASH, fogMaterial } from './shaders'
import { ROUTE_AS, ROUTE_EU, ROUTE_MT, SPAWN, allZones, scenics } from './zones'

type Updater = (t: number, px: number, pz: number) => void
const updaters: Updater[] = []
export const terrainTick: Updater = (t, px, pz) => updaters.forEach((u) => u(t, px, pz))
export const resetTerrain = () => (updaters.length = 0)

const bgColor = new THREE.Color(BG)

// ───────────────────────────── water ─────────────────────────────

// covers Istanbul, Malta and the world-tour archipelago far to the south
const MASK = { minX: -2900, minZ: -2400, size: 5600 }

export function buildWater(): THREE.Mesh {
  const N = LITE ? 1536 : 3072
  const c = document.createElement('canvas')
  c.width = c.height = N
  const g = c.getContext('2d')!
  g.fillStyle = '#000'
  g.fillRect(0, 0, N, N)
  const k = N / MASK.size
  g.globalCompositeOperation = 'lighter'
  g.lineJoin = 'round'
  g.lineCap = 'round'
  const widths = [90, 60, 40, 24, 12] // a touch wider: the mask is lower resolution than it was
  const alphas = [0.06, 0.09, 0.12, 0.16, 0.22]
  for (const l of landmasses) {
    g.beginPath()
    l.pts.forEach(([x, z], i) => {
      const px = (x - MASK.minX) * k
      const py = (z - MASK.minZ) * k
      if (i) g.lineTo(px, py)
      else g.moveTo(px, py)
    })
    g.closePath()
    widths.forEach((w, i) => {
      g.lineWidth = w * k
      g.strokeStyle = `rgba(255,255,255,${alphas[i]})`
      g.stroke()
    })
  }
  const tex = new THREE.CanvasTexture(c)
  tex.flipY = false
  tex.minFilter = THREE.LinearFilter
  tex.generateMipmaps = false

  const mat = fogMaterial({
    uniforms: {
      uMask: { value: tex },
      uTime: { value: 0 },
      uPlayer: { value: new THREE.Vector2() },
      uMin: { value: new THREE.Vector2(MASK.minX, MASK.minZ) },
      uSize: { value: MASK.size },
      uBg: { value: bgColor.clone() },
    },
    fragment: /* glsl */ `
      uniform sampler2D uMask; uniform float uTime; uniform vec2 uPlayer; uniform vec2 uMin; uniform float uSize; uniform vec3 uBg;
      ${GLSL_HASH}
      void main(){
        vec2 p = vW.xz;
        float shore = texture2D(uMask, (p - uMin) / uSize).r;
        float w1 = sin(p.x * 0.10 + uTime * 0.55 + sin(p.y * 0.06 + uTime * 0.3) * 2.2);
        float w2 = sin(p.y * 0.12 - uTime * 0.45 + sin(p.x * 0.08 - uTime * 0.2) * 2.0);
        float w3 = sin((p.x + p.y) * 0.17 + uTime * 0.8);
        float lines = smoothstep(1.05, 1.55, w1 + w2 + w3 * 0.6);
        vec3 deep = vec3(0.012, 0.018, 0.07);
        vec3 shallow = vec3(0.02, 0.16, 0.30);
        vec3 col = mix(deep, shallow, smoothstep(0.0, 0.9, shore));
        col += vec3(0.0, 0.75, 1.0) * lines * (0.06 + 0.22 * shore);
        col += vec3(0.0, 0.9, 1.0) * pow(shore, 3.0) * 0.28;
        // small round glints
        vec2 sp = p * 0.8;
        vec2 cell = floor(sp);
        float h = hash21(cell);
        float r = length(fract(sp) - 0.5);
        float tw = step(0.93, h) * smoothstep(0.2, 0.0, r) * (0.5 + 0.5 * sin(uTime * 2.4 + h * 60.0));
        col += vec3(0.5, 0.85, 1.0) * tw * 0.55;
        float d = distance(p, uPlayer);
        col = mix(col, uBg, smoothstep(520.0, 1300.0, d));
        gl_FragColor = vec4(col, 1.0);
        #include <fog_fragment>
      }
    `,
  })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000).rotateX(-Math.PI / 2), mat)
  mesh.position.y = 0
  updaters.push((t, px, pz) => {
    mat.uniforms.uTime.value = t
    mat.uniforms.uPlayer.value.set(px, pz)
  })
  return mesh
}

// ───────────────────────────── land ─────────────────────────────

export function buildLand(): THREE.Group {
  const group = new THREE.Group()

  const top = fogMaterial({
    uniforms: { uTime: { value: 0 }, uPlayer: { value: new THREE.Vector2() } },
    fragment: /* glsl */ `
      uniform float uTime; uniform vec2 uPlayer;
      ${GLSL_HASH}
      ${GLSL_GRID}
      void main(){
        vec2 p = vW.xz;
        float d = distance(p, uPlayer);
        float block = hash21(floor(p / 16.0));
        float minor = grid(p, 16.0, 0.9);
        float major = grid(p, 80.0, 1.4);
        vec3 col = vec3(0.03, 0.02, 0.09) + vec3(0.008, 0.006, 0.03) * block;
        col += vec3(0.05, 0.22, 0.36) * minor * 0.15;
        col += vec3(0.45, 0.16, 0.70) * major * 0.20;
        col += vec3(0.0, 0.45, 0.65) * exp(-d / 38.0) * 0.07;
        gl_FragColor = vec4(col, 1.0);
        #include <fog_fragment>
      }
    `,
  })
  updaters.push((t, px, pz) => {
    top.uniforms.uTime.value = t
    top.uniforms.uPlayer.value.set(px, pz)
  })
  const side = new THREE.MeshBasicMaterial({ color: 0x120a35 })

  for (const l of landmasses) {
    const shape = new THREE.Shape(l.pts.map(([x, z]) => new THREE.Vector2(x, -z)))
    const geo = new THREE.ExtrudeGeometry(shape, { depth: GROUND_Y, bevelEnabled: false, curveSegments: 1 })
    geo.rotateX(-Math.PI / 2)
    const rid = regionOfLandmass(l.id)
    const add = (m: THREE.Mesh) => {
      m.userData.regionId = rid
      group.add(m)
    }
    add(new THREE.Mesh(geo, [top, side]))

    // neon coastline
    const pts = l.pts.map(([x, z]) => new THREE.Vector3(x, GROUND_Y + 0.06, z))
    const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal')
    const seg = Math.max(60, pts.length * 3)
    add(new THREE.Mesh(new THREE.TubeGeometry(curve, seg, 0.2, 4, true), new THREE.MeshBasicMaterial({ color: 0x20f4ff })))
    add(new THREE.Mesh(new THREE.TubeGeometry(curve, seg, 1.1, 5, true), glowMat(0x00c8ff, 0.1)))
  }
  return group
}

// ───────────────────────────── city blocks ─────────────────────────────

interface Avoid {
  x: number
  z: number
  r: number
}

function sampleLine(pts: P[], step: number, r: number, out: Avoid[]) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i]
    const [bx, bz] = pts[i + 1]
    const len = Math.hypot(bx - ax, bz - az)
    const n = Math.max(1, Math.ceil(len / step))
    for (let k = 0; k <= n; k++) out.push({ x: ax + ((bx - ax) * k) / n, z: az + ((bz - az) * k) / n, r })
  }
}

export function buildCity(): THREE.Group {
  const rand = mulberry32(2024)
  const avoid: Avoid[] = []
  // (landmarks carry their own `clear` radius in `scenics`; their interaction radius can be much bigger)
  for (const z of allZones()) {
    if (z.kind === 'landmark') continue
    // the little tour dioramas are much bigger than the interaction circle
    avoid.push({ x: z.x, z: z.z, r: z.kind === 'tour' ? 50 : (z.hidden ? 12 : z.radius) + 9 })
  }
  for (const s of scenics) avoid.push({ x: s.x, z: s.z, r: s.clear + 4 })
  for (const b of bridges) sampleLine([b.a, b.b], 6, 9, avoid)
  sampleLine(ROUTE_EU, 7, 6.5, avoid)
  sampleLine(ROUTE_AS, 7, 6.5, avoid)
  sampleLine(ROUTE_MT, 7, 6.5, avoid)
  avoid.push({ x: SPAWN.x, z: SPAWN.z, r: 14 })

  const bizX = -10
  const bizZ = -150 // Levent / Şişli business belt
  const polys = landmasses.filter((l) => l.walkable).map((l) => ({ id: l.id, pts: l.pts, poly: makePoly(l.pts) }))
  const cell = 6.4
  const taken = new Map<string, boolean>()

  interface B {
    x: number
    z: number
    w: number
    d: number
    h: number
    yaw: number
    color: THREE.Color
    rid: string
  }
  const out: B[] = []
  const palette = [
    new THREE.Color(0.0, 0.85, 1.0),
    new THREE.Color(1.0, 0.72, 0.3),
    new THREE.Color(1.0, 0.72, 0.3),
    new THREE.Color(1.0, 0.2, 0.8),
    new THREE.Color(0.55, 0.4, 1.0),
  ]
  const sand = [new THREE.Color(1.0, 0.75, 0.38), new THREE.Color(1.0, 0.65, 0.3), new THREE.Color(0.0, 0.85, 1.0)]

  for (const { id, pts, poly } of polys) {
    const malta = id !== 'europe' && id !== 'asia' // Malta and the little tour islands: low-rise, sandy
    const bounds = malta
      ? { x0: poly.minX, x1: poly.maxX, z0: poly.minZ, z1: poly.maxZ }
      : { ...IST_BOUNDS }
    const attempts = id === 'malta' ? 5200 : malta ? Math.round(((bounds.x1 - bounds.x0) * (bounds.z1 - bounds.z0)) / 14) : 17000
    for (let a = 0; a < attempts; a++) {
      const x = bounds.x0 + rand() * (bounds.x1 - bounds.x0)
      const z = bounds.z0 + rand() * (bounds.z1 - bounds.z0)
      if (!inPoly(x, z, poly)) continue
      if (!malta) {
        // thin the city out toward the edge of the walkable map instead of stopping at a hard line
        const edge = Math.min(x - bounds.x0, bounds.x1 - x, z - bounds.z0, bounds.z1 - z)
        const keepP = Math.max(0, Math.min(1, edge / 160))
        if (rand() > keepP * keepP) continue
      }
      if (distToEdge(x, z, pts) < 7) continue
      if (avoid.some((v) => (v.x - x) ** 2 + (v.z - z) ** 2 < v.r * v.r)) continue
      const key = `${Math.floor(x / cell)}:${Math.floor(z / cell)}`
      if (taken.has(key)) continue
      taken.set(key, true)

      const biz = Math.exp(-((x - bizX) ** 2 + (z - bizZ) ** 2) / (2 * 120 * 120))
      let h = 1.5 + rand() ** 2 * 5.5 + biz * rand() ** 1.6 * 15
      if (malta) h = 1.2 + rand() ** 1.5 * 3.4
      const yaw = (Math.floor(x / 140) * 0.37 + Math.floor(z / 140) * 0.51) % 1.2
      out.push({
        x,
        z,
        // footprints stay inside their 6.4-unit cell even when rotated, so buildings never overlap (no z-fighting)
        w: 2.4 + rand() * 2.0,
        d: 2.4 + rand() * 2.0,
        h,
        yaw,
        color: (malta ? sand : palette)[Math.floor(rand() * (malta ? sand.length : palette.length))],
        rid: regionOfLandmass(id),
      })
    }
  }

  const geo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0)
  const mat = fogMaterial({
    instanced: true,
    uniforms: { uPlayer: { value: new THREE.Vector2() } },
    vertexHead: /* glsl */ `
      varying float vSeed; varying vec3 vLoc; varying vec3 vN; varying vec3 vCol; varying float vHy;
      uniform vec2 uPlayer;
      ${GLSL_HASH}
    `,
    // Buildings near the player get their roof lowered so they never hide the character. The wall is CUT, not
    // squashed: windows stay pinned to their real height, so nothing slides or "dances" while you walk.
    localBody: /* glsl */ `
      float hh = 1.0;
      #ifdef USE_INSTANCING
        hh = length(instanceMatrix[1].xyz);
        float dd = distance(instanceMatrix[3].xz, uPlayer);
        float capH = mix(0.45, hh, smoothstep(9.0, 24.0, dd));
        lp.y = min(lp.y, capH / hh);
      #endif
      vHy = lp.y * hh;
    `,
    vertexBody: /* glsl */ `
      vec3 sc = vec3(1.0);
      vSeed = 0.5; vN = normal; vCol = vec3(0.0, 0.85, 1.0);
      #ifdef USE_INSTANCING
        sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
        // k/1024 is exact in float, so the fragment shader can round away the interpolation jitter (see below)
        vSeed = floor(hash21(instanceMatrix[3].xz) * 1024.0) / 1024.0;
        vN = normalize(mat3(instanceMatrix) * normal);
        #ifdef USE_INSTANCING_COLOR
          vCol = instanceColor;
        #endif
      #endif
      vLoc = position * sc;
    `,
    fragment: /* glsl */ `
      varying float vSeed; varying vec3 vLoc; varying vec3 vN; varying vec3 vCol; varying float vHy;
      ${GLSL_HASH}
      void main(){
        vec3 col = vec3(0.020, 0.013, 0.05);
        if (abs(vN.y) < 0.5) {
          // No window lights: tiny high-contrast detail is what shimmered. Walls are a smooth glow that
          // brightens with height, so nothing can crawl and the shader stays trivially cheap.
          col += vCol * (0.03 + 0.13 * smoothstep(0.0, 14.0, vHy));
        } else {
          col += vCol * 0.11;
        }
        gl_FragColor = vec4(col, 1.0);
        #include <fog_fragment>
      }
    `,
  })
  // one instanced mesh per region (Istanbul, Malta, each tour island) so far-away regions can be switched off entirely
  const group = new THREE.Group()
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const up = new THREE.Vector3(0, 1, 0)
  const byRegion = new Map<string, B[]>()
  for (const b of out) {
    const list = byRegion.get(b.rid) ?? []
    list.push(b)
    byRegion.set(b.rid, list)
  }
  byRegion.forEach((list, rid) => {
    const mesh = new THREE.InstancedMesh(geo, mat, list.length)
    list.forEach((b, i) => {
      q.setFromAxisAngle(up, b.yaw)
      m.compose(new THREE.Vector3(b.x, GROUND_Y, b.z), q, new THREE.Vector3(b.w, b.h, b.d))
      mesh.setMatrixAt(i, m)
      mesh.setColorAt(i, b.color)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.frustumCulled = false
    mesh.userData.regionId = rid
    group.add(mesh)
  })
  updaters.push((_t, px, pz) => mat.uniforms.uPlayer.value.set(px, pz))
  return group
}

// ───────────────────────────── glowing paths ─────────────────────────────

export function pathTube(
  pts: THREE.Vector3[],
  o: { radius?: number; halo?: number; from?: string; to?: string; pulse?: number } = {},
): THREE.Group {
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal')
  const len = curve.getLength()
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
    uniforms: {
      uTime: { value: 0 },
      uLen: { value: len },
      uA: { value: new THREE.Color(o.from ?? '#00f0ff') },
      uB: { value: new THREE.Color(o.to ?? '#ff2bd6') },
      uPulse: { value: o.pulse ?? 46 },
    },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv; uniform float uTime; uniform float uLen; uniform vec3 uA; uniform vec3 uB; uniform float uPulse;
      void main(){
        float s = vUv.x * uLen;
        float pulse = smoothstep(0.8, 1.0, fract(s / uPulse - uTime * 0.3));
        vec3 c = mix(uA, uB, vUv.x);
        gl_FragColor = vec4(c * (0.4 + pulse * 1.1), 0.5 + pulse * 0.35);
      }
    `,
  })
  const g = new THREE.Group()
  const segs = Math.max(40, Math.ceil(len / 2))
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, segs, o.radius ?? 0.28, 4, false), mat))
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, Math.ceil(segs / 2), o.halo ?? 1.1, 5, false), glowMat(0x00f0ff, 0.05)))
  updaters.push((t) => (mat.uniforms.uTime.value = t))
  return g
}

export function groundRoute(pts: P[], y = GROUND_Y + 0.12): THREE.Group {
  return pathTube(pts.map(([x, z]) => new THREE.Vector3(x, y, z)))
}
