import { z } from 'zod'

export const positionSchema = z.object({
  chapter: z.number().int().min(1),
  event: z.number().int().min(0),
})
export type Position = z.infer<typeof positionSchema>
export const at = (chapter: number, event = 0): Position => ({ chapter, event })

const entry = z.object({ id: z.string().regex(/^[a-z0-9-]+$/), reveal: positionSchema })
const fact = entry.extend({ text: z.string().min(1) })
const coordinate = z.tuple([z.number(), z.number()])
const landmark = entry.extend({
  name: z.string(),
  region: z.string(),
  point: coordinate,
  facts: z.array(fact).min(1),
  scene: entry.optional(),
})
const exhibit = entry.extend({
  name: z.string(),
  kind: z.enum(['character', 'object']),
  subtitle: z.string(),
  location: z.string(),
  facts: z.array(fact).min(1),
})
const route = entry.extend({ points: z.array(coordinate).min(2) })
const chapter = z.object({
  number: z.number().int().positive(),
  title: z.string(),
  reveal: positionSchema,
  completionEvent: z.number().int().positive().optional(),
  milestones: z.array(entry.extend({ label: z.string() })),
  recap: fact.optional(),
})
export const bookSchema = z.object({
  id: z.string(),
  title: z.string(),
  chapters: z.array(chapter).min(1),
  landmarks: z.array(landmark),
  routes: z.array(route),
  exhibits: z.array(exhibit),
})
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
  chapterStarts: z.record(z.coerce.number().int().positive(), z.number().int().positive()),
})
