import { describe, it, expect } from 'vitest'
import {
  v2,
  v3,
  cross2,
  lincomb2,
  rank2,
  spanContains2,
  solve2,
  rank3,
  spanContains3,
  solve3,
  lincomb3,
  dist2,
} from './vec'

describe('lincomb2', () => {
  it('combines with scalars including negatives and zero', () => {
    const r = lincomb2([2, -1, 0], [v2(2, 1), v2(-1, 1), v2(5, 5)])
    expect(r).toEqual({ x: 5, y: 1 })
  })
})

describe('rank2', () => {
  it('is 0 for empty and zero vectors', () => {
    expect(rank2([])).toBe(0)
    expect(rank2([v2(0, 0)])).toBe(0)
  })
  it('is 1 for a single vector and for collinear sets', () => {
    expect(rank2([v2(2, 1)])).toBe(1)
    expect(rank2([v2(2, 1), v2(-4, -2)])).toBe(1) // the Ch3 drift trap
    expect(rank2([v2(2, 1), v2(1, 0.5), v2(-4, -2)])).toBe(1)
  })
  it('is 2 for independent pairs even with redundant extras', () => {
    expect(rank2([v2(2, 1), v2(-1, 1)])).toBe(2)
    expect(rank2([v2(2, 1), v2(-1, 1), v2(-4, -2)])).toBe(2)
  })
})

describe('spanContains2', () => {
  const T1 = v2(2, 1)
  it('single thruster reaches only its line (Ch1 pod is off-line)', () => {
    expect(spanContains2([T1], v2(4, 2))).toBe(true) // cache = 2*T1
    expect(spanContains2([T1], v2(-3, -1.5))).toBe(true) // reverse burn
    expect(spanContains2([T1], v2(2, 3))).toBe(false) // POD-7: unreachable
  })
  it('collinear pair still reaches only the line (Ch3)', () => {
    expect(spanContains2([T1, v2(-4, -2)], v2(1, 2))).toBe(false)
  })
  it('independent pair reaches everything (Ch2 flood moment)', () => {
    expect(spanContains2([T1, v2(-1, 1)], v2(1, 2))).toBe(true)
    expect(spanContains2([T1, v2(-1, 1)], v2(-317.2, 55.9))).toBe(true)
  })
  it('origin is always reachable (do nothing)', () => {
    expect(spanContains2([], v2(0, 0))).toBe(true)
  })
})

describe('solve2', () => {
  it('solves the Ch2 pod intercept exactly', () => {
    // c1*(2,1) + c2*(-1,1) = (3,3)  =>  c1=2, c2=1
    const s = solve2(v2(2, 1), v2(-1, 1), v2(3, 3))
    expect(s).not.toBeNull()
    expect(s![0]).toBeCloseTo(2)
    expect(s![1]).toBeCloseTo(1)
  })
  it('returns null for dependent thrusters', () => {
    expect(solve2(v2(2, 1), v2(-4, -2), v2(1, 2))).toBeNull()
  })
  it('round-trips arbitrary coefficients', () => {
    const a = v2(2, 1)
    const b = v2(-1, 1)
    const t = lincomb2([-1.3, 2.7], [a, b])
    const s = solve2(a, b, t)!
    expect(s[0]).toBeCloseTo(-1.3)
    expect(s[1]).toBeCloseTo(2.7)
  })
})

describe('rank3 / spanContains3', () => {
  const T1 = v3(2, 1, 0)
  const T2 = v3(-1, 1, 0)
  const T4 = v3(1, 0, 2)
  it('two independent in-plane vectors have rank 2', () => {
    expect(rank3([T1, T2])).toBe(2)
  })
  it('the finale gate is off the z=0 plane', () => {
    expect(spanContains3([T1, T2], v3(2, 3, 2.5))).toBe(false)
    expect(spanContains3([T1, T2], v3(2, 3, 0))).toBe(true)
  })
  it('adding the dorsal thruster spans all of R^3', () => {
    expect(rank3([T1, T2, T4])).toBe(3)
    expect(spanContains3([T1, T2, T4], v3(2, 3, 2.5))).toBe(true)
  })
  it('collinear triples stay rank 1', () => {
    expect(rank3([T1, v3(4, 2, 0), v3(-2, -1, 0)])).toBe(1)
  })
})

describe('solve3', () => {
  it('solves the finale gate burn', () => {
    // z: 2*c3 = 2.5 ; then c1=1.25, c2=1.75 (see level design)
    const s = solve3(v3(2, 1, 0), v3(-1, 1, 0), v3(1, 0, 2), v3(2, 3, 2.5))
    expect(s).not.toBeNull()
    expect(s![0]).toBeCloseTo(1.25)
    expect(s![1]).toBeCloseTo(1.75)
    expect(s![2]).toBeCloseTo(1.25)
  })
  it('returns null when the third vector lies in the plane of the first two', () => {
    expect(solve3(v3(2, 1, 0), v3(-1, 1, 0), v3(1, 5, 0), v3(0, 0, 1))).toBeNull()
  })
  it('round-trips coefficients', () => {
    const a = v3(2, 1, 0)
    const b = v3(-1, 1, 0)
    const c = v3(1, 0, 2)
    const t = lincomb3([0.5, -2, 1.5], [a, b, c])
    const s = solve3(a, b, c, t)!
    expect(s[0]).toBeCloseTo(0.5)
    expect(s[1]).toBeCloseTo(-2)
    expect(s[2]).toBeCloseTo(1.5)
  })
})

describe('gameplay tolerances', () => {
  it('slider-rounded burns still land within the capture radius', () => {
    // Ch4 with basis {T2, T3}: exact (4/3, -5/6) rounded to 0.1 steps
    const end = lincomb2([1.3, -0.8], [v2(-1, 1), v2(-4, -2)])
    expect(dist2(end, v2(1.9, 2.9))).toBeLessThan(0.01)
    expect(dist2(end, v2(2, 3))).toBeLessThan(0.3)
  })
  it('cross2 sanity', () => {
    expect(cross2(v2(1, 0), v2(0, 1))).toBe(1)
  })
})
