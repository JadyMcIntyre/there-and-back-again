import { at, type Book, type EntryLink, type Position } from './schema'

export const comparePosition = (a: Position, b: Position) => a.chapter - b.chapter || a.event - b.event
const earlier = (a: Position, b: Position) => comparePosition(a, b) <= 0 ? a : b
const normalize = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '')
  .toLowerCase().replace(/['’]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()

export function visibleAtlas(book: Book, progress: Position, exploration?: Position) {
  const cutoff = exploration ? earlier(progress, exploration) : progress
  const known = <T extends { reveal: Position }>(item: T) => comparePosition(item.reveal, cutoff) <= 0
  const visiblePlaces = book.landmarks.filter(known)
  const placeIds = new Set(visiblePlaces.map(place => place.id))
  const visibleExhibits = book.exhibits.filter(item => known(item) && placeIds.has(item.location))
  const visibleIds = new Set([...placeIds, ...visibleExhibits.map(item => item.id)])
  const knownLink = (link: EntryLink) => known(link) && visibleIds.has(link.target)
  const locations = visiblePlaces.map(({ facts, scene, links, aliases, ...landmark }) => ({
    ...landmark, facts: facts.filter(known), links: links?.filter(knownLink) ?? [], aliases: aliases?.filter(known) ?? [],
    scene: scene && known(scene) ? scene : undefined,
  }))
  const landmarks = locations.flatMap(place => place.point ? [{ ...place, point: place.point }] : [])
  const exhibits = visibleExhibits.map(({ facts, links, portrait, aliases, ...item }) => ({
    ...item, facts: facts.filter(known), links: links?.filter(knownLink) ?? [], aliases: aliases?.filter(known) ?? [],
    portrait: portrait && known(portrait) ? portrait : undefined,
  }))
  const chapters = book.chapters.filter(known).map(({ milestones, recap, focus, ...chapter }) => ({
    ...chapter,
    focus: focus && knownLink(focus) ? focus : undefined,
    milestones: milestones.filter(known).map(({ focus: checkpoint, ...milestone }) => ({
      ...milestone, focus: checkpoint && knownLink(checkpoint) ? checkpoint : undefined,
    })),
    recap: recap && known(recap) && chapter.completionEvent !== undefined
      && comparePosition(at(chapter.number, chapter.completionEvent), cutoff) <= 0 ? {
        ...recap, events: recap.events?.filter(known) ?? [], remember: recap.remember?.filter(known) ?? [],
        links: recap.links?.filter(knownLink) ?? [],
      } : undefined,
  }))

  const searchResults = (query: string) => {
    const needle = normalize(query)
    if (!needle) return []
    const words = needle.split(' ')
    return [...locations, ...exhibits].flatMap(item => {
      const names = [item.name, ...item.aliases.map(alias => alias.name)].map(normalize)
      const context = normalize([
        'region' in item ? item.region : item.subtitle,
        ...item.facts.map(fact => fact.text),
      ].join(' '))
      const prefix = names.some(name => name.startsWith(needle) || name.split(' ').some(token => token.startsWith(needle)))
      const partial = names.some(name => words.every(word => name.includes(word)))
      const score = names.includes(needle) ? 0 : prefix ? 1 : partial ? 2
        : words.every(word => `${names.join(' ')} ${context}`.includes(word)) ? 3 : undefined
      return score === undefined ? [] : [{ item, score }]
    }).sort((a, b) => a.score - b.score || a.item.name.localeCompare(b.item.name))
  }

  return { landmarks, locations, exhibits, chapters, routes: book.routes.filter(known), searchResults,
    search: (query: string) => searchResults(query).map(result => result.item),
  }
}

export type Atlas = ReturnType<typeof visibleAtlas>
export type Destination = { view: 'atlas' | 'scene' | 'journal', id?: string }

export function resolveDestination(hash: string, atlas: Atlas): Destination {
  const match = /^#\/(atlas|scene|journal)(?:\/([a-z0-9-]+))?$/.exec(hash.split('?')[0])
  if (!match) return { view: 'atlas' }
  const [, view, id] = match
  if (view === 'scene') return id && atlas.landmarks.some(place => place.scene?.id === id) ? { view, id } : { view: 'atlas' }
  if (view === 'journal') {
    const recap = atlas.chapters.some(chapter => chapter.recap && `chapter-${chapter.number}` === id)
    return { view, id: recap ? id : [...atlas.exhibits, ...atlas.locations].find(item => item.id === id)?.id }
  }
  return { view: 'atlas', id: atlas.landmarks.find(place => place.id === id)?.id }
}

export function historicalPosition(hash: string, actual: Position, chapters: Atlas['chapters']) {
  const requested = new URLSearchParams(hash.split('?')[1]).get('chapter')
  if (!requested || !/^[1-9][0-9]*$/.test(requested)) return undefined
  const chapter = chapters.find(item => item.number === Number(requested))
  if (!chapter || chapter.number >= actual.chapter) return undefined
  return at(chapter.number, chapter.completionEvent ?? 0)
}

export function chapterPlace(atlas: Atlas, position: Position) {
  const chapter = atlas.chapters.find(item => item.number === position.chapter)
  return chapter?.focus?.target ?? chapter?.milestones.at(-1)?.focus?.target ?? atlas.landmarks.at(-1)?.id
}
