import { useRef, useCallback, useEffect, useMemo } from 'react'

/*  ── Orbit parameters per character ─────────────────────
    Each character floats in a unique Lissajous-like orbit.
    The "." (last char) gets the smallest, slowest orbit
    to feel more grounded.                                   */
function buildOrbitParams(charCount) {
  return Array.from({ length: charCount }, (_, i) => {
    const isLast = i === charCount - 1
    return {
      radiusX: isLast ? 3 : 5 + (i * 2.3) % 6,
      radiusY: isLast ? 2 : 4 + (i * 1.7) % 5,
      freqX: isLast ? 0.15 : 0.2 + (i * 0.07) % 0.15,
      freqY: isLast ? 0.12 : 0.18 + (i * 0.09) % 0.12,
      phaseX: (i * 1.4) % (Math.PI * 2),
      phaseY: (i * 2.1 + 0.7) % (Math.PI * 2),
      rotRadius: isLast ? 0.3 : 0.5 + (i * 0.4) % 1.2,
      rotFreq: isLast ? 0.1 : 0.13 + (i * 0.04) % 0.08,
      rotPhase: (i * 0.9) % (Math.PI * 2),
    }
  })
}

/*  ── Spring interpolation ───────────────────────────────
    Critically-damped spring. Returns [position, velocity]. */
function springStep(pos, vel, target, stiffness, damping, dt) {
  const force = (target - pos) * stiffness
  const dampForce = -vel * damping
  const newVel = vel + (force + dampForce) * dt
  const newPos = pos + newVel * dt
  return [newPos, newVel]
}

/* Rest defaults for per-character state */
const REST = {
  x: 0, y: 0, rot: 0,
  vx: 0, vy: 0, vrot: 0,
  spreadX: 0, spreadXVel: 0,
  liftY: 0, liftYVel: 0,
  blur: 0.6, blurVel: 0,
  brightness: 0.88, brightnessVel: 0,
  scale: 1, scaleVel: 0,
  opacity: 0.85, opacityVel: 0,
}

/*  ── SVG Filter ID (unique per instance) ─────────────── */
let filterId = 0
function nextFilterId() {
  return `wind-displacement-${++filterId}`
}

/* Threshold for "at rest" detection (non-alive mode) */
const SETTLE_THRESHOLD = 0.001

