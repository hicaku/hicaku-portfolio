import * as THREE from 'three'
import { glowTexture } from './fx'

// Built from primitives, front of the character = +Z. Feet at y = 0.
const SKIN = 0xd9a07b
const SKIN_SHADE = 0xc58a68
const HAIR = 0x17120f
const BEARD = 0x17110d
const JACKET = 0x2a3a8c
const JACKET_DARK = 0x1a2466
const PANTS = 0x1c2147
const SHOE = 0xeef1ff

const std = (color: number, opts: { rough?: number; emissive?: number; ei?: number } = {}) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness: opts.rough ?? 0.72,
    metalness: 0.04,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.ei ?? 0,
  })

const neon = (color: number, opacity = 1) =>
  new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity })

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat)
  m.position.set(x, y, z)
  return m
}

export interface Character {
  group: THREE.Group
  /** speed in world units/s; `wave` makes the character greet when standing still */
  update(dt: number, t: number, speed: number, wave: boolean): void
}

export function createCharacter(variant: 'me' | 'friend' = 'me'): Character {
  const F = variant === 'friend'
  const skin = F ? 0xe6b898 : SKIN
  const skinShade = F ? 0xd2a083 : SKIN_SHADE
  const hairC = F ? 0x3a2a1f : HAIR
  const jacket = F ? 0x2c2b33 : JACKET
  const collarC = F ? 0xf1e8d4 : JACKET_DARK // a cream open-collar shirt under the blazer
  const pants = F ? 0x24242c : PANTS
  const root = new THREE.Group()
  const rig = new THREE.Group() // bobbing / roll
  root.add(rig)

  // ── legs ──
  const HIP_Y = 1.62
  const hips = new THREE.Group()
  hips.position.y = HIP_Y
  rig.add(hips)

  const legs = [-1, 1].map((s) => {
    const thigh = new THREE.Group()
    thigh.position.set(s * 0.3, 0, 0)
    thigh.add(mesh(new THREE.CapsuleGeometry(0.25, 0.4, 4, 10), std(pants), 0, -0.45, 0))
    const knee = new THREE.Group()
    knee.position.y = -0.85
    knee.add(mesh(new THREE.CapsuleGeometry(0.21, 0.34, 4, 10), std(pants), 0, -0.36, 0))
    // sneaker with neon sole
    const foot = new THREE.Group()
    foot.position.set(0, -0.72, 0.12)
    foot.add(mesh(new THREE.BoxGeometry(0.44, 0.26, 0.86), std(SHOE, { rough: 0.5 }), 0, 0, 0.05))
    foot.add(mesh(new THREE.BoxGeometry(0.47, 0.06, 0.9), neon(s > 0 ? 0xff2bd6 : 0x00f0ff), 0, -0.14, 0.05))
    knee.add(foot)
    thigh.add(knee)
    hips.add(thigh)
    return { thigh, knee, s }
  })

  // ── torso ──
  const torso = new THREE.Group()
  hips.add(torso)
  const chest = mesh(new THREE.CapsuleGeometry(0.52, 0.34, 4, 14), std(jacket, { emissive: 0x0b1550, ei: 0.5 }), 0, 0.62, 0)
  chest.scale.set(1.08, 1, 0.84)
  torso.add(chest)
  if (!F) {
  torso.add(mesh(new THREE.BoxGeometry(0.06, 1.0, 0.02), neon(0x00f0ff), 0, 0.64, 0.4)) // zip
  torso.add(mesh(new THREE.BoxGeometry(0.9, 0.05, 0.02), neon(0xff2bd6, 0.9), 0, 0.2, 0.4)) // hem stripe
  }
  const collar = mesh(new THREE.TorusGeometry(0.3, 0.1, 8, 20), std(collarC), 0, 1.22, 0)
  collar.rotation.x = Math.PI / 2
  torso.add(collar)
  if (!F) {
  // laptop backpack
  const pack = mesh(new THREE.BoxGeometry(0.82, 1.0, 0.36), std(0x151a3d), 0, 0.7, -0.5)
  torso.add(pack)
  torso.add(mesh(new THREE.BoxGeometry(0.1, 0.8, 0.02), neon(0xff2bd6), 0.2, 0.7, -0.69))
  torso.add(mesh(new THREE.BoxGeometry(0.1, 0.8, 0.02), neon(0x00f0ff), -0.2, 0.7, -0.69))
  torso.add(mesh(new THREE.BoxGeometry(0.06, 0.8, 0.16), std(0x151a3d), 0.34, 0.74, -0.2)) // straps
  torso.add(mesh(new THREE.BoxGeometry(0.06, 0.8, 0.16), std(0x151a3d), -0.34, 0.74, -0.2))
  }

  // ── arms ──
  const arms = [-1, 1].map((s) => {
    const shoulder = new THREE.Group()
    shoulder.position.set(s * 0.72, 1.02, 0)
    shoulder.add(mesh(new THREE.SphereGeometry(0.22, 12, 10), std(jacket), 0, 0, 0))
    shoulder.add(mesh(new THREE.CapsuleGeometry(0.17, 0.4, 4, 10), std(jacket), 0, -0.4, 0))
    const elbow = new THREE.Group()
    elbow.position.y = -0.78
    elbow.add(mesh(new THREE.CapsuleGeometry(0.15, 0.3, 4, 10), std(jacket), 0, -0.3, 0))
    elbow.add(mesh(new THREE.TorusGeometry(0.155, 0.03, 6, 14), neon(s > 0 ? 0xff2bd6 : 0x00f0ff), 0, -0.52, 0).rotateX(Math.PI / 2))
    elbow.add(mesh(new THREE.SphereGeometry(0.17, 12, 10), std(skin), 0, -0.72, 0))
    shoulder.add(elbow)
    torso.add(shoulder)
    return { shoulder, elbow, s }
  })

  // ── neck + head ──
  torso.add(mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.22, 12), std(skinShade), 0, 1.28, 0))
  const head = new THREE.Group()
  head.position.y = 2.1
  torso.add(head)

  // a fuller, rounder face
  const skull = mesh(new THREE.SphereGeometry(0.78, 36, 24), std(skin, { rough: 0.6 }))
  skull.scale.set(1.08, 1.02, 0.98)
  head.add(skull)
  // ears
  ;[-1, 1].forEach((s) => {
    const ear = mesh(new THREE.SphereGeometry(0.14, 10, 8), std(skinShade), s * 0.84, -0.02, 0.02)
    ear.scale.set(0.5, 1, 0.8)
    head.add(ear)
  })
  // cheeks
  ;[-1, 1].forEach((s) => {
    const cheek = mesh(new THREE.SphereGeometry(0.3, 14, 10), std(skin), s * 0.42, -0.2, 0.52)
    cheek.scale.set(1, 0.9, 0.8)
    head.add(cheek)
  })
  // nose
  const nose = mesh(new THREE.SphereGeometry(0.125, 12, 10), std(skinShade), 0, -0.1, 0.78)
  nose.scale.set(1, 1.1, 1.15)
  head.add(nose)
  // eyes
  ;[-1, 1].forEach((s) => {
    const eye = mesh(new THREE.SphereGeometry(0.085, 10, 8), std(0x0b0b12, { rough: 0.2 }), s * 0.29, 0.08, 0.7)
    eye.scale.set(1, 1.2, 0.6)
    head.add(eye)
    head.add(mesh(new THREE.SphereGeometry(0.025, 6, 6), neon(0xffffff), s * 0.29 + 0.025, 0.115, 0.735))
  })
  // brows
  ;[-1, 1].forEach((s) => {
    const brow = mesh(new THREE.BoxGeometry(0.36, 0.085, 0.07), std(hairC), s * 0.33, 0.38, 0.7)
    brow.rotation.z = -s * 0.1
    head.add(brow)
  })
  if (!F) {
  // round, thick dark-rimmed glasses (a touch oval)
  ;[-1, 1].forEach((s) => {
    const frame = mesh(new THREE.TorusGeometry(0.285, 0.058, 10, 36), std(0x0c0907, { rough: 0.55 }), s * 0.34, 0.06, 0.76)
    frame.scale.set(1.1, 0.98, 1)
    head.add(frame)
    const lens = mesh(new THREE.CircleGeometry(0.275, 28), neon(0x9cc8ff, 0.07), s * 0.34, 0.06, 0.755)
    lens.scale.set(1.1, 0.98, 1)
    head.add(lens)
    const temple = mesh(new THREE.BoxGeometry(0.06, 0.06, 0.66), std(0x15100e), s * 0.74, 0.09, 0.42)
    temple.rotation.y = s * 0.1
    head.add(temple)
  })
  head.add(mesh(new THREE.BoxGeometry(0.17, 0.06, 0.06), std(0x15100e), 0, 0.1, 0.8)) // bridge
  }

  if (!F) {
  // full short beard: a shell around the jaw from ear to ear, fuller at the chin
  const beardShell = mesh(
    new THREE.SphereGeometry(0.805, 36, 16, -0.08 * Math.PI, 1.16 * Math.PI, 0.6 * Math.PI, 0.4 * Math.PI),
    std(BEARD, { rough: 1 }),
  )
  beardShell.scale.set(1.08, 1.02, 0.99)
  head.add(beardShell)
  const chin = mesh(new THREE.SphereGeometry(0.34, 16, 12), std(BEARD, { rough: 1 }), 0, -0.66, 0.46)
  chin.scale.set(1.5, 1.05, 1.0)
  head.add(chin)
  // moustache
  ;[-1, 1].forEach((s) => {
    const m = mesh(new THREE.CapsuleGeometry(0.06, 0.24, 4, 8), std(BEARD, { rough: 1 }), s * 0.14, -0.28, 0.77)
    m.rotation.z = Math.PI / 2 + s * 0.22
    m.scale.set(1, 1, 0.85)
    head.add(m)
  })
  }
  // lips + a warm smile, inside a clear patch of the beard
  const lips = mesh(new THREE.SphereGeometry(0.17, 14, 10), std(F ? 0xc98476 : 0xb5705a), 0, F ? -0.4 : -0.42, F ? 0.625 : 0.74)
  lips.scale.set(F ? 1.15 : 1.25, F ? 0.26 : 0.5, F ? 0.3 : 0.45)
  head.add(lips)
  const smile = mesh(new THREE.TorusGeometry(0.15, 0.024, 6, 16, Math.PI), std(0x3a1a18), 0.01, F ? -0.375 : -0.405, F ? 0.668 : 0.775)
  smile.rotation.z = Math.PI + 0.06
  head.add(smile)

  // short, receding hair: close-cropped at the sides and back, thin on top, high forehead
  const hair = mesh(
    new THREE.SphereGeometry(0.82, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.43),
    std(hairC, { rough: 0.95, emissive: 0x0a1030, ei: 0.35 }),
    0,
    0.04,
    -0.06,
  )
  hair.scale.set(1.08, 1.0, 1.0)
  hair.rotation.x = -0.42 // tilted back so the forehead reads as high
  head.add(hair)
  // hair wrapping the sides and the nape
  ;[-1, 1].forEach((s) => {
    const side = mesh(new THREE.SphereGeometry(0.5, 14, 10), std(hairC, { rough: 0.95 }), s * 0.62, 0.12, -0.12)
    side.scale.set(0.5, 0.95, 1.05)
    head.add(side)
    head.add(mesh(new THREE.BoxGeometry(0.07, 0.5, 0.3), std(hairC), s * 0.82, -0.02, 0.1)) // sideburn into the beard
  })
  const nape = mesh(new THREE.SphereGeometry(0.62, 16, 10), std(hairC, { rough: 0.95 }), 0, -0.08, -0.34)
  nape.scale.set(1.3, 0.8, 0.7)
  head.add(nape)

  // ground ring so the character never gets lost against the dark map
  const ring = new THREE.Mesh(
    new THREE.CircleGeometry(1.7, 28).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: glowTexture(), color: 0x00f0ff, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending }),
  )
  ring.position.y = 0.08
  root.add(ring)

  root.scale.setScalar(1.08)

  let phase = 0
  let runBlend = 0
  const lerp = THREE.MathUtils.lerp

  return {
    group: root,
    update(dt, t, speed, wave) {
      const target = THREE.MathUtils.clamp(speed / 24, 0, 1.5)
      runBlend = lerp(runBlend, target, 1 - Math.exp(-10 * dt))
      const run = runBlend
      phase += dt * (5.5 + run * 8.5) * (run > 0.04 ? 1 : 0)
      const amp = 0.95 * Math.min(1.15, run)
      const moving = Math.min(1, run * 3)

      legs.forEach(({ thigh, knee, s }) => {
        const ph = phase + (s > 0 ? 0 : Math.PI)
        const idle = 0.02
        thigh.rotation.x = lerp(idle, Math.sin(ph) * amp, moving)
        knee.rotation.x = lerp(0.03, 0.15 + Math.max(0, -Math.cos(ph)) * 1.5 * Math.min(1.1, run), moving)
      })
      arms.forEach(({ shoulder, elbow, s }) => {
        const ph = phase + (s > 0 ? 0 : Math.PI)
        const idleSway = Math.sin(t * 1.6 + s) * 0.05
        shoulder.rotation.x = lerp(idleSway, -Math.sin(ph) * amp * 1.15, moving)
        shoulder.rotation.z = -s * lerp(0.06, 0.1, moving)
        elbow.rotation.x = lerp(-0.12, -(0.75 + 0.5 * run), moving)
      })
      // greeting wave with the right arm when standing still
      const w = wave && moving < 0.2 ? 1 : 0
      const rArm = arms[1]
      if (w) {
        rArm.shoulder.rotation.x = -2.55
        rArm.shoulder.rotation.z = -0.35 + Math.sin(t * 9) * 0.3
        rArm.elbow.rotation.x = -0.4
      }

      torso.rotation.x = lerp(0.0, 0.1 + 0.2 * Math.min(1.3, run), moving)
      torso.rotation.y = Math.sin(phase) * 0.12 * moving
      torso.scale.y = 1 + Math.sin(t * 2.1) * 0.012 * (1 - moving)
      head.rotation.y = lerp(Math.sin(t * 0.7) * 0.28, 0, moving)
      head.rotation.x = lerp(Math.sin(t * 0.5) * 0.05, -0.08, moving)
      rig.position.y = Math.abs(Math.sin(phase)) * 0.2 * moving * Math.min(1, run)
      rig.rotation.z = Math.sin(phase) * 0.05 * moving
      ring.scale.setScalar(1 + run * 0.15)
    },
  }
}