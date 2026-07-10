import { useEffect, useRef } from 'react'
import type { MissionDef, Thruster, Target } from '../levels/types'
import { type Vec2, v2, add2, scale2, lincomb2, dist2, rank2, len2 } from '../engine/vec'
import { useGame } from '../state/store'

export const CAPTURE_RADIUS = 0.3

// Deterministic starfield.
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(90059)
const STARS = Array.from({ length: 160 }, () => ({
  x: rand(),
  y: rand(),
  r: rand() * 1.1 + 0.2,
  a: rand() * 0.5 + 0.12,
}))

interface Cam {
  w: number
  h: number
  scale: number
}

function toScreen(p: Vec2, cam: Cam): [number, number] {
  return [cam.w / 2 + p.x * cam.scale, cam.h / 2 - p.y * cam.scale]
}

function arrow(
  ctx: CanvasRenderingContext2D,
  from: Vec2,
  to: Vec2,
  cam: Cam,
  color: string,
  width: number,
  dash: number[] = [],
) {
  const [x1, y1] = toScreen(from, cam)
  const [x2, y2] = toScreen(to, cam)
  const dx = x2 - x1
  const dy = y2 - y1
  const L = Math.hypot(dx, dy)
  if (L < 2) return
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = width
  ctx.setLineDash(dash)
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.setLineDash([])
  const head = Math.min(9, L * 0.3)
  const ang = Math.atan2(dy, dx)
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - head * Math.cos(ang - 0.42), y2 - head * Math.sin(ang - 0.42))
  ctx.lineTo(x2 - head * Math.cos(ang + 0.42), y2 - head * Math.sin(ang + 0.42))
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawGrid(ctx: CanvasRenderingContext2D, cam: Cam) {
  const unitsX = Math.ceil(cam.w / 2 / cam.scale)
  const unitsY = Math.ceil(cam.h / 2 / cam.scale)
  ctx.save()
  for (let i = -unitsX; i <= unitsX; i++) {
    const [x] = toScreen(v2(i, 0), cam)
    ctx.strokeStyle = i === 0 ? 'rgba(83,211,209,0.28)' : 'rgba(43,66,101,0.35)'
    ctx.lineWidth = i === 0 ? 1.2 : 0.6
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, cam.h)
    ctx.stroke()
    if (i !== 0 && Math.abs(i) <= unitsX) {
      ctx.fillStyle = 'rgba(93,107,128,0.55)'
      ctx.font = '10px ui-monospace, Menlo, monospace'
      const [ox, oy] = toScreen(v2(i, 0), cam)
      ctx.fillText(String(i), ox + 3, oy + 12)
    }
  }
  for (let j = -unitsY; j <= unitsY; j++) {
    const [, y] = toScreen(v2(0, j), cam)
    ctx.strokeStyle = j === 0 ? 'rgba(83,211,209,0.28)' : 'rgba(43,66,101,0.35)'
    ctx.lineWidth = j === 0 ? 1.2 : 0.6
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(cam.w, y)
    ctx.stroke()
    if (j !== 0) {
      ctx.fillStyle = 'rgba(93,107,128,0.55)'
      ctx.font = '10px ui-monospace, Menlo, monospace'
      const [ox, oy] = toScreen(v2(0, j), cam)
      ctx.fillText(String(j), ox + 4, oy - 3)
    }
  }
  ctx.restore()
}

function drawSpanOverlay(ctx: CanvasRenderingContext2D, cam: Cam, active: Thruster[], t: number) {
  const vecs = active.map((th) => th.v)
  const r = rank2(vecs)
  const pulse = 0.75 + 0.25 * Math.sin(t / 700)
  if (r === 1) {
    const dir = vecs.find((v) => len2(v) > 1e-9)!
    const n = scale2(1 / len2(dir), dir)
    const far = scale2(60, n)
    const [x1, y1] = toScreen(scale2(-1, far), cam)
    const [x2, y2] = toScreen(far, cam)
    ctx.save()
    ctx.strokeStyle = `rgba(83,211,209,${0.10 * pulse})`
    ctx.lineWidth = 34
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.strokeStyle = `rgba(83,211,209,${0.32 * pulse})`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.restore()
  } else if (r === 2) {
    ctx.save()
    const g = ctx.createRadialGradient(
      cam.w / 2,
      cam.h / 2,
      0,
      cam.w / 2,
      cam.h / 2,
      Math.max(cam.w, cam.h) * 0.7,
    )
    g.addColorStop(0, `rgba(83,211,209,${0.10 * pulse})`)
    g.addColorStop(1, `rgba(83,211,209,${0.035 * pulse})`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, cam.w, cam.h)
    ctx.restore()
  }
}

