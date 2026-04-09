import { useRef, useMemo, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

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

    // ── 3 octaves — visible ink-cloud texture ──
    float n1 = snoise(vec3(uv * 1.8, t));
    float n2 = snoise(vec3(uv * 3.5 + 7.0, t * 0.8));
    float n3 = snoise(vec3(uv * 7.0 + 15.0, t * 0.5));
    float noise = (n1 * 0.55 + n2 * 0.3 + n3 * 0.15) * 0.5 + 0.5;

    // ── Section zones (gaussian blobs along scroll) ──
    //    Hero ~0.0  |  About ~0.2  |  Projects ~0.4  |  Setup ~0.6  |  Keyboards ~0.72  |  Contact ~0.88
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

    // ── Base: cool dark ↔ warm dark, with VISIBLE noise variation ──
    vec3 coolDark  = vec3(0.035, 0.038, 0.05);   // blue-ish dark slate
    vec3 warmDark  = vec3(0.07,  0.055, 0.04);    // earthy dark
    vec3 coolLight = vec3(0.08,  0.085, 0.11);    // lighter cool (noise peaks)
    vec3 warmLight = vec3(0.14,  0.11,  0.08);    // lighter warm (noise peaks)

    vec3 dark  = mix(coolDark,  warmDark,  warmth);
    vec3 light = mix(coolLight, warmLight, warmth);

    // Noise blends between dark and light — this creates VISIBLE texture
    vec3 base = mix(dark, light, noise);

    // ── Accent glow — red ink bleeding through the surface ──
    // Modulated by noise so it feels organic, not a flat overlay
    base += uAccent * accentStr * noise * noise;

    // ── Scroll-following warm band — a soft lantern glow that tracks position ──
    float band = exp(-pow((uv.y - s) * 2.5, 2.0));
    base += mix(vec3(0.02, 0.015, 0.01), vec3(0.04, 0.02, 0.01), warmth) * band;

    // ── Slow horizontal drift tied to scroll (sand-shifting feel) ──
    float drift = snoise(vec3(uv.x * 3.0 + s * 2.0, uv.y * 1.5, t * 0.5)) * 0.5 + 0.5;
    base += vec3(0.012, 0.010, 0.008) * drift * (0.3 + warmth * 0.7);

    // ── Gentle vignette ──
    float vig = 1.0 - length((uv - 0.5) * 1.3);
    vig = smoothstep(-0.1, 0.65, vig);
    base *= mix(0.6, 1.0, vig);

    gl_FragColor = vec4(base, 1.0);
  }
`

function Scene() {
  const meshRef = useRef()
  const scrollRef = useRef(0)

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
  }), [])

  const frameSkip = useRef(0)

  useFrame((state) => {
    if (!meshRef.current) return
    // Throttle to ~30fps — shader doesn't need 60fps updates
    if (++frameSkip.current % 2 !== 0) return
    const u = meshRef.current.material.uniforms
    u.uTime.value = state.clock.elapsedTime
    u.uScroll.value = scrollRef.current
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
