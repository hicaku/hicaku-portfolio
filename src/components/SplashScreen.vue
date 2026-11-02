<script setup lang="ts">
import { t } from '../i18n'
import { openCv, state } from '../store'
import Icon from './Icon.vue'
import LangSwitch from './LangSwitch.vue'

const emit = defineEmits<{ enter: [] }>()
</script>

<template>
  <div class="splash">
    <div class="splash-lang"><LangSwitch /></div>
    <div class="splash-card">
      <p class="splash-kicker"><span class="blink" /> {{ t('splash.ready') }}</p>
      <h1 class="glitch" data-text="Hikmet Kufteoglu">Hikmet Kufteoglu</h1>
      <p class="splash-sub">{{ t('splash.sub') }}</p>
      <p class="splash-blurb">{{ t('splash.blurb') }}</p>
      <div class="splash-actions">
        <button class="btn primary big" :disabled="!state.worldReady" @click="emit('enter')">
          <Icon name="bolt" :size="20" />
          <span>{{ state.worldReady ? t('splash.enter') : t('splash.booting') }}</span>
        </button>
        <button class="btn ghost big" @click="openCv"><Icon name="doc" :size="18" /> <span>{{ t('splash.cv') }}</span></button>
      </div>
      <p class="splash-foot">
        <template v-if="state.isTouch">{{ t('splash.foot.touch') }}</template>
        <template v-else>{{ t('splash.foot.desktop') }}</template>
      </p>
    </div>
  </div>
</template>