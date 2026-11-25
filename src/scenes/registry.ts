import { useGLTF } from '@react-three/drei'
import { lazy } from 'react'
import type { Vector3Tuple } from 'three'

const bagEndModels = [
  'kenney/fence.glb', 'kenney/fence-gate.glb', 'kenney/rock-wide.glb',
  'quaternius/Bush_Flowers.gltf', 'quaternius/Flower_1_Clump.gltf',
]
const loadBagEnd = () => import('./BagEnd')
const loadInterior = () => import('./interiors/BagEndInterior')

export const scenes = {
  'bag-end': {
    World: lazy(loadBagEnd),
    models: bagEndModels,
    exhibits: ['bilbo', 'gandalf', 'green-door'],
    prefetch: loadBagEnd,
    doorway: [0, 1.7, 1.0] as Vector3Tuple,
    camera: { eye: [8.2, 10.7, 20.5] as [number, number, number], center: 2.66, width: 22.3, height: 15.85 },
  },
  'bag-end-interior': {
    World: lazy(loadInterior),
    models: [],
    exhibits: ['dining-table', 'thorin', 'bilbos-pipe', 'thror-map', 'thror-key', 'instruments'],
    prefetch: loadInterior,
    camera: { eye: [8.3, 12.1, 19.5] as Vector3Tuple, center: 1.5, width: 24.8, height: 16, orbitLimit: true },
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
