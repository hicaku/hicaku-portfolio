<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from 'vue'
import { markVisit, state } from './store'
import CvView from './components/CvView.vue'
import SplashScreen from './components/SplashScreen.vue'
import Toasts from './components/Toasts.vue'

const WorldView = defineAsyncComponent(() => import('./components/WorldView.vue'))

// The world (and the heavy three.js chunk) only loads once someone isn't going straight to the CV.
const worldWanted = ref(state.mode !== 'cv')
watch(
  () => state.mode,
  (m) => {
    if (m !== 'cv') worldWanted.value = true
  },
)

function enter() {
  state.entered = true
  state.mode = 'world'
  markVisit('hub') // spawning in counts as visiting the hub
}
</script>

<template>
  <WorldView v-if="worldWanted" v-show="state.mode !== 'cv'" :active="state.mode !== 'cv'" :holding="state.mode === 'splash'" />

  <Transition name="fade">
    <SplashScreen v-if="state.mode === 'splash'" @enter="enter" />
  </Transition>

  <CvView v-if="state.mode === 'cv'" />

  <Toasts />
</template>
