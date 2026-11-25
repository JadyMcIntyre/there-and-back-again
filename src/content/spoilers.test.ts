import { describe, expect, it } from 'vitest'
import { hobbit } from './hobbit'
import { at, type Book } from './schema'
import { resolveDestination, visibleAtlas } from './spoilers'

describe('the visible atlas', () => {
  it('gates the first scene and its inhabitants by event', () => {
    const before = visibleAtlas(hobbit, at(1))
    expect(before.landmarks).toEqual([])
    expect(before.exhibits).toEqual([])
    expect(resolveDestination('#/scene/bag-end', before)).toEqual({ view: 'atlas' })
    const after = visibleAtlas(hobbit, at(1, 1))
    expect(resolveDestination('#/scene/bag-end', after)).toEqual({ view: 'scene', id: 'bag-end' })
    expect(after.landmarks[0].facts).toHaveLength(1)
    expect(after.search('unexpected callers')).toEqual([])
    expect(visibleAtlas(hobbit, at(1, 2)).search('unexpected callers')[0].id).toBe('bag-end')
  })

  it('filters nested facts, recaps, routes, URL lookups and search at historical positions', () => {
    const atlas = visibleAtlas(hobbit, at(8), at(3, 1))
    expect(atlas.chapters.at(-1)?.recap).toBeUndefined()
    expect(atlas.search('beorn')).toEqual([])
    expect(atlas.search('rivendell').map(item => item.id)).toContain('rivendell')
    expect(atlas.routes.map(route => route.id)).toEqual(['west-road', 'valley-road'])
    expect(resolveDestination('#/atlas/beorn', atlas)).toEqual({ view: 'atlas', id: undefined })
    expect(resolveDestination('#/journal/beorn-character', atlas)).toEqual({ view: 'journal', id: undefined })
  })

  it('never lets a URL or exploration position expand the actual bookmark', () => {
    expect(resolveDestination('#/scene/bag-end/extra', visibleAtlas(hobbit, at(8)))).toEqual({ view: 'atlas' })
    expect(visibleAtlas(hobbit, at(2), at(8)).landmarks.map(point => point.id)).toEqual(['bag-end'])
  })

  it('permits the Chapter VIII heading while concealing all later facts and annotations', () => {
    const futureBook: Book = {
      ...hobbit,
      landmarks: [...hobbit.landmarks, {
        id: 'sealed-place', name: 'Sealed place', region: 'Fixture', point: [0, 0],
        reveal: at(8, 1), facts: [],
      }],
    }
    const atlas = visibleAtlas(futureBook, at(8))
    expect(atlas.chapters.at(-1)).toMatchObject({ number: 8, milestones: [], recap: undefined })
    expect(atlas.routes).toHaveLength(7)
    expect(atlas.search('sealed')).toEqual([])
  })
})
