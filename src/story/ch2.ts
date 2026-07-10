import type { Chapter } from '../levels/types'
import { v2 } from '../engine/vec'

export const ch2: Chapter = {
  id: 'ch2',
  number: 'CHAPTER 2',
  name: 'Two Arrows, Whole Sky',
  beats: [
    {
      kind: 'title',
      heading: 'Chapter 2 — Two Arrows, Whole Sky',
      sub: 'DAY 3 · POWER RESERVES 64% · SECOND THRUSTER ONLINE',
    },
    {
      kind: 'dialogue',
      lines: [
        { speaker: 'DASHA', text: 'Amber pod T2 is live. Different weld, different direction. Treat it gently.' },
        { speaker: 'ORTHO', text: 'Two thrusters now, Nav. Each burn is: coefficient one times T1, plus coefficient two times T2. I believe the textbooks call that a linear combination. I call it "finally having options."' },
        { speaker: 'CHEN', text: 'Anchorage\'s cutter got re-tasked to a freighter fire — POD-7 is ours again, and the clock never stopped. Yesterday it was unreachable. Prove that yesterday is over.' },
      ],
    },
    {
      kind: 'mission',
      mission: {
        id: 'c2m1',
        objective: 'Rendezvous with POD-7 — the target you PROVED unreachable yesterday. Two thrusters: your burn is c₁·T1 + c₂·T2.',
        thrusters: [
          { id: 't1', label: 'T1', v: v2(2, 1), color: '#53d3d1' },
          { id: 't2', label: 'T2', v: v2(-1, 1), color: '#e6b450' },
        ],
        target: { id: 'pod7', label: 'POD-7', at: v2(3, 3), kind: 'pod' },
        maxBurn: 4,
        overlay: 'available',
        hints: [
          'Watch the ghost path: T1\'s contribution, then T2\'s, tip to tail.',
          'Think in steps. How much T1 gets close? Then how much T2 corrects the miss?',
          'If you want the algebra: solve c₁(2,1) + c₂(−1,1) = (3,3). Two equations, two unknowns.',
        ],
        debrief: [
          { speaker: 'DASHA', text: 'Airlock cycling... we have her. Pilot\'s dehydrated and furious, which means she\'ll live.' },
          { speaker: 'CHEN', text: 'Yesterday: impossible. Today: routine. I want to understand what changed, ORTHO.' },
        ],
      },
    },
    {
      kind: 'dialogue',
      lines: [
        { speaker: 'ORTHO', text: 'Watch, Captain. Recomputing the nav projection with both thrusters...' },
        { speaker: 'ORTHO', text: 'Yesterday your world was a line. Today, every point on the plane is a settable dial away: some amount of T1, some amount of T2. The span of two independent directions is EVERYTHING.' },
        { speaker: 'DASHA', text: 'Two arrows. Whole sky.' },
        { speaker: 'ORTHO', text: 'Careful with the word "two", engineer. It was not the count that saved us. It was that T2 points OFF T1\'s line. Remember that when you salvage me my next thruster.' },
      ],
    },
    {
      kind: 'mission',
      mission: {
        id: 'c2m2',
        objective: 'Collect med-kit canister CACHE-M4. Note what your T1 slider is doing when the plot is right.',
        thrusters: [
          { id: 't1', label: 'T1', v: v2(2, 1), color: '#53d3d1' },
          { id: 't2', label: 'T2', v: v2(-1, 1), color: '#e6b450' },
        ],
        target: { id: 'cachem4', label: 'CACHE-M4', at: v2(-2, 2), kind: 'cache' },
        maxBurn: 4,
        overlay: 'available',
        hints: [
          'Not every job needs every thruster.',
          'CACHE-M4 sits at (−2, 2). Look at T2\'s direction: (−1, 1). Suspicious, no?',
        ],
        debrief: [
          { speaker: 'ORTHO', text: 'Zero T1. A coefficient of nothing is still a choice — the combination c₁ = 0, c₂ = 2 is as legitimate as any other.' },
        ],
      },
    },
    {
      kind: 'mission',
      mission: {
        id: 'c2m3',
        objective: 'Precision beacon drop at MARKER-9. Fine slider control is OFFLINE — type the exact coefficients into the nav computer.',
        thrusters: [
          { id: 't1', label: 'T1', v: v2(2, 1), color: '#53d3d1' },
          { id: 't2', label: 'T2', v: v2(-1, 1), color: '#e6b450' },
        ],
        target: { id: 'marker9', label: 'MARKER-9', at: v2(-3, 0), kind: 'wreck' },
        maxBurn: 4,
        inputMode: 'numeric',
        overlay: 'available',
        hints: [
          'No sliders today. Solve it: c₁(2,1) + c₂(−1,1) = (−3,0).',
          'Second row first: c₁ + c₂ = 0. So c₂ = −c₁. Substitute into the first row.',
          'From row one: 2c₁ − c₂ = −3, and c₂ = −c₁, so 3c₁ = −3.',
        ],
        debrief: [
          { speaker: 'ORTHO', text: 'Beacon away. What you just did — finding the coefficients that build a given target — is the system Ax = b wearing a flight suit. The columns of A are your thrusters. Solving it is choosing burns.' },
        ],
      },
    },
    {
      kind: 'log',
      questions: [
        {
          q: "CAPTAIN'S LOG — day 3. Yesterday POD-7 was unreachable; today we docked with it. What changed?",
          options: [
            {
              text: 'We had two thrusters, and two is always enough.',
              response: 'Hold that belief loosely, Captain. Tomorrow intends to test it. The count was not what mattered.',
            },
            {
              text: 'T2 pointed off T1\'s line — a genuinely new direction, so combinations cover the whole plane.',
              correct: true,
              response: 'Logged. New reach comes from new directions, not from more hardware. File that where you keep the important things.',
            },
            {
              text: 'T2 was a more powerful thruster.',
              response: 'T2 is the weaker pod, mechanically. Power scales a burn; it cannot leave the line the direction defines.',
            },
          ],
        },
        {
          q: 'Anchorage control, pedantic as ever, asks: is the SPAN the same thing as one combined burn?',
          options: [
            {
              text: 'Yes — the span is the displacement our chosen burn produced.',
              response: 'That is one linear combination: one point. The projection glowed across the entire plane. The span is the set of ALL of them.',
            },
            {
              text: 'No — one burn is a single linear combination; the span is the set of every result any burn could produce.',
              correct: true,
              response: 'Logged. One burn: a point. Span: every point any burn reaches. Confusing the two is how ships file inaccurate flight plans.',
            },
            {
              text: 'They are unrelated concepts.',
              response: 'Closely related, in fact: the span is built out of all the linear combinations. One is the menu; the other is a single order.',
            },
          ],
        },
      ],
    },
  ],
}
