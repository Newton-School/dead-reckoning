import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { Chapter, Mission3Def } from '../levels/types'
import { type Vec3, add3, scale3, dist3, lincomb3, rank3, cross3, len3, spanContains3, v3 } from '../engine/vec'
import { useGame } from '../state/store'
import { CommsOverlay, DebriefOverlay } from '../ui/MissionShared'

const CAPTURE_3D = 0.5

/** math (x, y, z-altitude) -> three (x, y-up, z-depth) */
const toT = (v: Vec3) => new THREE.Vector3(v.x, v.z, v.y)

export function FinaleView({ mission, chapter }: { mission: Mission3Def; chapter: Chapter }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [glFailed, setGlFailed] = useState(false)

  const burns = useGame((s) => s.burns)
  const exec = useGame((s) => s.exec)
  const missionComplete = useGame((s) => s.missionComplete)
  const attempts = useGame((s) => s.attempts)
  const setBurn = useGame((s) => s.setBurn)
  const resetBurns = useGame((s) => s.resetBurns)
  const execute = useGame((s) => s.execute)
  const reportUnreachable = useGame((s) => s.reportUnreachable)

  const maxBurn = mission.maxBurn ?? 4
  const active = mission.thrusters.filter((t) => !t.offline)
  const resultant = lincomb3(
    active.map((t) => burns[t.id] ?? 0),
    active.map((t) => t.v),
  )
  const targetUnreachable = !spanContains3(
    active.map((t) => t.v),
    mission.target.at,
  )
  const busy = !!exec || missionComplete

  useEffect(() => {
    const mount = mountRef.current!
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true })
    } catch {
      setGlFailed(true)
      return
    }
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x060a12)
    scene.fog = new THREE.Fog(0x060a12, 30, 90)

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200)
    camera.position.set(7, 6, 11)

    renderer.setPixelRatio(window.devicePixelRatio)
    mount.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.maxDistance = 40
    controls.minDistance = 4

    // starfield
    const starGeo = new THREE.BufferGeometry()
    const starPos = new Float32Array(500 * 3)
    for (let i = 0; i < 500; i++) {
      const r = 60 + Math.random() * 60
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      starPos[i * 3] = r * Math.sin(ph) * Math.cos(th)
      starPos[i * 3 + 1] = r * Math.cos(ph)
      starPos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th)
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    scene.add(
      new THREE.Points(
        starGeo,
        new THREE.PointsMaterial({ color: 0xc8dcff, size: 0.18, transparent: true, opacity: 0.7 }),
      ),
    )

    // ecliptic grid (math z=0 plane)
    const grid = new THREE.GridHelper(24, 24, 0x53d3d1, 0x1b2940)
    ;(grid.material as THREE.Material).transparent = true
    ;(grid.material as THREE.Material).opacity = 0.35
    scene.add(grid)

    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(5, 10, 3)
    scene.add(dir)

    // thruster arrows
    for (const t of active) {
      const d = toT(t.v)
      const arrow = new THREE.ArrowHelper(
        d.clone().normalize(),
        new THREE.Vector3(0, 0, 0),
        d.length(),
        new THREE.Color(t.color).getHex(),
        0.35,
        0.2,
      )
      scene.add(arrow)
    }

    // span visualization (static per mission: thruster set is fixed here)
    const r = rank3(active.map((t) => t.v))
    if (r === 2) {
      const n = cross3(active[0].v, active[1].v)
      const planeGeo = new THREE.PlaneGeometry(40, 40)
      const planeMat = new THREE.MeshBasicMaterial({
        color: 0x53d3d1,
        transparent: true,
        opacity: 0.09,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
      const plane = new THREE.Mesh(planeGeo, planeMat)
      plane.lookAt(toT(scale3(1 / len3(n), n)))
      scene.add(plane)
      const planeGrid = new THREE.Mesh(
        planeGeo,
        new THREE.MeshBasicMaterial({
          color: 0x53d3d1,
          transparent: true,
          opacity: 0.05,
          side: THREE.DoubleSide,
          wireframe: true,
          depthWrite: false,
        }),
      )
      planeGrid.lookAt(toT(scale3(1 / len3(n), n)))
      scene.add(planeGrid)
    } else if (r === 3) {
      // full-volume glow: cyan particle cloud through space
      const cloudGeo = new THREE.BufferGeometry()
      const cloudPos = new Float32Array(700 * 3)
      for (let i = 0; i < 700; i++) {
        cloudPos[i * 3] = (Math.random() - 0.5) * 26
        cloudPos[i * 3 + 1] = (Math.random() - 0.5) * 26
        cloudPos[i * 3 + 2] = (Math.random() - 0.5) * 26
      }
      cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudPos, 3))
      scene.add(
        new THREE.Points(
          cloudGeo,
          new THREE.PointsMaterial({ color: 0x53d3d1, size: 0.09, transparent: true, opacity: 0.4 }),
        ),
      )
    }

    // target gate
    const gate = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.07, 12, 40),
      new THREE.MeshBasicMaterial({ color: 0xe6b450 }),
    )
    gate.position.copy(toT(mission.target.at))
    scene.add(gate)
    // altitude drop-line from gate to the ecliptic
    const dropGeo = new THREE.BufferGeometry().setFromPoints([
      toT(mission.target.at),
      toT(v3(mission.target.at.x, mission.target.at.y, 0)),
    ])
    const dropLine = new THREE.Line(
      dropGeo,
      new THREE.LineDashedMaterial({ color: 0xe6b450, transparent: true, opacity: 0.5, dashSize: 0.25, gapSize: 0.18 }),
    )
    dropLine.computeLineDistances()
    scene.add(dropLine)

    // ship
    const ship = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.6, 5),
      new THREE.MeshStandardMaterial({ color: 0x8fa3bd, emissive: 0x53d3d1, emissiveIntensity: 0.25 }),
    )
    ship.rotation.x = Math.PI / 2
    scene.add(ship)

    // ghost preview line (updated per frame)
    const ghostMat = new THREE.LineBasicMaterial({ color: 0xb7c2d0, transparent: true, opacity: 0.45 })
    let ghost: THREE.Line | null = null
    // trail during execution
    const trailMat = new THREE.LineBasicMaterial({ color: 0x53d3d1, transparent: true, opacity: 0.9 })
    let trail: THREE.Line | null = null

    interface Anim {
      key: number
      points: Vec3[]
      cumLen: number[]
      totalLen: number
      duration: number
      hit: boolean
      phase: 'fly' | 'hold' | 'return' | 'done'
      phaseStart: number
    }
    let anim: Anim | null = null

    let raf = 0
    let disposed = false
    const clockStart = performance.now()

    const render = () => {
      if (disposed) return
      const now = performance.now() - clockStart
      const w = mount.clientWidth
      const h = mount.clientHeight
      if (renderer.domElement.width !== w * renderer.getPixelRatio() || renderer.domElement.height !== h * renderer.getPixelRatio()) {
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }

      const s = useGame.getState()

      gate.rotation.y = now / 900
      gate.scale.setScalar(1 + 0.06 * Math.sin(now / 350))

      // build/refresh ghost preview
      if (!s.exec && !s.missionComplete) {
        const pts: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)]
        let tip: Vec3 = v3(0, 0, 0)
        for (const t of active) {
          const c = s.burns[t.id] ?? 0
          if (Math.abs(c) < 0.005) continue
          tip = add3(tip, scale3(c, t.v))
          pts.push(toT(tip))
        }
        if (ghost) {
          scene.remove(ghost)
          ghost.geometry.dispose()
          ghost = null
        }
        if (pts.length > 1) {
          ghost = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ghostMat)
          scene.add(ghost)
        }
      } else if (ghost) {
        scene.remove(ghost)
        ghost.geometry.dispose()
        ghost = null
      }

      // execution animation
      if (s.exec && (!anim || anim.key !== s.exec.startedAt)) {
        const points: Vec3[] = [v3(0, 0, 0)]
        for (const t of active) {
          const c = s.exec.coeffs[t.id] ?? 0
          if (Math.abs(c) < 0.005) continue
          points.push(add3(points[points.length - 1], scale3(c, t.v)))
        }
        const cumLen = [0]
        let totalLen = 0
        for (let i = 1; i < points.length; i++) {
          totalLen += dist3(points[i - 1], points[i])
          cumLen.push(totalLen)
        }
        anim = {
          key: s.exec.startedAt,
          points,
          cumLen,
          totalLen,
          duration: Math.min(2800, Math.max(600, 400 + totalLen * 240)),
          hit: dist3(points[points.length - 1], mission.target.at) <= CAPTURE_3D,
          phase: 'fly',
          phaseStart: now,
        }
        if (trail) {
          scene.remove(trail)
          trail.geometry.dispose()
          trail = null
        }
      }

      let shipPos: Vec3 = v3(0, 0, 0)
      if (anim && s.exec) {
        const end = anim.points[anim.points.length - 1]
        if (anim.phase === 'fly') {
          const p = Math.min(1, (now - anim.phaseStart) / anim.duration)
          const distAlong = p * anim.totalLen
          let seg = 1
          while (seg < anim.cumLen.length && anim.cumLen[seg] < distAlong) seg++
          if (anim.totalLen < 1e-9 || seg >= anim.points.length) {
            shipPos = end
          } else {
            const a = anim.points[seg - 1]
            const b = anim.points[seg]
            const segLen = anim.cumLen[seg] - anim.cumLen[seg - 1]
            const local = segLen < 1e-9 ? 1 : (distAlong - anim.cumLen[seg - 1]) / segLen
            shipPos = add3(a, scale3(local, v3(b.x - a.x, b.y - a.y, b.z - a.z)))
          }
          if (trail) {
            scene.remove(trail)
            trail.geometry.dispose()
          }
          trail = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              ...anim.points.slice(0, seg).map(toT),
              toT(shipPos),
            ]),
            trailMat,
          )
          scene.add(trail)
          if (p >= 1) {
            anim.phase = 'hold'
            anim.phaseStart = now
          }
        } else if (anim.phase === 'hold') {
          shipPos = end
          if (now - anim.phaseStart > (anim.hit ? 700 : 450)) {
            if (anim.hit) {
              anim.phase = 'done'
              useGame.getState().executionFinished(true)
            } else {
              anim.phase = 'return'
              anim.phaseStart = now
            }
          }
        } else if (anim.phase === 'return') {
          const p = Math.min(1, (now - anim.phaseStart) / 500)
          shipPos = scale3(1 - p, end)
          if (p >= 1) {
            anim.phase = 'done'
            if (trail) {
              scene.remove(trail)
              trail.geometry.dispose()
              trail = null
            }
            useGame.getState().executionFinished(false)
          }
        } else {
          shipPos = anim.hit ? end : v3(0, 0, 0)
        }
      } else if (s.missionComplete && s.completedVia === 'burn') {
        shipPos = mission.target.at
      }

      ship.position.copy(toT(shipPos))
      controls.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      controls.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission])

  // Instruments-only fallback: without WebGL, evaluate burns directly so the
  // finale stays playable on machines that cannot create a 3D context.
  useEffect(() => {
    if (!glFailed || !exec) return
    const end = lincomb3(
      active.map((t) => exec.coeffs[t.id] ?? 0),
      active.map((t) => t.v),
    )
    const hit = dist3(end, mission.target.at) <= CAPTURE_3D
    const timer = setTimeout(() => useGame.getState().executionFinished(hit), 800)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glFailed, exec])

  return (
    <div className="mission fade-in">
      <div className="hud">
        <span className="chap">
          {chapter.number} · {chapter.name.toUpperCase()}
        </span>
        <span className="obj">{mission.target.label} — drag to orbit the view</span>
        <span className="spacer" />
        <span style={{ color: 'var(--text-dim)' }}>ATTEMPTS {attempts}</span>
        <button
          style={{ padding: '3px 10px', fontSize: 11 }}
          onClick={() => useGame.getState().backToTitle()}
        >
          Exit
        </button>
      </div>

      <div className="playfield" ref={mountRef}>
        {glFailed && (
          <div className="screen" style={{ position: 'absolute', inset: 0 }}>
            <div className="chap-sub" style={{ maxWidth: 460, textAlign: 'center', lineHeight: 1.7 }}>
              VISUAL PROJECTOR OFFLINE — WEBGL UNAVAILABLE.
              <br />
              Flying on instruments: use the nav computer readouts. The gate sits at (
              {mission.target.at.x}, {mission.target.at.y}, {mission.target.at.z}); your
              resultant is shown below the sliders.
            </div>
          </div>
        )}
        <CommsOverlay />
        {missionComplete && mission.debrief && <DebriefOverlay lines={mission.debrief} />}
      </div>

      <div className="nav-panel">
        <div className="panel-head">NAV COMPUTER — THREE-AXIS MODE</div>
        <div className="objective">{mission.objective}</div>

        {active.map((t) => {
          const c = burns[t.id] ?? 0
          return (
            <div key={t.id} className="thruster-row">
              <div className="thruster-top">
                <span style={{ color: t.color, fontWeight: 700 }}>▮ {t.label}</span>
                <span className="vec">
                  ({t.v.x}, {t.v.y}, {t.v.z})
                </span>
                <span className="burn-val" style={{ color: t.color }}>
                  {c.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={-maxBurn}
                max={maxBurn}
                step={0.05}
                value={c}
                disabled={busy}
                onChange={(e) => setBurn(t.id, parseFloat(e.target.value))}
              />
              <input
                type="number"
                min={-maxBurn}
                max={maxBurn}
                step={0.05}
                value={c}
                disabled={busy}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  if (!Number.isNaN(val)) setBurn(t.id, Math.max(-maxBurn, Math.min(maxBurn, val)))
                }}
              />
            </div>
          )
        })}

        <div className="equation">
          {active.map((t, i) => (
            <span key={t.id}>
              {i > 0 && <span className="dim"> + </span>}
              <span className="c">{(burns[t.id] ?? 0).toFixed(2)}</span>
              <span className="dim">·</span>
              <span style={{ color: t.color }}>{t.label}</span>
            </span>
          ))}
          <span className="dim"> = </span>
          <span className="r">
            ({resultant.x.toFixed(2)}, {resultant.y.toFixed(2)}, {resultant.z.toFixed(2)})
          </span>
          <div className="dim" style={{ marginTop: 6 }}>
            gate at ({mission.target.at.x}, {mission.target.at.y}, {mission.target.at.z})
          </div>
        </div>

        <div className="btn-col">
          <button className="primary" disabled={busy} onClick={execute}>
            Execute Burn
          </button>
          <button disabled={busy} onClick={resetBurns}>
            Zero Burns
          </button>
          <button
            className="danger"
            disabled={busy}
            onClick={() => reportUnreachable(targetUnreachable)}
          >
            Report: Target Unreachable
          </button>
        </div>
      </div>
    </div>
  )
}
