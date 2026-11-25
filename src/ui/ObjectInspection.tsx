import { lazy, Suspense, useState } from 'react'
import { BookOpen, Circle, DoorOpen, KeyRound, Minus, Plus, RotateCcw, ScanLine, Wand, Wind } from 'lucide-react'
import type { Exhibit } from '../content/schema'
import { Modal } from './Dialogs'
import { useMedia } from '../world/Viewport'

const Studio = lazy(() => import('../scenes/objects/ObjectStudio'))
const collectibleIcons = { 'plain-ring': Circle, 'thror-key': KeyRound,
  'thror-map': BookOpen, 'bilbos-pipe': Wind, 'wizard-staff': Wand, 'green-door': DoorOpen }

export function canInspect(id: string) {
  return Object.hasOwn(collectibleIcons, id)
}

export function ObjectSeal({ id }: { id: string }) {
  const Icon = collectibleIcons[id as keyof typeof collectibleIcons] ?? ScanLine
  return <Icon className="portrait-icon" size={60} strokeWidth={1} aria-hidden />
}

function hasGoldenFinish(item: Exhibit) {
  return item.id === 'plain-ring' && item.facts.some(fact => fact.id === 'gold-band')
}

export function objectArtwork(item: Exhibit) {
  if (!canInspect(item.id)) return undefined
  const variant = hasGoldenFinish(item) ? 'plain-ring-gold' : item.id
  return `/assets/objects/${variant}.webp`
}

export function ObjectInspection({ item, close }: { item: Exhibit, close: () => void }) {
  const [zoom, setZoom] = useState(1)
  const [reset, setReset] = useState(0)
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  return <Modal name={item.name} close={close}>
    <Suspense fallback={<div className="object-studio object-loading" role="status">Preparing the display…</div>}>
      <Studio key={reset} id={item.id} zoom={zoom} reduced={reduced} gold={hasGoldenFinish(item)} />
    </Suspense>
    <div className="object-toolbar">
      <span>Drag to turn · scroll or pinch to zoom</span>
      <button className="icon-button" aria-label="Zoom object in" onClick={() => setZoom(Math.min(2.3, zoom + .24))}><Plus size={15} /></button>
      <button className="icon-button" aria-label="Zoom object out" onClick={() => setZoom(Math.max(.75, zoom - .24))}><Minus size={15} /></button>
      <button className="icon-button" aria-label="Reset object view" onClick={() => { setZoom(1); setReset(reset+1) }}><RotateCcw size={15} /></button>
    </div>
    <p className="object-fact">{item.facts[0]?.text}</p>
    {item.id === 'thror-map' && <small className="object-note">An original study of a folded field map. Read the journal entry for details from the book.</small>}
  </Modal>
}
