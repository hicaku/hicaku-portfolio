<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { achievements, careerDone, markDrove, markGem, markVisit, nextTarget, openCv, progress, state, tourProgress, toast } from '../store'
import { lang, t } from '../i18n'
import { zname, ztag } from '../i18n/zones'
import { SECRET_ZONE, allZones, zoneById } from '../world/zones'
import type { World } from '../world/World'
import Icon from './Icon.vue'
import Joystick from './Joystick.vue'
import LangSwitch from './LangSwitch.vue'
import TrophyMenu from './TrophyMenu.vue'
import WarpMenu from './WarpMenu.vue'
import ZonePanel from './ZonePanel.vue'

const props = defineProps<{ active: boolean; holding: boolean }>()

const host = ref<HTMLElement>()
const canvas = ref<HTMLCanvasElement>()
let world: World | null = null
let disposed = false
/** the place you just arrived at (pier, airport gate, spawn): its card stays shut until you step away and come back */
let quiet = ''
let restoredAt = 0
const LAST_KEY = 'hicaku:last'
let lastSave = 0
function saveSpot(x: number, z: number) {
  const now = performance.now()
  if (now - lastSave < 1500 || !state.entered) return
  lastSave = now
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify({ x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10 }))
  } catch { /* storage unavailable */ }
}

// ───────────────────────── world events ─────────────────────────

function openPanel(id: string, auto = false) {
  state.menu = null
  state.panel = id
  state.panelAuto = auto
  if (id === SECRET_ZONE.id && !state.secretFound) {
    state.secretFound = true
    toast({ title: t('toast.secretFound'), text: t('toast.secretFoundText'), tone: 'red' }, 6000)
  }
}

function closeOverlays() {
  state.panelAuto = false
  state.panel = null
  state.menu = null
}

function goTo(id: string) {
  const z = zoneById(id)
  if (z?.kind === 'tour' && !careerDone.value) {
    toast({ title: t('toast.tourLocked'), text: t('toast.tourLockedText', { total: progress.value.total, n: progress.value.visited }), tone: 'amber' }, 4200)
    return
  }
  state.menu = null
  state.panel = null
  world?.warpTo(id)
}

function openTour() {
  if (!careerDone.value) {
    toast({ title: t('toast.tourLocked'), text: t('toast.tourLockedText', { total: progress.value.total, n: progress.value.visited }), tone: 'amber' }, 5200)
    return
  }
  state.menuFocus = 'tour'
  state.menu = 'warp'
}

function toggleDrive() {
  world?.toggleDriving()
}

/** Board a ferry at a pier, or a plane at an airport gate. */
function board(id: string) {
  state.panel = null
  if (id === 'pierE' || id === 'pierA') {
    state.sailed = true
    toast({ title: t('toast.ferry'), text: id === 'pierE' ? t('toast.ferryE') : t('toast.ferryA'), tone: 'cyan' }, 3200)
    world?.rideFerry(id)
    return
  }
  const dest = id === 'ist' ? 'mla' : 'ist'
  state.flown = true
  toast({ title: t('toast.boarding'), text: dest === 'mla' ? t('toast.toMalta') : t('toast.toIst'), tone: 'cyan' }, 3000)
  world?.warpTo(dest)
}

/** a ferry pier or airport gate card is open: E / Enter boards */
function boardable() {
  const k = state.panel ? zoneById(state.panel)?.kind : null
  return k === 'pier' || k === 'gate'
}

const zoom = (f: number) => world?.zoomBy(f)

