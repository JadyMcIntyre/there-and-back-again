import {
  ArrowLeft, BookOpen, Bookmark, ChevronLeft, ChevronRight, Compass, LocateFixed, Lock, Map, Maximize, Minimize, NotebookPen, Search,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { enhancedEdition, hobbit } from '../content/hobbit'
import { useProgress } from '../content/progress'
import { chapterSlots, completeEvent } from '../content/reading'
import { at, type Position } from '../content/schema'
import { chapterPlace, comparePosition, historicalPosition, resolveDestination, scenePlace, visibleAtlas, type Atlas, type Destination } from '../content/spoilers'
import { sceneId, scenes } from '../scenes/registry'
import type { CameraPose } from '../world/CameraRig'
import WorldStage, { type World, type WorldShortcuts } from '../world/WorldStage'
import { BookmarkDialog, CommandPalette, ShortcutDialog } from './Dialogs'
import { AtlasPanel, ScenePanel } from './FieldNotes'
import Journal from './Journal'
import { atlasLink, navigateTo, type LinkTo } from './navigation'
import { roman } from './Roman'
import { shortcuts, useShortcuts, type ShortcutActions } from './shortcuts'

function useHash() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const update = () => setHash(window.location.hash)
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  return hash
}

function Header({ view, position, pdfPage, openBookmark, href, search }: {
  view: Destination['view'], position: Position, pdfPage: number, openBookmark: () => void, href: LinkTo, search: () => void
}) {
  return <header className="topbar">
    <div className="topbar-inner">
      <a href={href('atlas')} className="brand" aria-label="There and Back Again, atlas home">
        <span className="brand-mark"><Compass size={24} strokeWidth={1.2} /></span>
        <span>There <i>&amp;</i> Back Again<small>A READER’S ATLAS</small></span>
      </a>
      <nav className="nav" aria-label="Main navigation">
        <a href={href('atlas')} aria-label="Atlas" title="Atlas" aria-current={view !== 'journal' ? 'page' : undefined}><Map size={16} /><span>Atlas</span></a>
        <a href={href('journal')} aria-label="Journal" title="Journal" aria-current={view === 'journal' ? 'page' : undefined}><BookOpen size={16} /><span>Journal</span></a>
      </nav>
      <div className="topbar-actions"><button className="search-button" type="button" aria-label="Search atlas" title={shortcuts.palette.hint} aria-keyshortcuts="Control+K Meta+K" onClick={search}><Search size={17} /><span>Search</span></button>
      <button type="button" className="bookmark" onClick={openBookmark} aria-label="Edit reading bookmark">
        <Bookmark size={17} /><span><strong>Chapter {roman(position.chapter)}</strong><small>PDF page {pdfPage}</small></span><ChevronRight size={15} className="bookmark-chevron" />
      </button></div>
    </div>
  </header>
}

