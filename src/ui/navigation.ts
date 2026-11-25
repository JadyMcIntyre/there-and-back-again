import type { Destination } from '../content/spoilers'
import type { Position } from '../content/schema'

export type LinkTo = (view: Destination['view'], id?: string) => string

export function atlasLink(view: Destination['view'], id?: string, exploration?: Position) {
  return `#/${view}${id ? `/${id}` : ''}${exploration ? `?chapter=${exploration.chapter}` : ''}`
}

export const navigateTo = (hash: string) => { window.location.hash = hash }
