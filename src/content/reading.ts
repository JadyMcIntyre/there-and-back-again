import { enhancedEdition, hobbit } from './hobbit'
import { at, type Position } from './schema'
import type { Atlas } from './spoilers'

export const completeEvent = 3
export const chapterNumbers = Object.keys(enhancedEdition.chapterStarts).map(Number)

export function chapterRange(chapter: number) {
  const first = enhancedEdition.chapterStarts[chapter]
  const last = (enhancedEdition.chapterStarts[chapter + 1] ?? enhancedEdition.storyEndPage + 1) - 1
  return { first, last }
}

export function chapterSlots(progress: Position, chapters: Atlas['chapters']) {
  return chapterNumbers.map(number => {
    const entry = chapters.find(chapter => chapter.number === number)
    const unlocked = number <= progress.chapter
    const completion = entry?.completionEvent ?? completeEvent
    return {
      number, title: unlocked ? entry?.title : undefined, unlocked,
      complete: number < progress.chapter || number === progress.chapter && progress.event >= completion,
      target: number === progress.chapter ? progress : at(number, completion),
      recap: unlocked ? entry?.recap : undefined,
    }
  })
}

export function eventsForChapter(number: number) {
  const chapter = hobbit.chapters.find(entry => entry.number === number)
  return [...(chapter?.milestones ?? [])]
}
