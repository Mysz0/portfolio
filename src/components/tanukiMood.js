/* ── Tanuki mood ────────────────────────────────────────────
   Tiny pub/sub so the hero buttons can cheer up the tanuki
   without importing its (lazy-loaded) 3D component.          */

const listeners = new Set()

export function setTanukiHappy(happy) {
  listeners.forEach((fn) => fn(happy))
}

export function onTanukiHappy(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
