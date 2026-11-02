import * as THREE from 'three'
import { spiralPoint, thetaAtArc } from './spiral'

export interface Tickable {
  obj: THREE.Object3D
  tick?: (t: number, dt: number) => void
}

export const BG = 0x05010f

// ───────────────────────────── textures ─────────────────────────────

let _glow: THREE.CanvasTexture | null = null
export function glowTexture(): THREE.CanvasTexture {
  if (_glow) return _glow
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.25, 'rgba(255,255,255,0.55)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  _glow = new THREE.CanvasTexture(c)
  return _glow
}

export function glowSprite(color: THREE.ColorRepresentation, size: number, opacity = 0.8): THREE.Sprite {
  const m = new THREE.SpriteMaterial({
    map: glowTexture(),
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  })
  const s = new THREE.Sprite(m)
  s.scale.setScalar(size)
  return s
}

export function textSprite(text: string, color: string, height = 3): THREE.Sprite {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const g = c.getContext('2d')!
  g.font = '700 170px "Chakra Petch", "JetBrains Mono", system-ui, sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.shadowColor = color
  g.shadowBlur = 28
  g.fillStyle = color
  g.fillText(text, 128, 138)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  const m = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  })
  const s = new THREE.Sprite(m)
  s.scale.set(height, height, 1)
  return s
}

// ───────────────────────────── primitives ─────────────────────────────

const fillMat = () =>
  new THREE.MeshBasicMaterial({
    color: 0x080320,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  })

export function edges(
  geo: THREE.BufferGeometry,
  color: THREE.ColorRepresentation,
  opacity = 1,
  angle = 25,
): THREE.LineSegments {
  return new THREE.LineSegments(
    new THREE.EdgesGeometry(geo, angle),
    new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity }),
  )
}

/** Dark solid with glowing outline — the core look of the whole world. */
export function neonMesh(geo: THREE.BufferGeometry, color: THREE.ColorRepresentation, angle = 25): THREE.Group {
  const g = new THREE.Group()
  g.add(new THREE.Mesh(geo, fillMat()))
  g.add(edges(geo, color, 1, angle))
  return g
}

export function neonBox(w: number, h: number, d: number, color: THREE.ColorRepresentation): THREE.Group {
  return neonMesh(new THREE.BoxGeometry(w, h, d), color)
}

export function wire(geo: THREE.BufferGeometry, color: THREE.ColorRepresentation, opacity = 0.9): THREE.LineSegments {
  return new THREE.LineSegments(
    new THREE.WireframeGeometry(geo),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  )
}

export function glowMat(color: THREE.ColorRepresentation, opacity = 1): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
}

// ───────────────────────────── platform & beam ─────────────────────────────

export function hexPlatform(color: string, radius = 15): Tickable {
  const g = new THREE.Group()
  const body = neonMesh(new THREE.CylinderGeometry(radius, radius * 1.04, 0.8, 6), color, 10)
  body.position.y = -0.4
  g.add(body)

  const ringGeo = new THREE.RingGeometry(radius * 0.62, radius * 0.645, 6)
  ringGeo.rotateX(-Math.PI / 2)
  const ring = new THREE.Mesh(ringGeo, glowMat(color, 0.9))
  ring.position.y = 0.06
  g.add(ring)

  const ring2Geo = new THREE.RingGeometry(radius * 0.86, radius * 0.875, 6)
  ring2Geo.rotateX(-Math.PI / 2)
  const ring2 = new THREE.Mesh(ring2Geo, glowMat(color, 0.45))
  ring2.position.y = 0.06
  g.add(ring2)

  const disc = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.95, 6).rotateX(-Math.PI / 2), glowMat(color, 0.07))
  disc.position.y = 0.05
  g.add(disc)

  return {
    obj: g,
    tick: (t) => {
      ring.rotation.y = t * 0.25
      ring2.rotation.y = -t * 0.12
    },
  }
}

