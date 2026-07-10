import { Suspense, lazy } from 'react'
import { useGame, currentBeat } from '../state/store'
import { CHAPTERS } from '../story'
import { TitleScreen } from './TitleScreen'
import { DialogueView } from './DialogueView'
import { LogView } from './LogView'
import { MissionView } from './MissionView'
import { CreditsView } from './CreditsView'

const FinaleView = lazy(() =>
  import('../three/FinaleView').then((m) => ({ default: m.FinaleView })),
)

function ChapterTitleCard({ heading, sub }: { heading: string; sub?: string }) {
  const advanceBeat = useGame((s) => s.advanceBeat)
  return (
    <div className="screen fade-in">
      <div className="chap-heading">{heading}</div>
      {sub && <div className="chap-sub">{sub}</div>}
      <div className="title-rule" />
      <button className="primary" onClick={advanceBeat}>
        Begin
      </button>
    </div>
  )
}

export function App() {
  const screen = useGame((s) => s.screen)
  const chapterIdx = useGame((s) => s.chapterIdx)
  const beatIdx = useGame((s) => s.beatIdx)

  if (screen === 'title') {
    return (
      <div className="crt" style={{ height: '100%' }}>
        <TitleScreen />
      </div>
    )
  }

  const beat = currentBeat({ chapterIdx, beatIdx })
  const chapter = CHAPTERS[chapterIdx]
  const key = `${chapterIdx}-${beatIdx}`

  let view = null
  if (!beat) {
    view = <TitleScreen />
  } else if (beat.kind === 'title') {
    view = <ChapterTitleCard key={key} heading={beat.heading} sub={beat.sub} />
  } else if (beat.kind === 'dialogue') {
    view = <DialogueView key={key} lines={beat.lines} />
  } else if (beat.kind === 'log') {
    view = <LogView key={key} questions={beat.questions} />
  } else if (beat.kind === 'mission') {
    view = <MissionView key={key} mission={beat.mission} chapter={chapter} />
  } else if (beat.kind === 'mission3') {
    view = (
      <Suspense
        key={key}
        fallback={
          <div className="screen">
            <div className="chap-sub">LOADING THREE-AXIS PROJECTION…</div>
          </div>
        }
      >
        <FinaleView mission={beat.mission} chapter={chapter} />
      </Suspense>
    )
  } else {
    view = <CreditsView key={key} />
  }

  return <div className="crt" style={{ height: '100%' }}>{view}</div>
}
