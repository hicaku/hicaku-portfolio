import * as THREE from 'three'
import { type Tickable, edges, glowMat, glowSprite, neonBox, neonMesh } from './fx'

const CREAM = '#f4e6c8'
const GOLD = '#ffd27a'

/** Tall arched windows on two floors, glowing warm. One tile = one window bay. */
function facadeTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 128
  const g = c.getContext('2d')!
  g.fillStyle = '#2a2236'
  g.fillRect(0, 0, 64, 128)
  for (let floor = 0; floor < 2; floor++) {
    const y0 = floor * 64 + 6
    const grad = g.createLinearGradient(0, y0, 0, y0 + 54)
    grad.addColorStop(0, '#ffe7b0')
    grad.addColorStop(1, '#ff9f4a')
    g.fillStyle = grad
    g.beginPath()
    g.moveTo(18, y0 + 52)
    g.lineTo(18, y0 + 22)
    g.arc(32, y0 + 22, 14, Math.PI, 0)
    g.lineTo(46, y0 + 52)
    g.closePath()
    g.fill()
    g.fillStyle = '#c9b48a'
    g.fillRect(0, y0 + 56, 64, 3)
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** A round clock frozen at 09:05, the time Atatürk died; the palace clocks are stopped at that minute. */
function clockFace(): THREE.Mesh {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  g.fillStyle = '#10101c'
  g.beginPath()
  g.arc(64, 64, 62, 0, Math.PI * 2)
  g.fill()
  g.strokeStyle = GOLD
  g.lineWidth = 5
  g.beginPath()
  g.arc(64, 64, 58, 0, Math.PI * 2)
  g.stroke()
  g.lineWidth = 3
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    g.beginPath()
    g.moveTo(64 + Math.sin(a) * 48, 64 - Math.cos(a) * 48)
    g.lineTo(64 + Math.sin(a) * 55, 64 - Math.cos(a) * 55)
    g.stroke()
  }
  const hand = (deg: number, len: number, w: number) => {
    const a = (deg * Math.PI) / 180
    g.lineWidth = w
    g.beginPath()
    g.moveTo(64, 64)
    g.lineTo(64 + Math.sin(a) * len, 64 - Math.cos(a) * len)
    g.stroke()
  }
  g.strokeStyle = '#f4f4f8'
  hand(((9 + 5 / 60) / 12) * 360, 32, 6) // hour hand a hair past the 9
  hand((5 / 60) * 360, 46, 4) // minute hand on the 1
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ map: t, color: 0xd8d8d8, transparent: true }))
}

/**
 * Dolmabahçe Palace: a long baroque facade on the Bosphorus with a central ceremonial hall under a dome,
 * a columned portico, a gated garden fence, and the crystal chandelier glowing in the hall.
 * Local +z faces the water.
 */
