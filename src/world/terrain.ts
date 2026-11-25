import { BufferAttribute, BufferGeometry, Color } from 'three'
import { clamp, grain, mix, noise, smooth } from './math'

const width = 116
const depth = 72
const sideBottom = -4.4
const ridge = [
  [-1, -37, 16, 8, 14], [7, -26, 24, 10, 15], [0, -20, 27, 12, 12],
  [11, -11, 15, 9, 12], [2, -6, 15, 9, 11], [6, 5, 23, 11, 14],
  [-1, 14, 19, 12, 14], [5, 25, 13, 10, 12], [-7, 28, 12, 11, 15],
  [17, -27, 12, 9, 11], [-12, -29, 11, 11, 11], [13, 17, 11, 7, 14],
]
const anduin = [25, 27, 23, 25, 28, 26, 30, 34, 32, 37, 39]
const westernRun = [-56, -45, -35, -26, -19, -13, -10]
const westernZ = [24, 22, 27, 22, 17, 12, 5]

function interpolate(values: number[], position: number) {
  const index = Math.min(values.length - 2, Math.floor(clamp(position, 0, values.length - 1)))
  return mix(values[index], values[index + 1], smooth(0, 1, position - index))
}

export const riverX = (z: number) => interpolate(anduin, (z + 39) / 8)
export const westRiverZ = (x: number) => {
  const segment = westernRun.findIndex((value, index) => index > 0 && x < value)
  const next = segment < 0 ? westernRun.length - 1 : segment
  return mix(westernZ[next - 1], westernZ[next], smooth(westernRun[next - 1], westernRun[next], x))
}
export const riverWidth = (z: number) => 1.55 + smooth(-20, 36, z) * 1.15 + 0.35 * noise(z * 0.25, 34)
export const westRiverWidth = (x: number) => mix(1.58, 0.94, smooth(-42, -10, x))

function grassland(x: number, z: number) {
  const relief = grain(x * 0.065 + 5, z * 0.065) * 5 + noise(x * 0.15, z * 0.12) * 0.72
  return 0.95 + relief + 1.7 * Math.exp(-((x + 49) ** 2 + (z - 1) ** 2) / 175)
    + 1.5 * Math.exp(-((x - 54) ** 2 + (z + 16) ** 2) / 270)
}

function mountain(x: number, z: number) {
  let highest = 0
  let foothills = 0
  for (const [cx, cz, height, rx, rz] of ridge) {
    const dx = (x - cx) / rx, dz = (z - cz) / rz
    const angle = Math.atan2(dx, dz)
    const roughness = 1 + Math.sin(angle * 5 + cx) * 0.15 + Math.cos(angle * 8 + cz) * 0.08
    const distance = Math.hypot(dx, dz) * roughness
    const peak = Math.max(0, 1 - distance * 0.67) ** 1.72 * height
    foothills += peak
    highest = Math.max(highest, peak)
  }
  const pass = 1 - 0.38 * Math.exp(-((x - 3) ** 2 / 43 + (z + 12) ** 2 / 14))
  return (highest * 0.91 + foothills * 0.105) * pass
}

export function terrainHeight(x: number, z: number) {
  const peak = mountain(x, z)
  const bed = grassland(x, z) + peak + (grain(x * 0.77, z * 0.71) - 0.48) * Math.min(2.5, 0.28 + peak * 0.19)
  const eastCut = smooth(riverWidth(z) * 0.40, riverWidth(z) * 1.75, Math.abs(x - riverX(z)))
  const westCut = x < -10 ? mix(1, smooth(westRiverWidth(x) * 0.4, westRiverWidth(x) * 2.4, Math.abs(z - westRiverZ(x))), 1 - smooth(-13, -10, x)) : 1
  return mix(0.05, bed, Math.min(eastCut, westCut))
}

export function forestDensity(x: number, z: number) {
  const northeast = smooth(42, 53, x) * (1 - smooth(9, 29, z))
  const wildWoods = smooth(6, 15, x) * (1 - smooth(19, 25, x)) * 0.55
  const westernWoods = (1 - smooth(-27, -19, x)) * smooth(-55, -45, x) * (1 - smooth(0, 13, z)) * 0.78
  const southern = smooth(11, 29, z) * (1 - smooth(-25, -8, x)) * 0.25
  return clamp(northeast + wildWoods + westernWoods + southern + (noise(x * 0.19 + 9, z * 0.2) - 0.35) * 0.52)
}

function mapPoint(u: number, v: number) {
  const corner = 0.078 * Math.abs(u * v) ** 8
  return [
    u * (width / 2 + 2.1 * Math.sin(v * 7 + u) + 1.3 * Math.sin(v * 15 - u) - corner * width),
    v * (depth / 2 + 1.7 * Math.sin(u * 9 - v) + 1.25 * Math.cos(u * 16 + v) - corner * depth),
  ] as const
}

const meadow = new Color('#9b9863')
const sage = new Color('#7b8c60')
const darkForest = new Color('#496649')
const scree = new Color('#888177')
const granite = new Color('#606a67')
const snow = new Color('#dce5db')
const gravel = new Color('#998b62')

