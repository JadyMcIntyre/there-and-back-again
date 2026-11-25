import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { z } from 'zod'
import { enhancedEdition, hobbit } from './hobbit'
import { at, positionSchema, type Position } from './schema'

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

function validBookmark(state: unknown): ReadingProgress {
  const parsed = bookmarkSchema.safeParse(state)
  if (!parsed.success) return initialProgress
  const { position, pdfPage } = parsed.data
  const chapter = hobbit.chapters.find(entry => entry.number === position.chapter)
  const start = enhancedEdition.chapterStarts[position.chapter]
  const end = enhancedEdition.chapterStarts[position.chapter + 1] ?? start + 1
  const allowedEvents = chapter ? [0, ...chapter.milestones.map(event => event.reveal.event), chapter.completionEvent] : []
  if (!allowedEvents.includes(position.event) || pdfPage < start || pdfPage >= end) return initialProgress
  return parsed.data
}

export const useProgress = create<{
  bookmark: ReadingProgress
  saveBookmark: (bookmark: ReadingProgress) => void
}>()(persist(
  (set) => ({ bookmark: initialProgress, saveBookmark: (bookmark) => set({ bookmark: validBookmark(bookmark) }) }),
  {
    name: 'there-and-back-again:reading',
    version: 1,
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({ bookmark: state.bookmark }),
    merge: (stored, current) => ({
      ...current,
      bookmark: validBookmark((stored as { bookmark?: unknown } | undefined)?.bookmark),
    }),
  },
))
