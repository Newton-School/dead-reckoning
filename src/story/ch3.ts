import type { Chapter } from '../levels/types'
import { v2 } from '../engine/vec'

export const ch3: Chapter = {
  id: 'ch3',
  number: 'CHAPTER 3',
  name: 'The Drift Trap',
  beats: [
    {
      kind: 'title',
      heading: 'Chapter 3 — The Drift Trap',
      sub: 'DAY 5 · POWER RESERVES 52% · SALVAGE OPERATION',
    },
    {
      kind: 'dialogue',
      lines: [
        { speaker: 'CHEN', text: 'Good news first: Dasha cut a third thruster pod off that dead hauler. Bad news: the salvage arc blew a conduit, and T2 is down until she re-wires it.' },
        { speaker: 'DASHA', text: 'The new pod\'s designation is T3. Big, ugly, and it fires hard. You\'re flying T1 and T3 today.' },
        { speaker: 'ORTHO', text: 'Two thrusters again, Nav. Yesterday two thrusters meant the whole sky. I will let you discover whether the sky agrees.' },
        { speaker: 'CHEN', text: 'There\'s a derelict comms relay, RELAY-K, off the port bow. Anchorage pays salvage rates for those. Go get it.' },
      ],
    },
    {
      kind: 'mission',
      mission: {
        id: 'c3m1',
        objective: 'Reach derelict relay RELAY-K with thrusters T1 and T3. If a rendezvous is impossible, report the confirmed negative.',
        thrusters: [
          { id: 't1', label: 'T1', v: v2(2, 1), color: '#53d3d1' },
          { id: 't3', label: 'T3', v: v2(-4, -2), color: '#f07178' },
        ],
        target: { id: 'relayk', label: 'RELAY-K', at: v2(1, 2), kind: 'wreck' },
        expectUnreachable: true,
        allowReport: true,
        maxBurn: 4,
        overlay: 'available',
        hints: [
          'Two thrusters worked yesterday. Try the same instincts.',
          'Toggle the NAV PROJECTION. Two thrusters... and the glow is a line. Interesting.',
          'Look at T3\'s numbers: (−4, −2). Now look at T1\'s: (2, 1). Say them out loud, slowly.',
        ],
        debrief: [
          { speaker: 'ORTHO', text: 'Confirmed negative logged. Correct call, Nav. Now let us have the conversation the projection was begging us to have.' },
        ],
      },
    },
    {
      kind: 'dialogue',
      lines: [
        { speaker: 'CHEN', text: 'Explain it to me, ORTHO. Two thrusters. Yesterday that meant everywhere. Today we\'re fenced onto a line again. What is T3 actually giving us?' },
        { speaker: 'ORTHO', text: 'Nothing, Captain. T3 is (−4, −2). T1 is (2, 1). T3 = −2 · T1: it is T1 wearing a bigger jacket and facing the other way. Every point a T3 burn reaches, a reverse T1 burn already reached.' },
        { speaker: 'ORTHO', text: 'T3 lives INSIDE the span of T1. A new thruster only grows your reach if it points somewhere your current span cannot already go. The textbooks say T3 is linearly DEPENDENT on T1. I say it\'s dead weight with a flame on it.' },
        { speaker: 'DASHA', text: 'Charming. T2\'s conduit is re-wired — bringing the amber pod back online now.' },
        { speaker: 'CHEN', text: 'Then we have a real second direction again. Nav, all three pods live. Take us to that relay.' },
      ],
    },
    {
      kind: 'mission',
      mission: {
        id: 'c3m2',
        objective: 'Reach RELAY-K with all three thrusters live. Any burn that gets there is a valid burn.',
        thrusters: [
          { id: 't1', label: 'T1', v: v2(2, 1), color: '#53d3d1' },
          { id: 't2', label: 'T2', v: v2(-1, 1), color: '#e6b450' },
          { id: 't3', label: 'T3', v: v2(-4, -2), color: '#f07178' },
        ],
        target: { id: 'relayk', label: 'RELAY-K', at: v2(1, 2), kind: 'wreck' },
        maxBurn: 4,
        overlay: 'available',
        hints: [
          'T2 is back: the plane is yours again.',
          'c₁ = 1, c₂ = 1, c₃ = 0 works. So do infinitely many others. Try one with c₃ ≠ 0 if you\'re curious.',
        ],
        debrief: [
          { speaker: 'ORTHO', text: 'Relay grappled. Did you notice? There were infinitely many correct burns today — spend T3 and compensate with T1, or ignore T3 entirely. Redundant directions buy you freedom of CHOICE, never freedom of REACH. That distinction is about to cost or save us a great deal of fuel.' },
        ],
      },
    },
    {
      kind: 'log',
      questions: [
        {
          q: "CAPTAIN'S LOG — day 5. T3 came online and our reach did not grow at all. Why?",
          options: [
            {
              text: 'T3 was damaged in the salvage.',
              response: 'T3 fires beautifully. It simply fires along a line we already owned.',
            },
            {
              text: 'T3 = −2·T1 — its direction was already in our span, so it added no new reach.',
              correct: true,
              response: 'Logged. Dependence: the new arrow already lives in the span of the old ones. The projection knew before we did.',
            },
            {
              text: 'We needed more fuel to unlock T3\'s range.',
              response: 'Range was never the fence. Any T3 burn, at any cost, lands where a T1 burn could already land.',
            },
          ],
        },
        {
          q: 'Which claim about thrusters survived today?',
          options: [
            {
              text: 'More thrusters always mean more reach.',
              response: 'That belief died at 0900 with two thrusters glowing a single line. Reach comes from directions, not from inventory.',
            },
            {
              text: 'A new thruster grows the span only if it points OUTSIDE the span of the ones we have.',
              correct: true,
              response: 'Logged. Independence is the property that buys reach. Dependence buys spare parts.',
            },
            {
              text: 'Opposite-pointing thrusters are useless.',
              response: 'Reverse burns gave us "opposite" for free on day 2. T3\'s crime wasn\'t pointing backward — it was pointing along a line we already had.',
            },
          ],
        },
      ],
    },
  ],
}