function landColor(x: number, y: number, z: number) {
  const variation = grain(x * 0.24, z * 0.24)
  const slope = Math.hypot(terrainHeight(x + 0.4, z) - terrainHeight(x - 0.4, z), terrainHeight(x, z + 0.4) - terrainHeight(x, z - 0.4))
  const color = meadow.clone().lerp(sage, smooth(0.22, 0.77, variation))
  color.lerp(darkForest, forestDensity(x, z) * 0.54)
  color.lerp(gravel, 0.56 * (1 - smooth(0.48, 1.6, y)))
  color.lerp(scree.clone().lerp(granite, smooth(0.37, 0.68, variation)), smooth(5, 12, y + slope * 0.85))
  color.lerp(snow, smooth(14, 22, y + variation * 5 - slope * 1.9))
  return color.multiplyScalar(mix(0.79, 1.18, noise(x * 1.23, z * 1.23)))
}

function geometry(vertices: number[], colors: number[], indices: number[]) {
  const result = new BufferGeometry()
  result.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3))
  result.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3))
  result.setIndex(indices)
  result.computeVertexNormals()
  return result
}

export function makeTerrain(compact: boolean) {
  const nx = compact ? 128 : 186, nz = compact ? 82 : 116
  const vertices: number[] = [], colors: number[] = [], indices: number[] = []
  for (let j = 0; j <= nz; j++) {
    for (let i = 0; i <= nx; i++) {
      const [x, z] = mapPoint(i / nx * 2 - 1, j / nz * 2 - 1)
      const y = terrainHeight(x, z)
      vertices.push(x, y, z)
      landColor(x, y, z).toArray(colors, colors.length)
      if (i < nx && j < nz) {
        const a = j * (nx + 1) + i, b = a + nx + 1
        indices.push(a, b, a + 1, a + 1, b, b + 1)
      }
    }
  }
  const perimeter = [
    ...Array.from({ length: nx }, (_, i) => i),
    ...Array.from({ length: nz }, (_, j) => j * (nx + 1) + nx),
    ...Array.from({ length: nx }, (_, i) => nz * (nx + 1) + nx - i),
    ...Array.from({ length: nz }, (_, j) => (nz - j) * (nx + 1)),
  ]
  const wall: number[] = [], wallColors: number[] = [], wallIndices: number[] = []
  const layers = ['#696144', '#7b6747', '#6b573d', '#87704e', '#554730', '#554c39']
  perimeter.forEach((vertex, i) => {
    const x = vertices[3 * vertex], y = vertices[3 * vertex + 1], z = vertices[3 * vertex + 2]
    layers.forEach((shade, layer) => {
      const depth = layer / (layers.length - 1)
      const seam = Math.sin(i * 0.54 + layer) * 0.5 + Math.sin(i * 1.72) * 0.23
      const scale = 1 + Math.sin(depth * Math.PI) * (0.012 + seam * 0.013) - depth * 0.015
      wall.push(x * scale, mix(y, sideBottom, depth) + Math.sin(depth * Math.PI) * seam, z * scale)
      new Color(shade).multiplyScalar(0.8 + 0.35 * noise(i * 0.77, layer * 0.6)).toArray(wallColors, wallColors.length)
      if (layer < layers.length - 1) {
        const a = i * layers.length + layer
        const b = ((i + 1) % perimeter.length) * layers.length + layer
        wallIndices.push(a, b, a + 1, b, b + 1, a + 1)
      }
    })
  })
  return { surface: geometry(vertices, colors, indices), wall: geometry(wall, wallColors, wallIndices) }
}

export function makeWater(west: boolean) {
  const points: number[] = [], colors: number[] = [], indices: number[] = []
  const shades = ['#586f68', '#577d79', '#3d6c72', '#5a8179', '#697f72'].map(shade => new Color(shade))
  for (let i = 0; i <= 164; i++) {
    const t = i / 164
    const axis = west ? mix(-56.7, -11.4, t) : mix(-34.3, 34.2, t)
    const spread = west ? westRiverWidth(axis) : riverWidth(axis)
    for (let j = 0; j < shades.length; j++) {
      const offset = (j / (shades.length - 1) - 0.5) * spread * 1.16
      const x = west ? axis : riverX(axis) + offset
      const z = west ? westRiverZ(axis) + offset : axis
      points.push(x, 0.41 + 0.016 * Math.sin(t * 140 + j), z)
      shades[j].clone().multiplyScalar(mix(0.86, 1.16, noise(t * 120, j))).toArray(colors, colors.length)
      if (i < 164 && j < shades.length - 1) {
        const a = i * shades.length + j, b = a + shades.length
        indices.push(a, b, a + 1, a + 1, b, b + 1)
      }
    }
  }
  return geometry(points, colors, indices)
}

export function withinLand(x: number, z: number, margin = 1) {
  const u = x / (width / 2), v = z / (depth / 2)
  const [edgeX] = mapPoint(Math.sign(u), clamp(v, -1, 1))
  const [, edgeZ] = mapPoint(clamp(u, -1, 1), Math.sign(v))
  return Math.abs(x) < Math.abs(edgeX) - margin && Math.abs(z) < Math.abs(edgeZ) - margin
}
