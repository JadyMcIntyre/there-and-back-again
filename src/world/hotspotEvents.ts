import type { ThreeEvent } from '@react-three/fiber'

export function hotspotClick(event: ThreeEvent<MouseEvent>, run: () => void) {
  if (event.delta > 5 || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
  event.stopPropagation()
  run()
}
