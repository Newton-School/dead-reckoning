import type { Chapter } from '../levels/types'
import { v3 } from '../engine/vec'

export const finale: Chapter = {
  id: 'finale',
  number: 'FINALE',
  name: 'The Third Axis',
  beats: [
    {
      kind: 'title',
      heading: 'Finale — The Third Axis',
      sub: 'DAY 14 · DEPARTING ANCHORAGE-9 · KESTREL JUMP GATE',
    },
    {
      kind: 'dialogue',
      lines: [
        { speaker: 'CHEN', text: 'Repairs done, contract signed. One job left: the Kestrel jump gate, and home. Nav, take us out.' },
        { speaker: 'ORTHO', text: 'A warning before you plot, Nav. Until today I have drawn your world flat — the ecliptic plane, because that is all your thrusters could speak. The gate does not live on the ecliptic. I am switching the projection to three axes. Do not panic; the rules you know are all still true.' },
        { speaker: 'DASHA', text: 'T1 and T2 are mounted and live. Same welds as always — both fire IN the ecliptic plane. Do your best.' },
      ],
    },
    {
      kind: 'mission3',
      mission: {
        id: 'f1',
        objective: 'Reach the KESTREL jump gate. T1 and T2 online. If the gate cannot be reached, report the confirmed negative.',
        thrusters: [
          { id: 't1', label: 'T1', v: v3(2, 1, 0), color: '#53d3d1' },
          { id: 't2', label: 'T2', v: v3(-1, 1, 0), color: '#e6b450' },
        ],
        target: { id: 'kestrel', label: 'KESTREL GATE', at: v3(2, 3, 2.5) },
        expectUnreachable: true,
        maxBurn: 4,
        hints: [
          'Drag to orbit the view. Look at where the gate sits relative to the glowing sheet.',
          'The projection is no longer the whole picture and no longer pretends to be. Two independent thrusters span... what, exactly, inside three-dimensional space?',
          'Every T1/T2 combination has altitude zero. The gate hangs 2.5 units above the sheet. You know what to do with a confirmed negative.',
        ],
        debrief: [
          { speaker: 'ORTHO', text: 'Confirmed negative, logged with some ceremony. Nav — look at the projection one more time. Two independent arrows, and their span is a PLANE floating inside space. Your entire career so far happened on that sheet. It was never "everything." It was everything two directions could say.' },
        ],
      },
    },
    {
      kind: 'dialogue',
      lines: [
        { speaker: 'CHEN', text: 'So we\'re fenced again. A line in a plane, day one. A plane in space, today. I\'m sensing a pattern, ORTHO.' },
        { speaker: 'ORTHO', text: 'The pattern IS the lesson, Captain: a span can be a perfectly good world and still be a prison, and the only key ever minted is a direction the current kit cannot speak.' },
        { speaker: 'DASHA', text: 'Then it\'s a good day to own a plasma torch. The station yard sold me a dorsal pod — designation T4. Mounted and live. It fires UP and forward: off your precious ecliptic.' },
        { speaker: 'ORTHO', text: 'T4 = (1, 0, 2). Not perpendicular to anything, before you ask — it doesn\'t need to be. It needs exactly one property: it points OUTSIDE the T1–T2 plane. Independence, third verse. Take us to the gate, Nav.' },
      ],
    },
    {
      kind: 'mission3',
      mission: {
        id: 'f2',
        objective: 'Reach the KESTREL jump gate with T1, T2, and the new dorsal thruster T4.',
        thrusters: [
          { id: 't1', label: 'T1', v: v3(2, 1, 0), color: '#53d3d1' },
          { id: 't2', label: 'T2', v: v3(-1, 1, 0), color: '#e6b450' },
          { id: 't4', label: 'T4', v: v3(1, 0, 2), color: '#7fd962' },
        ],
        target: { id: 'kestrel', label: 'KESTREL GATE', at: v3(2, 3, 2.5) },
        maxBurn: 4,
        hints: [
          'Only T4 can change your altitude. Its z-component is 2 per unit burn; the gate is at altitude 2.5.',
          'Set T4 first: 2·c₄ = 2.5. Then the leftover in-plane target is (2−c₄·1, 3−c₄·0) for T1 and T2.',
          'c₄ = 1.25 leaves (0.75, 3) for the old pair: c₁ + c₂... you have solved this system all week. Row two: c₁ + c₂ = 3.',
        ],
        debrief: [
          { speaker: 'SYSTEM', text: 'KESTREL GATE — TRANSIT ACCEPTED. DESTINATION: HOME.' },
          { speaker: 'CHEN', text: 'All hands — stand down. We\'re through. Good flying, Nav.' },
        ],
      },
    },
    {
      kind: 'dialogue',
      lines: [
        { speaker: 'ORTHO', text: 'Before the jump scrambles my short-term memory, Nav, a parting entry for your log. Notice what today did NOT change: reach is still the span; a new arrow still only matters if it leaves the old span; a minimal full-reach kit is still a basis — three arrows now, because space is three-dimensional. The rules never changed. Only the space got bigger.' },
        { speaker: 'ORTHO', text: 'And someday — I say this to every navigator I keep alive — someone will hand you a space whose "arrows" are polynomials. Or audio signals. Or images. Do not flinch. Ask the same three questions: What can I reach? What is redundant? What is the minimal kit? That is all span, dependence, and basis ever were.' },
        { speaker: 'DASHA', text: 'One more thing for the log, from engineering: the station\'s dock spoke a different grid than our thrusters, and both were telling the truth. Someday somebody will show you the same ship described in two bases and call it "change of basis". You\'ve already lived it.' },
        { speaker: 'CHEN', text: 'End of contract. Log it, Nav. Then get some sleep — you\'ve earned the whole line, the whole plane, and the whole sky.' },
      ],
    },
    {
      kind: 'log',
      questions: [
        {
          q: "CAPTAIN'S LOG — final entry. In 3D, T1 and T2 spanned only a plane. At what moment did our reach become ALL of space?",
          options: [
            {
              text: 'When we owned three thrusters.',
              response: 'Count is never the criterion — Chapter 3 taught us that with two arrows on one line. Three coplanar arrows would still glow a flat sheet.',
            },
            {
              text: 'When T4\'s arrow pointed OUTSIDE the plane the old kit spanned.',
              correct: true,
              response: 'Logged. Same rule since day one, one dimension louder: reach grows exactly when the new direction escapes the old span.',
            },
            {
              text: 'When the burns got large enough to climb.',
              response: 'Scale any in-plane burn forever and your altitude remains exactly zero. Magnitude cannot buy what direction hasn\'t paid for.',
            },
          ],
        },
        {
          q: 'ORTHO\'s parting claim: someday the "arrows" will be polynomials or signals. What survives that costume change?',
          options: [
            {
              text: 'Nothing — this was about spaceships.',
              response: 'The Meridian was the costume too, Nav. The questions were the cargo.',
            },
            {
              text: 'The questions: what is reachable (span), what is redundant (dependence), what is the minimal kit (basis) — and the dimension the space forces on every answer.',
              correct: true,
              response: 'Logged, final entry. Fly anything — arrows, polynomials, signals. The three questions hold. ORTHO, signing off.',
            },
            {
              text: 'Only the specific numbers, like T1 = (2, 1).',
              response: 'The numbers were the least of it — we changed them every chapter and the ideas never blinked.',
            },
          ],
        },
      ],
    },
    { kind: 'credits' },
  ],
}
