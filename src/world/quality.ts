// Quality tier. LITE is the default: it avoids what weak or shared GPUs fail on (multisampled half-float
// targets, big textures, bloom passes) and keeps the neon look at a fraction of the cost.
// Add ?hd (or ?full) to the URL for the high-quality tier: anti-aliasing, bloom, native pixel density.
// If the high tier ever fails to draw, the page drops back to lite on its own (see leaveHd).

const q = typeof location !== 'undefined' ? location.search : ''
export const HD: boolean = /[?&](hd|full)(&|=|$)/.test(q)
export const LITE: boolean = !HD

/** Reload without the ?hd flag so a device that cannot handle the high tier lands on the lite one. */
export function leaveHd() {
  const url = new URL(location.href)
  url.searchParams.delete('hd')
  url.searchParams.delete('full')
  location.replace(url.toString())
}