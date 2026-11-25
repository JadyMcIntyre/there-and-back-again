import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { z } from 'zod'
import { enhancedEdition, hobbit } from './hobbit'
import { at, positionSchema, type Position } from './schema'
import { chapterRange, completeEvent, eventsForChapter } from './reading'
import { comparePosition, visibleAtlas } from './spoilers'
import { discoveryEntries, newlyVisible } from './discoveries'

type ReadingProgress = {
  edition: string
  position: Position
  pdfPage: number
}

export const initialProgress: ReadingProgress = {
  edition: enhancedEdition.id,
  position: at(8),
  pdfPage: 113,
}

const bookmarkSchema = z.object({
  edition: z.literal(enhancedEdition.id),
  position: positionSchema,
  pdfPage: z.number().int().positive(),
})

export function validatedBookmark(state: unknown): ReadingProgress | undefined {
  const parsed = bookmarkSchema.safeParse(state)
  if (!parsed.success) return undefined
  const { position, pdfPage } = parsed.data
  const { first, last } = chapterRange(position.chapter)
  const events = eventsForChapter(position.chapter)
  const allowed = [0, ...events.map(event => event.reveal.event), completeEvent]
  if (!first || !allowed.includes(position.event) || pdfPage < first || pdfPage > last) return undefined
  return parsed.data
}

const keeps = (entries: string[], atlas: ReturnType<typeof visibleAtlas>) => {
  const ids = new Set(discoveryEntries(atlas).map(entry => entry.id))
  return [...new Set(entries)].filter(id => ids.has(id))
}

export const useProgress = create<{
  bookmark: ReadingProgress
  newDiscoveries: string[]
  saveBookmark: (bookmark: ReadingProgress, confirmed?: boolean) => boolean
  acknowledge: () => void
}>()(persist(
  (set, get) => ({
    bookmark: initialProgress,
    newDiscoveries: [],
    acknowledge: () => set({ newDiscoveries: [] }),
    saveBookmark(request, confirmed = false) {
      const bookmark = validatedBookmark(request)
      if (!bookmark) return false
      const state = get()
      const advanced = comparePosition(bookmark.position, state.bookmark.position) > 0 || bookmark.pdfPage > state.bookmark.pdfPage
      if (advanced && !confirmed) return false
      const before = visibleAtlas(hobbit, state.bookmark.position)
      const after = visibleAtlas(hobbit, bookmark.position)
      set({ bookmark, newDiscoveries: keeps([...state.newDiscoveries, ...newlyVisible(before, after)], after) })
      return true
    },
  }),
  {
    name: 'there-and-back-again:reading',
    version: 1,
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({ bookmark: state.bookmark, newDiscoveries: state.newDiscoveries }),
    merge: (stored, current) => {
      const data = stored as { bookmark?: unknown, newDiscoveries?: unknown } | undefined
      const bookmark = validatedBookmark(data?.bookmark) ?? initialProgress
      const flagged = z.array(z.string()).safeParse(data?.newDiscoveries)
      return { ...current, bookmark, newDiscoveries: keeps(flagged.data ?? [], visibleAtlas(hobbit, bookmark.position)) }
    },
  },
))
