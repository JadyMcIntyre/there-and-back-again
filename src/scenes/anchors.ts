import type { Vector3Tuple } from 'three'
import { gardenHeight } from './garden'

export function gardenPosition(x: number, z: number): Vector3Tuple {
  return [x, gardenHeight(x, z), z]
}

export const facadeZ = .84
export const doorCenter: Vector3Tuple = [0, 1.42, facadeZ + .22]
export const exteriorPlacements = {
  bilbo: { base: gardenPosition(-2.46, 2.42), turn: .17 },
  gandalf: { base: gardenPosition(2.98, 2.85), turn: -.15 },
}
export const exteriorAnchors: Record<string, Vector3Tuple> = {
  bilbo: [-2.46, exteriorPlacements.bilbo.base[1] + 1.30, 2.89],
  gandalf: [2.98, exteriorPlacements.gandalf.base[1] + 1.55, 3.43],
  'green-door': [0, 1.69, 1.39],
}

export const interiorAnchors = {
  'dining-table': [-4.85, 1.65, .29],
  'thror-map': [-1.59, 1.65, 2.14],
  'thror-key': [-0.57, 1.39, 2.82],
  'instruments': [6.87, .95, -1.18],
  'thorin': [4.5, 1.94, -.84],
  'bilbos-pipe': [6.39,1.07,1.76],
} satisfies Record<string, Vector3Tuple>

