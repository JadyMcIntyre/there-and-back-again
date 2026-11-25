import { ArrowRight, BookOpen, Compass, Feather, Flame, Gem, MapPin, Package, UserRound, Users, LockKeyhole, Sparkles } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { chapterSlots } from '../content/reading'
import { useProgress } from '../content/progress'
import { Ledger, MysteryFolio } from './Discoveries'
import { canInspect, objectArtwork, ObjectInspection, ObjectSeal } from './ObjectInspection'
import type { EntryLink, Fact } from '../content/schema'
import type { Atlas, Destination } from '../content/spoilers'
import type { LinkTo } from './navigation'
import { roman } from './Roman'

type Tab = 'character' | 'location' | 'object' | 'chapter'
const tabs = [
  ['character', 'Characters', Users],
  ['location', 'Locations', MapPin],
  ['object', 'Objects', Package],
  ['chapter', 'Recaps', BookOpen],
] as const

export function SourcePages({ pages }: { pages?: Fact['pages'] }) {
  return pages && <span className="source-pages">PDF {pages[0] === pages[1] ? `p. ${pages[0]}` : `pp. ${pages[0]}–${pages[1]}`}</span>
}

export function FactText({ facts, sourced = false }: { facts: Fact[], sourced?: boolean }) {
  return <>{facts.map(fact => <p key={fact.id}>{fact.text}{sourced && <> <SourcePages pages={fact.pages} /></>}</p>)}</>
}

function Illustration({ style, id, name, children }: { style?: string, id: string, name: string, children?: ReactNode }) {
  const icons = { eagle: Feather, dragon: Flame, object: Gem, location: Compass, chapter: BookOpen }
  const Icon = style ? icons[style as keyof typeof icons] : UserRound
  return <div className={`journal-illustration portrait-${style ?? 'unknown'} ${style ? `portrait-${id}` : ''}`} aria-hidden="true">
    <span className="portrait-halo" />
    {style && (id === 'bilbo' || id === 'gandalf' || id === 'thorin') ? <img src={`/assets/portraits/${id}.webp`} alt="" /> : style === 'object' ? <ObjectSeal id={id} /> : Icon ? <Icon className="portrait-icon" size={62} strokeWidth={1} />
      : <div className="portrait-face"><i className="portrait-neck" /><i className="portrait-hair" /><i className="portrait-head" /><i className="portrait-eyes" /><i className="portrait-beard" /><i className="portrait-hat" /></div>}
    {children ?? <span className="portrait-caption">{name}</span>}
  </div>
}

function Connections({ atlas, links, href, chapter }: { atlas: Atlas, links: EntryLink[], href: LinkTo, chapter?: number }) {
  const getTarget = (link: EntryLink) => [...atlas.exhibits, ...atlas.locations].find(item => item.id === link.target)
  const entries = links.flatMap(link => {
    const target = getTarget(link)
    if (!target) return []
    const kind = 'kind' in target ? target.kind : 'location'
    return [{ link, target, kind: chapter && kind === 'character' && target.reveal.chapter === chapter ? 'introduced' : kind }]
  })
  if (!entries.length) return null
  const categories = chapter ? ['introduced', 'character', 'object', 'location'] : ['character', 'object', 'location']
  return <>{categories.map(category => {
    const items = entries.filter(item => item.kind === category)
    if (!items.length) return null
    const title = category === 'introduced' ? 'Introduced in this chapter'
      : chapter ? category === 'character' ? 'Other people and creatures' : category === 'object' ? 'Objects' : 'Locations'
        : category === 'character' ? 'Associated people' : category === 'object' ? 'Associated objects' : 'Associated places'
    return <section key={category} className="journal-section">
      <h3>{title}</h3>
      <div className="journal-connections">{items.map(({ link, target, kind }) => <a href={href('journal', target.id)} key={link.id}>
        {kind === 'location' ? <MapPin size={15} /> : kind === 'object' ? <Package size={15} /> : <UserRound size={15} />}
        <span>{target.name}<small>{!chapter && link.label}</small></span><ArrowRight size={14} />
      </a>)}</div>
    </section>
  })}</>
}

