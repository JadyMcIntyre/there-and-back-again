import type { ReactNode } from 'react'
import { DoubleSide, type Vector3Tuple } from 'three'

export type RoomPlan = {
  origin: Vector3Tuple
  radius: number
  length: number
  floor: number
  timber: string
  plaster: string
}

export function RoomShell({ plan, children }: { plan: RoomPlan, children?: ReactNode }) {
  const { origin, radius, length, floor, timber, plaster } = plan
  return <group position={origin}>
    <mesh position-z={-length / 2} rotation-x={Math.PI / 2}>
      <cylinderGeometry args={[radius, radius, length, 40, 1, true]} />
      <meshStandardMaterial side={DoubleSide} color={plaster} roughness={0.93} emissive="#744626" emissiveIntensity={0.17} />
    </mesh>
    {Array.from({ length: 10 }, (_, i) => <mesh key={i} position={[(i - 4.5) * radius * 0.17, floor, -length * 0.5]} receiveShadow>
      <boxGeometry args={[radius * 0.164, 0.09, length]} /><meshStandardMaterial color={i % 3 ? timber : '#896440'} roughness={0.88} />
    </mesh>)}
    <mesh position-z={-length}><circleGeometry args={[radius, 40]} /><meshStandardMaterial color="#513925" emissive="#4f2f1c" emissiveIntensity={0.15} /></mesh>
    {[0.16, 0.49, 0.84].map(depth => <mesh key={depth} position-z={-length * depth}>
      <torusGeometry args={[radius * 0.974, 0.057, 8, 40]} /><meshStandardMaterial color={timber} emissive="#8c5425" emissiveIntensity={0.21} />
    </mesh>)}
    {children}
  </group>
}
