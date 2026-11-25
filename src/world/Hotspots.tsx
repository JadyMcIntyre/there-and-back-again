import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { InstancedMesh, Matrix4, Mesh, Raycaster, Vector2, Vector3, type Vector3Tuple, type Intersection } from 'three'

import { labelHasRoom, placeHotspotLabel, type LabelBox } from './hotspotLayout'

export type HotspotEntry = { id: string, name: string, position: Vector3Tuple, prominent?: boolean }
const center = (_object: unknown, _camera: unknown, size: { width: number, height: number }) => [size.width / 2, size.height / 2]

export function Hotspots({ entries, selected, select, activate, portal, atlas = false, compact = false }: {
  entries: HotspotEntry[], selected?: string, select: (id: string) => void, activate: (id: string) => void,
  portal: RefObject<HTMLDivElement | null>, atlas?: boolean, compact?: boolean
}) {
  const elements = useRef(new Map<string, HTMLButtonElement>())
  const invalidate = useThree(state => state.invalidate)
  const ordered = useMemo(() => [...entries].sort((a, b) => Number(b.id === selected) - Number(a.id === selected)
    || Number(!!b.prominent) - Number(!!a.prominent)), [entries, selected])
  const work = useMemo(() => ({ point: new Vector3(), ndc: new Vector2(), ray: new Raycaster(), previous: new Matrix4(), projection: new Matrix4(), occluders: [] as Mesh[], hits: [] as Intersection[] }), [])
  const lastCheck = useRef(-Infinity)
  useEffect(() => { lastCheck.current = -Infinity; invalidate() }, [ordered, invalidate])

  useFrame(({ camera, size, scene }) => {
    camera.updateMatrixWorld()
    const zoom = 'zoom' in camera ? Number(camera.zoom) : 0
    const wide = atlas && zoom < (compact ? 8 : 14)
    const now = performance.now()
    const refresh = now - lastCheck.current > 90
    const moving = !work.previous.equals(camera.matrixWorld) || !work.projection.equals(camera.projectionMatrix)
    if (!refresh && !moving) return
    work.previous.copy(camera.matrixWorld)
    work.projection.copy(camera.projectionMatrix)
    // Refresh moving occluders even when the camera is stationary.
    if (refresh) {
      lastCheck.current = now
      work.occluders.length = 0
      scene.traverseVisible(object => {
        if (!(object instanceof Mesh) || (wide && object instanceof InstancedMesh)) return
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        if (materials.every(material => material.visible && !material.transparent && material.type !== 'MeshBasicMaterial')) {
          work.occluders.push(object)
        }
      })
    }
    const occupied: LabelBox[] = []
    // Reserve dots before labels, so a place name can never cover a neighbouring control.
    const points = ordered.map(entry => {
      work.point.fromArray(entry.position).project(camera)
      return { entry, x: (0.5 + work.point.x * .5) * size.width, y: (0.5 - work.point.y * .5) * size.height,
        depth: work.point.z, nx: work.point.x, ny: work.point.y }
    })
    for (const { entry, x, y, depth, nx, ny } of points) {
      const button = elements.current.get(entry.id)
      const anchor = button?.parentElement
      if (!button || !anchor) continue
      let hidden = depth < -1 || depth > 1 || x < 0 || y < 0 || x > size.width || y > size.height
      if (!hidden) {
        work.ndc.set(nx, ny)
        work.ray.setFromCamera(work.ndc, camera)
        const distance = work.point.fromArray(entry.position).sub(work.ray.ray.origin).dot(work.ray.ray.direction)
        work.ray.far = distance - (atlas ? .22 : .12)
        work.hits.length = 0
        hidden = work.ray.intersectObjects(work.occluders, false, work.hits).length > 0
      }
      const transform = `translate3d(${x}px,${y}px,0)`
      if (anchor.style.transform !== transform) anchor.style.transform = transform
      anchor.toggleAttribute('data-occluded', hidden)
    }
    const visible = points.filter(({ entry }) => !elements.current.get(entry.id)?.parentElement?.hasAttribute('data-occluded'))
    for (const point of visible) {
      const { entry } = point
      const button = elements.current.get(entry.id)
      const anchor = button?.parentElement
      if (!button || !anchor) continue
      const active = entry.id === selected
      const { flip, box } = placeHotspotLabel(point, entry.name, size.width)
      const label = active || (wide && !compact && entry.prominent && labelHasRoom(box, visible.filter(other => other !== point), occupied))
      if (label) occupied.push(box)
      button.dataset.marker = label ? 'label' : 'dot'
      anchor.toggleAttribute('data-flip', flip)
      anchor.style.zIndex = active ? '3' : label ? '2' : '1'
    }
  })

  const press = useRef<{ x: number, y: number, moved: boolean } | undefined>(undefined)
  const dragged = (event: { detail: number, clientX: number, clientY: number }) =>
    event.detail > 0 && press.current && (press.current.moved || Math.hypot(event.clientX - press.current.x, event.clientY - press.current.y) > 6)

  return <Html portal={portal as RefObject<HTMLElement>} fullscreen calculatePosition={center} className="atlas-pin-overlay"
    style={{ pointerEvents: 'none' }}>
    {ordered.map(entry => <div className="hotspot-anchor" data-occluded key={entry.id}>
      <button ref={node => {
        if (node) { elements.current.set(entry.id, node); lastCheck.current = -Infinity; invalidate() }
        else elements.current.delete(entry.id)
      }} type="button" className="hotspot" aria-label={`${atlas ? 'Select' : 'Inspect'} ${entry.name}`}
        aria-pressed={entry.id === selected} data-marker="dot"
        onPointerDown={event => { press.current = { x: event.clientX, y: event.clientY, moved: !event.isPrimary || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey } }}
        onPointerMove={event => {
          if (event.buttons && press.current && Math.hypot(event.clientX - press.current.x, event.clientY - press.current.y) > 6) press.current.moved = true
        }}
        onPointerEnter={event => { delete event.currentTarget.dataset.dismissed }}
        onFocus={event => { delete event.currentTarget.dataset.dismissed }}
        onClick={event => { if (!dragged(event)) select(entry.id) }}
        onDoubleClick={event => { if (!dragged(event)) activate(entry.id) }}>
        <span className="hotspot-dot" aria-hidden />
        <span className="hotspot-name" aria-hidden>{entry.name}</span>
      </button>
    </div>)}
  </Html>
}
