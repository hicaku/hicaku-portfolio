<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { hobbies, profile, projects, roles, skills } from '../data/cv'
import { LORE } from '../data/lore'
import { loreOf, noteOf, t, tx } from '../i18n'
import { zcountry, zname } from '../i18n/zones'
import { careerDone, markLearn, openCv, state, toast } from '../store'
import { TOUR_ISLANDS } from '../world/geo'
import { type ZoneDef, tourZones, zoneById, zones } from '../world/zones'
import Icon from './Icon.vue'

const props = defineProps<{ zoneId: string }>()
const emit = defineEmits<{ close: []; go: [id: string]; board: [gateId: string] }>()

const root = ref<HTMLElement>()
onMounted(() => {
  root.value?.focus({ preventScroll: true })
  if (LORE[props.zoneId]) markLearn(props.zoneId)
})

// "player" is the character sheet behind the name badge, not a place on the map.
const PLAYER: ZoneDef = {
  id: 'player',
  name: 'Player card',
  tag: '',
  kind: 'edu',
  color: '#00f0ff',
  x: 0,
  z: 0,
  island: 'ist',
  side: 'eu',
  order: -1,
  counts: false,
  radius: 0,
}
const isPlayer = computed(() => props.zoneId === 'player')
const zone = computed(() => (isPlayer.value ? PLAYER : zoneById(props.zoneId)!))
const role = computed(() => roles.find((r) => r.id === zone.value.roleId))
const hobby = computed(() => hobbies.find((h) => h.id === zone.value.id))

// role / hobby / project text with the translated version when there is one
const rq = (field: string, fallback: string) => tx(`role.${role.value!.id}.${field}`, fallback)
const roleBullets = computed(() => role.value!.bullets.map((b, i) => rq(`b${i}`, b)))
const statLabel = (label: string) => (label === 'Monthly active users' ? t('stat.mau') : label === 'Platform users' ? t('stat.users') : label)
const hobbyText = (field: 'title' | 'text' | 'kicker', fallback: string) => tx(`hobby.${hobby.value!.id}.${field}`, fallback)

const lore = computed(() => loreOf(props.zoneId))
const tourNote = computed(() => noteOf(props.zoneId))
const country = computed(() => {
  const c = TOUR_ISLANDS.find((i) => i.id === props.zoneId)?.country
  return c ? zcountry(c) : ''
})
const isStory = computed(() => zone.value.kind === 'landmark' || zone.value.kind === 'tour')
const tourUnlocked = computed(() => careerDone.value)

const careerStops = zones.filter((z) => z.kind !== 'gate' && z.kind !== 'pier')
// the career route and the world tour each have their own previous / next
const stops = computed(() => (zone.value.kind === 'tour' ? tourZones : careerStops))
const idx = computed(() => stops.value.findIndex((z) => z.id === props.zoneId))
const prev = computed(() => (idx.value > 0 ? stops.value[idx.value - 1] : null))
const next = computed(() => (idx.value >= 0 && idx.value < stops.value.length - 1 ? stops.value[idx.value + 1] : null))
const sequenced = computed(() => idx.value >= 0)
const tourStops = computed(() => tourZones.map((z) => ({ z, been: state.visited.includes(z.id) })))
const tourDoneCount = computed(() => state.visited.filter((id) => tourZones.some((z) => z.id === id)).length)

// ── boarding passes: two piers and two airports ──
const trips = computed<Record<string, { mode: 'plane' | 'boat'; lead: string; from: [string, string]; to: [string, string]; meta: string[]; cta: string; heading: string; title: string }>>(() => ({
  ist: {
    mode: 'plane',
    heading: t('trip.ist.heading'),
    title: t('trip.ist.title'),
    lead: t('trip.ist.lead'),
    from: ['SAW', t('city.ist')],
    to: ['MLA', t('city.mt')],
    meta: [t('meta.flight'), t('meta.gate', { n: 'A1' }), t('meta.seat')],
    cta: t('trip.ist.cta'),
  },
  mla: {
    mode: 'plane',
    heading: t('trip.mla.heading'),
    title: t('trip.mla.title'),
    lead: t('trip.mla.lead'),
    from: ['MLA', t('city.mt')],
    to: ['SAW', t('city.ist')],
    meta: [t('meta.flight'), t('meta.gate', { n: 'B2' }), t('meta.seat')],
    cta: t('trip.mla.cta'),
  },
  pierE: {
    mode: 'boat',
    heading: t('trip.pierE.heading'),
    title: t('trip.pierE.title'),
    lead: t('trip.pierE.lead'),
    from: ['BEŞ', t('city.bes')],
    to: ['KAD', t('city.kad')],
    meta: [t('meta.cross'), t('meta.pier', { n: 1 }), t('meta.deck')],
    cta: t('trip.pierE.cta'),
  },
  pierA: {
    mode: 'boat',
    heading: t('trip.pierA.heading'),
    title: t('trip.pierA.title'),
    lead: t('trip.pierA.lead'),
    from: ['KAD', t('city.kad')],
    to: ['BEŞ', t('city.bes')],
    meta: [t('meta.cross'), t('meta.pier', { n: 2 }), t('meta.deck')],
    cta: t('trip.pierA.cta'),
  },
}))
const trip = computed(() => trips.value[zone.value.id])

