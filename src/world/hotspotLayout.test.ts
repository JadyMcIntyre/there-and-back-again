import { describe, expect, it } from 'vitest'
import { labelHasRoom, placeHotspotLabel } from './hotspotLayout'

describe('projected hotspot labels', () => {
  it('places the tooltip on the opposite side near the right edge', () => {
    const result = placeHotspotLabel({ x: 375, y: 40 }, 'Bag End', 390)
    expect(result.flip).toBe(true)
    expect(result.box.right).toBeLessThan(375)
  })

  it('reserves neighbouring dots and previously laid-out labels', () => {
    const { box } = placeHotspotLabel({ x: 190, y: 120 }, 'Bag End', 390)
    expect(labelHasRoom(box, [{ x: 244, y: 126 }], [])).toBe(false)
    expect(labelHasRoom(box, [], [{ left: 180, right: 230, y: 114 }])).toBe(false)
    expect(labelHasRoom(box, [{ x: 244, y: 169 }], [{ left: 22, right: 84, y: 120 }])).toBe(true)
  })
})