function Recap({ chapter, atlas, href }: { chapter: Atlas['chapters'][number], atlas: Atlas, href: LinkTo }) {
  const recap = chapter.recap!
  return <article className="journal-article">
    <div className="journal-spread">
      <Illustration id={`chapter-${chapter.number}`} style="chapter" name={chapter.title}>
        <span className="portrait-caption">CHAPTER {roman(chapter.number)}</span>
      </Illustration>
      <div><span className="eyebrow">Chapter {roman(chapter.number)} · Recap</span><h2>{chapter.title}</h2>
        <p className="journal-lede">{recap.text}</p><SourcePages pages={recap.pages} />
      </div>
    </div>
    <div className="recap-columns">
      <section className="journal-section"><h3>Key events</h3><ol>{recap.events.map(event => <li key={event.id}>
        {event.text} <SourcePages pages={event.pages} />
      </li>)}</ol></section>
      <section className="journal-section"><h3>Worth remembering</h3><FactText facts={recap.remember} sourced /></section>
    </div>
    <Connections atlas={atlas} links={recap.links} href={href} chapter={chapter.number} />
    {atlas.landmarks.filter(place => place.scene && recap.links.some(link => link.target === place.id)).map(place =>
      <a className="text-button" key={place.id} href={href('scene', place.scene!.id)}>Visit {place.name} <ArrowRight size={15} /></a>)}
  </article>
}

