import { OrbitControls } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { OrbitControls as OrbitControlsType } from 'three-stdlib'
import { Collectible } from './Collectible'

function Display({ id, zoom, reduced, gold }: { id: string, zoom: number, reduced: boolean, gold: boolean }) {
  const controls = useRef<OrbitControlsType>(null)
  const { camera, invalidate } = useThree()
  useEffect(() => {
    camera.zoom = zoom
    camera.updateProjectionMatrix()
    invalidate()
  }, [camera, invalidate, zoom])
  return <>
    <hemisphereLight args={['#fff0d3','#aeb6a0',2.3]} />
    <directionalLight position={[-4,5,4]} intensity={3.0} color="#fff0ce" castShadow shadow-mapSize={[512,512]} />
    <directionalLight position={[3,1,-2]} intensity={1.7} color="#c0cdb5" />
    <mesh position={[0,-1.16,0]} receiveShadow rotation-x={-Math.PI/2}>
      <planeGeometry args={[14,14]} /><shadowMaterial opacity={.19} transparent />
    </mesh>
    <mesh position-y={-1.05} receiveShadow>
      <cylinderGeometry args={[1.61,1.69,.19,50]} /><meshStandardMaterial color="#816b4f" roughness={.84} />
    </mesh>
    <group position-y={id === 'wizard-staff' ? .31 : 0}><Collectible id={id} gold={gold} /></group>
    <OrbitControls ref={controls} enablePan={false} enableDamping={!reduced} minZoom={.7} maxZoom={2.5}
      minDistance={3} maxDistance={9} maxPolarAngle={1.75} />
  </>
}

export default function ObjectStudio({ id, zoom, reduced, gold }: { id: string, zoom: number, reduced: boolean, gold: boolean }) {
  return <div className="object-studio" aria-label="Interactive object inspection">
    <Canvas camera={{ position:[1.56,1.36,4.43], fov:40 }} shadows frameloop="demand" dpr={[1,1.45]}
      fallback={<p>3D inspection requires WebGL.</p>}>
      <Display id={id} zoom={zoom} reduced={reduced} gold={gold} />
    </Canvas>
  </div>
}
