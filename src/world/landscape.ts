import { ConeGeometry, CylinderGeometry, DodecahedronGeometry, type BufferGeometry } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { Plant } from './Brush'
import { forestDensity, terrainHeight, withinLand } from './terrain'
import { grain, random, smooth } from './math'

const firs = ['#294b3e', '#385946', '#486952', '#53705b']
const greens = ['#344d36', '#3f5d43', '#496b50', '#58714b', '#667f54', '#6b7c4c', '#7b854f']
const deciduousGreens = ['#596c42', '#76874b', '#819552', '#a69255', '#9ba45f', '#72865c']

function mergeParts(parts: BufferGeometry[]) {
  const result = mergeGeometries(parts)
  parts.forEach(part => part.dispose())
  return result
}

export function makeTrees() {
  const trunk = new CylinderGeometry(0.078, 0.13, 0.8, 6).translate(0, 0.39, 0)
  const conifer = mergeParts([
    new ConeGeometry(0.62, 1.16, 8).rotateY(0.18).translate(0, 0.91, 0),
    new ConeGeometry(0.49, 1.12, 8).rotateY(0.49).translate(0, 1.22, 0.015),
    new ConeGeometry(0.34, 1.03, 8).translate(0.024, 1.56, 0),
  ])
  const crown = mergeParts([
    new DodecahedronGeometry(0.59, 0).scale(1, 1.13, 0.94).translate(0, 1.03, 0),
    new DodecahedronGeometry(0.39, 0).translate(0.34, 0.82, 0.10),
    new DodecahedronGeometry(0.37, 0).translate(-0.36, 1.02, -0.08),
    new DodecahedronGeometry(0.35, 0).translate(0.04, 0.89, 0.36),
  ])
  return { trunk, conifer, crown }
}

export function plantForests(compact: boolean) {
  const rng = random(6220)
  const pines: Plant[] = [], crowns: Plant[] = [], trunks: Plant[] = [], boulders: Plant[] = []
  const spacing = compact ? 1.19 : 0.91
  for (let z = -37; z < 37; z += spacing) {
    for (let x = -59; x < 60; x += spacing) {
      const dx = x + rng() * spacing, dz = z + rng() * spacing
      if (!withinLand(dx, dz, 0.95)) continue
      const y = terrainHeight(dx, dz)
      const forest = forestDensity(dx, dz)
      const elevationLimit = 9.2 - grain(dx * 0.41, dz * 0.41) * 3.2
      const turn = rng() * Math.PI * 2
      if (y > 1.6 && y < elevationLimit && rng() < forest * 0.85 + 0.022) {
        const height = (0.53 + rng() ** 1.48 * 1.24) * (0.92 + forest * 0.25)
        const width = height * (0.79 + rng() * 0.31)
        const position: Plant['position'] = [dx, y - 0.11, dz]
        const scale: Plant['scale'] = [width, height, width]
        const deciduous = dx < -17 ? 0.7 : dx > 29 ? 0.29 : 0.09
        const leaves = rng() < deciduous ? crowns : pines
        const palette = leaves === crowns ? deciduousGreens : dx > 36 ? firs : greens
        leaves.push({ position, scale, turn, color: palette[Math.floor(rng() * palette.length)] })
        trunks.push({ position, scale, turn, color: '#664c35' })
      } else if (y > 5.4 && y < 16 && rng() < 0.1) {
        const size = 0.22 + rng() * 0.57
        boulders.push({ position: [dx, y - 0.13, dz], scale: [size * 1.2, size * 0.74, size], turn, color: rng() < 0.5 ? '#79786b' : '#959080' })
      }
    }
  }

  const fields: Plant[] = []
  for (let j = 0; j < 5; j++) {
    for (let i = 0; i < 5; i++) {
      const x = -54.2 + i * 1.54, z = 12.3 + j * 1.72
      fields.push({ position: [x, terrainHeight(x, z) + 0.021, z], scale: [0.64, 0.045, 0.74], turn: 0, color: ['#b5a26b','#a49351','#7f884b'][(i + j * 2) % 3] })
    }
  }
  return { pines, crowns, trunks, fields, boulders }
}

