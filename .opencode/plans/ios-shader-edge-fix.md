# iOS Safari Shader Edge Solid Zone

## Goal
Eliminate visible black bars at the top (status bar) and bottom (toolbar) of iOS Safari by making the shader output a perfectly flat solid color in those zones, matching `theme-color` (#141413).

## Single file to modify
`src/components/ShaderBackground.jsx`

## Changes

### 1. Add iOS detection function (before Scene component)

```jsx
/* Detect iOS Safari — needed for edge-zone blending in shader */
const getIsIOS = () => {
  if (typeof navigator === 'undefined') return false
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}
```

### 2. Add uniforms to Scene component

Add `isIOS` detection and two new uniforms:

```jsx
function Scene() {
  const meshRef = useRef()
  const scrollRef = useRef(0)
  const isIOS = useMemo(() => getIsIOS(), [])

  // ... existing scroll handler ...

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uAccent: { value: new THREE.Color('#B7372E') },
    uIsIOS: { value: isIOS ? 1.0 : 0.0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  }), [isIOS])
```

### 3. Add resize handler to keep uResolution current

Inside the existing `useEffect` or a new one:

```jsx
useEffect(() => {
  const onResize = () => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uResolution.value.set(
        window.innerWidth, window.innerHeight
      )
    }
  }
  window.addEventListener('resize', onResize, { passive: true })
  return () => window.removeEventListener('resize', onResize)
}, [])
```

### 4. Update fragment shader

Add new uniforms to the shader declaration block:

```glsl
uniform float uIsIOS;
uniform vec2 uResolution;
```

At the END of `main()`, just before `gl_FragColor`, add the iOS edge zone blending:

```glsl
    // ── iOS Safari chrome blending ──
    // On iOS, the top ~54px (status bar + notch) and bottom ~34px (home indicator)
    // are covered by Safari's opaque chrome. We output a flat solid color there
    // that matches theme-color, with a smooth 24px transition to textured content.
    if (uIsIOS > 0.5) {
      vec3 chromeColor = vec3(0.078, 0.078, 0.075); // #141413 in sRGB
      float pixelY = vUv.y * uResolution.y;
      float pixelFromBottom = pixelY;
      float pixelFromTop = uResolution.y - pixelY;

      // Top edge: status bar zone (~54px solid, 24px transition)
      float topFade = smoothstep(0.0, 24.0, pixelFromTop - 54.0);
      // Bottom edge: home indicator zone (~34px solid, 24px transition)
      float bottomFade = smoothstep(0.0, 24.0, pixelFromBottom - 34.0);

      float edgeMask = topFade * bottomFade; // 0 = solid chrome color, 1 = normal shader
      base = mix(chromeColor, base, edgeMask);
    }

    gl_FragColor = vec4(base, 1.0);
```

This replaces the current `gl_FragColor = vec4(base, 1.0);` line.

### 5. Color verification

- `#141413` = `rgb(20, 20, 19)` = `vec3(0.0784, 0.0784, 0.0745)` in normalized sRGB
- The shader uses `ShaderMaterial` which does NOT apply Three.js color management — values go directly to framebuffer as sRGB
- `coolDark = vec3(0.078, 0.078, 0.075)` already ≈ `#141413`
- The `chromeColor` should be `vec3(0.078, 0.078, 0.075)` to match exactly

### 6. Edge zone sizes

- **Top 54px**: iOS status bar is 47px on standard iPhones, up to 54px on notched/Dynamic Island models
- **Bottom 34px**: Home indicator bar on Face ID devices
- **24px transition**: Smooth blend zone so the edge isn't a hard line
- These values are conservative — the chrome covers these areas so even if slightly off, it's invisible

## What stays unchanged

- Desktop and Android: `uIsIOS = 0.0`, the `if` block is skipped entirely
- All existing shader behavior: noise, warmth, vignette, accent glow — all untouched
- No changes to index.html, index.css, App.jsx, or any other files
- No CSS overlays, no extra DOM elements
