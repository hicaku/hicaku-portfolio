import { ref } from 'vue'
import type { Lore } from '../data/lore'
import { LORE, TOUR_NOTES } from '../data/lore'
import { en } from './en'

export type Lang = 'en' | 'tr' | 'es' | 'de' | 'ja' | 'zh'

export const LANGS: Array<{ code: Lang; label: string; native: string }> = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'tr', label: 'Turkish', native: 'Türkçe' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'de', label: 'German', native: 'Deutsch' },
  { code: 'ja', label: 'Japanese', native: '日本語' },
  { code: 'zh', label: 'Chinese', native: '中文' },
]

const KEY = 'hicaku:lang'

function detect(): Lang {
  try {
    const q = new URLSearchParams(location.search).get('lang')
    if (q && LANGS.some((l) => l.code === q)) return q as Lang
    const saved = localStorage.getItem(KEY)
    if (saved && LANGS.some((l) => l.code === saved)) return saved as Lang
  } catch {
    /* storage unavailable */
  }
  const nav = (navigator.language || 'en').slice(0, 2).toLowerCase()
  return LANGS.some((l) => l.code === nav) ? (nav as Lang) : 'en'
}

export const lang = ref<Lang>(detect())

// Non-English dictionaries load on demand, so the English bundle stays small.
const loaded = ref<Record<string, Record<string, string>>>({})
const loaders: Record<Exclude<Lang, 'en'>, () => Promise<{ default: Record<string, string> }>> = {
  tr: () => import('./tr'),
  es: () => import('./es'),
  de: () => import('./de'),
  ja: () => import('./ja'),
  zh: () => import('./zh'),
}

type LoreBundle = { lore: Record<string, Lore>; notes: Record<string, string> }
const loadedLore = ref<Record<string, LoreBundle>>({})
const loreLoaders: Record<Exclude<Lang, 'en'>, () => Promise<{ default: LoreBundle }>> = {
  tr: () => import('./lore/tr'),
  es: () => import('./lore/es'),
  de: () => import('./lore/de'),
  ja: () => import('./lore/ja'),
  zh: () => import('./lore/zh'),
}

async function ensure(l: Lang) {
  if (l === 'en' || loaded.value[l]) return
  const [dict, lore] = await Promise.all([loaders[l](), loreLoaders[l]()])
  loaded.value = { ...loaded.value, [l]: dict.default }
  loadedLore.value = { ...loadedLore.value, [l]: lore.default }
}

export async function setLang(l: Lang) {
  await ensure(l)
  lang.value = l
  try {
    localStorage.setItem(KEY, l)
  } catch {
    /* ignore */
  }
  document.documentElement.lang = l
}

void ensure(lang.value).then(() => {
  document.documentElement.lang = lang.value
})

/** Translate a key. Missing keys fall back to English, then to the key itself. */
export function t(key: string, params?: Record<string, string | number>): string {
  const dict = lang.value === 'en' ? en : loaded.value[lang.value]
  let s = dict?.[key] ?? en[key] ?? key
  if (params) for (const [k, v] of Object.entries(params)) s = s.split(`{${k}}`).join(String(v))
  return s
}

/** Translate if a translation exists; otherwise keep the supplied text (used for data that has its own English default). */
export function tx(key: string, fallback: string, params?: Record<string, string | number>): string {
  const dict = lang.value === 'en' ? en : loaded.value[lang.value]
  const s = dict?.[key] ?? en[key]
  if (s === undefined) return fallback
  let out = s
  if (params) for (const [k, v] of Object.entries(params)) out = out.split(`{${k}}`).join(String(v))
  return out
}

/** The story for a place: the translated one when it exists, otherwise English. */
export function loreOf(id: string): Lore | undefined {
  return loadedLore.value[lang.value]?.lore[id] ?? LORE[id]
}

/** My personal note on a world-tour stop, in the current language. */
export function noteOf(id: string): string | undefined {
  return loadedLore.value[lang.value]?.notes[id] ?? TOUR_NOTES[id]
}
