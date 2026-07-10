import { useGame } from '../state/store'

const LADDER = [
  ['vector', 'a displacement with direction and length — a welded thruster'],
  ['scalar multiple', 'c·v — the burn slider, forward or reverse'],
  ['linear combination', 'c₁v₁ + c₂v₂ + … — one plotted burn'],
  ['span', 'every point any burn can reach — the nav projection'],
  ['dependence', 'a new arrow inside the old span — dead weight (T3)'],
  ['independence', 'a direction the current kit cannot speak'],
  ['basis', 'a minimal kit that still reaches everything'],
  ['coordinates', "the arrow's name in a chosen basis — burn units vs station grid"],
  ['dimension', 'the size every minimal kit must have — the space decides'],
]

export function CreditsView() {
  const backToTitle = useGame((s) => s.backToTitle)
  return (
    <div className="screen fade-in" style={{ gap: 12 }}>
      <div className="title-word" style={{ fontSize: 'clamp(24px, 5vw, 46px)' }}>
        DEAD RECKONING
      </div>
      <div className="title-sub">CONTRACT COMPLETE · ISV MERIDIAN, HOMEWARD</div>
      <div className="title-rule" />
      <div style={{ maxWidth: 620, width: '92vw', maxHeight: '46vh', overflowY: 'auto' }}>
        <div className="panel-head" style={{ marginBottom: 10 }}>
          CARGO MANIFEST — IDEAS ABOARD
        </div>
        {LADDER.map(([term, gloss]) => (
          <div key={term} style={{ display: 'flex', gap: 12, padding: '5px 0', fontSize: 13 }}>
            <span style={{ color: 'var(--cyan)', minWidth: 170 }}>{term}</span>
            <span style={{ color: 'var(--text-dim)' }}>{gloss}</span>
          </div>
        ))}
      </div>
      <div className="title-sub" style={{ fontSize: 11 }}>
        NEXT CONTRACT: the same ship, described in two bases — "change of basis"
      </div>
      <button className="primary" onClick={backToTitle}>
        Return to Title
      </button>
    </div>
  )
}
