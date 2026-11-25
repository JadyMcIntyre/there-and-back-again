import type { Vector3Tuple } from 'three'

function Clay({ color, position, scale }: { color: string, position: Vector3Tuple, scale: Vector3Tuple }) {
  return <mesh position={position} scale={scale} castShadow>
    <sphereGeometry args={[1, 14, 10]} /><meshStandardMaterial color={color} roughness={0.92} />
  </mesh>
}

export function Bilbo() {
  return <group>
    <Clay color="#a6643c" position={[0, 0.89, 0]} scale={[0.31, 0.42, 0.22]} />
    <Clay color="#c39b4a" position={[0, 0.92, 0.16]} scale={[0.18, 0.38, 0.085]} />
    {[-1, 1].map(side => <group key={side}>
      <Clay color="#6d6744" position={[side * 0.13, 0.30, 0]} scale={[0.128, 0.30, 0.15]} />
      <Clay color="#b98761" position={[side * 0.14, 0.075, 0.086]} scale={[0.127, 0.087, 0.21]} />
      <Clay color="#7d573a" position={[side * 0.14, 0.136, 0.079]} scale={[0.086, 0.043, 0.09]} />
      <Clay color="#6b7845" position={[side * 0.31, 0.91, 0.003]} scale={[0.118, 0.25, 0.12]} />
      <Clay color="#c5906a" position={[side * 0.35, 0.69, 0.06]} scale={[0.093, 0.13, 0.091]} />
      <Clay color="#d6a47b" position={[side * 0.226, 1.37, -0.004]} scale={[0.054, 0.085, 0.062]} />
      <Clay color="#423323" position={[side * 0.077, 1.44, 0.212]} scale={[0.022, 0.025, 0.017]} />
    </group>)}
    <Clay color="#d6a47b" position={[0, 1.39, 0]} scale={[0.236, 0.248, 0.207]} />
    <Clay color="#d29a73" position={[0, 1.385, 0.21]} scale={[0.057, 0.049, 0.064]} />
    {Array.from({ length: 19 }, (_, i) => {
      const theta = i * 2.4
      const ring = i < 11 ? 0.188 : 0.105
      return <Clay key={i} color={i % 2 ? '#67442e' : '#835839'} position={[Math.cos(theta) * ring, 1.565 + (i < 11 ? 0 : 0.096), Math.sin(theta) * ring * 0.84 - 0.032]} scale={[0.089, 0.092, 0.095]} />
    })}
  </group>
}

export function Gandalf() {
  return <group scale={0.98}>
    <mesh position={[0, 0.68, -0.025]} castShadow>
      <cylinderGeometry args={[0.26, 0.45, 1.39, 14]} /><meshStandardMaterial color="#696e6a" roughness={0.97} />
    </mesh>
    <Clay color="#7b817d" position={[0, 1.1, -0.045]} scale={[0.43, 0.35, 0.29]} />
    <Clay color="#c9a081" position={[0, 1.65, 0.017]} scale={[0.223, 0.25, 0.205]} />
    <Clay color="#e2dfc7" position={[0, 1.36, 0.147]} scale={[0.235, 0.29, 0.145]} />
    <Clay color="#e1dac6" position={[0.057, 1.19, 0.151]} scale={[0.153, 0.25, 0.11]} />
    <Clay color="#c69977" position={[0, 1.63, 0.217]} scale={[0.057, 0.07, 0.058]} />
    {[-1, 1].map(side => <group key={side}>
      <Clay color="#393c39" position={[side * 0.071, 1.68, 0.213]} scale={[0.021, 0.023, 0.016]} />
      <Clay color="#d4d1bb" position={[side * 0.167, 1.59, 0.102]} scale={[0.087, 0.16, 0.099]} />
      <Clay color="#494b45" position={[side * 0.151, 0.06, 0.116]} scale={[0.126, 0.089, 0.21]} />
    </group>)}
    <group position={[0, 1.89, -0.041]} rotation-z={0.08}>
      <mesh castShadow><cylinderGeometry args={[0.46, 0.49, 0.056, 24]} /><meshStandardMaterial color="#455e72" roughness={0.88} /></mesh>
      <mesh position={[0.037, 0.272, -0.03]} rotation-z={-0.19} castShadow>
        <cylinderGeometry args={[0.015, 0.29, 0.58, 16]} /><meshStandardMaterial color="#526a80" roughness={0.87} />
      </mesh>
    </group>
    <Clay color="#767b77" position={[0.35, 1.08, 0.06]} scale={[0.15, 0.2, 0.158]} />
    <Clay color="#c9a081" position={[0.49, 1.08, 0.16]} scale={[0.096, 0.108, 0.084]} />
    <mesh position={[0.51, 1.05, 0.16]} rotation-z={-0.06} castShadow>
      <cylinderGeometry args={[0.036, 0.033, 2.04, 8]} /><meshStandardMaterial color="#684d35" roughness={0.97} />
    </mesh>
  </group>
}
