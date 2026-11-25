import { ArrowLeft, ArrowRight, BookOpen, ChevronRight, DoorOpen, Grid2X2, LocateFixed, MapPin, Minus, Package, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Exhibit } from '../content/schema'
import type { Atlas } from '../content/spoilers'
import type { LinkTo } from './navigation'
import { FactText } from './Journal'
import { roman } from './Roman'

function CloseNotes({ close }: { close: () => void }) {
  return <button className="field-icon" type="button" onClick={close} aria-label="Collapse field notes" title="Collapse field notes"><Minus size={17} /></button>
}

export function AtlasPanel({ atlas, selected, pick, focus, href, chapter, close }: {
  atlas: Atlas, selected?: string, pick: (id: string) => void, focus: (id: string) => void
  href: LinkTo, chapter?: Atlas['chapters'][number], close: () => void
}) {
  const [mode, setMode] = useState<'detail' | 'list'>('detail')
  const place = atlas.landmarks.find(point => point.id === selected)
  useEffect(() => { setMode('detail') }, [selected])

  if (mode === 'list' || !place) return <aside className="field-panel list-panel" aria-label="Discovered locations">
    <div className="field-top"><span><MapPin size={15} /> DISCOVERED PLACES</span><div>
      {place && <button type="button" onClick={() => setMode('detail')} className="field-icon" aria-label="Return to location"><ArrowLeft size={17} /></button>}
      <CloseNotes close={close} />
    </div></div>
    {atlas.landmarks.length ? <div className="places-list">
      {atlas.landmarks.map(point => <button key={point.id} type="button" onClick={() => { pick(point.id); setMode('detail') }}>
        <span><strong>{point.name}</strong><small>{point.region}</small></span><ChevronRight size={15} />
      </button>)}
    </div> : <div className="field-content"><h2>An open map</h2><p>Locations appear as you reach them in the book.</p></div>}
  </aside>

  return <aside className="field-panel" aria-label="Location information">
    <div className="field-top"><span><MapPin size={15} /> FIELD NOTES</span>
      <div><button className="field-icon" type="button" aria-label="List discovered places" title="List discovered places" onClick={() => setMode('list')}><Grid2X2 size={17} /></button><CloseNotes close={close} /></div>
    </div>
    {place.scene?.id === 'bag-end' && <div className="location-art bag-end-art" aria-hidden><img src="/assets/bag-end.webp" alt="" width={620} height={331} /></div>}
    <div className="field-content">
      <span className="field-kicker">{place.region}</span>
      <h2>{place.name}</h2>
      <FactText facts={place.facts.slice(0, 1)} />
      {place.facts.length > 1 && <details className="field-more"><summary>More from the book</summary><FactText facts={place.facts.slice(1)} /></details>}
    </div>
    {chapter && <div className="chapter-note"><span>CHAPTER {roman(chapter.number)}</span><h3>{chapter.title}</h3>
      {chapter.recap ? <><p>{chapter.recap.events[0]?.text}</p><a href={href('journal', `chapter-${chapter.number}`)}>Read chapter recap <ArrowRight size={14} /></a></>
        : <p>Exploring this chapter at your reading position.</p>}
    </div>}
    <div className="field-actions">
      {place.scene ? <a className="gold-button" href={href('scene', place.scene.id)}>Visit {place.name} <ArrowRight size={17} /></a>
        : <button className="gold-button" type="button" onClick={() => focus(place.id)}>Find on map <LocateFixed size={17} /></button>}
      <a className="field-chapter" href={href('journal', place.id)}><BookOpen size={13} /> Location in the journal <ArrowRight size={13} /></a>
    </div>
  </aside>
}

export function ScenePanel({ exhibits, selected, inspect, doorOpen, toggle, close, href, interior, enter, moment }: {
  exhibits: Exhibit[], selected?: string, inspect: (id: string) => void, doorOpen: boolean, toggle: () => void, close: () => void, href: LinkTo, interior: boolean, enter?: string, moment?: { quiet: boolean, choose: (quiet: boolean) => void }
}) {
  const current = exhibits.find(item => item.id === selected)
  const canOpen = !interior && current?.id === 'green-door'
  return <aside className="field-panel scene-panel"  aria-label="Bag End discoveries">
    <div className="field-top"><span><DoorOpen size={15} /> {interior ? 'INSIDE BAG END' : 'AT BAG END'}</span><CloseNotes close={close} /></div>
    <div className="field-content">
      <span className="field-kicker">{current?.subtitle ?? 'Chapter I'}</span>
      <h2>{current?.name ?? (interior ? 'Hearth and hall' : 'At the doorstep')}</h2>
      {current ? <FactText facts={current.facts.filter(fact => fact.reveal.chapter === 1)} /> : interior ? <p>Explore the panelled passage, the laid table and the fire. The cutaway imagines how the rooms might fit together.</p>
        : <p>Look around the garden and inspect the people and objects you’ve discovered in the book.</p>}
      {canOpen && <button type="button" className="gold-button door-button" onClick={toggle}>{doorOpen ? 'Close the door' : 'Open the door'} <DoorOpen size={16} /></button>}
      {!interior && doorOpen && enter && <a className="gold-button door-button" href={enter}>Enter Bag End <ArrowRight size={16} /></a>}
    </div>
    {current && <a className="field-profile-link" href={href('journal', current.id)}>Read journal entry <ArrowRight size={14} /></a>}
    {moment && <label className="scene-moment">Bag End moment
      <select value={moment.quiet ? 'morning' : 'gathering'} onChange={event => moment.choose(event.target.value === 'morning')}>
        <option value="morning">Quiet morning</option><option value="gathering">Unexpected gathering</option>
      </select>
    </label>}
    <div className="places-list exhibit-list">
      {exhibits.map(item => {
        const Icon = item.kind === 'character' ? UserRound : Package
        return <button key={item.id} type="button" aria-pressed={item.id === selected} onClick={() => inspect(item.id)}>
          <Icon size={17} /><span><strong>{item.name}</strong><small>{item.subtitle}</small></span><ChevronRight size={15} />
        </button>
      })}
    </div>
  </aside>
}

