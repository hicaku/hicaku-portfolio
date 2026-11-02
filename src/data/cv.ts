// Single source of truth. The 3D world panels and the plain CV page both render from this.
// Deliberately NOT included: phone number and reference emails (see README note) — "references on request".

export interface Stat {
  label: string
  value: string
}

export interface Role {
  id: string
  company: string
  role: string
  period: string
  location: string
  quest: string // gamified quest title
  tagline: string // one-liner flavour for the world panel
  bullets: string[]
  stack: string[]
  stats?: Stat[]
  trophy?: string
  current?: boolean
}

export interface Project {
  id: string
  name: string
  kind: string
  blurb: string
  tags: string[]
  link?: string
  linkLabel?: string
}

export const profile = {
  name: 'Hikmet Kufteoglu',
  handle: 'hicaku',
  title: 'Software Engineer · Frontend / Full-Stack',
  location: 'Malta',
  nationality: 'Turkish national',
  relocation: 'Open to relocation · Visa sponsorship required',
  email: 'hikmet.kufteoglu@gmail.com',
  linkedin: 'https://linkedin.com/in/hicaku',
  github: 'https://github.com/hicaku',
  summary:
    'Software engineer with 8+ years of experience building web applications end to end, from a global map product at Huawei to AI-powered CRM platforms. Strong in Vue.js, React, TypeScript and Go, with a focus on performance, reliability and well-tested code. Works fluently with AI coding tools to ship quality code faster. Used to remote, cross-border teams. Professional English, and keen to relocate and take on new challenges.',
  languages: [
    { name: 'English', level: 'Professional working proficiency' },
    { name: 'Turkish', level: 'Native' },
  ],
  education: {
    degree: 'B.Sc. Mathematics Engineering',
    school: 'Istanbul Technical University',
    period: '2016 – 2021',
  },
}

// Chronological order (oldest first) — this is the order they appear along the spiral.
export const roles: Role[] = [
  {
    id: 'datapare',
    company: 'Datapare',
    role: 'Junior Full-Stack / Frontend Developer (part-time during studies)',
    period: 'Jun 2018 – May 2021',
    location: 'Istanbul (Levent)',
    quest: 'Level 1 — First Commits',
    tagline: 'Where the keyboard became a career.',
    bullets: ['Learned web development in an agile startup team, alongside my degree.'],
    stack: ['PHP', 'MySQL', 'JavaScript', 'jQuery', 'Vue.js', 'HTML/CSS', 'JIRA'], // the CV lists one stack for both jobs
  },
  {
    id: 'firmasoft',
    company: 'Firmasoft',
    role: 'Junior Full-Stack / Frontend Developer (part-time during studies)',
    period: 'Jun 2018 – May 2021',
    location: 'Istanbul (Suadiye)',
    quest: 'Level 2 — Client Work',
    tagline: 'Real clients, real deadlines, real CMSs.',
    bullets: ['Built websites and CMSs for clients.'],
    stack: ['PHP', 'MySQL', 'JavaScript', 'jQuery', 'Vue.js', 'HTML/CSS', 'JIRA'], // the CV lists one stack for both jobs
  },
  {
    id: 'huawei',
    company: 'Huawei',
    role: 'Frontend Developer',
    period: 'Jun 2021 – Jan 2023',
    location: 'Istanbul (Remote)',
    quest: 'Level 3 — Map the World',
    tagline: "Tools for Petal Maps, Huawei's global mapping product.",
    bullets: [
      "Developed several tools for Petal Maps, Huawei's global mapping product, working in a small team.",
      "Won the company's Future Star Award (2021).",
    ],
    stack: ['Vue.js', 'TypeScript', 'JavaScript', 'React.js', 'LESS', 'Jest', 'Cypress', 'JIRA', 'Git'],
    stats: [{ label: 'Monthly active users', value: '20M+' }],
    trophy: 'Future Star Award · 2021',
  },
  {
    id: 'goart',
    company: 'GoArt Metaverse',
    role: 'Frontend Developer',
    period: 'Jan 2023 – Dec 2023',
    location: 'Istanbul (Remote)',
    quest: 'Level 4 — Into the Metaverse',
    tagline: 'Web3 products and 3D experiences for a metaverse & AR platform.',
    bullets: [
      'Built web3 products for a metaverse and AR platform, including a raffle system for NFT giveaways and a land NFT marketplace.',
      'Developed interactive 3D experiences with three.js.',
    ],
    stack: ['React.js', 'Next.js', 'JavaScript', 'three.js', 'Web3', 'Azure', 'SCSS', 'Git'],
    stats: [{ label: 'Platform users', value: '100K+' }],
  },
  {
    id: 'fasttrack',
    company: 'Fast Track',
    role: 'Software Engineer (Full-Stack)',
    period: 'Feb 2024 – Present',
    location: 'Malta (On-site)',
    quest: 'Level 5 — Current Mission',
    tagline: 'AI-powered CRM platforms: Vue + TypeScript up front, Go behind.',
    bullets: [
      'Build and enhance user-facing features for AI-powered CRM platforms in Vue.js and TypeScript, and develop backend services in Go.',
      'Rely on AI coding assistants throughout the workflow to deliver well-tested features quickly, while keeping review and quality standards high.',
      'Work with support teams to investigate and resolve production incidents.',
      'Identify and implement optimizations that improve performance, reliability and customer experience.',
    ],
    stack: ['Vue.js', 'TypeScript', 'Go', 'Vitest', 'SCSS', 'Git', 'AI-assisted development'],
    current: true,
  },
]

