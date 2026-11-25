import { useTexture } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { BackSide, Color, DodecahedronGeometry, RepeatWrapping, SRGBColorSpace } from 'three'
import { Instances, type Plant } from '../world/Brush'
import { makeTrees } from '../world/landscape'
import { grain, random } from '../world/math'
import { gardenHeight, makeGarden } from './garden'

const skyVertex = `
  varying vec3 horizon;
  void main() {
    horizon = (modelMatrix * vec4(position, 1.)).xyz - cameraPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
  }
`

const skyFragment = `
  varying vec3 horizon;
  uniform vec3 zenith;
  uniform vec3 haze;
  uniform vec3 cloudTint;
  float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float softNoise(vec2 p) {
    vec2 i=floor(p), f=fract(p);
    f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);
  }
  void main() {
    vec3 d=normalize(horizon);
    vec2 p=d.xz * (1.85 / (max(.0,d.y)+.29)) + vec2(8.2,12.7);
    float cloud=softNoise(p)*.56+softNoise(p*2.11+1.)*.27+softNoise(p*4.32)*.12+softNoise(p*9.)*.05;
    float bank=smoothstep(.49,.70,cloud)*smoothstep(.02,.15,d.y);
    vec3 result=mix(haze,zenith,smoothstep(-.03,.73,d.y));
    result=mix(result,cloudTint,bank*.86);
    gl_FragColor=vec4(result,1.);
    #include <colorspace_fragment>
  }
`

function Sky({ morning }: { morning: boolean }) {
  const uniforms = useMemo(() => ({
    zenith: { value: new Color(morning ? '#74a3c0' : '#688eae') },
    haze: { value: new Color(morning ? '#d2d9bf' : '#e0cfab') },
    cloudTint: { value: new Color(morning ? '#fff3d9' : '#fce4b9') },
  }), [morning])
  return <mesh frustumCulled={false} renderOrder={-5}>
    <sphereGeometry args={[187,36,20]} />
    <shaderMaterial uniforms={uniforms} vertexShader={skyVertex} fragmentShader={skyFragment} side={BackSide} depthWrite={false} />
  </mesh>
}

function treeCover(compact: boolean) {
  const rng = random(8804)
  const crowns: Plant[] = [], trunks: Plant[] = [], nearHedge: Plant[] = []
  const shades = ['#435e3a','#546d3e','#637b46','#788840','#64794c','#889453']
  for (let i=0; i < (compact ? 430 : 720); i++) {
    const x = (rng()-.5)*185, z = (rng()-.57)*165
    if (Math.abs(x) < 11 && z > -11 && z < 13.5) continue
    if (rng() > .2 + grain(x*.18,z*.22) * .96) continue
    const y = gardenHeight(x,z)-.14
    const scale = 1 + rng() ** 2 * 3.15
    const position: Plant['position'] = [x,y,z]
    const turn = rng()*Math.PI*2
    const growth: Plant['scale'] = [scale*(1+rng()*.24),scale*(1.3+rng()*.55),scale*(1+rng()*.24)]
    crowns.push({ position, scale: growth, turn, color: shades[Math.floor(rng()*shades.length)] })
    trunks.push({ position, scale: growth, turn, color: '#645645' })
  }
  for (let i=0; i < 94; i++) {
    const row = Math.floor(i/31)
    const n = i%31
    const x = row === 2 ? -12.4+n*.83 : (row===0 ? -9.65 : 9.76) + Math.sin(n*.58)*.30
    const z = row === 2 ? 13.08 + Math.sin(n*.38)*.43 : 1.32 + n*.39
    const size = .41+rng()*.50
    nearHedge.push({ position:[x,gardenHeight(x,z)+size*.67,z], scale:[size*1.25,size*1.26,size*.92],
      turn:rng()*6.28,color:shades[Math.floor(rng()*shades.length)] })
  }
  return { crowns, trunks, nearHedge }
}

export function GardenSurface({ distant = false }: { distant?: boolean }) {
  const geometry = useMemo(() => makeGarden(distant), [distant])
  const grainMap = useTexture('/assets/materials/garden-grain.webp')
  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => {
    grainMap.wrapS = grainMap.wrapT = RepeatWrapping
    grainMap.colorSpace = SRGBColorSpace
    grainMap.anisotropy = 4
    grainMap.needsUpdate = true
  }, [grainMap])
  return <mesh geometry={geometry} userData={{ walkGround: true }} receiveShadow={!distant} castShadow={false}>
    <meshStandardMaterial vertexColors roughness={.97} map={distant ? null : grainMap} />
  </mesh>
}

export function Countryside({ compact, morning }: { compact: boolean, morning: boolean }) {
  const trees = useMemo(makeTrees, [])
  const hedge = useMemo(() => new DodecahedronGeometry(1,1),[])
  const planting = useMemo(() => treeCover(compact),[compact])
  useEffect(() => () => {
    Object.values(trees).forEach(geometry => geometry.dispose())
    hedge.dispose()
  }, [trees, hedge])
  return <>
    <color attach="background" args={['#c9d2b1']} />
    <fog attach="fog" args={['#c3cbb0',24,118]} />
    <Sky morning={morning} />
    <GardenSurface distant />
    <Instances geometry={trees.trunk} plants={planting.trunks} shadows={false}><meshStandardMaterial roughness={1} /></Instances>
    <Instances geometry={trees.crown} plants={planting.crowns} shadows={false}><meshStandardMaterial roughness={.95} flatShading /></Instances>
    <Instances geometry={hedge} plants={planting.nearHedge}><meshStandardMaterial roughness={.96} flatShading /></Instances>
  </>
}
