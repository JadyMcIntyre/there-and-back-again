import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, MeshStandardMaterial, PointLight, Vector3Tuple } from 'three'
import { random } from '../../world/math'
import { ScenePin } from '../ScenePin'
import type { SceneProps } from '../sceneProps'
import { useAmbientFrames } from '../ambient'
import { Thorin } from '../Figures'
import { Collectible } from '../objects/Collectible'
import { Moulding, RoundedWall, RoundWindow, Timber } from './Joinery'

const walnut = '#624128'
const honey = '#ae7949'
const planks = ['#96653f', '#a67349', '#9e6b46', '#91603d', '#ad7a50']
const pottery = ['#d0ae76', '#8b6046', '#76866a', '#76695b']
const windowOpening = { x: -4.95, y: 2.65, radius: 1.06 }

function Floor() {
  return <>
    <mesh position={[0, -.63, .13]} receiveShadow castShadow><boxGeometry args={[17.5, 1.05, 11.3]} /><meshStandardMaterial color="#69523a" /></mesh>
    <Timber at={[0,-.13,.12]} size={[17.6,.22,11.42]} color="#533a29" />
    {Array.from({length: 25}, (_, i) => <Timber key={i} at={[-8.42 + i * .70,0,.12]} size={[.674,.15,11.22]} color={planks[i % planks.length]} />)}
    {Array.from({length: 15}, (_, i) => <Timber key={i} at={[8.69,-.39,-5.1+i*.74]} size={[.024,.038,.64]} color="#a07c50" />)}
    <Runner x={1.52} z={1.28} width={2.05} depth={7.30} color="#745445" />
    <Runner x={-4.95} z={1.37} width={5.25} depth={3.53} color="#8c5944" />
  </>
}

function Runner({ x, z, width, depth, color }: { x: number, z: number, width: number, depth: number, color: string }) {
  return <group position={[x,.088,z]}>
    <Timber at={[0,0,0]} size={[width,.044,depth]} color={color} />
    {[-1,1].map(side => <group key={side}>
      <Timber at={[side*(width/2-.1),.03,0]} size={[.05,.012,depth-.14]} color="#c4a074" />
      <Timber at={[0,.03,side*(depth/2-.10)]} size={[width-.16,.012,.05]} color="#c4a074" />
    </group>)}
    {[0,1,2,3,4,5].map(index => <mesh key={index} rotation-y={Math.PI/4} position={[0,.034,(index-2.5)*depth/7]}>
      <boxGeometry args={[.25,.01,.25]} /><meshStandardMaterial color="#ad7c56" />
    </mesh>)}
  </group>
}

function Chair({ x, z, turn = 0, cushioned = false }: { x: number, z: number, turn?: number, cushioned?: boolean }) {
  return <group position={[x,.09,z]} rotation-y={turn} scale={cushioned ? 1.40 : 1}>
    <Timber at={[0,.51,0]} size={[.78,.12,.77]} color={honey} />
    {[-1,1].map(side => <group key={side}>
      <Timber at={[side*.31,.25,.30]} size={[.09,.51,.10]} color={walnut} />
      <Timber at={[side*.31,.62,-.30]} size={[.09,1.24,.10]} color={walnut} />
      {cushioned && <><Timber at={[side*.40,.76,.06]} size={[.12,.12,.72]} color={honey} /><Timber at={[side*.36,.61,.26]} size={[.09,.31,.09]} color={walnut} /></>}
    </group>)}
    <Timber at={[0,1.19,-.31]} size={[.77,.16,.10]} color={honey} />
    <Timber at={[0,.87,-.31]} size={[cushioned ? .63 : .14,cushioned ? .48 : .51,.10]} color={cushioned ? '#96614b' : '#ac784b'} />
    {cushioned && <mesh position={[0,.60,0]} scale={[.39,.081,.38]} castShadow><sphereGeometry args={[1,18,9]} /><meshStandardMaterial color="#a46d55" roughness={.98} /></mesh>}
  </group>
}

