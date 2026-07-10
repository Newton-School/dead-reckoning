// Pure math core. Everything the game claims about span/independence/basis
// is computed here, so it can be unit-tested independently of rendering.

export interface Vec2 {
  x: number
  y: number
}

export interface Vec3 {
  x: number
  y: number
  z: number
}

export const EPS = 1e-6

export const v2 = (x: number, y: number): Vec2 => ({ x, y })
export const v3 = (x: number, y: number, z: number): Vec3 => ({ x, y, z })

export const add2 = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y })
export const sub2 = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y })
export const scale2 = (c: number, a: Vec2): Vec2 => ({ x: c * a.x, y: c * a.y })
export const len2 = (a: Vec2): number => Math.hypot(a.x, a.y)
export const dist2 = (a: Vec2, b: Vec2): number => len2(sub2(a, b))
/** 2D cross product (z-component). Zero iff a, b are parallel. */
export const cross2 = (a: Vec2, b: Vec2): number => a.x * b.y - a.y * b.x

export const lincomb2 = (coeffs: number[], vecs: Vec2[]): Vec2 => {
  let x = 0
  let y = 0
  for (let i = 0; i < vecs.length; i++) {
    x += (coeffs[i] ?? 0) * vecs[i].x
    y += (coeffs[i] ?? 0) * vecs[i].y
  }
  return { x, y }
}

const isZero2 = (a: Vec2): boolean => len2(a) < EPS

/** Rank of the set of 2D vectors: dimension of their span (0, 1, or 2). */
export function rank2(vecs: Vec2[]): 0 | 1 | 2 {
  const nz = vecs.filter((v) => !isZero2(v))
  if (nz.length === 0) return 0
  const first = nz[0]
  for (const v of nz) {
    if (Math.abs(cross2(first, v)) > EPS) return 2
  }
  return 1
}

/** Is `target` in the span of `vecs`? */
export function spanContains2(vecs: Vec2[], target: Vec2): boolean {
  if (isZero2(target)) return true
  const r = rank2(vecs)
  if (r === 2) return true
  if (r === 0) return false
  const dir = vecs.find((v) => !isZero2(v))!
  return Math.abs(cross2(dir, target)) < EPS * Math.max(1, len2(target) * len2(dir))
}

/**
 * Solve c1*a + c2*b = t by Cramer's rule.
 * Returns null when a, b are linearly dependent (no unique solution).
 */
export function solve2(a: Vec2, b: Vec2, t: Vec2): [number, number] | null {
  const det = cross2(a, b)
  if (Math.abs(det) < EPS) return null
  return [cross2(t, b) / det, cross2(a, t) / det]
}

// ---------------------------------------------------------------- 3D --------

export const add3 = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z })
export const sub3 = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z })
export const scale3 = (c: number, a: Vec3): Vec3 => ({ x: c * a.x, y: c * a.y, z: c * a.z })
export const len3 = (a: Vec3): number => Math.hypot(a.x, a.y, a.z)
export const dist3 = (a: Vec3, b: Vec3): number => len3(sub3(a, b))
export const dot3 = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z

export const cross3 = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
})

export const lincomb3 = (coeffs: number[], vecs: Vec3[]): Vec3 => {
  let x = 0
  let y = 0
  let z = 0
  for (let i = 0; i < vecs.length; i++) {
    const c = coeffs[i] ?? 0
    x += c * vecs[i].x
    y += c * vecs[i].y
    z += c * vecs[i].z
  }
  return { x, y, z }
}

const isZero3 = (a: Vec3): boolean => len3(a) < EPS

export const det3 = (a: Vec3, b: Vec3, c: Vec3): number => dot3(a, cross3(b, c))

/** Rank of the set of 3D vectors: dimension of their span (0–3). */
export function rank3(vecs: Vec3[]): 0 | 1 | 2 | 3 {
  const nz = vecs.filter((v) => !isZero3(v))
  if (nz.length === 0) return 0
  // Find a pair with a nonzero cross product (i.e. a plane).
  let normal: Vec3 | null = null
  const first = nz[0]
  for (let i = 1; i < nz.length; i++) {
    const n = cross3(first, nz[i])
    if (!isZero3(n)) {
      normal = n
      break
    }
  }
  if (!normal) return 1
  for (const v of nz) {
    if (Math.abs(dot3(normal, v)) > EPS * Math.max(1, len3(v) * len3(normal))) return 3
  }
  return 2
}

/** Is `target` in the span of `vecs`? */
export function spanContains3(vecs: Vec3[], target: Vec3): boolean {
  if (isZero3(target)) return true
  const r = rank3(vecs)
  if (r === 3) return true
  if (r === 0) return false
  const nz = vecs.filter((v) => !isZero3(v))
  if (r === 1) {
    const dir = nz[0]
    return isZero3(cross3(dir, target)) ||
      len3(cross3(dir, target)) < EPS * Math.max(1, len3(target) * len3(dir))
  }
  // r === 2: target must be perpendicular to the plane normal.
  let normal: Vec3 = v3(0, 0, 0)
  const first = nz[0]
  for (let i = 1; i < nz.length; i++) {
    const n = cross3(first, nz[i])
    if (!isZero3(n)) {
      normal = n
      break
    }
  }
  return Math.abs(dot3(normal, target)) < EPS * Math.max(1, len3(target) * len3(normal))
}

/**
 * Solve c1*a + c2*b + c3*c = t by Cramer's rule.
 * Returns null when a, b, c are linearly dependent.
 */
export function solve3(a: Vec3, b: Vec3, c: Vec3, t: Vec3): [number, number, number] | null {
  const det = det3(a, b, c)
  if (Math.abs(det) < EPS) return null
  return [det3(t, b, c) / det, det3(a, t, c) / det, det3(a, b, t) / det]
}

/** Orthonormal basis (u, w) of the plane spanned by two independent 3D vectors. */
export function planeBasis(a: Vec3, b: Vec3): { u: Vec3; w: Vec3; normal: Vec3 } {
  const normal = cross3(a, b)
  const u = scale3(1 / len3(a), a)
  const wRaw = cross3(normal, a)
  const w = scale3(1 / len3(wRaw), wRaw)
  return { u, w, normal: scale3(1 / len3(normal), normal) }
}
