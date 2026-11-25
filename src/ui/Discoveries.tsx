import { BookOpen, LockKeyhole, MapPin, Package, Sparkles, Users } from 'lucide-react'
import { discoveryCounts } from '../content/discoveries'
import { useProgress } from '../content/progress'
import { chapterSlots } from '../content/reading'
import type { Atlas } from '../content/spoilers'

export function Ledger({ atlas }: { atlas: Atlas }) {
  const counts = discoveryCounts(atlas)
  const completed = chapterSlots(atlas.cutoff, atlas.chapters).filter(slot => slot.complete).length
  const newCount = useProgress(state => state.newDiscoveries.length)
  const acknowledge = useProgress(state => state.acknowledge)
  return <section className="discovery-ledger" aria-label="Your discoveries">
    <span className="ledger-heading"><BookOpen size={17} /> <strong>Your discoveries</strong></span>
    <span><b>{completed}</b> chapters read</span>
    <span><Users size={13} /> <b>{counts.characters}</b> characters</span>
    <span><MapPin size={13} /> <b>{counts.places}</b> places</span>
    <span><Package size={13} /> <b>{counts.objects}</b> objects</span>
    {newCount > 0 && <button type="button" className="new-ledger" onClick={acknowledge} title="Mark discoveries seen">
      <Sparkles size={15} /> {newCount} new <span className="ledger-review">· Mark seen</span></button>}
  </section>
}

export function MysteryFolio() {
  return <div className="mystery-folio">
    <div className="mystery-art" aria-hidden="true"><i /><LockKeyhole size={16} /></div>
    <div><strong>Yet to be discovered</strong><small>Turn the page to continue your journey.</small></div>
  </div>
}
