import { gardenHeight, pathCenter } from './garden'
import type { Obstacle, WalkPlan } from '../world/walk/navigation'

const box = (minX: number, maxX: number, minZ: number, maxZ: number) => ({ minX, maxX, minZ, maxZ })
const cylinder = (x: number, z: number, radius: number): Obstacle => ({ x, z, radius })

export const entrance = { x: 1.52, z: 5.60, floor: .075 }

export const gardenWalk: WalkPlan = {
  spawn: { x: pathCenter(8.2), z: 8.2, yaw: .24 },
  bounds: box(-10.2, 10.3, .76, 12.6),
  floor: (x, z) => gardenHeight(x,z),
  closedDoor: box(-.86,.86,.93,1.25),
  portal: box(-.69, .69, 1.0, 1.38),
  portalRequiresOpenDoor: true,
  exhibitObstacles: { bilbo: cylinder(-2.46,2.42,.37), gandalf: cylinder(2.98,2.85,.39) },
  obstacles: [
    box(-10.2,-.81,-2.0,1.15), box(.81,10.3,-2.0,1.15),
    box(-4.65,-2.49,4.96,5.44), box(-2.5,-1.1,4.98,5.42), box(3.6,5.55,4.96,5.44),
    cylinder(6,4.7,.56), cylinder(7.08,2.43,.47),
    box(-9.8,-8.8,3.6,10.9), box(8.8,10.3,2.0,10.9),
  ],
}

export const roomWalk: WalkPlan = {
  spawn: { x: entrance.x, z: 4.56, yaw: 0 },
  bounds: box(-8.27, 8.18, -4.93, 5.59),
  floor: () => entrance.floor,
  portal: box(.80, 2.23, 5.24, 5.60),
  exhibitObstacles: { thorin: cylinder(4.5,-.84,.37) },
  obstacles: [
    box(-7.34,-2.34,-.53,1.03), box(-6.07,-3.66,-1.46,-.58), box(-6.04,-3.65,1.03,1.78),
    box(-8.31,-6.21,-4.93,-4.25), box(-2.81,-1.08,-4.93,-4.10), box(5.81,8.21,-4.93,-4.01),
    box(-2.19,-.21,1.82,2.99), box(-.41,.98,1.61,2.51),
    box(3.78,6.67,-4.93,-2.73), cylinder(3.74,-.36,.57), cylinder(7.27,.81,.57),
    box(5.88,6.85,1.31,2.21),
    box(-.25,.07,1.05,1.52), box(2.98,3.33,1.05,1.52),
    box(-.22,.14,2.83,5.48), box(2.90,3.26,2.83,5.48),
  ],
}
