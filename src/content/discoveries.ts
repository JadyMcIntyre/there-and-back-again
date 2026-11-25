import type { Atlas } from './spoilers'

export function discoveryEntries(atlas: Atlas) {
  return [...atlas.locations, ...atlas.exhibits]
}

export function discoveryCounts(atlas: Atlas) {
  return {
    characters: atlas.exhibits.filter(entry => entry.kind === 'character').length,
    places: atlas.locations.length,
    objects: atlas.exhibits.filter(entry => entry.kind === 'object').length,
  }
}

export function newlyVisible(previous: Atlas, current: Atlas) {
  const before = new Set(discoveryEntries(previous).map(entry => entry.id))
  return discoveryEntries(current).filter(entry => !before.has(entry.id)).map(entry => entry.id)
}
