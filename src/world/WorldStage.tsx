import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import type { Atlas } from '../content/spoilers'
import { preloadScene, scenes, type SceneId } from '../scenes/registry'
import { markerPosition } from './AtlasWorld'
import type { CameraHandle, CameraPose } from './CameraRig'
import Viewport, { CameraButtons, useMedia } from './Viewport'

export type World = 'atlas' | SceneId
type Phase = 'idle' | 'approach' | 'return' | 'dissolve'

function nextFrame(signal: AbortSignal) {
  return new Promise<void>(resolve => {
    const frame = requestAnimationFrame(done)
    function done() {
      cancelAnimationFrame(frame)
      signal.removeEventListener('abort', done)
      resolve()
    }
    if (signal.aborted) done()
    else signal.addEventListener('abort', done, { once: true })
  })
}

async function until(ready: () => boolean, signal: AbortSignal) {
  while (!signal.aborted && !ready()) await nextFrame(signal)
  return !signal.aborted
}

export default function WorldStage({ desired, atlas, selected, select, inspect, exhibit, doorOpen, focus, panelOpen,
  atlasPose, cancel, children }: {
  desired: World
  atlas: Atlas
  selected?: string
  select: (id: string) => void
  inspect: (id: string) => void
  exhibit?: string
  doorOpen: boolean
  focus?: { id: string, time: number }
  panelOpen: boolean
  atlasPose: RefObject<CameraPose | undefined>
  cancel: () => void
  children: (shown: World, phase: Phase) => ReactNode
}) {
  const [shown, setShown] = useState<World>(desired)
  const [phase, setPhase] = useState<Phase>('idle')
  const [error, setError] = useState(false)
  const [drawn, setDrawn] = useState(false)
  const map = useRef<CameraHandle>(null)
  const scene = useRef<CameraHandle>(null)
  const ready = useRef<Partial<Record<World, boolean>>>({})
  const failed = useRef<Partial<Record<World, boolean>>>({})
  const restoreOnCancel = useRef(false)
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const front = shown !== 'atlas' && !atlas.landmarks.some(place => place.scene?.id === shown) ? 'atlas' : shown
  const incoming = desired === front ? undefined : desired
  const camera = front === 'atlas' ? map : scene
  const targetPlace = incoming && incoming !== 'atlas' ? atlas.landmarks.find(place => place.scene?.id === incoming) : undefined
  const focusPlace = focus && atlas.landmarks.find(place => place.id === focus.id)
  const focusPoint = useMemo(() => focusPlace && markerPosition(focusPlace), [focusPlace])
  const focusTime = focus?.time
  const lastFocus = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (shown !== front) setShown(front)
    if (!incoming) {
      setPhase('idle')
      if (front === 'atlas' && restoreOnCancel.current && atlasPose.current) {
        void map.current?.restore(atlasPose.current)
        restoreOnCancel.current = false
      }
      return
    }
    const controller = new AbortController()
    const { signal } = controller
    ready.current[incoming] = false
    failed.current[incoming] = false
    setError(false)
    setPhase(front === 'atlas' ? 'approach' : 'return')

    async function travel(target: World) {
      const deadline = performance.now() + 12_000
      if (target !== 'atlas') void preloadScene(target).catch(() => { failed.current[target] = true })
      if (!await until(() => !!camera.current || !!failed.current[front] || performance.now() >= deadline, signal)) return
      if (front === 'atlas' && map.current && !restoreOnCancel.current) {
        atlasPose.current = map.current.capture()
        restoreOnCancel.current = true
      }
      const approach = targetPlace && map.current ? map.current.focus(markerPosition(targetPlace), true, signal)
        : scene.current?.move('pull-back', signal)
      await Promise.all([
        approach,
        until(() => !!ready.current[target] || !!failed.current[target] || performance.now() >= deadline, signal),
      ])
      if (signal.aborted) return
      if (!ready.current[target]) {
        setError(true)
        cancel()
        return
      }
      setPhase('dissolve')
      const settle = target !== 'atlas' ? scene.current?.move('settle', signal) : undefined
      if (!reduced) {
        const fadeEnd = performance.now() + 370
        if (!await until(() => performance.now() >= fadeEnd, signal)) return
      }
      await settle
      if (signal.aborted) return
      restoreOnCancel.current = false
      setShown(target)
      setPhase('idle')
    }
    void travel(incoming)
    return () => controller.abort()
  }, [atlasPose, camera, cancel, front, incoming, reduced, shown, targetPlace])

  useEffect(() => {
    if (incoming || front !== 'atlas' || !drawn || focusTime === undefined || focusTime === lastFocus.current
      || !focusPoint || !map.current) return
    lastFocus.current = focusTime
    const controller = new AbortController()
    void map.current.focus(focusPoint, false, controller.signal)
    return () => controller.abort()
  }, [drawn, focusPoint, focusTime, front, incoming])

  function layer(id: World) {
    const isScene = id !== 'atlas'
    const foreground = id === front
    const visible = foreground || phase === 'dissolve'
    const landmark = isScene ? atlas.landmarks.find(place => place.scene?.id === id) : undefined
    const exhibits = landmark && isScene
      ? atlas.exhibits.filter(item => item.location === landmark.id && scenes[id].exhibits.includes(item.id)) : []
    return <div key={id} className={`world-layer ${visible ? 'world-visible' : ''} ${foreground ? 'world-front' : 'world-incoming'}`}
      aria-hidden={!foreground || undefined} inert={!foreground || undefined} data-world={id}>
      <Viewport atlas={atlas} selected={selected} select={select} scene={isScene ? id : undefined}
        exhibits={exhibits} inspect={inspect} exhibit={exhibit} doorOpen={doorOpen}
        camera={isScene ? scene : map} initial={isScene ? undefined : atlasPose.current}
        arriving={isScene && !foreground} locked={!!incoming || !foreground} reduced={reduced} panelOpen={panelOpen}
        ready={() => { ready.current[id] = true; setDrawn(true) }}
        fail={() => { failed.current[id] = true; setDrawn(true) }} />
    </div>
  }

  return <div className="world-stage" data-transition={phase} data-active-world={front}>
    {layer(front)}
    {incoming && layer(incoming)}
    {!drawn && <p className="view-status" role="status">Drawing the atlas…</p>}
    {phase !== 'idle' && <p className="travel-status" role="status">{desired === 'atlas' ? 'Returning to the atlas' : 'Approaching Bag End'}</p>}
    {error && phase === 'idle' && <p className="travel-status" role="status">The diorama could not be loaded.</p>}
    {phase === 'idle' && <CameraButtons camera={camera} />}
    {children(front, phase)}
  </div>
}