export default function Journal({ atlas, destination, href }: { atlas: Atlas, destination: Destination, href: LinkTo }) {
  const [section, setSection] = useState<Tab>('character')
  const [filter, setFilter] = useState('')
  const [object, setObject] = useState<string>()
  const newDiscoveries = useProgress(state => state.newDiscoveries)
  const objectEntry = atlas.exhibits.find(item => item.kind === 'object' && item.id === object && canInspect(item.id))
  const requested = [...atlas.exhibits, ...atlas.locations].find(item => item.id === destination.id)
  const recaps = atlas.chapters.filter(chapter => chapter.recap)
  const slots = chapterSlots(atlas.cutoff, atlas.chapters)
  const requestedRecap = recaps.find(chapter => `chapter-${chapter.number}` === destination.id)
  const tab: Tab = requestedRecap ? 'chapter' : requested ? ('kind' in requested ? requested.kind : 'location') : section
  const entries = tab === 'location' ? atlas.locations : atlas.exhibits.filter(item => item.kind === tab)
  const filtered = entries.filter(item => item.name.toLowerCase().includes(filter.trim().toLowerCase()))
  const current = requested ?? (filter ? filtered[0] : entries[0])
  const recap = requestedRecap ?? recaps[0]
  const kind = current && ('kind' in current ? current.kind : 'location')
  const artwork = current && ('region' in current
    ? current.scene?.id === 'bag-end' ? '/assets/bag-end.webp' : undefined
    : current.kind === 'object' ? objectArtwork(current) : undefined)
  const facts = current?.facts ?? []
  const overview = facts.filter(fact => fact.section !== 'Developments')
  const developments = facts.filter(fact => fact.section === 'Developments')
  return <section className="reader-journal" aria-label="Reading journal">
    <Ledger atlas={atlas} />
    <nav className="journal-sections" aria-label="Journal sections">
      {tabs.map(([id, label, Icon]) => <a key={id} href={href('journal')} role="button" aria-pressed={tab === id}
        onClick={() => { setSection(id); setFilter('') }}><Icon size={17} />{label}</a>)}
    </nav>
    <div className="journal-board folio">
      <div className="journal-sidebar">
        {tab === 'chapter' ? slots.map(chapter => chapter.recap ? <a className="journal-link" href={href('journal', `chapter-${chapter.number}`)}
          aria-current={recap?.number === chapter.number ? 'true' : undefined} key={chapter.number}>
          <i className="folio-initial" aria-hidden="true">{roman(chapter.number)}</i><span>{chapter.title}</span><ArrowRight size={14} />
        </a> : <div className="journal-link locked-recap" key={chapter.number}>
          <i className="folio-initial" aria-hidden="true">{roman(chapter.number)}</i>
          <span>Chapter {roman(chapter.number)}<small>{chapter.complete ? 'Recap not yet available' : 'Recap locked'}</small></span>
          <LockKeyhole size={14} aria-hidden />
        </div>) : <>
          <label className="folio-filter"><span className="sr-only">Filter {tab === 'location' ? 'locations' : `${tab}s`}</span>
            <input type="search" placeholder="Filter entries" value={filter} onChange={event => setFilter(event.target.value)} /></label>
          {!filter && <MysteryFolio />}
          <div className="folio-index">{filtered.map(item => <a key={item.id} className="journal-link" href={href('journal', item.id)}
            aria-current={current?.id === item.id ? 'true' : undefined}>
            <i className="folio-initial" aria-hidden="true">{item.name.replace(/^The /, '')[0]}</i>
            <span>{item.name}<small>{'region' in item ? item.region : item.subtitle}</small></span>
            {newDiscoveries.includes(item.id) ? <Sparkles size={15} className="discovery-star" aria-label="New discovery" /> : <ArrowRight size={14} />}
          </a>)}</div>
        </>}
      </div>
      <div className="journal-content">
        {tab === 'chapter' ? recap ? <Recap chapter={recap} atlas={atlas} href={href} /> : <p>Recaps appear after you complete a chapter.</p>
          : current ? <article className="journal-article">
            <div className={`journal-spread ${newDiscoveries.includes(current.id) ? 'unlocked-folio' : ''}`}>
              <Illustration name={current.name} id={current.id} style={'portrait' in current ? current.portrait?.style : kind}>
                {artwork && <img src={artwork} alt="" />}
              </Illustration>
              <div>
                <span className="eyebrow">{'region' in current ? current.region : current.subtitle}</span>
                <h2>{current.name}</h2>
                <p className="first-appearance">{current.firstMention ? 'First mention' : 'First appearance'} · Chapter {roman(current.reveal.chapter)} <SourcePages pages={facts[0]?.pages} /></p>
                <span className="discovery-state">{current.discovery === 'mentioned' ? 'Mentioned in the book' : current.discovery === 'encountered' ? kind === 'location' ? 'Visited' : 'Encountered' : 'Discovered'}</span>
                {newDiscoveries.includes(current.id) && <span className="discovery-state new-entry">New discovery</span>}
                {current.aliases.filter(alias => alias.name !== current.name.split(' ')[0]).map(alias =>
                  <p className="journal-alias" key={alias.id}>Also called {alias.name} <SourcePages pages={alias.pages} /></p>)}
                <FactText facts={overview.slice(0, 1)} sourced />
                {kind === 'object' && canInspect(current.id) && <button type="button" className="primary-button object-open" onClick={() => setObject(current.id)}>Inspect in 3D</button>}
              </div>
            </div>
            {overview.length > 1 && <section className="journal-section"><h3>{kind === 'character' ? 'Appearance and background' : 'Field notes'}</h3><FactText facts={overview.slice(1)} sourced /></section>}
            {developments.length > 0 && <section className="journal-section"><h3>Along the journey</h3>
              {developments.map(fact => <div className="journal-development" key={fact.id}><b>{roman(fact.reveal.chapter)}</b><FactText facts={[fact]} sourced /></div>)}
            </section>}
            <Connections atlas={atlas} links={current.links} href={href} />
            {'region' in current
              ? <div className="journal-location-actions">
                {current.point && <a className="text-button" href={href('atlas', current.id)}><MapPin size={15} /> Find on the atlas <ArrowRight size={15} /></a>}
                {current.scene && <a className="text-button" href={href('scene', current.scene.id)}>Visit {current.name} <ArrowRight size={15} /></a>}
              </div>
              : <a className="text-button" href={href('journal', current.location)}><MapPin size={15} /> First associated location <ArrowRight size={15} /></a>}
          </article> : <div className="journal-empty"><BookOpen size={36} strokeWidth={1} /><h2>{filter ? 'No matching entries' : 'Your discoveries'}</h2><p>{filter ? 'Try a different name.' : 'Entries appear here as you read.'}</p></div>}
      </div>
    </div>
    {objectEntry && <ObjectInspection item={objectEntry} close={() => setObject(undefined)} />}
  </section>
}
