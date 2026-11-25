import {
  ArrowDownRight, ArrowLeft, ArrowRight, BookOpen, Bookmark, ChevronRight, Compass, DoorOpen,
  Flag, Grid2X2, LocateFixed, Map, MapPin, Package, Search, UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { enhancedEdition, hobbit } from '../content/hobbit'
import { initialProgress, useProgress } from '../content/progress'
import { at, type Exhibit, type Position } from '../content/schema'
import { comparePosition, resolveDestination, visibleAtlas, type Atlas, type Destination } from '../content/spoilers'
import Viewport from '../world/Viewport'
import { BookmarkDialog, SearchDialog } from './Dialogs'
import { roman } from './Roman'

const supported = visibleAtlas(hobbit, initialProgress.position)
const routeTo = (view: Destination['view'], id?: string) => { window.location.hash = `/${view}${id ? `/${id}` : ''}` }

function useHash() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const update = () => setHash(window.location.hash)
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  return hash
}

function FactText({ facts }: { facts: Exhibit['facts'] }) {
  return <>{facts.map(fact => <p key={fact.id}>{fact.text}</p>)}</>
}

function Header({ view, position, pdfPage, openBookmark }: {
  view: Destination['view'], position: Position, pdfPage: number, openBookmark: () => void
}) {
  return <header className="topbar">
    <div className="topbar-inner">
      <a href="#/atlas" className="brand" aria-label="There and Back Again, atlas home">
        <span className="brand-mark"><Compass size={24} strokeWidth={1.2} /></span>
        <span>There <i>&amp;</i> Back Again<small>A READER’S ATLAS</small></span>
      </a>
      <nav className="nav" aria-label="Main navigation">
        <a href="#/atlas" aria-current={view !== 'journal' ? 'page' : undefined}><Map size={16} /> Atlas</a>
        <a href="#/journal" aria-current={view === 'journal' ? 'page' : undefined}><BookOpen size={16} /> Journal</a>
      </nav>
      <button type="button" className="bookmark" onClick={openBookmark} aria-label="Edit reading bookmark">
        <Bookmark size={17} /><span><strong>Chapter {roman(position.chapter)}</strong><small>PDF page {pdfPage}</small></span><ChevronRight size={15} className="bookmark-chevron" />
      </button>
    </div>
  </header>
}

function Timeline({ progress, exploration, chapters, select, reset }: {
  progress: Position, exploration?: Position, chapters: Atlas['chapters'], select: (position: Position) => void, reset: () => void
}) {
  const read = chapters.filter(chapter => chapter.completionEvent !== undefined
    && comparePosition(at(chapter.number, chapter.completionEvent), progress) <= 0).length
  const active = exploration ?? progress
  return <section className="timeline" aria-labelledby="timeline-title">
    <div className="timeline-heading">
      <div><h2 id="timeline-title">Chapter trail</h2><span>{read} {read === 1 ? 'chapter' : 'chapters'} read</span></div>
      {exploration ? <button className="text-button" type="button" onClick={reset}><LocateFixed size={15} /> Return to bookmark</button>
        : <span className="trail-bookmark"><Bookmark size={13} /> At your reading bookmark</span>}
    </div>
    <div className="chapter-strip" aria-label="Explore chapters">
      {chapters.map(chapter => {
        const complete = chapter.completionEvent !== undefined && comparePosition(at(chapter.number, chapter.completionEvent), progress) <= 0
        const isActive = chapter.number === active.chapter
        const target = chapter.number === progress.chapter ? progress : at(chapter.number, chapter.completionEvent ?? 0)
        return <button key={chapter.number} type="button" onClick={() => select(target)} aria-pressed={isActive}
          className={`chapter-stop ${isActive ? 'active' : ''} ${complete ? 'complete' : ''}`}>
          <span className="chapter-numeral">{roman(chapter.number)}</span>
          <span className="chapter-label">{chapter.title}</span>
          {isActive && <span className="chapter-dot" aria-hidden />}
        </button>
      })}
    </div>
  </section>
}