export function beam(color: string, height = 80, radius = 0.8): { mesh: THREE.Mesh; mat: THREE.ShaderMaterial } {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
    uniforms: { uColor: { value: new THREE.Color(color) }, uTime: { value: 0 }, uAlpha: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv; uniform vec3 uColor; uniform float uTime; uniform float uAlpha;
      void main(){
        float a = pow(1.0 - vUv.y, 1.9) * 0.38;
        a *= 0.8 + 0.2 * sin(uTime * 2.0 - vUv.y * 24.0);
        gl_FragColor = vec4(uColor * 1.4, a * uAlpha);
      }
    `,
  })
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.45, radius, height, 20, 1, true), mat)
  mesh.position.y = height / 2
  return { mesh, mat }
}

// ───────────────────────────── the nautilus ─────────────────────────────

/** A chambered shell built from glowing wire orbs along a logarithmic spiral. */
export function nautilus(color: string, accent: string, scale = 1, chambers = 16, seg = 8): THREE.Group {
  const g = new THREE.Group()
  const c1 = new THREE.Color(color)
  const c2 = new THREE.Color(accent)
  for (let i = 0; i < chambers; i++) {
    const k = i / (chambers - 1)
    const t = k * 9.4
    const rho = 0.35 * Math.exp(0.3 * t)
    const rad = rho * (0.38 + 0.08 * k)
    const geo = new THREE.SphereGeometry(rad, seg, Math.max(5, seg - 2))
    const col = c1.clone().lerp(c2, k)
    const orb = new THREE.Group()
    orb.add(new THREE.Mesh(geo, fillMat()))
    orb.add(wire(geo, col, 0.95))
    orb.position.set(rho * Math.cos(t), rho * Math.sin(t), 0)
    g.add(orb)
  }
  g.scale.setScalar(scale)
  return g
}

// ───────────────────────────── ground & sky ─────────────────────────────

export function gridFloor(): { mesh: THREE.Mesh; mat: THREE.ShaderMaterial } {
  const mat = new THREE.ShaderMaterial({
    fog: false,
    uniforms: { uPlayer: { value: new THREE.Vector2() }, uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vW; uniform vec2 uPlayer; uniform float uTime;
      float grid(vec2 p, float size, float width){
        vec2 q = p / size;
        vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
        return 1.0 - min(min(g.x, g.y) / width, 1.0);
      }
      void main(){
        vec2 p = vW.xz;
        float d = distance(p, uPlayer);
        float fade = exp(-pow(d / 300.0, 2.0));
        float near = exp(-d / 20.0);
        float minor = grid(p, 6.0, 1.0);
        float major = grid(p, 30.0, 1.4);
        vec3 cyan = vec3(0.0, 0.85, 1.0);
        vec3 mag  = vec3(1.0, 0.12, 0.8);
        vec3 tint = mix(cyan, mag, smoothstep(40.0, 360.0, length(p)));
        float ring = smoothstep(0.92, 1.0, sin(d * 0.35 - uTime * 2.4)) * exp(-d / 70.0);
        vec3 c = cyan * minor * 0.07 + tint * major * 0.42 + cyan * near * 0.03 + cyan * ring * 0.05;
        c *= fade;
        c += vec3(0.012, 0.004, 0.04);
        gl_FragColor = vec4(c, 1.0);
      }
    `,
  })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000).rotateX(-Math.PI / 2), mat)
  mesh.position.y = -0.02
  return { mesh, mat }
}

/** Distant neon skyline ring — one merged LineSegments for cheap rendering. */
export function skyline(count = 170): THREE.LineSegments {
  const pos: number[] = []
  const rand = mulberry32(7)
  const edgeIdx = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ]
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2
    const r = 520 + rand() * 330
    const cx = Math.cos(a) * r
    const cz = Math.sin(a) * r
    const w = 14 + rand() * 38
    const d = 14 + rand() * 38
    const h = 30 + Math.pow(rand(), 2.2) * 260
    const v = [
      [-w, 0, -d], [w, 0, -d], [w, 0, d], [-w, 0, d],
      [-w, h, -d], [w, h, -d], [w, h, d], [-w, h, d],
    ]
    for (const [a0, b0] of edgeIdx) {
      pos.push(cx + v[a0][0], v[a0][1], cz + v[a0][2], cx + v[b0][0], v[b0][1], cz + v[b0][2])
    }
    // a few "window" rows
    const rows = Math.floor(h / 22)
    for (let k = 1; k < rows; k++) {
      const y = k * 22
      pos.push(cx - w, y, cz - d, cx + w, y, cz - d, cx + w, y, cz - d, cx + w, y, cz + d)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  const lines = new THREE.LineSegments(
    geo,
    new THREE.LineBasicMaterial({ color: 0x6a2bff, transparent: true, opacity: 0.38, fog: false }),
  )
  return lines
}

