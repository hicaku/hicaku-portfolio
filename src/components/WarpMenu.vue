<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { t } from '../i18n'
import { zname, ztag } from '../i18n/zones'
import { careerDone, openCv, progress, state, tourProgress } from '../store'
import { NO_WARP, SECRET_ZONE, gems, landmarkZones, tourZones, zones } from '../world/zones'
import Icon from './Icon.vue'
import LangSwitch from './LangSwitch.vue'

const emit = defineEmits<{ close: []; go: [id: string] }>()

const first = ref<HTMLButtonElement>()
// preventScroll: the world container is clipped but still scrollable, and a plain focus() can push the whole menu out of view
onMounted(() => {
  first.value?.focus({ preventScroll: true })
  if (state.menuFocus) {
    const key = state.menuFocus
    state.menuFocus = null
    requestAnimationFrame(() => document.querySelector(`[data-group="${key}"]`)?.scrollIntoView({ block: 'start' }))
  }
})

// airport gates and ferry piers are reached on foot; hidden gems only show up once found
const groups = computed(() => [
  { key: 'career', title: `${t('warp.career')} · ${progress.value.visited}/${progress.value.total}`, items: zones.filter((z) => z.kind !== 'gate' && z.kind !== 'pier'), locked: false },
  {
    key: 'landmarks',
    title: t('warp.landmarks'),
    items: landmarkZones.filter((z) => !NO_WARP.has(z.id)),
    locked: false,
  },
  { key: 'gems', title: t('warp.gems'), items: gems.filter((g) => state.gems.includes(g.id)), locked: false },
  { key: 'tour', title: `${t('warp.tour')} · ${tourProgress.value.visited}/${tourProgress.value.total}`, items: tourZones, locked: !careerDone.value },
  { key: 'secret', title: t('warp.secret'), items: state.secret ? [SECRET_ZONE] : [], locked: false },
])
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section class="modal" role="dialog" aria-label="Quick travel">
      <header class="modal-head">
        <div>
          <p class="kicker">{{ t('warp.kicker') }}</p>
          <h2>{{ t('warp.title') }}</h2>
        </div>
        <button class="icon-btn" :aria-label="t('warp.close')" @click="emit('close')"><Icon name="close" /></button>
      </header>
      <div class="warp-scroll">
        <template v-for="(grp, gi) in groups" :key="grp.key">
          <section v-if="grp.items.length" class="warp-group" :data-group="grp.key">
            <h3 class="warp-title">{{ grp.title }}</h3>
            <p v-if="grp.locked" class="warp-locked"><Icon name="lock" :size="14" /> {{ t('warp.locked') }}</p>
            <ul class="warp-list" :class="{ locked: grp.locked }">
              <li v-for="(z, i) in grp.items" :key="z.id">
                <button
                  :ref="(el) => { if (gi === 0 && i === 0) first = el as HTMLButtonElement }"
                  class="warp-item"
                  :style="{ '--c': z.color }"
                  :disabled="grp.locked"
                  @click="emit('go', z.id)"
                >
                  <span class="warp-dot" />
                  <span class="warp-text">
                    <b>{{ zname(z) }}</b>
                    <small>{{ ztag(z) }}</small>
                  </span>
                  <Icon v-if="state.visited.includes(z.id) || state.learned.includes(z.id)" name="check" :size="18" class="warp-check" />
                  <span v-else-if="z.kind === 'tour' && !grp.locked" class="fly-tag"><Icon name="plane" :size="13" /> {{ t('warp.fly') }}</span>
                  <Icon v-else name="chevron" :size="18" />
                </button>
              </li>
            </ul>
          </section>
        </template>
      </div>
      <footer class="modal-foot">
        <LangSwitch />
        <button class="btn cvbtn" @click="openCv"><Icon name="doc" :size="16" /> {{ t('warp.skip') }}</button>
      </footer>
    </section>
  </div>
</template>