function Timeline({ progress, exploration, chapters, select, reset }: {
  progress: Position, exploration?: Position, chapters: Atlas['chapters'], select: (position: Position) => void, reset: () => void
}) {
  const slots = chapterSlots(progress, chapters)
  const read = slots.filter(chapter => chapter.complete).length
  const active = exploration ?? progress
  const strip = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const row = strip.current
    const current = row?.querySelector<HTMLElement>('.active')
    if (!current || !row) return
    row.scrollLeft = current.offsetLeft - (row.clientWidth - current.offsetWidth) / 2
  }, [active.chapter])
  return <section className="timeline" aria-labelledby="timeline-title">
    <div className="timeline-heading">
      <div><h2 id="timeline-title">Chapter trail</h2><span>{read} {read === 1 ? 'chapter' : 'chapters'} read</span></div>
      <div className="trail-tools">
        {exploration ? <button className="text-button" type="button" onClick={reset}><LocateFixed size={15} /> Return to bookmark</button>
          : <span className="trail-bookmark"><Bookmark size={13} /> At your bookmark</span>}
        <div className="trail-scroll">
          <button type="button" aria-label="Earlier chapters" onClick={() => strip.current?.scrollBy({ left: -340 })}><ChevronLeft size={15} /></button>
          <button type="button" aria-label="Later chapters" onClick={() => strip.current?.scrollBy({ left: 340 })}><ChevronRight size={15} /></button>
        </div>
      </div>
    </div>
    <div className="chapter-strip full-trail" ref={strip} aria-label="Explore chapters" onKeyDown={event => {
      if ((event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') || event.altKey || event.ctrlKey || event.metaKey) return
      const available = Array.from(event.currentTarget.querySelectorAll('button:not(:disabled)'))
      const index = available.indexOf(event.target as HTMLButtonElement)
      const next = available[index + (event.key === 'ArrowRight' ? 1 : -1)] as HTMLButtonElement | undefined
      if (index < 0 || !next) return
      event.preventDefault()
      next.focus()
      next.click()
    }}>
      {slots.map(chapter => {
        const isActive = chapter.number === active.chapter
        const label = chapter.title ? `${roman(chapter.number)} ${chapter.title}`
          : `Chapter ${roman(chapter.number)}${chapter.unlocked ? '' : ' · Undiscovered'}`
        return <button key={chapter.number} type="button" disabled={!chapter.unlocked}
          onClick={() => select(chapter.target)} aria-pressed={isActive} aria-label={label} title={label}
          className={`chapter-stop ${isActive ? 'active' : ''} ${chapter.complete ? 'complete' : ''} ${chapter.unlocked ? '' : 'locked'}`}>
          <span className="chapter-numeral">{roman(chapter.number)}</span>
          {chapter.title && <span className="chapter-label">{chapter.title}</span>}
          {!chapter.unlocked && <Lock size={10} aria-hidden />}
          {isActive && <span className="chapter-dot" aria-hidden />}
        </button>
      })}
    </div>
  </section>
}

export default function App() {
  const { bookmark } = useProgress()
  const hash = useHash()
  const [dialog, setDialog] = useState<'search' | 'bookmark' | 'help'>()
  const returnFocus = useRef<HTMLElement | null>(null)
  const worldShortcuts = useRef<WorldShortcuts | null>(null)
  const [inspectId, setInspectId] = useState<string>()
  const [doorOpen, setDoorOpen] = useState(false)
  const [focus, setFocus] = useState<{ id: string, time: number }>()
  const [notesOpen, setNotesOpen] = useState(() => window.matchMedia('(min-width: 761px)').matches)
  const [immersive, setImmersive] = useState(false)
  const atlasPose = useRef<CameraPose | undefined>(undefined)
  const atlasSelection = useRef<string | undefined>(undefined)
  const lastView = useRef<Destination['view'] | undefined>(undefined)
  const lastExploredChapter = useRef<number | undefined>(undefined)
  const progress = bookmark.position
  const knowledge = useMemo(() => visibleAtlas(hobbit, progress), [progress])
  const chapters = knowledge.chapters
  const chapterQuery = hash.split('?')[1] ?? ''
  const exploration = useMemo(() => historicalPosition(`?${chapterQuery}`, progress, chapters), [chapterQuery, progress, chapters])
  const atlas = useMemo(() => visibleAtlas(hobbit, progress, exploration), [progress, exploration])
  const destination = resolveDestination(hash, atlas, knowledge)
  const desired = destination.view === 'scene' ? sceneId(destination.id) ?? 'atlas' : 'atlas'
  const chapterContext = exploration && atlas.chapters.find(entry => entry.number === exploration.chapter)
  const knownSelection = atlas.landmarks.find(place => place.id === atlasSelection.current)?.id
  const chapterSelection = exploration ? chapterPlace(atlas, exploration) : undefined
  const selected = destination.view === 'atlas'
    ? destination.id ?? chapterSelection ?? knownSelection ?? atlas.landmarks[0]?.id
    : knownSelection ?? scenePlace(atlas, desired)?.id
  const href = useCallback<LinkTo>((view, id) => atlasLink(view, id, exploration), [exploration])
  const journalHref: LinkTo = (view, id) => {
    if (view === 'atlas' && id && !atlas.landmarks.some(place => place.id === id) ||
      view === 'scene' && !scenePlace(atlas, id)) return atlasLink(view, id)
    return href(view, id)
  }
  const back = href('atlas', knownSelection ?? selected)
  const cancel = useCallback((origin: World) => navigateTo(origin === 'atlas' ? back : href('scene', origin)), [back, href])
  const inJournal = destination.view === 'journal'
  const scenePanelOpen = notesOpen && !immersive

  useEffect(() => {
    if (destination.view === 'atlas') atlasSelection.current = selected
  }, [destination.view, selected])
  useEffect(() => {
    if (desired === 'atlas') { setInspectId(undefined); setDoorOpen(false) }
  }, [desired])
  useEffect(() => {
    const explicitPlace = destination.view === 'atlas' && !!destination.id
    const returningFromJournal = lastView.current === 'journal' || lastView.current === undefined
    const newHistoricalChapter = exploration?.chapter !== lastExploredChapter.current
    lastView.current = destination.view
    lastExploredChapter.current = exploration?.chapter
    if (destination.view === 'atlas' && selected && (explicitPlace && returningFromJournal || newHistoricalChapter && !!exploration)) {
      setFocus({ id: selected, time: performance.now() })
      if (exploration) setNotesOpen(true)
    }
  }, [destination.view, destination.id, exploration, selected])

  useEffect(() => {
    if (!hash) return
    const requested = hash.split('?')[0]
    const badChapter = !!chapterQuery && !exploration
    const badEntry = /^#\/(atlas|scene|journal)\/[^/]/.test(requested) && !destination.id
    if (!badChapter && !badEntry) return
    const canonical = href(destination.view, destination.view === 'atlas' ? selected : destination.id)
    if (canonical === hash) return
    window.history.replaceState(null, '', canonical)
    window.dispatchEvent(new Event('hashchange'))
  }, [chapterQuery, destination.id, destination.view, exploration, hash, href, selected])

  function setTrail(position?: Position) {
    const active = position && comparePosition(position, progress) < 0 ? position : undefined
    const next = visibleAtlas(hobbit, progress, active)
    const selectedPlace = chapterPlace(next, active ?? progress)
    navigateTo(atlasLink('atlas', selectedPlace, active))
    if (selectedPlace) setFocus({ id: selectedPlace, time: performance.now() })
    setNotesOpen(true)
  }

  function selectPlace(id: string) {
    setNotesOpen(true)
    navigateTo(href('atlas', id))
  }

  function inspect(id: string) {
    setInspectId(id)
    setNotesOpen(true)
  }

  function closeNotes() {
    setNotesOpen(false)
  }

  function searchNavigate(view: Destination['view'], id: string) {
    if (view === 'atlas') {
      setFocus({ id, time: performance.now() })
      setNotesOpen(true)
    }
    navigateTo(journalHref(view, id))
  }

  function openDialog(view: 'search' | 'help') {
    if (!dialog) returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setDialog(view)
  }

  function closePalette() {
    setDialog(undefined)
    requestAnimationFrame(() => {
      const previous = returnFocus.current
      if (previous?.isConnected) previous.focus({ preventScroll: true })
      else document.getElementById('main-content')?.focus({ preventScroll: true })
    })
  }

  function activatePlace(id: string) {
    const place = atlas.landmarks.find(item => item.id === id)
    if (!place || desired !== 'atlas') return
    if (place.scene) navigateTo(href('scene', place.scene.id))
    else setFocus({ id, time: performance.now() })
  }

  function openExhibit(id: string) {
    const place = scenePlace(atlas, desired)
    if (desired !== 'atlas' && atlas.exhibits.some(item => item.id === id && item.location === place?.id)
      && scenes[desired].exhibits.includes(id)) navigateTo(href('journal', id))
  }

  const actions: ShortcutActions = {
    palette: () => openDialog('search'),
    focus: () => worldShortcuts.current?.focus(),
    reset: () => worldShortcuts.current?.reset(),
    immersive: () => setImmersive(value => !value),
    atlas: () => navigateTo(href('atlas')),
    journal: () => navigateTo(href('journal')),
    bookmark: () => setTrail(),
    help: () => openDialog('help'),
  }
  useShortcuts(actions, !!dialog, worldShortcuts)

  const trail = <Timeline progress={progress} exploration={exploration} chapters={chapters} select={setTrail} reset={() => setTrail()} />

  return <div className={`atlas-app ${inJournal ? 'journal-view' : 'world-view'} ${immersive ? 'is-immersive' : ''}`}>
    <a href="#main-content" className="skip-link" onClick={event => {
      event.preventDefault()
      document.getElementById('main-content')?.focus()
    }}>Skip to the atlas</a>
    <Header view={destination.view} position={progress} pdfPage={bookmark.pdfPage} openBookmark={() => setDialog('bookmark')}
      href={href} search={actions.palette} />
    <main id="main-content" tabIndex={-1} className={inJournal ? 'page journal-page' : 'world-page'}>
      {inJournal ? <>
        <div className="journal-masthead"><div className="eyebrow">{hobbit.title} · {enhancedEdition.name}</div>
          <h1>The Reader’s Journal</h1>
          {exploration && <button className="historical-pill" type="button" onClick={() => setTrail()}>Atlas set to Chapter {roman(exploration.chapter)} <span>Return to bookmark</span></button>}
        </div>
        <Journal atlas={knowledge} destination={destination} href={journalHref} />
      </> :
        <WorldStage desired={desired} atlas={atlas} selected={selected} select={selectPlace} activate={activatePlace} openExhibit={openExhibit} shortcuts={worldShortcuts}
          inspect={inspect} exhibit={inspectId} doorOpen={doorOpen} focus={focus} panelOpen={scenePanelOpen} immersive={immersive}
          atlasPose={atlasPose} cancel={cancel}>
          {(shown) => {
            const place = shown !== 'atlas' ? scenePlace(atlas, shown) : undefined
            const exhibits = place && shown !== 'atlas' ? atlas.exhibits.filter(item => item.location === place.id && scenes[shown].exhibits.includes(item.id)) : []
            const interior = shown === 'bag-end-interior'
            const canEnter = place?.scene?.rooms.some(room => room.id === 'bag-end-interior')
            const title = interior ? 'Inside Bag End' : place?.name ?? 'The Wilderland Atlas'
            return <>
              <div className="world-context">
                {(place || desired !== 'atlas') && <a className="back-to-atlas" href={back}><ArrowLeft size={15} /> Back to the atlas</a>}
                {(interior || desired === 'bag-end-interior') && <a className="back-to-atlas back-outside" href={href('scene', 'bag-end')}><ArrowLeft size={15} /> Return outside</a>}
                <div className="world-heading"><h1>{title}</h1>
                {(!immersive || exploration) && <div className="world-subtitle">
                  {exploration ? <>Exploring Chapter {roman(exploration.chapter)}{chapterContext && <> <b>·</b> {chapterContext.title}</>}</>
                    : place ? `${place.region} · Chapter ${roman(place.reveal.chapter)}` : `${hobbit.title} · ${enhancedEdition.name}`}
                </div>}</div>
              </div>
              <div className="world-tools">
                <button type="button" className="world-tool" aria-label={immersive ? 'Exit immersive mode' : 'Enter immersive mode'}
                  title={`${immersive ? 'Exit' : 'Enter'} immersive mode (I)`} aria-pressed={immersive} onClick={() => setImmersive(value => !value)}>
                  {immersive ? <Minimize size={19} /> : <Maximize size={19} />}
                </button>
              </div>
              {scenePanelOpen ? <div className="field-overlay" id="field-notes">
                {place ? <ScenePanel interior={interior} moment={knowledge.exhibits.some(item => item.id === 'thror-map') && shown !== 'atlas' ? {
                  quiet: comparePosition(atlas.cutoff, at(1, 2)) < 0,
                  choose(quiet) {
                    const gathering = progress.chapter === 1 ? progress : at(1, completeEvent)
                    const target = quiet ? at(1, 1) : gathering
                    navigateTo(atlasLink('scene', shown, comparePosition(target, progress) < 0 ? target : undefined))
                  },
                } : undefined} enter={canEnter ? href('scene', 'bag-end-interior') : undefined} exhibits={exhibits} selected={inspectId} inspect={inspect} doorOpen={doorOpen}
                  toggle={() => setDoorOpen(value => !value)} close={closeNotes} href={href} />
                  : <AtlasPanel atlas={atlas} selected={selected} pick={id => { selectPlace(id); setFocus({ id, time: performance.now() }) }}
                    focus={id => setFocus({ id, time: performance.now() })} href={href} chapter={chapterContext} close={closeNotes} />}
              </div> : !immersive && <button type="button" className="notes-peek" onClick={() => setNotesOpen(true)}
                aria-label="Open field notes" aria-expanded={false}><NotebookPen size={17} /><span>{place?.name ?? atlas.landmarks.find(entry => entry.id === selected)?.name ?? 'Discovered places'}</span><b>Field notes</b></button>}
              {!immersive && trail}
              {shown === 'atlas' && !immersive && <div className="map-legend">
                {atlas.routes.length > 0 && <><span className="route-sample" /> Company’s route <span className="legend-divider" /></>}
                <span className="mist-sample" /> Discovery mist
              </div>}
            </>
          }}
        </WorldStage>}
    </main>
    {dialog === 'search' && <CommandPalette atlas={knowledge} world={atlas} close={closePalette} navigate={searchNavigate}
      visit={id => navigateTo(href('scene', id))} actions={actions} canControl={!!worldShortcuts.current} />}
    {dialog === 'help' && <ShortcutDialog close={closePalette} />}
    {dialog === 'bookmark' && <BookmarkDialog chapters={chapters} close={() => setDialog(undefined)}
      saved={() => { navigateTo(atlasLink('atlas')); setFocus(undefined); setDialog(undefined) }} />}
  </div>
}
