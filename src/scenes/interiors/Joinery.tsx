import { useMemo, useEffect, type ReactNode } from 'react'
import { CatmullRomCurve3, ExtrudeGeometry, Path, Shape, Vector3, type Vector3Tuple } from 'three'

export function Timber({ at, size, color = '#865f3c', angle = 0 }: {
  at: Vector3Tuple, size: Vector3Tuple, color?: string, angle?: number,
}) {
  return <mesh position={at} rotation-y={angle} castShadow receiveShadow>
    <boxGeometry args={size} /><meshStandardMaterial color={color} roughness={.89} />
  </mesh>
}

export function Moulding({ radius, center, color, half = false, thickness = .11 }: {
  radius: number, center: Vector3Tuple, color: string, half?: boolean, thickness?: number,
}) {
  const curve = useMemo(() => new CatmullRomCurve3(Array.from({ length: 37 }, (_, i) => {
    const a = i / 36 * Math.PI * (half ? 1 : 2)
    return new Vector3(radius * Math.cos(a), radius * Math.sin(a), 0)
  })), [half, radius])
  return <mesh position={center} castShadow receiveShadow>
    <tubeGeometry args={[curve, 48, thickness, 9, !half]} /><meshStandardMaterial color={color} roughness={.87} />
  </mesh>
}

export function RoundWindow({ center, radius }: { center: Vector3Tuple, radius: number }) {
  const [x,y,z] = center
  return <group>
    <mesh position={center}><circleGeometry args={[radius, 44]} /><meshStandardMaterial color="#d9be7d" emissive="#ffd98e" emissiveIntensity={0.9} /></mesh>
    <Moulding radius={radius} center={[x,y,z+.04]} color="#513623" thickness={.14} />
    <Moulding radius={radius+.20} center={[x,y,z-.01]} color="#a27c51" thickness={.075} />
    <Timber at={[x,y,z+.04]} size={[radius*1.97,.08,.08]} color="#674326" />
    <Timber at={[x,y,z+.04]} size={[.08,radius*1.97,.08]} color="#674326" />
    <Timber at={[x,y-radius-.18,z+.21]} size={[radius*2.23,.12,.48]} color="#a97e50" />
  </group>
}

export function RoundedWall({ at, width, height, opening, children }: {
  at: Vector3Tuple, width: number, height: number, opening?: { x: number, y: number, radius: number }, children?: ReactNode,
}) {
  const geometry = useMemo(() => {
    const wall = new Shape()
    wall.moveTo(-width / 2, 0)
    wall.lineTo(width / 2, 0)
    wall.lineTo(width / 2, height - .32)
    wall.quadraticCurveTo(width / 2, height, width / 2 - .45, height)
    wall.lineTo(-width / 2 + .45, height)
    wall.quadraticCurveTo(-width / 2, height, -width / 2, height - .32)
    wall.closePath()
    if (opening) {
      const circle = new Path()
      circle.absarc(opening.x, opening.y, opening.radius, 0, Math.PI * 2, true)
      wall.holes.push(circle)
    }
    return new ExtrudeGeometry(wall, { depth: .31, bevelThickness: .055, bevelSize: .05, bevelSegments: 2, curveSegments: 26 })
  }, [width, height, opening])
  useEffect(() => () => geometry.dispose(), [geometry])
  return <group position={at}>
    <mesh geometry={geometry} receiveShadow castShadow><meshStandardMaterial color="#bc9a72" roughness={.94} /></mesh>
    {children}
  </group>
}
