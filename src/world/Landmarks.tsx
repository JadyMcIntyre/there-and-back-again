import { useFrame } from '@react-three/fiber'
import { useState } from 'react'
import type { Atlas } from '../content/spoilers'
import { terrainHeight } from './terrain'

export function Cottage({ x, z, scale, roof, turn }: { x: number, z: number, scale: number, roof: string, turn: number }) {
  return <group position={[x, terrainHeight(x, z) - 0.13, z]} scale={scale} rotation-y={turn}>
    <mesh position={[0, 0.53, 0]} castShadow receiveShadow><boxGeometry args={[1.74, 1.18, 1.32]} /><meshStandardMaterial color="#c9b38b" roughness={0.95} /></mesh>
    <mesh position={[0, 1.22, 0]} castShadow rotation-y={Math.PI / 4} scale={[1.19, 1, 0.86]}><coneGeometry args={[1.26, 0.98, 4]} /><meshStandardMaterial color={roof} roughness={0.94} /></mesh>
    <mesh position={[0.48, 1.49, -0.24]} castShadow><boxGeometry args={[0.27, 0.66, 0.27]} /><meshStandardMaterial color="#716956" /></mesh>
    <mesh position={[-0.32, 0.43, 0.669]}><boxGeometry args={[0.34, 0.51, 0.035]} /><meshStandardMaterial color="#546b49" /></mesh>
    <mesh position={[0.43, 0.65, 0.67]}><boxGeometry args={[0.32, 0.31, 0.035]} /><meshStandardMaterial color="#e3b970" roughness={0.5} /></mesh>
  </group>
}

function Smial({ x, z, scale, turn, color }: { x: number, z: number, scale: number, turn: number, color: string }) {
  return <group position={[x, terrainHeight(x, z) - 0.03, z]} scale={scale} rotation-y={turn}>
    <mesh position={[0, 0.16, 0]} scale={[1.55, 0.95, 1.44]} castShadow receiveShadow><sphereGeometry args={[1, 19, 11]} /><meshStandardMaterial color="#758344" roughness={1} /></mesh>
    <mesh position={[0, 0.43, 1.48]}><circleGeometry args={[0.41, 24]} /><meshStandardMaterial color="#b3a181" /></mesh>
    <mesh position={[0, 0.43, 1.50]}><circleGeometry args={[0.33, 24]} /><meshStandardMaterial color={color} /></mesh>
    {[-0.59, 0.59].map(side => <mesh key={side} position={[side, 0.38, 1.36]}><circleGeometry args={[0.17, 16]} /><meshStandardMaterial color="#d7b777" /></mesh>)}
    <mesh position={[0.51, 1.07, -0.42]} castShadow><boxGeometry args={[0.23, 0.53, 0.26]} /><meshStandardMaterial color="#826f56" /></mesh>
  </group>
}

function Hobbiton({ x, z, close }: { x: number, z: number, close: boolean }) {
  return <group>
    <Smial x={x} z={z} scale={1.65} turn={0.09} color="#475e38" />
    <Smial x={x - 2.8} z={z + 3.2} scale={1.09} turn={0.23} color="#9d7346" />
    <Smial x={x + 2.9} z={z + 4.4} scale={0.95} turn={-0.12} color="#746b44" />
    <Cottage x={x - 1.2} z={z + 9.3} scale={0.94} roof="#986849" turn={0.38} />
    <Cottage x={x + 2.7} z={z + 8.1} scale={0.77} roof="#977c52" turn={0.12} />
    {close && <>
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

function BeornHouse({ x, z }: { x: number, z: number }) {
  return <group position={[x, terrainHeight(x, z) + 0.04, z]} rotation-y={-0.28}>
    <mesh position-y={0.53} castShadow><boxGeometry args={[3.2, 1.1, 1.64]} /><meshStandardMaterial color="#7b6246" /></mesh>
    <mesh position-y={1.26} rotation-y={Math.PI / 4} scale={[1.8, 1, 0.9]} castShadow><coneGeometry args={[1.37, 1.08, 4]} /><meshStandardMaterial color="#a38b58" /></mesh>
    {[-1, 1].map(side => <mesh key={side} position={[side * 2.5, 0.22, 0]} castShadow><boxGeometry args={[0.4, 0.56, 4]} /><meshStandardMaterial color="#657a44" /></mesh>)}
    <mesh position={[-1.02, 0.22, 1.94]} castShadow><boxGeometry args={[2.8, 0.56, 0.4]} /><meshStandardMaterial color="#657a44" /></mesh>
  </group>
}

function RockFeature({ x, z, river }: { x: number, z: number, river: boolean }) {
  return <group position={[x, terrainHeight(x, z) + 0.68, z]}>
    <mesh castShadow scale={river ? [0.83, 1.65, 1.24] : [1.27, 0.67, 1.1]} rotation={[0.08, -0.21, 0.1]}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color={river ? '#958d72' : '#626457'} roughness={0.95} flatShading /></mesh>
    {river && Array.from({ length: 5 }, (_, i) => <mesh position={[0.34 + 0.2 * i, 0.58 - 0.19 * i, 0.53]} key={i}><boxGeometry args={[0.35, 0.2, 0.42]} /><meshStandardMaterial color="#827960" /></mesh>)}
  </group>
}

export function Settlements({ landmarks }: { landmarks: Atlas['landmarks'] }) {
  const [close, setClose] = useState(false)
  useFrame(({ camera }) => {
    const zoom = 'zoom' in camera ? Number(camera.zoom) : 0
    const next = close ? zoom > 13 : zoom > 15
    if (next !== close) setClose(next)
  })
  return <>{landmarks.map(({ id, point: [x,z] }) => {
    if (id === 'bag-end') return <Hobbiton key={id} x={x} z={z} close={close} />
    if (id === 'green-dragon') return <Cottage key={id} x={x} z={z} scale={1.27} roof="#8d6444" turn={0.28} />
    if (id === 'rivendell') return <Rivendell key={id} x={x} z={z} />
    if (id === 'beorn') return <BeornHouse key={id} x={x} z={z} />
    if (id === 'carrock' || id === 'goblin-caverns' || id === 'troll-hoard') return <RockFeature key={id} x={x} z={z} river={id === 'carrock'} />
    return null
  })}</>
}
