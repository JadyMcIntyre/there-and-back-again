import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import { BufferGeometry, Color, InstancedMesh, Object3D, type Vector3Tuple } from 'three'

export type Plant = { position: Vector3Tuple, scale: Vector3Tuple, turn: number, color: string | Color }

export function Instances({ geometry, plants, children, shadows = true }: {
  geometry: BufferGeometry
  plants: Plant[]
  children: ReactNode
  shadows?: boolean
}) {
  const mesh = useRef<InstancedMesh>(null)
  const object = useMemo(() => new Object3D(), [])
  const tint = useMemo(() => new Color(), [])
  useLayoutEffect(() => {
    const buffer = mesh.current
    if (!buffer) return
    plants.forEach(({ position, scale, turn, color }, index) => {
      object.position.set(...position)
      object.scale.set(...scale)
      object.rotation.y = turn
      object.updateMatrix()
      buffer.setMatrixAt(index, object.matrix)
      buffer.setColorAt(index, tint.set(color))
    })
    buffer.instanceMatrix.needsUpdate = true
    if (buffer.instanceColor) buffer.instanceColor.needsUpdate = true
    buffer.computeBoundingSphere()
  }, [plants, object, tint])

  return <instancedMesh ref={mesh} args={[geometry, undefined, plants.length]} castShadow={shadows} receiveShadow>
    {children}
  </instancedMesh>
}
