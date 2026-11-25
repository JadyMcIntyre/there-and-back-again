import { useGLTF } from '@react-three/drei'
import { lazy } from 'react'

const bagEndModels = [
  'kenney/fence.glb', 'kenney/fence-gate.glb', 'kenney/rock-wide.glb',
  'quaternius/Bush_Flowers.gltf', 'quaternius/Flower_1_Clump.gltf',
]
const loadBagEnd = () => import('./BagEnd')

export const scenes = {
  'bag-end': {
    World: lazy(loadBagEnd),
    models: bagEndModels,
    exhibits: ['bilbo', 'gandalf', 'green-door'],
    prefetch: loadBagEnd,
    camera: { eye: [8.2, 10.7, 20.5] as [number, number, number], center: 2.66, width: 22.3, height: 15.85 },
  },
}

export type SceneId = keyof typeof scenes
export function sceneId(value?: string): SceneId | undefined {
  return value && Object.hasOwn(scenes, value) ? value as SceneId : undefined
}

export function preloadScene(id: SceneId) {
  const { models, prefetch } = scenes[id]
  for (const model of models) useGLTF.preload(`/assets/${model}`)
  return prefetch()
}
