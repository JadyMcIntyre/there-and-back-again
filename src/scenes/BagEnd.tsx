import { Html } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { DoorOpen, UserRound } from 'lucide-react'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import {
  BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, DoubleSide, DodecahedronGeometry,
  ExtrudeGeometry, Path, Shape, Vector3, type Group, type Vector3Tuple,
} from 'three'
import type { Exhibit } from '../content/schema'
import { Instances, type Plant } from '../world/Brush'
import { grain, random } from '../world/math'
import { Model } from '../world/Models'
import { Bilbo, Gandalf } from './Figures'
import { ChimneySmoke } from './ChimneySmoke'
import type { SceneProps } from './sceneProps'
import { BagEndThreshold } from './interiors/BagEndThreshold'
import { gardenHeight, gardenPlants, grassGeometry, makeGarden, pathCenter } from './garden'

const facadeZ = 0.84
const archTop = (x: number) => 1.15 + 2.74 * Math.max(0, 1 - (x / 5.35) ** 2) ** 0.71
const stoneShades = ['#a69679', '#b3a082', '#847b69', '#988870', '#a9987f', '#c0ae91']
const doorCenter: Vector3Tuple = [0, 1.42, facadeZ + 0.22]

function Garden({ compact }: { compact: boolean }) {
  const terrain = useMemo(makeGarden, [])
  const { blades, flowers, hedges } = useMemo(() => gardenPlants(compact), [compact])
  const grass = useMemo(grassGeometry, [])
  const petal = useMemo(() => new DodecahedronGeometry(0.048, 0).scale(1, 0.7, 1), [])
  const foliage = useMemo(() => new DodecahedronGeometry(1, 1), [])
  useEffect(() => () => [terrain, grass, petal, foliage].forEach(geometry => geometry.dispose()), [terrain, grass, petal, foliage])

  return <>
    <mesh geometry={terrain} receiveShadow castShadow><meshStandardMaterial vertexColors roughness={1} /></mesh>
    <Instances geometry={grass} plants={blades} shadows={false}><meshStandardMaterial side={DoubleSide} roughness={0.98} /></Instances>
    <Instances geometry={foliage} plants={hedges}><meshStandardMaterial flatShading roughness={0.96} /></Instances>
    <Instances geometry={petal} plants={flowers} shadows={false}><meshStandardMaterial roughness={0.84} /></Instances>
    <RoughSteps />
  </>
}

function RoughSteps() {
  const stones = useMemo(() => {
    const rng = random(433)
    const result: Plant[] = []
    for (let i = 0; i < 15; i++) {
      const z = 1.24 + i * 0.38
      const x = pathCenter(z) + (rng() - 0.5) * 0.53
      const size = 0.36 + rng() * 0.19
      result.push({ position: [x, gardenHeight(x, z) + (i < 3 ? 0.08 : 0.032), z], scale: [size * 1.65, size * (i < 3 ? 0.42 : 0.19), size * 0.54], turn: (rng() - 0.5) * 0.55, color: stoneShades[i % stoneShades.length] })
    }
    return result
  }, [])
  const geometry = useMemo(() => new DodecahedronGeometry(1, 0), [])
  useEffect(() => () => geometry.dispose(), [geometry])
  return <Instances geometry={geometry} plants={stones}><meshStandardMaterial roughness={0.99} flatShading /></Instances>
}

function gardenPosition(x: number, z: number): Vector3Tuple {
  return [x, gardenHeight(x, z), z]
}

function GardenDetails() {
  return <>
    <Model file="kenney/fence.glb" position={gardenPosition(-3.4, 5.2)} scale={1.25} turn={0.15} />
    <Model file="kenney/fence-gate.glb" position={gardenPosition(-1.8, 5.2)} scale={1.23} turn={0.06} />
    <Model file="kenney/fence.glb" position={gardenPosition(4.6, 5.2)} scale={1.32} turn={-0.19} />
    <Model file="kenney/rock-wide.glb" position={gardenPosition(6.0, 4.7)} scale={0.83} turn={0.29} />
    {[[-4.8, 2.7], [4.7, 1.9], [-3.65, 1.88], [4.0, 3.8]].map(([x,z], i) =>
      <Model key={x} file="quaternius/Bush_Flowers.gltf" position={gardenPosition(x, z)} scale={0.55 + i * 0.075} turn={i} />)}
    {[[-2.1, 2.7], [1.7, 3.4], [-4.35, 3.7], [5, 2.65]].map(([x,z], i) =>
      <Model key={x} file="quaternius/Flower_1_Clump.gltf" position={gardenPosition(x, z)} scale={0.86} turn={i * 0.7} />)}
  </>
}

