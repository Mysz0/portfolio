import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { printArt } from './cdArt'

/* ── CD picker ─────────────────────────────────────────────
   Jewel cases at real size (142 × 125 × 10.4 mm, one unit per
   cm) in a row on a shadowed floor, the chosen one in front with
   its lid open and the disc lifted straight out, centred on the
   case. Drag, scroll sideways, click a case or use the arrows. */

const W = 14.2
const H = 12.5
const D = 1.04
const TRAY = 0.62
const LID = 0.3
const BOOKLET = 12
const DISC_R = 6
// The booklet sits right of centre: the hinge takes the left edge
const ART_X = W / 2 - 0.12 - BOOKLET / 2

// Layout of the row
const CENTER_GAP = 12.5 // from the chosen case to its first neighbour
const SPACING = 3.2 // between the angled ones
const SIDE_ANGLE = 1.08 // ~62°
const SIDE_DEPTH = -5
const FRONT = 2.5
const FACE = -0.26 // the chosen one turns a touch, so the open booklet reads
const LID_OPEN = -1.3

const damp = (cur, target, rate, dt) => cur + (target - cur) * (1 - Math.exp(-rate * dt))

function Case({ i, tex, mats, shared, onPick }) {
  const group = useRef()
  const lid = useRef()
  const disc = useRef()
  const mo = useRef({ open: 0, lift: 0, spin: 0, hover: 0, x: 0, z: 0, ry: 0 })

  const m = useMemo(() => ({
    cover: new THREE.MeshStandardMaterial({ map: tex.cover, roughness: 0.55 }),
    booklet: new THREE.MeshStandardMaterial({ map: tex.booklet, roughness: 0.75 }),
    spine: new THREE.MeshStandardMaterial({ map: tex.spine, roughness: 0.5 }),
    print: new THREE.MeshPhysicalMaterial({
      map: tex.disc, transparent: true, roughness: 0.32, metalness: 0.2,
      clearcoat: 1, clearcoatRoughness: 0.12,
    }),
  }), [tex])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const s = shared.current
    const o = mo.current
    const d = i - s.pos
    const ad = Math.abs(d)
    const side = Math.sign(d)
    const near = Math.min(ad, 1)

    // Where it stands in the row
    const x = ad < 1 ? d * CENTER_GAP : side * (CENTER_GAP + (ad - 1) * SPACING)
    const z = THREE.MathUtils.lerp(FRONT, SIDE_DEPTH, near)
    const ry = THREE.MathUtils.lerp(FACE, -side * SIDE_ANGLE, near)
    o.hover = damp(o.hover, s.hover === i && ad > 0.5 ? 1 : 0, 16, dt)
    group.current.position.set(x, H / 2 + 0.02 + o.hover * 0.7, z)
    group.current.rotation.set(0, ry, 0)

    // The chosen one opens once it has arrived; anything else closes at once
    const settled = Math.round(s.pos) === i && ad < 0.08
    o.open = damp(o.open, settled ? 1 : 0, settled ? 9 : 16, dt)
    o.lift = damp(o.lift, settled && o.open > 0.55 ? 1 : 0, settled ? 8 : 18, dt)
    lid.current.rotation.y = o.open * LID_OPEN
    disc.current.position.z = -D / 2 + TRAY + 0.03 + o.lift * 2.2
    o.spin = damp(o.spin, o.lift > 0.9 ? 1.1 : 0, 2.2, dt)
    disc.current.rotation.z -= o.spin * dt
  })

  return (
    <group
      ref={group}
      onPointerOver={(e) => { e.stopPropagation(); shared.current.hover = i; document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { if (shared.current.hover === i) shared.current.hover = -1; document.body.style.cursor = '' }}
      onClick={(e) => { e.stopPropagation(); if (!shared.current.dragged) onPick(i) }}
    >
      {/* Tray: black, rounded edges */}
      <RoundedBox args={[W, H, TRAY]} radius={0.12} smoothness={3} position={[0, 0, -D / 2 + TRAY / 2]} material={mats.tray} />
      {/* Back insert with the track list, seen through nothing: it's the back */}
      <mesh material={m.booklet} position={[0, 0, -D / 2 - 0.004]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W - 0.4, H - 0.4]} />
      </mesh>
      {/* Spine label, on the hinge side */}
      <mesh material={m.spine} position={[-W / 2 - 0.004, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[D - 0.08, H - 0.2]} />
      </mesh>
      {/* Spindle rosette: a hub and the teeth that grip the disc */}
      <group position={[0, 0, -D / 2 + TRAY]}>
        <mesh material={mats.tray} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.015]}>
          <cylinderGeometry args={[1.5, 1.6, 0.03, 48]} />
        </mesh>
        {Array.from({ length: 12 }, (_, k) => {
          const a = (k / 12) * Math.PI * 2
          return (
            <mesh key={k} material={mats.teeth} position={[Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0.05]} rotation={[0, 0, a]}>
              <boxGeometry args={[0.22, 0.16, 0.1]} />
            </mesh>
          )
        })}
      </group>
      {/* Disc: printed face, silver data side, a real edge */}
      <group ref={disc}>
        <mesh material={m.print} position={[0, 0, 0.041]}>
          <ringGeometry args={[0.75, DISC_R, 128, 1]} />
        </mesh>
        <mesh material={mats.dataSide} rotation={[0, Math.PI, 0]} position={[0, 0, -0.001]}>
          <ringGeometry args={[0.75, DISC_R, 128, 1]} />
        </mesh>
        <mesh material={mats.discEdge} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.02]}>
          <cylinderGeometry args={[DISC_R, DISC_R, 0.04, 128, 1, true]} />
        </mesh>
      </group>
      {/* Lid, hinged on the left edge */}
      <group ref={lid} position={[-W / 2, 0, D / 2]}>
        <mesh material={m.cover} position={[W / 2 + ART_X, 0, -LID - 0.01]}>
          <planeGeometry args={[BOOKLET, BOOKLET]} />
        </mesh>
        {/* Inside of the booklet: the art again, so the open case shows it beside the disc */}
        <mesh material={m.cover} position={[W / 2 + ART_X, 0, -LID - 0.02]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[BOOKLET, BOOKLET]} />
        </mesh>
        {/* Booklet clips on the right edge */}
        {[-1, 1].map((sy) => (
          <mesh key={sy} material={mats.clip} position={[W - 0.35, sy * 3.2, -LID - 0.04]}>
            <boxGeometry args={[0.5, 1.6, 0.08]} />
          </mesh>
        ))}
        {/* Clear lid with ribbed hinge strip and pins */}
        <RoundedBox args={[W, H, LID]} radius={0.08} smoothness={2} position={[W / 2, 0, -LID / 2]} material={mats.clear} />
        <mesh material={mats.hinge} position={[1.0, 0, -LID / 2]}>
          <boxGeometry args={[1.6, H - 0.1, LID + 0.012]} />
        </mesh>
        {[-1, 1].map((sy) => (
          <mesh key={sy} material={mats.pin} position={[0.12, sy * (H / 2 - 0.9), -LID / 2 - 0.05]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 1.2, 16]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// Frames the open case and its neighbours
function Rig() {
  const { camera, size } = useThree()
  useEffect(() => {
    const aspect = size.width / size.height
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    // Phones show the open case and a glimpse either side
    const halfWidth = aspect < 1.8 ? 15 : 24
    const dist = Math.max(9.5 / t, halfWidth / (t * aspect)) + 2
    camera.position.set(0, 3 + dist * 0.13, dist)
    camera.lookAt(-1.2, H / 2 - 0.4, 0)
    camera.updateProjectionMatrix()
  }, [camera, size])
  return null
}

function Lighting() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.5
    return () => { scene.environment = null; env.dispose(); pmrem.dispose() }
  }, [gl, scene])
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[8, 22, 26]} intensity={2.4} />
      <directionalLight position={[-24, 10, 4]} intensity={0.7} color="#ffd9b0" />
    </>
  )
}

