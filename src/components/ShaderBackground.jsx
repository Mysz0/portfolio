import { useRef, useMemo, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ── iOS detection ─────────────────────────────────────── */
const getIsIOS = () => {
  if (typeof navigator === 'undefined') return false
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform float uScroll;
  uniform vec3 uAccent;
  uniform float uIsIOS;
  uniform float uViewportH;
  uniform float uDpr;
  varying vec2 vUv;

  vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.018;
    float s = uScroll;

    // ── 3 octaves — larger scale for visible ink-cloud texture ──
    float n1 = snoise(vec3(uv * 1.2, t));
    float n2 = snoise(vec3(uv * 2.4 + 7.0, t * 0.8));
    float n3 = snoise(vec3(uv * 5.0 + 15.0, t * 0.5));
    float noise = (n1 * 0.55 + n2 * 0.3 + n3 * 0.15) * 0.5 + 0.5;

    // ── Section zones (gaussian blobs along scroll) ──
    float zAbout    = exp(-pow((s - 0.20) * 5.0, 2.0));
    float zProjects = exp(-pow((s - 0.40) * 5.0, 2.0));
    float zSetup    = exp(-pow((s - 0.60) * 5.0, 2.0));
    float zContact  = exp(-pow((s - 0.88) * 5.0, 2.0));

    // Temperature: 0 = cool slate, 1 = warm earth
    float warmth = 0.0;
    warmth += zAbout    * 0.5;
    warmth += zProjects * 0.8;
    warmth += zSetup    * 0.4;
    warmth += zContact  * 0.2;
    warmth = clamp(warmth, 0.0, 1.0);

    // Accent intensity (red glow strongest in Projects + Contact zones)
    float accentStr = zProjects * 0.35 + zContact * 0.2;

    // ── Base: cool dark ↔ warm dark, with visible noise variation ──
    vec3 coolDark  = vec3(0.078, 0.078, 0.075);
    vec3 warmDark  = vec3(0.085, 0.075, 0.065);
    vec3 coolLight = vec3(0.13,  0.14,  0.18);
    vec3 warmLight = vec3(0.22,  0.17,  0.13);

    vec3 dark  = mix(coolDark,  warmDark,  warmth);
    vec3 light = mix(coolLight, warmLight, warmth);

    // Noise blends between dark and light
    vec3 base = mix(dark, light, noise);

    // ── Accent glow — red ink bleeding through the surface ──
    base += uAccent * accentStr * noise * noise;

    // ── Scroll-following warm band ──
    float band = exp(-pow((uv.y - s) * 2.5, 2.0));
    base += mix(vec3(0.035, 0.025, 0.018), vec3(0.06, 0.035, 0.018), warmth) * band;

    // ── Slow horizontal drift tied to scroll ──
    float drift = snoise(vec3(uv.x * 2.0 + s * 2.0, uv.y * 1.0, t * 0.5)) * 0.5 + 0.5;
    base += vec3(0.02, 0.016, 0.012) * drift * (0.3 + warmth * 0.7);

    // ── Gentle vignette ──
    float vig = 1.0 - length((uv - 0.5) * 1.3);
    vig = smoothstep(-0.1, 0.65, vig);
    base *= mix(0.6, 1.0, vig);

    // ── iOS Safari chrome blending ──
    // Safari draws opaque chrome (status bar, toolbar) filled with
    // theme-color at screen edges. Gradually darken shader toward
    // that same color so the boundary is nearly invisible.
    // No zone math — just fade from canvas edges inward.
    if (uIsIOS > 0.5) {
      vec3 chromeColor = vec3(0.07843, 0.07843, 0.07451); // exact #141413
      float cssY = gl_FragCoord.y / uDpr;
      float fromBottom = cssY;
      float fromTop = uViewportH - cssY;

      // Large smooth fades — 120px bottom (toolbar), 80px top (status bar)
      float bottomFade = smoothstep(0.0, 120.0, fromBottom);
      float topFade = smoothstep(0.0, 80.0, fromTop);

      base = mix(chromeColor, base, bottomFade * topFade);
    }

    gl_FragColor = vec4(base, 1.0);
  }
`

function Scene() {
  const meshRef = useRef()
  const scrollRef = useRef(0)
  const isIOS = useMemo(() => getIsIOS(), [])
  const dprSynced = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      scrollRef.current = h > 0 ? window.scrollY / h : 0
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uAccent: { value: new THREE.Color('#B7372E') },
    uIsIOS: { value: isIOS ? 1.0 : 0.0 },
    uViewportH: { value: window.innerHeight },
    uDpr: { value: Math.min(Math.max(window.devicePixelRatio, 1), 1.5) },
  }), [isIOS])

  /* Keep viewport height current on resize / toolbar change */
  useEffect(() => {
    if (!isIOS) return
    const update = () => {
      if (!meshRef.current) return
      meshRef.current.material.uniforms.uViewportH.value = window.innerHeight
    }
    window.addEventListener('resize', update, { passive: true })
    window.addEventListener('orientationchange', update, { passive: true })
    /* Visual Viewport API — tracks dynamic toolbar (iOS 26+) */
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', update, { passive: true })
    }
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', update)
      }
    }
  }, [isIOS])

  useFrame((state) => {
    if (!meshRef.current) return
    const u = meshRef.current.material.uniforms
    u.uTime.value = state.clock.elapsedTime
    u.uScroll.value = scrollRef.current
    /* Sync actual DPR from renderer once (R3F may pick a different value) */
    if (!dprSynced.current) {
      u.uDpr.value = state.gl.getPixelRatio()
      dprSynced.current = true
    }
    state.camera.position.z = 5.0
    state.camera.lookAt(0, 0, 0)
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[20, 20]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

export default function ShaderBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: false, antialias: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
