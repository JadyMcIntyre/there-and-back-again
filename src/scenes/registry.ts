import { useGLTF } from '@react-three/drei'
import { lazy } from 'react'
import type { Vector3Tuple } from 'three'
import type { Composition } from '../world/CameraRig'
import { gardenWalk, roomWalk } from './bagEndPlan'
import { exteriorAnchors, interiorAnchors } from './anchors'

const bagEndModels = [
  'kenney/fence.glb', 'kenney/fence-gate.glb', 'kenney/rock-wide.glb',
  'quaternius/Bush_Flowers.gltf', 'quaternius/Flower_1_Clump.gltf',
]
const loadBagEnd = () => import('./BagEnd')
const loadInterior = () => import('./interiors/BagEndInterior')

export const scenes = {
  'bag-end': {
    walk: gardenWalk,
    anchors: exteriorAnchors,
    World: lazy(loadBagEnd),
    models: bagEndModels,
    exhibits: ['bilbo', 'gandalf', 'green-door'],
    prefetch: loadBagEnd,
    doorway: [0, 1.63, 1.03] as Vector3Tuple,
    camera: { eye: [5.4, 4.1, 16.9], target: [0, 1.82, 1.3], center: 2, width: 22, height: 16, countryside: true } satisfies Composition,
  },
  'bag-end-interior': {
    walk: roomWalk,
    anchors: interiorAnchors,
    World: lazy(loadInterior),
    models: [],
    exhibits: ['dining-table', 'thorin', 'bilbos-pipe', 'thror-map', 'thror-key', 'instruments'],
    prefetch: loadInterior,
    camera: { eye: [1.48, 2.53, 5.09], target: [1.05, 1.51, -.8], center: 1.5, width: 24.8, height: 16, room: true } satisfies Composition,
    dollhouse: { eye: [9.2, 11.7, 24.5], target: [0, 1.5, 0], center: 1.5, width: 24.8, height: 16, orbitLimit: true } satisfies Composition,
  },
}

export type SceneId = keyof typeof scenes
export function sceneId(value?: string): SceneId | undefined {
  return value && Object.hasOwn(scenes, value) ? value as SceneId : undefined
}

export function isInterior(scene: SceneId) { return 'dollhouse' in scenes[scene] }

export function sceneAnchors(scene: SceneId): Record<string, Vector3Tuple> { return scenes[scene].anchors }

export function preloadScene(id: SceneId) {
  const { models, prefetch } = scenes[id]
  for (const model of models) useGLTF.preload(`/assets/${model}`)
  return prefetch()
}
