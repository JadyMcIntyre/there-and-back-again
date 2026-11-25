import { BookOpen, Compass, DoorOpen, MapPin, Package, Search, UserRound, X, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react'
import { enhancedEdition } from '../content/hobbit'
import { useProgress } from '../content/progress'
import { chapterNumbers, chapterRange, completeEvent, eventsForChapter } from '../content/reading'
import { at } from '../content/schema'
import { comparePosition, type Atlas } from '../content/spoilers'
import { useOfflineStatus } from './offline'
import { roman } from './Roman'
import { shortcuts, type Shortcut, type ShortcutActions } from './shortcuts'

export function Modal({ name, close, children, initialFocus }: { name: string, close: () => void, children: ReactNode, initialFocus?: RefObject<HTMLElement | null> }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const node = dialog.current
    node?.showModal()
    initialFocus?.current?.focus({ preventScroll: true })
    return () => { node?.close() }
  }, [initialFocus])
  return <dialog ref={dialog} className="dialog" aria-labelledby="dialog-title"
    onKeyDownCapture={event => {
      if (event.key === 'Escape') { event.preventDefault(); close() }
    }}
    onCancel={event => { event.preventDefault(); close() }}
    onClick={event => { if (event.target === event.currentTarget) close() }}>
    <div className="dialog-inner">
      <div className="dialog-heading"><h2 id="dialog-title">{name}</h2>
        <button type="button" className="icon-button" aria-label="Close dialog" onClick={close}><X size={19} /></button>
      </div>
      {children}
    </div>
  </dialog>
}

type Result = { id: string, title: string, subtitle?: string, group: string, icon: LucideIcon, run: () => void, hint?: string }

export function CommandPalette({ atlas, world, close, navigate, visit, actions, canControl, canWalk }: {
  atlas: Atlas, world: Atlas, close: () => void, navigate: (view: 'atlas' | 'journal', id: string) => void,
  visit: (id: string) => void, actions: ShortcutActions, canControl: boolean, canWalk: boolean
}) {
  const [query, setQuery] = useState('')
  const buttons = useRef<Array<HTMLButtonElement | null>>([])
  const input = useRef<HTMLInputElement>(null)
  const needle = query.trim().toLowerCase()
  const commands = (Object.keys(shortcuts) as Shortcut[]).filter(id => id !== 'palette' && (id !== 'walk' || canWalk)
    && (canControl || !['focus', 'reset', 'immersive'].includes(id)))
  const entries: Result[] = atlas.searchResults(query).map(({ item, score }) => {
    const place = 'region' in item
    return {
      id: item.id, title: item.name, subtitle: place ? item.region : item.subtitle,
      group: score === 3 ? 'Related notes' : place ? 'Locations' : item.kind === 'object' ? 'Objects' : 'Characters',
      icon: place ? MapPin : item.kind === 'object' ? Package : UserRound,
      run: () => navigate(place && item.point ? 'atlas' : 'journal', item.id),
    }
  })
  const recapResults: Result[] = needle ? atlas.chapters.flatMap(chapter => {
    if (!chapter.recap || !`${chapter.title} chapter ${roman(chapter.number)} recap`.toLowerCase().includes(needle)) return []
    const id = `chapter-${chapter.number}`
    return [{ id, title: chapter.title, subtitle: `Chapter ${roman(chapter.number)} recap`, group: 'Chapter recaps', icon: BookOpen,
      run: () => navigate('journal', id) }]
  }) : []
  const visitResults: Result[] = world.landmarks.flatMap(place => {
    const id = place.scene?.id
    if (!id || (needle && !`visit ${place.name}`.toLowerCase().includes(needle))) return []
    return [{ id: `visit-${id}`, title: `Visit ${place.name}`, group: 'Places to visit', icon: DoorOpen, run: () => visit(id) }]
  })
  const actionResults: Result[] = commands.filter(id => shortcuts[id].label.toLowerCase().includes(needle)).map(id => ({
    id, title: shortcuts[id].label, group: 'Quick actions', hint: shortcuts[id].hint, icon: Compass, run: actions[id],
  }))
  const results = [...entries.filter(entry => entry.group !== 'Related notes'), ...recapResults, ...visitResults, ...actionResults,
    ...entries.filter(entry => entry.group === 'Related notes')]

  function open(index: number) {
    const selected = results[index]
    if (!selected) return
    if (selected.id !== 'help') close()
    selected.run()
  }

  return <Modal name="Command palette" close={close} initialFocus={input}>
    <div onKeyDown={event => {
      if (!results.length) return
      if (event.key === 'Enter' && event.target === input.current) {
        event.preventDefault()
        open(0)
      }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
      event.preventDefault()
      const index = buttons.current.findIndex(button => button === event.target)
      const next = event.key === 'ArrowDown' ? Math.min(results.length - 1, index + 1) : index === -1 ? results.length - 1 : index - 1
      if (next < 0) input.current?.focus()
      else buttons.current[next]?.focus()
    }}>
      <label className="search-field"><Search size={18} /><input ref={input} type="search" aria-label="Search discovered places and journal entries"
        aria-controls="atlas-search-results" placeholder="Search discoveries, recaps or actions" value={query}
        onChange={event => setQuery(event.target.value)} /></label>
      <div className="search-results command-results" id="atlas-search-results">
        {needle && !results.length && <p role="status">No discoveries or actions match your search.</p>}
        {results.map((result, index) => <div key={result.id}>
          {results[index - 1]?.group !== result.group && <h3 className="result-group">{result.group}</h3>}
          <button ref={node => { buttons.current[index] = node }} type="button" onClick={() => open(index)}>
            <result.icon size={17} /><span>{result.title}{result.subtitle && <small>{result.subtitle}</small>}</span>
            {result.hint && <kbd>{result.hint}</kbd>}
          </button>
        </div>)}
      </div>
    </div>
  </Modal>
}

