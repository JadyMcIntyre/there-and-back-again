import { Timber } from './Joinery'
import { RoomShell, type RoomPlan } from './RoomShell'

const hall: RoomPlan = { origin: [0, 0, -0.055], radius: 1.21, length: 2.72, floor: -.885, timber: '#94724c', plaster: '#a88058' }

export function BagEndThreshold() {
  return <RoomShell plan={hall}>
    <mesh position={[0, -0.799, -1.38]} receiveShadow>
      <boxGeometry args={[0.78, 0.022, 2.61]} /><meshStandardMaterial color="#83533e" roughness={1} />
    </mesh>
    {[-1, 1].map(side => <group key={side} position={[side * 0.84, 0.31, -1.22]}>
      <mesh><boxGeometry args={[0.13, 0.34, 0.21]} /><meshStandardMaterial color="#67472d" /></mesh>
      <mesh position={[-side * 0.075, 0.02, 0]}><boxGeometry args={[0.085, 0.18, 0.12]} /><meshStandardMaterial color="#f1c880" emissive="#f3a735" emissiveIntensity={0.95} /></mesh>
    </group>)}
    {[-1,1].map(side => <group key={side}>
      {Array.from({ length: 7 }, (_, i) => <Timber key={i} at={[side*.95,-.40,-.18-i*.37]} size={[.09,.74,.34]} color={i%3 ? '#a17248' : '#956240'} />)}
      <Timber at={[side*.97,-.065,-1.35]} size={[.10,.10,2.66]} color="#724c34" />
    </group>)}
    <mesh position={[0,.02,-2.696]}><circleGeometry args={[.67,38]} /><meshStandardMaterial color="#68734d" emissive="#3a3923" emissiveIntensity={.19} /></mesh>
    <mesh position={[0,.02,-2.674]}><torusGeometry args={[.687,.074,9,35]} /><meshStandardMaterial color="#b08456" /></mesh>
    <mesh position={[0,.02,-2.618]}><sphereGeometry args={[.065,15,12]} /><meshStandardMaterial color="#c6a064" metalness={.4} roughness={.36} /></mesh>
    <pointLight position={[0.18, 0.54, -0.75]} color="#ffc178" intensity={8} distance={3.9} />
  </RoomShell>
}
