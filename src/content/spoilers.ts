import type { Book, Position } from './schema'

export const comparePosition = (a: Position, b: Position) => a.chapter - b.chapter || a.event - b.event
const earlier = (a: Position, b: Position) => comparePosition(a, b) <= 0 ? a : b
const normalize = (value: string) => value.normalize('NFD').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()

export function visibleAtlas(book: Book, progress: Position, exploration?: Position) {
  const cutoff = exploration ? earlier(progress, exploration) : progress
  const known = <T extends { reveal: Position }>(item: T) => comparePosition(item.reveal, cutoff) <= 0
  const landmarks = book.landmarks.filter(known).map(({ facts, scene, ...landmark }) => ({
    ...landmark, facts: facts.filter(known), scene: scene && known(scene) ? scene : undefined,
  }))
  const exhibits = book.exhibits.filter(item => known(item) && landmarks.some(place => place.id === item.location))
    .map(({ facts, ...item }) => ({ ...item, facts: facts.filter(known) }))
  const chapters = book.chapters.filter(known).map(({ milestones, recap, ...chapter }) => ({
    ...chapter, milestones: milestones.filter(known), recap: recap && known(recap) ? recap : undefined,
  }))

  return {
    landmarks, exhibits, chapters, routes: book.routes.filter(known),
    search(query: string) {
      const normalized = normalize(query)
      if (!normalized) return []
      return [...landmarks, ...exhibits].filter(item =>
        normalized.split(' ').every(word => normalize([item.name,
          'region' in item ? item.region : item.subtitle,
          ...item.facts.map(fact => fact.text),
        ].join(' ')).includes(word)),
      )
    },
  }
}

export type Atlas = ReturnType<typeof visibleAtlas>

export type Destination = { view: 'atlas' | 'scene' | 'journal', id?: string }

export function resolveDestination(hash: string, atlas: Atlas): Destination {
  const match = /^#\/(atlas|scene|journal)(?:\/([a-z0-9-]+))?$/.exec(hash)
  if (!match) return { view: 'atlas' }
  const [, view, id] = match
  if (view === 'scene') return atlas.landmarks.some(place => place.scene?.id === id) ? { view, id } : { view: 'atlas' }
  if (view === 'journal') return { view, id: atlas.exhibits.find(item => item.id === id)?.id }
  return { view: 'atlas', id: atlas.landmarks.find(place => place.id === id)?.id }
}
