import { describe, expect, it } from 'vitest'
import { gardenWalk, roomWalk } from '../../scenes/bagEndPlan'
import { direction, startPosition, walkStep } from './navigation'

describe('scene walking', () => {
  it('normalises diagonal movement and follows the camera heading', () => {
    const diagonal = direction(1,1,.19)
    expect(Math.hypot(diagonal.x,diagonal.z)).toBeCloseTo(1)
    expect(direction(1,0,Math.PI/2).x).toBeCloseTo(-1)
  })

  it('keeps a closed door solid and clears the passage once opened', () => {
    const starting = { x: 0, z: 1.6 }
    expect(walkStep(starting,{ x: 0,z: -.2 },gardenWalk,false)).toEqual(starting)
    expect(walkStep(starting,{ x: 0,z: -.2 },gardenWalk,true).z).toBeCloseTo(1.4)
  })

  it('slides along a furniture boundary and prevents exiting through the walls', () => {
    const point = { x: -2.07,z: .38 }
    const result = walkStep(point,{ x: -.18,z: .10 },roomWalk)
    expect(result.x).toBe(point.x)
    expect(result.z).toBeCloseTo(.48)
    expect(walkStep({ x: 7.91,z: 2.98 },{ x: .12,z: 0 },roomWalk).x).toBe(7.91)
  })

  it('uses a safe entrance when the saved position is obstructed', () => {
    const starting = startPosition(roomWalk,{ x: -4.9,z: .3 })
    expect(starting).toEqual({ x: roomWalk.spawn.x, z: roomWalk.spawn.z })
  })
})
