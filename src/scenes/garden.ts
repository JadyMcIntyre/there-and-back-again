import { BufferAttribute, BufferGeometry, Color } from 'three'
import { clamp, grain, mix, noise, random, smooth } from '../world/math'
import type { Plant } from '../world/Brush'

const turf = new Color('#647349')
const grass = new Color('#909751')
const path = new Color('#a69670')
const earth = new Color('#77634a')

export const pathCenter = (z: number) => 0.10 + Math.max(0, z - 2) ** 1.46 * 0.113
export const pathWidth = (z: number) => mix(0.77, 1.27, smooth(1, 7, z))

export function gardenHeight(x: number, z: number) {
  const distance = Math.hypot(x, z * .86)
  const countryside = smooth(10, 23, distance) * (
    .5 + 2.7 * Math.sin(x * .068 + z * .061) + 2.4 * Math.cos(z * .102 - x * .053)
    + 10.5 * Math.exp(-(((x + 29) / 22) ** 2) - ((z + 40) / 27) ** 2)
    + 7.8 * Math.exp(-(((x - 45) / 27) ** 2) - ((z + 32) / 28) ** 2)
    + 5.4 * Math.exp(-(((x + 35) / 30) ** 2) - ((z - 34) / 24) ** 2)
  )
  const hill = 4.9 * Math.exp(-((x / 5.7) ** 2 + ((z + 3.15) / 3.56) ** 2))
  const step = 1 - smooth(-.68, 1.58, z)
  const bed = .04 + (grain(x * .52, z * .48) - .5) * .38
  const threshold = (1-smooth(.78,1.55,Math.abs(x))) * smooth(.75,1.00,z) * (1-smooth(1.06,2.95,z))
  return mix(bed + hill * step + countryside, .58, threshold)
}

function gardenEdge(angle: number) {
  return 1 + .06 * Math.sin(angle * 4 + 1)
}

export function makeGarden(distant = false) {
  const step = distant ? 2 : .20
  const extent = distant ? 132 : 20
  const count = Math.round(2 * extent / step)
  const positions: number[] = [], colors: number[] = [], indices: number[] = [], uv: number[] = []
  for (let row = 0; row <= count; row++) {
    const z = row * step - extent
    for (let col = 0; col <= count; col++) {
      const x = col * step - extent
      const height = gardenHeight(x,z)
      const texture = grain(x*.74,z*.76)
      const color = turf.clone().lerp(grass, smooth(.16,.84,texture))
      color.lerp(earth, smooth(.52,.88,grain(x*.22+6,z*.21))* .22)
      const footpath = z > .78 && z < 18 ? (1 - smooth(pathWidth(z)*.58,pathWidth(z)*1.13,Math.abs(x-pathCenter(z)) + (texture-.5)*.42)) * (1-smooth(12,18,z)) : 0
      color.lerp(path,footpath*.96).multiplyScalar(.90 + .21 * noise(x*3.2,z*3.2))
      if (distant) color.lerp(grass,.26)
      positions.push(x,height,z)
      color.toArray(colors,colors.length)
      uv.push(x*.69,z*.69)
      if (row === count || col === count) continue
      const midX = x + step/2, midZ = z + step/2
      // The render surface is absent inside the lined doorway. The analytic floor remains usable by navigation.
      const hall = !distant && Math.abs(midX) < 1.42 && midZ > -2.85 && midZ < .89
      const centralGarden = distant && Math.abs(midX) < 20 && Math.abs(midZ) < 20
      if (hall || centralGarden) continue
      const a = row * (count+1) + col, b = a+count+1
      indices.push(a,b,a+1,a+1,b,b+1)
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position',new BufferAttribute(new Float32Array(positions),3))
  geometry.setAttribute('color',new BufferAttribute(new Float32Array(colors),3))
  geometry.setAttribute('uv',new BufferAttribute(new Float32Array(uv),2))
  geometry.setIndex(indices)
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
    const x = (rng() - 0.5) * 23, z = (rng() - 0.42) * 19
    const angle = Math.atan2((z + 0.3) / 7.5, x / 10.4)
    const radius = Math.hypot(x / 10.4, (z + 0.3) / 7.5)
    if (radius > gardenEdge(angle) + .24 || Math.abs(x) < 1.48 && z > -3 && z < 1.37) continue
    if (z > 0.52 && Math.abs(x - pathCenter(z)) < pathWidth(z) * (0.84 + rng() * 0.44)) continue
    const patch = grain(x * 0.38, z * 0.52)
    if (rng() > 0.2 + patch * 1.02) continue
    const y = gardenHeight(x, z)
    const stretch = (0.31 + rng() * 1.17) * (0.76 + patch * 0.51)
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
