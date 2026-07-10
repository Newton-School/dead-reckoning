import { useEffect, useState } from 'react'
import type { Line } from '../levels/types'
import { useGame } from '../state/store'

/** Transient ORTHO hint lines shown over the playfield. */
export function CommsOverlay() {
  const comms = useGame((s) => s.comms)
  return (
    <div className="comms">
      {comms.map((c) => (
        <div key={c.id} className="comm-line">
          <span className="who">▌ {c.who}</span>
          {c.text}
        </div>
      ))}
    </div>
  )
}

/** Mission-complete panel: debrief lines revealed one by one, then CONTINUE. */
export function DebriefOverlay({ lines }: { lines: Line[] }) {
  const advanceBeat = useGame((s) => s.advanceBeat)
  const [shown, setShown] = useState(1)
  const allShown = shown >= lines.length

  useEffect(() => {
    if (allShown) return
    const t = setTimeout(() => setShown((n) => n + 1), 900)
    return () => clearTimeout(t)
  }, [shown, allShown])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 24,
        background: 'linear-gradient(180deg, transparent 30%, rgba(6,10,18,0.9))',
      }}
    >
      <div className="dialogue-wrap fade-in" style={{ pointerEvents: 'auto' }}>
        <div className="dialogue-box" style={{ minHeight: 0 }}>
          <div className="speaker SYSTEM">▌ MISSION COMPLETE</div>
          {lines.slice(0, shown).map((l, i) => (
            <div key={i} style={{ marginBottom: 8 }} className="fade-in">
              <span className={`speaker ${l.speaker}`} style={{ marginRight: 8 }}>
                {l.speaker}:
              </span>
              <span className="dialogue-text" style={{ fontSize: 14 }}>
                {l.text}
              </span>
            </div>
          ))}
          {allShown && (
            <button className="primary" style={{ marginTop: 10 }} onClick={advanceBeat}>
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
