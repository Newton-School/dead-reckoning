import type { Chapter } from '../levels/types'
import { v2 } from '../engine/vec'

export const prologue: Chapter = {
  id: 'prologue',
  number: 'PROLOGUE',
  name: 'Debris Strike',
  beats: [
    {
      kind: 'title',
      heading: 'Prologue — Debris Strike',
      sub: 'ISV MERIDIAN · SALVAGE TUG · OUTER BELT, EROS APPROACH',
    },
    {
      kind: 'dialogue',
      lines: [
        { speaker: 'SYSTEM', text: 'IMPACT. HULL SECTION 7. MAIN DRIVE: OFFLINE. NAV COMPUTER: OFFLINE.' },
        { speaker: 'CHEN', text: 'Report.' },
        { speaker: 'DASHA', text: 'Debris strike, Captain. Mains are gone — weeks of yard work, and the nearest yard is on the other side of nowhere. Primary nav core is slag.' },
        { speaker: 'CHEN', text: 'What do we still have?' },
        { speaker: 'DASHA', text: 'RCS thruster pods. Welded to the hull at fixed angles — I can give you burn magnitude on each, forward or reverse. That\'s it. No gimbal, no turning them.' },
        { speaker: 'ORTHO', text: 'Backup navigation intelligence ORTHO, online. Running on emergency power and, apparently, optimism.' },
        { speaker: 'CHEN', text: 'Nav — you heard the engineer. Fixed directions, manual burns. Get us moving. Start with the supply cache off the bow; we need those oxygen candles.' },
        { speaker: 'ORTHO', text: 'Handing you burn control for pod T1. One thruster, one fixed direction. The slider chooses how much of that direction you get. I\'ll draw what I can.' },
      ],
    },
    {
      kind: 'mission',
      mission: {
        id: 'p1',
        objective: 'Reach supply cache CACHE-01. One thruster. The burn coefficient scales a fixed displacement.',
        thrusters: [{ id: 't1', label: 'T1', v: v2(2, 1), color: '#53d3d1' }],
        target: { id: 'cache01', label: 'CACHE-01', at: v2(4, 2), kind: 'cache' },
        forwardOnly: true,
        maxBurn: 4,
        overlay: 'locked',
        inputMode: 'both',
        hints: [
          'The ghost line is your plotted burn. Slide until the endpoint sits on the cache, then execute.',
          'T1 moves us (2, 1) per unit of burn. The cache is at (4, 2). How many units of T1 is that?',
        ],
        debrief: [
          { speaker: 'DASHA', text: 'Contact. Grapples on the cache. Nice and clean, Nav.' },
          { speaker: 'ORTHO', text: 'For the record: you just scaled a vector. Direction fixed by the weld, length chosen by you. Hold that thought — it is about to become your entire job.' },
        ],
      },
    },
    {
      kind: 'log',
      questions: [
        {
          q: "CAPTAIN'S LOG — day 1. The burn control took one number and the ship moved. What did that number actually do?",
          options: [
            {
              text: 'It set the ship\'s speed.',
              response: 'Speed died with the mains. The number scaled a displacement — direction fixed, length chosen. Try again.',
            },
            {
              text: 'It scaled a fixed displacement arrow — the direction was locked, the length was ours.',
              correct: true,
              response: 'Logged. One thruster, one welded direction; the coefficient only stretches it. Sleep. Tomorrow we learn what "reverse" buys us.',
            },
            {
              text: 'It chose which direction to travel.',
              response: 'The direction is welded to the hull. We chose how much of it. Look again at what varied and what never did.',
            },
          ],
        },
      ],
    },
  ],
}