function Branch({ points, radius, color }: { points: Vector3Tuple[], radius: number, color: string }) {
  const curve = useMemo(() => new CatmullRomCurve3(points.map(point => new Vector3(...point))), [points])
  return <mesh castShadow receiveShadow>
    <tubeGeometry args={[curve, 18, radius, 8, false]} />
    <meshStandardMaterial color={color} roughness={1} />
  </mesh>
}

function OrchardTree({ position, scale, autumn = false }: { position: Vector3Tuple, scale: number, autumn?: boolean }) {
  const canopy = useMemo(() => {
    const rng = random(autumn ? 112 : 48)
    const palette = autumn ? ['#a59656','#9c8547','#ad9652','#b39358','#777746'] : ['#4c6540','#667e4b','#6f8249','#849458','#597146']
    return Array.from({ length: 54 }, (_, i): Plant => {
      const arm = (i % 6) * Math.PI / 3
      const distance = rng() * 1.56
      const size = 0.36 + rng() * 0.71
      return {
        position: [Math.cos(arm) * distance + (rng() - 0.5) * 1.07, 2.82 + rng() * 1.08 - distance * 0.18, Math.sin(arm) * distance + (rng() - 0.5) * 1.1],
        scale: [size * 1.15, size * (0.71 + rng() * 0.27), size],
        turn: rng() * 6.28, color: palette[Math.floor(rng() * palette.length)],
      }
    })
  }, [autumn])
  const geometry = useMemo(() => new DodecahedronGeometry(1, 1), [])
  useEffect(() => () => geometry.dispose(), [geometry])
  return <group position={position} scale={scale}>
    <Branch points={[[0, 0, 0], [-0.11, 0.9, 0.06], [0.09, 1.9, 0.025], [0.16, 2.7, 0.15]]} radius={0.23} color="#655039" />
    <Branch points={[[0, 0.98, 0], [-0.25, 1.69, 0.10], [-0.8, 2.22, 0.16], [-1.3, 2.9, 0.25]]} radius={0.139} color="#665039" />
    <Branch points={[[0.02, 1.48, 0], [0.47, 1.91, -0.14], [0.93, 2.62, -0.21], [1.34, 2.89, -0.2]]} radius={0.123} color="#6e573d" />
    <Branch points={[[0.02, 0.12, 0], [0.28, 0.065, 0.22], [0.57, 0, 0.26]]} radius={0.12} color="#6a573c" />
    <Instances plants={canopy} geometry={geometry}><meshStandardMaterial flatShading roughness={0.96} /></Instances>
  </group>
}

function makeWall() {
  const shape = new Shape()
  shape.moveTo(-5.3, -0.1)
  shape.lineTo(5.3, -0.1)
  for (let i = 80; i >= 0; i--) {
    const x = -5.3 + i / 80 * 10.6
    shape.lineTo(x, archTop(x))
  }
  shape.closePath()
  for (const [x,y,r] of [[0, 1.42, 1.25], [-3.05, 1.53, 0.63], [3.05, 1.53, 0.63]]) {
    const hole = new Path()
    hole.absarc(x, y, r, 0, Math.PI * 2, true)
    shape.holes.push(hole)
  }
  return new ExtrudeGeometry(shape, { depth: 0.32, bevelEnabled: true, bevelThickness: 0.044, bevelSize: 0.047, bevelSegments: 2, curveSegments: 36 })
}

function roofHeight(x: number, z: number, t: number) {
  const edge = archTop(x) + 0.13 + Math.sin(t * Math.PI) * 0.25
  return edge * (1 - t) + gardenHeight(x, z) * t + (grain(x * 1.9, z * 2.8) - 0.4) * 0.26
}

