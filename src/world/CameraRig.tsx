import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { MOUSE, TOUCH, OrthographicCamera, PerspectiveCamera, Vector3, type Vector3Tuple } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

export type CameraPose = { position: Vector3Tuple, target: Vector3Tuple, scale: number }
export type CameraAction = 'north' | 'plan' | 'left' | 'right' | 'up' | 'down' | 'home' | 'in' | 'out' | 'rotate' | 'pull-back' | 'settle'
export type CameraHandle = {
  capture: () => CameraPose
  move: (action: CameraAction, signal?: AbortSignal) => Promise<void>
  focus: (point: Vector3, approach?: boolean, signal?: AbortSignal) => Promise<void>
  restore: (pose: CameraPose, signal?: AbortSignal) => Promise<void>
}
export type Composition = {
  eye: Vector3Tuple, center: number, width: number, height: number, orbitLimit?: boolean,
  target?: Vector3Tuple, room?: boolean, countryside?: boolean,
}
export const atlasComposition: Composition = { eye: [16, 92, 115], center: 4.1, width: 136, height: 75 }
export const portraitAtlasComposition: Composition = { eye: [123, 123, 44], center: 4.8, width: 114, height: 97 }

export function CameraRig({ composition, scene, compact, panelOpen, locked, reduced, handle, initial, arriving }: {
  composition: Composition
  scene: boolean
  compact: boolean
  panelOpen: boolean
  locked: boolean
  reduced: boolean
  handle: RefObject<CameraHandle | null>
  initial?: CameraPose
  arriving: boolean
}) {
  const initialPose = useRef(initial)
  const initializedCamera = useRef<OrbitControlsImpl | null>(null)
  const [controls, setControls] = useState<OrbitControlsImpl | null>(null)
  const { camera, size, invalidate } = useThree()
  const perspective = camera instanceof PerspectiveCamera
  const baseZoom = perspective ? (compact ? .84 : 1) : Math.min(
    (size.width - (compact ? (scene ? -65 : 14) : 325)) / composition.width,
    size.height / composition.height,
  )
  const previousZoom = useRef(0)
  const tween = useRef<gsap.core.Tween | null>(null)
  const center = composition.center

  useLayoutEffect(() => {
    if (!controls || !(camera instanceof OrthographicCamera || camera instanceof PerspectiveCamera) || baseZoom <= 0) return
    if (initializedCamera.current !== controls) {
      const pose = initialPose.current ?? { position: composition.eye, target: composition.target ?? [0, center, 0], scale: arriving && !reduced ? 0.90 : 1 }
      controls.target.fromArray(pose.target)
      camera.position.fromArray(pose.position)
      camera.zoom = baseZoom * pose.scale
      initializedCamera.current = controls
    } else if (previousZoom.current) {
      camera.zoom *= baseZoom / previousZoom.current
    }
    previousZoom.current = baseZoom
    const side = compact ? 0 : panelOpen ? (composition.room ? 60 : 145) : 0
    const lift = compact ? (panelOpen ? (scene ? 124 : 80) : 22) : 10
    camera.setViewOffset(size.width, size.height, side, lift, size.width, size.height)
    controls.update()
    invalidate()
  }, [arriving, baseZoom, camera, center, compact, composition, controls, invalidate, panelOpen, reduced, size])

  useLayoutEffect(() => {
    if (!controls) return
    const limit = scene ? 12 : 70
    const roomMin = new Vector3(-7.90,1.48,-4.67), roomMax = new Vector3(7.9,3.93,5.20)
    const gardenMin = new Vector3(-15,1.65,1.88), gardenMax = new Vector3(15,12,29)
    const bound = () => {
      const offset = controls.target.clone()
      controls.target.x = Math.min(limit, Math.max(-limit, controls.target.x))
      controls.target.z = Math.min(limit * .7, Math.max(-limit * .7, controls.target.z))
      controls.target.y = Math.min(scene ? 5 : 27, Math.max(-2, controls.target.y))
      camera.position.add(controls.target).sub(offset)
      if (composition.room) {
        camera.position.clamp(roomMin,roomMax)
        camera.lookAt(controls.target)
      } else if (composition.countryside) {
        camera.position.clamp(gardenMin,gardenMax)
        camera.lookAt(controls.target)
      }
    }
    controls.addEventListener('change', bound)
    return () => controls.removeEventListener('change', bound)
  }, [camera, composition, controls, scene])

  useLayoutEffect(() => {
    if (!controls || !(camera instanceof OrthographicCamera || camera instanceof PerspectiveCamera) || baseZoom <= 0) return
    const capture = (): CameraPose => ({
      position: camera.position.toArray(), target: controls.target.toArray(), scale: camera.zoom / baseZoom,
    })
    const home = new Vector3(...(composition.target ?? [0, center, 0]))
    function apply(target: Vector3, position: Vector3, zoom: number, duration: number, signal?: AbortSignal) {
      if (signal?.aborted) return Promise.resolve()
      tween.current?.kill()
      const lens = camera as OrthographicCamera | PerspectiveCamera
      function draw() {
        lens.updateProjectionMatrix()
        controls!.update()
        invalidate()
      }
      if (reduced) {
        controls!.target.copy(target)
        lens.position.copy(position)
        lens.zoom = zoom
        draw()
        return Promise.resolve()
      }
      const start = { position: lens.position.clone(), target: controls!.target.clone(), zoom: lens.zoom }
      return new Promise<void>(resolve => {
        const frame = { t: 0 }
        function done() {
          signal?.removeEventListener('abort', cancel)
          controls!.removeEventListener('start', cancel)
          resolve()
        }
        const cancel = () => tween.current?.kill()
        tween.current = gsap.to(frame, {
          t: 1, duration, ease: 'power2.inOut',
          onUpdate() {
            lens.position.lerpVectors(start.position, position, frame.t)
            controls!.target.lerpVectors(start.target, target, frame.t)
            lens.zoom = start.zoom + (zoom - start.zoom) * frame.t
            draw()
          },
          onComplete: done,
          onInterrupt: done,
        })
        signal?.addEventListener('abort', cancel, { once: true })
        controls!.addEventListener('start', cancel)
      })
    }

    handle.current = {
      capture,
      restore: (pose, signal) => apply(new Vector3(...pose.target), new Vector3(...pose.position), baseZoom * pose.scale, 0.47, signal),
      focus(point, approach = false, signal) {
        const target = point.clone()
        if (!approach) target.lerp(home, 0.12)
        const offset = camera.position.clone().sub(controls.target)
        if (approach && composition.countryside) offset.set(.17, .16, 3.18)
        else if (perspective && scene) offset.setLength(composition.room ? 4.9 : 9.4)
        const position = target.clone().add(offset)
        const zoom = Math.max(camera.zoom, baseZoom * (perspective ? (approach ? 1.10 : 1.48) : (approach ? 3.45 : 1.8)))
        return apply(target, position, zoom, approach ? 1.0 : 0.8, signal)
      },
      move(action, signal) {
        const position = camera.position.clone()
        const target = controls.target.clone()
        let zoom = camera.zoom
        if (action === 'home') {
          target.copy(home)
          position.fromArray(composition.eye)
          zoom = baseZoom
        } else if (action === 'plan' || action === 'north') {
          target.copy(home)
          position.set(0, action === 'plan' ? 145 : 93, action === 'plan' ? 8 : 116)
          zoom = baseZoom
        } else if (action === 'left' || action === 'right' || action === 'up' || action === 'down') {
          const forward = target.clone().sub(position).setY(0).normalize()
          const right = forward.clone().cross(new Vector3(0, 1, 0))
          const direction = action === 'left' || action === 'right' ? right : forward
          const distance = (action === 'left' || action === 'down' ? -1 : 1) * 52 / camera.zoom * (perspective ? .027 : 1)
          position.addScaledVector(direction, distance)
          target.addScaledVector(direction, distance)
          return apply(target, position, zoom, 0.22, signal)
        } else if (action === 'rotate') {
          position.sub(target).applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 6).add(target)
        } else if (action === 'settle') {
          zoom = baseZoom
        } else if (action === 'pull-back') {
          zoom = Math.max(baseZoom * 0.78, zoom * 0.83)
        } else {
          zoom = Math.max(baseZoom * 0.7, Math.min(baseZoom * (perspective ? 3.1 : 6), zoom * (action === 'in' ? 1.31 : 1 / 1.31)))
        }
        return apply(target, position, zoom, 0.53, signal)
      },
    }
    return () => {
      tween.current?.kill()
      handle.current = null
    }
  }, [baseZoom, camera, center, composition, controls, handle, invalidate, perspective, reduced, scene])

  return <OrbitControls ref={setControls} makeDefault enabled={!locked} enableDamping={!reduced && !locked} dampingFactor={0.13}
    minAzimuthAngle={composition.countryside ? -1.49 : composition.orbitLimit ? -1.12 : undefined} maxAzimuthAngle={composition.countryside ? 1.49 : composition.orbitLimit ? 1.20 : undefined}
    minZoom={baseZoom * 0.7} maxZoom={baseZoom * (scene ? 3.5 : 6)} minDistance={composition.countryside ? 2.5 : composition.room ? 1.6 : undefined} maxDistance={composition.countryside ? 26 : composition.room ? 13 : undefined} minPolarAngle={0.055} maxPolarAngle={composition.room || composition.countryside ? 1.57 : scene ? 1.36 : 1.10}
    rotateSpeed={0.66} panSpeed={0.89} zoomSpeed={0.68}
    touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }}
    mouseButtons={{ LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.PAN, RIGHT: MOUSE.PAN }} />
}
