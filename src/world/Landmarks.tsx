import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Suspense, useState } from 'react'
import type { Atlas } from '../content/spoilers'
import { terrainHeight } from './terrain'
import { Model } from './Models'

export function Cottage({ x, z, scale, roof, turn }: { x: number, z: number, scale: number, roof: string, turn: number }) {
  return <group position={[x, terrainHeight(x, z) - 0.13, z]} scale={scale} rotation-y={turn}>
    <mesh position={[0, 0.53, 0]} castShadow receiveShadow><boxGeometry args={[1.74, 1.18, 1.32]} /><meshStandardMaterial color="#c9b38b" roughness={0.95} /></mesh>
    <mesh position={[0, 1.22, 0]} castShadow rotation-y={Math.PI / 4} scale={[1.19, 1, 0.86]}><coneGeometry args={[1.26, 0.98, 4]} /><meshStandardMaterial color={roof} roughness={0.94} /></mesh>
    <mesh position={[0.48, 1.49, -0.24]} castShadow><boxGeometry args={[0.27, 0.66, 0.27]} /><meshStandardMaterial color="#716956" /></mesh>
    <mesh position={[-0.32, 0.43, 0.669]}><boxGeometry args={[0.34, 0.51, 0.035]} /><meshStandardMaterial color="#546b49" /></mesh>
    <mesh position={[0.43, 0.65, 0.67]}><boxGeometry args={[0.32, 0.31, 0.035]} /><meshStandardMaterial color="#e3b970" roughness={0.5} /></mesh>
  </group>
}

function Smial({ x, z, scale, turn, color, close }: { x: number, z: number, scale: number, turn: number, color: string, close?: boolean }) {
  return <group position={[x, terrainHeight(x, z) - 0.03, z]} scale={scale} rotation-y={turn}>
    <mesh position={[0, 0.16, 0]} scale={[1.55, 0.95, 1.44]} castShadow receiveShadow><sphereGeometry args={[1, 19, 11]} /><meshStandardMaterial color="#758344" roughness={1} /></mesh>
    <mesh position={[0, 0.43, 1.41]} scale={[1.22, 1.2, 1]}><circleGeometry args={[0.41, 24]} /><meshStandardMaterial color="#b3a181" /></mesh>
    <mesh position={[0, 0.43, 1.44]} scale={[1.19, 1.15, 1]}><circleGeometry args={[0.33, 24]} /><meshStandardMaterial color={color} /></mesh>
    {[-0.59, 0.59].map(side => <mesh key={side} position={[side, 0.38, 1.36]}><circleGeometry args={[0.17, 16]} /><meshStandardMaterial color="#d7b777" /></mesh>)}
    <mesh position={[0.51, 1.07, -0.42]} castShadow><boxGeometry args={[0.23, 0.53, 0.26]} /><meshStandardMaterial color="#826f56" /></mesh>
    {close && <>
      <mesh position={[0,.43,1.461]}><sphereGeometry args={[.044,10,6]} /><meshStandardMaterial color="#ba9562" /></mesh>
      <mesh position={[.51,1.35,-.42]} castShadow><boxGeometry args={[.32,.10,.33]} /><meshStandardMaterial color="#77705a" /></mesh>
      {[-.59,.59].map(side => <group key={side} position={[side,.38,1.372]}>
        <mesh><torusGeometry args={[.175,.034,6,18]} /><meshStandardMaterial color="#9a7951" /></mesh>
        <mesh><boxGeometry args={[.29,.03,.028]} /><meshStandardMaterial color="#776644" /></mesh>
        <mesh><boxGeometry args={[.03,.29,.028]} /><meshStandardMaterial color="#776644" /></mesh>
      </group>)}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = Math.PI * i / 7
        return <mesh key={i} position={[Math.cos(angle)*.533,.43+Math.sin(angle)*.55,1.405]} rotation-z={angle-.5} castShadow>
          <dodecahedronGeometry args={[.123,0]} /><meshStandardMaterial color={i%2 ? '#c0ad85' : '#9f9072'} />
        </mesh>
      })}
    </>}
  </group>
}