const kicker = computed(() => {
  if (isPlayer.value) return t('player.kicker')
  switch (zone.value.kind) {
    case 'edu':
      return t('edu.kicker')
    case 'role':
      return role.value ? rq('quest', role.value.quest) : ''
    case 'gate':
    case 'pier':
      return trip.value?.heading ?? ''
    case 'arcade':
      return t('arcade.kicker')
    case 'skills':
      return t('skills.kicker')
    case 'contact':
      return t('contact.kicker')
    case 'gem':
      return hobby.value ? hobbyText('kicker', hobby.value.kicker) : ''
    case 'landmark':
      return lore.value?.kicker ?? ''
    case 'tour':
      return t('tour.kicker', { country: country.value })
    default:
      return t('secret.kicker')
  }
})

const title = computed(() => {
  if (isPlayer.value) return profile.name
  if (zone.value.kind === 'role' && role.value) return role.value.company
  if (zone.value.kind === 'edu') return t('edu.title')
  if (zone.value.kind === 'gate' || zone.value.kind === 'pier') return trip.value?.title ?? zname(zone.value)
  if (zone.value.kind === 'gem') return hobby.value ? hobbyText('title', hobby.value.title) : zname(zone.value)
  if (zone.value.kind === 'secret') return t('secret.title')
  return zname(zone.value)
})

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(profile.email)
    toast({ title: t('toast.emailCopied'), text: profile.email, tone: 'cyan' }, 2400)
  } catch {
    toast({ title: profile.email, text: t('toast.emailManual'), tone: 'cyan' }, 3200)
  }
}

const sheet = computed(() => [
  { k: t('sheet.class'), v: t('sheet.classV') },
  { k: t('sheet.exp'), v: t('sheet.expV') },
  { k: t('sheet.base'), v: t('sheet.baseV', { loc: t('place.malta') }) },
  { k: t('sheet.origin'), v: t('sheet.originV') },
  { k: t('sheet.langs'), v: t('sheet.langsV') },
  { k: t('sheet.ability'), v: t('sheet.abilityV') },
  { k: t('sheet.trophy'), v: t('sheet.trophyV') },
  { k: t('sheet.side'), v: t('sheet.sideV') },
])
</script>

