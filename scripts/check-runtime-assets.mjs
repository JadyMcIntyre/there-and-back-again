import assert from 'node:assert/strict'
import { readdir, readFile, stat } from 'node:fs/promises'
import { dirname, resolve, sep } from 'node:path'

const root = resolve('public/assets')
let checked = 0
for (const file of await readdir(root, { recursive: true, withFileTypes: true })) {
  if (!file.isFile() || !/\.(glb|gltf)$/.test(file.name)) continue
  const model = resolve(file.parentPath, file.name)
  const data = await readFile(model)
  const json = file.name.endsWith('.glb')
    ? data.subarray(20, 20 + data.readUInt32LE(12))
    : data
  const gltf = JSON.parse(json.toString())
  for (const node of [...(gltf.buffers ?? []), ...(gltf.images ?? [])]) {
    if (!node.uri || node.uri.startsWith('data:')) continue
    const filePath = resolve(dirname(model), decodeURIComponent(node.uri))
    assert(filePath.startsWith(root + sep), `Invalid asset URI in ${model}`)
    const dependency = await stat(filePath)
    assert(dependency.isFile() && dependency.size > 0, `Missing or empty asset dependency ${filePath}`)
    if (node.byteLength) assert(dependency.size >= node.byteLength, `Truncated buffer ${filePath}`)
  }
  checked++
}
assert(checked > 0, 'Expected runtime models to validate')
console.log(`Verified ${checked} runtime models and their external dependencies.`)