function Hobbiton({ x, z, close }: { x: number, z: number, close: boolean }) {
  return <group>
    <Smial x={x} z={z} scale={1.65} turn={0.09} close={close} color="#475e38" />
    <Smial x={x - 2.8} z={z + 3.2} scale={1.09} turn={0.23} close={close} color="#9d7346" />
    <Smial x={x + 2.9} z={z + 4.4} scale={0.95} turn={-0.12} color="#746b44" />
    <Cottage x={x - 1.2} z={z + 9.3} scale={0.94} roof="#986849" turn={0.38} />
    <Cottage x={x + 2.7} z={z + 8.1} scale={0.77} roof="#977c52" turn={0.12} />
    {close && <>
      <Suspense fallback={null}>
        <Model file="kenney/fence-gate.glb" position={[x+.56, terrainHeight(x+.56,z+5.9), z+5.9]} scale={.56} turn={.13} />
        <Model file="kenney/rock-wide.glb" position={[x-1.35, terrainHeight(x-1.35,z+2.5), z+2.5]} scale={.41} turn={.28} />
      </Suspense>
      {Array.from({ length: 7 }, (_, i) => {
        const px = x + .26 + Math.sin(i*.34)*.28, pz = z + 2.6 + i*.48
        return <mesh key={i} position={[px,terrainHeight(px,pz)+.062,pz]} scale={[.56,.1,.25]} rotation-y={i*.15} receiveShadow>
          <dodecahedronGeometry args={[1,0]} /><meshStandardMaterial color={i%2 ? '#b3a17e' : '#aa9974'} />
        </mesh>
      })}
      <Smial x={x + 7} z={z + 3.9} scale={0.84} turn={-0.2} color="#73523e" />
      <Cottage x={x - 3.3} z={z + 10.8} scale={0.71} roof="#8e573d" turn={-0.34} />
      {Array.from({ length: 14 }, (_, i) => {
        const px = x - 4 + i * 0.52, pz = z + 6.6 + Math.sin(i * 0.37) * 0.43
        return <mesh key={i} position={[px, terrainHeight(px, pz) + 0.13, pz]} castShadow>
          <boxGeometry args={[0.16, 0.37, 0.14]} /><meshStandardMaterial color="#baa57f" />
        </mesh>
      })}
    </>}
  </group>
}

function Rivendell({ x, z }: { x: number, z: number }) {
  return <group position={[x, terrainHeight(x, z) - 0.13, z]}>
    <mesh position={[0, 0.48, 0]} castShadow receiveShadow><boxGeometry args={[3.6, 1.15, 1.55]} /><meshStandardMaterial color="#c9bd9e" /></mesh>
    <mesh position={[0, 1.28, 0]} rotation-y={Math.PI / 4} scale={[2.1, 1, 1]} castShadow><coneGeometry args={[1.17, 1, 4]} /><meshStandardMaterial color="#768984" /></mesh>
    {[-1.5, 1.5].map(side => <group key={side} position={[side, 0, 0.4]}>
      <mesh position-y={0.94} castShadow><cylinderGeometry args={[0.38, 0.48, 1.84, 8]} /><meshStandardMaterial color="#d1c5a5" /></mesh>
      <mesh position-y={2.11} castShadow><coneGeometry args={[0.59, 0.94, 8]} /><meshStandardMaterial color="#617e7c" /></mesh>
    </group>)}
    <mesh position={[0.25, -0.04, 2.3]} rotation-z={-0.06} castShadow><boxGeometry args={[0.71, 0.27, 3.1]} /><meshStandardMaterial color="#ab9a7c" /></mesh>
  </group>
}

