import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { LITE, leaveHd } from './quality'
import { buildBorders } from './borders'
import { createCar } from './car'
import { createCharacter } from './character'
import { createFerries, createGulls, ferryModel } from './fauna'
import { BG, Trail, beam, glowMat, glowSprite, hexPlatform, stars, type Tickable } from './fx'
import {
  GROUND_Y,
  IST_BOUNDS,
  MALTA_ORIGIN,
  addWalkable,
  bridgeAt,
  bridges,
  circlePoly,
  isLand,
  isWalkable,
  islandOf,
  rectPoly,
  sideAt,
  type Island,
  type P,
  REGION_BOUNDS,
  regionAt,
} from './geo'
import { buildLandmark, jet, lightPath, toriiGate } from './landmarks'
import { dolmabahce } from './palace'
import { stadium } from './stadium'
import {
  camlicaTower,
  comino,
  galataTower,
  maidenTower,
  mdinaWalls,
  plainBridge,
  rumeliHisari,
  suspensionBridge,
  sultanahmet,
  valletta,
} from './scenery'
import { type RoadNet, buildRoads } from './road'
import { buildCity, buildLand, buildWater, groundRoute, pathTube, resetTerrain, terrainTick } from './terrain'
import { buildTourLandmark, istanbulPark } from './tour'
import {
  DOCK_A,
  DOCK_E,
  FERRY_PATH,
  ROUTE_AS,
  ROUTE_EU,
  ROUTE_LINKS,
  ROUTE_MT,
  SECRET_PATH_START,
  SECRET_ZONE,
  SHARD_POSITIONS,
  SPAWN,
  type ZoneDef,
  districts,
  gems,
  landmarkZones,
  scenics,
  tourZones,
  zoneById,
  zones,
} from './zones'
import { TOUR_ISLANDS } from './geo'

export interface FrameInfo {
  x: number
  z: number
  island: Island
  side: 'eu' | 'as' | 'mt' | 'tr'
  place: string
}

export interface WorldEvents {
  onReady?: () => void
  /** even with every quality step dropped the device cannot keep up */
  onSlow?: () => void
  /** the canvas stayed blank even in the lite tier: nothing can be drawn on this device */
  onBlank?: () => void
  /** the F1 car was switched on or off */
  onDrive?: (on: boolean) => void
  onRideEnd?: (pierId: string) => void
  onNear?: (id: string | null) => void
  onVisit?: (id: string) => void
  onGem?: (id: string) => void
  onShard?: (index: number, total: number) => void
  onSecretUnlocked?: () => void
  onWarpEnd?: (id: string, flew: boolean) => void
  onInteract?: () => void
  onLabelClick?: (id: string) => void
  onFrame?: (p: FrameInfo) => void
}

interface Ping {
  mesh: THREE.Mesh
  t: number
  dur: number
  size: number
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const damp = (k: number, dt: number) => 1 - Math.exp(-k * dt)

const LABEL_Y: Record<string, number> = {
  pierE: 9, pierA: 9, itu: 28, datapare: 40, firmasoft: 21, huawei: 22, goart: 24, ist: 20, fasttrack: 29, arcade: 20, skills: 24,
  contact: 31, mla: 20, padel: 8, gaming: 17, travel: 15, japan: 24,
}
const SCENIC_LABEL_Y: Record<string, number> = {
  galata: 43, bosphorus: 38, fsm: 32, maiden: 13, sultanahmet: 27, camlica: 88, rumeli: 17, istpark: 40, stadium: 17, dolmabahce: 25, valletta: 25, comino: 9,
}

export class World {
  private readonly renderer: THREE.WebGLRenderer
  private readonly labelRenderer: CSS2DRenderer
  private readonly composer: EffectComposer
  private readonly bloom: UnrealBloomPass
  private readonly scene = new THREE.Scene()
  private readonly camera: THREE.PerspectiveCamera
  private last = performance.now()
  private readonly ro: ResizeObserver

  private readonly ticks: Array<(t: number, dt: number) => void> = []
  private readonly beams = new Map<string, { mat: THREE.ShaderMaterial; zone: ZoneDef }>()
  private readonly labels = new Map<string, { el: HTMLElement; x: number; z: number; range: number; last: number; scenic: boolean }>()
  private readonly pings: Ping[] = []
  private readonly gullFlock = createGulls()

  // player
  private readonly player = new THREE.Group()
  private readonly character = createCharacter()
  private readonly trail: Trail
  private readonly flightJet = jet(0x00f0ff)
  private readonly playerLight = new THREE.PointLight(0x7fe9ff, 26, 30, 1.8)
  readonly pos = new THREE.Vector3(SPAWN.x, GROUND_Y, SPAWN.z)
  readonly vel = new THREE.Vector3()
  private yaw = 0 // facing the camera, so you meet him properly at the start
  private target: { x: number; z: number } | null = null
  private readonly keys = new Set<string>()
  private joy = { x: 0, y: 0 }
  private boost = false
  private island: Island = 'ist'
  private side: 'eu' | 'as' | 'mt' | 'tr' = 'eu'

  // the F1 car
  private readonly car = createCar()
  private driving = false
  private carSteer = 0
  private nearTall = false
  private roads!: RoadNet
  private borders!: ReturnType<typeof buildBorders>

  // the rideable ferry
  private readonly ferry = ferryModel(1.5)
  private ride: { t: number; dur: number; curve: THREE.CatmullRomCurve3; dest: string } | null = null

  // state
  private paused = false
  private near: string | null = null
  private warp: { fx: number; fz: number; tx: number; tz: number; t: number; dur: number; id: string } | null = null
  private flight: { fx: number; fz: number; tx: number; tz: number; t: number; dur: number; id: string; alt: number } | null = null
  private secretUnlocked = false
  private secretGrow = 1
  private secretGroup!: THREE.Group
  private pathFx!: ReturnType<typeof lightPath>
  private readonly discovered = new Set<string>()
  private readonly shards: Array<{ group: THREE.Group; collected: boolean; x: number; z: number }> = []
  private shardCount = 0

  // camera
  private camZoom = 3.4
  private userZoom = 1 // set with the wheel, pinch, +/- keys or the on-screen buttons
  private userZoomCur = 1
  private introHold = true
  private portrait = false
  private readonly pointers = new Map<number, { x: number; y: number }>()
  private pinchDist = 0
  private pinched = false
  private readonly camLook = new THREE.Vector3(SPAWN.x, 0, SPAWN.z)
  private inset = { x: 0, y: 0 }
  private insetCur = { x: 0, y: 0 }
  private fovKick = 0
  private width = 1
  private height = 1
  private pixelRatio = 1
  private readonly debugTop = new URLSearchParams(location.search).get('top')