function drawTarget(ctx: CanvasRenderingContext2D, cam: Cam, target: Target, t: number) {
  const [x, y] = toScreen(target.at, cam)
  const pulse = 0.6 + 0.4 * Math.sin(t / 500)
  ctx.save()
  // capture ring
  ctx.strokeStyle = 'rgba(230,180,80,0.4)'
  ctx.setLineDash([4, 4])
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(x, y, CAPTURE_RADIUS * cam.scale, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.strokeStyle = `rgba(230,180,80,${pulse})`
  ctx.fillStyle = 'rgba(230,180,80,0.16)'
  ctx.lineWidth = 1.6
  const s = 7
  ctx.beginPath()
  switch (target.kind) {
    case 'cache':
      ctx.rect(x - s, y - s, s * 2, s * 2)
      break
    case 'pod':
      ctx.arc(x, y, s, 0, Math.PI * 2)
      break
    case 'wreck':
      ctx.moveTo(x, y - s)
      ctx.lineTo(x + s, y + s)
      ctx.lineTo(x - s, y + s)
      ctx.closePath()
      break
    case 'dock':
    case 'gate':
      ctx.moveTo(x, y - s)
      ctx.lineTo(x + s, y)
      ctx.lineTo(x, y + s)
      ctx.lineTo(x - s, y)
      ctx.closePath()
      break
  }
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = 'rgba(230,180,80,0.9)'
  ctx.font = '11px ui-monospace, Menlo, monospace'
  ctx.fillText(`${target.label} (${target.at.x}, ${target.at.y})`, x + 12, y - 10)
  ctx.restore()
}

function drawShip(ctx: CanvasRenderingContext2D, cam: Cam, pos: Vec2, thrusting: string | null) {
  const [x, y] = toScreen(pos, cam)
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = '#101a2c'
  ctx.strokeStyle = '#8fa3bd'
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.moveTo(9, 0)
  ctx.lineTo(3, -5)
  ctx.lineTo(-7, -5)
  ctx.lineTo(-9, 0)
  ctx.lineTo(-7, 5)
  ctx.lineTo(3, 5)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#53d3d1'
  ctx.fillRect(3, -1.5, 3, 3)
  if (thrusting) {
    ctx.fillStyle = thrusting
    ctx.globalAlpha = 0.85
    ctx.beginPath()
    ctx.arc(-10, 0, 3.4, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

interface AnimPlan {
  key: number
  points: Vec2[]
  colors: string[]
  cumLen: number[]
  totalLen: number
  duration: number
  hit: boolean
  phase: 'fly' | 'hold' | 'return' | 'done'
  phaseStart: number
}

export function PlayfieldCanvas({ mission }: { mission: MissionDef }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<AnimPlan | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0
    let disposed = false

    const draw = (now: number) => {
      if (disposed) return
      const parent = canvas.parentElement!
      const dpr = window.devicePixelRatio || 1
      const w = parent.clientWidth
      const h = parent.clientHeight
      // A zero-sized playfield (mid-layout, keyboard overlay, etc.) would make
      // cam.scale 0 and the grid loops unbounded — skip the frame instead.
      if (w <= 0 || h <= 0) {
        raf = requestAnimationFrame(draw)
        return
      }
      const bufW = Math.round(w * dpr)
      const bufH = Math.round(h * dpr)
      if (canvas.width !== bufW || canvas.height !== bufH) {
        canvas.width = bufW
        canvas.height = bufH
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const cam: Cam = { w, h, scale: Math.min(w / 13.5, h / 9.5) }

      const s = useGame.getState()
      const active = mission.thrusters.filter(
        (th) => !th.offline && !s.jettisoned.includes(th.id),
      )

      // background
      ctx.fillStyle = '#060a12'
      ctx.fillRect(0, 0, w, h)
      for (const st of STARS) {
        ctx.fillStyle = `rgba(200,220,255,${st.a})`
        ctx.beginPath()
        ctx.arc(st.x * w, st.y * h, st.r, 0, Math.PI * 2)
        ctx.fill()
      }
      drawGrid(ctx, cam)
      if (s.overlayOn) drawSpanOverlay(ctx, cam, active, now)
      drawTarget(ctx, cam, mission.target, now)

      // --- execution animation management ---
      if (s.exec && (!animRef.current || animRef.current.key !== s.exec.startedAt)) {
        const points: Vec2[] = [v2(0, 0)]
        const colors: string[] = []
        for (const th of active) {
          const c = s.exec.coeffs[th.id] ?? 0
          if (Math.abs(c) < 0.005) continue
          points.push(add2(points[points.length - 1], scale2(c, th.v)))
          colors.push(th.color)
        }
        const end = points[points.length - 1]
        const cumLen: number[] = [0]
        let totalLen = 0
        for (let i = 1; i < points.length; i++) {
          totalLen += dist2(points[i - 1], points[i])
          cumLen.push(totalLen)
        }
        animRef.current = {
          key: s.exec.startedAt,
          points,
          colors,
          cumLen,
          totalLen,
          duration: Math.min(2600, Math.max(500, 380 + totalLen * 230)),
          hit: dist2(end, mission.target.at) <= CAPTURE_RADIUS,
          phase: 'fly',
          phaseStart: now,
        }
      }

      let shipPos = v2(0, 0)
      let thrustColor: string | null = null
      const anim = animRef.current

      if (anim && s.exec) {
        const end = anim.points[anim.points.length - 1]
        if (anim.phase === 'fly') {
          const p = Math.min(1, (now - anim.phaseStart) / anim.duration)
          const distAlong = p * anim.totalLen
          let seg = 1
          while (seg < anim.cumLen.length && anim.cumLen[seg] < distAlong) seg++
          if (anim.totalLen < 1e-9) {
            shipPos = end
          } else if (seg < anim.points.length) {
            const segStart = anim.points[seg - 1]
            const segEnd = anim.points[seg]
            const segLen = anim.cumLen[seg] - anim.cumLen[seg - 1]
            const local = segLen < 1e-9 ? 1 : (distAlong - anim.cumLen[seg - 1]) / segLen
            shipPos = add2(segStart, scale2(local, { x: segEnd.x - segStart.x, y: segEnd.y - segStart.y }))
            thrustColor = anim.colors[seg - 1] ?? null
          } else {
            shipPos = end
          }
          // trail of completed segments
          for (let i = 1; i < anim.points.length; i++) {
            if (anim.cumLen[i] <= distAlong + 1e-9) {
              arrow(ctx, anim.points[i - 1], anim.points[i], cam, anim.colors[i - 1] + 'cc', 2)
            }
          }
          if (p >= 1) {
            anim.phase = 'hold'
            anim.phaseStart = now
          }
        } else if (anim.phase === 'hold') {
          shipPos = end
          for (let i = 1; i < anim.points.length; i++) {
            arrow(ctx, anim.points[i - 1], anim.points[i], cam, anim.colors[i - 1] + 'cc', 2)
          }
          if (anim.hit) {
            const [tx, ty] = toScreen(mission.target.at, cam)
            const pr = ((now - anim.phaseStart) / 500) * 30
            ctx.strokeStyle = 'rgba(127,217,98,0.8)'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(tx, ty, 10 + pr, 0, Math.PI * 2)
            ctx.stroke()
          }
          if (now - anim.phaseStart > (anim.hit ? 650 : 450)) {
            if (anim.hit) {
              anim.phase = 'done'
              useGame.getState().executionFinished(true)
            } else {
              anim.phase = 'return'
              anim.phaseStart = now
            }
          }
        } else if (anim.phase === 'return') {
          const p = Math.min(1, (now - anim.phaseStart) / 450)
          shipPos = scale2(1 - p, end)
          ctx.save()
          ctx.globalAlpha = 0.35 * (1 - p)
          for (let i = 1; i < anim.points.length; i++) {
            arrow(ctx, anim.points[i - 1], anim.points[i], cam, anim.colors[i - 1], 1.6)
          }
          ctx.restore()
          if (p >= 1) {
            anim.phase = 'done'
            useGame.getState().executionFinished(false)
          }
        } else {
          shipPos = anim.hit ? end : v2(0, 0)
        }
      } else {
        animRef.current = null
        if (s.missionComplete && s.completedVia === 'burn') {
          // Ship rests at the target after a successful burn.
          shipPos = mission.target.at
        }
      }

      // --- planning ghost (only when not executing / not complete) ---
      if (!s.exec && !s.missionComplete) {
        let tip = v2(0, 0)
        for (const th of active) {
          const c = s.burns[th.id] ?? 0
          if (Math.abs(c) < 0.005) continue
          const next = add2(tip, scale2(c, th.v))
          arrow(ctx, tip, next, cam, th.color + '66', 1.6, [6, 5])
          tip = next
        }
        if (len2(tip) > 0.01) {
          arrow(ctx, v2(0, 0), tip, cam, 'rgba(183,194,208,0.5)', 1.2, [2, 4])
          const resultant = lincomb2(
            active.map((th) => s.burns[th.id] ?? 0),
            active.map((th) => th.v),
          )
          const [gx, gy] = toScreen(resultant, cam)
          ctx.fillStyle = 'rgba(183,194,208,0.8)'
          ctx.font = '10px ui-monospace, Menlo, monospace'
          ctx.fillText(`(${resultant.x.toFixed(1)}, ${resultant.y.toFixed(1)})`, gx + 8, gy + 4)
        }
        // thruster direction indicators at the ship
        for (const th of active) {
          arrow(ctx, v2(0, 0), th.v, cam, th.color, 2.2)
          const [lx, ly] = toScreen(th.v, cam)
          ctx.fillStyle = th.color
          ctx.font = 'bold 11px ui-monospace, Menlo, monospace'
          ctx.fillText(th.label, lx + 6, ly - 6)
        }
      }

      drawShip(ctx, cam, shipPos, thrustColor)
      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => {
      disposed = true
      cancelAnimationFrame(raf)
    }
  }, [mission])

  return <canvas ref={canvasRef} />
}
