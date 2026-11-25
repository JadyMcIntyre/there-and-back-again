import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'

const files = (await readdir('dist', { recursive: true, withFileTypes: true }))
  .filter(entry => entry.isFile() && entry.name !== 'sw.js')
  .map(entry => `${entry.parentPath}/${entry.name}`.replace(/^dist/, ''))
  .sort()
const hash = createHash('sha256')
for (const file of files) hash.update(file).update(await readFile(`dist${file}`))
const cacheName = `reader-atlas-${hash.digest('hex').slice(0, 12)}`

await writeFile('dist/sw.js', `
const CACHE = ${JSON.stringify(cacheName)}
const FILES = ${JSON.stringify(files.map(path => path.split('/').map(encodeURIComponent).join('/')))}

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('reader-atlas-') && key !== CACHE).map(key => caches.delete(key))
  )).then(() => self.clients.claim()))
})

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.open(CACHE).then(cache => cache.match('/index.html'))))
  } else if (FILES.includes(url.pathname)) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(event.request, { ignoreVary: true })).then(cached => cached || fetch(event.request)))
  }
})
`)
