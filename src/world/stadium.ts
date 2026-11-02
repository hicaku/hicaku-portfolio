import * as THREE from 'three'
import { type Tickable, glowMat, glowSprite, mulberry32 } from './fx'

/** A pixel-art crowd: mostly black and white, with the odd flash of colour. */
function crowdTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const rand = mulberry32(33)
  for (let y = 0; y < 64; y += 2) {
    for (let x = 0; x < 64; x += 2) {
      const r = rand()
      g.fillStyle = r < 0.45 ? '#f4f4f8' : r < 0.9 ? '#14141c' : r < 0.95 ? '#9aa0b4' : '#ff3b5c'
      g.fillRect(x, y, 2, 2)
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.magFilter = THREE.NearestFilter
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function stripeTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 16
  c.height = 4
  const g = c.getContext('2d')!
  g.fillStyle = '#f4f4f8'
  g.fillRect(0, 0, 8, 4)
  g.fillStyle = '#0c0c14'
  g.fillRect(8, 0, 8, 4)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.magFilter = THREE.NearestFilter
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function pitchTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 160
  const g = c.getContext('2d')!
  for (let i = 0; i < 10; i++) {
    g.fillStyle = i % 2 ? '#0b3a22' : '#0e4a2a'
    g.fillRect(i * 25.6, 0, 25.6, 160)
  }
  g.strokeStyle = '#d8ffe8'
  g.lineWidth = 2
  g.strokeRect(10, 10, 236, 140)
  g.beginPath()
  g.moveTo(128, 10)
  g.lineTo(128, 150)
  g.stroke()
  g.beginPath()
  g.arc(128, 80, 22, 0, Math.PI * 2)
  g.stroke()
  g.strokeRect(10, 45, 36, 70)
  g.strokeRect(210, 45, 36, 70)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/**
 * The Beşiktaş crest: a black shield with a white border, BJK in serif capitals, the red disc with the
 * white crescent and star, and 1903. Redrawn here to match the club's crest.
 */
function badge(): THREE.Mesh {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 300
  const g = c.getContext('2d')!
  const shield = (inset: number) => {
    g.beginPath()
    g.moveTo(28 + inset, 18 + inset)
    g.quadraticCurveTo(128, 34 + inset, 228 - inset, 18 + inset)
    g.lineTo(228 - inset, 150)
    g.quadraticCurveTo(222 - inset, 236, 128, 288 - inset * 1.3)
    g.quadraticCurveTo(34 + inset, 236, 28 + inset, 150)
    g.closePath()
  }
  g.fillStyle = '#f4f4f8'
  shield(0)
  g.fill()
  g.fillStyle = '#0a0a12'
  shield(9)
  g.fill()
  g.fillStyle = '#f4f4f8'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = '700 58px Georgia, "Times New Roman", serif'
  g.fillText('BJK', 128, 72)
  g.font = '700 48px Georgia, "Times New Roman", serif'
  g.fillText('1903', 128, 232)
  // red disc, white crescent and five-point star
  g.fillStyle = '#e30a17'
  g.beginPath()
  g.arc(128, 148, 36, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = '#ffffff'
  g.beginPath()
  g.arc(122, 148, 23, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = '#e30a17'
  g.beginPath()
  g.arc(130, 148, 19, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = '#ffffff'
  g.beginPath()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 4.5 : 11
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    g.lineTo(144 + Math.cos(a) * r, 148 + Math.sin(a) * r)
  }
  g.closePath()
  g.fill()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return new THREE.Mesh(new THREE.PlaneGeometry(2, 2 * (300 / 256)), new THREE.MeshBasicMaterial({ map: t, color: 0x9a9aa4, transparent: true, side: THREE.DoubleSide }))
}
/**
 * Tüpraş Stadyumu, the home of Beşiktaş: a black-and-white striped bowl with a packed crowd,
 * floodlights and the club eagle over the main entrance. It stands between Dolmabahçe and Beşiktaş.
 */
export function stadium(): Tickable {
  const g = new THREE.Group()
  const A = 15.5 // half length
  const B = 12 // half width
  const H = 6.6

  const stripes = stripeTexture()
  stripes.repeat.set(44, 1)
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, H, 88, 1, true).scale(A, 1, B).translate(0, H / 2, 0),
    // white is held at ~45%: pure white would bloom into a featureless blob
    new THREE.MeshBasicMaterial({ map: stripes, color: 0x727280, side: THREE.FrontSide }),
  )
  g.add(wall)

  // the seating bowl: a sloped ring you can see from above
  const crowd = crowdTexture()
  crowd.repeat.set(26, 3)
  const bowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.94, 0.56, H * 0.82, 88, 1, true).scale(A, 1, B).translate(0, H * 0.41 + 0.2, 0),
    new THREE.MeshBasicMaterial({ map: crowd, color: 0x808090, side: THREE.BackSide }),
  )
  g.add(bowl)

  // roof rim and a glowing outline
  const roof = new THREE.Mesh(new THREE.RingGeometry(0.86, 1.06, 88).rotateX(-Math.PI / 2).scale(A, 1, B), new THREE.MeshBasicMaterial({ color: 0x0c0c14, side: THREE.DoubleSide }))
  roof.position.y = H + 0.15
  g.add(roof)
  const rim = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(Array.from({ length: 89 }, (_, i) => new THREE.Vector3(Math.cos((i / 88) * Math.PI * 2) * A * 1.06, H + 0.18, Math.sin((i / 88) * Math.PI * 2) * B * 1.06))),
    new THREE.LineBasicMaterial({ color: 0xb8bccf }),
  )
  g.add(rim)
  const rimIn = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(Array.from({ length: 89 }, (_, i) => new THREE.Vector3(Math.cos((i / 88) * Math.PI * 2) * A * 0.86, H + 0.18, Math.sin((i / 88) * Math.PI * 2) * B * 0.86))),
    new THREE.LineBasicMaterial({ color: 0x9aa0b4 }),
  )
  g.add(rimIn)

  // pitch
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(A * 1.0, B * 0.95).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: pitchTexture() }))
  pitch.position.y = 0.25
  g.add(pitch)
  const pitchGlow = new THREE.Mesh(new THREE.PlaneGeometry(A * 1.2, B * 1.15).rotateX(-Math.PI / 2), glowMat(0x2dff8a, 0.04))
  pitchGlow.position.y = 0.3
  g.add(pitchGlow)

  // floodlight masts
  const lights: THREE.Sprite[] = []
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const) {
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, H + 5, 6), new THREE.MeshBasicMaterial({ color: 0x2a2a3a }))
    mast.position.set(sx * A * 1.02, (H + 5) / 2, sz * B * 1.02)
    g.add(mast)
    const head = glowSprite(0xdff6ff, 4, 0.7)
    head.position.set(sx * A * 1.02, H + 5.2, sz * B * 1.02)
    g.add(head)
    lights.push(head)
  }

  // the club badge over the main (south-facing) gate, on a short post so it reads from the camera
  const emblem = badge()
  emblem.scale.setScalar(2.5)
  emblem.position.set(0, H + 4.4, B * 1.06 + 0.4)
  g.add(emblem)
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.6, 0.35), new THREE.MeshBasicMaterial({ color: 0x20202c }))
  post.position.set(0, H + 1.1, B * 1.06 + 0.3)
  g.add(post)
  const emblemBack = emblem.clone() // visible from inside the bowl too
  emblemBack.rotation.y = Math.PI
  emblemBack.position.z -= 0.06
  g.add(emblemBack)

  // pulse of cheering
  const halo = glowSprite(0xb8bccf, 56, 0.05)
  halo.position.y = 4
  g.add(halo)

  return {
    obj: g,
    tick: (t) => {
      lights.forEach((l, i) => ((l.material as THREE.SpriteMaterial).opacity = 0.6 + 0.15 * Math.sin(t * 1.3 + i * 1.7)))
      halo.scale.setScalar(54 + Math.sin(t * 1.1) * 5)
    },
  }
}
