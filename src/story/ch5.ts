import type { Chapter } from '../levels/types'
import { v2 } from '../engine/vec'

export const ch5: Chapter = {
  id: 'ch5',
  number: 'CHAPTER 5',
  name: 'Speaking in Thrust',
  beats: [
    {
      kind: 'title',
      heading: 'Chapter 5 — Speaking in Thrust',
      sub: 'DAY 11 · ANCHORAGE-9 APPROACH CORRIDOR',
    },
    {
      kind: 'dialogue',
      lines: [
        { speaker: 'STATION', text: 'ISV Meridian, this is Anchorage-9 Docking Control. You are cleared for corridor two. Final approach vector: (0.0, +3.0), station grid. Comply exactly; we log deviations.' },
        { speaker: 'CHEN', text: '"Station grid." Our console doesn\'t speak station grid, it speaks thruster burns. ORTHO?' },
        { speaker: 'ORTHO', text: 'Same universe, different dictionary, Captain. The station describes displacement in ITS units: east-gates and north-spokes. We describe the SAME displacement in OUR units: how much T1, how much T2. The arrow doesn\'t care which description you use.' },
        { speaker: 'DASHA', text: 'I re-mounted the standard rig while you slept — T1 and T2, our chosen kit. Translate their demand into our burns, Nav.' },
      ],
    },
    {
      kind: 'mission',
      mission: {
        id: 'c5m1',
        objective: 'Match Anchorage\'s demanded approach: (0.0, +3.0) in STATION GRID. Your console takes BURN UNITS (c₁, c₂). Same arrow, two languages — type the burns that say it in ours.',
        thrusters: [
          { id: 't1', label: 'T1', v: v2(2, 1), color: '#53d3d1' },
          { id: 't2', label: 'T2', v: v2(-1, 1), color: '#e6b450' },
        ],
        target: { id: 'dockpt', label: 'CORRIDOR-2', at: v2(0, 3), kind: 'dock' },
        inputMode: 'numeric',
        stationReadout: true,
        maxBurn: 4,
        overlay: 'available',
        hints: [
          'The station wants the resultant arrow to be (0, 3) in grid units. Your dials are c₁ and c₂.',
          'Solve c₁(2,1) + c₂(−1,1) = (0,3). Watch both readouts as you type: burn units on the left, station grid on the right.',
          'Rows: 2c₁ − c₂ = 0 and c₁ + c₂ = 3. The first says c₂ = 2c₁.',
        ],
        debrief: [
          { speaker: 'STATION', text: 'Approach logged: (0.0, +3.0) grid. Compliance noted, Meridian. Welcome to Anchorage.' },
          { speaker: 'ORTHO', text: 'For the record, Nav: the station never saw your sliders. You burned [1, 2] in OUR units; they logged (0, 3) in THEIRS. One arrow. Two names.' },
        ],
      },
    },
    {
      kind: 'dialogue',
      lines: [
        { speaker: 'CHEN', text: 'One arrow, two names. Then which pair of numbers is the vector, ORTHO?' },
        { speaker: 'ORTHO', text: 'Neither, Captain. The vector is the displacement itself — the physical arrow the hull actually traced. [1, 2] is its name in the basis {T1, T2}. (0, 3) is its name in the station\'s basis. Change the basis and the NAME changes. The arrow does not.' },
        { speaker: 'ORTHO', text: 'And notice: every description, in every dictionary, needed exactly two numbers. Not a station regulation — the plane itself is two-dimensional. The space fixes how many numbers a name requires; the basis fixes what they mean.' },
        { speaker: 'DASHA', text: 'Docking clamps in ten minutes. Hot showers, real coffee, and a repair bay. We made it.' },
      ],
    },
    {
      kind: 'log',
      questions: [
        {
          q: "CAPTAIN'S LOG — day 11. We burned [2.0, −1.0] in thruster units on a maneuver, and Anchorage logged the displacement as (5.0, 1.0) station grid. Which numbers are the REAL motion?",
          options: [
            {
              text: 'The burn numbers [2, −1] — that\'s what we actually fired.',
              response: 'That is the arrow\'s name in OUR dictionary. The station never saw your sliders, yet the ship truly moved. Descriptions differ; the motion doesn\'t.',
            },
            {
              text: 'The station\'s numbers (5, 1) — the station grid is objective.',
              response: 'Anchorage would love that. Their grid is just another basis — a dictionary with better marketing. Their numbers are a name too.',
            },
            {
              text: 'Neither — the displacement arrow itself is the motion; both number-pairs are descriptions of it in different bases.',
              correct: true,
              response: 'Logged. Object versus description, Nav. Most of the sloppy navigation in history comes from confusing a vector with its coordinates.',
            },
          ],
        },
        {
          q: 'Every point we ever named — burn units or grid units — took exactly two numbers. What is that "2"?',
          options: [
            {
              text: 'The number of thrusters the Meridian owns.',
              response: 'We owned three in Chapter 3, and every name still took two numbers. The hardware count was never it.',
            },
            {
              text: 'The dimension of the plane — the size of ANY basis for it.',
              correct: true,
              response: 'Logged. Every minimal kit for this plane has exactly two arrows, so every address in it has exactly two numbers. The space decides; we just comply.',
            },
            {
              text: 'A docking regulation.',
              response: 'Anchorage control wishes they had that kind of authority.',
            },
          ],
        },
      ],
    },
  ],
}
