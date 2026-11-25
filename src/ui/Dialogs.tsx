import { BookOpen, MapPin, Package, Search, UserRound, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { enhancedEdition } from '../content/hobbit'
import { useProgress } from '../content/progress'
import { at } from '../content/schema'
import { comparePosition, type Atlas } from '../content/spoilers'
import { roman } from './Roman'

function Modal({ name, close, children }: { name: string, close: () => void, children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const node = dialog.current
    node?.showModal()
    return () => { node?.close() }
  }, [])
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

export function SearchDialog({ atlas, close, navigate }: {
  atlas: Atlas, close: () => void, navigate: (view: 'atlas' | 'journal', id: string) => void
}) {
  const [query, setQuery] = useState('')
  const buttons = useRef<Array<HTMLButtonElement | null>>([])
  const input = useRef<HTMLInputElement>(null)
  const results = atlas.searchResults(query)
  function open(index: number) {
    const match = results[index]
    if (!match) return
    navigate('region' in match.item && match.item.point ? 'atlas' : 'journal', match.item.id)
    close()
  }
  function group(match: (typeof results)[number]) {
    if (match.score === 3) return 'Related notes'
    if ('region' in match.item) return 'Locations'
    return match.item.kind === 'object' ? 'Objects' : 'Characters'
  }
  return <Modal name="Search the atlas" close={close}>
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
        aria-controls="atlas-search-results" placeholder="Places, characters and objects" value={query}
        onChange={event => setQuery(event.target.value)} autoFocus /></label>
      <div className="search-results" id="atlas-search-results">
        {query.trim() && !results.length && <p role="status">No discoveries match your search.</p>}
        {!query.trim() && <p>Search discoveries visible at your current exploration point.</p>}
        {results.map((match, index) => {
          const { item } = match
          const isPlace = 'region' in item
          const Icon = isPlace ? MapPin : item.kind === 'object' ? Package : UserRound
          return <div key={item.id}>
            {(!results[index - 1] || group(results[index - 1]) !== group(match)) && <h3 className="result-group">{group(match)}</h3>}
            <button ref={node => { buttons.current[index] = node }} type="button" onClick={() => open(index)}>
              <Icon size={17} /><span>{item.name}<small>{isPlace ? item.region : item.subtitle}</small></span>
            </button>
          </div>
        })}
      </div>
    </div>
  </Modal>
}

export function BookmarkDialog({ chapters, close, saved }: { chapters: Atlas['chapters'], close: () => void, saved: () => void }) {
  const { bookmark, saveBookmark } = useProgress()
  const [chapterNumber, setChapter] = useState(bookmark.position.chapter)
  const [event, setEvent] = useState(bookmark.position.event)
  const [page, setPage] = useState(bookmark.pdfPage)
  const chapter = chapters.find(entry => entry.number === chapterNumber)!
  const start = enhancedEdition.chapterStarts[chapterNumber]
  const end = (enhancedEdition.chapterStarts[chapterNumber + 1] ?? start + 1) - 1

  function save(submit: FormEvent) {
    submit.preventDefault()
    saveBookmark({ edition: enhancedEdition.id, position: at(chapterNumber, event), pdfPage: page })
    saved()
  }

  return <Modal name="Your reading bookmark" close={close}>
    <p className="dialog-intro"><BookOpen size={16} /> The Hobbit · {enhancedEdition.name}</p>
    <form className="bookmark-form" onSubmit={save}>
      <div><label htmlFor="bookmark-chapter">Chapter</label><select id="bookmark-chapter" value={chapterNumber} onChange={change => {
        const next = Number(change.target.value)
        setChapter(next)
        setPage(enhancedEdition.chapterStarts[next])
        setEvent(0)
      }}>
        {chapters.map(entry => <option key={entry.number} value={entry.number}>{entry.number <= bookmark.position.chapter ? `${roman(entry.number)} · ${entry.title}` : `Chapter ${roman(entry.number)}`}</option>)}
      </select></div>
      <div><label htmlFor="bookmark-event">Reading position</label><select id="bookmark-event" value={event} onChange={change => setEvent(Number(change.target.value))}>
        <option value={0}>Just started</option>
        {chapter.milestones.map((milestone, index) => <option key={milestone.id} value={milestone.reveal.event}>
          {comparePosition(milestone.reveal, bookmark.position) <= 0 ? milestone.label : `Checkpoint ${index + 1}`}
        </option>)}
        {chapter.completionEvent !== undefined && <option value={chapter.completionEvent}>Chapter complete</option>}
      </select></div>
      <div><label htmlFor="bookmark-page">PDF page</label><input id="bookmark-page" type="number" min={start} max={end} required value={Number.isFinite(page) ? page : ''}
        onChange={change => setPage(change.target.valueAsNumber)} /></div>
      <small>Discoveries follow your reading position. The PDF page marks where to resume.</small>
      <button type="submit" className="primary-button">Save bookmark</button>
    </form>
  </Modal>
}
