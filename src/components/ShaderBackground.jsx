import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
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
  uniform vec2 uMouse;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uScroll;
  varying vec2 vUv;

  vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
  vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
  vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}

  float snoise(vec3 v){
    const vec2 C=vec2(1./6.,1./3.);
    const vec4 D=vec4(0.,.5,1.,2.);
    vec3 i=floor(v+dot(v,C.yyy));
    vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);
    vec3 l=1.-g;
    vec3 i1=min(g.xyz,l.zxy);
    vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;
    vec3 x2=x0-i2+C.yyy;
    vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(
      i.z+vec4(0.,i1.z,i2.z,1.))
      +i.y+vec4(0.,i1.y,i2.y,1.))
      +i.x+vec4(0.,i1.x,i2.x,1.));
    float n_=.142857142857;
    vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z);
    vec4 y_=floor(j-7.*x_);
    vec4 x=x_*ns.x+ns.yyyy;
    vec4 y=y_*ns.x+ns.yyyy;
    vec4 h=1.-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);
    vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.+1.;
    vec4 s1=floor(b1)*2.+1.;
    vec4 sh=-step(h,vec4(0.));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
    vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);
    vec3 p1=vec3(a0.zw,h.y);
    vec3 p2=vec3(a1.xy,h.z);
    vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
    m=m*m;
    return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }

  void main(){
    vec2 uv=vUv;
    vec2 mouseInf=(uMouse-.5)*.12;
    uv+=mouseInf*.3;
    float t=uTime*.12;
    float sc=uScroll*.4;

    float n1=snoise(vec3(uv*1.8,t+sc))*.5+.5;
    float n2=snoise(vec3(uv*2.8+1.,t*.6+sc))*.5+.5;
    float n3=snoise(vec3(uv*4.+2.,t*1.4))*.5+.5;

    vec3 col=mix(uColor1,uColor2,n1);
    col=mix(col,uColor3,n2*.5);
    col+=pow(n3,4.)*.2;

    float vig=1.-length((vUv-.5)*1.4);
    vig=smoothstep(0.,.7,vig);

    gl_FragColor=vec4(col,vig*.3);
  }
`

function ShaderPlane({ isDark }) {
  const meshRef = useRef()
  const mouse = useRef({ x: 0.5, y: 0.5 })
  const scroll = useRef(0)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uColor1: { value: new THREE.Color('#1a0a2e') },
    uColor2: { value: new THREE.Color('#2d1b4e') },
    uColor3: { value: new THREE.Color('#4a1a6b') },
    uScroll: { value: 0 },
  }), [])

  useEffect(() => {
    const u = meshRef.current?.material?.uniforms
    if (!u) return
    u.uColor1.value.set(isDark ? '#1a0a2e' : '#f0e6ff')
    u.uColor2.value.set(isDark ? '#2d1b4e' : '#e8d5f5')
    u.uColor3.value.set(isDark ? '#4a1a6b' : '#d4b8e8')
  }, [isDark])

  useEffect(() => {
    const onMouse = (e) => {
      mouse.current.x = e.clientX / window.innerWidth
      mouse.current.y = 1.0 - e.clientY / window.innerHeight
    }
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      scroll.current = h > 0 ? window.scrollY / h : 0
    }
    window.addEventListener('mousemove', onMouse, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useFrame((state) => {
    const u = meshRef.current?.material?.uniforms
    if (!u) return
    u.uTime.value = state.clock.elapsedTime
    u.uMouse.value.lerp(new THREE.Vector2(mouse.current.x, mouse.current.y), 0.04)
    u.uScroll.value += (scroll.current - u.uScroll.value) * 0.05
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

export default function ShaderBackground({ isDark }) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 45 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <ShaderPlane isDark={isDark} />
      </Canvas>
    </div>
  )
}
