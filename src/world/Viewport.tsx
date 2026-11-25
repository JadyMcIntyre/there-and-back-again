import { OrbitControls } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { Compass, LocateFixed, Minus, Plus } from 'lucide-react'
import { Component, lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react'
import { ACESFilmicToneMapping, MOUSE, OrthographicCamera, Vector3, type Vector3Tuple } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { Atlas } from '../content/spoilers'
import type { Exhibit } from '../content/schema'
import AtlasWorld, { markerPosition } from './AtlasWorld'

const sceneComponents = { 'bag-end': lazy(() => import('../scenes/BagEnd')) }
type Command = { action: 'home' | 'in' | 'out' | 'rotate' | 'focus', time: number }
const mapEye: Vector3Tuple = [16, 92, 115]
const gardenEye: Vector3Tuple = [8.2, 10.7, 20.5]

function useMedia(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])
  return matches
}

function CameraRig({ scene, command, focused, reduced, ready }: {
  scene: boolean
  command: Command
  focused?: Vector3
  reduced: boolean
  ready: () => void
}) {
  const [controls, setControls] = useState<OrbitControlsImpl | null>(null)
  const { camera, size, invalidate } = useThree()
  const zoom = scene ? Math.min(size.width / 22.3, size.height / 15.85) : Math.min(size.width / 136, size.height / 74)
  const centerHeight = scene ? 2.66 : 4.1
  const eye = scene ? gardenEye : mapEye

  useEffect(() => {
    if (!controls || !(camera instanceof OrthographicCamera) || !zoom) return
    const base = new Vector3(0, centerHeight, 0)
    controls.target.copy(base)
    camera.position.set(...eye)
    camera.zoom = zoom
    camera.updateProjectionMatrix()
    controls.update()
    invalidate()
    ready()
  }, [camera, centerHeight, controls, eye, invalidate, ready, zoom])

  useEffect(() => {
    if (!controls || !(camera instanceof OrthographicCamera) || command.time === 0) return
    const position = camera.position.clone()
    const target = controls.target.clone()
    const home = new Vector3(0, centerHeight, 0)
    let destinationZoom = camera.zoom
    if (command.action === 'home') {
      target.copy(home)
      position.set(...eye)
      destinationZoom = zoom
    } else if (command.action === 'focus' && focused) {
      target.copy(focused).lerp(home, 0.25)
      position.sub(controls.target).add(target)
      destinationZoom = Math.max(zoom * 1.26, camera.zoom)
    } else if (command.action === 'in' || command.action === 'out') {
      destinationZoom = Math.min(zoom * 3.45, Math.max(zoom * 0.7, camera.zoom * (command.action === 'in' ? 1.29 : 1 / 1.29)))
    } else if (command.action === 'rotate') {
      position.sub(target).applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 6).add(target)
    }
    const finish = () => {
      camera.updateProjectionMatrix()
      controls.update()
      invalidate()
    }
    if (reduced) {
      controls.target.copy(target)
      camera.position.copy(position)
      camera.zoom = destinationZoom
      finish()
      return
    }
    const start = { position: camera.position.clone(), target: controls.target.clone(), zoom: camera.zoom }
    const frame = { t: 0 }
    const tween = gsap.to(frame, {
      t: 1, duration: command.action === 'focus' ? 0.88 : 0.55, ease: 'power2.inOut',
      onUpdate() {
        camera.position.lerpVectors(start.position, position, frame.t)
        controls.target.lerpVectors(start.target, target, frame.t)
        camera.zoom = start.zoom + (destinationZoom - start.zoom) * frame.t
        finish()
      },
    })
    const cancel = () => tween.kill()
    controls.addEventListener('start', cancel)
    return () => {
      cancel()
      controls.removeEventListener('start', cancel)
    }
  }, [camera, centerHeight, command, controls, eye, focused, invalidate, reduced, zoom])

  return <OrbitControls ref={setControls} makeDefault enableDamping={!reduced} dampingFactor={0.11}
    minZoom={zoom * 0.7} maxZoom={zoom * 3.5} minPolarAngle={0.30} maxPolarAngle={scene ? 1.36 : 1.10}
    rotateSpeed={0.66} panSpeed={0.89} zoomSpeed={0.68}
    mouseButtons={{ LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN }} />
}