function makeSodRoof() {
  const pts: number[] = [], index: number[] = [], colors: number[] = []
  const moss = new Color('#697e46'), straw = new Color('#a1a359')
  const bands = 14, points = 100
  for (let s = 0; s <= bands; s++) {
    const t = s / bands
    for (let i = 0; i <= points; i++) {
      const x = -5.5 + i / points * 11
      const z = facadeZ + 0.21 - t * 3.1
      pts.push(x, roofHeight(x, z, t), z)
      moss.clone().lerp(straw, grain(x * 1.4, z * 2.6) * 0.64).toArray(colors, colors.length)
      if (s < bands && i < points) {
        const a = s * (points + 1) + i, b = a + points + 1
        index.push(a, a + 1, b, b, a + 1, b + 1)
      }
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(pts), 3))
  geometry.setIndex(index)
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3))
  geometry.computeVertexNormals()
  return geometry
}

function roofFoliage() {
  const rng = random(18)
  const shades = ['#7d8f4f', '#586c3f', '#8b985b', '#a3ab68']
  return Array.from({ length: 240 }, (): Plant => {
    const x = (rng() - 0.5) * 10.68, t = 0.05 + rng() * 0.77
    const z = facadeZ + 0.21 - t * 3.1
    const size = 0.35 + rng() * 0.48
    return { position: [x, roofHeight(x, z, t) - 0.018, z], scale: [size, size, size], turn: rng() * 6.28,
      color: shades[Math.floor(rng() * shades.length)] }
  })
}

function StoneRing({ radius, width, position, blocks }: { radius: number, width: number, position: Vector3Tuple, blocks: number }) {
  const wedge = useMemo(() => {
    const shape = new Shape()
    const angle = Math.PI / blocks - 0.009
    shape.moveTo(radius * Math.cos(-angle), radius * Math.sin(-angle))
    shape.absarc(0, 0, radius, -angle, angle, false)
    shape.lineTo((radius + width) * Math.cos(angle), (radius + width) * Math.sin(angle))
    shape.absarc(0, 0, radius + width, angle, -angle, true)
    shape.closePath()
    return new ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.023, bevelSize: 0.019, bevelSegments: 2, curveSegments: 6 })
  }, [radius, width, blocks])
  useEffect(() => () => wedge.dispose(), [wedge])
  return <group position={position}>
    {Array.from({ length: blocks }, (_, i) => <mesh key={i} rotation-z={i / blocks * Math.PI * 2} geometry={wedge} castShadow receiveShadow>
      <meshStandardMaterial roughness={0.94} color={stoneShades[(i * 5 + Math.floor(i / 4)) % stoneShades.length]} />
    </mesh>)}
  </group>
}

function Disk({ radius, depth, color, z = 0 }: { radius: number, depth: number, color: string, z?: number }) {
  return <mesh rotation-x={Math.PI / 2} position-z={z} castShadow receiveShadow>
    <cylinderGeometry args={[radius, radius, depth, 56]} /><meshStandardMaterial color={color} roughness={0.9} />
  </mesh>
}

function Window({ x }: { x: number }) {
  return <group position={[x, 1.53, facadeZ + 0.06]}>
    <StoneRing radius={0.634} width={0.16} position={[0, 0, 0]} blocks={14} />
    <Disk radius={0.624} depth={0.08} color="#56452e" />
    <mesh position-z={0.05}>
      <circleGeometry args={[0.532, 48]} />
      <meshStandardMaterial color="#d4a64e" emissive="#dc8c2c" emissiveIntensity={0.36} roughness={0.34} />
    </mesh>
    <group position-z={0.072} rotation-z={0.54}>
      {[-0.33, 0, 0.33].map(n => <group key={n}>
        <mesh position={[n, 0, 0]}><boxGeometry args={[0.034, n ? 0.83 : 1.07, 0.034]} /><meshStandardMaterial color="#665037" /></mesh>
        <mesh position={[0, n, 0]}><boxGeometry args={[n ? 0.83 : 1.07, 0.034, 0.034]} /><meshStandardMaterial color="#665037" /></mesh>
      </group>)}
    </group>
    <mesh position={[0, -0.69, 0.175]} castShadow>
      <boxGeometry args={[1.46, 0.15, 0.40]} /><meshStandardMaterial color="#a48f71" roughness={0.94} />
    </mesh>
  </group>
}

