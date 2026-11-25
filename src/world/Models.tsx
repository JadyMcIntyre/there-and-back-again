import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import { Mesh, type Vector3Tuple } from 'three'

export function Model({ file, position, scale = 1, turn = 0 }: {
  file: string
  position: Vector3Tuple
  scale?: number
  turn?: number
}) {
  const { scene } = useGLTF(`/assets/${file}`)
  const model = useMemo(() => {
    const copy = scene.clone(true)
    copy.traverse(object => {
      if (object instanceof Mesh) {
        object.castShadow = true
        object.receiveShadow = true
      }
    })
    return copy
  }, [scene])
  return <primitive object={model} position={position} scale={scale} rotation-y={turn} />
}
