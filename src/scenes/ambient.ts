import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

export function useAmbientFrames(enabled: boolean) {
  const invalidate = useThree(state => state.invalidate)
  useEffect(() => {
    if (!enabled) return
    let timer = 0
    const update = () => {
      window.clearInterval(timer)
      if (document.hidden) return
      invalidate()
      timer = window.setInterval(invalidate, 85)
    }
    update()
    document.addEventListener('visibilitychange', update)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', update)
    }
  }, [enabled, invalidate])
}