onMounted(async () => {
  try {
    const { World } = await import('../world/World')
    if (disposed) return
    world = new World(canvas.value!, host.value!, {
      onReady: () => {
        state.worldReady = true
      },
      onSlow: () =>
        toast({ title: t('toast.slow'), text: t('toast.slowText'), tone: 'amber' }, 9000),
      onBlank: () => {
        // nothing can be drawn here even in the lite tier: fall back to the plain CV
        state.worldFailed = true
        state.mode = 'cv'
      },
      onNear: (id) => {
        state.near = id
        if (id && performance.now() - restoredAt < 2000) quiet = id // standing in a place after a reload: no card until you step away
        if (id !== quiet) quiet = ''
        if (props.holding || state.menu || (id && id === quiet)) return
        if (id && (!state.panel || state.panelAuto)) {
          // walking up to a place opens its card straight away; walking off closes it again
          if (state.panel !== id) openPanel(id, true)
        } else if (!id && state.panel && state.panelAuto) {
          state.panel = null
          state.panelAuto = false
        }
      },
      onVisit: (id) => markVisit(id),
      onShard: (i, total) => {
        if (!state.shards.includes(i)) state.shards.push(i)
        if (total < 3) {
          toast({ title: t('toast.fragment', { n: total }), text: total === 1 ? t('toast.fragment1') : t('toast.fragment2'), tone: 'red' }, 5200)
        }
      },
      onSecretUnlocked: () => {
        state.secret = true
        toast({ title: t('toast.secretDone'), text: t('toast.secretDoneText'), tone: 'red' }, 7000)
      },
      onGem: (id) => markGem(id),
      onDrive: (on) => {
        state.driving = on
        if (on) {
          markDrove()
          toast({ title: t('toast.driveTitle'), text: t('toast.driveText'), tone: 'red' }, 4200)
        }
      },
      onRideEnd: (id) => {
        quiet = id
        const z = zoneById(id)
        toast({ title: t('toast.docked', { name: z ? zname(z) : '' }), text: t('toast.mind'), tone: 'lime' }, 3600)
      },
      onWarpEnd: (id, flew) => {
        const z = zoneById(id)
        if (z?.kind === 'gate') {
          quiet = id
          // landing from a flight: no panel, just a welcome
          if (flew) toast({ title: z.island === 'mt' ? t('toast.welcomeMalta') : t('toast.welcomeIst'), text: t('toast.landed'), tone: 'lime' }, 4200)
          return
        }
        if (z?.kind === 'tour') markVisit(id)
        openPanel(id, true) // a walk-away card: it never freezes the world
      },
      onInteract: () => {
        if (props.holding || state.menu) return
        if (boardable()) return board(state.panel!)
        // E closes whatever card is open (or opens the nearby one if somehow none is)
        if (state.panel) closeOverlays()
        else if (state.near) openPanel(state.near)
      },
      onLabelClick: (id) => {
        if (props.holding) return
        if (state.near === id) openPanel(id)
        else goTo(id)
      },
      onFrame: (p) => {
        if (!state.moved && Math.hypot(p.x - state.pos.x, p.z - state.pos.z) > 8 && state.pos.x !== 0) state.moved = true
        state.pos = { x: p.x, z: p.z }
        saveSpot(p.x, p.z)
        state.island = p.island
        state.side = p.side
        state.place = p.place
      },
    })
    if (import.meta.env.DEV) (window as unknown as { __world?: World }).__world = world
    // restore saved progress
    world.restoreShards([...state.shards])
    world.restoreGems([...state.gems])
    if (state.secret) world.unlockSecret(true)
    quiet = state.near ?? ''
    try {
      const raw = localStorage.getItem(LAST_KEY)
      const last = raw ? (JSON.parse(raw) as { x: number; z: number }) : null
      if (last && Number.isFinite(last.x) && Number.isFinite(last.z) && state.visited.length) {
        world.restoreAt(last.x, last.z)
        restoredAt = performance.now()
      }
    } catch { /* ignore */ }
    if (!props.holding) world.begin()
    if (!props.active) world.setActive(false)
    world.refreshLabels(labelText)
  } catch (err) {
    console.error('World failed to start', err)
    state.worldFailed = true
    state.mode = 'cv'
  }
})

onBeforeUnmount(() => {
  disposed = true
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', syncInset)
  world?.dispose()
  world = null
})

watch(
  () => props.active,
  (a) => world?.setActive(a),
)

watch(
  () => props.holding,
  (h) => {
    if (!h) world?.begin()
  },
)

// Pause movement + slide the scene out from under panels.
function syncInset() {
  if (!world) return
  const open = !!state.panel
  if (!open) return world.setInset(0, 0)
  const w = window.innerWidth
  const h = window.innerHeight
  if (w > 820) world.setInset(Math.min(470, w * 0.42) / 2, 0)
  else world.setInset(0, h * 0.2)
}

const labelText = (id: string) => {
  if (id === 'fork') return { name: t('world.fork'), tag: '' }
  const z = allZones().find((q) => q.id === id)
  return z ? { name: zname(z), tag: ztag(z) } : null
}
watch(lang, () => world?.refreshLabels(labelText))

watch(
  () => [state.panel, state.menu, state.panelAuto],
  () => {
    world?.setPaused((!!state.panel && !state.panelAuto) || !!state.menu)
    world?.setPortrait(state.panel === 'player')
    syncInset()
  },
)

// ───────────────────────── keys: esc + konami ─────────────────────────