function AtlasPanel({ atlas, selected, pick, focus }: {
  atlas: Atlas, selected?: string, pick: (id: string) => void, focus: (id: string) => void
}) {
  const [mode, setMode] = useState<'detail' | 'list'>('detail')
  const place = atlas.landmarks.find(point => point.id === selected)
  useEffect(() => { setMode('detail') }, [selected])

  if (mode === 'list' || !place) return <aside className="field-panel list-panel" aria-label="Discovered locations">
    <div className="field-top"><span><MapPin size={15} /> DISCOVERED PLACES</span>{place && <button type="button" onClick={() => setMode('detail')} className="field-icon" aria-label="Return to location"><ArrowLeft size={17} /></button>}</div>
    {atlas.landmarks.length ? <div className="places-list">
      {atlas.landmarks.map(point => <button key={point.id} type="button" onClick={() => { pick(point.id); setMode('detail') }}>
        <span><strong>{point.name}</strong><small>{point.region}</small></span><ChevronRight size={15} />
      </button>)}
    </div> : <div className="field-content"><h2>An open map</h2><p>Locations appear as you reach them in the book.</p></div>}
  </aside>

  return <aside className="field-panel" aria-label="Location information">
    <div className="field-top"><span><MapPin size={15} /> FIELD NOTES</span>
      <button className="field-icon" type="button" aria-label="List discovered places" title="List discovered places" onClick={() => setMode('list')}><Grid2X2 size={17} /></button>
    </div>
    <div className={`location-art ${place.scene?.id === 'bag-end' ? 'bag-end-art' : ''}`} aria-hidden>
      {place.scene?.id === 'bag-end' ? <img src="/assets/bag-end.webp" alt="" width={620} height={331} /> : <Compass size={65} strokeWidth={0.65} />}
      <span>{place.scene ? 'THE HILL' : place.region}</span>
    </div>
    <div className="field-content">
      <span className="field-kicker">{place.region}</span>
      <h2>{place.name}</h2>
      <FactText facts={place.facts.slice(0, 1)} />
      {place.facts.length > 1 && <details className="field-more"><summary>More from the book</summary><FactText facts={place.facts.slice(1)} /></details>}
    </div>
    <div className="field-actions">
      {place.scene ? <a className="gold-button" href={`#/scene/${place.scene.id}`}>Visit {place.name} <ArrowRight size={17} /></a>
        : <button className="gold-button" type="button" onClick={() => focus(place.id)}>Find on map <LocateFixed size={17} /></button>}
      <span className="field-chapter"><Flag size={13} /> Chapter {roman(place.reveal.chapter)}</span>
    </div>
  </aside>
}

