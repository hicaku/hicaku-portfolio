<script setup lang="ts">
import { LANGS, type Lang, lang, setLang, t } from '../i18n'

const onChange = (e: Event) => void setLang((e.target as HTMLSelectElement).value as Lang)
</script>

<template>
  <label class="lang-switch">
    <span class="sr-only">{{ t('lang.label') }}</span>
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
    </svg>
    <select :value="lang" :aria-label="t('lang.label')" @change="onChange">
      <option v-for="l in LANGS" :key="l.code" :value="l.code">{{ l.native }}</option>
    </select>
  </label>
</template>