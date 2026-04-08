import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
  varying float vOpacity;
  varying float vColorMix;
  uniform float uTime;
  uniform float uScroll;

  attribute vec3 aOffset;
  attribute float aSpeed;
  attribute float aSize;
  attribute float aRandom;
  attribute float aColorMix;

  void main() {
    vec3 pos = aOffset;

    // Slow vertical drift
    float fallRange = 140.0;
    float fallTime = mod(uTime * aSpeed * 0.08 + aRandom * fallRange, fallRange);
    pos.y = 70.0 - fallTime;

    // Gentle sway
    pos.x += sin(uTime * 0.04 + aRandom * 40.0) * 3.5;
    pos.z += cos(uTime * 0.025 + aRandom * 30.0) * 2.0;

    // Scroll parallax — depth-based
    float depth = (aOffset.z + 30.0) / 60.0; // 0=far, 1=near
    pos.y += uScroll * mix(5.0, 18.0, depth);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    mvPosition.xyz += position * aSize;
    gl_Position = projectionMatrix * mvPosition;

    // Visible lifecycle fade
    float lifecycle = smoothstep(0.0, 20.0, fallTime) * (1.0 - smoothstep(fallRange - 20.0, fallRange, fallTime));
    float depthBrightness = mix(0.15, 0.4, depth);
    vOpacity = lifecycle * depthBrightness;
    vColorMix = aColorMix;
  }
`

const fragmentShader = `
  varying float vOpacity;
  varying float vColorMix;
  uniform vec3 uWarmColor;
  uniform vec3 uAccentColor;

  void main() {
    vec3 color = mix(uAccentColor, uWarmColor, vColorMix);
    gl_FragColor = vec4(color, vOpacity);
  }
`

export default function PixelParticles({ count = 600, scrollRef }) {
  const meshRef = useRef()

  const [offsets, speeds, sizes, randoms, colorMixes] = useMemo(() => {
    const off = new Float32Array(count * 3)
    const spd = new Float32Array(count)
    const sz = new Float32Array(count)
    const rnd = new Float32Array(count)
    const col = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      off[i * 3]     = (Math.random() - 0.5) * 140
      off[i * 3 + 1] = (Math.random() - 0.5) * 100
      off[i * 3 + 2] = (Math.random() - 0.5) * 60
      spd[i] = 0.15 + Math.random() * 0.35
      sz[i]  = 0.06 + Math.random() * 0.2
      rnd[i] = Math.random()
      col[i] = Math.random() > 0.25 ? 1.0 : 0.0  // 75% warm cream, 25% accent
    }
    return [off, spd, sz, rnd, col]
  }, [count])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uWarmColor: { value: new THREE.Color('#D4C9B8') },
    uAccentColor: { value: new THREE.Color('#B7372E') },
  }), [])

  useFrame((state) => {
    if (!meshRef.current) return
    const u = meshRef.current.material.uniforms
    u.uTime.value = state.clock.elapsedTime
    u.uScroll.value = scrollRef?.current ?? 0
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[0.5, 3, 3]}>
        <instancedBufferAttribute attach="attributes-aOffset" args={[offsets, 3]} />
        <instancedBufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
        <instancedBufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <instancedBufferAttribute attach="attributes-aRandom" args={[randoms, 1]} />
        <instancedBufferAttribute attach="attributes-aColorMix" args={[colorMixes, 1]} />
      </sphereGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  )
}
