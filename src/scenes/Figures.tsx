import { useMemo } from 'react'
import { CatmullRomCurve3, Vector2, Vector3, type Vector3Tuple } from 'three'

function Clay({ color, position, scale, tilt = 0 }: { color: string, position: Vector3Tuple, scale: Vector3Tuple, tilt?: number }) {
  return <mesh position={position} scale={scale} rotation-z={tilt} castShadow>
    <sphereGeometry args={[1, 20, 13]} /><meshStandardMaterial color={color} roughness={0.89} />
  </mesh>
}

function Fold({ points, radius, color }: { points: Vector3Tuple[], radius: number, color: string }) {
  const curve = useMemo(() => new CatmullRomCurve3(points.map(point => new Vector3(...point))), [points])
  return <mesh castShadow><tubeGeometry args={[curve, 12, radius, 7, false]} /><meshStandardMaterial color={color} roughness={.93} /></mesh>
}

function Face({ tone, brow, eye, smiling = false }: { tone: string, brow: string, eye: string, smiling?: boolean }) {
  return <group>
    <Clay color={tone} position={[0, 0, 0]} scale={[.239,.252,.207]} />
    <Clay color={tone} position={[0,-.112,.073]} scale={[.184,.143,.131]} />
    <Clay color="#c59372" position={[0,-.01,.216]} scale={[.052,.049,.062]} />
    {[-1,1].map(side => <group key={side}>
      <Clay color={tone} position={[side*.224,-.014,-.012]} scale={[.06,.088,.064]} tilt={side*-.20} />
      <Clay color="#b68366" position={[side*.249,-.013,.04]} scale={[.022,.045,.015]} />
      <Clay color={tone} position={[side*.128,-.056,.149]} scale={[.086,.073,.064]} />
      <Clay color="#e9cfac" position={[side*.085,.042,.189]} scale={[.048,.025,.020]} tilt={side*.08} />
      <Clay color={eye} position={[side*.083,.042,.207]} scale={[.022,.021,.009]} />
      <Clay color="#fbebca" position={[side*.080,.05,.214]} scale={[.007,.007,.003]} />
      <Clay color={brow} position={[side*.084,.087,.187]} scale={[.057,.019,.028]} tilt={side*(smiling ? .12 : -.22)} />
    </group>)}
    {smiling && <Fold points={[[-.068,-.104,.188],[-.007,-.124,.203],[.062,-.106,.19]]} color="#925e4c" radius={.008} />}
  </group>
}

const jacket = [new Vector2(.255,0),new Vector2(.315,.16),new Vector2(.276,.43),new Vector2(.29,.61),new Vector2(.16,.69)]

