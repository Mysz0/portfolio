import { useRef, useMemo, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

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
  uniform vec2 uRes;
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

    // ── 3 octaves — same structure as before ──
    float n1 = snoise(vec3(uv * 1.2, t));
    float n2 = snoise(vec3(uv * 2.4 + 7.0, t * 0.8));
    float n3 = snoise(vec3(uv * 5.0 + 15.0, t * 0.5));
    float noise = (n1 * 0.55 + n2 * 0.3 + n3 * 0.15) * 0.5 + 0.5;

    // ── Section zones (gaussian blobs along scroll) ──
    float zAbout    = exp(-pow((s - 0.20) * 5.0, 2.0));
    float zProjects = exp(-pow((s - 0.40) * 5.0, 2.0));
    float zSetup    = exp(-pow((s - 0.60) * 5.0, 2.0));
    float zContact  = exp(-pow((s - 0.88) * 5.0, 2.0));

    // Contrast: 0 = flat, 1 = more tonal separation
    float contrast = 0.0;
    contrast += zAbout    * 0.4;
    contrast += zProjects * 0.7;
    contrast += zSetup    * 0.3;
    contrast += zContact  * 0.2;
    contrast = clamp(contrast, 0.0, 1.0);

    // Accent intensity (subtle ink bleed)
    float accentStr = zProjects * 0.2 + zContact * 0.12;

    // ── Grayscale concrete palette ──
    vec3 coolGray  = vec3(0.082, 0.082, 0.080);
    vec3 warmGray  = vec3(0.090, 0.088, 0.084);
    vec3 lightCool = vec3(0.14, 0.14, 0.135);
    vec3 lightWarm = vec3(0.19, 0.185, 0.18);

    vec3 dark  = mix(coolGray,  warmGray,  contrast);
    vec3 light = mix(lightCool, lightWarm, contrast);

    vec3 base = mix(dark, light, noise);

    // ── Accent bleed — subtle ink ──
    base += uAccent * accentStr * noise * noise;

    // ── Scroll-following band ──
    float band = exp(-pow((uv.y - s) * 2.5, 2.0));
    base += vec3(0.025, 0.025, 0.024) * band * (0.4 + contrast * 0.6);

    // ── Slow horizontal drift ──
    float drift = snoise(vec3(uv.x * 2.0 + s * 2.0, uv.y * 1.0, t * 0.5)) * 0.5 + 0.5;
    base += vec3(0.018, 0.018, 0.017) * drift * (0.3 + contrast * 0.7);

    // ── Moon in the night haze ──
    // Screen-space so it stays round; sinks only slightly over the page
    vec2 suv = gl_FragCoord.xy / uRes;
    float aspect = uRes.x / uRes.y;
    vec2 sp = vec2(suv.x * aspect, suv.y);
    vec2 mc = vec2(aspect * 0.8, 0.78 - s * 0.16);
    vec2 md2 = sp - mc;
    float md = length(md2);
    float R = 0.068;
    float aa = 1.5 / uRes.y * uDpr;
    float disc = smoothstep(R + aa, R - aa, md);

    // Surface: faint maria + limb darkening
    float maria = snoise(vec3(md2 * 16.0, 1.7)) * 0.5 + 0.5;
    float fine = snoise(vec3(md2 * 42.0, 4.2)) * 0.5 + 0.5;
    float limb = sqrt(max(0.0, 1.0 - (md / R) * (md / R)));
    vec3 moonCol = vec3(0.92, 0.89, 0.82);
    vec3 surface = moonCol * (0.72 + 0.28 * limb) * (0.80 + 0.14 * (1.0 - maria) + 0.06 * fine);

    // Cloud layer drifting across the sky
    vec2 cp = vec2(sp.x * 1.4 - uTime * 0.012, sp.y * 3.2);
    float cn = snoise(vec3(cp, t * 0.6)) * 0.55
             + snoise(vec3(cp * 2.1 + 3.0, t)) * 0.3
             + snoise(vec3(cp * 4.6 + 9.0, t * 1.4)) * 0.15;
    float cloud = smoothstep(0.05, 0.6, cn);

    // Moonlight: tight bloom + wide atmospheric halo
    float bloom = exp(-md * md * 160.0);
    float halo = exp(-md * md * 14.0);

    // Clouds hide the disc but catch its light at their edges
    float moonVis = disc * (1.0 - cloud * 0.85);
    base = mix(base, surface, moonVis * 0.62);
    base += moonCol * (bloom * 0.07 + halo * 0.05) * (1.0 - cloud * 0.4);
    base += moonCol * cloud * exp(-md * md * 5.0) * 0.07;
    base += vec3(0.010, 0.010, 0.009) * cloud;

    // ── Gentle vignette ──
    float vig = 1.0 - length((uv - 0.5) * 1.3);
    vig = smoothstep(-0.1, 0.65, vig);
    base *= mix(0.6, 1.0, vig);

    // ── iOS Safari chrome blending ──
    if (uIsIOS > 0.5) {
      vec3 chromeColor = vec3(0.07843, 0.07843, 0.07451);
      float cssY = gl_FragCoord.y / uDpr;
      float fromBottom = cssY;
      float fromTop = uViewportH - cssY;
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
    uRes: { value: new THREE.Vector2(1, 1) },
    uIsIOS: { value: isIOS ? 1.0 : 0.0 },
    uViewportH: { value: window.innerHeight },
    uDpr: { value: Math.min(Math.max(window.devicePixelRatio, 1), 1.5) },
  }), [isIOS])

  useEffect(() => {
    if (!isIOS) return
    const update = () => {
      if (!meshRef.current) return
      meshRef.current.material.uniforms.uViewportH.value = window.innerHeight
    }
    window.addEventListener('resize', update, { passive: true })
    window.addEventListener('orientationchange', update, { passive: true })
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
    u.uRes.value.set(state.size.width * state.gl.getPixelRatio(), state.size.height * state.gl.getPixelRatio())
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

/* Haze moves slowly — 30fps is indistinguishable and halves GPU time */
function Throttle({ fps = 30 }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    let id
    let last = 0
    const loop = (now) => {
      id = requestAnimationFrame(loop)
      if (now - last < 1000 / fps - 2) return
      last = now
      invalidate()
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [invalidate, fps])
  return null
}

export default function ShaderBackground() {

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: false, antialias: false, powerPreference: 'high-performance' }}
        dpr={1}
        frameloop="demand"
      >
        <Suspense fallback={null}>
          <Scene />
          <Throttle />
        </Suspense>
      </Canvas>
    </div>
  )
}
