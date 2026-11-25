import { useEffect, useMemo, type RefObject } from 'react'
import {
  BoxGeometry, CircleGeometry, DoubleSide, DodecahedronGeometry, Vector3,
} from 'three'
import type { Atlas } from '../content/spoilers'
import type { Route } from '../content/schema'
import { Instances, type Plant } from './Brush'
import { makeTrees, plantForests } from './landscape'
import { makeTerrain, makeWater, terrainHeight, withinLand } from './terrain'
import { mix } from './math'
import DiscoveryMist from './DiscoveryMist'
import { Settlements } from './Landmarks'
import { Hotspots } from './Hotspots'
import { hotspotClick } from './hotspotEvents'

function Ground({ compact, focus }: { compact: boolean, focus: (point: Vector3) => void }) {
  const terrain = useMemo(() => makeTerrain(compact), [compact])
  const waters = useMemo(() => [makeWater(false), makeWater(true)], [])
  useEffect(() => () => {
    terrain.surface.dispose()
    terrain.wall.dispose()
  }, [terrain])
  useEffect(() => () => waters.forEach(water => water.dispose()), [waters])

  return <>
    <mesh geometry={terrain.surface} castShadow receiveShadow onDoubleClick={event => hotspotClick(event, () => focus(event.point))}>
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

function Woodlands({ compact, landmarks }: { compact: boolean, landmarks: Atlas['landmarks'] }) {
  const trees = useMemo(makeTrees, [])
  const forest = useMemo(() => plantForests(compact), [compact])
  const treesOutsideBuildings = useMemo(() => {
    const clearings = landmarks.filter(place => ['bag-end','rivendell','beorn','green-dragon'].includes(place.id))
    const outside = ({ position: [x, , z] }: Plant) => clearings.every(place => {
      const [px,pz] = place.point
      if (place.id === 'bag-end') return Math.hypot((x-px)*1.05,(z-pz-3)*.67) > 5.35
      return Math.hypot(x-px,z-pz) > (place.id === 'beorn' ? 3.6 : 2.0)
    })
    return { trunks: forest.trunks.filter(outside), pines: forest.pines.filter(outside), crowns: forest.crowns.filter(outside) }
  }, [forest, landmarks])
  const rock = useMemo(() => new DodecahedronGeometry(1, 0), [])
  const field = useMemo(() => new BoxGeometry(2, 1, 2), [])
  useEffect(() => () => {
    Object.values(trees).forEach(shape => shape.dispose())
    rock.dispose()
    field.dispose()
  }, [trees, rock, field])

  return <>
    <Instances geometry={trees.trunk} plants={treesOutsideBuildings.trunks} shadows={false}><meshStandardMaterial roughness={0.97} /></Instances>
    <Instances geometry={trees.conifer} plants={treesOutsideBuildings.pines}><meshStandardMaterial roughness={0.94} flatShading /></Instances>
    <Instances geometry={trees.crown} plants={treesOutsideBuildings.crowns}><meshStandardMaterial roughness={0.97} flatShading /></Instances>
    <Instances geometry={rock} plants={forest.boulders} shadows={false}><meshStandardMaterial roughness={0.96} flatShading /></Instances>
    {landmarks.some(place => place.id === 'bag-end') && <Instances geometry={field} plants={forest.fields} shadows={false}><meshStandardMaterial roughness={1} /></Instances>}
  </>
}

function markJourney(routes: Route[]) {
  const marks: Plant[] = []
  for (const route of routes) {
    for (let j = 0; j < route.points.length - 1; j++) {
      const [ax, az] = route.points[j], [bx, bz] = route.points[j + 1]
      const length = Math.hypot(bx - ax, bz - az)
      const count = Math.ceil(length / 0.93)
      for (let i = 0; i < count; i++) {
        const x = mix(ax, bx, i / count), z = mix(az, bz, i / count)
        if (!withinLand(x, z)) continue
        marks.push({
          position: [x, terrainHeight(x, z) + 0.40, z],
          scale: [1.25, 1, 0.91],
          turn: Math.atan2(az - bz, bx - ax),
          color: route.id.startsWith('under-') || route.id === 'cave-path' ? '#e6b979' : '#ffe0a0',
        })
      }
    }
  }
  return marks
}

function Journey({ routes }: { routes: Route[] }) {
  const geometry = useMemo(() => new CircleGeometry(0.23, 10).rotateX(-Math.PI / 2), [])
  const edge = useMemo(() => new CircleGeometry(0.29, 10).rotateX(-Math.PI / 2).translate(0, -0.017, 0), [])
  const marks = useMemo(() => markJourney(routes), [routes])
  const outline = useMemo(() => marks.map(mark => ({ ...mark, color: '#7d5d36' })), [marks])
  useEffect(() => () => { geometry.dispose(); edge.dispose() }, [geometry, edge])
  if (!marks.length) return null
  return <group key={marks.length}>
    <Instances geometry={edge} plants={outline} shadows={false}><meshBasicMaterial toneMapped={false} /></Instances>
    <Instances geometry={geometry} plants={marks} shadows={false}><meshBasicMaterial toneMapped={false} /></Instances>
  </group>
}

type PlaceLabel = Pick<Atlas['landmarks'][number], 'id' | 'point' | 'name'>
const prominent = new Set(['bag-end', 'rivendell', 'high-pass', 'carrock', 'beorn', 'forest-gate'])
export const markerPosition = ({ point: [x, z], id }: PlaceLabel) =>
  new Vector3(x, terrainHeight(x, z) + (id === 'bag-end' ? 2.9 : id === 'carrock' ? 2.5 : 2.15), z)

export default function AtlasWorld({ atlas, compact, selected, select, activate, focus, portal, reduced }: {
  atlas: Atlas
  compact: boolean
  reduced: boolean
  selected?: string
  select: (id: string) => void
  activate: (id: string) => void
  focus: (point: Vector3) => void
  portal: RefObject<HTMLDivElement | null>
}) {
  const entries = useMemo(() => atlas.landmarks.map(place => ({ ...place, position: markerPosition(place).toArray(), prominent: prominent.has(place.id) })), [atlas.landmarks])
  return <>
    <Ground compact={compact} focus={focus} />
    <Woodlands compact={compact} landmarks={atlas.landmarks} />
    <Settlements landmarks={atlas.landmarks} select={(event, id) => hotspotClick(event, () => select(id))} activate={(event, id) => hotspotClick(event, () => activate(id))} />
    <Journey routes={atlas.routes} />
    <DiscoveryMist landmarks={atlas.landmarks} compact={compact} reduced={reduced} />
    <Hotspots portal={portal} entries={entries} atlas compact={compact} selected={selected} select={select} activate={activate} />
  </>
}
