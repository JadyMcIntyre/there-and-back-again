import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { BufferAttribute, BufferGeometry, Color, DoubleSide, ShaderMaterial } from 'three'
import gsap from 'gsap'
import type { Atlas } from '../content/spoilers'
import { terrainHeight } from './terrain'

export function discoveryFrontier(landmarks: Atlas['landmarks']) {
  return Math.max(-61, ...landmarks.filter(place => place.discovery === 'encountered').map(place => place.point[0])) + 9
}

function mistSurface(compact: boolean) {
  const columns = compact ? 62 : 91, rows = compact ? 38 : 58
  const vertices: number[] = [], indices: number[] = []
  for (let row = 0; row <= rows; row++) {
    for (let column = 0; column <= columns; column++) {
      const x = -65 + column / columns * 131, z = -42 + row / rows * 84
      vertices.push(x, Math.min(terrainHeight(x, z) * .31, 6), z)
      if (column < columns && row < rows) {
        const a = row * (columns + 1) + column, b = a + columns + 1
        indices.push(a, b, a + 1, a + 1, b, b + 1)
      }
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3))
  geometry.setIndex(indices)
  return geometry
}

function createLayer(frontier: number, upper: boolean) {
  return new ShaderMaterial({
    uniforms: {
      frontier: { value: frontier },
      drift: { value: 0 },
      height: { value: upper ? 5.6 : 2.5 },
      opacity: { value: upper ? 0.45 : 0.93 },
      ivory: { value: new Color(upper ? '#f8f3df' : '#e4ddc8') },
      shade: { value: new Color(upper ? '#c9c9bd' : '#b8bbb0') },
    },
    transparent: true, depthWrite: false, side: DoubleSide,
    vertexShader: `
      varying vec2 ground;
      uniform float height;
      void main() {
        ground = position.xz;
        vec3 cloud = position;
        cloud.y += height + sin(ground.y * .14) * .9 + cos(ground.x * .10) * .8;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(cloud, 1.);
      }`,
    fragmentShader: `
      varying vec2 ground;
      uniform float frontier, height, opacity, drift;
      uniform vec3 ivory, shade;
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      float cloudNoise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3. - 2. * f);
        return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
          mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
      }
      void main() {
        vec2 cloud = ground * vec2(.105,.14) + height * vec2(.12, .17) + vec2(drift, drift * .25);
        float soft = cloudNoise(cloud) * .69 + cloudNoise(cloud * 2.08 + 9.7) * .25 + cloudNoise(cloud * 3.82) * .06;
        float border = frontier + sin(ground.y * .139) * 4. + (soft - .5) * 9.;
        float discovery = smoothstep(-6., 13., ground.x - border);
        float rim = 1. - smoothstep(.79, 1., length((ground + vec2(-1.,0.)) / vec2(70.,47.)));
        float billows = smoothstep(.17, .78, soft);
        float alpha = discovery * rim * opacity * (.17 + billows * .83);
        if (alpha < .005) discard;
        gl_FragColor = vec4(mix(shade, ivory, billows), alpha);
        #include <colorspace_fragment>
      }`,
  })
}

export default function DiscoveryMist({ landmarks, compact, reduced }: {
  landmarks: Atlas['landmarks'], compact: boolean, reduced: boolean,
}) {
  const frontier = discoveryFrontier(landmarks)
  const geometry = useMemo(() => mistSurface(compact), [compact])
  const layers = useMemo(() => [createLayer(-52, false), createLayer(-52, true)], [])
  const invalidate = useThree(state => state.invalidate)

  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => layers.forEach(layer => layer.dispose()), [layers])
  useEffect(() => {
    if (reduced) {
      layers.forEach(layer => { layer.uniforms.frontier.value = frontier })
      invalidate()
      return
    }
    const tween = gsap.timeline({ onUpdate: () => invalidate() })
      .to(layers.map(layer => layer.uniforms.frontier), { value: frontier, duration: .82, ease: 'power2.out' }, 0)
      .to(layers.map(layer => layer.uniforms.drift), { value: '+=0.14', duration: 1.05, ease: 'sine.out' }, 0)
    return () => { tween.kill() }
  }, [frontier, invalidate, layers, reduced])

  return <>{layers.map((layer, index) => <mesh key={index} geometry={geometry} material={layer} renderOrder={8 + index} />)}</>
}
