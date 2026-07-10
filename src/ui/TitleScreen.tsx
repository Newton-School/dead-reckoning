import { useState } from 'react'
import { useGame, loadSave } from '../state/store'
import { CHAPTERS } from '../story'

export function TitleScreen() {
  const startChapter = useGame((s) => s.startChapter)
  const resumeSaved = useGame((s) => s.resumeSaved)
  const [showChapters, setShowChapters] = useState(false)
  const save = loadSave()

  return (
    <div className="screen fade-in">
      <div className="title-sub">ISV MERIDIAN · OUTER BELT</div>
      <div className="title-word">DEAD RECKONING</div>
      <div className="title-sub">a linear algebra story — span · independence · basis</div>
      <div className="title-rule" />
      {!showChapters ? (
        <>
          <button className="primary" onClick={() => startChapter(0)}>
            New Game
          </button>
          {save && (save.chapterIdx > 0 || save.beatIdx > 0) && (
            <button onClick={resumeSaved}>
              Resume — {CHAPTERS[save.chapterIdx].number}
            </button>
          )}
          <button onClick={() => setShowChapters(true)}>Chapters</button>
        </>
      ) : (
        <>
          <div className="chapter-list">
            {CHAPTERS.map((ch, i) => (
              <button key={ch.id} onClick={() => startChapter(i)}>
                <span>
                  {ch.number} — {ch.name}
                </span>
                <span className="num">{'▸'}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setShowChapters(false)}>Back</button>
        </>
      )}
      <div className="title-sub" style={{ marginTop: 24, fontSize: 11 }}>
        NEWTON SCHOOL OF TECHNOLOGY · MATHEMATICS TRACK
      </div>
    </div>
  )
}
