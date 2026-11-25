import type { RefObject } from 'react'
import type { Exhibit } from '../content/schema'

export type SceneProps = {
  compact: boolean
  portal: RefObject<HTMLDivElement | null>
  exhibits: Exhibit[]
  selected?: string
  select: (id: string) => void
  doorOpen: boolean
  reduced: boolean
  active: boolean
}