// Builds every shader once the cases exist, long before they scroll into
// view, so the first frame on screen doesn't stall and pop them in
function Warmup({ ready }) {
  const { gl, scene, camera, invalidate } = useThree()
  useEffect(() => {
    if (!ready) return
    let alive = true
    gl.compileAsync(scene, camera).then(() => alive && invalidate())
    return () => { alive = false }
  }, [ready, gl, scene, camera, invalidate])
  return null
}

// Animates the row, renders while visible
function Driver({ visibleRef, shared }) {
  const invalidate = useThree((st) => st.invalidate)
  useFrame((_, delta) => {
    const s = shared.current
    // A wheel flick glides towards where it's heading; otherwise ease to the pick
    const goal = s.wheel != null ? s.wheel : s.active
    if (!s.dragging) s.pos = damp(s.pos, goal, s.reduce ? 40 : s.wheel != null ? 18 : 11, Math.min(delta, 0.05))
  })
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

export default function CdFlow({ projects, active, onPick }) {
  const wrap = useRef(null)
  const visibleRef = useRef(false)
  const shared = useRef({ active, pos: active, wheel: null, hover: -1, dragging: false, dragged: false, reduce: false })
  const [art, setArt] = useState(null)
  shared.current.active = active

  useEffect(() => {
    shared.current.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let alive = true
    printArt(projects).then((a) => alive && setArt(a))
    // Starts a little early so the chosen case is already open when it comes into view
    const io = new IntersectionObserver(([e]) => { visibleRef.current = e.isIntersecting }, { rootMargin: '40% 0px' })
    io.observe(wrap.current)
    return () => { alive = false; io.disconnect(); document.body.style.cursor = '' }
  }, [projects])

  // Drag or scroll sideways to flip through; lands on the nearest case
  useEffect(() => {
    const el = wrap.current
    const s = shared.current
    const last = projects.length - 1
    const clamp = (v) => Math.max(-0.4, Math.min(last + 0.4, v))
    let start = null
    const down = (e) => { start = { x: e.clientX, pos: s.pos }; s.dragged = false }
    const move = (e) => {
      if (!start) return
      const dx = e.clientX - start.x
      if (Math.abs(dx) > 6) { s.dragging = true; s.dragged = true }
      if (s.dragging) s.pos = clamp(start.pos - dx / 110)
    }
    const up = () => {
      if (s.dragging) onPick(Math.max(0, Math.min(last, Math.round(s.pos))))
      s.dragging = false
      start = null
    }
    // The wheel picks as it goes and stops hard at the ends, so the last
    // case opens as soon as it's reached, not when the momentum dies out
    let wheelTimer
    const wheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return // let the page scroll
      e.preventDefault()
      if (s.dragging) return
      s.wheel = Math.max(0, Math.min(last, (s.wheel ?? s.pos) + e.deltaX / 160))
      onPick(Math.round(s.wheel))
      clearTimeout(wheelTimer)
      wheelTimer = setTimeout(() => { s.wheel = null }, 120)
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    el.addEventListener('wheel', wheel, { passive: false })
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      el.removeEventListener('wheel', wheel)
      clearTimeout(wheelTimer)
    }
  }, [projects.length, onPick])

  const mats = useMemo(() => ({
    tray: new THREE.MeshPhysicalMaterial({ color: '#0c0c0c', roughness: 0.28, clearcoat: 0.9, clearcoatRoughness: 0.15 }),
    teeth: new THREE.MeshPhysicalMaterial({ color: '#141414', roughness: 0.35 }),
    clear: new THREE.MeshPhysicalMaterial({
      color: '#ffffff', transparent: true, opacity: 0.12, roughness: 0.03, metalness: 0,
      clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6, depthWrite: false,
    }),
    hinge: new THREE.MeshPhysicalMaterial({ color: '#202020', transparent: true, opacity: 0.55, roughness: 0.2, depthWrite: false }),
    pin: new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.3 }),
    clip: new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.25, roughness: 0.1, depthWrite: false }),
    dataSide: new THREE.MeshPhysicalMaterial({
      color: '#d9dde2', metalness: 1, roughness: 0.12, iridescence: 1, iridescenceIOR: 1.8,
      iridescenceThicknessRange: [200, 800],
    }),
    discEdge: new THREE.MeshStandardMaterial({ color: '#b9bdc2', metalness: 0.9, roughness: 0.25, side: THREE.DoubleSide }),
  }), [])

  return (
    <div
      ref={wrap}
      className="absolute inset-0 touch-pan-y select-none"
      style={{
        // Fade the row and the floor into the page at the edges
        maskImage: 'linear-gradient(to right, transparent, #000 9%, #000 91%, transparent), linear-gradient(to bottom, #000 72%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, #000 9%, #000 91%, transparent), linear-gradient(to bottom, #000 72%, transparent)',
        maskComposite: 'intersect',
        WebkitMaskComposite: 'source-in',
      }}
    >
      <Canvas dpr={[1, 2]} frameloop="demand" gl={{ alpha: true, antialias: true }} camera={{ fov: 28, near: 1, far: 300 }}>
        <Rig />
        <Lighting />
        <Driver visibleRef={visibleRef} shared={shared} />
        <Warmup ready={!!art} />
        {art && projects.map((p, i) => (
          <Case key={p.id} i={i} tex={art[i]} mats={mats} shared={shared} onPick={onPick} />
        ))}
        <ContactShadows position={[0, -0.01, 0]} scale={90} blur={2.4} far={14} opacity={0.6} resolution={1024} />
      </Canvas>
    </div>
  )
}
