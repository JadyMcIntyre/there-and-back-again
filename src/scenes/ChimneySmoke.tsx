import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { CanvasTexture, type Sprite, type SpriteMaterial } from 'three'
import { useAmbientFrames } from './ambient'

export function ChimneySmoke({ animate }: { animate: boolean }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 64
    const context = canvas.getContext('2d')!
    const haze = context.createRadialGradient(30,29,2,32,32,30)
    haze.addColorStop(0,'rgba(255,255,255,.9)')
    haze.addColorStop(.58,'rgba(255,255,255,.35)')
    haze.addColorStop(1,'rgba(255,255,255,0)')
    context.fillStyle = haze
    context.fillRect(0,0,64,64)
    return new CanvasTexture(canvas)
  }, [])
  const puffs = useRef<Array<Sprite | null>>([])
  useEffect(() => () => texture.dispose(), [texture])
  useAmbientFrames(animate)
  useFrame(({ clock }) => {
    if (!animate || document.hidden) return
    puffs.current.forEach((sprite,index) => {
      if (!sprite) return
      const time = (clock.elapsedTime * .29 + index*.25) % 1
      sprite.position.set(-2.64+time**1.7*1.20,4.94+time*1.70,-2.1+time*.19)
      sprite.scale.setScalar(.30+time*.92)
      ;(sprite.material as SpriteMaterial).opacity = Math.sin(time*Math.PI)*.33
    })
  })
  return <>{[0,1,2,3].map(i => <sprite key={i} ref={sprite => { puffs.current[i] = sprite }}
    position={[-2.64+i*i*.051,5.01+i*.34,-2.1]} scale={.33+i*.17}>
    <spriteMaterial map={texture} color="#f2eadb" opacity={.15-i*.026} transparent depthWrite={false} />
  </sprite>)}</>
}
