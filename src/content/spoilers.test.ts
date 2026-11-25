import { describe, expect, it } from 'vitest'
import { hobbit } from './hobbit'
import { at, type Book } from './schema'
import { chapterPlace, historicalPosition, resolveDestination, visibleAtlas } from './spoilers'

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
    expect(atlas.routes.map(route => route.id)).toEqual(['bywater-road', 'west-road', 'to-hoard', 'valley-road'])
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
    expect(atlas.routes.every(route => route.reveal.chapter < 8)).toBe(true)
    expect(atlas.search('sealed')).toEqual([])
  })
  it('ranks exact names before prefixes, partial names and contextual matches', () => {
    const atlas = visibleAtlas(hobbit, at(8))
    expect(atlas.search('Bilbo')[0].id).toBe('bilbo')
    expect(atlas.search('Bilbo Baggins')[0].id).toBe('bilbo')
    expect(atlas.search('rivend')[0].id).toBe('rivendell')
    expect(atlas.search('Orcrist')[0].id).toBe('orcrist')
    expect(visibleAtlas(hobbit, at(3, 1)).search('Orcrist')).toEqual([])
    expect(visibleAtlas(hobbit, at(3, 3)).search('Beater')).toEqual([])
    expect(atlas.search('Gondolin')[0].id).toBe('gondolin')
    expect(atlas.landmarks.some(place => place.id === 'gondolin')).toBe(false)
    expect(resolveDestination('#/journal/gondolin', atlas).id).toBe('gondolin')
    expect(atlas.search('window')).toEqual([])
    expect(atlas.search('moon letters').map(item => item.id)).toContain('thror-map')
  })

  it('filters relationships and facts separately from their entries', () => {
    const discovered = visibleAtlas(hobbit, at(5, 1))
    const late = visibleAtlas(hobbit, at(5, 2))
    expect(discovered.exhibits.find(item => item.id === 'plain-ring')?.facts.map(fact => fact.id)).toEqual(['floor'])
    expect(discovered.exhibits.find(item => item.id === 'plain-ring')?.links.map(link => link.target)).toEqual(['bilbo'])
    expect(discovered.search('wearer')).toEqual([])
    expect(discovered.search('Gollum')).toEqual([])
    expect(late.exhibits.find(item => item.id === 'plain-ring')?.links.map(link => link.target)).toEqual(['bilbo', 'gollum'])
    expect(late.search('wearer')[0].id).toBe('plain-ring')
  })

  it('limits URL history and chooses only visible locations and completed recaps', () => {
    const { chapters } = visibleAtlas(hobbit, at(8))
    const inHistory = historicalPosition('#/atlas/beorn?chapter=3', at(8), chapters)
    expect(inHistory).toEqual(at(3, 3))
    const history = visibleAtlas(hobbit, at(8), inHistory)
    expect(chapterPlace(history, inHistory!)).toBe('rivendell')
    expect(resolveDestination('#/atlas/beorn?chapter=3', history).id).toBeUndefined()
    expect(resolveDestination('#/journal/chapter-3?chapter=3', history).id).toBe('chapter-3')
    expect(resolveDestination('#/journal/chapter-7?chapter=3', history).id).toBeUndefined()
    expect(historicalPosition('#/atlas?chapter=9', at(8), chapters)).toBeUndefined()
    expect(chapterPlace(visibleAtlas(hobbit, at(7, 1)), at(7, 1))).toBe('beorn')
  })

  it('keeps the whole catalogue within the verified source boundary and resolves its links', () => {
    const atlas = visibleAtlas(hobbit, at(8))
    expect(atlas.exhibits).toHaveLength(hobbit.exhibits.length)
    const visibleItems = [...atlas.exhibits, ...atlas.locations]
    expect(new Set(visibleItems.map(item => item.id)).size).toBe(visibleItems.length)
    expect(visibleItems.every(item => item.facts.every(fact => fact.pages && fact.pages[1] < 113))).toBe(true)
    expect(atlas.chapters.filter(chapter => chapter.recap)).toHaveLength(7)
    for (const item of [...hobbit.exhibits, ...hobbit.landmarks]) {
      expect(item.links?.every(link => visibleItems.some(target => target.id === link.target)) ?? true).toBe(true)
    }
  })
})
