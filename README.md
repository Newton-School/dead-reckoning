# DEAD RECKONING

*A hard-SF story game that teaches the Span→Basis ladder of linear algebra.*

You are the navigation officer of the salvage tug **ISV Meridian**. A debris strike has
killed the main engine and the nav computer. All that's left: RCS thruster pods welded
at fixed angles, manual burn control, and ORTHO — the ship's dry-humored backup
navigation AI.

Every thruster is a **vector**. Every burn coefficient is a **scalar**. Every plotted
course is a **linear combination**. Everywhere you can possibly reach is the **span** —
and when the fuel crisis comes, choosing which thrusters to keep teaches you what a
**basis** really is.

**Play it:** https://newton-school.github.io/dead-reckoning/

## Who it's for

1st–3rd-year college students taking linear algebra (built for Newton School of
Technology's M3 course). ~30–45 minutes, browser-only, no install.

## Pedagogy (why the game is shaped this way)

Built from the findings of the *M3 Student Learning X-Ray* diagnostic:

- **Motivation before formalism** — ORTHO names each concept (*span*, *dependence*,
  *basis*) only *after* the player has felt the phenomenon. You fail to reach an escape
  pod before you ever hear the word "span."
- **Symbol ↔ picture, always linked** — the nav computer shows the live equation
  `c₁·T1 + c₂·T2 = (x, y)` beside the play field; sliders are the geometry lens,
  numeric entry is the algebra lens (Chapter 2's precision mission is `Ax = b`
  in a flight suit).
- **Misconception-targeted failure** — each chapter is engineered so a documented
  misconception fails visibly: "scaling gives new directions" (Ch1), "span = one
  combination" (Ch2), "more vectors = more reach" (Ch3), "basis = the important
  vectors" (Ch4), "[2,3] *is* the vector" (Ch5).
- **Low stakes** — infinite retries, no timers, no scores. Reporting a target as
  *unreachable* is itself a win condition when it's true: correct diagnosis is gameplay.

## Chapters

| # | Title | Concept |
|---|---|---|
| 0 | Prologue — Debris Strike | vector = displacement, scaling |
| 1 | One Line Home | scalar multiplication, span of one vector |
| 2 | Two Arrows, Whole Sky | linear combination, span, Ax = b |
| 3 | The Drift Trap | linear dependence |
| 4 | Weight of the Redundant | independence, basis, non-uniqueness |
| 5 | Speaking in Thrust | coordinates w.r.t. a basis, dimension |
| ∞ | The Third Axis (3D) | generalization to R³ |

## Development

```bash
npm install
npm run dev      # local dev server
npm test         # vitest on the math core (src/engine)
npm run build    # production build
```

Stack: Vite + React + TypeScript, HTML5 Canvas (2D chapters), Three.js (finale),
zustand. All levels/dialogue are typed data in `src/story/` and `src/levels/`.
Deployed to GitHub Pages on every push to `main`.

## Contributing

Changes land via pull request. Level design changes should preserve the designed
failure states (see `src/engine/vec.test.ts` — the tests encode them).
