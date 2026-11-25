export const clamp = (value: number, low = 0, high = 1) => Math.min(high, Math.max(low, value))
export const mix = (a: number, b: number, t: number) => a * (1 - t) + b * t
export const smooth = (low: number, high: number, value: number) => {
  const t = clamp((value - low) / (high - low))
  return t * t * (3 - 2 * t)
}

export function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let n = Math.imul(seed ^ seed >>> 15, 1 | seed)
    n = (n + Math.imul(n ^ n >>> 7, 61 | n)) ^ n
    return ((n ^ n >>> 14) >>> 0) / 4294967296
  }
}

function hash(x: number, z: number) {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453123
  return n - Math.floor(n)
}

export function noise(x: number, z: number) {
  const i = Math.floor(x), j = Math.floor(z)
  const u = smooth(0, 1, x - i), v = smooth(0, 1, z - j)
  return mix(mix(hash(i, j), hash(i + 1, j), u), mix(hash(i, j + 1), hash(i + 1, j + 1), u), v)
}

export function grain(x: number, z: number) {
  return noise(x, z) * 0.56 + noise(x * 2.13 + 7, z * 2.13 + 1) * 0.28
    + noise(x * 4.32, z * 4.32 + 20) * 0.16
}
