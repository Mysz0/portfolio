import { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { onTanukiHappy } from './tanukiMood'

/* ── Tanuki ─────────────────────────────────────────────────
   A tanuki sitting on a stone with its back to us under the moon
   (the tanuki-bayashi motif).

   Raymarched signed-distance model, not meshes: haunches, thighs,
   chest, neck, skull, cheek ruffs, muzzle, ears, front legs, feet
   and a curved bushy tail are smooth-unioned into a single smooth,
   matte surface. Fur lives only at the silhouette: rays that pass
   just outside the body pick up fine strands that thin out with
   distance (longer on the tail). Lit as a night silhouette, with
   moonlight caught in the strands facing the moon.

   Behaviour is slow and gentle: rests looking out, now and then
   lifts its head to the moon or looks around, follows the cursor with its head, flicks an ear,
   swishes its tail. Hover: looks back at you. Click: a heart pops
   by its face. Hovering "Say Hello" makes it happy: it looks back
   with squinted eyes, perks its ears, wags, and anime emotion
   lines appear by its head.
   Canvas only renders while on screen.                       */

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragmentShader = `
  precision highp float;
  uniform vec2 uRes;
  uniform float uTime;
  uniform float uYaw;
  uniform float uPitch;
  uniform float uRoll;
  uniform float uBreath;
  uniform float uSquash;
  uniform float uTail;
  uniform float uEarL;
  uniform float uEarR;
  uniform float uBlink;
  uniform float uTurn;
  varying vec2 vUv;

  const vec3 MOON = vec3(0.92, 0.89, 0.82);
  // World space: high, to the left, and behind the tanuki (away from camera)
  const vec3 L = vec3(-0.36, 0.8, -0.48);

  mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                   mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                   mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }

  float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
  }

  float sdEll(vec3 p, vec3 r) {
    float k0 = length(p / r);
    float k1 = length(p / (r * r));
    return k0 * (k0 - 1.0) / k1;
  }

  // Capsule whose radius blends from ra to rb along its length
  float sdCone(vec3 p, vec3 a, vec3 b, float ra, float rb) {
    vec3 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h) - mix(ra, rb, h);
  }

  // Ear pivots at its base and flicks outward
  float sdEar(vec3 h, float side, float flick) {
    vec3 q = h - vec3(side * 0.22, 0.27, -0.06);
    q.xy = rot(-side * flick) * q.xy;
    q.y -= 0.04;
    return sdEll(q, vec3(0.1, 0.13, 0.05));
  }

  // x: distance, y: material (1 fur, 2 dark fur, 3 stone, 4 eye, 5.x tail fur, .x = how near the tip)
  vec2 map(vec3 p) {
    // Stone: two rounded masses with lumps, a rock rather than a pillow
    float stone = sdEll(p - vec3(0.05, -0.17, -0.05), vec3(0.95, 0.3, 0.78));
    stone = smin(stone, sdEll(p - vec3(-0.62, -0.26, 0.36), vec3(0.45, 0.24, 0.4)), 0.1);
    stone = smin(stone, sdEll(p - vec3(0.7, -0.27, 0.3), vec3(0.32, 0.18, 0.3)), 0.08);
    // Big lumps for an irregular outline, fine grit on top
    stone += (noise(p * 1.7 + 4.0) - 0.5) * 0.16 + (noise(p * 5.5) - 0.5) * 0.035;

    // Body: breathes and squashes from the ground up
    vec3 b = p;
    b.y /= 1.0 + uBreath - uSquash;
    b.xz /= 1.0 + uSquash * 0.6;
    vec3 bs = vec3(abs(b.x), b.y, b.z);

    float d = sdEll(b - vec3(0.0, 0.42, -0.02), vec3(0.64, 0.46, 0.58));          // haunches
    d = smin(d, sdEll(bs - vec3(0.34, 0.27, 0.14), vec3(0.29, 0.25, 0.36)), 0.14); // thighs
    d = smin(d, sdEll(b - vec3(0.0, 0.84, 0.04), vec3(0.48, 0.42, 0.43)), 0.3);    // chest
    d = smin(d, sdEll(b - vec3(0.0, 1.13, 0.05), vec3(0.34, 0.16, 0.32)), 0.12);   // neck

    // Front legs and back feet are the darker fur
    float legs = sdCone(bs, vec3(0.19, 0.88, 0.25), vec3(0.17, 0.1, 0.4), 0.1, 0.08);
    legs = smin(legs, sdEll(bs - vec3(0.36, 0.06, 0.33), vec3(0.13, 0.07, 0.19)), 0.06);

    // Bushy tail curling around the side toward the front
    // One continuous stroke: thick root, full middle, tapering to a soft point
    vec3 tp = b - vec3(0.22, 0.2, -0.46);
    tp.xz = rot(uTail) * tp.xz;
    float tail = sdCone(tp, vec3(0.0), vec3(0.38, 0.02, -0.2), 0.16, 0.24);
    tail = smin(tail, sdCone(tp, vec3(0.38, 0.02, -0.2), vec3(0.62, 0.1, 0.08), 0.24, 0.17), 0.16);
    tail = smin(tail, sdCone(tp, vec3(0.62, 0.1, 0.08), vec3(0.67, 0.15, 0.27), 0.17, 0.06), 0.12);
    // 0 at the root → 0.9 at the tip, so the tip darkens gradually
    float tipness = clamp(1.0 - length(tp - vec3(0.66, 0.14, 0.24)) / 0.34, 0.0, 0.9);

    // Head, pivoting at the neck
    vec3 h = b - vec3(0.0, 1.22, 0.08);
    h.yz = rot(uPitch) * h.yz;
    h.xz = rot(uYaw) * h.xz;
    h.xy = rot(uRoll) * h.xy;
    h -= vec3(0.0, 0.24, 0.04);
    vec3 hs = vec3(abs(h.x), h.y, h.z);
    float head = sdEll(h, vec3(0.4, 0.34, 0.36));
    // Cheek ruffs flare out sideways, the tanuki outline
    head = smin(head, sdEll(hs - vec3(0.34, -0.13, 0.02), vec3(0.23, 0.15, 0.18)), 0.08);
    head = smin(head, sdEll(h - vec3(0.0, -0.11, 0.31), vec3(0.13, 0.1, 0.15)), 0.1);     // muzzle
    float ears = min(sdEar(h, -1.0, uEarL), sdEar(h, 1.0, uEarR));
    float nose = sdEll(h - vec3(0.0, -0.07, 0.45), vec3(0.045, 0.035, 0.035));
    float eyes = sdEll(hs - vec3(0.16, 0.02, 0.3), vec3(0.042, 0.042 * uBlink, 0.03));

    // Head blends only slightly so it stays its own shape
    float furD = smin(d, head, 0.07);
    float furAll = smin(furD, tail, 0.14);
    float darkD = min(legs, smin(ears, nose, 0.01));
    float body = smin(furAll, darkD, 0.06);

    vec2 res = vec2(body, darkD < furAll ? 2.0 : (tail < furD ? 5.0 + tipness : 1.0));
    if (eyes < res.x) res = vec2(eyes, 4.0);
    if (stone < res.x) res = vec2(stone, 3.0);
    return res;
  }

  vec3 toModel(vec3 p) {
    p.xz = rot(uTurn) * p.xz;
    return p;
  }

  vec3 calcNormal(vec3 p) {
    const vec2 e = vec2(1.0, -1.0) * 0.004;
    return normalize(
      e.xyy * map(toModel(p + e.xyy)).x +
      e.yyx * map(toModel(p + e.yyx)).x +
      e.yxy * map(toModel(p + e.yxy)).x +
      e.xxx * map(toModel(p + e.xxx)).x);
  }

  void main() {
    vec2 uv = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
    vec3 ro = vec3(0.0, 1.25, 6.2);
    vec3 ta = vec3(0.0, 0.78, 0.0);
    vec3 ww = normalize(ta - ro);
    vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
    vec3 vv = cross(uu, ww);
    const float FOCAL = 1.9;
    vec3 rd = normalize(uv.x * uu + uv.y * vv + FOCAL * ww);


    // Skip the march for rays that miss the bounding sphere
    vec3 oc = ro - vec3(0.0, 0.95, 0.0);
    float bb = dot(oc, rd);
    float cc = dot(oc, oc) - 2.2 * 2.2;
    if (bb * bb - cc < 0.0) { gl_FragColor = vec4(0.0); return; }

    float pix = 1.0 / (uRes.y * FOCAL);
    float t = max(-bb - 2.2, 0.0);
    float tEnd = -bb + 2.2;
    float best = 1e9;
    float dmin = 1e9;
    float tMin = t;
    vec2 res = vec2(1.0);
    bool hit = false;
    for (int i = 0; i < 96; i++) {
      res = map(toModel(ro + rd * t));
      best = min(best, res.x / t);
      if (res.x < dmin) { dmin = res.x; tMin = t; }
      if (res.x < 0.0008 * t) { hit = true; break; }
      t += res.x * 0.75;
      if (t > tEnd) break;
    }
    float alpha = hit ? 1.0 : 1.0 - smoothstep(0.0, pix * 1.6, best);

    // Fur at the silhouette: fine strands just outside the surface that
    // thin out with distance, longer on the bushy tail
    if (!hit && dmin < 0.1) {
      vec3 pf = toModel(ro + rd * tMin);
      float m = map(pf).y;
      if (m < 2.5 || m > 4.5) {
        float fuzz = m > 4.5 ? 0.09 : (m > 1.5 ? 0.035 : 0.05);
        float k = dmin / fuzz;
        float strand = noise(pf * 95.0) * 0.7 + noise(pf * 210.0) * 0.3;
        alpha = max(alpha, smoothstep(k - 0.08, k + 0.08, strand) * max(1.0 - k, 0.0));
      }
    }
    if (alpha <= 0.0) { gl_FragColor = vec4(0.0); return; }

    float ts = hit ? t : tMin;
    vec3 pw = ro + rd * ts;
    vec3 pm = toModel(pw);
    float mat = map(pm).y;
    vec3 n = calcNormal(pw);
    vec3 l = normalize(L);

    float dif = max(dot(n, l), 0.0);
    float fres = pow(1.0 - max(dot(n, -rd), 0.0), 2.0);
    float toward = smoothstep(-0.15, 0.7, dot(n, l));
    float rim = fres * toward;

    vec3 col;
    if (mat > 4.5 || mat < 2.5) {
      vec3 base = (mat > 1.5 && mat < 2.5) ? vec3(0.022, 0.02, 0.019) : vec3(0.04, 0.036, 0.033);
      if (mat > 4.5) base = mix(base, vec3(0.022, 0.02, 0.019), fract(mat));  // darker toward the tail tip
      col = base * (0.75 + 0.5 * dif) + MOON * rim * 0.55;
      // Fringe strands backlit by the moon glow on its side, stay dark elsewhere
      if (!hit) col = base + MOON * toward * 0.8;
    } else if (mat > 3.5) {
      // Eye: dark with a small catchlight, seen when it looks back
      col = vec3(0.012);
      col += MOON * 0.9 * smoothstep(0.86, 0.97, dot(n, normalize(vec3(-0.4, 0.5, 0.75))));
    } else {
      // Stone: moonlight on its top face, damp and dark below
      col = vec3(0.046, 0.046, 0.044) * (0.6 + 0.9 * dif) + MOON * rim * 0.3;
    }

    gl_FragColor = vec4(col, alpha);
  }
`

const GLANCE_YAW = 1.3  // positive turns the head toward the viewer, over the right shoulder
const MOON_PITCH = -0.55  // head tipped up toward the moon
const REST_PITCH = -0.12  // looking out over the scene
const MOON_YAW = -0.2     // the moon sits up and to its left

const rand = (a, b) => a + Math.random() * (b - a)

function TanukiShader({ hoverRef, mouseRef, happyRef, petRef }) {
  const uniforms = useMemo(() => ({
    uRes: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uYaw: { value: 0 },
    uPitch: { value: REST_PITCH },
    uRoll: { value: 0 },
    uBreath: { value: 0 },
    uSquash: { value: 0 },
    uTail: { value: 0 },
    uEarL: { value: 0 },
    uEarR: { value: 0 },
    uBlink: { value: 1 },
    // Three-quarter back view
    uTurn: { value: Math.PI + 0.5 },
  }), [])

  // Behaviour state, all timings in seconds of clock time
  const s = useRef({
    yaw: 0, yawV: 0, pitch: REST_PITCH, pitchV: 0, roll: 0,
    mode: 'rest', modeUntil: 6, aroundYaw: 0,
    ear: { side: 0, t: -1, next: 3 },
    swish: { t: -1, next: 8 },
    blink: { t: -1, next: 3 },
    joy: 0,
    last: -1,
  })

  useFrame((state) => {
    const u = uniforms
    const b = s.current
    // Own clock: R3F's state.clock can reset, which would strand every timer
    // below (blinks, ear flicks, idle looks) far in the future
    const t = performance.now() / 1000
    const dt = b.last < 0 ? 1 / 60 : Math.min(t - b.last, 0.05)
    b.last = t
    const { width, height } = state.size
    const dpr = state.gl.getPixelRatio()
    u.uRes.value.set(width * dpr, height * dpr)
    u.uTime.value = t

    // Happy (Say Hello hover) or just petted: eased 0..1 so it fades in and out
    const happy = happyRef.current || performance.now() < petRef.current
    // Quick to cheer up, slower to calm down
    b.joy += ((happy ? 1 : 0) - b.joy) * (1 - Math.exp(-dt * (happy ? 9 : 2.5)))

    // ── Where to look ──
    const m = mouseRef.current
    const cursorLive = performance.now() - m.last < 3000
    let yawT
    let pitchT
    let rollT = Math.sin(t * 0.3) * 0.025
    if (happy || hoverRef.current) {
      yawT = GLANCE_YAW
      pitchT = -0.08
      rollT = 0.14
    } else if (cursorLive) {
      yawT = THREE.MathUtils.clamp(m.x * 1.2, -0.8, 0.9)
      pitchT = THREE.MathUtils.clamp(-0.18 + m.y * 0.35, -0.5, 0.0)
    } else {
      // Idle: rests looking out; now and then a slow look up at the moon,
      // or a glance around, then back to resting
      if (t > b.modeUntil) {
        if (b.mode === 'rest') {
          b.mode = Math.random() < 0.6 ? 'moon' : 'around'
          b.aroundYaw = (Math.random() < 0.5 ? -1 : 1) * rand(0.35, 0.75)
          b.modeUntil = t + (b.mode === 'moon' ? rand(4.5, 7) : rand(2.5, 3.8))
        } else {
          b.mode = 'rest'
          b.modeUntil = t + rand(6, 11)
        }
      }
      if (b.mode === 'moon') {
        yawT = MOON_YAW
        pitchT = MOON_PITCH
        rollT = -0.06
      } else if (b.mode === 'around') {
        yawT = b.aroundYaw
        pitchT = -0.2
        rollT = b.aroundYaw * 0.1
      } else {
        yawT = Math.sin(t * 0.22) * 0.06
        pitchT = REST_PITCH
      }
    }

    // Critically damped springs: reacting to you is quick, idle drifting stays soft
    const stiff = happy || hoverRef.current ? 40 : 7
    const damp = 2 * Math.sqrt(stiff)
    b.yawV += ((yawT - b.yaw) * stiff - b.yawV * damp) * dt
    b.yaw += b.yawV * dt
    b.pitchV += ((pitchT - b.pitch) * stiff - b.pitchV * damp) * dt
    b.pitch += b.pitchV * dt
    b.roll += (rollT - b.roll) * (1 - Math.exp(-dt * 1.5))
    u.uYaw.value = b.yaw
    u.uPitch.value = b.pitch
    u.uRoll.value = b.roll

    // ── Ears: an unhurried flick now and then, both perk when happy ──
    const ear = b.ear
    if (ear.t < 0 && t > ear.next) {
      ear.t = 0
      ear.side = Math.random() < 0.5 ? -1 : 1
    }
    let flick = 0
    if (ear.t >= 0) {
      ear.t += dt
      flick = Math.sin(Math.min(ear.t / 0.5, 1) * Math.PI) * 0.32
      if (ear.t > 0.5) {
        ear.t = -1
        ear.next = t + rand(3, 8)
      }
    }
    const perk = b.joy * 0.22
    u.uEarL.value = (ear.side < 0 ? flick : 0) + perk
    u.uEarR.value = (ear.side > 0 ? flick : 0) + perk
    u.uSquash.value = 0
    u.uBreath.value = Math.sin(t * 1.1) * 0.01

    // ── Tail: lazy sway, a slow swish now and then, a wag when happy ──
    const sw = b.swish
    if (sw.t < 0 && t > sw.next) sw.t = 0
    let swish = 0
    if (sw.t >= 0) {
      sw.t += dt
      swish = Math.sin(sw.t * 5) * 0.2 * (1 - sw.t / 1.8)
      if (sw.t > 1.8) {
        sw.t = -1
        sw.next = t + rand(8, 15)
      }
    }
    const wag = Math.sin(t * 3.2) * 0.18 * b.joy
    u.uTail.value = Math.sin(t * 0.7) * 0.1 + swish + wag

    // ── Eyes: blink, or a happy squint ──
    const bl = b.blink
    if (bl.t < 0 && t > bl.next) bl.t = 0
    let open = 1
    if (bl.t >= 0) {
      bl.t += dt
      open = 1 - Math.sin(Math.min(bl.t / 0.18, 1) * Math.PI) * 0.9
      if (bl.t > 0.18) {
        bl.t = -1
        bl.next = t + rand(3, 6)
      }
    }
    u.uBlink.value = Math.min(open, 1 - b.joy * 0.75)
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

/* Renders only while on screen. The canvas stays in 'demand' mode and is
   invalidated every animation frame while visible, instead of toggling
   frameloop (which resets R3F's clock and restarts its loop). */
function RenderWhileVisible({ visibleRef }) {
  const invalidate = useThree((st) => st.invalidate)
  useEffect(() => {
    let id
    const loop = () => {
      id = requestAnimationFrame(loop)
      if (visibleRef.current) invalidate()
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [invalidate, visibleRef])
  return null
}

/* Anime-style emotion marks: three strokes radiating from the head.
   Drawn in the canvas's own 340×300 frame so they line up with the
   head at any size; each stroke draws outward from the head. */
function JoyLines({ show }) {
  return (
    <svg className="tanuki-joy" data-show={show} viewBox="0 0 340 300" aria-hidden="true">
      <line x1="210.0" y1="40.7" x2="216.9" y2="25.1" pathLength="1" style={{ '--i': 0 }} />
      <line x1="229.4" y1="55.3" x2="242.4" y2="44.4" pathLength="1" style={{ '--i': 1 }} />
      <line x1="240.4" y1="76.9" x2="256.9" y2="72.8" pathLength="1" style={{ '--i': 2 }} />
    </svg>
  )
}

function Heart({ x }) {
  return (
    <svg className="tanuki-heart" style={{ left: `${x}%` }} viewBox="0 0 24 22" aria-hidden="true">
      <path d="M12 21 C5 15.5 1 12 1 7.2 1 3.8 3.6 1.2 6.8 1.2 c2.1 0 4 1.1 5.2 2.9 1.2-1.8 3.1-2.9 5.2-2.9 3.2 0 5.8 2.6 5.8 6 0 4.8-4 8.3-11 13.8z" />
    </svg>
  )
}

export default function Tanuki() {
  const wrapRef = useRef(null)
  const hoverRef = useRef(false)
  const happyRef = useRef(false)
  const petRef = useRef(0)  // timestamp until which a click keeps it pleased
  const mouseRef = useRef({ x: 0, y: 0, last: -Infinity })
  const visibleRef = useRef(true)
  // Bumped to remount the canvas if the browser drops its WebGL context
  const [glKey, setGlKey] = useState(0)
  const [happy, setHappy] = useState(false)
  const [hearts, setHearts] = useState([])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const observer = new IntersectionObserver(([e]) => { visibleRef.current = e.isIntersecting }, { threshold: 0 })
    observer.observe(el)

    // Cursor relative to the tanuki's head, roughly -1..1 across the viewport
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      mouseRef.current.x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth * 2
      mouseRef.current.y = (e.clientY - (r.top + r.height * 0.3)) / window.innerHeight * 2
      mouseRef.current.last = performance.now()
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    const offHappy = onTanukiHappy((v) => {
      happyRef.current = v
      setHappy(v)
    })
    return () => {
      observer.disconnect()
      window.removeEventListener('mousemove', onMove)
      offHappy()
    }
  }, [])

  const handlePet = useCallback(() => {
    petRef.current = performance.now() + 1800
    const id = performance.now()
    setHearts((h) => [...h.slice(-3), { id, x: rand(63, 67) }])
    setTimeout(() => setHearts((h) => h.filter((x) => x.id !== id)), 1600)
  }, [])

  return (
    <div
      ref={wrapRef}
      className="absolute bottom-0 right-[1%] sm:right-[5%] w-[190px] h-[170px] sm:w-[340px] sm:h-[300px] z-10 cursor-pointer select-none"
      onClick={handlePet}
      onPointerEnter={() => { hoverRef.current = true }}
      onPointerLeave={() => { hoverRef.current = false }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePet() }}
      aria-label="Tanuki watching the moon"
    >
      <Canvas
        key={glKey}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false }}
        frameloop="demand"
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            setTimeout(() => setGlKey((k) => k + 1), 300)
          }, { once: true })
        }}
        // Fade the stone's underside out instead of a hard edge
        style={{
          maskImage: 'linear-gradient(to bottom, #000 88%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 88%, transparent 100%)',
        }}
      >
        <TanukiShader hoverRef={hoverRef} mouseRef={mouseRef} happyRef={happyRef} petRef={petRef} />
        <RenderWhileVisible visibleRef={visibleRef} />
      </Canvas>
      <JoyLines show={happy} />
      {hearts.map((h) => <Heart key={h.id} x={h.x} />)}
    </div>
  )
}
