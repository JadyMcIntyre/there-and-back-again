import { Html } from '@react-three/drei'
import { DoorOpen, Package, UserRound } from 'lucide-react'
import type { Vector3Tuple } from 'three'
import type { Exhibit } from '../content/schema'
import type { SceneProps } from './sceneProps'

export function ScenePin({ position, item, active, select, portal }: {
  position: Vector3Tuple, item: Exhibit, active: boolean, select: () => void, portal: SceneProps['portal'],
}) {
  const Icon = item.id === 'green-door' ? DoorOpen : item.kind === 'object' ? Package : UserRound
  return <Html portal={portal as React.RefObject<HTMLElement>} center position={position} zIndexRange={active ? [24, 20] : [16, 4]} className="marker-anchor">
    <button type="button" className={`map-pin named scene-pin ${active ? 'active' : ''}`}
      aria-label={`Inspect ${item.name}`} aria-pressed={active} onClick={select}>
      <span><Icon size={12} aria-hidden /></span><strong>{item.name}</strong>
    </button>
  </Html>
}
