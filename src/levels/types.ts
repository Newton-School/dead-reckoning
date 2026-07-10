import type { Vec2, Vec3 } from '../engine/vec'

export type Speaker = 'ORTHO' | 'CHEN' | 'DASHA' | 'YOU' | 'STATION' | 'SYSTEM'

export interface Line {
  speaker: Speaker
  text: string
}

export interface Thruster {
  id: string
  label: string
  v: Vec2
  color: string
  /** kg — only meaningful in jettison missions */
  mass?: number
  /** starts jettisoned/offline; shown greyed out */
  offline?: boolean
}

export type TargetKind = 'cache' | 'pod' | 'wreck' | 'dock' | 'gate'

export interface Target {
  id: string
  label: string
  at: Vec2
  kind: TargetKind
}

export interface MissionDef {
  id: string
  objective: string
  thrusters: Thruster[]
  target: Target
  /** Winning means correctly reporting the target as unreachable. */
  expectUnreachable?: boolean
  /** Show the REPORT UNREACHABLE action (always true when expectUnreachable). */
  allowReport?: boolean
  /** Slider magnitude limit (default 4). */
  maxBurn?: number
  /** Restrict burn coefficients to >= 0 (prologue only). */
  forwardOnly?: boolean
  /** 'sliders' | 'numeric' | 'both' (default 'both') */
  inputMode?: 'sliders' | 'numeric' | 'both'
  /** Nav projection (span overlay) availability. */
  overlay?: 'locked' | 'available' | 'forced'
  /** Unlock the overlay automatically after this many failed attempts. */
  overlayUnlockAfter?: number
  /** Jettison mode (Ch4): mass budget that the kept thrusters must fit. */
  jettison?: { massBudget: number }
  /** Ch5: show the station-grid readout alongside burn units. */
  stationReadout?: boolean
  /** ORTHO hint lines, shown one per failed attempt. */
  hints: string[]
  /** Dialogue injected when the mission completes. */
  debrief?: Line[]
}

export interface LogOption {
  text: string
  correct?: boolean
  /** ORTHO's in-character response to picking this option. */
  response: string
}

export interface LogQuestion {
  q: string
  options: LogOption[]
}

// ------------------------------------------------------- 3D (finale) -------

export interface Thruster3 {
  id: string
  label: string
  v: Vec3
  color: string
  offline?: boolean
}

export interface Mission3Def {
  id: string
  objective: string
  thrusters: Thruster3[]
  target: { id: string; label: string; at: Vec3 }
  expectUnreachable?: boolean
  maxBurn?: number
  hints: string[]
  debrief?: Line[]
}

// ------------------------------------------------------- beats -------------

export type Beat =
  | { kind: 'title'; heading: string; sub?: string }
  | { kind: 'dialogue'; lines: Line[] }
  | { kind: 'mission'; mission: MissionDef }
  | { kind: 'mission3'; mission: Mission3Def }
  | { kind: 'log'; questions: LogQuestion[] }
  | { kind: 'credits' }

export interface Chapter {
  id: string
  /** e.g. "CHAPTER 2" */
  number: string
  name: string
  beats: Beat[]
}