  // perf governor
  private frames = 0
  private frameAcc = 0
  private degradeStep = 0
  private readonly noGovernor = location.search.includes('nogov')
  private disposed = false
  private t = 0
  private throttleFrame = 0
  private downAt: { x: number; y: number; t: number } | null = null

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly host: HTMLElement,
    private readonly ev: WorldEvents = {},
  ) {
    const coarse = window.matchMedia('(pointer: coarse)').matches
    this.pixelRatio = LITE ? 1 : Math.min(window.devicePixelRatio || 1, coarse ? 1.6 : 2)

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(this.pixelRatio)
    this.renderer.setClearColor(BG, 1)

    this.scene.background = new THREE.Color(BG)
    this.scene.fog = new THREE.FogExp2(BG, 0.0019)

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.5, 6000)

    this.labelRenderer = new CSS2DRenderer()
    const ld = this.labelRenderer.domElement
    ld.className = 'label-layer'
    host.appendChild(ld)

    // The scene is full of sub-pixel lights (windows, neon lines). Without multisampling they crawl and sparkle
    // whenever the camera moves, and bloom amplifies that into flicker, so the main target is MSAA.
    const msaa = new THREE.WebGLRenderTarget(1, 1, { type: LITE ? THREE.UnsignedByteType : THREE.HalfFloatType, samples: LITE ? 0 : coarse ? 2 : 4 })
    this.composer = new EffectComposer(this.renderer, msaa)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), coarse ? 0.4 : 0.5, 0.5, 0.4)
    this.bloom.enabled = !LITE
    this.composer.addPass(this.bloom)
    // If the browser drops the graphics context (weak GPU, memory pressure) the canvas goes black for good.
    // Remember that, and come back in the lite tier once; if it happens again, point at the plain CV.
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault()
      if (LITE) this.ev.onSlow?.()
      else {
        leaveHd()
      }
    })
    this.composer.addPass(new OutputPass())

    // lighting only matters for the character (everything else is unlit neon)
    this.scene.add(new THREE.HemisphereLight(0xaec6ff, 0x2a1050, 1.7))
    const sun = new THREE.DirectionalLight(0xdfe9ff, 1.6)
    sun.position.set(-40, 90, 60)
    this.scene.add(sun)

    this.buildMap()
    this.buildZones()
    this.buildSecret()
    this.buildShards()
    this.validatePlacement()

    this.car.group.visible = false
    this.player.add(this.character.group, this.car.group, this.playerLight)
    this.playerLight.position.set(0, 9, 5) // in front of and above him: a soft rim, never a spotlight on the hair
    this.flightJet.visible = false
    this.flightJet.scale.setScalar(1.1)
    this.trail = new Trail('#7fe9ff', 50)
    this.scene.add(this.player, this.trail.points, this.flightJet)

    this.resize()
    this.snapCamera()

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(host)
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('blur', this.onBlur)
    canvas.addEventListener('pointerdown', this.onPointerDown)
    canvas.addEventListener('pointermove', this.onPointerMove)
    canvas.addEventListener('pointerup', this.onPointerUp)
    canvas.addEventListener('pointercancel', this.onPointerUp)
    canvas.addEventListener('wheel', this.onWheel, { passive: false })

    this.renderer.setAnimationLoop(this.loop)
    queueMicrotask(() => this.ev.onReady?.())
  }

  // ───────────────────────────── public API ─────────────────────────────

  /** Stop/resume rendering entirely (e.g. while the full-page CV is open). */
  setActive(on: boolean) {
    if (this.disposed) return
    if (on) {
      this.last = performance.now()
      this.renderer.setAnimationLoop(this.loop)
    } else {
      this.renderer.setAnimationLoop(null)
    }
  }

  /** Leave the splash hold — the camera swoops down to the player. */
  begin() {
    this.introHold = false
  }

  setPaused(p: boolean) {
    this.paused = p
    if (p) {
      this.keys.clear()
      this.joy = { x: 0, y: 0 }
      this.target = null
    }
  }

  setInset(x: number, y: number) {
    this.inset = { x, y }
  }

  /** Close-up on the character (used by the Player card). */
  setPortrait(on: boolean) {
    if (on) this.setDriving(false) // the close-up is of the character, not the car
    this.portrait = on
  }

  setJoystick(x: number, y: number) {
    this.joy = { x, y }
  }

  setBoost(b: boolean) {
    this.boost = b
  }

  /** Hop in (or out of) the Red Bull-style F1 car: much faster than walking, and quickest on the paved route. */
  setDriving(on: boolean) {
    if (on === this.driving) return
    if (on && (this.ride || this.flight || this.warp || this.portrait)) return
    this.driving = on
    this.car.group.visible = on
    this.character.group.visible = !on
    this.target = null
    this.ping(this.pos.x, this.pos.z, on ? '#ff3b5c' : '#00f0ff', 10)
    this.ev.onDrive?.(on)
  }

  toggleDriving() {
    this.setDriving(!this.driving)
  }

  /** Fast travel. Crossing between islands plays the flight. */
  warpTo(id: string) {
    const z = zoneById(id)
    if (!z || this.warp || this.flight || this.ride) return
    if (id === SECRET_ZONE.id && !this.secretUnlocked) return
    let tx = z.x
    let tz = z.z + (z.kind === 'gate' ? 12 : 9)
    if (z.kind === 'landmark') {
      // bridges, towers on the shore: land on the nearest walkable ground
      const p = this.nearestWalkable(z.x, z.z + 4)
      tx = p[0]
      tz = p[1]
    }
    const dist = Math.hypot(tx - this.pos.x, tz - this.pos.z)
    this.target = null
    // each world-tour stop is its own island, so hopping between them is a flight too
    const otherTourIsland = z.island === 'tour' && this.island === 'tour' && this.tourIslandId() !== z.id
    if (z.island !== this.island || otherTourIsland) {
      this.setDriving(false)
      // long hops (the world tour) fly higher and take a little longer
      const far = Math.hypot(tx - this.pos.x, tz - this.pos.z)
      this.flight = { fx: this.pos.x, fz: this.pos.z, tx, tz, t: 0, dur: Math.min(9, 5.6 + far / 1100), id, alt: 85 + Math.min(150, far * 0.05) }
      return
    }
    // within an island a warp is allowed while driving; the car just comes along
    if (dist < 2) {
      this.ev.onWarpEnd?.(id, false)
      return
    }
    this.warp = { fx: this.pos.x, fz: this.pos.z, tx, tz, t: 0, dur: Math.min(1.7, 0.55 + dist / 240), id }
  }

  restoreShards(indices: number[]) {
    indices.forEach((i) => {
      const s = this.shards[i]
      if (s && !s.collected) {
        s.collected = true
        s.group.visible = false
        this.shardCount++
      }
    })
  }

  restoreGems(ids: string[]) {
    ids.forEach((id) => this.discoverGem(id, true))
  }

  /** Reveal the gate and its path of light. `instant` skips the animation (restoring saved progress). */
  unlockSecret(instant = false) {
    if (this.secretUnlocked) return
    this.secretUnlocked = true
    this.secretGroup.visible = true
    this.secretGrow = instant ? 1 : 0
    this.pathFx.setReveal(instant ? 1 : 0)
    if (instant) this.finishSecretWalkable()
    this.labels.get(SECRET_ZONE.id)?.el.classList.remove('is-hidden')
    this.ping(SECRET_ZONE.x, SECRET_ZONE.z, SECRET_ZONE.color, 40)
    if (!instant) this.ev.onSecretUnlocked?.()
  }

  dispose() {
    this.disposed = true
    this.renderer.setAnimationLoop(null)
    this.ro.disconnect()
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('blur', this.onBlur)
    this.canvas.removeEventListener('pointerdown', this.onPointerDown)
    this.canvas.removeEventListener('pointermove', this.onPointerMove)
    this.canvas.removeEventListener('pointerup', this.onPointerUp)
    this.canvas.removeEventListener('pointercancel', this.onPointerUp)
    this.canvas.removeEventListener('wheel', this.onWheel)
    this.labelRenderer.domElement.remove()
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose?.()
      const mat = m.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
      else mat?.dispose?.()
    })
    this.composer.dispose()
    this.renderer.dispose()
  }

  // ───────────────────────────── scene construction ─────────────────────────────

  /** Add a landmark. Pass a position to place it; omit it for objects that carry their own absolute transform (bridges, fauna). */
  private add(t: Tickable | null, x?: number, y = 0, z = 0, ry = 0): THREE.Object3D | null {
    if (!t) return null
    if (x !== undefined) {
      t.obj.position.set(x, y, z)
      t.obj.rotation.y = ry
    }
    this.scene.add(t.obj)
    if (x !== undefined) this.tagRegion(t.obj, regionAt(x, z))
    if (t.tick) this.ticks.push(t.tick)
    return t.obj
  }

  /** Re-write every place label's text (used when the language changes). */
  refreshLabels(textOf: (id: string) => { name: string; tag: string } | null) {
    this.labels.forEach((l, id) => {
      const tx = textOf(id)
      if (!tx) return
      if (l.scenic) {
        const s = l.el.querySelector('span')
        if (s) s.textContent = tx.name
      } else {
        const n = l.el.querySelector('.zl-name')
        const g = l.el.querySelector('.zl-tag')
        if (n) n.textContent = tx.name
        if (g) g.textContent = tx.tag
        l.el.setAttribute('aria-label', tx.name)
      }
    })
  }

  private makeLabel(id: string, name: string, tag: string, color: string, x: number, z: number, y: number, o: { hidden?: boolean; scenic?: boolean; range?: number } = {}) {
    const el = document.createElement(o.scenic ? 'div' : 'button')
    if (!o.scenic) (el as HTMLButtonElement).type = 'button'
    el.className = (o.scenic ? 'scenic-label' : 'zone-label') + (o.hidden ? ' is-hidden' : '')
    el.style.setProperty('--c', color)
    if (!o.scenic) el.setAttribute('aria-label', `Travel to ${name}`)
    el.innerHTML = o.scenic ? `<span>${name}</span>` : `<span class="zl-name">${name}</span><span class="zl-tag">${tag}</span>`
    if (!o.scenic) {
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        this.ev.onLabelClick?.(id)
      })
    }
    const obj = new CSS2DObject(el)
    this.tagRegion(obj, regionAt(x, z))
    obj.position.set(x, GROUND_Y + y, z)
    this.scene.add(obj)
    this.labels.set(id, { el, x, z, range: o.range ?? 260, last: -1, scenic: !!o.scenic })
  }

  private buildMap() {
    resetTerrain()
    const land = buildLand()
    const city = buildCity()
    this.scene.add(buildWater(), land, city, stars())
    for (const grp of [land, city]) for (const child of grp.children) this.tagRegion(child, child.userData.regionId as string)

    // a low harvest moon over the Black Sea
    const moon = glowSprite(0xdfe8ff, 150, 0.35)
    moon.position.set(300, 420, -2300)
    const disc = glowSprite(0xf4f8ff, 46, 1)
    disc.position.copy(moon.position)
    this.scene.add(moon, disc)

    // the journey: a paved road with the glowing route laid along it
    const roadsIst = buildRoads([ROUTE_EU, ROUTE_AS, ...ROUTE_LINKS])
    const roadsMt = buildRoads([ROUTE_MT])
    this.roads = { obj: roadsIst.obj, on: (x, z) => roadsIst.on(x, z) || roadsMt.on(x, z) }
    this.scene.add(roadsIst.obj, roadsMt.obj)
    this.tagRegion(roadsIst.obj, 'ist')
    this.tagRegion(roadsMt.obj, 'mt')
    for (const [route, rid] of [[ROUTE_EU, 'ist'], [ROUTE_AS, 'ist'], [ROUTE_MT, 'mt']] as const) {
      const gr = groundRoute(route as P[])
      this.scene.add(gr)
      this.tagRegion(gr, rid)
    }
    // the edge of the map
    this.borders = buildBorders(IST_BOUNDS)
    this.scene.add(this.borders.obj)
    this.tagRegion(this.borders.obj, 'ist')
    let bi = 0
    const edgeLabel = (x: number, z: number) => this.makeLabel(`border-${bi++}`, 'Edge of the map', '', '#ff2bd6', x, z, 15, { scenic: true, range: 150 })
    for (let z = IST_BOUNDS.z0 + 130; z < IST_BOUNDS.z1; z += 260) {
      edgeLabel(IST_BOUNDS.x0, z)
      edgeLabel(IST_BOUNDS.x1, z)
    }
    for (let x = IST_BOUNDS.x0 + 150; x < IST_BOUNDS.x1; x += 300) {
      edgeLabel(x, IST_BOUNDS.z0)
      edgeLabel(x, IST_BOUNDS.z1)
    }
    // …the ferry crossing, drawn on the water between the two piers
    this.scene.add(
      pathTube(FERRY_PATH.map(([x, z]) => new THREE.Vector3(x, 0.4, z)), {
        radius: 0.3,
        halo: 1.2,
        from: '#ffb800',
        to: '#00f0ff',
        pulse: 34,
      }),
    )
    this.scene.add(this.ferry)
    this.tagRegion(this.ferry, 'ist')
    this.placeFerry('E')
    // …and the flight between the two gates
    const ist = zones.find((z) => z.id === 'ist')!
    const mla = zones.find((z) => z.id === 'mla')!
    const mid = new THREE.Vector3((ist.x + mla.x) / 2, 150, (ist.z + mla.z) / 2)
    this.scene.add(
      pathTube([new THREE.Vector3(ist.x, GROUND_Y + 10, ist.z), mid.clone().lerp(new THREE.Vector3(ist.x, 40, ist.z), 0.5), mid, mid.clone().lerp(new THREE.Vector3(mla.x, 40, mla.z), 0.5), new THREE.Vector3(mla.x, GROUND_Y + 10, mla.z)], {
        radius: 0.35,
        halo: 1.4,
        from: '#00f0ff',
        to: '#ffb800',
        pulse: 80,
      }),
    )

    // bridges
    for (const b of bridges) {
      this.tagRegion(b.kind === 'plain' ? this.add(plainBridge(b)) : this.add(suspensionBridge(b, b.id === 'bosphorus' ? 31 : 25)), 'ist')
    }

    // landmarks
    for (const s of scenics) {
      const y = GROUND_Y
      switch (s.id) {
        case 'galata':
          this.add(galataTower(), s.x, y, s.z)
          break
        case 'sultanahmet':
          this.add(sultanahmet(), s.x, y, s.z, -0.2)
          break
        case 'maiden':
          this.add(maidenTower(), s.x, y, s.z)
          break
        case 'camlica':
          this.add(camlicaTower(), s.x, y, s.z)
          break
        case 'rumeli':
          this.add(rumeliHisari(), s.x, y, s.z, 0.5)
          break
        case 'stadium':
          this.add(stadium(), s.x, y, s.z, 0) // the badge faces the default camera (south)
          break
        case 'istpark':
          this.add(istanbulPark(), s.x, y, s.z)
          break
        case 'dolmabahce':
          this.add(dolmabahce(), s.x, y, s.z, 1.0) // facade toward the Bosphorus (south-east)
          break
        case 'valletta':
          this.add(valletta(), s.x, y, s.z, -0.3)
          break
        case 'mdina':
          this.add(mdinaWalls(), s.x, y, s.z)
          break
        case 'comino':
          this.add(comino(), s.x, 0.3, s.z)
          break
      }
      if (s.tag) this.makeLabel(s.id, s.name, '', '#9fd6ff', s.x, s.z, SCENIC_LABEL_Y[s.id] ?? 20, { scenic: true, range: 190 })
    }

    this.add(createFerries())
    this.add(this.gullFlock)
  }

  private buildZones() {
    const make = (z: ZoneDef, platformR: number) => {
      const g = new THREE.Group()
      g.position.set(z.x, GROUND_Y, z.z)
      if (platformR > 0) {
        const plat = hexPlatform(z.color, platformR)
        g.add(plat.obj)
        this.ticks.push(plat.tick!)
      }
      const lm = z.kind === 'tour' ? buildTourLandmark(z.id, z.color) : buildLandmark(z.id, z.color)
      if (lm) {
        g.add(lm.obj)
        if (lm.tick) this.ticks.push(lm.tick)
      }
      if (!z.hidden) {
        const b = beam(z.color, z.kind === 'gate' ? 60 : 85)
        g.add(b.mesh)
        this.beams.set(z.id, { mat: b.mat, zone: z })
        this.ticks.push((t) => (b.mat.uniforms.uTime.value = t))
      }
      this.scene.add(g)
      this.tagRegion(g, regionAt(z.x, z.z))
      this.makeLabel(z.id, z.name, z.tag, z.color, z.x, z.z, LABEL_Y[z.id] ?? (z.kind === 'tour' ? 38 : 22), { hidden: z.hidden, range: z.kind === 'tour' ? 330 : undefined })
    }
    zones.forEach((z) => {
      make(z, z.kind === 'pier' ? 7 : 15)
      if (z.kind === 'pier') {
        // the planks reach out over the water, so let people walk to the end of them
        const dock = z.id === 'pierE' ? DOCK_E : DOCK_A
        const len = Math.hypot(dock[0] - z.x, dock[1] - z.z)
        const k = (len - 5) / len
        addWalkable(rectPoly([z.x, z.z], [z.x + (dock[0] - z.x) * k, z.z + (dock[1] - z.z) * k], 2.6))
      }
    })
    gems.forEach((z) => make(z, 9))
    tourZones.forEach((z) => make(z, 0))
  }

  /** Moor the ferry at one of its two docks, bow pointing along the route. */
  private placeFerry(at: 'E' | 'A') {
    const dock = at === 'E' ? DOCK_E : DOCK_A
    const next = at === 'E' ? FERRY_PATH[1] : FERRY_PATH[FERRY_PATH.length - 2]
    this.ferry.position.set(dock[0], 0.1, dock[1])
    this.ferry.rotation.set(0, Math.atan2(-(next[1] - dock[1]), next[0] - dock[0]), 0)
  }

  /** Board the ferry at a pier and sail to the other shore. */
  rideFerry(fromPierId: string) {
    if (this.ride || this.flight || this.warp) return
    this.setDriving(false)
    const fromE = fromPierId === 'pierE'
    const pts = FERRY_PATH.map(([x, z]) => new THREE.Vector3(x, 0, z))
    if (!fromE) pts.reverse()
    this.placeFerry(fromE ? 'E' : 'A')
    this.target = null
    this.ride = { t: 0, dur: 6, curve: new THREE.CatmullRomCurve3(pts, false, 'centripetal'), dest: fromE ? 'pierA' : 'pierE' }
  }

  /** Zoom the camera in (<1) or out (>1) by a factor. */
  zoomBy(factor: number) {
    this.userZoom = Math.min(2.4, Math.max(0.45, this.userZoom * factor))
  }

  private buildSecret() {
    const z = SECRET_ZONE
    const g = new THREE.Group()
    g.position.set(z.x, 0.45, z.z)
    const plat = hexPlatform(z.color, 16)
    g.add(plat.obj)
    this.ticks.push(plat.tick!)
    const gate = toriiGate(z.color)
    // face the shore the path comes from
    gate.obj.rotation.y = Math.atan2(SECRET_PATH_START[0] - z.x, SECRET_PATH_START[1] - z.z)
    g.add(gate.obj)
    this.ticks.push(gate.tick!)
    const b = beam(z.color, 140, 1.1)
    g.add(b.mesh)
    this.beams.set(z.id, { mat: b.mat, zone: z })
    this.ticks.push((t) => (b.mat.uniforms.uTime.value = t))
    g.visible = false
    this.secretGroup = g
    this.scene.add(g)

    this.pathFx = lightPath(SECRET_PATH_START, [z.x, z.z], 3.6)
    this.scene.add(this.pathFx.obj)
    this.ticks.push((t) => this.pathFx.tick(t))

    this.makeLabel(z.id, z.name, z.tag, z.color, z.x, z.z, 24, { hidden: true, range: 600 })
  }

  private finishSecretWalkable() {
    const z = SECRET_ZONE
    addWalkable(rectPoly(SECRET_PATH_START, [z.x, z.z], 3.6))
    addWalkable(circlePoly(z.x, z.z, 15, 20))
  }

  private buildShards() {
    SHARD_POSITIONS.forEach((p, i) => {
      const g = new THREE.Group()
      g.position.set(p.x, GROUND_Y + 3.2, p.z)
      const geo = new THREE.OctahedronGeometry(1.1)
      g.add(new THREE.LineSegments(new THREE.WireframeGeometry(geo), new THREE.LineBasicMaterial({ color: 0xff3b5c })))
      g.add(new THREE.Mesh(geo, glowMat(0xff3b5c, 0.35)))
      const s = glowSprite(0xff3b5c, 11, 0.4)
      g.add(s)
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 6, 6), glowMat(0xff3b5c, 0.5))
      col.position.y = -0.2
      g.add(col)
      this.scene.add(g)
      this.shards.push({ group: g, collected: false, x: p.x, z: p.z })
      this.ticks.push((t) => {
        if (g.visible) {
          g.rotation.y = t * 1.3 + i
          g.position.y = GROUND_Y + 3.2 + Math.sin(t * 1.6 + i * 2) * 0.5
          s.scale.setScalar(10 + Math.sin(t * 2.4 + i) * 2.2)
        }
      })
    })
  }

  /** Dev guard: warn if a zone, gem or fragment ended up in the water. */
  private validatePlacement() {
    if (!import.meta.env.DEV) return
    for (const z of [...zones, ...gems]) {
      if (!isWalkable(z.x, z.z + (z.kind === 'pier' ? 0 : 9))) console.warn(`[map] ${z.id} is not on walkable ground`, z.x.toFixed(0), z.z.toFixed(0))
    }
    SHARD_POSITIONS.forEach((p, i) => {
      if (!isWalkable(p.x, p.z)) console.warn(`[map] fragment ${i} is not on walkable ground`)
    })
    if (!isWalkable(SPAWN.x, SPAWN.z)) console.warn('[map] spawn is not on walkable ground')
    if (!isWalkable(SECRET_PATH_START[0], SECRET_PATH_START[1])) console.warn('[map] secret path starts in the water')
  }

  // ───────────────────────────── input ─────────────────────────────

  private readonly onKeyDown = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement | null)?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const k = e.key.toLowerCase()
    if (k === '+' || k === '=') return void this.zoomBy(0.87)
    if (k === '-' || k === '_') return void this.zoomBy(1.15)
    if (k === 'f' && !this.paused && !this.introHold) return void this.toggleDriving()
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'shift'].includes(k)) {
      if (!this.paused) {
        this.keys.add(k)
        if (k.startsWith('arrow')) e.preventDefault()
      }
    }
    if ((k === 'e' || k === 'enter' || k === ' ') && tag !== 'BUTTON' && tag !== 'A') {
      if (k === ' ') e.preventDefault()
      this.ev.onInteract?.()
    }
  }

  private readonly onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase())
  }

  private readonly onBlur = () => this.keys.clear()

  private readonly onPointerDown = (e: PointerEvent) => {
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()]
      this.pinchDist = Math.hypot(a.x - b.x, a.y - b.y)
      this.pinched = true
    }
    this.downAt = { x: e.clientX, y: e.clientY, t: performance.now() }
  }

  private readonly onPointerMove = (e: PointerEvent) => {
    if (!this.pointers.has(e.pointerId)) return
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (this.pointers.size === 2 && this.pinchDist > 0) {
      const [a, b] = [...this.pointers.values()]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      this.zoomBy(this.pinchDist / Math.max(d, 1))
      this.pinchDist = d
    }
  }

  private readonly onWheel = (e: WheelEvent) => {
    e.preventDefault()
    this.zoomBy(Math.exp(e.deltaY * 0.0011))
  }

  private readonly onPointerUp = (e: PointerEvent) => {
    this.pointers.delete(e.pointerId)
    if (this.pointers.size < 2) this.pinchDist = 0
    if (this.pinched) {
      // the lift-off of a pinch must not count as a tap-to-travel
      if (this.pointers.size === 0) this.pinched = false
      this.downAt = null
      return
    }
    const d = this.downAt
    this.downAt = null
    if (!d || this.paused || this.introHold || this.warp || this.flight || this.ride) return
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8 || performance.now() - d.t > 450) return
    const rect = this.canvas.getBoundingClientRect()
    const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
    const ray = new THREE.Raycaster()
    ray.setFromCamera(ndc, this.camera)
    const hit = new THREE.Vector3()
    if (ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -GROUND_Y), hit)) {
      this.target = { x: hit.x, z: hit.z }
      this.ping(hit.x, hit.z, '#00f0ff', 5)
    }
  }

  // ───────────────────────────── helpers ─────────────────────────────

  private walkable(x: number, z: number): boolean {
    if (!isWalkable(x, z)) return false
    if (islandOf(x, z) === 'ist') return x > IST_BOUNDS.x0 && x < IST_BOUNDS.x1 && z > IST_BOUNDS.z0 && z < IST_BOUNDS.z1
    return true
  }

  // ───────────────────────────── regions: draw only what is near ─────────────────────────────

  private readonly regionNodes = new Map<string, THREE.Object3D[]>()
  private readonly regionOn = new Map<string, boolean>()
  private regionClock = 1

  /** Register an object with a region ('ist', 'mt', 'tour:<id>') so it can be switched off when you are far away. */
  private tagRegion(obj: THREE.Object3D | null, rid: string) {
    if (!obj) return
    const list = this.regionNodes.get(rid) ?? []
    list.push(obj)
    this.regionNodes.set(rid, list)
  }

  /** Show a region while the player is inside it or within ~450 units of it; hide everything else. */
  private updateRegions(dt: number, force = false) {
    this.regionClock += dt
    if (!force && this.regionClock < 0.25) return
    this.regionClock = 0
    for (const b of REGION_BOUNDS()) {
      const on = this.debugTop ? true : Math.hypot(this.pos.x - b.x, this.pos.z - b.z) < b.r + 450
      if (this.regionOn.get(b.id) === on) continue
      this.regionOn.set(b.id, on)
      for (const n of this.regionNodes.get(b.id) ?? []) n.visible = on
    }
  }

  // ───────────────────────────── blank-canvas detection ─────────────────────────────

  private verified = false
  private verifyTries = 0
  private nextVerify = 2

  /** Right after drawing, sample a grid of pixels. A canvas that never leaves its clear colour means nothing is drawing. */
  private verifyFrame(t: number) {
    if (t < this.nextVerify || document.hidden || this.debugTop) return
    this.nextVerify = t + 1
    const gl = this.renderer.getContext()
    if (gl.isContextLost()) return void this.onBlank()
    const w = gl.drawingBufferWidth
    const h = gl.drawingBufferHeight
    const px = new Uint8Array(4)
    let lo = 765
    let hi = 0
    for (let iy = 1; iy <= 6; iy++) {
      for (let ix = 1; ix <= 6; ix++) {
        gl.readPixels(Math.floor((w * ix) / 7), Math.floor((h * iy) / 7), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px)
        const s = px[0] + px[1] + px[2]
        if (s < lo) lo = s
        if (s > hi) hi = s
      }
    }
    if (hi - lo > 24) {
      this.verified = true
      return
    }
    if (++this.verifyTries >= 3) this.onBlank()
  }

  private onBlank() {
    this.verified = true // stop checking
    if (LITE) this.ev.onBlank?.()
    else {
      leaveHd()
    }
  }

  /** Which world-tour island the player is on (or null). */
  private tourIslandId(): string | null {
    for (const t of TOUR_ISLANDS) if (Math.hypot(this.pos.x - t.at[0], this.pos.z - t.at[1]) < t.r * 1.3) return t.id
    return null
  }

  /** The closest walkable point to (x, z), searching outwards in rings. */
  private nearestWalkable(x: number, z: number): [number, number] {
    if (this.walkable(x, z)) return [x, z]
    for (let r = 3; r <= 60; r += 3) {
      for (let a = 0; a < 16; a++) {
        const px = x + Math.cos((a / 16) * Math.PI * 2) * r
        const pz = z + Math.sin((a / 16) * Math.PI * 2) * r
        if (this.walkable(px, pz)) return [px, pz]
      }
    }
    return [x, z]
  }

  private ping(x: number, z: number, color: string, size = 8) {
    const mesh = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 48).rotateX(-Math.PI / 2), glowMat(color, 0.9))
    mesh.position.set(x, GROUND_Y + 0.2, z)
    this.scene.add(mesh)
    this.pings.push({ mesh, t: 0, dur: 0.9, size })
  }

  private discoverGem(id: string, silent = false) {
    if (this.discovered.has(id)) return
    this.discovered.add(id)
    const l = this.labels.get(id)
    l?.el.classList.remove('is-hidden')
    const z = zoneById(id)
    if (z && !silent) {
      this.ping(z.x, z.z, z.color, 20)
      this.ev.onGem?.(id)
    }
  }

  private resize() {
    const w = Math.max(1, this.host.clientWidth)
    const h = Math.max(1, this.host.clientHeight)
    this.width = w
    this.height = h
    this.renderer.setPixelRatio(this.pixelRatio)
    this.renderer.setSize(w, h, false)
    this.composer.setPixelRatio(this.pixelRatio)
    this.composer.setSize(w, h)
    this.labelRenderer.setSize(w, h)
    this.camera.aspect = w / h
    this.applyView()
  }

  private applyView() {
    if (Math.abs(this.insetCur.x) > 0.5 || Math.abs(this.insetCur.y) > 0.5) {
      this.camera.setViewOffset(this.width, this.height, this.insetCur.x, this.insetCur.y, this.width, this.height)
    } else {
      this.camera.clearViewOffset()
    }
    this.camera.updateProjectionMatrix()
  }

  private cameraOffset(): THREE.Vector3 {
    const portrait = this.camera.aspect < 1
    return portrait ? new THREE.Vector3(0, 40, 40) : new THREE.Vector3(0, 28, 34)
  }

  private snapCamera() {
    if (this.debugTop) {
      const c = this.debugTop === 'mt' ? MALTA_ORIGIN : ([300, 40] as const)
      this.scene.fog = null
      this.pos.set(c[0], GROUND_Y, c[1])
      this.camera.fov = 38
      this.camera.position.set(c[0], this.debugTop === 'mt' ? 900 : 2500, c[1] + 0.001)
      this.camera.lookAt(c[0], 0, c[1])
      this.camera.updateProjectionMatrix()
      return
    }
    const o = this.cameraOffset().multiplyScalar(this.camZoom)
    this.camera.position.copy(this.pos).add(o)
    this.camera.lookAt(this.camLook)
  }

  private degrade() {
    this.degradeStep++
    if (this.degradeStep === 1) {
      // cheapest wins first: native resolution and no multisampling
      this.pixelRatio = 1
      for (const rt of [this.composer.renderTarget1, this.composer.renderTarget2]) {
        rt.samples = 0
        rt.dispose()
      }
      this.resize()
    } else if (this.degradeStep === 2) {
      this.bloom.enabled = false
    } else if (this.degradeStep === 3) {
      this.pixelRatio = 0.75
      this.resize()
    } else if (this.degradeStep === 4) {
      this.ev.onSlow?.()
    }
  }

  private placeName(): string {
    if (this.ride) return 'On the Bosphorus ferry'
    if (this.island === 'tour') {
      for (const t of TOUR_ISLANDS) if (Math.hypot(this.pos.x - t.at[0], this.pos.z - t.at[1]) < t.r * 1.2) return t.name
      return 'Over Europe'
    }
    const b = bridgeAt(this.pos.x, this.pos.z)
    if (b) return b.name
    if (this.secretUnlocked && Math.hypot(this.pos.x - SECRET_ZONE.x, this.pos.z - SECRET_ZONE.z) < 60) return 'Sea of Marmara'
    let best = ''
    let bd = 85 * 85
    for (const d of districts) {
      if (d.island !== this.island) continue
      const dd = (d.x - this.pos.x) ** 2 + (d.z - this.pos.z) ** 2
      if (dd < bd) {
        bd = dd
        best = d.name
      }
    }
    return best || (this.island === 'mt' ? 'Malta' : 'Istanbul')
  }

  // ───────────────────────────── frame loop ─────────────────────────────

  private readonly loop = () => {
    if (this.disposed) return
    const now = performance.now()
    const dt = Math.min((now - this.last) / 1000, 0.05)
    this.last = now
    this.t += dt
    const t = this.t

    // Self-heal: if a resize event was missed (or the pixel ratio changed with browser zoom) the render target
    // stays at its old size and only part of the screen draws. Compare against the real size every frame.
    const hw = this.host.clientWidth
    const hh = this.host.clientHeight
    if (hw > 0 && hh > 0 && (hw !== this.width || hh !== this.height)) this.resize()

    if (this.degradeStep < 4 && t > 3 && !this.noGovernor) {
      this.frames++
      this.frameAcc += dt
      if (this.frames >= 90) {
        if (this.frameAcc / this.frames > 0.034) this.degrade()
        this.frames = 0
        this.frameAcc = 0
      }
    }

    this.updatePlayer(dt, t)
    this.updateRegions(dt)
    this.updateZones(dt)
    this.ticks.forEach((fn) => fn(t, dt))
    terrainTick(t, this.pos.x, this.pos.z)
    this.gullFlock.setFollow(this.pos.x, this.pos.z)
    this.updatePings(dt)
    this.borders.update(t, this.pos.x, this.pos.z)
    this.updateCamera(dt)

    if (this.secretUnlocked && this.secretGrow < 1) {
      this.secretGrow = Math.min(1, this.secretGrow + dt / 3.4)
      const e = easeInOut(this.secretGrow)
      this.secretGroup.scale.setScalar(Math.max(0.01, Math.min(1, e * 2)))
      this.pathFx.setReveal(e)
      if (this.secretGrow >= 1) this.finishSecretWalkable()
    }

    this.composer.render()
    if (!this.verified) this.verifyFrame(t)
    this.labelRenderer.render(this.scene, this.camera)
  }

  private updatePlayer(dt: number, t: number) {
    let speed = 0
    if (this.ride) {
      // standing on the upper deck while the ferry sails the route
      const r = this.ride
      r.t = Math.min(1, r.t + dt / r.dur)
      const u = r.t * r.t * (3 - 2 * r.t)
      const p = r.curve.getPointAt(u)
      const tan = r.curve.getTangentAt(u)
      this.ferry.position.set(p.x, 0.1 + Math.sin(t * 1.6) * 0.05, p.z)
      this.ferry.rotation.y = Math.atan2(-tan.z, tan.x)
      this.ferry.rotation.z = Math.sin(t * 1.1) * 0.02
      this.pos.set(p.x, 3.15, p.z)
      this.yaw = Math.atan2(tan.x, tan.z)
      this.vel.set(0, 0, 0)
      this.fovKick = 0.15 * Math.sin(Math.PI * r.t)
      if (r.t >= 1) {
        const dest = zoneById(r.dest)!
        this.placeFerry(r.dest === 'pierA' ? 'A' : 'E')
        this.ride = null
        this.pos.set(dest.x, GROUND_Y, dest.z)
        this.side = dest.side
        this.ev.onRideEnd?.(dest.id)
      }
    } else if (this.flight) {
      const f = this.flight
      f.t = Math.min(1, f.t + dt / f.dur)
      const e = easeInOut(f.t)
      const dx = f.tx - f.fx
      const dz = f.tz - f.fz
      this.pos.x = f.fx + dx * e
      this.pos.z = f.fz + dz * e
      const alt = Math.sin(Math.PI * e) * f.alt
      this.pos.y = GROUND_Y + alt
      this.fovKick = Math.sin(Math.PI * f.t) * 0.7
      const heading = Math.atan2(-dz, dx)
      this.flightJet.visible = true
      this.character.group.visible = false
      this.flightJet.position.set(this.pos.x, this.pos.y + 2, this.pos.z)
      this.flightJet.rotation.set(0, heading, 0)
      this.flightJet.rotateZ(Math.cos(Math.PI * e) * 0.35) // pitch up on climb, down on descent
      this.vel.set(dx, 0, dz).normalize().multiplyScalar(80)
      this.island = islandOf(this.pos.x, this.pos.z)
      speed = 0
      if (f.t >= 1) {
        const id = f.id
        this.flight = null
        this.flightJet.visible = false
        this.character.group.visible = true
        this.pos.y = GROUND_Y
        this.vel.set(0, 0, 0)
        this.island = islandOf(this.pos.x, this.pos.z)
        this.yaw = Math.PI
        this.ev.onWarpEnd?.(id, true)
      }
    } else if (this.warp) {
      const w = this.warp
      w.t = Math.min(1, w.t + dt / w.dur)
      const e = easeInOut(w.t)
      this.pos.x = w.fx + (w.tx - w.fx) * e
      this.pos.z = w.fz + (w.tz - w.fz) * e
      this.fovKick = Math.sin(Math.PI * w.t)
      const dx = w.tx - w.fx
      const dz = w.tz - w.fz
      this.yaw = Math.atan2(dx, dz)
      this.vel.set(dx, 0, dz).normalize().multiplyScalar(60)
      speed = 52
      if (w.t >= 1) {
        const id = w.id
        this.warp = null
        this.vel.set(0, 0, 0)
        this.ev.onWarpEnd?.(id, false)
      }
    } else {
      this.fovKick *= 1 - damp(6, dt)
      let ix = 0
      let iz = 0
      const blocked = this.paused || this.introHold
      if (!blocked) {
        const k = this.keys
        if (k.has('arrowleft') || k.has('a')) ix -= 1
        if (k.has('arrowright') || k.has('d')) ix += 1
        if (k.has('arrowup') || k.has('w')) iz -= 1
        if (k.has('arrowdown') || k.has('s')) iz += 1
        ix += this.joy.x
        iz += this.joy.y
      }
      let len = Math.hypot(ix, iz)
      if (len > 1) {
        ix /= len
        iz /= len
        len = 1
      }
      const manual = len > 0.06
      let scale = len
      if (manual) {
        this.target = null
      } else if (this.target && !blocked) {
        const dx = this.target.x - this.pos.x
        const dz = this.target.z - this.pos.z
        const d = Math.hypot(dx, dz)
        if (d < 1.4) {
          this.target = null
        } else {
          ix = dx / d
          iz = dz / d
          scale = Math.min(1, d / 8)
        }
      }
      const fast = this.keys.has('shift') || this.boost
      let sp = (fast ? 50 : 26) * scale
      let k = damp(6, dt)
      if (this.driving) {
        // F1 car: roughly three times walking pace, a bit more on the paved route, slower to get going and to stop
        const onRoad = this.roads.on(this.pos.x, this.pos.z)
        sp = (fast ? 118 : 84) * scale * (onRoad ? 1.28 : 1)
        k = damp(2.8, dt)
      }
      this.vel.x += (ix * sp - this.vel.x) * k
      this.vel.z += (iz * sp - this.vel.z) * k

      // move, sliding along the coast when blocked by water
      const nx = this.pos.x + this.vel.x * dt
      const nz = this.pos.z + this.vel.z * dt
      if (this.walkable(nx, nz)) {
        this.pos.x = nx
        this.pos.z = nz
      } else {
        // Hit a wall (the edge of a bridge, a coast): slide along it instead of stopping. Try turning the motion a
        // little either way, then more steeply, and keep most of the speed. This follows diagonal bridge edges,
        // which axis-aligned sliding cannot.
        const sp = Math.hypot(this.vel.x, this.vel.z)
        let slid = false
        if (sp > 0.5) {
          for (const a of [0.3, -0.3, 0.6, -0.6, 0.9, -0.9, 1.25, -1.25, 1.5, -1.5]) {
            const c = Math.cos(a)
            const s = Math.sin(a)
            const vx = this.vel.x * c - this.vel.z * s
            const vz = this.vel.x * s + this.vel.z * c
            const px = this.pos.x + vx * dt
            const pz = this.pos.z + vz * dt
            if (this.walkable(px, pz)) {
              this.pos.x = px
              this.pos.z = pz
              this.vel.x = vx * 0.92
              this.vel.z = vz * 0.92
              slid = true
              break
            }
          }
        }
        if (!slid) {
          this.vel.multiplyScalar(0.2)
          if (this.target) this.target = null
        }
      }
      this.island = islandOf(this.pos.x, this.pos.z)
      speed = Math.hypot(this.vel.x, this.vel.z)
      if (speed > 1.5) {
        const want = Math.atan2(this.vel.x, this.vel.z)
        let diff = want - this.yaw
        diff = Math.atan2(Math.sin(diff), Math.cos(diff))
        this.yaw += diff * damp(this.driving ? 6 : 12, dt)
        this.carSteer += (Math.max(-1, Math.min(1, diff * 1.6)) - this.carSteer) * damp(8, dt)
      } else if (this.driving) {
        this.carSteer *= 1 - damp(6, dt)
      } else if (!this.target) {
        // standing still: turn to face the camera (south) so you can see who you're playing
        const diff = Math.atan2(Math.sin(0 - this.yaw), Math.cos(0 - this.yaw))
        this.yaw += diff * damp(2.6, dt)
      }
      this.pos.y = this.onWaterPath() ? 0.5 : GROUND_Y + (bridgeAt(this.pos.x, this.pos.z) ? 0.05 : 0)
    }

    this.player.position.copy(this.pos)
    this.player.rotation.y = this.yaw
    if (this.driving) {
      this.car.update(dt, t, speed, this.carSteer)
      // the harder you drive, the more the world rushes: a wider field of view
      this.fovKick += (Math.min(0.55, speed / 200) - this.fovKick) * damp(3, dt)
    } else {
      this.character.update(dt, t, speed, (!!this.near && !this.paused && !this.flight) || this.portrait || !!this.ride)
    }
    this.trail.update(dt, new THREE.Vector3(this.pos.x, this.pos.y + 0.4, this.pos.z), speed > (this.driving ? 20 : 4) && !this.flight && !this.ride)
    this.trail.setScale(this.pixelRatio * 0.6)

    this.throttleFrame += dt
    if (this.throttleFrame > 0.1) {
      this.throttleFrame = 0
      const sd = this.ride || this.flight ? null : sideAt(this.pos.x, this.pos.z)
      if (sd) this.side = sd
      this.ev.onFrame?.({ x: this.pos.x, z: this.pos.z, island: this.island, side: this.side, place: this.placeName() })
    }
  }

  /** Walkable ground that is neither land nor a bridge can only be the secret path of light. */
  private onWaterPath(): boolean {
    return this.secretUnlocked && !isLand(this.pos.x, this.pos.z) && !bridgeAt(this.pos.x, this.pos.z)
  }

  private updateZones(dt: number) {
    // proximity — only consider zones on the player's island
    const best = { id: null as string | null, d: Infinity }
    const consider = (z: ZoneDef) => {
      if (z.island !== this.island && z.id !== SECRET_ZONE.id) return
      const d = Math.hypot(this.pos.x - z.x, this.pos.z - z.z)
      if (d < z.radius && d < best.d) {
        best.d = d
        best.id = z.id
      }
    }
    if (!this.flight && !this.ride) {
      zones.forEach(consider)
      gems.forEach(consider)
      landmarkZones.forEach(consider)
      tourZones.forEach(consider)
      if (this.secretUnlocked && this.secretGrow >= 0.85) consider(SECRET_ZONE)
    }
    if (best.id !== this.near) {
      this.near = best.id
      this.nearTall = false
      if (best.id) {
        const z = zoneById(best.id)!
        this.nearTall = z.kind === 'tour' // the world-tour sets are tall: pull the camera back when you stand among them
        if (z.hidden) this.discoverGem(z.id)
        this.ev.onVisit?.(best.id)
        this.ping(z.x, z.z, z.color, 18)
      }
      this.ev.onNear?.(best.id)
    }

    // hidden fragments
    if (!this.flight) {
      for (let i = 0; i < this.shards.length; i++) {
        const s = this.shards[i]
        if (s.collected) continue
        if (Math.hypot(this.pos.x - s.x, this.pos.z - s.z) < 5.5) {
          s.collected = true
          s.group.visible = false
          this.shardCount++
          this.ping(s.x, s.z, '#ff3b5c', 14)
          this.ev.onShard?.(i, this.shardCount)
          if (this.shardCount >= this.shards.length) this.unlockSecret()
        }
      }
    }

    // beams are far-away beacons: dim them once you're standing at the landmark
    this.beams.forEach(({ mat, zone }) => {
      const near = this.near === zone.id
      const u = mat.uniforms.uAlpha
      u.value += ((near ? 0.3 : 1) - u.value) * damp(3, dt)
    })

    // labels fade with distance
    this.labels.forEach((l) => {
      if (l.el.classList.contains('is-hidden')) return
      const d = Math.hypot(this.pos.x - l.x, this.pos.z - l.z)
      const o = l.scenic ? Math.max(0, Math.min(0.9, 1.4 - d / l.range)) : Math.max(0.2, Math.min(1, 1.35 - d / 300))
      if (Math.abs(o - l.last) > 0.03) {
        l.el.style.opacity = o.toFixed(2)
        l.last = o
      }
    })
    this.labels.forEach((l, id) => {
      if (!l.scenic) l.el.classList.toggle('is-near', this.near === id)
    })
  }

  private updatePings(dt: number) {
    for (let i = this.pings.length - 1; i >= 0; i--) {
      const p = this.pings[i]
      p.t += dt / p.dur
      const k = Math.min(1, p.t)
      p.mesh.scale.setScalar(1 + k * p.size)
      ;(p.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.9
      if (p.t >= 1) {
        this.scene.remove(p.mesh)
        p.mesh.geometry.dispose()
        ;(p.mesh.material as THREE.Material).dispose()
        this.pings.splice(i, 1)
      }
    }
  }

  private updateCamera(dt: number) {
    if (this.debugTop) return
    const flying = !!this.flight
    this.userZoomCur += (this.userZoom - this.userZoomCur) * damp(9, dt)
    // the player's own zoom applies everywhere except the intro and the portrait close-up
    const zoomBase = this.introHold ? 3.4 : flying ? 1.5 : this.ride ? 1.35 : this.portrait ? 0.3 : this.paused ? 1.02 : (this.near ? (this.nearTall ? 1.3 : 0.95) : 1) * (this.driving ? 1.22 : 1)
    const targetZoom = this.introHold || this.portrait ? zoomBase : zoomBase * this.userZoomCur
    this.camZoom += (targetZoom - this.camZoom) * damp(this.camZoom > 1.6 ? 1.4 : 2.6, dt)

    const off = this.cameraOffset().multiplyScalar(this.camZoom)
    const base = new THREE.Vector3(this.pos.x, flying ? this.pos.y * 0.6 : this.pos.y, this.pos.z)
    const want = base.clone().add(off)
    this.camera.position.lerp(want, damp(flying ? 3 : 5, dt))
    const lookY = flying ? this.pos.y * 0.5 : this.portrait ? GROUND_Y + 3.3 : this.near || this.paused ? 6 : 1.5
    this.camLook.lerp(new THREE.Vector3(this.pos.x, lookY, this.pos.z - 3), damp(5, dt))
    this.camera.lookAt(this.camLook)

    let insetMoving = false
    for (const axis of ['x', 'y'] as const) {
      const diff = this.inset[axis] - this.insetCur[axis]
      if (Math.abs(diff) < 0.2) {
        if (diff !== 0) insetMoving = true
        this.insetCur[axis] = this.inset[axis]
      } else {
        this.insetCur[axis] += diff * damp(5, dt)
        insetMoving = true
      }
    }
    const fov = 55 + this.fovKick * 20
    if (Math.abs(fov - this.camera.fov) > 0.05 || insetMoving) {
      this.camera.fov = fov
      this.applyView()
    }
  }
}
