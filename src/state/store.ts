import { create } from 'zustand'
import type { MissionDef, Mission3Def, Beat } from '../levels/types'
import { CHAPTERS } from '../story'

export interface CommLine {
  id: number
  who: string
  text: string
}

interface ExecState {
  /** Snapshot of coefficients at EXECUTE time, keyed by thruster id. */
  coeffs: Record<string, number>
  startedAt: number
}

interface GameState {
  screen: 'title' | 'game'
  chapterIdx: number
  beatIdx: number

  // --- mission runtime (shared by 2D and 3D missions) ---
  burns: Record<string, number>
  jettisoned: string[]
  attempts: number
  overlayOn: boolean
  overlayUnlocked: boolean
  exec: ExecState | null
  missionComplete: boolean
  completedVia: 'burn' | 'report' | null
  comms: CommLine[]

  // --- actions ---
  startChapter: (idx: number) => void
  resumeSaved: () => void
  advanceBeat: () => void
  backToTitle: () => void

  setBurn: (id: string, value: number) => void
  resetBurns: () => void
  toggleOverlay: () => void
  unlockOverlay: () => void
  toggleJettison: (id: string) => void
  execute: () => void
  /** Called by the playfield when the burn animation lands. */
  executionFinished: (hit: boolean) => void
  reportUnreachable: (targetActuallyUnreachable: boolean) => void
  pushComm: (who: string, text: string) => void
  completeMission: (via: 'burn' | 'report') => void
}

const SAVE_KEY = 'dead-reckoning-progress-v1'

export function currentBeat(s: Pick<GameState, 'chapterIdx' | 'beatIdx'>): Beat | null {
  const ch = CHAPTERS[s.chapterIdx]
  if (!ch) return null
  return ch.beats[s.beatIdx] ?? null
}

export function beatMission(beat: Beat | null): MissionDef | Mission3Def | null {
  if (!beat) return null
  if (beat.kind === 'mission') return beat.mission
  if (beat.kind === 'mission3') return beat.mission
  return null
}

function missionInitState(beat: Beat | null) {
  const m = beatMission(beat)
  const overlay = m && 'overlay' in m ? m.overlay : undefined
  return {
    burns: {},
    jettisoned: [],
    attempts: 0,
    overlayOn: overlay === 'forced',
    overlayUnlocked: overlay === 'available' || overlay === 'forced',
    exec: null,
    missionComplete: false,
    completedVia: null,
    comms: [],
  }
}

export function loadSave(): { chapterIdx: number; beatIdx: number } | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    if (typeof p.chapterIdx === 'number' && typeof p.beatIdx === 'number' && CHAPTERS[p.chapterIdx]) {
      return p
    }
  } catch {
    /* corrupted save — ignore */
  }
  return null
}

function persist(chapterIdx: number, beatIdx: number) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ chapterIdx, beatIdx }))
  } catch {
    /* storage unavailable — play without saves */
  }
}

let commId = 0

export const useGame = create<GameState>((set, get) => ({
  screen: 'title',
  chapterIdx: 0,
  beatIdx: 0,
  ...missionInitState(null),

  startChapter: (idx) => {
    const beat = currentBeat({ chapterIdx: idx, beatIdx: 0 })
    persist(idx, 0)
    set({ screen: 'game', chapterIdx: idx, beatIdx: 0, ...missionInitState(beat) })
  },

  resumeSaved: () => {
    const s = loadSave()
    if (!s) return
    const beat = currentBeat(s)
    set({ screen: 'game', ...s, ...missionInitState(beat) })
  },

  advanceBeat: () => {
    const { chapterIdx, beatIdx } = get()
    const ch = CHAPTERS[chapterIdx]
    if (beatIdx + 1 < ch.beats.length) {
      const next = { chapterIdx, beatIdx: beatIdx + 1 }
      persist(next.chapterIdx, next.beatIdx)
      set({ ...next, ...missionInitState(currentBeat(next)) })
    } else if (chapterIdx + 1 < CHAPTERS.length) {
      const next = { chapterIdx: chapterIdx + 1, beatIdx: 0 }
      persist(next.chapterIdx, next.beatIdx)
      set({ ...next, ...missionInitState(currentBeat(next)) })
    } else {
      persist(0, 0)
      set({ screen: 'title' })
    }
  },

  backToTitle: () => set({ screen: 'title' }),

  setBurn: (id, value) =>
    set((s) => ({ burns: { ...s.burns, [id]: value } })),

  resetBurns: () => set({ burns: {}, exec: null }),

  toggleOverlay: () => set((s) => (s.overlayUnlocked ? { overlayOn: !s.overlayOn } : {})),

  unlockOverlay: () => set({ overlayUnlocked: true, overlayOn: true }),

  toggleJettison: (id) =>
    set((s) => ({
      jettisoned: s.jettisoned.includes(id)
        ? s.jettisoned.filter((j) => j !== id)
        : [...s.jettisoned, id],
      // A changed kit invalidates any plotted burn on the dropped pod.
      burns: { ...s.burns, [id]: 0 },
    })),

  execute: () => {
    const { exec, burns, missionComplete } = get()
    if (exec || missionComplete) return
    set({ exec: { coeffs: { ...burns }, startedAt: performance.now() } })
  },

  executionFinished: (hit) => {
    const s = get()
    if (!s.exec) return
    if (hit) {
      set({ exec: null })
      s.completeMission('burn')
      return
    }
    const beat = currentBeat(s)
    const m = beatMission(beat)
    const attempts = s.attempts + 1
    set({ exec: null, attempts })
    if (m) {
      const hint = m.hints[Math.min(attempts - 1, m.hints.length - 1)]
      if (hint) s.pushComm('ORTHO', hint)
      if ('overlayUnlockAfter' in m && m.overlayUnlockAfter && attempts >= m.overlayUnlockAfter && !s.overlayUnlocked) {
        set({ overlayUnlocked: true, overlayOn: true })
      }
    }
  },

  reportUnreachable: (targetActuallyUnreachable) => {
    const s = get()
    if (s.missionComplete || s.exec) return
    if (targetActuallyUnreachable) {
      s.completeMission('report')
    } else {
      set({ attempts: s.attempts + 1 })
      s.pushComm(
        'ORTHO',
        'Negative on that negative, Nav — I can find a burn that reaches it. The target is inside our span. Look again.',
      )
    }
  },

  pushComm: (who, text) => {
    const id = ++commId
    set((s) => ({ comms: [...s.comms.slice(-2), { id, who, text }] }))
    setTimeout(() => {
      set((s) => ({ comms: s.comms.filter((c) => c.id !== id) }))
    }, 9000)
  },

  completeMission: (via) => set({ missionComplete: true, completedVia: via }),
}))
