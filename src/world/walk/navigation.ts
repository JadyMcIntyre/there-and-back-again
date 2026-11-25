export type GroundPoint = { x: number, z: number }
export type Bounds = { minX: number, maxX: number, minZ: number, maxZ: number }
export type Obstacle = Bounds | (GroundPoint & { radius: number })
export type WalkPlan = {
  spawn: GroundPoint & { yaw: number }
  bounds: Bounds
  floor: (x: number, z: number) => number
  obstacles: readonly Obstacle[]
  exhibitObstacles?: Record<string, Obstacle>
  closedDoor?: Bounds
  portal?: Bounds
  portalRequiresOpenDoor?: boolean
}

export const eyeHeight = 1.46
const bodyRadius = .23
const maxStep = .23

export function within(point: GroundPoint, bounds: Bounds, margin = 0) {
  return point.x >= bounds.minX + margin && point.x <= bounds.maxX - margin
    && point.z >= bounds.minZ + margin && point.z <= bounds.maxZ - margin
}

function canStand(plan: WalkPlan, point: GroundPoint) {
  if (!within(point, plan.bounds, bodyRadius)) return false
  return plan.obstacles.every(obstacle => {
    if ('radius' in obstacle) return Math.hypot(point.x - obstacle.x, point.z - obstacle.z) >= obstacle.radius + bodyRadius
    return !within(point, obstacle, -bodyRadius)
  })
}

export function direction(forward: number, right: number, yaw: number) {
  const length = Math.max(1, Math.hypot(forward, right))
  const sin = Math.sin(yaw), cos = Math.cos(yaw)
  return { x: (right * cos - forward * sin) / length, z: (-forward * cos - right * sin) / length }
}

export function walkStep(point: GroundPoint, move: GroundPoint, plan: WalkPlan, doorOpen = true) {
  // Check each axis independently so a diagonal step can slide along a wall.
  const pass = (from: GroundPoint, next: GroundPoint) => canStand(plan, next)
    && (doorOpen || !plan.closedDoor || !within(next, plan.closedDoor, -bodyRadius))
    && Math.abs(plan.floor(next.x, next.z) - plan.floor(from.x, from.z)) <= maxStep
  const across = { x: point.x + move.x, z: point.z }
  const next = pass(point, across) ? across : point
  const onward = { x: next.x, z: next.z + move.z }
  return pass(next, onward) ? onward : next
}

export function startPosition(plan: WalkPlan, position?: GroundPoint) {
  return position && canStand(plan, position) ? { x: position.x, z: position.z } : { x: plan.spawn.x, z: plan.spawn.z }
}

export function withExhibitObstacles(plan: WalkPlan, visible: string[]): WalkPlan {
  const obstacles = visible.flatMap(id => {
    const obstacle = plan.exhibitObstacles?.[id]
    return obstacle ? [obstacle] : []
  })
  return { ...plan, obstacles: [...plan.obstacles, ...obstacles] }
}