export function dolmabahce(): Tickable {
  const g = new THREE.Group()

  const tex = facadeTexture()
  const facade = (w: number, h: number, x: number, z: number, bays: number) => {
    const t = tex.clone()
    t.needsUpdate = true
    t.repeat.set(bays, 1)
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, color: 0xb8b8b8 }))
    m.position.set(x, h / 2 + 0.2, z)
    return m
  }

  // the long main block
  const block = neonBox(34, 8, 7, CREAM)
  block.position.set(0, 4, -1)
  g.add(block)
  g.add(facade(34, 8, 0, 2.55, 10))
  // projecting wings at both ends
  for (const s of [-1, 1]) {
    const wing = neonBox(7.5, 8.6, 9, CREAM)
    wing.position.set(s * 14.5, 4.3, 0.5)
    g.add(wing)
    g.add(facade(7.5, 8.6, s * 14.5, 5.05, 2))
    const cap = neonBox(8.2, 0.7, 9.7, GOLD)
    cap.position.set(s * 14.5, 8.95, 0.5)
    g.add(cap)
  }
  // the ceremonial hall: a taller block with its dome and lantern
  const hall = neonBox(11, 11, 10, CREAM)
  hall.position.set(0, 5.5, -3.5)
  g.add(hall)
  const drum = neonMesh(new THREE.CylinderGeometry(4.4, 4.6, 2.6, 16), CREAM, 12)
  drum.position.set(0, 12.3, -3.5)
  g.add(drum)
  const dome = neonMesh(new THREE.SphereGeometry(4.4, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), GOLD, 25)
  dome.position.set(0, 13.6, -3.5)
  g.add(dome)
  const lantern = neonMesh(new THREE.CylinderGeometry(0.5, 0.7, 2.4, 8), GOLD, 20)
  lantern.position.set(0, 18.6, -3.5)
  g.add(lantern)
  const spire = neonMesh(new THREE.ConeGeometry(0.4, 1.8, 6), GOLD, 20)
  spire.position.set(0, 20.9, -3.5)
  g.add(spire)

  // columned portico on the water side, with the 09:05 clock in the pediment
  for (let i = 0; i < 6; i++) {
    const col = neonMesh(new THREE.CylinderGeometry(0.34, 0.4, 7.2, 10), CREAM, 12)
    col.position.set(-4.5 + i * 1.8, 3.8, 3.9)
    g.add(col)
  }
  const pedBase = neonBox(11.4, 0.7, 2.6, CREAM)
  pedBase.position.set(0, 7.75, 3.7)
  g.add(pedBase)
  const shape = new THREE.Shape([new THREE.Vector2(-5.7, 0), new THREE.Vector2(5.7, 0), new THREE.Vector2(0, 2.8)])
  const ped = neonMesh(new THREE.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: false }).translate(0, 0, -0.3), GOLD, 10)
  ped.position.set(0, 8.1, 4.6)
  g.add(ped)
  const clock = clockFace()
  clock.scale.setScalar(1.15)
  clock.position.set(0, 9.35, 5.0)
  g.add(clock)

  // garden: lawn, fountain, fence with the monumental gate
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(34, 8).rotateX(-Math.PI / 2), glowMat(0x2bff8a, 0.1))
  lawn.position.set(0, 0.12, 8.6)
  g.add(lawn)
  const basin = neonMesh(new THREE.CylinderGeometry(1.7, 1.9, 0.7, 14), '#8bdcff', 10)
  basin.position.set(-9, 0.35, 8.6)
  g.add(basin)
  const jet = glowSprite(0x8bdcff, 2.4, 0.8)
  jet.position.set(-9, 2.0, 8.6)
  g.add(jet)
  for (let i = -8; i <= 8; i++) {
    if (Math.abs(i) <= 1) continue
    const post = neonBox(0.25, 1.5, 0.25, GOLD)
    post.position.set(i * 2, 0.75, 12.4)
    g.add(post)
  }
  g.add(edges(new THREE.BoxGeometry(34, 0.1, 0.1), GOLD, 0.8).translateY(1.3).translateZ(12.4))
  for (const s of [-1, 1]) {
    const gp = neonBox(1.1, 4.4, 1.1, CREAM)
    gp.position.set(s * 2.4, 2.2, 12.4)
    g.add(gp)
    const orb = glowSprite(0xffd27a, 1.7, 0.95)
    orb.position.set(s * 2.4, 5.0, 12.4)
    g.add(orb)
  }
  const arch = neonMesh(new THREE.TorusGeometry(2.4, 0.22, 6, 16, Math.PI), GOLD, 20)
  arch.position.set(0, 3.2, 12.4)
  g.add(arch)

  // the Bohemian crystal chandelier, glowing inside the hall
  const chandelier = glowSprite(0xffe1a0, 8, 0.75)
  chandelier.position.set(0, 7.2, 0.6)
  g.add(chandelier)
  const halo = glowSprite(0xffd27a, 52, 0.06)
  halo.position.y = 6
  g.add(halo)

  // the caller rotates this by ~1.0 rad so the facade (+z) looks south-east onto the Bosphorus
  return {
    obj: g,
    tick: (t) => {
      chandelier.scale.setScalar(7.2 + Math.sin(t * 2.6) * 0.9)
      ;(jet.material as THREE.SpriteMaterial).opacity = 0.6 + 0.25 * Math.sin(t * 5)
    },
  }
}
