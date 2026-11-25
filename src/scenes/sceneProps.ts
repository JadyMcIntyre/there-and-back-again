import type { RefObject } from 'react'
import type { Exhibit } from '../content/schema'

export type LocationMode = 'explore' | 'walk' | 'dollhouse'

export type SceneProps = {
  mode: LocationMode
  morning: boolean
  compact: boolean
  portal: RefObject<HTMLDivElement | null>
  exhibits: Exhibit[]
  selected?: string
  select: (id: string) => void
  activate: (id: string) => void
  doorOpen: boolean
  reduced: boolean
  active: boolean
}
