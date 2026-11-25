import { RoomShell, type RoomPlan } from './RoomShell'

const hall: RoomPlan = { origin: [0, 0, -0.055], radius: 1.21, length: 2.75, floor: -0.86, timber: '#94724c', plaster: '#a88058' }

export function BagEndThreshold() {
  return <RoomShell plan={hall}>
    <mesh position={[0, -0.799, -1.38]} receiveShadow>
      <boxGeometry args={[0.78, 0.022, 2.61]} /><meshStandardMaterial color="#83533e" roughness={1} />
    </mesh>
    {[-1, 1].map(side => <group key={side} position={[side * 0.84, 0.31, -1.22]}>
      <mesh><boxGeometry args={[0.13, 0.34, 0.21]} /><meshStandardMaterial color="#67472d" /></mesh>
      <mesh position={[-side * 0.075, 0.02, 0]}><boxGeometry args={[0.085, 0.18, 0.12]} /><meshStandardMaterial color="#f1c880" emissive="#f3a735" emissiveIntensity={0.95} /></mesh>
    </group>)}
    <pointLight position={[0.18, 0.54, -0.75]} color="#ffc178" intensity={8} distance={3.9} />
  </RoomShell>
}