const doorColors = ['#536e41','#5c7749','#61794c','#4b6841','#617a4c','#5a7544','#4c6b42']
function RoundDoor({ open, reduced, select }: { open: boolean, reduced: boolean, select?: () => void }) {
  const planks = useMemo(() => {
    const radius = 1.17, count = 13
    return Array.from({ length: count }, (_, index) => {
      const left = -radius + 2 * radius * index / count + 0.008
      const right = -radius + 2 * radius * (index + 1) / count - 0.008
      const shape = new Shape()
      for (let i = 0; i <= 10; i++) {
        const x = left + (right - left) * i / 10
        const y = Math.sqrt(radius ** 2 - x ** 2)
        if (!i) shape.moveTo(x, y)
        else shape.lineTo(x, y)
      }
      for (let i = 10; i >= 0; i--) {
        const x = left + (right - left) * i / 10
        shape.lineTo(x, -Math.sqrt(radius ** 2 - x ** 2))
      }
      shape.closePath()
      return new ExtrudeGeometry(shape, { depth: 0.064, bevelEnabled: true, bevelThickness: 0.013, bevelSize: 0.009, bevelSegments: 1 })
    })
  }, [])
  useEffect(() => () => planks.forEach(geometry => geometry.dispose()), [planks])
  const pivot = useRef<Group>(null)
  const invalidate = useThree(state => state.invalidate)
  useEffect(() => {
    if (!pivot.current) return
    if (reduced) {
      pivot.current.rotation.y = open ? -1.32 : 0
      invalidate()
      return
    }
    const animation = gsap.to(pivot.current.rotation, { y: open ? -1.32 : 0, duration: 0.65, ease: 'power2.inOut', onUpdate: () => invalidate() })
    return () => { animation.kill() }
  }, [open, reduced, invalidate])

  return <group position={doorCenter}>
    <StoneRing radius={1.24} width={0.265} position={[0,0,-0.10]} blocks={22} />
    <BagEndThreshold />
    <group ref={pivot} position={[-1.11, 0, 0.051]}>
      <group position-x={1.11} onClick={select ? event => { event.stopPropagation(); select() } : undefined}>
        {planks.map((geometry, i) => <mesh key={i} geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial color={doorColors[i % doorColors.length]} roughness={0.86} />
        </mesh>)}
        <mesh position-z={0.083}><torusGeometry args={[1.158, 0.027, 10, 78]} /><meshStandardMaterial color="#354d33" roughness={0.84} /></mesh>
        <mesh position-z={0.079}><circleGeometry args={[0.104, 20]} /><meshStandardMaterial color="#986a35" metalness={0.48} roughness={0.42} /></mesh>
        <mesh position-z={0.15} castShadow><sphereGeometry args={[0.083, 16, 12]} /><meshStandardMaterial color="#e0ae49" metalness={0.56} roughness={0.28} /></mesh>
      </group>
    </group>
  </group>
}

function Chimney() {
  return <group position={[-2.64, 3.55, -2.1]} rotation-y={0.12}>
    {Array.from({ length: 5 }, (_, i) => <group key={i} position-y={i * 0.231}>
      {[-1, 1].map(side => <mesh key={side} position-x={side * 0.211} rotation-y={(i % 2) * 0.07} castShadow receiveShadow>
        <boxGeometry args={[0.45, 0.22, 0.59]} /><meshStandardMaterial color={stoneShades[(i + side + 2) % stoneShades.length]} roughness={0.96} />
      </mesh>)}
    </group>)}
    <mesh position-y={1.19} castShadow><boxGeometry args={[0.99, 0.19, 0.76]} /><meshStandardMaterial color="#796852" /></mesh>
    <mesh position-y={1.31}><boxGeometry args={[0.57, 0.15, 0.43]} /><meshStandardMaterial color="#655445" /></mesh>
  </group>
}

