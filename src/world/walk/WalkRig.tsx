import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from 'react'
import { Euler, InstancedMesh, Mesh, Raycaster, Vector3 } from 'three'
import type { CameraHandle, CameraPose } from '../CameraRig'
import type { HotspotEntry } from '../Hotspots'
import { direction, eyeHeight, startPosition, walkStep, within, type WalkPlan } from './navigation'

export type WalkControls = { interact: () => void, captureMouse: () => void }
export type WalkFeedback = { target?: string, locked: boolean, fallback: boolean }

const movementKeys = new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight','ShiftLeft','ShiftRight'])
const interactRange = 3.1
const angleLimit = Math.PI * .46

export function WalkRig({ plan, initial, paused, viewport, handle, controls, report, entries, interact, traverse, doorOpen }: {
  plan: WalkPlan, initial?: CameraPose, paused: boolean, viewport: RefObject<HTMLDivElement | null>,
  handle: RefObject<CameraHandle | null>, controls: RefObject<WalkControls | null>, report: (feedback: WalkFeedback) => void,
  entries: HotspotEntry[], interact: (id: string) => void, traverse?: () => void, doorOpen: boolean,
}) {
  const { camera, gl, invalidate, scene } = useThree()
  const savedDirection = initial && new Vector3(...initial.target).sub(new Vector3(...initial.position))
  const state = useRef({
    point: startPosition(plan, initial && { x: initial.position[0], z: initial.position[2] }),
    yaw: savedDirection ? Math.atan2(-savedDirection.x, -savedDirection.z) : plan.spawn.yaw,
    pitch: savedDirection ? Math.asin(savedDirection.normalize().y) : -.02,
    eye: 0, velocity: { x: 0, z: 0 }, target: undefined as string | undefined,
    held: new Set<string>(), drag: false, dragged: false, locked: false, fallback: false, travelled: false,
  }).current
  const work = useMemo(() => ({ euler: new Euler(0,0,0,'YXZ'), ray: new Raycaster(), aim: new Vector3(), forward: new Vector3(), sample: new Vector3(), blockers: [] as Mesh[], lastScan: -Infinity }), [])
  const latest = useRef({ paused, interact, traverse, report })
  latest.current = { paused, interact, traverse, report }
  const clearMove = () => { state.held.clear(); state.velocity.x = 0; state.velocity.z = 0; state.drag = false }
  const surface = gl.domElement

  useLayoutEffect(() => {
    const place = () => {
      state.eye = plan.floor(state.point.x,state.point.z) + eyeHeight
      camera.position.set(state.point.x,state.eye,state.point.z)
      camera.rotation.set(state.pitch,state.yaw,0,'YXZ')
      camera.zoom = 1
      camera.updateProjectionMatrix()
      invalidate()
    }
    state.point = startPosition(plan,state.point)
    place()
    handle.current = {
      capture() {
        const ahead = camera.getWorldDirection(work.forward).add(camera.position)
        return { position: camera.position.toArray(), target: ahead.toArray(), scale: 1 }
      },
      async focus(point) {
        work.aim.copy(point).sub(camera.position).normalize()
        state.yaw = Math.atan2(-work.aim.x,-work.aim.z)
        state.pitch = Math.max(-angleLimit,Math.min(angleLimit,Math.asin(work.aim.y)))
        invalidate()
      },
      async restore(pose) {
        state.point = startPosition(plan,{ x: pose.position[0], z: pose.position[2] })
        work.aim.fromArray(pose.target).sub(new Vector3(...pose.position)).normalize()
        state.yaw = Math.atan2(-work.aim.x,-work.aim.z)
        state.pitch = Math.asin(work.aim.y)
        state.travelled = false
        place()
      },
      async move(action) {
        if (action !== 'home') return
        clearMove()
        state.point = startPosition(plan)
        state.yaw = plan.spawn.yaw
        state.pitch = -.02
        state.travelled = false
        place()
      },
    }
    return () => { handle.current = null }
  }, [camera, handle, invalidate, plan, state, work])

  useEffect(() => {
    const doc = surface.ownerDocument
    const canUseKeys = () => !latest.current.paused && !doc.hidden
      && (state.locked || doc.activeElement === viewport.current)
    const publish = () => latest.current.report({ target: state.target, locked: state.locked, fallback: state.fallback })
    function release() {
      clearMove()
      if (doc.pointerLockElement === surface) doc.exitPointerLock?.()
      invalidate()
    }
    function changeLock() {
      state.locked = doc.pointerLockElement === surface
      if (!state.locked) clearMove()
      if (state.locked) state.fallback = false
      publish()
    }
    function fallback() { state.fallback = true; publish() }
    function captureMouse() {
      if (latest.current.paused) return
      viewport.current?.focus({ preventScroll: true })
      if (!surface.requestPointerLock) { fallback(); return }
      try { void surface.requestPointerLock()?.catch(fallback) } catch { fallback() }
    }
    function useTarget() {
      if (!state.target || latest.current.paused) return
      const id = state.target
      release()
      latest.current.interact(id)
    }
    function down(event: KeyboardEvent) {
      if (event.key === 'Escape') { release(); return }
      if (!canUseKeys() || event.altKey || event.metaKey || event.ctrlKey) return
      if (movementKeys.has(event.code)) {
        event.preventDefault()
        state.held.add(event.code)
        invalidate()
      }
      if (event.code === 'KeyE' && !event.repeat) useTarget()
    }
    function up(event: KeyboardEvent) { state.held.delete(event.code); invalidate() }
    function look(event: MouseEvent) {
      if (latest.current.paused || (!state.locked && !state.drag)) return
      if (Math.abs(event.movementX) + Math.abs(event.movementY) > 0) state.dragged = true
      state.yaw -= event.movementX * .0027
      state.pitch = Math.min(angleLimit, Math.max(-angleLimit, state.pitch - event.movementY * .0027))
      invalidate()
    }
    function startDrag(event: PointerEvent) {
      if (event.button !== 0 || latest.current.paused) return
      state.drag = !state.locked
      state.dragged = false
    }
    function stopDrag() { state.drag = false }
    function click() {
      if (state.locked) { useTarget(); return }
      if (!state.dragged && !state.fallback) captureMouse()
    }
    function visibility() { if (doc.hidden) release() }
    function focusChanged(event: FocusEvent) { if (event.target === viewport.current && !state.locked) release() }
    controls.current = { interact: useTarget, captureMouse }
    surface.addEventListener('pointerdown',startDrag)
    surface.addEventListener('click',click)
    doc.addEventListener('pointerup',stopDrag)
    doc.addEventListener('pointercancel',stopDrag)
    doc.addEventListener('mousemove',look)
    doc.addEventListener('keydown',down)
    doc.addEventListener('focusout',focusChanged)
    doc.addEventListener('keyup',up)
    doc.addEventListener('visibilitychange',visibility)
    doc.addEventListener('pointerlockchange',changeLock)
    doc.addEventListener('pointerlockerror',fallback)
    window.addEventListener('blur',release)
    return () => {
      controls.current = null
      surface.removeEventListener('pointerdown',startDrag)
      surface.removeEventListener('click',click)
      doc.removeEventListener('pointerup',stopDrag)
      doc.removeEventListener('pointercancel',stopDrag)
      doc.removeEventListener('mousemove',look)
      doc.removeEventListener('keydown',down)
      doc.removeEventListener('focusout',focusChanged)
      doc.removeEventListener('keyup',up)
      doc.removeEventListener('visibilitychange',visibility)
      doc.removeEventListener('pointerlockchange',changeLock)
      doc.removeEventListener('pointerlockerror',fallback)
      window.removeEventListener('blur',release)
      release()
    }
  }, [controls, invalidate, state, surface, viewport])

  useEffect(() => {
    if (!paused) { invalidate(); return }
    clearMove()
    if (surface.ownerDocument.pointerLockElement === surface) surface.ownerDocument.exitPointerLock?.()
  }, [paused, state, surface, invalidate])

  useFrame((_frame, delta) => {
    if (paused || document.hidden) return
    const dt = Math.min(delta, .14)
    const key = (main: string, alternative: string) => Number(state.held.has(main) || state.held.has(alternative))
    const forward = key('KeyW','ArrowUp') - key('KeyS','ArrowDown')
    const right = key('KeyD','ArrowRight') - key('KeyA','ArrowLeft')
    const heading = direction(forward,right,state.yaw)
    const speed = key('ShiftLeft','ShiftRight') ? 4.1 : 2.75
    const blend = 1 - Math.exp(-dt * 17)
    state.velocity.x += (heading.x * speed - state.velocity.x) * blend
    state.velocity.z += (heading.z * speed - state.velocity.z) * blend
    const previous = state.point
    const steps = Math.ceil(dt / .025) || 1
    for (let i = 0; i < steps; i++) {
      state.point = walkStep(state.point,{ x: state.velocity.x * dt / steps, z: state.velocity.z * dt / steps },plan,doorOpen)
    }
    const ground = plan.floor(state.point.x,state.point.z) + eyeHeight
    state.eye += (ground - state.eye) * (1 - Math.exp(-dt * 22))
    camera.position.set(state.point.x,state.eye,state.point.z)
    camera.rotation.copy(work.euler.set(state.pitch,state.yaw,0))
    camera.updateMatrixWorld()
    const moved = Math.hypot(state.point.x - previous.x,state.point.z - previous.z) > .0003
    if (moved && traverse && plan.portal && within(state.point,plan.portal) && (!plan.portalRequiresOpenDoor || doorOpen) && !state.travelled) {
      state.travelled = true
      traverse()
      return
    }
    if (forward || right || Math.hypot(state.velocity.x,state.velocity.z) > .02 || Math.abs(ground-state.eye) > .003) invalidate()

    // Only cast when a discovered target is close enough and near the reticle.
    camera.getWorldDirection(work.forward)
    let target: string | undefined
    let best = .965
    for (const entry of entries) {
      work.aim.fromArray(entry.position).sub(camera.position)
      const distance = work.aim.length()
      if (distance > interactRange || distance < .15) continue
      const alignment = work.aim.normalize().dot(work.forward)
      if (alignment <= best) continue
      work.ray.set(camera.position,work.aim)
      work.ray.far = distance - .23
      const now = performance.now()
      if (now - work.lastScan > 180) {
        work.lastScan = now
        work.blockers.length = 0
        scene.traverseVisible(object => {
          if (!(object instanceof Mesh) || object instanceof InstancedMesh || object.userData.walkGround) return
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          if (materials.every(material => !material.transparent && material.visible)) work.blockers.push(object)
        })
      }
      let hiddenBySlope = false
      for (let length = .45; length < work.ray.far; length += .45) {
        work.ray.ray.at(length,work.sample)
        if (plan.floor(work.sample.x,work.sample.z) > work.sample.y) { hiddenBySlope = true; break }
      }
      const blocked = hiddenBySlope || work.ray.intersectObjects(work.blockers,false).length > 0
      if (!blocked) { target = entry.id; best = alignment }
    }
    if (target !== state.target) {
      state.target = target
      report({ target, locked: state.locked, fallback: state.fallback })
    }
  })
  return null
}