export function Bilbo() {
  return <group>
    <mesh position-y={.56} scale={[1,1,.77]} castShadow>
      <latheGeometry args={[jacket,28]} /><meshStandardMaterial color="#637b4b" roughness={.95} />
    </mesh>
    <Clay color="#c7a048" position={[0,.91,.168]} scale={[.174,.309,.111]} />
    <Clay color="#e0c497" position={[0,1.141,.167]} scale={[.134,.088,.089]} />
    {[-1, 1].map(side => <group key={side}>
      <Fold points={[[side*.067,1.21,.188],[side*.178,1.115,.214],[side*.097,.905,.254],[side*.122,.652,.22]]}
        color="#50683f" radius={.026} />
      <Clay color="#65754a" position={[side*.289,.937,.003]} scale={[.115,.212,.126]} tilt={side*.19} />
      <Clay color="#81905e" position={[side*.346,.774,.064]} scale={[.091,.13,.105]} tilt={side*.29} />
      <Clay color="#c69672" position={[side*.362,.667,.108]} scale={[.086,.102,.075]} tilt={side*.3} />
      <Clay color="#d4a07c" position={[side*.313,.676,.156]} scale={[.038,.058,.035]} />
      <Clay color="#777352" position={[side*.134,.316,-side*.031]} scale={[.131,.312,.143]} tilt={side*.08} />
      <Clay color="#bb8b66" position={[side*.15,.076,.110-side*.047]} scale={[.129,.079,.222]} tilt={side*.045} />
      {Array.from({length:5}, (_,i) => <Clay key={i} color={i%2 ? '#815a3d' : '#674c35'}
        position={[side*.150+(i-2)*.028,.139+Math.cos(i*.8)*.011,.092-side*.047+(i%2)*.038]} scale={[.032,.026,.046]} />)}
    </group>)}
    {[.74,.86,.98,1.09].map(y => <Clay key={y} color="#896038" position={[.012,y,.263]} scale={[.020,.019,.013]} />)}
    <Fold points={[[.055,.812,.270],[.133,.762,.243],[.225,.800,.178]]} radius={.008} color="#a78350" />
    <group position={[0,1.405,.018]} rotation={[.018,-.076,-.055]}>
      <Face tone="#d3a482" brow="#694833" eye="#423b29" smiling />
      <Clay color="#68452e" position={[0,.113,-.05]} scale={[.257,.194,.223]} />
      {Array.from({ length: 31 }, (_, i) => {
        const theta = i * 2.4, ring = i < 18 ? .198 : .105
        return <Clay key={i} color={['#704d32','#805537','#926447','#63442d'][i%4]}
          position={[Math.cos(theta)*ring,.166+(i<18 ? Math.sin(theta)*.018 : .093),Math.sin(theta)*ring*.91-.026]}
          scale={[.061+(i%3)*.006,.066,.075]} tilt={theta} />
      })}
    </group>
  </group>
}

const cloak = [
  new Vector2(.464,0), new Vector2(.489,.095), new Vector2(.416,.28), new Vector2(.342,.57),
  new Vector2(.351,.93), new Vector2(.406,1.08), new Vector2(.326,1.27), new Vector2(.156,1.34),
]

function Beard({ light, dark, length = .67 }: { light: string, dark: string, length?: number }) {
  return <group position={[0,-.10,.137]}>
    <Clay color={dark} position={[.012,-length*.34,.036]} scale={[.169,length*.47,.109]} />
    {[-3,-2,-1,0,1,2,3].map(i => <Fold key={i}
      points={[[i*.044,-.035,.072],[i*.043+.014,-.15,.121],[i*.025-.024,-length*.70+Math.abs(i)*.032,.106],[i*.01+.028,-length+Math.abs(i)*.073,.021]]}
      radius={.025+(i%2===0?.004:0)} color={i%3===0 ? dark : light} />)}
    {[-1,1].map(side => <Clay key={side} color={light} position={[side*.064,.032,.097]} scale={[.088,.028,.043]} tilt={side*-.23} />)}
  </group>
}

function WizardHat() {
  const crown = useMemo(() => {
    const profiles = [[.30,0,0],[.25,.15,.046],[.18,.36,.091],[.105,.54,.17],[.041,.67,.23],[.007,.73,.22]]
    const result = profiles.map(([r,y,x]) => ({ y, x, r }))
    return result
  }, [])
  return <group position={[-.008,1.92,-.037]} rotation-z={.075}>
    <mesh castShadow rotation-z={.025}><cylinderGeometry args={[.455,.477,.065,40]} /><meshStandardMaterial color="#506a7d" roughness={.87} /></mesh>
    {crown.slice(1).map((upper, i) => {
      const lower = crown[i]
      return <mesh key={i} position={[(upper.x+lower.x)/2,(upper.y+lower.y)/2,0]} rotation-z={-Math.atan2(upper.x-lower.x,upper.y-lower.y)} castShadow>
        <cylinderGeometry args={[upper.r, lower.r, Math.hypot(upper.x-lower.x,upper.y-lower.y)+.027,28]} />
        <meshStandardMaterial color={i%2 ? '#5c778a' : '#4f6b82'} roughness={.89} />
      </mesh>
    })}
    <mesh position-y={.072} castShadow><cylinderGeometry args={[.270,.30,.092,36]} /><meshStandardMaterial color="#46545c" /></mesh>
    <Clay color="#a48f63" position={[.082,.073,.289]} scale={[.04,.035,.017]} />
  </group>
}