export const skills = [
  { branch: 'Frontend', color: '#00f0ff', items: ['Vue.js', 'React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS/SCSS'] },
  { branch: 'Testing', color: '#b6ff3c', items: ['Vitest', 'Jest', 'Cypress'] },
  { branch: 'Backend', color: '#ff2bd6', items: ['Go', 'Node.js', 'PHP', 'MySQL'] },
  { branch: 'Tools', color: '#8b5cff', items: ['AI-assisted development', 'Git/GitHub', 'JIRA', 'Azure', 'three.js', 'Web3'] },
]

/** Off-the-clock life. These power the hidden gems on the map — personalise the wording freely. */
export const hobbies = [
  {
    id: 'padel',
    title: 'Padel Court',
    kicker: 'Hidden gem · Hobby',
    text: 'Off the keyboard you will find me on a padel court: fast rallies, balls ricocheting off the glass, and the best reset button I know after a long sprint.',
    chips: ['Padel', 'Rallies', 'Reset'],
  },
  {
    id: 'gaming',
    title: 'Gaming Den',
    kicker: 'Hidden gem · Hobby',
    text: 'Gaming is my other happy place, and it leaks into my side projects. Knox Companion, for example, is a companion app for Project Zomboid squads.',
    chips: ['Gaming', 'Project Zomboid', 'Side quests'],
  },
  {
    id: 'travel',
    title: 'Departure Quay',
    kicker: 'Hidden gem · Hobby',
    text: 'I love putting a new place on the map. Istanbul to Malta already counts. Where the next pin lands is still undecided.',
    chips: ['Travel', 'New places', 'Remote teams'],
  },
]

export const projects: Project[] = [
  {
    id: 'knox',
    name: 'Knox Companion',
    kind: 'Live multiplayer web app + game mod',
    blurb:
      'A companion for Project Zomboid squads: claim safehouses on a live map, get procedural objectives, follow a campaign and watch your squad move in real time. Ships with an in-game Lua mod (Steam Workshop).',
    tags: ['JavaScript (ES modules)', 'Leaflet', 'Supabase Realtime', 'Lua', 'Web Audio'],
    link: 'https://zomboid.hicaku.dev',
    linkLabel: 'zomboid.hicaku.dev',
  },
  {
    id: 'hepsio',
    name: 'Hepsio Life Tracker',
    kind: 'Full-stack quantified-self app',
    blurb:
      'Personal tracker for hourly time logs, money, weight and trips, with pluggable custom trackers. Vue 3 + Tailwind client, Express + Prisma + Postgres API, deployed on Vercel with Neon.',
    tags: ['Vue 3', 'Tailwind', 'Express', 'Prisma', 'PostgreSQL', 'Vercel'],
  },
]