function ScenePanel({ exhibits, selected, inspect, doorOpen, toggle }: {
  exhibits: Exhibit[], selected?: string, inspect: (id: string) => void, doorOpen: boolean, toggle: () => void
}) {
  const current = exhibits.find(item => item.id === selected)
  return <aside className="field-panel scene-panel" aria-label="Bag End discoveries">
    <div className="field-top"><span><DoorOpen size={15} /> AT BAG END</span></div>
    <div className="field-content">
      <span className="field-kicker">{current?.subtitle ?? 'Chapter I'}</span>
      <h2>{current?.name ?? 'At the doorstep'}</h2>
      {current ? <FactText facts={current.facts} /> : <p>Look around the garden and inspect the people and objects you’ve discovered in the book.</p>}
      {current?.id === 'green-door' && <button type="button" className="gold-button door-button" onClick={toggle}>{doorOpen ? 'Close the door' : 'Open the door'} <DoorOpen size={16} /></button>}
    </div>
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

function Journal({ atlas, destination }: { atlas: Atlas, destination: Destination }) {
  const [tab, setTab] = useState<'character' | 'object' | 'chapter'>('character')
  const entry = atlas.exhibits.find(item => item.id === destination.id)
  useEffect(() => { if (entry) setTab(entry.kind) }, [entry])
  const items = atlas.exhibits.filter(item => item.kind === tab)
  const current = entry?.kind === tab ? entry : undefined
  const chapters = atlas.chapters.filter(chapter => chapter.recap)
  return <section className="journal-board" aria-label="Reading journal">
    <div className="journal-sidebar">
      <div className="journal-tabs" aria-label="Journal sections">
        {([['character', 'Characters'], ['object', 'Objects'], ['chapter', 'Recaps']] as const).map(([id, label]) =>
          <button key={id} type="button" aria-pressed={tab === id} onClick={() => { setTab(id); routeTo('journal') }}>{label}</button>)}
      </div>
      {tab !== 'chapter' && items.map(item => <a key={item.id} className="journal-link" href={`#/journal/${item.id}`} aria-current={current?.id === item.id ? 'true' : undefined}>
        {item.kind === 'object' ? <Package size={18} /> : <UserRound size={18} />}<span>{item.name}<small>{item.subtitle}</small></span><ChevronRight size={16} />
      </a>)}
    </div>
    <div className="journal-content">
      {tab === 'chapter' ? <>
        <h2>Chapter recaps</h2>
        {chapters.length ? chapters.map(chapter => <details key={chapter.number}>
          <summary><span>{roman(chapter.number)}</span> {chapter.title}</summary><p>{chapter.recap?.text}</p>
        </details>) : <p>Recaps appear after you complete a chapter.</p>}
      </> : current ? <>
        <span className="eyebrow">{current.subtitle}</span><h2>{current.name}</h2>
        <FactText facts={current.facts} />
        <a className="text-button" href={`#/atlas/${current.location}`}><MapPin size={16} /> View related location <ArrowRight size={15} /></a>
      </> : <div className="journal-empty">
        <BookOpen size={36} strokeWidth={1} /><h2>{tab === 'object' ? 'Object collection' : 'Character journal'}</h2>
        <p>{items.length ? 'Choose a discovery to read your notes.' : 'Discoveries appear here as you read.'}</p>
      </div>}
    </div>
  </section>
}

export default function App() {
  const { bookmark } = useProgress()
  const hash = useHash()
  const [exploration, setExploration] = useState<Position>()
  const [dialog, setDialog] = useState<'search' | 'bookmark'>()
  const [inspectId, setInspectId] = useState<string>()
  const [doorOpen, setDoorOpen] = useState(false)
  const [focus, setFocus] = useState<{ id: string, time: number }>()
  const atlas = useMemo(() => visibleAtlas(hobbit, bookmark.position, exploration), [bookmark.position, exploration])
  const chapters = useMemo(() => visibleAtlas(hobbit, bookmark.position).chapters, [bookmark.position])
  const destination = resolveDestination(hash, atlas)
  const scene = destination.view === 'scene' ? atlas.landmarks.find(point => point.scene?.id === destination.id) : undefined
  const selected = destination.view === 'atlas' ? destination.id ?? atlas.landmarks[0]?.id : undefined
  const exhibits = scene ? atlas.exhibits.filter(item => item.location === scene.id) : []
  const exhibit = exhibits.find(item => item.id === inspectId)
  const progress = bookmark.position
  const title = scene?.name ?? (destination.view === 'journal' ? 'The Reader’s Journal' : 'The Wilderland Atlas')
  const explorationChapter = exploration && chapters.find(entry => entry.number === exploration.chapter)

  useEffect(() => {
    if (!scene) { setInspectId(undefined); setDoorOpen(false) }
  }, [scene])

  function setTrail(position?: Position) {
    setExploration(position && comparePosition(position, progress) !== 0 ? position : undefined)
    setFocus(undefined)
  }

  function selectPlace(id: string) {
    setFocus(undefined)
    routeTo('atlas', id)
  }

  return <>
    <a href="#main-content" className="skip-link" onClick={event => {
      event.preventDefault()
      document.getElementById('main-content')?.focus()
    }}>Skip to the atlas</a>
    <Header view={destination.view} position={progress} pdfPage={bookmark.pdfPage} openBookmark={() => setDialog('bookmark')} />
    <main id="main-content" tabIndex={-1} className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow page-eyebrow">
            {scene ? <a href={`#/atlas/${scene.id}`}><ArrowLeft size={14} /> BACK TO THE ATLAS</a>
              : <><span /> THE HOBBIT <b>·</b> {enhancedEdition.name.toUpperCase()}</>}
          </div>
          <h1>{title}</h1>
          <p>{scene ? 'Hobbiton · The Hill' : destination.view === 'journal'
            ? 'Your notes on places, people and things encountered along the way.'
            : 'Follow the company’s journey, one chapter at a time.'}</p>
        </div>
        <button type="button" className="search-button" aria-label="Search atlas" onClick={() => setDialog('search')}><Search size={18} /> <span>Search atlas</span></button>
      </div>
      {explorationChapter && <div className="exploration-status"><ArrowDownRight size={15} /> Exploring Chapter {roman(explorationChapter.number)} <b>·</b> {explorationChapter.title}</div>}
      {destination.view === 'journal' ? <Journal atlas={atlas} destination={destination} /> :
        <div className="atlas-board">
          <Viewport key={scene?.id ?? 'atlas'} atlas={atlas} selected={selected} select={selectPlace} focus={!scene && focus?.id === selected ? focus : undefined} scene={scene?.scene?.id}
            exhibits={exhibits} inspect={setInspectId} exhibit={exhibit?.id} doorOpen={doorOpen} />
          {scene
            ? <ScenePanel exhibits={exhibits} selected={exhibit?.id} inspect={setInspectId} doorOpen={doorOpen} toggle={() => setDoorOpen(value => !value)} />
            : <AtlasPanel atlas={atlas} selected={selected} pick={selectPlace} focus={id => setFocus({ id, time: performance.now() })} />}
        </div>}
      <Timeline progress={progress} exploration={exploration} chapters={chapters} select={setTrail} reset={() => setTrail()} />
    </main>
    {dialog === 'search' && <SearchDialog atlas={atlas} close={() => setDialog(undefined)}
      navigate={(view, id) => { setFocus(undefined); routeTo(view, id) }} />}
    {dialog === 'bookmark' && <BookmarkDialog chapters={supported.chapters} close={() => setDialog(undefined)}
      saved={() => { setExploration(undefined); setFocus(undefined); setDialog(undefined) }} />}
  </>
}
