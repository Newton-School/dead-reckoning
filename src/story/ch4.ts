import type { Chapter } from '../levels/types'
import { v2 } from '../engine/vec'

export const ch4: Chapter = {
  id: 'ch4',
  number: 'CHAPTER 4',
  name: 'Weight of the Redundant',
  beats: [
    {
      kind: 'title',
      heading: 'Chapter 4 — Weight of the Redundant',
      sub: 'DAY 8 · POWER RESERVES 37% · TRANSFER BURN PREP',
    },
    {
      kind: 'dialogue',
      lines: [
        { speaker: 'CHEN', text: 'Decision time. Anchorage-9 station is our only shot at repairs, and the transfer window opens in six hours. Dasha?' },
        { speaker: 'DASHA', text: 'Here\'s the arithmetic nobody likes. Each thruster pod masses 700 kilos. With remaining fuel, the transfer tug harness can push 1,500 kilos of pod mass. Total. We are carrying 2,100.' },
        { speaker: 'CHEN', text: 'So we cut one loose. Permanently. Nav — you choose which.' },
        { speaker: 'ORTHO', text: 'Choose carefully. Whatever kit you keep must still reach ANY point — Anchorage\'s alignment marker today, unknown targets tomorrow. Keep your whole sky, lose a third of your mass. I\'ll run the projection on whatever you tether.' },
        { speaker: 'DASHA', text: 'Pods stay tethered until you commit the burn — so you can change your mind at the airlock. After that, they\'re gone.' },
      ],
    },
    {
      kind: 'mission',
      mission: {
        id: 'c4m1',
        objective: 'JETTISON down to ≤ 1,500 kg of pods, keeping full-plane reach. Then burn to alignment marker TW-ALIGN to prove the kit still flies.',
        thrusters: [
          { id: 't1', label: 'T1', v: v2(2, 1), color: '#53d3d1', mass: 700 },
          { id: 't2', label: 'T2', v: v2(-1, 1), color: '#e6b450', mass: 700 },
          { id: 't3', label: 'T3', v: v2(-4, -2), color: '#f07178', mass: 700 },
        ],
        target: { id: 'twalign', label: 'TW-ALIGN', at: v2(2, 3), kind: 'dock' },
        jettison: { massBudget: 1500 },
        maxBurn: 4,
        overlay: 'available',
        hints: [
          'Jettison a pod, then check the NAV PROJECTION before you commit. The glow tells you what your kit can still do.',
          'Kept {T1, T3}? Look at the projection: a line. You\'ve met these two before — T3 = −2·T1. Restore and rethink.',
          'Two pods that point off each other\'s lines keep the whole plane. There\'s more than one right answer.',
        ],
        debrief: [
          { speaker: 'DASHA', text: 'Pod away. Mass under budget, marker hit. The harness will hold.' },
          { speaker: 'ORTHO', text: 'Interesting choice, by the way. Not the only correct one — and that fact deserves its own conversation.' },
        ],
      },
    },
    {
      kind: 'dialogue',
      lines: [
        { speaker: 'CHEN', text: 'ORTHO, put it in the log properly. What exactly did we just keep?' },
        { speaker: 'ORTHO', text: 'A minimal kit that still spans everything, Captain. Two properties, both required: it SPANS the plane — no point out of reach — and it carries no redundancy — drop either pod and the sky collapses to a line. The textbooks call such a kit a BASIS.' },
        { speaker: 'ORTHO', text: 'Note what a basis is NOT: it is not "the important thrusters" or "the big ones." {T1, T3} contains our largest pod and it is junk as a kit — two arrows, one line. And {T1, T2} versus {T2, T3}: both are perfectly good bases. A basis is a choice you make, not a treasure you find.' },
        { speaker: 'DASHA', text: 'Minimal kit, full reach. If engineering had a flag, that would be on it.' },
      ],
    },
    {
      kind: 'log',
      questions: [
        {
          q: "CAPTAIN'S LOG — day 8. We kept two pods and can still reach the entire plane. What made a keep-set valid?",
          options: [
            {
              text: 'Keeping the two biggest, most powerful thrusters.',
              response: 'Size never mattered. {T1, T3} contains our longest arrow, and that kit strands us on a line. Validity is about directions, not muscle.',
            },
            {
              text: 'Keeping any two that point off each other\'s lines — independent, and together spanning the plane.',
              correct: true,
              response: 'Logged. Span plus independence: reach everything, waste nothing. That pair of conditions is the whole idea.',
            },
            {
              text: 'Keeping specifically T1 and T2 — the original pair.',
              response: '{T2, T3} flies exactly as well; we checked. A basis is a choice, not an anointing. Several kits qualify.',
            },
          ],
        },
        {
          q: 'Why did the minimal full-reach kit have exactly TWO pods — not one, not three?',
          options: [
            {
              text: 'Because the harness had two mounting slots.',
              response: 'The harness constraint set the budget; geometry set the number. One pod spans a line. Three always carries a passenger.',
            },
            {
              text: 'One thruster can only span a line; three in a plane always include a redundant one. Two independent directions is exactly the size of the plane.',
              correct: true,
              response: 'Logged. That number — the size of every minimal spanning kit — is the DIMENSION of the space. The plane is two-dimensional; hence, exactly two.',
            },
            {
              text: 'Coincidence. Another day it might be four.',
              response: 'Run it forever, Nav: in this plane, every valid minimal kit will have exactly two. That stubborn "two" is a property of the space itself, not of our luck.',
            },
          ],
        },
      ],
    },
  ],
}
