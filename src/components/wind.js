/* ── Shared wind ────────────────────────────────────────────
   One gust value that WindGust raises on fast scrolls and
   RainCanvas eases toward, so the rain leans into the same
   wind the streaks show. 0 = calm, 1 = full gust.            */

export const wind = { target: 0, current: 0 }

/* Raise the gust; never lowers it — RainCanvas handles decay */
export function gust(strength) {
  if (strength > wind.target) wind.target = Math.min(strength, 1)
}