function Lighting({ scene, compact }: { scene: boolean, compact: boolean }) {
  const bounds = scene ? 15 : 72
  const light: Vector3Tuple = scene ? [-8, 15, 10] : [-53, 82, 36]
  return <>
    <hemisphereLight args={[scene ? '#f5e7c8' : '#fff2d8', scene ? '#99896d' : '#8b8874', scene ? 1.55 : 1.78]} />
    <directionalLight position={light} color={scene ? '#ffdcaa' : '#fff0cf'} intensity={scene ? 2.5 : 2.45} castShadow
      shadow-mapSize-width={compact ? 1024 : 2048} shadow-mapSize-height={compact ? 1024 : 2048}
      shadow-camera-top={bounds} shadow-camera-bottom={-bounds * 0.85}
      shadow-camera-left={-bounds} shadow-camera-right={bounds}
      shadow-camera-near={0.5} shadow-camera-far={scene ? 52 : 233}
      shadow-bias={scene ? -0.0002 : -0.00026} shadow-normalBias={scene ? 0.035 : 0.16} shadow-radius={3} />
    <directionalLight position={[14, 9, -18]} color="#a9c4c2" intensity={scene ? 0.54 : 0.44} />
    <mesh receiveShadow rotation-x={-Math.PI / 2} position-y={scene ? -1.33 : -4.46}>
      <planeGeometry args={scene ? [80, 80] : [390, 390]} /><shadowMaterial transparent opacity={0.22} depthWrite={false} />
    </mesh>
  </>
}

class ViewErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed ? <p className="view-status" role="status">The 3D view is unavailable on this device. Explore with the atlas list.</p> : this.props.children
  }
}

export default function Viewport({ atlas, selected, select, scene, exhibits, inspect, exhibit, doorOpen, focus, className }: {
  atlas: Atlas
  selected?: string
  select: (id: string) => void
  scene?: string
  exhibits: Exhibit[]
  exhibit?: string
  inspect: (id: string) => void
  doorOpen: boolean
  focus?: { id: string, time: number }
  className?: string
}) {
  const compact = useMedia('(max-width: 760px)')
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const [command, setCommand] = useState<Command>({ action: 'home', time: 0 })
  const [focused, setFocused] = useState<Vector3>()
  const [ready, setReady] = useState(false)
  const markReady = useCallback(() => setReady(true), [])
  const Scene = scene ? sceneComponents[scene as keyof typeof sceneComponents] : undefined

  useEffect(() => {
    if (!focus) return
    const place = atlas.landmarks.find(item => item.id === focus.id)
    if (!place) return
    setFocused(markerPosition(place))
    setCommand({ action: 'focus', time: focus.time })
    // The caller changes the request only when a new camera move is triggered.
  }, [focus, atlas.landmarks])

  function move(action: Command['action']) {
    setCommand({ action, time: performance.now() })
  }

  return <div className={`viewport ${Scene ? 'garden-viewport' : ''} ${className ?? ''}`} aria-label={Scene ? `Interactive ${atlas.landmarks.find(place => place.scene?.id === scene)?.name ?? 'location'} diorama` : 'Interactive atlas map'}>
    <div className="map-grid" aria-hidden />
    <div className="atlas-coordinates" aria-hidden><i /><i /><i /><i /></div>
    <ViewErrorBoundary>
      <Canvas orthographic camera={{ position: Scene ? gardenEye : mapEye, near: 0.1, far: 430 }}
        dpr={compact ? [1, 1.35] : [1, 1.65]} shadows frameloop="demand"
        gl={{ antialias: true, alpha: true, toneMapping: ACESFilmicToneMapping }}
        fallback={<p className="view-status" role="status">The 3D view needs WebGL. Explore with the atlas list.</p>}>
        <Lighting scene={!!Scene} compact={compact} />
        <CameraRig scene={!!Scene} command={command} focused={focused} reduced={reduced} ready={markReady} />
        <Suspense fallback={<LoadingWorld />}>
          {Scene ? <Scene compact={compact} exhibits={exhibits} selected={exhibit} select={inspect} doorOpen={doorOpen} reduced={reduced} />
            : <AtlasWorld atlas={atlas} compact={compact} selected={selected} select={select} />}
        </Suspense>
      </Canvas>
    </ViewErrorBoundary>
    {!ready && <span className="view-status" role="status">Drawing the atlas…</span>}
    <button className="compass-control" type="button" aria-label="Rotate view" title="Rotate view" onClick={() => move('rotate')}>
      <span>N</span><Compass size={30} strokeWidth={1} aria-hidden />
    </button>
    <div className="map-controls" aria-label="Camera controls">
      <button type="button" title="Zoom in" aria-label="Zoom in" onClick={() => move('in')}><Plus size={18} /></button>
      <button type="button" title="Zoom out" aria-label="Zoom out" onClick={() => move('out')}><Minus size={18} /></button>
      <button type="button" title="Reset camera" aria-label="Reset camera" onClick={() => move('home')}><LocateFixed size={17} /></button>
    </div>
    <div className="map-legend">
      {Scene ? <>Drag to orbit <b>·</b> Scroll to zoom</> : atlas.routes.length > 0 ? <><span className="route-sample" /> Company’s route</> : <>Drag to orbit <b>·</b> Scroll to zoom</>}
    </div>
  </div>
}

function LoadingWorld() {
  return <ambientLight intensity={0} />
}
