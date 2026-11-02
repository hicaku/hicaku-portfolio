import * as THREE from 'three'
import { edges, glowMat, glowSprite } from './fx'

// A Red Bull-style F1 car in the neon look of the rest of the map: navy body, red sidepods, yellow trim.
// Deliberately no logos: it is a fan tribute (Max Verstappen, #33), not official merchandise.
// Local +z is forward, +x is the car's left.

const NAVY = 0x14224f
const RED = 0xd8143a
const YELLOW = 0xffd23a
const NEON_BLUE = 0x4da3ff

function part(geo: THREE.BufferGeometry, fill: number, edge: number, edgeAngle = 25): THREE.Group {
  const g = new THREE.Group()
  g.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: fill, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })))
  g.add(edges(geo, edge, 1, edgeAngle))
  return g
}

function numberTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  g.fillStyle = '#14224f'
  g.fillRect(0, 0, 128, 128)
  g.fillStyle = '#ffd23a'
  g.font = '800 92px "Chakra Petch", system-ui, sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText('33', 64, 70)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export interface Car {
  group: THREE.Group
  /** spin the wheels and steer the front pair; speed in units/s, steer in -1..1 */
  update(dt: number, t: number, speed: number, steer: number): void
}

export function createCar(): Car {
  const car = new THREE.Group()
  const body = new THREE.Group()
  car.add(body)

  // floor and body
  const floor = part(new THREE.BoxGeometry(1.5, 0.12, 4.6), NAVY, NEON_BLUE)
  floor.position.set(0, 0.2, 0)
  const nose = part(new THREE.CylinderGeometry(0.14, 0.46, 2.8, 8).rotateX(Math.PI / 2), NAVY, NEON_BLUE, 10)
  nose.position.set(0, 0.5, 1.45)
  const tub = part(new THREE.BoxGeometry(0.86, 0.52, 1.5), NAVY, NEON_BLUE)
  tub.position.set(0, 0.55, -0.05)
  const cover = part(new THREE.CylinderGeometry(0.46, 0.08, 2.4, 8).rotateX(-Math.PI / 2), NAVY, NEON_BLUE, 10)
  cover.position.set(0, 0.7, -1.55)
  body.add(floor, nose, tub, cover)

  // sidepods and trim
  for (const s of [-1, 1]) {
    const pod = part(new THREE.BoxGeometry(0.55, 0.46, 1.7), RED, 0xff5f7a)
    pod.position.set(s * 0.8, 0.42, -0.35)
    body.add(pod)
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 3.9), new THREE.MeshBasicMaterial({ color: YELLOW }))
    stripe.position.set(s * 0.27, 0.8, 0.2)
    body.add(stripe)
  }

  // driver: helmet, visor, halo
  const helmet = new THREE.Group()
  helmet.add(new THREE.Mesh(new THREE.SphereGeometry(0.25, 14, 12), new THREE.MeshBasicMaterial({ color: NAVY })))
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.035, 6, 20), new THREE.MeshBasicMaterial({ color: RED }))
  band.rotation.x = Math.PI / 2
  band.position.y = 0.04
  helmet.add(band)
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.2), new THREE.MeshBasicMaterial({ color: 0x0a0a12 }))
  visor.position.set(0, 0.03, 0.2)
  helmet.add(visor, edges(new THREE.BoxGeometry(0.34, 0.12, 0.2), YELLOW).translateZ(0))
  helmet.children[helmet.children.length - 1].position.copy(visor.position)
  helmet.position.set(0, 1.02, -0.05)
  body.add(helmet)
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.035, 6, 14, Math.PI), new THREE.MeshBasicMaterial({ color: 0x9aa4c8 }))
  halo.position.set(0, 0.85, -0.05)
  halo.rotation.y = Math.PI / 2 // the arc runs front-to-back over the driver
  body.add(halo)
  const strut = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.5), new THREE.MeshBasicMaterial({ color: 0x9aa4c8 }))
  strut.position.set(0, 1.12, 0.38)
  strut.rotation.x = 0.5
  body.add(strut)

  // the number on the engine cover
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.46), new THREE.MeshBasicMaterial({ map: numberTexture() }))
  plate.rotation.x = -Math.PI / 2
  plate.position.set(0, 0.92, -1.35)
  body.add(plate)

  // wings
  const fw = part(new THREE.BoxGeometry(2.5, 0.06, 0.55), NAVY, RED)
  fw.position.set(0, 0.14, 2.95)
  const fw2 = part(new THREE.BoxGeometry(2.3, 0.05, 0.3), RED, YELLOW)
  fw2.position.set(0, 0.26, 2.75)
  body.add(fw, fw2)
  for (const s of [-1, 1]) {
    const ep = part(new THREE.BoxGeometry(0.05, 0.3, 0.7), NAVY, YELLOW)
    ep.position.set(s * 1.25, 0.25, 2.9)
    body.add(ep)
    const rep = part(new THREE.BoxGeometry(0.05, 0.62, 0.78), NAVY, YELLOW)
    rep.position.set(s * 0.8, 0.95, -2.75)
    body.add(rep)
  }
  const rw = part(new THREE.BoxGeometry(1.6, 0.07, 0.5), NAVY, RED)
  rw.position.set(0, 1.18, -2.78)
  const rw2 = part(new THREE.BoxGeometry(1.6, 0.06, 0.34), RED, YELLOW)
  rw2.position.set(0, 1.0, -2.7)
  const pillar = part(new THREE.BoxGeometry(0.1, 0.55, 0.12), NAVY, NEON_BLUE)
  pillar.position.set(0, 0.8, -2.55)
  body.add(rw, rw2, pillar)

  // wheels
  const wheels: THREE.Group[] = []
  const wheel = (x: number, z: number, r: number, w: number, front: boolean) => {
    const pivot = new THREE.Group()
    pivot.position.set(x, r, z)
    const spin = new THREE.Group()
    const tyre = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 18).rotateZ(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x07070c }))
    const band = new THREE.Mesh(new THREE.TorusGeometry(r - 0.02, 0.025, 4, 22).rotateY(Math.PI / 2), new THREE.MeshBasicMaterial({ color: RED }))
    band.position.x = Math.sign(x) * (w / 2)
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, w + 0.02, 8).rotateZ(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x2a2f48 }))
    // a spoke marker so you can see the wheel turn
    const mark = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.07, r * 0.8), new THREE.MeshBasicMaterial({ color: 0x5a6086 }))
    mark.position.y = r * 0.45
    spin.add(tyre, band, hub, mark)
    pivot.add(spin)
    pivot.userData = { spin, front }
    body.add(pivot)
    wheels.push(pivot)
  }
  wheel(-1.0, 1.95, 0.4, 0.42, true)
  wheel(1.0, 1.95, 0.4, 0.42, true)
  wheel(-1.05, -1.9, 0.44, 0.62, false)
  wheel(1.05, -1.9, 0.44, 0.62, false)

  // glow: exhaust, underglow
  const exhaust = glowSprite(0xff7a3c, 2.4, 0.8)
  exhaust.position.set(0, 0.6, -3.2)
  body.add(exhaust)
  const under = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 6).rotateX(-Math.PI / 2), glowMat(0x2f6bff, 0.22))
  under.position.y = 0.06
  body.add(under)

  car.scale.setScalar(0.95)

  return {
    group: car,
    update(dt, t, speed, steer) {
      for (const w of wheels) {
        const { spin, front } = w.userData as { spin: THREE.Group; front: boolean }
        spin.rotation.x += (speed * dt) / 0.42
        if (front) w.rotation.y += (steer * 0.45 - w.rotation.y) * Math.min(1, dt * 10)
      }
      body.rotation.z += (-steer * 0.05 - body.rotation.z) * Math.min(1, dt * 6) // lean into the corner
      body.position.y = Math.sin(t * 40) * 0.008 * Math.min(1, speed / 40)
      const k = Math.min(1, speed / 60)
      exhaust.scale.setScalar(2.0 + k * 1.8 + Math.sin(t * 30) * 0.2)
      ;(exhaust.material as THREE.SpriteMaterial).opacity = 0.45 + 0.45 * k
    },
  }
}