export default function WindText({
  children,
  as: Tag = 'h2',
  className = '',
  alive = false,
  rhythmRef = null,
}) {
  const containerRef = useRef(null)
  const animFrameRef = useRef(null)
  const prefersReduced = useRef(false)
  const svgFilterId = useRef(nextFilterId())

  // Mouse state
  const mouseLocal = useRef({ x: -9999, y: -9999, inside: false })
  const mouseVelocity = useRef(0)
  const lastMouseX = useRef(null)

  // Per-character spring state
  const charStates = useRef(null)

  // SVG filter animated values (alive mode only)
  const filterState = useRef({
    baseFreq: 0.015, baseFreqVel: 0,
    displacement: 6, displacementVel: 0,
    seed: 1, seedTimer: 0,
  })

  // For non-alive mode: track whether hover rAF is running
  const hoverLoopRunning = useRef(false)

  // Stable refs for functions used in rAF callbacks
  const orbitParamsRef = useRef(null)
  const mouseVelocityRef = mouseVelocity

  const text = typeof children === 'string' ? children : ''
  const orbitParams = useMemo(() => buildOrbitParams(text.length), [text.length])
  orbitParamsRef.current = orbitParams

  // Detect reduced motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReduced.current = mq.matches
    const handler = (e) => { prefersReduced.current = e.matches }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Initialize per-character spring states
  useEffect(() => {
    charStates.current = Array.from({ length: text.length }, () => ({ ...REST }))
  }, [text.length])

  // ── Shared character update logic ────────────────────
  // Used by both alive (continuous) and non-alive (on-demand) loops
  const updateCharsRef = useRef(null)
  updateCharsRef.current = function updateChars(chars, containerRect, mx, my, mouseInside, hoverRadius, time, dt, useOrbits) {
    let allSettled = true
    const currentOrbitParams = orbitParamsRef.current

    for (let i = 0; i < chars.length; i++) {
      const state = charStates.current[i]
      const charEl = chars[i]

      // Orbit targets (alive mode only)
      let targetX = 0
      let targetY = 0
      let targetRot = 0

      if (useOrbits) {
        const orbit = currentOrbitParams[i]
        targetX = Math.sin(time * orbit.freqX + orbit.phaseX) * orbit.radiusX
        targetY = Math.cos(time * orbit.freqY + orbit.phaseY) * orbit.radiusY
        targetRot = Math.sin(time * orbit.rotFreq + orbit.rotPhase) * orbit.rotRadius
      }

      // Hover targets
      let targetSpreadX = 0
      let targetLiftY = 0
      let targetBlur = 0.6
      let targetBrightness = 0.88
      let targetScale = 1
      let targetOpacity = 0.85

      if (mouseInside) {
        const charRect = charEl.getBoundingClientRect()
        const charCenterX = charRect.left + charRect.width / 2 - containerRect.left
        const charCenterY = charRect.top + charRect.height / 2 - containerRect.top

        const dx = mx - charCenterX
        const dy = my - charCenterY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const influence = Math.max(0, 1 - distance / hoverRadius)
        const smooth = influence * influence * (3 - 2 * influence)

        // Gravity well (alive) or just displacement (non-alive)
        if (useOrbits && smooth > 0.01) {
          const gravityStrength = 8
          targetX += dx * smooth * 0.15 * gravityStrength / hoverRadius
          targetY += dy * smooth * 0.15 * gravityStrength / hoverRadius
        }

        // Ink dispersion
        const pushDirection = dx > 0 ? -1 : 1
        targetSpreadX = pushDirection * smooth * 12
        targetLiftY = -smooth * 8

        // Brush stroke reveal
        targetBlur = (1 - smooth) * 1.2
        const velocityClamped = Math.max(-8, Math.min(8, mouseVelocityRef.current))
        targetRot = (useOrbits ? targetRot : 0) + smooth * velocityClamped * 0.5
        targetBrightness = 0.85 + smooth * 0.2
        targetScale = 1 + smooth * 0.04
        targetOpacity = 0.7 + smooth * 0.3
      }

      // Spring interpolation — softer springs for non-alive (more liquid)
      const orbStiff = useOrbits ? 12 : 6
      const orbDamp = useOrbits ? 6 : 4.5
      ;[state.x, state.vx] = springStep(state.x, state.vx, targetX, orbStiff, orbDamp, dt)
      ;[state.y, state.vy] = springStep(state.y, state.vy, targetY, orbStiff, orbDamp, dt)
      ;[state.rot, state.vrot] = springStep(state.rot, state.vrot, targetRot, orbStiff, orbDamp, dt)

      const hoverStiff = 5
      const hoverDamp = 4
      ;[state.spreadX, state.spreadXVel] = springStep(state.spreadX, state.spreadXVel, targetSpreadX, hoverStiff, hoverDamp, dt)
      ;[state.liftY, state.liftYVel] = springStep(state.liftY, state.liftYVel, targetLiftY, hoverStiff, hoverDamp, dt)
      ;[state.blur, state.blurVel] = springStep(state.blur, state.blurVel, targetBlur, hoverStiff, hoverDamp, dt)
      ;[state.brightness, state.brightnessVel] = springStep(state.brightness, state.brightnessVel, targetBrightness, hoverStiff, hoverDamp, dt)
      ;[state.scale, state.scaleVel] = springStep(state.scale, state.scaleVel, targetScale, hoverStiff, hoverDamp, dt)
      ;[state.opacity, state.opacityVel] = springStep(state.opacity, state.opacityVel, targetOpacity, hoverStiff, hoverDamp, dt)

      // Check if settled (non-alive mode auto-shutdown)
      if (!useOrbits && !mouseInside) {
        const energy =
          Math.abs(state.vx) + Math.abs(state.vy) + Math.abs(state.vrot) +
          Math.abs(state.spreadXVel) + Math.abs(state.liftYVel) +
          Math.abs(state.blurVel) + Math.abs(state.brightnessVel) +
          Math.abs(state.scaleVel) + Math.abs(state.opacityVel) +
          Math.abs(state.x) + Math.abs(state.y) + Math.abs(state.rot) +
          Math.abs(state.spreadX) + Math.abs(state.liftY) +
          Math.abs(state.blur - 0.6) + Math.abs(state.brightness - 0.88) +
          Math.abs(state.scale - 1) + Math.abs(state.opacity - 0.85)
        if (energy > SETTLE_THRESHOLD) allSettled = false
      } else {
        allSettled = false
      }

      // Apply to DOM
      const tx = state.x + state.spreadX
      const ty = state.y + state.liftY

      charEl.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) rotate(${state.rot.toFixed(3)}deg) scale(${state.scale.toFixed(4)})`
      charEl.style.filter = `blur(${Math.max(0, state.blur).toFixed(2)}px) brightness(${state.brightness.toFixed(3)})`
      charEl.style.opacity = state.opacity.toFixed(3)
    }

    return allSettled
  }

  // ── Alive mode: continuous rAF loop ──────────────────
  useEffect(() => {
    if (!alive) return
    if (prefersReduced.current) return

    let lastTime = performance.now()
    const turbNode = document.getElementById(`${svgFilterId.current}-turb`)
    const dispNode = document.getElementById(`${svgFilterId.current}-disp`)

    function tick(now) {
      animFrameRef.current = requestAnimationFrame(tick)

      const dtRaw = (now - lastTime) / 1000
      lastTime = now
      const dt = Math.min(dtRaw, 0.05)

      if (!containerRef.current || !charStates.current) return

      const chars = containerRef.current.querySelectorAll('[data-wind]')
      if (chars.length !== charStates.current.length) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const mx = mouseLocal.current.x
      const my = mouseLocal.current.y
      const mouseInside = mouseLocal.current.inside
      const time = now / 1000

      // ── SVG turbulence ──
      const fs = filterState.current
      const targetFreq = 0.012 + Math.sin(time * 0.3) * 0.004

      // Modulate displacement based on shared kanji rhythm
      let baseDisp = 6
      if (rhythmRef?.current) {
        const elapsed = (now - rhythmRef.current.origin) / 1000
        const ct = ((elapsed % 33) + 33) % 33
        if (ct < 8) baseDisp = 5            // drawing phase — calmer
        else if (ct >= 20 && ct < 28) baseDisp = 8  // evaporation — sympathetic turbulence
      }
      const targetDisp = mouseInside ? 2 : baseDisp
      ;[fs.baseFreq, fs.baseFreqVel] = springStep(fs.baseFreq, fs.baseFreqVel, targetFreq, 2, 3, dt)
      ;[fs.displacement, fs.displacementVel] = springStep(fs.displacement, fs.displacementVel, targetDisp, 4, 5, dt)

      fs.seedTimer += dt
      if (fs.seedTimer > 3) {
        fs.seedTimer = 0
        fs.seed = (fs.seed % 100) + 1
      }

      if (turbNode) {
        turbNode.setAttribute('baseFrequency', `${fs.baseFreq} ${fs.baseFreq * 1.3}`)
        turbNode.setAttribute('seed', String(fs.seed))
      }
      if (dispNode) {
        dispNode.setAttribute('scale', String(fs.displacement))
      }

      // ── Per-character update ──
      updateCharsRef.current(chars, containerRect, mx, my, mouseInside, 160, time, dt, true)
    }

    animFrameRef.current = requestAnimationFrame(tick)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [alive, text.length])

  // ── Non-alive hover rAF loop ─────────────────────────
  // Starts on mouseenter, runs until springs settle after leave
  const startHoverLoop = useCallback(() => {
    if (alive || hoverLoopRunning.current || prefersReduced.current) return
    hoverLoopRunning.current = true

    let lastTime = performance.now()

    function hoverTick(now) {
      const dtRaw = (now - lastTime) / 1000
      lastTime = now
      const dt = Math.min(dtRaw, 0.05)

      if (!containerRef.current || !charStates.current) {
        hoverLoopRunning.current = false
        animFrameRef.current = null
        return
      }

      const chars = containerRef.current.querySelectorAll('[data-wind]')
      if (chars.length !== charStates.current.length) {
        hoverLoopRunning.current = false
        animFrameRef.current = null
        return
      }

      const containerRect = containerRef.current.getBoundingClientRect()
      const mx = mouseLocal.current.x
      const my = mouseLocal.current.y
      const mouseInside = mouseLocal.current.inside

      const settled = updateCharsRef.current(chars, containerRect, mx, my, mouseInside, 160, 0, dt, false)

      if (settled) {
        hoverLoopRunning.current = false
        animFrameRef.current = null
        return
      }

      animFrameRef.current = requestAnimationFrame(hoverTick)
    }

    animFrameRef.current = requestAnimationFrame(hoverTick)
  }, [alive])

  // ── Mouse handlers ───────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    if (prefersReduced.current || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (lastMouseX.current !== null) {
      const raw = x - lastMouseX.current
      mouseVelocity.current += (raw - mouseVelocity.current) * 0.3
    }
    lastMouseX.current = x
    mouseLocal.current = { x, y, inside: true }

    // Kick off hover loop for non-alive mode
    if (!alive) startHoverLoop()
  }, [alive, startHoverLoop])

  const handleMouseLeave = useCallback(() => {
    lastMouseX.current = null
    mouseVelocity.current = 0
    mouseLocal.current = { x: -9999, y: -9999, inside: false }
    // Non-alive rAF loop will self-terminate once springs settle
  }, [])

  // Cleanup non-alive rAF on unmount
  useEffect(() => {
    if (alive) return
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [alive])

  return (
    <>
      {alive && (
        <svg
          width="0"
          height="0"
          style={{ position: 'absolute', pointerEvents: 'none' }}
          aria-hidden="true"
        >
          <defs>
            <filter id={svgFilterId.current} x="-30%" y="-30%" width="160%" height="160%">
              <feTurbulence
                id={`${svgFilterId.current}-turb`}
                type="fractalNoise"
                baseFrequency="0.015 0.0195"
                numOctaves="3"
                seed="1"
                result="noise"
              />
              <feDisplacementMap
                id={`${svgFilterId.current}-disp`}
                in="SourceGraphic"
                in2="noise"
                scale="6"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}
      <Tag
        ref={containerRef}
        className={className}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          overflow: 'visible',
          lineHeight: 1.35,
          filter: alive ? `url(#${svgFilterId.current})` : undefined,
        }}
      >
        {text.split('').map((char, i) => (
          <span
            key={i}
            data-wind
            style={{
              display: 'inline-block',
              willChange: 'transform, filter, opacity',
              verticalAlign: 'baseline',
              opacity: 0.85,
              filter: 'blur(0.6px) brightness(0.88)',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </Tag>
    </>
  )
}
