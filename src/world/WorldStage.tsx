import { createRef, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Vector3 } from 'three'
import { scenePlace, type Atlas } from '../content/spoilers'
import { preloadScene, scenes, type SceneId } from '../scenes/registry'
import { exteriorAnchors, interiorAnchors } from '../scenes/anchors'
import { markerPosition } from './AtlasWorld'
import type { CameraHandle, CameraPose } from './CameraRig'
import Viewport, { CameraButtons, useMedia } from './Viewport'

export type World = 'atlas' | SceneId
export type WorldShortcuts = { reset: () => void, focus: () => void }

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

export default function WorldStage({ desired, atlas, selected, select, activate, inspect, openExhibit, exhibit, doorOpen, focus, panelOpen, immersive,
  atlasPose, cancel, shortcuts, children }: {
  desired: World
  atlas: Atlas
  selected?: string
  select: (id: string) => void
  activate: (id: string) => void
  openExhibit: (id: string) => void
  shortcuts: RefObject<WorldShortcuts | null>
  inspect: (id: string) => void
  exhibit?: string
  doorOpen: boolean
  focus?: { id: string, time: number }
  panelOpen: boolean
  immersive: boolean
  atlasPose: RefObject<CameraPose | undefined>
  cancel: (world: World) => void
  children: (shown: World, phase: Phase) => ReactNode
}) {
  const [shown, setShown] = useState<World>(desired)
  const [phase, setPhase] = useState<Phase>('idle')
  const [error, setError] = useState(false)
  const [drawn, setDrawn] = useState(false)
  const map = useRef<CameraHandle>(null)
  const sceneCameras = useMemo(() => Object.fromEntries(Object.keys(scenes).map(id => [id, createRef<CameraHandle>()])) as
    Record<SceneId, RefObject<CameraHandle | null>>, [])
  const roomPoses = useRef<Partial<Record<SceneId, CameraPose>>>({})
  const departurePose = useRef<{ world: World, pose: CameraPose } | undefined>(undefined)
  const ready = useRef<Partial<Record<World, boolean>>>({})
  const failed = useRef<Partial<Record<World, boolean>>>({})
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const front = shown !== 'atlas' && !scenePlace(atlas, shown) ? 'atlas' : shown
  const incoming = desired === front ? undefined : desired
  const camera = front === 'atlas' ? map : sceneCameras[front]
  const targetPlace = incoming && incoming !== 'atlas' ? scenePlace(atlas, incoming) : undefined
  const focusPlace = focus && atlas.landmarks.find(place => place.id === focus.id)
  const focusPoint = useMemo(() => focusPlace && markerPosition(focusPlace), [focusPlace])
  const focusTime = focus?.time
  const lastFocus = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (shown !== front) setShown(front)
    if (!incoming) {
      setPhase('idle')
      const departure = departurePose.current
      if (departure?.world !== front || !camera.current) return
      const controller = new AbortController()
      const { signal } = controller
      void camera.current.restore(departure.pose, signal).then(() => {
        if (!signal.aborted) departurePose.current = undefined
      })
      return () => controller.abort()
    }
    const controller = new AbortController()
    const { signal } = controller
    ready.current[incoming] = false
    failed.current[incoming] = false
    setError(false)
    setPhase(front === 'atlas' || incoming === 'bag-end-interior' ? 'approach' : 'return')

    async function travel(target: World) {
      const deadline = performance.now() + 12_000
      if (target !== 'atlas') void preloadScene(target).catch(() => { failed.current[target] = true })
      if (!await until(() => !!camera.current || !!failed.current[front] || performance.now() >= deadline, signal)) return
      if (camera.current && departurePose.current?.world !== front) {
        const pose = camera.current.capture()
        departurePose.current = { world: front, pose }
        if (front === 'atlas') atlasPose.current = pose
        else roomPoses.current[front] = pose
      }
      const approach = front === 'atlas' && targetPlace
        ? camera.current?.focus(markerPosition(targetPlace), true, signal)
        : front === 'bag-end' && target === 'bag-end-interior'
          ? camera.current?.focus(new Vector3(...scenes['bag-end'].doorway), true, signal)
          : camera.current?.move('pull-back', signal)
      await Promise.all([
        approach,
        until(() => !!ready.current[target] || !!failed.current[target] || performance.now() >= deadline, signal),
      ])
      if (signal.aborted) return
      if (!ready.current[target]) {
        setError(true)
        cancel(front)
        return
      }
      setPhase('dissolve')
      const settle = target !== 'atlas' && !roomPoses.current[target]
        ? sceneCameras[target].current?.move('settle', signal) : undefined
      if (!reduced) {
        const fadeEnd = performance.now() + 370
        if (!await until(() => performance.now() >= fadeEnd, signal)) return
      }
      await settle
      if (signal.aborted) return
      departurePose.current = undefined
      if (target === 'atlas') roomPoses.current = {}
      setShown(target)
      setPhase('idle')
    }
    void travel(incoming)
    return () => controller.abort()
  }, [atlasPose, camera, cancel, front, incoming, reduced, sceneCameras, shown, targetPlace])

  useEffect(() => {
    if (incoming || front !== 'atlas' || !drawn || focusTime === undefined || focusTime === lastFocus.current
      || !focusPoint || !map.current) return
    lastFocus.current = focusTime
    const controller = new AbortController()
    void map.current.focus(focusPoint, false, controller.signal)
    return () => controller.abort()
  }, [drawn, focusPoint, focusTime, front, incoming])

  useEffect(() => {
    if (phase !== 'idle' || incoming) return
    shortcuts.current = {
      reset: () => { void camera.current?.move('home') },
      focus: () => {
        if (front === 'atlas') {
          const place = atlas.landmarks.find(place => place.id === selected)
          if (place) void camera.current?.focus(markerPosition(place))
        } else if (exhibit && atlas.exhibits.some(item => item.id === exhibit)) {
          const anchors: Record<string, import('three').Vector3Tuple> = front === 'bag-end' ? exteriorAnchors : interiorAnchors
          const point = anchors[exhibit]
          if (point) void camera.current?.focus(new Vector3(...point))
        }
      },
    }
    return () => { shortcuts.current = null }
  }, [atlas, camera, exhibit, front, incoming, phase, selected, shortcuts])

  function layer(id: World) {
    const isScene = id !== 'atlas'
    const foreground = id === front
    const visible = foreground || phase === 'dissolve'
    const landmark = isScene ? scenePlace(atlas, id) : undefined
    const exhibits = landmark && isScene
      ? atlas.exhibits.filter(item => item.location === landmark.id && scenes[id].exhibits.includes(item.id)) : []
    return <div key={id} className={`world-layer ${visible ? 'world-visible' : ''} ${foreground ? 'world-front' : 'world-incoming'}`}
      aria-hidden={!foreground || undefined} inert={!foreground || undefined} data-world={id}>
      <Viewport atlas={atlas} selected={selected} select={select} activate={activate} scene={isScene ? id : undefined}
        exhibits={exhibits} inspect={inspect} openExhibit={openExhibit} exhibit={exhibit} doorOpen={doorOpen}
        camera={isScene ? sceneCameras[id] : map} initial={isScene ? roomPoses.current[id] : atlasPose.current}
        active={foreground && !incoming} arriving={isScene && !foreground} locked={!!incoming || !foreground} reduced={reduced} panelOpen={panelOpen} immersive={immersive}
        ready={() => { ready.current[id] = true; setDrawn(true) }}
        fail={() => { failed.current[id] = true; setDrawn(true) }} />
    </div>
  }

  return <div className="world-stage" data-transition={phase} data-active-world={front}>
    {layer(front)}
    {incoming && layer(incoming)}
    {!drawn && <p className="view-status" role="status">Drawing the atlas…</p>}
    {phase !== 'idle' && <p className="travel-status" role="status">{desired === 'atlas' ? 'Returning to the atlas' : desired === 'bag-end-interior' ? 'Through the round door' : front === 'atlas' ? 'Approaching Bag End' : 'Returning outside'}</p>}
    {error && phase === 'idle' && <p className="travel-status" role="status">The diorama could not be loaded.</p>}
    {phase === 'idle' && <CameraButtons camera={camera} atlas={front === 'atlas'} />}
    {children(front, phase)}
  </div>
}