const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a']
let kIdx = 0
function onKey(e: KeyboardEvent) {
  const k = e.key.toLowerCase()
  if (k === 'escape') closeOverlays()
  if (k === 'enter' && !(e.target instanceof HTMLButtonElement) && !props.holding && !state.menu && state.panel) {
    if (boardable()) board(state.panel)
    else closeOverlays()
  }
  if (k === KONAMI[kIdx]) {
    kIdx++
    if (kIdx === KONAMI.length) {
      kIdx = 0
      if (!state.secret) {
        state.secret = true
        world?.unlockSecret()
      }
    }
  } else {
    kIdx = k === KONAMI[0] ? 1 : 0
  }
}
onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', syncInset)
})

// ───────────────────────── HUD data ─────────────────────────

const nearZone = computed(() => (state.near ? zoneById(state.near) : null))

const compass = computed(() => {
  const id = nextTarget.value
  if (!id) return null
  const goal = zoneById(id)!
  // the goal is across the water: point at the ferry pier (or the airport) on this side
  let z = goal
  let via: '' | 'ferry' | 'flight' | 'map' = ''
  if (goal.kind === 'tour' && state.island === 'tour') {
    // islands in the world tour are reached from the Map (or the airports)
    via = 'map'
  } else if (state.island === 'tour') {
    via = 'map'
  } else if (goal.island !== state.island) {
    if (state.island === 'ist' && state.side === 'eu') {
      z = zoneById('pierE')!
      via = 'ferry'
    } else {
      z = zoneById(state.island === 'ist' ? 'ist' : 'mla')!
      via = 'flight'
    }
  } else if (state.island === 'ist' && goal.side !== state.side && state.side !== 'mt') {
    z = zoneById(state.side === 'eu' ? 'pierE' : 'pierA')!
    via = 'ferry'
  }
  const dx = z.x - state.pos.x
  const dz = z.z - state.pos.z
  const dist = Math.round(Math.hypot(dx, dz))
  return {
    name: id === 'japan' ? '???' : via && via !== 'map' ? zname(z) : zname(goal),
    caption:
      id === 'japan'
        ? t('hud.signal')
        : via === 'map'
          ? ` · ${t('hud.flyMap')}`
          : via
            ? ` · ${zname(goal)} (${via === 'ferry' ? t('hud.byFerry') : t('hud.byPlane')})`
            : goal.kind === 'tour' ? t('hud.worldTour') : t('hud.next'),
    color: z.color,
    dist,
    angle: (Math.atan2(dx, -dz) * 180) / Math.PI,
    far: dist > 24,
  }
})

const pct = computed(() => Math.round((progress.value.visited / progress.value.total) * 100))
const trophyCount = computed(() => achievements.value.filter((a) => a.done).length)

const hudVisible = computed(() => !props.holding)
const showControls = computed(() => hudVisible.value && !state.moved && !state.panel && !state.menu)

function onJoy(x: number, y: number) {
  world?.setJoystick(x, y)
}

// Buttons react on pointer-down: with a finger already on the joystick, a second finger's click can be swallowed.
// The click handler stays for keyboard and assistive use and ignores the click that follows a tap.
let lastTap = 0
const tapDown = (fn: () => void) => {
  lastTap = performance.now()
  fn()
}
const tapClick = (fn: () => void) => {
  if (performance.now() - lastTap > 700) fn()
}

const boosting = ref(false)
function toggleBoost() {
  boosting.value = !boosting.value
  world?.setBoost(boosting.value)
}
</script>

