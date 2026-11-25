import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Compass, LocateFixed, Minus, Plus } from 'lucide-react'
import { Component, Suspense, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { ACESFilmicToneMapping, type Vector3Tuple } from 'three'
import type { Atlas } from '../content/spoilers'
import type { Exhibit } from '../content/schema'
import { scenes, type SceneId } from '../scenes/registry'
import AtlasWorld from './AtlasWorld'
import { atlasComposition, portraitAtlasComposition, CameraRig, type CameraHandle, type CameraPose } from './CameraRig'

export function useMedia(query: string) {
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

class ViewErrorBoundary extends Component<{ children: ReactNode, fail: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.fail() }
  render() {
    return this.state.failed ? <p className="view-status" role="status">The 3D view is unavailable. Explore with the field notes.</p> : this.props.children
  }
}

function FirstFrame({ ready }: { ready: () => void }) {
  const notified = useRef(false)
  const frame = useRef(0)
  const invalidate = useThree(state => state.invalidate)
  useEffect(() => {
    invalidate()
    return () => cancelAnimationFrame(frame.current)
  }, [invalidate])
  useFrame(() => {
    if (notified.current) return
    notified.current = true
    frame.current = requestAnimationFrame(ready)
  })
  return null
}

export function CameraButtons({ camera }: { camera: RefObject<CameraHandle | null> }) {
  return <>
    <button className="compass-control" type="button" aria-label="Rotate view" title="Rotate view" onClick={() => camera.current?.move('rotate')}>
      <Compass size={23} strokeWidth={1.4} aria-hidden />
    </button>
    <div className="map-controls" aria-label="Camera controls">
      <button type="button" title="Zoom in" aria-label="Zoom in" onClick={() => camera.current?.move('in')}><Plus size={18} /></button>
      <button type="button" title="Zoom out" aria-label="Zoom out" onClick={() => camera.current?.move('out')}><Minus size={18} /></button>
      <button type="button" title="Reset camera" aria-label="Reset camera" onClick={() => camera.current?.move('home')}><LocateFixed size={17} /></button>
    </div>
  </>
}

export default function Viewport({ atlas, selected, select, scene, exhibits, inspect, exhibit, doorOpen, camera,
  initial, arriving, locked, panelOpen, reduced, ready, fail }: {
  atlas: Atlas
  selected?: string
  select: (id: string) => void
  scene?: SceneId
  exhibits: Exhibit[]
  exhibit?: string
  inspect: (id: string) => void
  doorOpen: boolean
  camera: RefObject<CameraHandle | null>
  initial?: CameraPose
  arriving: boolean
  locked: boolean
  panelOpen: boolean
  reduced: boolean
  ready: () => void
  fail: () => void
}) {
  const labelPortal = useRef<HTMLDivElement>(null)
  const compact = useMedia('(max-width: 760px)')
  const config = scene ? scenes[scene] : undefined
  const Scene = config?.World
  const composition = config?.camera ?? (compact ? portraitAtlasComposition : atlasComposition)
  return <div className={`viewport ${Scene ? 'garden-viewport' : ''}`} aria-label={Scene ? 'Interactive Bag End diorama' : 'Interactive atlas map'}>
    <div className="map-grid" aria-hidden />
    <div ref={labelPortal} className="world-label-portal" />
    <ViewErrorBoundary fail={fail}>
      <Canvas orthographic camera={{ position: composition.eye, near: 0.1, far: 430 }}
        dpr={compact ? [1, 1.25] : [1, 1.65]} shadows frameloop="demand"
        gl={{ antialias: true, alpha: true, toneMapping: ACESFilmicToneMapping }}
        fallback={<p className="view-status" role="status">The 3D view needs WebGL. Explore with the field notes.</p>}>
        <Lighting scene={!!Scene} compact={compact} />
        <CameraRig scene={!!Scene} composition={composition} compact={compact} panelOpen={panelOpen} locked={locked}
          reduced={reduced} handle={camera} initial={initial} arriving={arriving} />
        <Suspense fallback={null}>
          {Scene ? <Scene portal={labelPortal} compact={compact} exhibits={exhibits} selected={exhibit} select={inspect} doorOpen={doorOpen} reduced={reduced} />
            : <AtlasWorld portal={labelPortal} atlas={atlas} compact={compact} selected={selected} select={select} />}
          <FirstFrame ready={ready} />
        </Suspense>
      </Canvas>
    </ViewErrorBoundary>
  </div>
}