function Dining({ gathering, inspect }: { gathering: boolean, inspect?: () => void }) {
  const dishes = gathering ? 7 : 2
  return <group position={[-4.85, .09, .25]}>
    <group onClick={inspect ? event => { event.stopPropagation(); inspect() } : undefined}>
      <mesh position-y={1.17} scale={[1.86,.12,.93]} castShadow receiveShadow><cylinderGeometry args={[1,1,.9,40]} /><meshStandardMaterial color="#a87649" roughness={.81} /></mesh>
      <Timber at={[0,1.04,0]} size={[2.56,.21,.54]} color={walnut} />
      {[-1,1].map(side => <group key={side}>
        <Timber at={[side*1.16,.59,0]} size={[.19,1.12,.25]} color="#70492d" />
        <Timber at={[side*1.16,.17,0]} size={[.22,.18,1.22]} color={walnut} />
      </group>)}
      {Array.from({length:dishes}, (_, i) => {
        const angle = (i+.23)/dishes*Math.PI*2
        return <group key={i} position={[Math.cos(angle)*1.38,1.245,Math.sin(angle)*.65]}>
          <mesh receiveShadow><cylinderGeometry args={[.214,.162,.035,24]} /><meshStandardMaterial color="#d1b98a" /></mesh>
          <mesh position={[.21,.076,-.23]} castShadow><cylinderGeometry args={[.080,.064,.155,18]} /><meshStandardMaterial color={pottery[i%pottery.length]} /></mesh>
        </group>
      })}
      <mesh position={[-.14,1.31,0]} scale={[.44,.11,.25]} castShadow><sphereGeometry args={[1,18,8]} /><meshStandardMaterial color="#be8b53" roughness={1} /></mesh>
    </group>
    <Chair x={-2.08} z={0} turn={Math.PI/2} />
    <Chair x={2.08} z={0} turn={-Math.PI/2} />
    <Chair x={-.75} z={-1.19} />
    <Chair x={.72} z={-1.21} />
    <Chair x={-.66} z={1.20} turn={Math.PI} />
    <Chair x={.73} z={1.20} turn={Math.PI} />
  </group>
}

function Shelves({ x, z }: { x: number, z: number }) {
  const rng = random(423)
  return <group position={[x,0,z]}>
    <Timber at={[0,1.43,-.16]} size={[2.25,2.72,.17]} color="#694832" />
    {[-1,1].map(side => <Timber key={side} at={[side*1.10,1.5,.07]} size={[.14,2.95,.55]} color="#a2754c" />)}
    {[.22,.86,1.52,2.16,2.99].map(y => <Timber key={y} at={[0,y,.10]} size={[2.32,.11,.64]} color="#a77a50" />)}
    {[.94,1.6,2.24].map((row, n) => Array.from({length:9}, (_, i) => {
      const height = .22 + rng()*.28
      return <mesh key={`${n}-${i}`} position={[-.92+i*.224,row+height/2,.09]} rotation-z={(rng()-.5)*.12} castShadow>
        <boxGeometry args={[.13+rng()*.062,height,.284]} /><meshStandardMaterial color={['#735b3e','#b78a55','#875748','#667459','#ad975f'][(n+i)%5]} />
      </mesh>
    }))}
    {[0,1,2,3].map(i => <mesh key={i} position={[-.79+i*.49,.43,.12]} scale={[.15,.21,.15]} castShadow>
      <sphereGeometry args={[1,18,12]} /><meshStandardMaterial color={pottery[i]} roughness={.79} />
    </mesh>)}
  </group>
}