<template>
  <div ref="host" class="world" :class="{ holding, 'panel-open': !!state.panel }">
    <canvas ref="canvas" class="world-canvas" aria-label="Interactive 3D portfolio world" />

    <!-- HUD -->
    <template v-if="hudVisible">
      <header class="hud-top">
        <div class="brand-col">
          <button class="brand" :aria-label="t('brand.role')" @click="openPanel('player')">
            <span class="brand-mark" aria-hidden="true"><Icon name="user" :size="15" /></span>
            <span class="brand-text">
              <b>Hikmet Kufteoglu</b>
              <small>{{ t('brand.role') }}</small>
            </span>
          </button>
          <p class="place-chip"><Icon name="pin" :size="13" /> <b>{{ state.place }}</b> <i>{{ state.island === 'mt' ? t('place.malta') : state.island === 'tour' ? t('place.tour') : t('place.ist') }}</i></p>
        </div>
        <div class="hud-actions">
          <button class="hud-btn tour-btn" :class="{ ready: careerDone, locked: !careerDone }" :aria-label="t('place.tour')" @click="openTour">
            <Icon :name="careerDone ? 'plane' : 'lock'" /><span>{{ t('hud.tour') }}</span>
          </button>
          <button class="hud-btn" :aria-label="t('warp.kicker')" @click="state.menu = state.menu === 'warp' ? null : 'warp'">
            <Icon name="map" /><span>{{ t('hud.map') }}</span>
          </button>
          <button class="hud-btn" :aria-label="t('trophy.title')" @click="state.menu = state.menu === 'trophies' ? null : 'trophies'">
            <Icon name="trophy" /><span>{{ trophyCount }}/{{ achievements.length }}</span>
          </button>
          <LangSwitch class="hud-lang" />
          <button class="hud-btn cv-cta" :aria-label="t('hud.cvLong')" @click="openCv">
            <Icon name="doc" /><span><span class="cv-long">{{ t('hud.cvLong') }}</span><span class="cv-short">{{ t('hud.cvShort') }}</span></span>
          </button>
        </div>
      </header>

      <div class="hud-progress" :class="{ lifted: state.isTouch }">
        <div class="progress-row">
          <span>{{ t('hud.explored') }}</span>
          <b>{{ progress.visited }}/{{ progress.total }}</b>
        </div>
        <div class="bar"><i :style="{ width: pct + '%' }" /></div>
        <div v-if="careerDone" class="progress-row tour-row">
          <span>{{ t('hud.worldTour') }}</span>
          <b>{{ tourProgress.visited }}/{{ tourProgress.total }}</b>
        </div>
        <div v-if="compass" class="objective" :style="{ '--c': compass.color }">
          <span
            class="arrow"
            :style="{ transform: `rotate(${compass.angle}deg)`, opacity: compass.far ? 1 : 0.25 }"
            aria-hidden="true"
          >
            <Icon name="arrow" :size="16" />
          </span>
          <span class="objective-text">
            <small>{{ compass.caption }}</small>
            <b>{{ compass.name }}</b>
          </span>
          <span class="dist">{{ compass.dist }}m</span>
        </div>
        <div v-else class="objective done"><b>{{ t('hud.allDone') }}</b></div>
      </div>

      <Transition name="rise">
        <button
          v-if="nearZone && !state.panel && !state.menu"
          class="interact"
          :style="{ '--c': nearZone.color }"
          @click="openPanel(nearZone.id)"
        >
          <kbd v-if="!state.isTouch">E</kbd>
          <span>{{ nearZone.kind === 'landmark' ? t('hud.read') : nearZone.kind === 'tour' ? t('hud.visit') : t('hud.inspect') }} <b>{{ zname(nearZone) }}</b></span>
        </button>
      </Transition>

      <Transition name="fade">
        <p v-if="showControls" class="controls-hint">
          <template v-if="state.isTouch"><b>{{ t('hint.touch.a') }}</b> {{ t('hint.touch.b') }} · <b>{{ t('hint.touch.c') }}</b> {{ t('hint.touch.d') }}</template>
          <template v-else>
            <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> {{ t('hint.fly') }} · <kbd>Shift</kbd> {{ t('hint.boost') }} · <kbd>F</kbd> {{ t('hint.car') }} · <b>{{ t('hint.click') }}</b> {{ t('hint.travel') }} · <kbd>E</kbd> {{ t('hint.inspect') }}
          </template>
        </p>
      </Transition>

      <button
        v-if="!state.panel && !state.menu"
        class="drive-btn"
        :class="{ on: state.driving, touch: state.isTouch }"
        :aria-pressed="state.driving"
        aria-label="Toggle the F1 car (F)"
        @pointerdown="tapDown(toggleDrive)" @click="tapClick(toggleDrive)"
      >
        <Icon name="car" :size="20" /><span>{{ state.driving ? t('car.off') : t('car.on') }}</span>
      </button>

      <div v-if="!state.panel && !state.menu" class="zoom-ctl" :class="{ touch: state.isTouch }" role="group" aria-label="Zoom">
        <button aria-label="Zoom in (+)" @click="zoom(0.8)"><Icon name="plus" :size="18" /></button>
        <button aria-label="Zoom out (−)" @click="zoom(1.25)"><Icon name="minus" :size="18" /></button>
      </div>

      <template v-if="state.isTouch && !state.panel && !state.menu">
        <Joystick @move="onJoy" />
        <button class="boost-btn" :class="{ on: boosting }" aria-label="Toggle boost" @pointerdown="tapDown(toggleBoost)" @click="tapClick(toggleBoost)">
          <Icon name="bolt" :size="22" />
        </button>
      </template>
    </template>

    <ZonePanel v-if="state.panel" :key="state.panel" :zone-id="state.panel" @close="closeOverlays" @go="goTo" @board="board" />
    <WarpMenu v-if="state.menu === 'warp'" @close="state.menu = null" @go="goTo" />
    <TrophyMenu v-if="state.menu === 'trophies'" @close="state.menu = null" />
  </div>
</template>