<template>
  <aside ref="root" class="panel" :style="{ '--c': zone.color }" role="dialog" :aria-label="title" tabindex="-1">
    <header class="panel-head">
      <div>
        <p class="kicker">{{ kicker }}</p>
        <h2>{{ title }}</h2>
        <p v-if="role" class="meta">{{ rq('role', role.role) }} · {{ role.period }} · {{ role.location }}</p>
        <p v-else-if="zone.kind === 'edu' && !isPlayer" class="meta">{{ t('edu.degree') }} {{ t('edu.degreeSub') }} · {{ profile.education.period }}</p>
        <p v-else-if="isPlayer" class="meta">{{ t('cv.title') }}</p>
      </div>
      <button class="icon-btn" :aria-label="t('panel.close')" @click="emit('close')"><Icon name="close" /></button>
    </header>

    <div class="panel-body">
      <!-- player card -->
      <template v-if="isPlayer">
        <p class="lead">{{ t('cv.summary') }}</p>
        <dl class="sheet">
          <div v-for="row in sheet" :key="row.k">
            <dt>{{ row.k }}</dt>
            <dd>{{ row.v }}</dd>
          </div>
        </dl>
        <div class="callout">
          <strong>{{ t('player.how') }}</strong>
          <p>{{ t('player.howText') }}</p>
        </div>
      </template>

      <!-- education -->
      <template v-else-if="zone.kind === 'edu'">
        <p class="lead">{{ t('edu.lead') }}</p>
        <div class="stats">
          <div class="stat"><b>{{ t('edu.degree') }}</b><span>{{ t('edu.degreeSub') }}</span></div>
          <div class="stat"><b>2016–21</b><span>{{ t('edu.title') }}</span></div>
        </div>
      </template>

      <!-- roles -->
      <template v-else-if="zone.kind === 'role' && role">
        <p class="lead">{{ rq('tagline', role.tagline) }}</p>
        <div v-if="role.stats || role.trophy" class="stats">
          <div v-for="s in role.stats" :key="s.label" class="stat">
            <b>{{ s.value }}</b>
            <span>{{ statLabel(s.label) }}</span>
          </div>
          <div v-if="role.trophy" class="stat trophy">
            <b><Icon name="star" :size="22" /></b>
            <span>{{ rq('trophy', role.trophy) }}</span>
          </div>
        </div>
        <h3>{{ t('role.log') }}</h3>
        <ul class="log">
          <li v-for="b in roleBullets" :key="b">{{ b }}</li>
        </ul>
        <h3>{{ t('role.loadout') }}</h3>
        <ul class="chips">
          <li v-for="s in role.stack" :key="s">{{ s }}</li>
        </ul>
      </template>

      <!-- airports and ferry piers -->
      <template v-else-if="(zone.kind === 'gate' || zone.kind === 'pier') && trip">
        <p class="lead">{{ trip.lead }}</p>
        <div class="boarding">
          <div class="bp-row">
            <div>
              <small>{{ t('trip.from') }}</small>
              <b>{{ trip.from[0] }}</b>
              <span>{{ trip.from[1] }}</span>
            </div>
            <Icon :name="trip.mode === 'plane' ? 'plane' : 'boat'" :size="26" class="bp-plane" />
            <div class="right">
              <small>{{ t('trip.to') }}</small>
              <b>{{ trip.to[0] }}</b>
              <span>{{ trip.to[1] }}</span>
            </div>
          </div>
          <div class="bp-meta">
            <span v-for="m in trip.meta" :key="m">{{ m }}</span>
          </div>
        </div>
        <button class="btn primary big full" @click="emit('board', zone.id)">
          <Icon :name="trip.mode === 'plane' ? 'plane' : 'boat'" :size="18" /> <span>{{ trip.cta }}</span>
        </button>
        <!-- the world tour departs from the airports -->
        <template v-if="zone.kind === 'gate'">
          <h3>{{ t('tour.heading') }}</h3>
          <p v-if="!tourUnlocked" class="lead small">{{ t('tour.locked') }}</p>
          <template v-else>
            <p class="lead small">{{ t('tour.pick') }}</p>
            <ul class="tour-grid">
              <li v-for="s in tourStops" :key="s.z.id">
                <button class="tour-chip" :style="{ '--c': s.z.color }" @click="emit('go', s.z.id)">
                  <Icon name="plane" :size="14" /><span>{{ zname(s.z) }}</span>
                  <Icon v-if="s.been" name="check" :size="14" />
                </button>
              </li>
            </ul>
          </template>
        </template>
      </template>

      <!-- landmarks and world-tour stops: the story behind the place -->
      <template v-else-if="isStory && lore">
        <p class="lead">{{ lore.blurb }}</p>
        <p v-if="tourNote" class="note-me"><Icon name="pin" :size="14" /> {{ tourNote }}</p>
        <h3>{{ t('story.didYou') }}</h3>
        <ol class="facts">
          <li v-for="f in lore.facts" :key="f">{{ f }}</li>
        </ol>
        <div v-if="zone.kind === 'tour'" class="callout">
          <strong>{{ t('story.tourCount', { n: tourDoneCount, total: tourZones.length }) }}</strong>
          <p>{{ t('story.tourHint') }}</p>
        </div>
      </template>

      <!-- arcade -->
      <template v-else-if="zone.kind === 'arcade'">
        <p class="lead">{{ t('arcade.lead') }}</p>
        <article v-for="p in projects" :key="p.id" class="project">
          <header>
            <h3>{{ p.name }}</h3>
            <span class="tag">{{ tx(`proj.${p.id}.kind`, p.kind) }}</span>
          </header>
          <p>{{ tx(`proj.${p.id}.blurb`, p.blurb) }}</p>
          <ul class="chips small">
            <li v-for="tg in p.tags" :key="tg">{{ tg }}</li>
          </ul>
          <a v-if="p.link" class="btn ghost" :href="p.link" target="_blank" rel="noopener">
            <Icon name="external" :size="16" /> {{ p.linkLabel ?? p.link }}
          </a>
        </article>
      </template>

      <!-- skills -->
      <template v-else-if="zone.kind === 'skills'">
        <p class="lead">{{ t('skills.lead') }}</p>
        <section v-for="b in skills" :key="b.branch" class="branch" :style="{ '--b': b.color }">
          <h3>{{ tx(`skill.${b.branch}`, b.branch) }}</h3>
          <ul class="chips">
            <li v-for="s in b.items" :key="s">{{ s }}</li>
          </ul>
        </section>
        <div class="callout">
          <strong>{{ t('skills.testTitle') }}</strong>
          <p>{{ t('skills.testText') }}</p>
        </div>
      </template>

      <!-- contact -->
      <template v-else-if="zone.kind === 'contact'">
        <p class="lead">{{ t('contact.lead') }}</p>
        <div class="contact">
          <a class="btn primary" :href="`mailto:${profile.email}`"><Icon name="mail" :size="18" /> {{ profile.email }}</a>
          <button class="btn ghost" @click="copyEmail"><Icon name="copy" :size="16" /> {{ t('contact.copy') }}</button>
          <a class="btn ghost" :href="profile.linkedin" target="_blank" rel="noopener"><Icon name="linkedin" :size="16" /> LinkedIn</a>
          <a class="btn ghost" :href="profile.github" target="_blank" rel="noopener"><Icon name="github" :size="16" /> GitHub</a>
        </div>
        <dl class="sheet">
          <div><dt>{{ t('contact.based') }}</dt><dd>{{ t('place.malta') }}</dd></div>
          <div><dt>{{ t('contact.status') }}</dt><dd>{{ t('cv.relocation') }}</dd></div>
          <div><dt>{{ t('contact.refs') }}</dt><dd>{{ t('contact.refsV') }}</dd></div>
        </dl>
      </template>

      <!-- hidden gems -->
      <template v-else-if="zone.kind === 'gem' && hobby">
        <p class="lead">{{ hobbyText('text', hobby.text) }}</p>
        <ul class="chips">
          <li v-for="c in hobby.chips" :key="c">{{ c }}</li>
        </ul>
        <div class="callout">
          <strong>{{ t('gem.callout', { n: state.gems.length }) }}</strong>
          <p>{{ t('gem.calloutText') }}</p>
        </div>
      </template>

      <!-- secret -->
      <template v-else-if="zone.kind === 'secret'">
        <p class="lead jp">{{ t('secret.hello') }}</p>
        <p class="lead">{{ t('secret.lead') }}</p>
        <p class="lead jp">{{ t('secret.jp') }}</p>
        <div class="contact">
          <a class="btn primary" :href="`mailto:${profile.email}?subject=Hello%20from%20the%20secret%20level`"><Icon name="mail" :size="18" /> {{ t('secret.mail') }}</a>
          <button class="btn ghost" @click="openCv"><Icon name="doc" :size="16" /> {{ t('secret.cv') }}</button>
        </div>
      </template>

      <!-- every real place on the route also gets its history -->
      <section v-if="lore && !isStory && zone.kind !== 'secret' && !isPlayer" class="lore">
        <h3>{{ t('story.place') }} · {{ lore.kicker }}</h3>
        <p class="lead small">{{ lore.blurb }}</p>
        <ol class="facts">
          <li v-for="f in lore.facts" :key="f">{{ f }}</li>
        </ol>
      </section>
    </div>

    <footer class="panel-foot">
      <div class="nav">
        <template v-if="sequenced">
          <button class="btn ghost" :disabled="!prev" :aria-label="prev ? zname(prev) : ''" @click="prev && emit('go', prev.id)">
            <Icon name="left" :size="16" /> <span>{{ prev ? zname(prev) : t('panel.start') }}</span>
          </button>
          <button class="btn ghost" :disabled="!next" :aria-label="next ? zname(next) : ''" @click="next && emit('go', next.id)">
            <span>{{ next ? zname(next) : t('panel.end') }}</span> <Icon name="chevron" :size="16" />
          </button>
        </template>
      </div>
      <button class="btn cvbtn" @click="openCv"><Icon name="doc" :size="16" /> {{ t('panel.fullcv') }}</button>
    </footer>
  </aside>
</template>