function Fire({ active, reduced, compact }: Pick<SceneProps, 'active' | 'reduced' | 'compact'>) {
  const light = useRef<PointLight>(null)
  const fire = useRef<Group>(null)
  const ember = useRef<MeshStandardMaterial>(null)
  useAmbientFrames(active && !reduced && !compact)
  useFrame(({ clock }) => {
    if (!active || reduced || compact || document.hidden) return
    const flicker = Math.sin(clock.elapsedTime * 8.4) * .12 + Math.sin(clock.elapsedTime * 17.0) * .053
    if (light.current) light.current.intensity = 17 + flicker*22
    if (fire.current) fire.current.scale.y = 1 + flicker
    if (ember.current) ember.current.emissiveIntensity = 1.1 + flicker
  })
  return <group position={[5.22, .1,-3.62]}>
    <pointLight ref={light} position={[0,1.02,.51]} intensity={18} color="#f79544" distance={7} />
    <Timber at={[0,.16,.24]} size={[2.9,.25,1.28]} color="#9b856b" />
    <Timber at={[0,1.19,-.16]} size={[2.44,1.9,.22]} color="#684e3b" />
    {[-1,1].map(side => <group key={side}>
      {[.29,.64,.99,1.34,1.69].map((y,i) => <Timber key={y} at={[side*(1.02+(i%2)*.03),y,.17]} size={[.51,.328,.68]} color={['#a58c71','#9d8063','#ae9676'][i%3]} />)}
    </group>)}
    <Moulding center={[0,1.44,.48]} radius={.84} half thickness={.23} color="#a28b73" />
    <Timber at={[0,2.38,.30]} size={[2.8,.22,.97]} color={walnut} />
    <Timber at={[0,2.66,.04]} size={[2.1,.48,.43]} color="#9d8468" />
    <Timber at={[0,.36,.40]} size={[1.05,.16,.37]} angle={.24} color="#533824" />
    <Timber at={[0,.42,.42]} size={[.91,.14,.29]} angle={-.38} color="#64402a" />
    <group ref={fire} position={[0,.43,.46]}>
      {[-.31,.0,.31].map((x,i) => <mesh key={x} position={[x,.26+i*.03,0]} scale={[.21,.45+(i%2)*.21,.14]} rotation-z={(i-1)*-.13}>
        <sphereGeometry args={[1,16,11]} /><meshStandardMaterial ref={i===1 ? ember : undefined} color="#db7d33" emissive="#ee6c19" emissiveIntensity={1.08} />
      </mesh>)}
      <mesh position={[.0,.29,.14]} scale={[.19,.35,.10]}><sphereGeometry args={[1,16,11]} /><meshStandardMaterial color="#f6bc58" emissive="#ffb439" emissiveIntensity={1.35} /></mesh>
    </group>
  </group>
}

function HouseShell() {
  return <>
    <RoundedWall at={[0,0,-5.36]} width={17.2} height={4.7} opening={windowOpening}>
      <RoundWindow center={[-4.95,2.65,.38]} radius={1.055} />
      <Timber at={[0,.17,.37]} size={[17.1,.28,.20]} color={walnut} />
      <Timber at={[0,1.43,.39]} size={[17.1,.14,.18]} color="#815a3a" />
      <Timber at={[0,4.55,.32]} size={[17.12,.25,.25]} color={walnut} />
      {Array.from({length:35}, (_, i) => <Timber key={i} at={[-8.32+i*.49,.77,.37]} size={[.451,1.15,.14]} color={planks[(i+2)%5]} />)}
      {[-8.43,-6.69,-3.25,-.05,3.03,7.96,8.46].map(x => <Timber key={x} at={[x,2.38,.43]} size={[.18,4.55,.21]} color={walnut} />)}
    </RoundedWall>
    <Moulding center={[-4.9,1.08,-4.91]} radius={3.46} half color="#795134" thickness={.13} />
    <Moulding center={[5.03,1.21,-4.93]} radius={3.26} half color="#795134" thickness={.13} />
    <group position={[8.31,0,-2.45]} rotation-y={-Math.PI/2}>
      <Timber at={[0,.56,0]} size={[5.65,1.03,.30]} color="#92704d" />
      <Timber at={[0,1.16,.03]} size={[5.75,.17,.45]} color={walnut} />
      {Array.from({length:10}, (_,i) => <Timber key={i} at={[-2.55+i*.55,.6,.16]} size={[.47,.83,.12]} color={planks[i%5]} />)}
    </group>
    <group position={[1.52,1.38,-5.00]}>
      <mesh><circleGeometry args={[1.27,48]} /><meshStandardMaterial color="#65734c" roughness={.95} /></mesh>
      {[-.8,-.4,0,.4,.8].map(x => <Timber key={x} at={[x,0,.014]} size={[.021,2*Math.sqrt(1.25**2-x*x),.01]} color="#4c583b" />)}
      <Moulding center={[0,0,.07]} radius={1.29} color="#805a38" thickness={.15} />
      <mesh position={[0,0,.10]}><sphereGeometry args={[.087,20,9]} /><meshStandardMaterial color="#c39851" metalness={.43} roughness={.35} /></mesh>
    </group>
    <group position={[1.52,0,1.3]}>
      {[-1,1].map(side => <Timber key={side} at={[side*1.62,1.22,0]} size={[.30,2.45,.37]} color="#996e44" />)}
      <Moulding center={[0,2.43,0]} radius={1.62} color="#805434" half thickness={.19} />
    </group>
  </>
}

