import { useState } from 'react'
import type { LogQuestion } from '../levels/types'
import { useGame } from '../state/store'

export function LogView({ questions }: { questions: LogQuestion[] }) {
  const advanceBeat = useGame((s) => s.advanceBeat)
  const [qIdx, setQIdx] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const q = questions[qIdx]
  const chosenOpt = chosen !== null ? q.options[chosen] : null
  const solved = chosenOpt?.correct === true

  const next = () => {
    if (qIdx + 1 < questions.length) {
      setQIdx(qIdx + 1)
      setChosen(null)
    } else {
      advanceBeat()
    }
  }

  return (
    <div className="screen">
      <div className="log-wrap fade-in">
        <div className="log-head">
          ▌ CAPTAIN'S LOG — ENTRY {qIdx + 1} OF {questions.length}
        </div>
        <div className="log-q">{q.q}</div>
        <div className="log-opts">
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={
                chosen === i ? (opt.correct ? 'chosen-right' : 'chosen-wrong') : ''
              }
              disabled={solved && chosen !== i}
              onClick={() => setChosen(i)}
            >
              {String.fromCharCode(65 + i)}. {opt.text}
            </button>
          ))}
        </div>
        {chosenOpt && (
          <div className="log-response fade-in" key={chosen}>
            <span className="who">▌ ORTHO</span>
            {chosenOpt.response}
          </div>
        )}
        {solved && (
          <button className="primary" onClick={next}>
            {qIdx + 1 < questions.length ? 'Next Entry' : 'Close Log'}
          </button>
        )}
      </div>
    </div>
  )
}
