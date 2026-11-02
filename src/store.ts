import { computed, reactive, watch } from 'vue'
import { t } from './i18n'
import { gems, landmarkZones, tourZones, zones } from './world/zones'

export type Mode = 'splash' | 'world' | 'cv'

export interface Toast {
  id: number
  title: string
  text?: string
  tone: 'cyan' | 'magenta' | 'lime' | 'amber' | 'red'
}

interface Saved {
  visited: string[]
  gems: string[]
  shards: number[]
  learned: string[]
  secret: boolean
  secretFound: boolean
  cvOpened: boolean
  flown: boolean
  sailed: boolean
  drove: boolean
}

const KEY = 'hicaku:portfolio:v3'
const EMPTY: Saved = {
  visited: [],
  gems: [],
  shards: [],
  learned: [],
  secret: false,
  secretFound: false,
  cvOpened: false,
  flown: false,
  sailed: false,
  drove: false,
}

function load(): Saved {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...EMPTY, ...JSON.parse(raw) }
  } catch {
    /* storage unavailable — progress just won't persist */
  }
  return { ...EMPTY, visited: [], gems: [], shards: [], learned: [] }
}

const saved = load()

export const state = reactive({
  mode: (location.hash === '#cv' ? 'cv' : 'splash') as Mode,
  worldFailed: false,
  worldReady: false,
  entered: false,
  panel: null as string | null,
  /** the open panel was opened by walking up to a place: it closes again when you walk away and never freezes the world */
  panelAuto: false,
  menu: null as null | 'warp' | 'trophies',
  /** open the Map already scrolled to this group (e.g. 'tour') */
  menuFocus: null as string | null,
  near: null as string | null,
  visited: saved.visited,
  gems: saved.gems,
  shards: saved.shards,
  learned: saved.learned,
  secret: saved.secret,
  secretFound: saved.secretFound,
  cvOpened: saved.cvOpened,
  flown: saved.flown,
  sailed: saved.sailed,
  drove: saved.drove,
  /** driving the F1 car right now (not saved) */
  driving: false,
  pos: { x: 0, z: 0 },
  island: 'ist' as 'ist' | 'mt' | 'tour',
  side: 'eu' as 'eu' | 'as' | 'mt' | 'tr',
  place: 'Istanbul',
  moved: false,
  toasts: [] as Toast[],
  isTouch: typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches,
})

watch(
  () => [
    state.visited.length,
    state.gems.length,
    state.shards.length,
    state.learned.length,
    state.secret,
    state.secretFound,
    state.cvOpened,
    state.flown,
    state.sailed,
    state.drove,
  ],
  () => {
    try {
      const s: Saved = {
        visited: [...state.visited],
        gems: [...state.gems],
        shards: [...state.shards],
        learned: [...state.learned],
        secret: state.secret,
        secretFound: state.secretFound,
        cvOpened: state.cvOpened,
        flown: state.flown,
        sailed: state.sailed,
        drove: state.drove,
      }
      localStorage.setItem(KEY, JSON.stringify(s))
    } catch {
      /* ignore */
    }
  },
)

let toastId = 1
export function toast(t: Omit<Toast, 'id'>, ms = 4600) {
  const id = toastId++
  state.toasts.push({ id, ...t })
  setTimeout(() => {
    const i = state.toasts.findIndex((x) => x.id === id)
    if (i >= 0) state.toasts.splice(i, 1)
  }, ms)
}

// ───────────────────────────── achievements ─────────────────────────────

export interface Achievement {
  id: string
  title: string
  text: string
  done: boolean
  secret?: boolean
}

const counted = zones.filter((z) => z.counts)
const has = (id: string) => state.visited.includes(id)

const gemTitle = (id: string) => t(`ach.gem.${id}.title`)
const gemText = (id: string) => t(`ach.gem.${id}.text`)

/** Every career stop is visited: the world tour opens. */
export const careerDone = computed(() => counted.every((z) => has(z.id)))
export const tourDone = computed(() => tourZones.every((z) => has(z.id)))

const ach = (id: string, done: boolean, p?: Record<string, string | number>): Achievement => ({
  id,
  title: t(`ach.${id}.title`),
  text: t(`ach.${id}.text`, p),
  done,
})

