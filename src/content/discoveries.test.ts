import { describe, expect, it } from 'vitest'
import { discoveryCounts, newlyVisible } from './discoveries'
import { enhancedEdition, hobbit } from './hobbit'
import { initialProgress, useProgress, validatedBookmark } from './progress'
import { chapterNumbers, chapterRange, chapterSlots } from './reading'
import { at, type Book } from './schema'
import { historicalPosition, resolveDestination, visibleAtlas } from './spoilers'

describe('reading knowledge and discovery', () => {
  it('keeps the journal and search at the bookmark while the world looks back', () => {
    const bookmark = at(8)
    const knowledge = visibleAtlas(hobbit, bookmark)
    const world = visibleAtlas(hobbit, bookmark, at(1, 3))
    expect(world.routes).toHaveLength(0)
    expect(knowledge.search('Beorn')[0].id).toBe('beorn-character')
    expect(knowledge.search('Gollum')[0].id).toBe('gollum')
    expect(resolveDestination('#/journal/gollum?chapter=1', world, knowledge).id).toBe('gollum')
    expect(resolveDestination('#/atlas/beorn?chapter=1', world, knowledge).id).toBeUndefined()
    expect(discoveryCounts(knowledge).characters).toBeGreaterThan(discoveryCounts(world).characters)
  })

  it('gates an interior and its exhibits at the smallest authored reveal', () => {
    const opening = visibleAtlas(hobbit, at(1))
    const morning = visibleAtlas(hobbit, at(1, 1))
    const supper = visibleAtlas(hobbit, at(1, 2))
    expect(resolveDestination('#/scene/bag-end-interior', opening).view).toBe('atlas')
    expect(resolveDestination('#/scene/bag-end-interior', morning).id).toBe('bag-end-interior')
    expect(morning.exhibits.some(item => item.id === 'thror-map')).toBe(false)
    expect(supper.exhibits.some(item => item.id === 'thror-map')).toBe(true)
    const actual = at(8)
    const chapters = visibleAtlas(hobbit, actual).chapters
    expect(historicalPosition('#/scene/bag-end-interior?chapter=1&event=1', actual, chapters)).toEqual(at(1, 1))
    expect(historicalPosition('#/scene/bag-end-interior?chapter=8&event=1', actual, chapters)).toBeUndefined()
  })

  it('models advance, rewind and mention-only states without leaking concealed metadata', () => {
    const novel: Book = {
      ...hobbit,
      landmarks: [...hobbit.landmarks, {
        id: 'sealed-fixture', name: 'Private fixture name', region: 'Fixture', reveal: at(9),
        encounter: at(10, 1), point: [32, 4], facts: [{ id: 'fixture', reveal: at(9), text: 'Private fixture fact' }],
      }],
    }
    const locked = visibleAtlas(novel, at(8))
    const mentioned = visibleAtlas(novel, at(9))
    expect(locked.search('Private fixture')).toEqual([])
    expect(JSON.stringify(locked)).not.toContain('Private fixture')
    expect(newlyVisible(locked, mentioned)).toEqual(['sealed-fixture'])
    expect(mentioned.locations.at(-1)?.discovery).toBe('mentioned')
    expect(mentioned.locations.at(-1)?.point).toBeUndefined()
    expect(visibleAtlas(novel, at(10, 1)).locations.at(-1)?.discovery).toBe('encountered')
    expect(newlyVisible(mentioned, locked)).toEqual([])
  })

  it('exposes nineteen chapter slots and validates exact page ranges', () => {
    expect(chapterNumbers).toHaveLength(19)
    const knowledge = visibleAtlas(hobbit, at(8))
    const slots = chapterSlots(at(8), knowledge.chapters)
    expect(slots.filter(chapter => chapter.complete)).toHaveLength(7)
    expect(slots.slice(8).every(chapter => !chapter.unlocked && !chapter.title && !chapter.recap)).toBe(true)
    expect(chapterRange(8)).toEqual({ first: 113, last: 129 })
    expect(chapterRange(19)).toEqual({ first: 204, last: 209 })
    expect(validatedBookmark({ edition: enhancedEdition.id, position: at(19, 3), pdfPage: 209 })).toBeDefined()
    expect(validatedBookmark({ edition: enhancedEdition.id, position: at(19, 3), pdfPage: 210 })).toBeUndefined()
  })

  it('requires confirmation for advance, flags only new eligible entries and clears them after rewind', () => {
    const starting = useProgress.getState()
    useProgress.setState({ bookmark: { ...initialProgress, position: at(1), pdfPage: 25 }, newDiscoveries: [] })
    try {
      const advancement = { ...initialProgress, position: at(1, 1), pdfPage: 26 }
      expect(useProgress.getState().saveBookmark(advancement)).toBe(false)
      expect(useProgress.getState().bookmark.position).toEqual(at(1))
      expect(useProgress.getState().saveBookmark(advancement, true)).toBe(true)
      expect(useProgress.getState().newDiscoveries).toContain('bilbo')
      expect(useProgress.getState().newDiscoveries).not.toContain('gollum')
      expect(useProgress.getState().saveBookmark({ ...initialProgress, position: at(1), pdfPage: 25 })).toBe(true)
      expect(useProgress.getState().newDiscoveries).toEqual([])
    } finally { useProgress.setState(starting) }
  })
})
