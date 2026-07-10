import type { Chapter, MissionDef } from '../levels/types'
import { lincomb2, spanContains2 } from '../engine/vec'
import { useGame } from '../state/store'
import { PlayfieldCanvas } from '../render/PlayfieldCanvas'
import { DebriefOverlay, CommsOverlay } from './MissionShared'

export function MissionView({ mission, chapter }: { mission: MissionDef; chapter: Chapter }) {
  const burns = useGame((s) => s.burns)
  const jettisoned = useGame((s) => s.jettisoned)
  const exec = useGame((s) => s.exec)
  const missionComplete = useGame((s) => s.missionComplete)
  const overlayOn = useGame((s) => s.overlayOn)
  const overlayUnlocked = useGame((s) => s.overlayUnlocked)
  const setBurn = useGame((s) => s.setBurn)
  const resetBurns = useGame((s) => s.resetBurns)
  const toggleOverlay = useGame((s) => s.toggleOverlay)
  const toggleJettison = useGame((s) => s.toggleJettison)
  const execute = useGame((s) => s.execute)
  const reportUnreachable = useGame((s) => s.reportUnreachable)
  const attempts = useGame((s) => s.attempts)

  const maxBurn = mission.maxBurn ?? 4
  const inputMode = mission.inputMode ?? 'both'
  const active = mission.thrusters.filter((t) => !t.offline && !jettisoned.includes(t.id))
  const resultant = lincomb2(
    active.map((t) => burns[t.id] ?? 0),
    active.map((t) => t.v),
  )

  const keptMass = mission.jettison
    ? active.reduce((sum, t) => sum + (t.mass ?? 0), 0)
    : 0
  const overBudget = mission.jettison ? keptMass > mission.jettison.massBudget : false

  const targetUnreachable = !spanContains2(
    active.map((t) => t.v),
    mission.target.at,
  )
  const busy = !!exec || missionComplete

  return (
    <div className="mission fade-in">
      <div className="hud">
        <span className="chap">
          {chapter.number} · {chapter.name.toUpperCase()}
        </span>
        <span className="obj">{mission.target.label}</span>
        <span className="spacer" />
        <span style={{ color: 'var(--text-dim)' }}>ATTEMPTS {attempts}</span>
        <button
          style={{ padding: '3px 10px', fontSize: 11 }}
          onClick={() => useGame.getState().backToTitle()}
        >
          Exit
        </button>
      </div>

      <div className="playfield">
        <PlayfieldCanvas mission={mission} />
        <CommsOverlay />
        {missionComplete && mission.debrief && <DebriefOverlay lines={mission.debrief} />}
      </div>

      <div className="nav-panel">
        <div className="panel-head">NAV COMPUTER — MANUAL BURN CONTROL</div>
        <div className="objective">{mission.objective}</div>

        {mission.thrusters.map((t) => {
          const dead = !!t.offline || jettisoned.includes(t.id)
          const c = burns[t.id] ?? 0
          return (
            <div key={t.id} className={`thruster-row ${dead ? 'dead' : ''}`}>
              <div className="thruster-top">
                <span style={{ color: t.color, fontWeight: 700 }}>▮ {t.label}</span>
                <span className="vec">
                  ({t.v.x}, {t.v.y}){t.mass ? ` · ${t.mass} kg` : ''}
                </span>
                <span className="burn-val" style={{ color: t.color }}>
                  {dead ? 'CUT' : c.toFixed(1)}
                </span>
              </div>
              {!dead && inputMode !== 'numeric' && (
                <input
                  type="range"
                  min={mission.forwardOnly ? 0 : -maxBurn}
                  max={maxBurn}
                  step={0.1}
                  value={c}
                  disabled={busy}
                  onChange={(e) => setBurn(t.id, parseFloat(e.target.value))}
                />
              )}
              {!dead && inputMode !== 'sliders' && (
                <input
                  type="number"
                  min={mission.forwardOnly ? 0 : -maxBurn}
                  max={maxBurn}
                  step={0.05}
                  value={c}
                  disabled={busy}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value)
                    if (!Number.isNaN(val)) setBurn(t.id, Math.max(-maxBurn, Math.min(maxBurn, val)))
                  }}
                />
              )}
              {mission.jettison && (
                <button
                  className={jettisoned.includes(t.id) ? '' : 'danger'}
                  disabled={busy}
                  style={{ padding: '4px 10px', fontSize: 11 }}
                  onClick={() => toggleJettison(t.id)}
                >
                  {jettisoned.includes(t.id) ? 'Restore (tethered)' : 'Jettison'}
                </button>
              )}
            </div>
          )
        })}

        {mission.jettison && (
          <div>
            <div className="jettison-info">
              <span>POD MASS KEPT</span>
              <span style={{ color: overBudget ? 'var(--red)' : 'var(--green)' }}>
                {keptMass} / {mission.jettison.massBudget} kg
              </span>
            </div>
            <div className="mass-bar">
              <div
                className={`fill ${overBudget ? 'over' : ''}`}
                style={{
                  transform: `scaleX(${Math.min(1, keptMass / mission.jettison.massBudget)})`,
                }}
              />
            </div>
          </div>
        )}

        <div className="equation">
          {active.map((t, i) => (
            <span key={t.id}>
              {i > 0 && <span className="dim"> + </span>}
              <span className="c">{(burns[t.id] ?? 0).toFixed(1)}</span>
              <span className="dim">·</span>
              <span style={{ color: t.color }}>
                {t.label}({t.v.x},{t.v.y})
              </span>
            </span>
          ))}
          <span className="dim"> = </span>
          <span className="r">
            ({resultant.x.toFixed(1)}, {resultant.y.toFixed(1)})
          </span>
        </div>

        {mission.stationReadout && (
          <div className="readout-grid">
            <div className="readout">
              <div className="label">BURN UNITS (OURS)</div>
              [{active.map((t) => (burns[t.id] ?? 0).toFixed(1)).join(', ')}]
            </div>
            <div className="readout">
              <div className="label">STATION GRID (THEIRS)</div>
              ({resultant.x.toFixed(1)}, {resultant.y.toFixed(1)})
              <div style={{ color: 'var(--text-dim)', marginTop: 4 }}>
                demanded: ({mission.target.at.x.toFixed(1)}, {mission.target.at.y.toFixed(1)})
              </div>
            </div>
          </div>
        )}

        <div className="btn-col">
          <button
            className="primary"
            disabled={busy || overBudget}
            title={overBudget ? 'Pod mass over harness budget — jettison first' : ''}
            onClick={execute}
          >
            {overBudget ? 'Over Mass Budget' : 'Execute Burn'}
          </button>
          <button disabled={busy} onClick={resetBurns}>
            Zero Burns
          </button>
          {overlayUnlocked && (
            <button onClick={toggleOverlay} disabled={missionComplete}>
              Nav Projection: {overlayOn ? 'ON' : 'OFF'}
            </button>
          )}
          {(mission.allowReport || mission.expectUnreachable) && (
            <button
              className="danger"
              disabled={busy}
              onClick={() => reportUnreachable(targetUnreachable)}
            >
              Report: Target Unreachable
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