function House({ open, reduced, select }: { open: boolean, reduced: boolean, select?: () => void }) {
  const wall = useMemo(makeWall, [])
  const roof = useMemo(makeSodRoof, [])
  const grass = useMemo(grassGeometry, [])
  const tufts = useMemo(roofFoliage, [])
  const trim = useMemo(() => Array.from({ length: 69 }, (_, i): Vector3Tuple => {
    const x = -5.38 + i / 68 * 10.76
    return [x, archTop(x) - 0.025, facadeZ + 0.18]
  }), [])
  useEffect(() => () => { wall.dispose(); roof.dispose(); grass.dispose() }, [wall, roof, grass])
  return <>
    <mesh position-z={facadeZ - 0.2} castShadow receiveShadow geometry={wall}>
      <meshStandardMaterial color="#c2a789" roughness={0.92} />
    </mesh>
    <mesh geometry={roof} castShadow receiveShadow><meshStandardMaterial vertexColors roughness={0.98} side={DoubleSide} /></mesh>
    <Instances geometry={grass} plants={tufts} shadows={false}><meshStandardMaterial roughness={0.98} side={DoubleSide} /></Instances>
    <Branch points={trim} radius={0.119} color="#675038" />
    <Branch points={trim.map(([x,y,z]) => [x, y + 0.17, z - 0.063])} radius={0.13} color="#78844b" />
    {[-4.65, -2.02, 2.02, 4.65].map(x => <mesh key={x} position={[x, (archTop(x) - 0.1) / 2, facadeZ + 0.135]} castShadow>
      <boxGeometry args={[0.13, archTop(x) - 0.22, 0.14]} /><meshStandardMaterial color="#7e6346" roughness={0.93} />
    </mesh>)}
    <Window x={-3.05} />
    <Window x={3.05} />
    <RoundDoor open={open} reduced={reduced} select={select} />
    <Chimney />
  </>
}

const placements = {
  bilbo: { base: gardenPosition(-2.46, 2.42), turn: 0.17, label: 2.26 },
  gandalf: { base: gardenPosition(2.98, 2.85), turn: -0.15, label: 3.04 },
  'green-door': { base: doorCenter, turn: 0, label: 1.56 },
}
function SceneExhibit({ item, active, select, portal }: { item: Exhibit, active: boolean, select: () => void, portal: RefObject<HTMLDivElement | null> }) {
  const placement = placements[item.id as keyof typeof placements]
  if (!placement) return null
  const { base, turn, label } = placement
  const Icon = item.kind === 'object' ? DoorOpen : UserRound
  return <group position={base} rotation-y={turn}>
    {item.kind === 'character' && <group onClick={event => { event.stopPropagation(); select() }}>
      {item.id === 'bilbo' ? <Bilbo /> : <Gandalf />}
    </group>}
    <Html portal={portal as RefObject<HTMLElement>} center position={[0, label, 0]} zIndexRange={active ? [24, 20] : [16, 4]} className="marker-anchor">
      <button type="button" className={`map-pin named scene-pin ${active ? 'active' : ''}`}
        aria-label={`Inspect ${item.name}`} aria-pressed={active} onClick={select}>
        <span><Icon size={12} aria-hidden /></span><strong>{item.name}</strong>
      </button>
    </Html>
  </group>
}

export default function BagEnd({ compact, exhibits, selected, select, doorOpen, reduced, portal, active }: SceneProps) {
  const canInspectDoor = exhibits.some(item => item.id === 'green-door')
  return <>
    <Garden compact={compact} />
    <OrchardTree position={gardenPosition(-4.7, -2.55)} scale={1.37} />
    <OrchardTree position={gardenPosition(-7.75, -0.1)} scale={0.85} autumn />
    <OrchardTree position={gardenPosition(6.65, -2.28)} scale={0.97} />
    <OrchardTree position={gardenPosition(7.08, 2.43)} scale={0.68} autumn />
    <ChimneySmoke animate={active && !reduced && !compact} />
    <House open={doorOpen && canInspectDoor} reduced={reduced} select={canInspectDoor ? () => select('green-door') : undefined} />
    <GardenDetails />
    {exhibits.map(item => <SceneExhibit key={item.id} portal={portal} item={item} active={item.id === selected} select={() => select(item.id)} />)}
  </>
}
