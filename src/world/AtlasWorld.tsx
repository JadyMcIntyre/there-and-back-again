import { Html } from '@react-three/drei'
import { Compass, MapPin } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import {
  BoxGeometry, CircleGeometry, DoubleSide, DodecahedronGeometry, Vector3,
} from 'three'
import type { Atlas } from '../content/spoilers'
import type { Landmark, Route } from '../content/schema'
import { Instances, type Plant } from './Brush'
import { makeTrees, plantForests } from './landscape'
import { makeTerrain, makeWater, terrainHeight, withinLand } from './terrain'
import { mix } from './math'

function Ground({ compact }: { compact: boolean }) {
  const terrain = useMemo(() => makeTerrain(compact), [compact])
  const waters = useMemo(() => [makeWater(false), makeWater(true)], [])
  useEffect(() => () => {
    terrain.surface.dispose()
    terrain.wall.dispose()
  }, [terrain])
  useEffect(() => () => waters.forEach(water => water.dispose()), [waters])

  return <>
    <mesh geometry={terrain.surface} castShadow receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.96} />
    </mesh>
    <mesh geometry={terrain.wall} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.97} />
    </mesh>
    {waters.map((water, index) => <mesh key={index} geometry={water} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.36} metalness={0.12} side={DoubleSide} />
    </mesh>)}
  </>
}

function Woodlands({ compact, showFields }: { compact: boolean, showFields: boolean }) {
  const trees = useMemo(makeTrees, [])
  const forest = useMemo(() => plantForests(compact), [compact])
  const rock = useMemo(() => new DodecahedronGeometry(1, 0), [])
  const field = useMemo(() => new BoxGeometry(2, 1, 2), [])
  useEffect(() => () => {
    Object.values(trees).forEach(shape => shape.dispose())
    rock.dispose()
    field.dispose()
  }, [trees, rock, field])

  return <>
    <Instances geometry={trees.trunk} plants={forest.trunks} shadows={false}><meshStandardMaterial roughness={0.97} /></Instances>
    <Instances geometry={trees.conifer} plants={forest.pines}><meshStandardMaterial roughness={0.94} flatShading /></Instances>
    <Instances geometry={trees.crown} plants={forest.crowns}><meshStandardMaterial roughness={0.97} flatShading /></Instances>
    <Instances geometry={rock} plants={forest.boulders} shadows={false}><meshStandardMaterial roughness={0.96} flatShading /></Instances>
    {showFields && <Instances geometry={field} plants={forest.fields} shadows={false}><meshStandardMaterial roughness={1} /></Instances>}
  </>
}

function markJourney(routes: Route[]) {
  const marks: Plant[] = []
  for (const route of routes) {
    for (let j = 0; j < route.points.length - 1; j++) {
      const [ax, az] = route.points[j], [bx, bz] = route.points[j + 1]
      const count = Math.ceil(Math.hypot(bx - ax, bz - az) / 0.96)
      for (let i = 0; i < count; i++) {
        const x = mix(ax, bx, i / count), z = mix(az, bz, i / count)
        if (!withinLand(x, z)) continue
        marks.push({ position: [x, terrainHeight(x, z) + 0.32, z], scale: [1, 1, 1], turn: 0, color: '#efce80' })
      }
    }
  }
  return marks
}

function Journey({ routes }: { routes: Route[] }) {
  const geometry = useMemo(() => new CircleGeometry(0.22, 9).rotateX(-Math.PI / 2), [])
  const marks = useMemo(() => markJourney(routes), [routes])
  useEffect(() => () => geometry.dispose(), [geometry])
  if (!marks.length) return null
  return <Instances key={marks.length} geometry={geometry} plants={marks} shadows={false}>
    <meshBasicMaterial toneMapped={false} />
  </Instances>
}

function Cottage({ x, z, scale, roof, turn }: { x: number, z: number, scale: number, roof: string, turn: number }) {
  return <group position={[x, terrainHeight(x, z) - 0.1, z]} scale={scale} rotation-y={turn}>
    <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.68, 1.18, 1.32]} />
      <meshStandardMaterial color="#c9b38b" roughness={0.95} />
    </mesh>
    <mesh position={[0, 1.22, 0]} castShadow rotation-y={Math.PI / 4} scale={[1.19, 1, 0.86]}>
      <coneGeometry args={[1.26, 0.98, 4]} />
      <meshStandardMaterial color={roof} roughness={0.94} />
    </mesh>
    <mesh position={[0.48, 1.49, -0.24]} castShadow>
      <boxGeometry args={[0.27, 0.66, 0.27]} />
      <meshStandardMaterial color="#716956" />
    </mesh>
    <mesh position={[-0.32, 0.43, 0.668]}>
      <boxGeometry args={[0.34, 0.51, 0.035]} />
      <meshStandardMaterial color="#546b49" />
    </mesh>
  </group>
}

function Settlements({ landmarks }: { landmarks: Atlas['landmarks'] }) {
  const houses = [
    [-1.4, -2.5, 0.92, '#86644d', 0.3],
    [2.4, -0.7, 0.74, '#7a4531', -0.4],
    [-2.3, 1.4, 0.62, '#9b623e', 0.16],
    [0.3, 3.2, 0.78, '#9b7943', 0.35],
  ] as const
  return <>
    {landmarks.map(({ id, point: [x, z] }) => {
      if (id === 'bag-end') return <group key={id}>{houses.map(([dx, dz, scale, roof, turn]) =>
        <Cottage key={dx} x={x + dx} z={z + dz} scale={scale} roof={roof} turn={turn} />)}</group>
      if (id === 'rivendell') return <group key={id}>{houses.slice(0, 3).map(([dx, dz, scale, , turn]) =>
        <Cottage key={dx} x={x + dx * 0.74} z={z + dz * 0.74} scale={scale * 1.13} roof="#74817e" turn={turn} />)}</group>
      if (id === 'beorn') return <Cottage key={id} x={x - 1.4} z={z + 0.4} scale={1.22} roof="#78603a" turn={-0.3} />
      return null
    })}
  </>
}

type PlaceLabel = Pick<Landmark, 'id' | 'point' | 'name'>
const prominent = new Set(['bag-end', 'rivendell', 'high-pass', 'beorn', 'forest-gate'])
export const markerPosition = ({ point: [x, z], id }: PlaceLabel) =>
  new Vector3(x, terrainHeight(x, z) + (id === 'bag-end' ? 2.7 : 2.3), z)

function MapMarker({ place, active, select }: { place: PlaceLabel, active: boolean, select: () => void }) {
  const isNamed = prominent.has(place.id) || active
  return <Html position={markerPosition(place)} center zIndexRange={[15, 2]} className="marker-anchor">
    <button type="button" className={`map-pin ${active ? 'active' : ''} ${isNamed ? 'named' : ''}`}
      aria-label={`Select ${place.name}`} aria-pressed={active} onClick={select}>
      <span>{active ? <Compass size={13} aria-hidden /> : <MapPin size={11} aria-hidden />}</span>
      <strong>{place.name}</strong>
    </button>
  </Html>
}

export default function AtlasWorld({ atlas, compact, selected, select }: {
  atlas: Atlas
  compact: boolean
  selected?: string
  select: (id: string) => void
}) {
  return <>
    <Ground compact={compact} />
    <Woodlands compact={compact} showFields={atlas.landmarks.some(place => place.id === 'bag-end')} />
    <Settlements landmarks={atlas.landmarks} />
    <Journey routes={atlas.routes} />
    {atlas.landmarks.map(place => <MapMarker key={place.id} place={place} active={place.id === selected} select={() => select(place.id)} />)}
  </>
}
