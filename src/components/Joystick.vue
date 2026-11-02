<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ move: [x: number, y: number] }>()

const base = ref<HTMLElement>()
const knob = ref({ x: 0, y: 0 })
const active = ref(false)
let pointerId = -1
const RADIUS = 46

function update(e: PointerEvent) {
  const r = base.value!.getBoundingClientRect()
  let dx = e.clientX - (r.left + r.width / 2)
  let dy = e.clientY - (r.top + r.height / 2)
  const len = Math.hypot(dx, dy)
  if (len > RADIUS) {
    dx = (dx / len) * RADIUS
    dy = (dy / len) * RADIUS
  }
  knob.value = { x: dx, y: dy }
  emit('move', dx / RADIUS, dy / RADIUS)
}

function down(e: PointerEvent) {
  if (pointerId !== -1) return
  pointerId = e.pointerId
  active.value = true
  base.value!.setPointerCapture(e.pointerId)
  update(e)
}

function move(e: PointerEvent) {
  if (e.pointerId === pointerId) update(e)
}

function up(e: PointerEvent) {
  if (e.pointerId !== pointerId) return
  pointerId = -1
  active.value = false
  knob.value = { x: 0, y: 0 }
  emit('move', 0, 0)
}
</script>

<template>
  <div
    ref="base"
    class="joystick"
    :class="{ active }"
    role="application"
    aria-label="Virtual joystick: drag to fly"
    @pointerdown.prevent="down"
    @pointermove.prevent="move"
    @pointerup="up"
    @pointercancel="up"
    @lostpointercapture="up"
  >
    <div class="joystick-knob" :style="{ transform: `translate(${knob.x}px, ${knob.y}px)` }" />
  </div>
</template>
