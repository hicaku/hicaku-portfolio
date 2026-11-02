<script setup lang="ts">
import { state } from '../store'
</script>

<template>
  <div class="toasts" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="t in state.toasts" :key="t.id" class="toast" :data-tone="t.tone">
        <strong>{{ t.title }}</strong>
        <span v-if="t.text">{{ t.text }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>
