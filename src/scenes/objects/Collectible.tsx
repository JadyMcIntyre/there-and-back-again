import { useMemo } from 'react'
import { CatmullRomCurve3, Vector3, type Vector3Tuple } from 'three'

const wood = '#835332'
const silver = '#c6cbd0'

function Curved({ points, radius, color }: { points: Vector3Tuple[], radius: number, color: string }) {
  const path = useMemo(() => new CatmullRomCurve3(points.map(point => new Vector3(...point))), [points])
  return <mesh castShadow><tubeGeometry args={[path, 40, radius, 9, false]} /><meshStandardMaterial color={color} roughness={.62} /></mesh>
}

function Key() {
  return <group rotation-y={-.25}>
    <mesh position-x={-.59} castShadow><torusGeometry args={[.31,.064,14,44]} /><meshStandardMaterial color={silver} metalness={.68} roughness={.31} /></mesh>
    <mesh position-x={.17} rotation-z={Math.PI/2} castShadow>
      <cylinderGeometry args={[.057,.076,1.14,18]} /><meshStandardMaterial color={silver} metalness={.7} roughness={.28} />
    </mesh>
    <mesh position={[.64,-.14,0]} castShadow><boxGeometry args={[.26,.33,.116]} /><meshStandardMaterial color={silver} metalness={.68} roughness={.32} /></mesh>
    <mesh position={[.79,-.21,0]} castShadow><boxGeometry args={[.24,.13,.115]} /><meshStandardMaterial color={silver} metalness={.68} roughness={.32} /></mesh>
  </group>
}

function Pipe() {
  return <group rotation-z={.18}>
    <Curved points={[[-.85,-.10,.04],[-.39,-.20,.02],[.17,-.15,-.025],[.91,.12,-.01]]} color="#593a25" radius={.048} />
    <mesh position={[-.91,.005,.025]} rotation-z={-.2} castShadow>
      <cylinderGeometry args={[.16,.10,.31,28]} /><meshStandardMaterial color={wood} roughness={.71} />
    </mesh>
    <mesh position={[-.935,.159,.025]} rotation-x={Math.PI / 2} castShadow>
      <torusGeometry args={[.13,.025,10,30]} /><meshStandardMaterial color="#71492d" />
    </mesh>
    <mesh position={[-.935,.147,.025]} rotation-x={-Math.PI / 2}>
      <circleGeometry args={[.125,24]} /><meshStandardMaterial color="#36271f" />
    </mesh>
  </group>
}

function Staff() {
  return <group rotation-z={-.16}>
    <Curved points={[[.06,-1.28,0],[-.02,-.65,.02],[.04,.10,.035],[-.06,.72,0],[.05,1.14,-.02],[.033,1.26,0]]} color="#64432f" radius={.058} />
    <Curved points={[[.029,.65,.034],[.022,.84,.048],[-.04,1.05,.046],[.043,1.22,.033]]} color="#986342" radius={.017} />
    <mesh position={[.007,-.40,.014]} castShadow><cylinderGeometry args={[.064,.066,.17,13]} /><meshStandardMaterial color="#795a3d" /></mesh>
  </group>
}

function MapSheet() {
  return <group rotation-z={-.13}>
    <mesh castShadow><boxGeometry args={[2.28,1.56,.038]} /><meshStandardMaterial color="#d8bc82" roughness={.96} /></mesh>
    {[-1,1].map(side => <mesh key={side} position={[side*1.137,.0,.026]} castShadow>
      <cylinderGeometry args={[.046,.047,1.59,14]} /><meshStandardMaterial color="#b28b55" />
    </mesh>)}
    {[[-.78,-.20],[-.49,.14],[-.15,-.08],[.19,.19],[.65,.40],[.85,.16]].map(([x,y],i) => <Curved key={x}
      points={[[x-.21,y-.20,.026],[x,y+.21+(i%2)*.05,.026],[x+.20,y-.18,.026]]} color="#77573b" radius={.009} />)}
    <Curved points={[[-1.01,-.46,.027],[-.51,-.50,.027],[-.32,-.32,.027],[.07,-.40,.027],[.61,-.29,.027],[.99,-.36,.027]]} color="#6c8066" radius={.012} />
    {[[-.79,.51], [0.65,-.53]].map(([x,y]) => <mesh key={x} position={[x,y,.033]}>
      <ringGeometry args={[.042,.061,12]} /><meshStandardMaterial color="#926447" />
    </mesh>)}
  </group>
}

function Door() {
  return <group>
    <mesh castShadow><circleGeometry args={[1.03,48]} /><meshStandardMaterial color="#536b40" /></mesh>
    {Array.from({length:13}, (_, i) => {
      const x = (i-6)*.145
      return <mesh position={[x,0,.012]} key={i} castShadow>
        <boxGeometry args={[.018,2*Math.sqrt(.99**2-x*x),.03]} /><meshStandardMaterial color="#3e5733" />
      </mesh>
    })}
    <mesh position-z={.019} castShadow><torusGeometry args={[1.05,.102,12,48]} /><meshStandardMaterial color="#b59b76" /></mesh>
    <mesh position-z={.11} castShadow><sphereGeometry args={[.081,16,10]} /><meshStandardMaterial color="#d4a352" metalness={.65} roughness={.34} /></mesh>
  </group>
}

function Harp() {
  return <group>
    <Curved points={[[-.55,-.52,0],[-.63,.04,0],[-.35,.64,0],[.20,.54,0],[.49,.26,0],[.34,-.09,0],[-.55,-.52,0]]} color="#a67849" radius={.068} />
    {Array.from({length:8}, (_,i) => <mesh position={[-.45+i*.105,.03+i*.022,0]} key={i}>
      <cylinderGeometry args={[.009,.009,.87-i*.083,7]} /><meshStandardMaterial color="#d5ba7c" />
    </mesh>)}
  </group>
}

export function Collectible({ id, tabletop = false, gold = false }: { id: string, tabletop?: boolean, gold?: boolean }) {
  const content = id === 'plain-ring' ? <mesh rotation-x={.22} castShadow>
    <torusGeometry args={[.68,.104,25,80]} /><meshStandardMaterial color={gold ? '#bf9952' : '#8e8c81'} metalness={.68} roughness={.3} />
  </mesh> : id === 'thror-key' ? <Key /> : id === 'thror-map' ? <MapSheet /> : id === 'bilbos-pipe' ? <Pipe />
    : id === 'wizard-staff' ? <Staff /> : id === 'green-door' ? <Door /> : id === 'instruments' ? <Harp /> : null
  return <group rotation-x={tabletop && id !== 'instruments' ? -Math.PI / 2 : 0}>{content}</group>
}
