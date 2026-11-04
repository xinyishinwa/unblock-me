# Amulung: Pot of Gold

*Clear the logs. Find your fortune!*

A browser-based sliding block puzzle (Unblock Me style) set in the countryside of Amulung, Cagayan. Slide the wooden logs out of the way and roll the golden Pot of Gold off the right side of the 6×6 board.

Built with Next.js (App Router), TypeScript, React, Tailwind CSS and Lucide icons. No backend; progress is saved in `localStorage`.

## Run

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run validate-levels   # BFS-verify every level is solvable and minMoves is optimal
npm test                  # engine tests: mechanics, undo/reset, move limit, hints, storage migration
```

## Controls

- Mouse / touch: drag a log along its length.
- Keyboard: click or Tab to select a log, then use the arrow keys.
- Undo, Reset, Hint, and Pause/Back buttons on the game screen.

## Structure

| Path | Purpose |
| --- | --- |
| `data/levels.ts` | The five level configurations (id, name, difficulty, pot position, logs, `minMoves`) |
| `lib/game/puzzle-engine.ts` | Pure movement/collision rules |
| `lib/game/puzzle-solver.ts` | Original BFS solver (Levels 1–5 reference) |
| `lib/game/special-types.ts` | `PuzzleState`, `SpecialConfig` and other Golden Trails types |
| `lib/game/puzzle-state.ts` | State-based engine: bridge, key + gate, fire + frozen logs, stones, magical logs, move limit |
| `lib/game/state-solver.ts` | BFS over complete puzzle states; used for hints and validation |
| `lib/game/game-session.ts` | Pure session transitions (move / undo / reset / hint / reject) |
| `lib/game/stars.ts` | Star thresholds and unused-move bonus |
| `data/golden-trails.ts`, `data/chapters.ts` | Levels 6–10 and chapter grouping |
| `lib/game/puzzle-validator.ts` | Level layout + solvability validation |
| `lib/game/game-storage.ts` | localStorage progress (backward compatible; adds stars, bonus, chapters) |
| `lib/game/use-game.ts`, `use-progress.ts` | React hooks (game session, progress) |
| `components/game/` | Board, logs, pot, controls, level card, win screen, menu |
| `components/scenery/` | SVG countryside backdrop |
| `app/` | `/` menu, `/levels`, `/game?level=N` |

## Levels

| # | Name | Difficulty | Optimal moves |
| --- | --- | --- | --- |
| 1 | The Village Trail | Easy | 5 |
| 2 | The Rice Field | Easy | 6 |
| 3 | The River Crossing | Medium | 11 |
| 4 | The Mountain Path | Medium | 15 |
| 5 | The Treasure Route | Hard | 24 |

A "move" is one slide of one log by any distance. Optimal counts come from BFS (`npm run validate-levels`).

### Golden Trails (levels 6–10)

| # | Name | Mechanic | Optimal moves | Stars (3 / 2) |
| --- | --- | --- | --- | --- |
| 6 | The River Crossing | Bridge switch | 9 | ≤10 / ≤13 |
| 7 | The Golden Key | Key and locked gate | 10 | ≤11 / ≤14 |
| 8 | The Golden Curse | 14-move limit, stones, magical log | 11 | ≤12 / ≤13 |
| 9 | The Frozen Forest | Frozen logs and fire switch | 11 | ≤12 / ≤15 |
| 10 | The Final Treasure | Bridge + key + fire + stones (6x6) | 14 | ≤15 / ≤19 |

Each level also fails validation if any configured mechanic does not shorten the optimal solution when removed (the mechanic must matter). Bonus: finishing Level 8 with unused moves awards 25 gold per move.
