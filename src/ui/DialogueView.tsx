import { useEffect, useState } from 'react'
import type { Line } from '../levels/types'
import { useGame } from '../state/store'

export function DialogueView({ lines }: { lines: Line[] }) {
  const advanceBeat = useGame((s) => s.advanceBeat)
  const [idx, setIdx] = useState(0)
  const [chars, setChars] = useState(0)
  const line = lines[idx]
  const done = chars >= line.text.length

  useEffect(() => {
    setChars(0)
    const iv = setInterval(() => {
      setChars((c) => {
        if (c >= lines[idx].text.length) {
          clearInterval(iv)
          return c
        }
        return c + 2
      })
    }, 16)
    return () => clearInterval(iv)
  }, [idx, lines])

  const proceed = () => {
    if (!done) {
      setChars(line.text.length)
    } else if (idx + 1 < lines.length) {
      setIdx(idx + 1)
    } else {
      advanceBeat()
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        proceed()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="screen" onClick={proceed} style={{ cursor: 'pointer' }}>
      <div className="dialogue-wrap fade-in">
        <div className="dialogue-box">
          <div className={`speaker ${line.speaker}`}>▌ {line.speaker}</div>
          <div className="dialogue-text">
            {line.text.slice(0, chars)}
            {!done && <span style={{ opacity: 0.6 }}>▋</span>}
          </div>
        </div>
        <div className="dialogue-hint">
          {idx + 1} / {lines.length} — TAP, CLICK or SPACE to continue
        </div>
      </div>
    </div>
  )
}
