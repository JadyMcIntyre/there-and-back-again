import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { Compass, MapPin } from 'lucide-react'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
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
  const geometry = useMemo(() => new CircleGeometry(0.30, 10).rotateX(-Math.PI / 2), [])
  const edge = useMemo(() => new CircleGeometry(0.39, 10).rotateX(-Math.PI / 2).translate(0, -0.017, 0), [])
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

const centerOverlay = (_object: unknown, _camera: unknown, size: { width: number, height: number }) => [size.width / 2, size.height / 2]

type PinBox = { x: number, y: number, width: number }
function Markers({ places, compact, selected, select, portal }: {
  places: PlaceLabel[], compact: boolean, selected?: string, select: (id: string) => void, portal: RefObject<HTMLDivElement | null>
}) {
  const elements = useRef(new Map<string, HTMLButtonElement>())
  const invalidate = useThree(state => state.invalidate)
  const markers = useMemo(() => places.map(place => ({ ...place, position: markerPosition(place) }))
    .sort((a, b) => Number(b.id === selected) - Number(a.id === selected)
      || Number(prominent.has(b.id)) - Number(prominent.has(a.id))), [places, selected])
  const projected = useMemo(() => new Vector3(), [])

  useFrame(({ camera, size }) => {
    camera.updateMatrixWorld()
    const occupied: PinBox[] = []
    for (const entry of markers) {
      const button = elements.current.get(entry.id)
      if (!button) continue
      projected.copy(entry.position).project(camera)
      const x = (0.5 + projected.x * 0.5) * size.width
      const y = (0.5 - projected.y * 0.5) * size.height
      const main = selected === entry.id
      const width = Math.min(155, entry.name.length * 5.6 + 31)
      const clear = (span: number) => occupied.every(box => Math.abs(box.y - y) >= 28 || Math.abs(box.x - x) >= (box.width + span) / 2 + 4)
      const detail = 'zoom' in camera && Number(camera.zoom) > (compact ? 9 : 14)
      const label = main || ((!compact && prominent.has(entry.id) || detail) && x > width / 2 && x < size.width - width / 2 && clear(width))
      const state = label ? 'label' : clear(21) ? 'dot' : 'crowded'
      if (state !== 'crowded') occupied.push({ x, y, width: label ? width : 21 })
      const transform = `translate3d(${x}px, ${y}px, 0)`
      if (button.parentElement?.style.transform !== transform && button.parentElement) {
        button.parentElement.style.transform = transform
      }
      if (button.dataset.marker !== state) button.dataset.marker = state
      const stacking = main ? '4' : label ? '3' : state === 'dot' ? '2' : '1'
      if (button.parentElement && button.parentElement.style.zIndex !== stacking) button.parentElement.style.zIndex = stacking
    }
  })

  return <Html portal={portal as RefObject<HTMLElement>} fullscreen calculatePosition={centerOverlay} className="atlas-pin-overlay" zIndexRange={[16, 15]}
    style={{ pointerEvents: 'none' }}>
    {markers.map(entry => {
      const active = entry.id === selected
      return <div key={entry.id} className="atlas-pin-position">
        <button ref={node => {
          if (node) { elements.current.set(entry.id, node); invalidate() }
          else elements.current.delete(entry.id)
        }}
          type="button" className={`map-pin atlas-pin ${active ? 'active' : ''}`} aria-label={`Select ${entry.name}`}
          aria-pressed={active} onClick={() => select(entry.id)}>
          <span>{active ? <Compass size={13} aria-hidden /> : <MapPin size={11} aria-hidden />}</span><strong>{entry.name}</strong>
        </button>
      </div>
    })}
  </Html>
}

export default function AtlasWorld({ atlas, compact, selected, select, portal, reduced }: {
  atlas: Atlas
  compact: boolean
  reduced: boolean
  selected?: string
  select: (id: string) => void
  portal: RefObject<HTMLDivElement | null>
}) {
  return <>
    <Ground compact={compact} />
    <Woodlands compact={compact} showFields={atlas.landmarks.some(place => place.id === 'bag-end')} />
    <Settlements landmarks={atlas.landmarks} />
    <Journey routes={atlas.routes} />
    <DiscoveryMist landmarks={atlas.landmarks} compact={compact} reduced={reduced} />
    <Markers portal={portal} places={atlas.landmarks} compact={compact} selected={selected} select={select} />
  </>
}
