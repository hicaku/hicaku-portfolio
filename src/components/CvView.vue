<script setup lang="ts">
import { onMounted } from 'vue'
import { t, tx } from '../i18n'
import { leaveCv, state } from '../store'
import LangSwitch from './LangSwitch.vue'
import { profile, projects, roles, skills } from '../data/cv'
import Icon from './Icon.vue'

// Newest first on a CV. The map shows Datapare (Levent) and Firmasoft (Suadiye) as two stops,
// but on paper they were one overlapping stretch, so the plain CV keeps them as a single entry.
const experience = [...roles]
  .reverse()
  .filter((r) => r.id !== 'datapare')
  .map((r) =>
    r.id === 'firmasoft'
      ? {
          ...r,
          company: 'Firmasoft & Datapare',
          location: 'Istanbul',
          bullets: ['Built websites and CMSs for clients at Firmasoft.', 'Learned web development in an agile startup team at Datapare.'],
          merged: true,
        }
      : r,
  )

const printCv = () => window.print()

onMounted(() => window.scrollTo({ top: 0 }))
</script>

<template>
  <div class="cv-page">
    <nav class="cv-bar" aria-label="CV actions">
      <button v-if="!state.worldFailed" class="btn ghost" @click="leaveCv">
        <Icon name="left" :size="16" />
        <span>{{ t('cv.back') }}</span>
      </button>
      <span v-else class="cv-note">3D world unavailable on this device — here's the plain CV.</span>
      <div class="cv-bar-right">
        <LangSwitch />
        <a class="icon-link" :href="profile.linkedin" target="_blank" rel="noopener" aria-label="LinkedIn"><Icon name="linkedin" /></a>
        <a class="icon-link" :href="profile.github" target="_blank" rel="noopener" aria-label="GitHub"><Icon name="github" /></a>
        <a class="icon-link" :href="`mailto:${profile.email}`" aria-label="Email"><Icon name="mail" /></a>
        <a class="btn ghost" href="/Hikmet-Kufteoglu-CV.pdf" target="_blank" rel="noopener">PDF</a>
        <button class="btn primary" @click="printCv"><Icon name="print" :size="16" /> <span>Print / Save PDF</span></button>
      </div>
    </nav>

    <main class="cv" id="cv-main">
      <header class="cv-head">
        <h1>{{ profile.name }}</h1>
        <p class="cv-title">{{ t('cv.title') }}</p>
        <p class="cv-contact">
          <span>{{ t('place.malta') }}</span>
          <span>{{ profile.nationality }}</span>
          <span>{{ t('cv.relocation') }}</span>
        </p>
        <p class="cv-contact">
          <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
          <a :href="profile.linkedin" target="_blank" rel="noopener">linkedin.com/in/hicaku</a>
          <a :href="profile.github" target="_blank" rel="noopener">github.com/hicaku</a>
        </p>
      </header>

      <section>
        <h2>{{ t('cv.summaryH') }}</h2>
        <p>{{ t('cv.summary') }}</p>
      </section>

      <section>
        <h2>{{ t('cv.experience') }}</h2>
        <article v-for="r in experience" :key="r.id" class="cv-job">
          <header>
            <h3>{{ r.company }} <span class="where">— {{ r.location }}</span></h3>
            <time>{{ r.period }}</time>
          </header>
          <p class="role">{{ tx(`role.${r.id}.role`, r.role) }}</p>
          <ul>
            <li v-for="(b, i) in r.bullets" :key="b">{{ (r as any).merged ? b : tx(`role.${r.id}.b${i}`, b) }}</li>
          </ul>
          <p v-if="r.stats" class="highlights">
            <span v-for="s in r.stats" :key="s.label"><b>{{ s.value }}</b> {{ s.label.toLowerCase() }}</span>
          </p>
          <p class="stack"><b>Stack:</b> {{ r.stack.join(', ') }}</p>
        </article>
      </section>

      <section>
        <h2>{{ t('cv.skills') }}</h2>
        <dl class="cv-skills">
          <div v-for="b in skills" :key="b.branch">
            <dt>{{ tx(`skill.${b.branch}`, b.branch) }}</dt>
            <dd>{{ b.items.join(', ') }}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2>{{ t('cv.projects') }}</h2>
        <article v-for="p in projects" :key="p.id" class="cv-project">
          <h3>
            {{ p.name }} <span class="where">— {{ tx(`proj.${p.id}.kind`, p.kind) }}</span>
          </h3>
          <p>{{ tx(`proj.${p.id}.blurb`, p.blurb) }}</p>
          <p class="stack">
            <b>Tech:</b> {{ p.tags.join(', ') }}
            <template v-if="p.link"> · <a :href="p.link" target="_blank" rel="noopener">{{ p.linkLabel ?? p.link }}</a></template>
          </p>
        </article>
      </section>

      <div class="cv-cols">
        <section>
          <h2>{{ t('cv.education') }}</h2>
          <p>
            <b>{{ profile.education.degree }}</b> — {{ profile.education.school }}
            <time>{{ profile.education.period }}</time>
          </p>
        </section>
        <section>
          <h2>{{ t('cv.languages') }}</h2>
          <p v-for="l in profile.languages" :key="l.name">
            <b>{{ l.name }}:</b> {{ l.level }}
          </p>
        </section>
      </div>

      <section>
        <h2>{{ t('cv.references') }}</h2>
        <p>{{ t('contact.refsV') }}.</p>
      </section>
    </main>
  </div>
</template>
