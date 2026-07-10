import type { Chapter } from '../levels/types'
import { v2 } from '../engine/vec'

export const ch1: Chapter = {
  id: 'ch1',
  number: 'CHAPTER 1',
  name: 'One Line Home',
  beats: [
    {
      kind: 'title',
      heading: 'Chapter 1 — One Line Home',
      sub: 'DAY 2 · POWER RESERVES 71% · ONE THRUSTER',
    },
    {
      kind: 'dialogue',
      lines: [
        { speaker: 'CHEN', text: 'Morning, Nav. Two jobs today. There\'s a fuel cell cache astern — we drifted past it during the strike. Then a distress ping: escape pod, callsign POD-7. One soul aboard.' },
        { speaker: 'DASHA', text: 'Still just T1 until I finish rebuilding the amber pod. Don\'t break my thruster.' },
        { speaker: 'ORTHO', text: 'New capability: I\'ve unlocked reverse burn. Negative coefficients fire the pod backward. Same welded direction — traversed the other way.' },
        { speaker: 'CHEN', text: 'Cache first. It\'s behind us.' },
      ],
    },
    {
      kind: 'mission',
      mission: {
        id: 'c1m1',
        objective: 'Recover fuel cache CACHE-B2, astern. Reverse burns are now available: negative coefficients run T1 backward.',
        thrusters: [{ id: 't1', label: 'T1', v: v2(2, 1), color: '#53d3d1' }],
        target: { id: 'cacheb2', label: 'CACHE-B2', at: v2(-3, -1.5), kind: 'cache' },
        maxBurn: 4,
        overlay: 'locked',
        hints: [
          'The cache is behind us. Forward burns only run away from it.',
          'Negative coefficient. Same direction, opposite sense: c·T1 with c < 0.',
        ],
        debrief: [
          { speaker: 'DASHA', text: 'Fuel cells aboard. That buys us the week.' },
          { speaker: 'ORTHO', text: 'Note what reverse gave you: the far half of the same line. Multiples of T1 — positive, negative, fractional. All of them, one line.' },
        ],
      },
    },
    {
      kind: 'dialogue',
      lines: [
        { speaker: 'CHEN', text: 'Now the pod. Life support on those units is thirty hours, and we\'re past hour ten. Move.' },
        { speaker: 'ORTHO', text: 'POD-7 bearing marked. I\'ll be honest with you, Nav: I have run the numbers already. I want you to run them anyway. You\'ll learn more from the attempt than from my answer.' },
      ],
    },
    {
      kind: 'mission',
      mission: {
        id: 'c1m2',
        objective: 'Reach escape pod POD-7. If a rendezvous is impossible, report it — Anchorage traffic control can re-task a cutter, but only on a confirmed negative.',
        thrusters: [{ id: 't1', label: 'T1', v: v2(2, 1), color: '#53d3d1' }],
        target: { id: 'pod7', label: 'POD-7', at: v2(3, 3), kind: 'pod' },
        expectUnreachable: true,
        allowReport: true,
        maxBurn: 4,
        overlay: 'locked',
        overlayUnlockAfter: 2,
        hints: [
          'Try scaling the burn. Any coefficient you like.',
          'Enabling NAV PROJECTION: I\'m drawing every point any T1 burn can ever reach. All of them.',
          'Every reachable point lies on that one line. Look where the pod sits. There is nothing wrong with your piloting, Nav.',
        ],
        debrief: [
          { speaker: 'ORTHO', text: 'Confirmed negative transmitted. Anchorage is re-tasking a cutter with a full drive; POD-7 will be recovered with hours to spare. You made the right call — and you made it with mathematics.' },
        ],
      },
    },
    {
      kind: 'dialogue',
      lines: [
        { speaker: 'CHEN', text: 'You\'re sure, Nav? We don\'t abandon people on a hunch.' },
        { speaker: 'ORTHO', text: 'Not a hunch, Captain. With one thruster, every possible burn lands on one line: every multiple of T1. That set has a name — the SPAN of T1. The pod is not in it. No coefficient exists that puts us there, at any fuel cost.' },
        { speaker: 'CHEN', text: 'One thruster, one line. Understood. Dasha — I want that second pod yesterday.' },
        { speaker: 'DASHA', text: 'Working on it. And Nav — when I hand you a second direction, everything changes. Sleep well.' },
      ],
    },
    {
      kind: 'log',
      questions: [
        {
          q: "CAPTAIN'S LOG — day 2. Why couldn't the Meridian reach POD-7?",
          options: [
            {
              text: 'Insufficient fuel for the burn.',
              response: 'We had fuel to burn all week. Cost was never the constraint — geometry was.',
            },
            {
              text: 'The pod was not on the line of all possible T1 burns.',
              correct: true,
              response: 'Logged. Every T1 burn — forward, reverse, any magnitude — lands on one line through our position. POD-7 sat off it.',
            },
            {
              text: 'The burn limit was too small; a bigger slider would have reached it.',
              response: 'Scale a burn by a million and you are still on the same line, just further along it. Magnitude was never the problem.',
            },
          ],
        },
        {
          q: 'ORTHO called the reachable set "span{T1}". Which statement best describes it?',
          options: [
            {
              text: 'All points at burn-distance |c| from the ship — a circle around us.',
              response: 'A circle would require turning. Nothing on this hull turns. Look at what the projection actually drew.',
            },
            {
              text: 'All multiples c·T1 — a line through our position, both directions, every length.',
              correct: true,
              response: 'Logged. The span of one vector is a line. Remember the shape of your prison; tomorrow we break out of it.',
            },
            {
              text: 'The points close to the tip of the T1 arrow.',
              response: 'The arrow\'s tip is one burn: c = 1. The span is every burn at once.',
            },
          ],
        },
      ],
    },
  ],
}