export function stars(count = 1400): THREE.Points {
  const rand = mulberry32(21)
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2
    const e = Math.acos(1 - rand() * 0.92) // keep above horizon
    const r = 1400
    pos[i * 3] = Math.cos(a) * Math.sin(e) * r
    pos[i * 3 + 1] = Math.cos(e) * r * 0.9 + 20
    pos[i * 3 + 2] = Math.sin(a) * Math.sin(e) * r
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return new THREE.Points(
    geo,
    new THREE.PointsMaterial({ color: 0xbfd8ff, size: 2.4, sizeAttenuation: false, transparent: true, opacity: 0.8, fog: false }),
  )
}

// ───────────────────────────── the path ─────────────────────────────

export function spiralPath(endArc: number): { group: THREE.Group; mat: THREE.ShaderMaterial } {
  const endTheta = thetaAtArc(endArc)
  const pts: THREE.Vector3[] = []
  const steps = 900
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * endTheta
    const p = spiralPoint(th)
    pts.push(new THREE.Vector3(p.x, 0.12, p.z))
  }
  const curve = new THREE.CatmullRomCurve3(pts)
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
    uniforms: { uTime: { value: 0 }, uLen: { value: endArc } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv; uniform float uTime; uniform float uLen;
      void main(){
        float s = vUv.x * uLen;
        float pulse = smoothstep(0.82, 1.0, fract(s / 46.0 - uTime * 0.35));
        vec3 c = mix(vec3(0.0, 0.94, 1.0), vec3(1.0, 0.17, 0.84), vUv.x);
        gl_FragColor = vec4(c * (0.38 + pulse * 1.0), 0.55 + pulse * 0.3);
      }
    `,
  })
  const core = new THREE.Mesh(new THREE.TubeGeometry(curve, 900, 0.22, 4, false), mat)
  const halo = new THREE.Mesh(new THREE.TubeGeometry(curve, 450, 1.1, 6, false), glowMat(0x00f0ff, 0.06))
  const g = new THREE.Group()
  g.add(core, halo)
  return { group: g, mat }
}

// ───────────────────────────── trail ─────────────────────────────

export class Trail {
  readonly points: THREE.Points
  private readonly n: number
  private readonly pos: Float32Array
  private readonly age: Float32Array
  private acc = 0
  private head = 0
  private filled = 0

  constructor(color: string, n = 70) {
    this.n = n
    this.pos = new Float32Array(n * 3)
    this.age = new Float32Array(n).fill(1)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3))
    geo.setAttribute('age', new THREE.BufferAttribute(this.age, 1))
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
      uniforms: { uColor: { value: new THREE.Color(color) }, uScale: { value: 1 } },
      vertexShader: /* glsl */ `
        attribute float age; varying float vAge; uniform float uScale;
        void main(){
          vAge = age;
          vec4 mv = modelViewMatrix * vec4(position,1.0);
          gl_PointSize = mix(26.0, 2.0, age) * uScale * (60.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vAge; uniform vec3 uColor;
        void main(){
          vec2 d = gl_PointCoord - 0.5;
          float a = smoothstep(0.5, 0.0, length(d)) * (1.0 - vAge);
          gl_FragColor = vec4(uColor * 1.6, a * 0.9);
        }
      `,
    })
    this.points = new THREE.Points(geo, mat)
    this.points.frustumCulled = false
  }

  setScale(s: number) {
    ;(this.points.material as THREE.ShaderMaterial).uniforms.uScale.value = s
  }

  update(dt: number, p: THREE.Vector3, moving: boolean) {
    this.acc += dt
    if (this.acc > 0.025 && moving) {
      this.acc = 0
      this.head = (this.head + 1) % this.n
      this.pos[this.head * 3] = p.x
      this.pos[this.head * 3 + 1] = p.y
      this.pos[this.head * 3 + 2] = p.z
      this.filled = Math.min(this.filled + 1, this.n)
    }
    for (let i = 0; i < this.n; i++) {
      const back = (this.head - i + this.n) % this.n
      this.age[back] = i >= this.filled ? 1 : i / this.n
    }
    // fade out when idle
    if (!moving && this.filled > 0 && this.acc > 0.05) {
      this.acc = 0
      this.filled = Math.max(0, this.filled - 2)
    }
    const geo = this.points.geometry
    geo.attributes.position.needsUpdate = true
    geo.attributes.age.needsUpdate = true
  }
}

// ───────────────────────────── utils ─────────────────────────────

export function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