const display = {
  'dining-table': [-4.85, 1.65, .29],
  'thror-map': [-1.59, 1.65, 2.14],
  'thror-key': [-0.57, 1.39, 2.82],
  'instruments': [6.87, .95, -1.18],
  'thorin': [4.5, 1.94, -.84],
  'bilbos-pipe': [6.39,1.07,1.76],
} satisfies Record<string, Vector3Tuple>

export default function BagEndInterior({ exhibits, select, selected, portal, active, reduced, compact }: SceneProps) {
  const gathering = exhibits.some(item => item.id === 'thror-map')
  return <>
    <Floor />
    <HouseShell />
    <Dining gathering={gathering} inspect={() => select('dining-table')} />
    <Shelves x={-7.35} z={-4.60} />
    <Shelves x={7.04} z={-4.34} />
    <group position={[-1.94,0,-4.54]}>
      <Timber at={[0,.65,0]} size={[1.58,1.19,.68]} color="#885935" />
      <Timber at={[0,1.29,.06]} size={[1.71,.13,.79]} color="#b18351" />
      {[-1,1].map(side => <group key={side}>
        <Timber at={[side*.39,.62,.365]} size={[.63,.88,.06]} color="#9c6c49" />
        <mesh position={[side*.233,.69,.42]}><sphereGeometry args={[.039,9,6]} /><meshStandardMaterial color="#c39b5e" /></mesh>
      </group>)}
      {[[-.45,.25,.19],[.22,.19,.21],[.49,.13,.13]].map(([x,h,r],i) => <mesh key={x} position={[x,1.36+h/2,.13]} castShadow>
        <cylinderGeometry args={[r*.73,r,h,18]} /><meshStandardMaterial color={pottery[i]} />
      </mesh>)}
    </group>
    <Chair x={3.74} z={-.36} turn={.65} cushioned />
    <Chair x={7.27} z={.81} turn={-1.25} cushioned />
    <Fire active={active} reduced={reduced} compact={compact} />
    <Timber at={[.26,.95,2.06]} size={[1.4,.17,.86]} color={honey} />
    <Timber at={[.26,.46,2.06]} size={[.26,.90,.33]} color={walnut} />
    <Timber at={[-1.2,.98,2.41]} size={[1.93,.18,1.12]} color={honey} />
    {[-1.94,-.46].map(x => <Timber key={x} at={[x,.50,2.41]} size={[.17,.95,.87]} color={walnut} />)}
    <Timber at={[6.37,.73,1.76]} size={[.94,.18,.83]} color={honey} />
    <Timber at={[6.37,.44,1.76]} size={[.24,.75,.24]} color={walnut} />
    <pointLight position={[-5.5,3.36,-3.3]} intensity={22} color="#ffc681" distance={10} />
    <pointLight position={[.25,3.06,.34]} intensity={12} color="#ffc483" distance={9} />
    {exhibits.map(item => {
      const pos = display[item.id as keyof typeof display]
      if (!pos) return null
      return <group key={item.id}>
        {item.id === 'thorin' && <group position={[pos[0],.09,pos[2]]} rotation-y={-.29}
          onClick={event => { event.stopPropagation(); select(item.id) }}><Thorin /></group>}
        {item.id !== 'dining-table' && item.id !== 'thorin' && <group position={[pos[0],pos[1]-.37,pos[2]]} scale={item.id === 'instruments' ? .66 : .36}
          onClick={event => { event.stopPropagation(); select(item.id) }}>
          <Collectible id={item.id} tabletop />
        </group>}
        <ScenePin portal={portal} position={pos} item={item} active={item.id===selected} select={() => select(item.id)} />
      </group>
    })}
  </>
}