export const achievements = computed<Achievement[]>(() => {
  const need = Math.ceil(landmarkZones.length * 0.6)
  return [
    ach('boot', state.entered || state.visited.length > 0),
    ach('career', ['itu', 'datapare', 'firmasoft', 'huawei', 'goart', 'fasttrack'].every(has)),
    ach('ferry', state.sailed),
    ach('flight', state.flown),
    ach('side', has('arcade')),
    ach('tree', has('skills')),
    ach('hello', has('contact')),
    ach('reader', state.cvOpened),
    ach('cartographer', counted.every((z) => has(z.id))),
    ach('f1', state.drove),
    ach('historian', landmarkZones.filter((z) => state.learned.includes(z.id)).length >= need, { n: need }),
    ach('tour', tourDone.value, { n: tourZones.length }),
    ...gems.map((g) => {
      const found = state.gems.includes(g.id)
      return {
        id: `gem-${g.id}`,
        title: found ? gemTitle(g.id) : '???',
        text: found ? gemText(g.id) : t('ach.gem.hidden'),
        done: found,
        secret: true,
      }
    }),
    {
      id: 'secret',
      title: state.secretFound ? t('ach.secret.title') : '???',
      text: state.secretFound ? t('toast.secretFoundText') : '???',
      done: state.secretFound,
      secret: true,
    },
  ]
})
export const progress = computed(() => ({
  visited: counted.filter((z) => has(z.id)).length,
  total: counted.length,
}))

export const tourProgress = computed(() => ({
  visited: tourZones.filter((z) => has(z.id)).length,
  total: tourZones.length,
}))

/** The next zone to suggest: the secret gate (once revealed), else the next career stop, else the next world-tour stop. */
export const nextTarget = computed(() => {
  if (state.secret && !state.secretFound) return 'japan'
  const z = counted.find((zz) => !has(zz.id))
  if (z) return z.id
  const t = tourZones.find((zz) => !has(zz.id))
  return t ? t.id : null
})

function announceNew(before: Set<string>) {
  achievements.value.forEach((a) => {
    if (a.done && !before.has(a.id) && a.id !== 'boot') toast({ title: t('toast.achievement', { title: a.title }), text: a.text, tone: 'lime' })
  })
}

export function markVisit(id: string) {
  const z = counted.find((q) => q.id === id) ?? tourZones.find((q) => q.id === id)
  if (!z || state.visited.includes(id)) return
  const before = new Set(achievements.value.filter((a) => a.done).map((a) => a.id))
  const careerBefore = careerDone.value
  state.visited.push(id)
  announceNew(before)
  if (!careerBefore && careerDone.value) {
    toast(
      {
        title: t('toast.tourUnlocked'),
        text: t('toast.tourUnlockedText'),
        tone: 'amber',
      },
      8000,
    )
  }
}

/** Reading a landmark's story counts toward the historian achievement. */
export function markLearn(id: string) {
  if (state.learned.includes(id)) return
  const before = new Set(achievements.value.filter((a) => a.done).map((a) => a.id))
  state.learned.push(id)
  announceNew(before)
}

export function markDrove() {
  if (state.drove) return
  const before = new Set(achievements.value.filter((a) => a.done).map((a) => a.id))
  state.drove = true
  announceNew(before)
}

export function markGem(id: string) {
  if (state.gems.includes(id)) return
  state.gems.push(id)
  const found = state.gems.length
  toast({ title: t('toast.gem', { title: gemTitle(id) }), text: `${gemText(id)} (${found}/${gems.length})`, tone: 'amber' }, 5600)
}

/** The CV is the PDF itself, so what visitors read is exactly the document I send to people. */
export const CV_PDF = '/Hikmet-Kufteoglu-CV.pdf'

export function openCv() {
  state.cvOpened = true
  state.panel = null
  state.menu = null
  window.open(CV_PDF, '_blank', 'noopener')
}

// old links to /#cv go straight to the PDF
if (typeof location !== 'undefined' && location.hash === '#cv') location.replace(CV_PDF)

export function leaveCv() {
  // If the visitor landed straight on the CV, show the splash so the world boots properly.
  state.mode = state.entered ? 'world' : 'splash'
  try {
    history.replaceState(null, '', location.pathname + location.search)
  } catch {
    /* ignore */
  }
}
