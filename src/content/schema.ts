import { z } from 'zod'

export const positionSchema = z.object({
  chapter: z.number().int().min(1),
  event: z.number().int().min(0),
})
export type Position = z.infer<typeof positionSchema>
export const at = (chapter: number, event = 0): Position => ({ chapter, event })

const entry = z.object({ id: z.string().regex(/^[a-z0-9-]+$/), reveal: positionSchema })
const pages = z.tuple([z.number().int().positive(), z.number().int().positive()])
const fact = entry.extend({
  text: z.string().min(1),
  section: z.enum(['Appearance', 'Background', 'Developments']).optional(),
  pages: pages.optional(),
})
const link = entry.extend({ target: z.string(), label: z.string(), pages: pages.optional() })
const alias = entry.extend({ name: z.string(), pages: pages.optional() })
const encounter = positionSchema.nullable()
const scene = entry.extend({ rooms: z.array(entry).optional() })
const coordinate = z.tuple([z.number(), z.number()])
const landmark = entry.extend({
  name: z.string(),
  region: z.string(),
  point: coordinate.optional(),
  facts: z.array(fact).min(1),
  scene: scene.optional(),
  encounter: encounter.optional(),
  links: z.array(link).optional(),
  aliases: z.array(alias).optional(),
})
const exhibit = entry.extend({
  name: z.string(),
  kind: z.enum(['character', 'object']),
  subtitle: z.string(),
  location: z.string(),
  encounter: encounter.optional(),
  facts: z.array(fact).min(1),
  links: z.array(link).optional(),
  aliases: z.array(alias).optional(),
  portrait: entry.extend({ style: z.enum(['hobbit', 'wizard', 'dwarf', 'elf', 'bear', 'eagle', 'shadow', 'dragon', 'troll']) }).optional(),
})
const route = entry.extend({ points: z.array(coordinate).min(2) })
const chapter = z.object({
  number: z.number().int().positive(),
  title: z.string(),
  reveal: positionSchema,
  completionEvent: z.number().int().positive().optional(),
  milestones: z.array(entry.extend({ label: z.string(), focus: link.optional() })),
  focus: link.optional(),
  recap: fact.extend({
    events: z.array(fact).optional(),
    remember: z.array(fact).optional(),
    links: z.array(link).optional(),
  }).optional(),
})
export const bookSchema = z.object({
  id: z.string(),
  title: z.string(),
  chapters: z.array(chapter).min(1),
  landmarks: z.array(landmark),
  routes: z.array(route),
  exhibits: z.array(exhibit),
})
export type Fact = z.infer<typeof fact>
export type EntryLink = z.infer<typeof link>
export type Book = z.infer<typeof bookSchema>
export type Landmark = z.infer<typeof landmark>
export type Exhibit = z.infer<typeof exhibit>
export type Chapter = z.infer<typeof chapter>
export type Coordinate = z.infer<typeof coordinate>
export type Route = z.infer<typeof route>

export const editionSchema = z.object({
  id: z.string(),
  bookId: z.string(),
  name: z.string(),
  storyEndPage: z.number().int().positive(),
  chapterStarts: z.record(z.coerce.number().int().positive(), z.number().int().positive()),
})
