import { BufferAttribute, BufferGeometry, Color } from 'three'
import { clamp, grain, mix, noise, random, smooth } from '../world/math'
import type { Plant } from '../world/Brush'

const turf = new Color('#647349')
const grass = new Color('#909751')
const path = new Color('#a69670')
const root = new Color('#5f4f37')
const earth = new Color('#77634a')

export const pathCenter = (z: number) => 0.10 + Math.max(0, z - 2) ** 1.46 * 0.113
export const pathWidth = (z: number) => mix(0.77, 1.27, smooth(1, 7, z))

export function gardenHeight(x: number, z: number) {
  const hill = 4.9 * Math.exp(-((x / 5.4) ** 2 + ((z + 3.15) / 3.38) ** 2))
  const step = 1 - smooth(-0.68, 1.62, z)
  const bed = 0.12 + (grain(x * 0.6, z * 0.6) - 0.5) * 0.58
  return bed + hill * step
}

export function gardenEdge(angle: number) {
  return 1 + 0.035 * Math.sin(angle * 4 + 1) + 0.042 * Math.cos(angle * 7)
}

export function makeGarden() {
  const rings = 76, slices = 160
  const vertices: number[] = [], colors: number[] = [], faces: number[] = []
  function point(i: number, j: number, edgeDepth: number) {
    const angle = i / slices * Math.PI * 2
    const radius = j / rings * gardenEdge(angle)
    const x = Math.cos(angle) * radius * 10.4, z = Math.sin(angle) * radius * 7.5 - 0.3
    const texture = grain(x * 1.7, z * 1.7)
    const height = gardenHeight(x, z)
    const color = turf.clone().lerp(grass, smooth(0.18, 0.78, texture))
    const footpath = z > 0.5 ? 1 - smooth(pathWidth(z) * 0.62, pathWidth(z) * 1.17, Math.abs(x - pathCenter(z)) + (texture - 0.5) * 0.35) : 0
    color.lerp(path, footpath * 0.85)
    color.multiplyScalar(0.76 + 0.4 * noise(x * 3.2, z * 3.2))
    if (edgeDepth > 0) {
      color.copy(root).lerp(earth, texture + 0.13 * Math.sin(edgeDepth * 20))
      vertices.push(x * (1 + Math.sin(edgeDepth * Math.PI) * 0.018), mix(height, -1.28, edgeDepth), z)
    } else {
      vertices.push(x, height, z)
    }
    color.toArray(colors, colors.length)
  }
  point(0, 0, 0)
  for (let r = 1; r <= rings + 5; r++) {
    for (let i = 0; i < slices; i++) {
      point(i, Math.min(r, rings), Math.max(0, (r - rings) / 5))
      const index = 1 + (r - 1) * slices
      const a = index + i, b = index + (i + 1) % slices
      if (r === 1) faces.push(0, b, a)
      else faces.push(a, a - slices, b - slices, a, b - slices, b)
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3))
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3))
  geometry.setIndex(faces)
  geometry.computeVertexNormals()
  return geometry
}

export function gardenPlants(compact: boolean) {
  const rng = random(761)
  const blades: Plant[] = [], flowers: Plant[] = [], hedges: Plant[] = []
  const palette = ['#758342', '#798a4f', '#596a37', '#aeb16b', '#8c9b55', '#4a6038']
  const petals = ['#f4d793', '#e6d4c4', '#e8c682', '#b68c9c', '#d59358']
  const samples = compact ? 4800 : 9000
  for (let i = 0; i < samples; i++) {
    const x = (rng() - 0.5) * 21, z = (rng() - 0.5) * 15
    const angle = Math.atan2((z + 0.3) / 7.5, x / 10.4)
    const radius = Math.hypot(x / 10.4, (z + 0.3) / 7.5)
    if (radius > gardenEdge(angle) - 0.02) continue
    if (z > 0.52 && Math.abs(x - pathCenter(z)) < pathWidth(z) * (0.84 + rng() * 0.44)) continue
    const patch = grain(x * 0.38, z * 0.52)
    if (rng() > 0.2 + patch * 1.02) continue
    const y = gardenHeight(x, z)
    const stretch = (0.45 + rng() * 1.2) * (0.76 + patch * 0.51)
    const plant: Plant = { position: [x, y - 0.015, z], scale: [stretch, stretch, stretch], turn: rng() * Math.PI * 2, color: palette[Math.floor(rng() * palette.length)] }
    blades.push(plant)
    if (rng() < 0.19 && patch > 0.46 && z > 0.9) {
      flowers.push({ ...plant, position: [x, y + stretch * 0.22, z], scale: [stretch, stretch * 0.68, stretch], color: petals[Math.floor(rng() * petals.length)] })
    }
  }
  for (let i = 0; i < 290; i++) {
    const x = (rng() < 0.5 ? -1 : 1) * (3.4 + rng() * 5.4)
    const z = 2.8 + Math.sin(x * 0.81) * 1.18 + (rng() - 0.5) * 1.38
    const size = 0.10 + rng() * 0.34
    hedges.push({
      position: [x, gardenHeight(x, z) + size * 0.57, z],
      scale: [size * 1.29, size, size], turn: rng() * 6.28, color: palette[Math.floor(rng() * 3)],
    })
  }
  return { blades, flowers, hedges }
}

export function grassGeometry() {
  const geometry = new BufferGeometry()
  const vertices: number[] = []
  for (let i = 0; i < 5; i++) {
    const angle = i * 2.2
    const x = Math.cos(angle), z = Math.sin(angle)
    const width = 0.029 + 0.008 * Math.cos(angle)
    const height = 0.14 + 0.11 * clamp(Math.sin(i * 12.42) + 0.4)
    vertices.push(-z * width, 0, x * width, z * width, 0, -x * width, x * 0.093, height, z * 0.093)
  }
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3))
  geometry.computeVertexNormals()
  return geometry
}
