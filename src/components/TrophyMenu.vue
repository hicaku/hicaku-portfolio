<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { t } from '../i18n'
import { achievements, progress } from '../store'
import Icon from './Icon.vue'

const emit = defineEmits<{ close: [] }>()
const btn = ref<HTMLButtonElement>()
onMounted(() => btn.value?.focus({ preventScroll: true }))

const done = computed(() => achievements.value.filter((a) => a.done).length)
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section class="modal" role="dialog" :aria-label="t('trophy.title')">
      <header class="modal-head">
        <div>
          <p class="kicker">{{ t('trophy.progress', { n: progress.visited, total: progress.total }) }}</p>
          <h2>{{ t('trophy.title') }} <span class="count">{{ done }}/{{ achievements.length }}</span></h2>
        </div>
        <button ref="btn" class="icon-btn" :aria-label="t('warp.close')" @click="emit('close')"><Icon name="close" /></button>
      </header>
      <ul class="trophies">
        <li v-for="a in achievements" :key="a.id" :class="{ done: a.done, secret: a.secret && !a.done }">
          <span class="trophy-icon"><Icon :name="a.done ? 'trophy' : 'lock'" :size="20" /></span>
          <span class="trophy-text">
            <b>{{ a.title }}</b>
            <small>{{ a.text }}</small>
          </span>
        </li>
      </ul>
    </section>
  </div>
</template>