export function Gandalf() {
  return <group scale={.98}>
    <mesh position-y={.05} scale={[1,1,.78]} castShadow receiveShadow>
      <latheGeometry args={[cloak,38]} /><meshStandardMaterial color="#747c78" roughness={.97} />
    </mesh>
    {[-1,1].map(side => <group key={side}>
      <Fold points={[[side*.253,1.197,.145],[side*.246,.86,.228],[side*.280,.45,.255],[side*.374,.112,.222]]}
        color="#59605b" radius={.033} />
      <Clay color="#838885" position={[side*.303,1.01,.034]} scale={[.154,.238,.168]} tilt={side*.19} />
      <Clay color="#544c3a" position={[side*.158,.079,.193]} scale={[.126,.076,.204]} />
    </group>)}
    <Fold points={[[-.205,1.36,.143],[-.14,1.344,.241],[.072,1.301,.268],[.243,1.268,.176]]}
      color="#c2c9bc" radius={.065} />
    <Fold points={[[.178,1.29,.210],[.219,.96,.250],[.160,.65,.227]]} color="#c2c7bb" radius={.044} />
    <group position={[-.015,1.639,.008]} rotation={[.045,-.10,.048]}>
      <Face tone="#caa383" brow="#c7c5b5" eye="#43514e" />
      <Beard light="#e1dfc7" dark="#abae9f" />
      {[-1,1].map(side => <Clay key={side} color="#cccbbb" position={[side*.179,-.089,.013]} scale={[.07,.228,.104]} tilt={side*.11} />)}
    </group>
    <WizardHat />
    <Clay color="#ca9e7a" position={[.479,1.028,.190]} scale={[.091,.083,.091]} />
    <Fold points={[[.470,.03,.219],[.507,.63,.194],[.481,1.13,.193],[.569,1.69,.184],[.608,2.10,.123]]}
      radius={.033} color="#6c5136" />
    <Fold points={[[.548,1.70,.206],[.614,1.98,.155],[.609,2.098,.14]]} radius={.009} color="#94744a" />
  </group>
}

export function Thorin() {
  return <group>
    <mesh position-y={.20} scale={[1,.76,.89]} castShadow>
      <latheGeometry args={[cloak,30]} /><meshStandardMaterial color="#40526a" roughness={.94} />
    </mesh>
    <Clay color="#586d80" position={[0,1.24,-.071]} scale={[.314,.341,.248]} />
    <group position={[0,1.28,.069]} rotation-y={.09}>
      <Face tone="#bc906d" brow="#584734" eye="#493d2e" />
      <Beard light="#795944" dark="#4f3e31" length={.45} />
    </group>
    <Fold points={[[-.247,1.15,.204],[-.079,.95,.299],[.113,.976,.285],[.226,1.14,.187]]}
      radius={.022} color="#c09a52" />
    <Fold points={[[.235,1.45,-.02],[.319,1.271,.021],[.330,1.134,.067]]} radius={.016} color="#c8c4b1" />
    <Clay color="#c9c6b6" position={[.328,1.11,.068]} scale={[.039,.055,.035]} />
    {[-1,1].map(side => <group key={side}>
      <Clay color="#607289" position={[side*.337,.88,.002]} scale={[.137,.222,.150]} tilt={side*.20} />
      <Clay color="#be9070" position={[side*.404,.714,.079]} scale={[.091,.091,.099]} />
      <Clay color="#545448" position={[side*.164,.244,.057]} scale={[.132,.213,.139]} />
      <Clay color="#473a2e" position={[side*.169,.090,.172]} scale={[.16,.085,.205]} />
    </group>)}
  </group>
}