function BeornHouse({ x, z, close }: { x: number, z: number, close: boolean }) {
  return <group position={[x, terrainHeight(x, z) - .1, z]} rotation-y={-.32}>
    <mesh position-y={.19} castShadow><boxGeometry args={[3.48,.38,1.93]} /><meshStandardMaterial color="#716951" /></mesh>
    <mesh position-y={.64} castShadow receiveShadow><boxGeometry args={[3.45,1.2,1.83]} /><meshStandardMaterial color="#876746" /></mesh>
    <mesh position-y={1.24} rotation-x={Math.PI / 4} scale={[1, .78, 1]} castShadow>
      <boxGeometry args={[3.49,1.36,1.36]} /><meshStandardMaterial color="#886648" />
    </mesh>
    {[-1, 1].map(side => <group key={side}>
      <mesh position={[0, 1.64,side*.52]} rotation-x={side*.68} scale={[1,1,1]} castShadow>
        <boxGeometry args={[3.8,.17,1.41]} /><meshStandardMaterial color={side<0 ? '#93754e' : '#ad8c58'} />
      </mesh>
      <mesh position={[side*1.03,.62,.926]}><boxGeometry args={[.42,.38,.08]} /><meshStandardMaterial color="#c5a06a" /></mesh>
      {close && <group position={[0, 1.735,side*.52]} rotation-x={side*.68}>
        {Array.from({ length: 13 }, (_, i) => <mesh key={i} position={[-1.75+i*.29,0,0]} rotation-y={(i%3-1)*.025}>
          <boxGeometry args={[.093,.066,1.42]} /><meshStandardMaterial color={['#b39059','#987549','#ac8956'][i%3]} />
        </mesh>)}
      </group>}
    </group>)}
    <mesh position={[0,2.10,0]}><boxGeometry args={[3.89,.16,.19]} /><meshStandardMaterial color="#7d613f" /></mesh>
    <mesh position={[0,.53,.94]}><boxGeometry args={[.53,.85,.08]} /><meshStandardMaterial color="#514333" /></mesh>
    {close && <>
      {Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[0,.31+i*.13,.949]}>
        <boxGeometry args={[3.49,.034,.055]} /><meshStandardMaterial color="#624d37" />
      </mesh>)}
      {[-1.63,-.35,.35,1.63].map(post => <mesh key={post} position={[post,.75,.969]} castShadow>
        <boxGeometry args={[.115,1.08,.15]} /><meshStandardMaterial color="#5d4832" />
      </mesh>)}
      <mesh position={[0,.13,1.21]}><boxGeometry args={[.9,.26,.60]} /><meshStandardMaterial color="#88775c" /></mesh>
      {[-1,1].map(side => <group key={side}>
        {Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[side*2.30,.23,-1.8+i*.54]} castShadow>
          <dodecahedronGeometry args={[.42+.05*(i%2),0]} /><meshStandardMaterial color={i%2 ? '#67794c' : '#77854f'} />
        </mesh>)}
      </group>)}
    </>}
  </group>
}

function RockFeature({ x, z, river }: { x: number, z: number, river: boolean }) {
  return <group position={[x, terrainHeight(x, z) + 0.68, z]}>
    <mesh castShadow scale={river ? [0.83, 1.65, 1.24] : [1.27, 0.67, 1.1]} rotation={[0.08, -0.21, 0.1]}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color={river ? '#958d72' : '#626457'} roughness={0.95} flatShading /></mesh>
    {river && Array.from({ length: 5 }, (_, i) => <mesh position={[0.34 + 0.2 * i, 0.58 - 0.19 * i, 0.53]} key={i}><boxGeometry args={[0.35, 0.2, 0.42]} /><meshStandardMaterial color="#827960" /></mesh>)}
  </group>
}

function LandmarkMiniature({ place, close }: { place: Atlas['landmarks'][number], close: boolean }) {
  const { id, point: [x, z] } = place
  if (id === 'bag-end') return <Hobbiton x={x} z={z} close={close} />
  if (id === 'green-dragon') return <Cottage x={x} z={z} scale={1.27} roof="#8d6444" turn={0.28} />
  if (id === 'rivendell') return <Rivendell x={x} z={z} />
  if (id === 'beorn') return <BeornHouse x={x} z={z} close={close} />
  if (id === 'carrock' || id === 'goblin-caverns' || id === 'troll-hoard') return <RockFeature x={x} z={z} river={id === 'carrock'} />
  return null
}

export function Settlements({ landmarks, select, activate }: {
  landmarks: Atlas['landmarks'],
  select: (event: ThreeEvent<MouseEvent>, id: string) => void,
  activate: (event: ThreeEvent<MouseEvent>, id: string) => void,
}) {
  const [close, setClose] = useState(false)
  useFrame(({ camera }) => {
    const zoom = 'zoom' in camera ? Number(camera.zoom) : 0
    const next = close ? zoom > 13 : zoom > 15
    if (next !== close) setClose(next)
  })
  return <>{landmarks.map(place => <group key={place.id}
    onClick={event => select(event, place.id)} onDoubleClick={event => activate(event, place.id)}>
    <LandmarkMiniature place={place} close={close} />
  </group>)}</>
}