export function ShortcutDialog({ close }: { close: () => void }) {
  return <Modal name="Keyboard shortcuts" close={close}>
    <dl className="shortcut-guide">
      {Object.entries(shortcuts).map(([id, entry]) => <div key={id}><dt>{entry.label}</dt><dd><kbd>{entry.hint}</kbd></dd></div>)}
      <div><dt>Explore unlocked chapters from the chapter trail</dt><dd><kbd>← / →</kbd></dd></div>
      <div><dt>Move in Walk mode</dt><dd><kbd>W A S D</kbd></dd></div>
      <div><dt>Interact with a nearby discovery</dt><dd><kbd>E</kbd></dd></div>
      <div><dt>Release mouse or dismiss a dialog</dt><dd><kbd>Esc</kbd></dd></div>
    </dl>
  </Modal>
}

export function BookmarkDialog({ chapters, close, saved }: { chapters: Atlas['chapters'], close: () => void, saved: () => void }) {
  const offline = useOfflineStatus()
  const { bookmark, saveBookmark } = useProgress()
  const [chapterNumber, setChapter] = useState(bookmark.position.chapter)
  const [event, setEvent] = useState(bookmark.position.event)
  const [page, setPage] = useState(bookmark.pdfPage)
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState(false)
  const { first: start, last: end } = chapterRange(chapterNumber)
  const milestones = eventsForChapter(chapterNumber)
  const position = at(chapterNumber, event)
  const advanced = comparePosition(position, bookmark.position) > 0 || page > bookmark.pdfPage

  function save(submit: FormEvent) {
    submit.preventDefault()
    if (advanced && !confirm) { setConfirm(true); return }
    if (saveBookmark({ edition: enhancedEdition.id, position, pdfPage: page }, confirm)) saved()
    else setError(true)
  }

  return <Modal name="Your reading bookmark" close={close}>
    <p className="dialog-intro"><BookOpen size={16} /> The Hobbit · {enhancedEdition.name}</p>
    <p className="offline-status" role="status">{offline}</p>
    <form className="bookmark-form" onSubmit={save} onChange={() => { setConfirm(false); setError(false) }}>
      <div><label htmlFor="bookmark-chapter">Chapter</label><select id="bookmark-chapter" value={chapterNumber} onChange={change => {
        const next = Number(change.target.value)
        setChapter(next)
        setPage(enhancedEdition.chapterStarts[next])
        setEvent(0)
      }}>
        {chapterNumbers.map(number => {
          const title = chapters.find(entry => entry.number === number)?.title
          return <option key={number} value={number}>Chapter {roman(number)}{title ? ` · ${title}` : ''}</option>
        })}
      </select></div>
      <div><label htmlFor="bookmark-event">Reading position</label><select id="bookmark-event" value={event} onChange={change => setEvent(Number(change.target.value))}>
        <option value={0}>Just started</option>
        {milestones.map((milestone, index) => <option key={milestone.id} value={milestone.reveal.event}>
          {comparePosition(milestone.reveal, bookmark.position) <= 0 ? milestone.label : `Checkpoint ${index + 1}`}
        </option>)}
        <option value={completeEvent}>Chapter complete</option>
      </select></div>
      <div><label htmlFor="bookmark-page">PDF page</label><input id="bookmark-page" type="number" min={start} max={end} required value={Number.isFinite(page) ? page : ''}
        onChange={change => setPage(change.target.valueAsNumber)} /></div>
      <small>Discoveries follow your reading position. The PDF page marks where to resume.</small>
      {error && <p role="alert">Choose a valid page and reading position for this chapter.</p>}
      {confirm && <p className="chapter-note bookmark-confirm" role="status">Advance to Chapter {roman(chapterNumber)}, PDF page {page}? This can reveal more discoveries.</p>}
      <button type="submit" className="primary-button">{confirm ? 'Confirm advancement' : 'Save bookmark'}</button>
    </form>
  </Modal>
}
